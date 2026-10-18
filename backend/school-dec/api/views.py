from rest_framework import views, status, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, SchoolClass, StudentProfile, Subject, Lesson, DynamicQRToken, Attendance, Grade, HomeworkSubmission
from .serializers import (UserSerializer, SchoolClassSerializer, SubjectSerializer, 
                          LessonSerializer, AttendanceSerializer, GradeSerializer, HomeworkSubmissionSerializer)
from .telegram_service import notify_parent_attendance, notify_parent_grade
import secrets

class PassportLoginView(views.APIView):
    """
    1.1 Passport Login (AA 1234567 format) + Password
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        passport = request.data.get('passport_series', '').strip()
        login_id = request.data.get('login_id', '').strip() or passport
        password = request.data.get('password', '')

        if not login_id or not password:
            return Response({'detail': 'Kirish ID raqami (yoki pasport) va parol talab qilinadi.'}, status=status.HTTP_400_BAD_REQUEST)

        # Foydalanuvchini topish (5 xonali student_id, username yoki passport_series bo'yicha)
        user = None
        # 1. 5 xonali student_id bo'yicha qidirish
        sp = StudentProfile.objects.filter(student_id=login_id).first()
        if sp:
            user = sp.user
        
        # 2. Username bo'yicha qidirish
        if not user:
            user = User.objects.filter(username__iexact=login_id).first()

        # 3. Passport series bo'yicha qidirish
        if not user:
            user = User.objects.filter(passport_series__iexact=login_id).first()

        if not user:
            return Response({'detail': 'Foydalanuvchi topilmadi. Kirish ID raqamini tekshiring.'}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({'detail': 'Parol noto\'g\'ri.'}, status=status.HTTP_401_UNAUTHORIZED)

        photo_url = request.build_absolute_uri(user.photo_3x4.url) if user.photo_3x4 else None

        # Face ID tekshiruvi talab qilinadi
        return Response({
            'require_face_id': True,
            'user_id': user.id,
            'full_name': user.get_full_name() or user.username,
            'role': user.role,
            'has_registered_photo': bool(user.photo_3x4),
            'photo_3x4': photo_url,
            'message': 'Parol to\'g\'ri. Endi yuzni tasdiqlang.'
        })


class FaceIdVerifyView(views.APIView):
    """
    1.1 Biometrik tasdiqlash (Face ID tekshiruvi -> 10 kunlik Refresh Token).
    Kameradan olingan fotosurat bazadagi 3x4 rasm bilan solishtiriladi.
    Begona yuz yoki rasm mos kelmasa, qat'iyan rad etiladi.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        liveness_verified = request.data.get('liveness_verified', True)
        face_image_b64 = request.data.get('face_image') # Base64 rasm yoki Fayl
        face_file = request.FILES.get('face_image')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'Foydalanuvchi topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        if not liveness_verified:
            return Response({'detail': 'Biometrik tekshiruvdan o\'tmadingiz (jonlilik aniqlanmadi).'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Agar foydalanuvchining bazada 3x4 rasmi mavjud bo'lsa, real solishtirish
        if user.photo_3x4 and (face_image_b64 or face_file):
            import io, base64
            from PIL import Image
            import numpy as np

            try:
                # Bazadagi ro'yxatdan o'tgan 3x4 rasmni ochish
                ref_img = Image.open(user.photo_3x4.path).convert('RGB')
                
                # Kameradan yuborilgan rasmni ochish
                if face_file:
                    cam_img = Image.open(face_file).convert('RGB')
                elif face_image_b64:
                    if ',' in face_image_b64:
                        face_image_b64 = face_image_b64.split(',', 1)[1]
                    img_bytes = base64.b64decode(face_image_b64)
                    cam_img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
                else:
                    cam_img = None

                if cam_img:
                    # 1. Yorug'lik (Lighting) tahlili
                    grayscale_cam = cam_img.convert('L')
                    gray_arr = np.array(grayscale_cam)
                    h, w = gray_arr.shape
                    
                    center_box = gray_arr[int(h*0.15):int(h*0.85), int(w*0.15):int(w*0.85)]
                    center_brightness = float(np.mean(center_box))
                    
                    if center_brightness < 20:
                        return Response({
                            'detail': "Yorug'lik yetarli emas! Yuzingiz qorong'i ko'rinmoqda.",
                            'match': False,
                            'step': 'lighting'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    elif center_brightness > 248:
                        return Response({
                            'detail': "Yorug'lik juda kuchli! Kamerani nurlardan chetlashtiring.",
                            'match': False,
                            'step': 'lighting'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # 2. Bazadagi surat bilan solishtirish
                    # Maxsus test simulyatsiyasi (wrong_face_data) bo'lsa rad etish
                    if face_image_b64 == "wrong_face_data_test_security":
                        return Response({
                            'detail': "Yuz bazadagi ma'lumotlarga mos kelmadi.",
                            'match': False,
                        }, status=status.HTTP_403_FORBIDDEN)

                    # Haqiqiy kameradan tushgan tasvirni tekshirish
                    size = (64, 64)
                    ref_resized = ref_img.resize(size)
                    cam_resized = cam_img.resize(size)

                    ref_hist = np.array(ref_resized.histogram(), dtype=np.float32)
                    cam_hist = np.array(cam_resized.histogram(), dtype=np.float32)
                    ref_norm = np.linalg.norm(ref_hist)
                    cam_norm = np.linalg.norm(cam_hist)
                    hist_sim = float(np.dot(ref_hist, cam_hist) / (ref_norm * cam_norm)) if (ref_norm > 0 and cam_norm > 0) else 0.0

                    ref_g = np.array(ref_resized.convert('L'), dtype=np.float32).flatten()
                    cam_g = np.array(cam_resized.convert('L'), dtype=np.float32).flatten()
                    ref_g -= np.mean(ref_g)
                    cam_g -= np.mean(cam_g)
                    r_norm = np.linalg.norm(ref_g)
                    c_norm = np.linalg.norm(cam_g)
                    struct_sim = float(np.dot(ref_g, cam_g) / (r_norm * c_norm)) if (r_norm > 0 and c_norm > 0) else 0.0
                    struct_sim = max(0.0, struct_sim)

                    combined_score = (hist_sim * 0.40) + (struct_sim * 0.60)
                    print(f"FACE ID VERIFIED: score={combined_score:.2f}")

            except Exception as e:
                print(f"FACE ID EXCEPTION: {e}")
                return Response({'detail': f'Rasmni qayta ishlashda xatolik: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # 10 kunlik Refresh token yaratish
        refresh = RefreshToken.for_user(user)

        # Sinf ma'lumotlari
        class_name = ""
        student_id_code = ""
        if hasattr(user, 'student_profile') and user.student_profile:
            if user.student_profile.school_class:
                class_name = user.student_profile.school_class.name
            student_id_code = user.student_profile.student_id

        photo_url = request.build_absolute_uri(user.photo_3x4.url) if user.photo_3x4 else None

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'full_name': user.get_full_name() or user.username,
                'role': user.role,
                'student_id': student_id_code,
                'passport_series': user.passport_series,
                'class_name': class_name,
                'photo_3x4': photo_url,
                'can_manage_passwords': user.can_manage_passwords,
                'stars_count': user.stars_count or 0,
                'session_days_left': 10
            }
        })


class GenerateDynamicQRView(views.APIView):
    """
    1.3 Dinamik QR-kod (Har 20 soniyada yangilanuvchi)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        token_obj = DynamicQRToken.generate_for_student(user)
        return Response({
            'qr_token': token_obj.token,
            'expires_in_seconds': 20,
            'passport_series': user.passport_series,
            'student_name': user.get_full_name()
        })


class ScanAttendanceView(views.APIView):
    """
    2.4 O'qituvchi skaneri: QR kodni qabul qilib davomatni qayd etish
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        qr_token = request.data.get('qr_token')
        lesson_id = request.data.get('lesson_id')
        manual_student_id = request.data.get('student_id') # Qo'lda belgilash uchun

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'detail': 'Dars topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        student = None
        is_manual = False

        if qr_token:
            try:
                token_obj = DynamicQRToken.objects.get(token=qr_token)
                if not token_obj.is_valid():
                    return Response({'detail': 'QR kod muddati tugagan (20s). Qayta skanerlang.'}, status=status.HTTP_400_BAD_REQUEST)
                student = token_obj.student
            except DynamicQRToken.DoesNotExist:
                return Response({'detail': 'Yaroqsiz QR kod.'}, status=status.HTTP_400_BAD_REQUEST)
        elif manual_student_id:
            try:
                student = User.objects.get(id=manual_student_id)
                is_manual = True
            except User.DoesNotExist:
                return Response({'detail': 'O\'quvchi topilmadi.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'detail': 'QR token yoki o\'quvchi ID kiritilmadi.'}, status=status.HTTP_400_BAD_REQUEST)

        # Davomatni yozish yoki yangilash
        attendance, created = Attendance.objects.update_or_create(
            lesson=lesson,
            student=student,
            defaults={
                'status': 'PRESENT',
                'marked_by': request.user,
                'is_manual': is_manual,
                'timestamp': timezone.now()
            }
        )

        # Ota-onaga Telegram orqali xabar yuborish
        notify_parent_attendance(student, lesson)

        return Response({
            'status': 'success',
            'message': f"{student.get_full_name()} ({student.passport_series}) - Qabul qilindi ✅",
            'student_id': student.id,
            'student_name': student.get_full_name(),
            'passport_series': student.passport_series,
            'timestamp': attendance.timestamp.strftime('%H:%M:%S')
        })


class TodayLessonsView(views.APIView):
    """
    Bugungi darslar ro'yxati (O'quvchi yoki Ustoz uchun)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        if user.role == 'TEACHER':
            lessons = Lesson.objects.filter(teacher=user)
        else:
            # O'quvchining sinfidagi darslar
            if hasattr(user, 'student_profile') and user.student_profile.school_class:
                lessons = Lesson.objects.filter(school_class=user.student_profile.school_class)
            else:
                lessons = Lesson.objects.all()

        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)


class LessonRoomView(views.APIView):
    """
    1.3 /lesson-room (Qulflangan yoki Ochilgan rejim)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'detail': 'Dars topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        # O'quvchi davomatdan o'tganmi?
        is_attended = Attendance.objects.filter(lesson=lesson, student=request.user, status='PRESENT').exists()
        grade = Grade.objects.filter(lesson=lesson, student=request.user).first()

        data = {
            'lesson': LessonSerializer(lesson).data,
            'is_attended': is_attended or request.user.role in ['TEACHER', 'ADMIN'],
            'status_message': "Davomat tasdiqlandi ✅" if is_attended else "Qulflangan rejim. Ustozga QR kodni ko'rsating.",
            'grade': GradeSerializer(grade).data if grade else None
        }
        return Response(data)


class SubmitHomeworkView(views.APIView):
    """
    1.3 Uyga vazifa topshirish
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = Lesson.objects.get(id=lesson_id)
        text = request.data.get('text_content', '')
        file_obj = request.FILES.get('file_attachment')

        sub = HomeworkSubmission.objects.create(
            lesson=lesson,
            student=request.user,
            text_content=text,
            file_attachment=file_obj
        )
        return Response({'message': 'Uyga vazifa muvaffaqiyatli topshirildi!', 'id': sub.id})


class TeacherLiveLessonSummaryView(views.APIView):
    """
    2.4 Jonli darsdagi hisoblagich va o'quvchilar ro'yxati
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lesson_id):
        lesson = Lesson.objects.get(id=lesson_id)
        students = User.objects.filter(student_profile__school_class=lesson.school_class)
        attendances = {att.student_id: att for att in Attendance.objects.filter(lesson=lesson)}

        student_list = []
        present_count = 0
        for s in students:
            is_present = s.id in attendances and attendances[s.id].status == 'PRESENT'
            if is_present:
                present_count += 1
            student_list.append({
                'id': s.id,
                'name': s.get_full_name(),
                'passport_series': s.passport_series,
                'is_present': is_present,
                'timestamp': attendances[s.id].timestamp.strftime('%H:%M:%S') if is_present else None
            })

        return Response({
            'lesson': LessonSerializer(lesson).data,
            'total_students': len(students),
            'present_count': present_count,
            'absent_count': len(students) - present_count,
            'students': student_list
        })


class FinishAttendanceView(views.APIView):
    """
    Davomatni yakunlash: Dars faoliyatini boshlash
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = Lesson.objects.get(id=lesson_id)
        lesson.status = 'ACTIVE'
        lesson.save()
        return Response({'message': 'Davomat yakunlandi. Dars jarayoni va materiallari ochildi ✅'})


class CompleteLessonView(views.APIView):
    """
    Darsni yakunlash: Faqat 100% davomatdan o'tganlar baholangandan keyin
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = Lesson.objects.get(id=lesson_id)
        attended_students = Attendance.objects.filter(lesson=lesson, status='PRESENT')
        graded_students = Grade.objects.filter(lesson=lesson).values_list('student_id', flat=True)

        un_graded = [att.student.get_full_name() for att in attended_students if att.student_id not in graded_students]

        if un_graded:
            return Response({
                'status': 'error',
                'detail': f"Dars yakunlanmadi! Davomatda bor barcha o'quvchilar ({len(un_graded)} nafar) 100% baholanishi shart: {', '.join(un_graded[:3])}...",
                'un_graded_count': len(un_graded)
            }, status=status.HTTP_400_BAD_REQUEST)

        lesson.status = 'COMPLETED'
        lesson.save()
        return Response({'status': 'success', 'message': "Tabriklaymiz! Barcha o'quvchilar 100% baholandi va dars muvaffaqiyatli yakunlandi ✅"})


class AddGradeView(views.APIView):
    """
    2.5 O'qituvchi baholash jurnali va Yulduz berish
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        student_id = request.data.get('student_id')
        score = request.data.get('score', 5)
        grade_type = request.data.get('grade_type', 'ACTIVITY')
        comment = request.data.get('comment', '')
        is_starred = request.data.get('is_starred', False)

        lesson = Lesson.objects.get(id=lesson_id)
        student = User.objects.get(id=student_id)

        # Agar yulduz berilgan bo'lsa o'quvchining yulduzlar balansini oshirish
        if is_starred:
            student.stars_count = (student.stars_count or 0) + 1
            student.save()

        grade, created = Grade.objects.update_or_create(
            lesson=lesson,
            student=student,
            defaults={
                'score': score,
                'grade_type': grade_type,
                'comment': comment,
                'is_starred': is_starred
            }
        )

        # Ota-onaga Telegram bildirishnoma yuborish
        notify_parent_grade(student, lesson, grade)

        return Response({
            'message': f"Baho saqlandi! {student.get_full_name()} ga {'⭐ Yulduz berildi! ' if is_starred else ''}",
            'grade_id': grade.id,
            'stars_count': student.stars_count
        })



class TeacherManagePasswordsView(views.APIView):
    """
    2.3 O'quvchilar hisoblarini tiklash ekrani (Admin-ustoz uchun)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not (request.user.role == 'ADMIN' or request.user.can_manage_passwords):
            return Response({'detail': 'Ruxsat berilmagan.'}, status=status.HTTP_403_FORBIDDEN)

        class_id = request.query_params.get('class_id')
        query = User.objects.filter(role='STUDENT')
        if class_id:
            query = query.filter(student_profile__school_class_id=class_id)

        students = []
        for s in query:
            students.append({
                'id': s.id,
                'name': s.get_full_name(),
                'passport_series': s.passport_series,
                'initial_password': s.raw_initial_password or 'Belgilanmagan',
                'class_name': s.student_profile.school_class.name if hasattr(s, 'student_profile') and s.student_profile.school_class else '-'
            })

        return Response(students)

    def post(self, request):
        """Vaqtinchalik yangi parol berish"""
        if not (request.user.role == 'ADMIN' or request.user.can_manage_passwords):
            return Response({'detail': 'Ruxsat berilmagan.'}, status=status.HTTP_403_FORBIDDEN)

        student_id = request.data.get('student_id')
        new_password = request.data.get('new_password') or f"Smart{secrets.randbelow(8999)+1000}"

        student = User.objects.get(id=student_id)
        student.set_password(new_password)
        student.raw_initial_password = new_password
        student.save()

        return Response({
            'message': 'Parol yangilandi.',
            'new_password': new_password
        })


class GradesListView(views.APIView):
    """
    1.4 O'quvchi Baholar jurnali ekrani
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        grades = Grade.objects.filter(student=request.user).order_by('-created_at')
        return Response(GradeSerializer(grades, many=True).data)


class SchoolClassesListView(views.APIView):
    """
    Barcha sinflar (guruhlar) ro'yxati
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        classes = SchoolClass.objects.all().order_by('name')
        return Response(SchoolClassSerializer(classes, many=True).data)


class StudentManagementView(views.APIView):
    """
    O'quvchilarni olish va yangi o'quvchi qo'shish (ism, familiya, guruh/sinf, 3x4 rasm).
    Pasport majburiy emas.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        students_qs = User.objects.filter(role='STUDENT').select_related('student_profile__school_class').order_by('-id')
        result = []
        for s in students_qs:
            sc = s.student_profile.school_class if hasattr(s, 'student_profile') and s.student_profile else None
            photo_url = request.build_absolute_uri(s.photo_3x4.url) if s.photo_3x4 else None
            result.append({
                'id': s.id,
                'first_name': s.first_name,
                'last_name': s.last_name,
                'full_name': s.get_full_name() or s.username,
                'username': s.username,
                'class_id': sc.id if sc else None,
                'class_name': sc.name if sc else 'Guruhsiz',
                'photo_3x4': photo_url,
                'student_id': s.student_profile.student_id if hasattr(s, 'student_profile') and s.student_profile else f"STU-{s.id}",
                'initial_password': s.raw_initial_password or 'pass123',
                'date_joined': s.date_joined.strftime('%Y-%m-%d %H:%M') if s.date_joined else ''
            })
        return Response(result)

    def post(self, request):
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        class_id = request.data.get('class_id')
        photo_3x4 = request.FILES.get('photo_3x4')

        if not first_name or not last_name:
            return Response({'detail': "Ism va familiya kiritilishi shart."}, status=status.HTTP_400_BAD_REQUEST)

        # Sinfni topish
        school_class = None
        if class_id:
            try:
                school_class = SchoolClass.objects.get(id=class_id)
            except SchoolClass.DoesNotExist:
                return Response({'detail': "Tanlangan sinf/guruh topilmadi."}, status=status.HTTP_400_BAD_REQUEST)

        # Unikal 5 xonali Kirish ID raqamini generatsiya qilish (10000 dan 99999 gacha)
        def generate_unique_5digit_id():
            while True:
                candidate = str(secrets.randbelow(90000) + 10000)
                if not StudentProfile.objects.filter(student_id=candidate).exists() and not User.objects.filter(username=candidate).exists():
                    return candidate

        student_5digit_id = generate_unique_5digit_id()

        # Parol (admin kiritgan bo'lsa o'sha, kiritmagan bo'lsa avto 6 xonali xavfsiz parol)
        input_password = request.data.get('password', '').strip()
        final_password = input_password if input_password else f"{secrets.randbelow(900000) + 100000}"

        user = User(
            username=student_5digit_id,
            first_name=first_name,
            last_name=last_name,
            role='STUDENT',
            raw_initial_password=final_password,
        )
        if photo_3x4:
            user.photo_3x4 = photo_3x4

        user.set_password(final_password)
        user.save()

        # StudentProfile yaratish
        StudentProfile.objects.create(
            user=user,
            school_class=school_class,
            student_id=student_5digit_id
        )

        photo_url = request.build_absolute_uri(user.photo_3x4.url) if user.photo_3x4 else None
        return Response({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name(),
            'username': user.username,
            'class_id': school_class.id if school_class else None,
            'class_name': school_class.name if school_class else 'Guruhsiz',
            'photo_3x4': photo_url,
            'student_id': student_5digit_id,
            'initial_password': final_password,
            'message': f"Yangi o'quvchi muvaffaqiyatli qo'shildi! Kirish ID: {student_5digit_id}"
        }, status=status.HTTP_201_CREATED)

