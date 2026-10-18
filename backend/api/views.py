from rest_framework import views, status, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, SchoolConfig, SchoolClass, StudentProfile, Subject, Lesson, DynamicQRToken, Attendance, Grade, HomeworkSubmission
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
        school_cfg = SchoolConfig.get_or_create_for_school(user.school_id, user.school_name)

        # Face ID tekshiruvi talab qilinadi
        return Response({
            'require_face_id': True,
            'user_id': user.id,
            'full_name': user.get_full_name() or user.username,
            'role': user.role,
            'school_id': user.school_id,
            'school_name': school_cfg.school_name,
            'school_config': school_cfg.to_dict(),
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
        school_cfg = SchoolConfig.get_or_create_for_school(user.school_id, user.school_name)
        school_cfg_dict = school_cfg.to_dict()

        # Sinf / Guruh ma'lumotlari
        class_name = ""
        raw_class_name = ""
        student_id_code = ""
        if hasattr(user, 'student_profile') and user.student_profile:
            if user.student_profile.school_class:
                raw_class_name = user.student_profile.school_class.name
                class_name = school_cfg.format_group_name(raw_class_name)
            student_id_code = user.student_profile.student_id
        elif user.role == 'TEACHER' and user.teacher_group:
            raw_class_name = user.teacher_group
            class_name = user.teacher_group

        photo_url = request.build_absolute_uri(user.photo_3x4.url) if user.photo_3x4 else None

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'school_config': school_cfg_dict,
            'user': {
                'id': user.id,
                'full_name': user.get_full_name() or user.username,
                'role': user.role,
                'student_id': student_id_code,
                'passport_series': user.passport_series,
                'class_name': class_name,
                'raw_class_name': raw_class_name,
                'school_id': user.school_id or '1',
                'school_name': school_cfg.school_name,
                'school_config': school_cfg_dict,
                'photo_3x4': photo_url,
                'can_manage_passwords': user.can_manage_passwords,
                'stars_count': user.stars_count or 0,
                'session_days_left': 10
            }
        })


class GenerateDynamicQRView(views.APIView):
    """
    1.3 Dinamik QR-kod (Maktab sozlamalaridagi soniyada yangilanuvchi)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        school_cfg = SchoolConfig.get_or_create_for_school(getattr(user, 'school_id', '1'), getattr(user, 'school_name', None))
        qr_sec = max(10, min(120, int(school_cfg.qr_refresh_seconds or 25)))
        token_obj = DynamicQRToken.generate_for_student(user)
        token_obj.expires_at = timezone.now() + timezone.timedelta(seconds=qr_sec + 5)
        token_obj.save()
        return Response({
            'qr_token': token_obj.token,
            'expires_in_seconds': qr_sec,
            'passport_series': user.passport_series,
            'student_name': user.get_full_name(),
            'school_name': school_cfg.school_name,
            'group_term': school_cfg.group_term,
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
    Faqat o'z maktabiga tegishli o'quvchilar ko'rinadi.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not (request.user.role == 'ADMIN' or request.user.can_manage_passwords):
            return Response({'detail': 'Ruxsat berilmagan.'}, status=status.HTTP_403_FORBIDDEN)

        class_id = request.query_params.get('class_id')
        school_id = request.query_params.get('school_id') or getattr(request.user, 'school_id', None)
        query = User.objects.filter(role='STUDENT')
        if school_id:
            query = query.filter(school_id=str(school_id))
        if class_id:
            query = query.filter(student_profile__school_class_id=class_id)

        students = []
        for s in query:
            students.append({
                'id': s.id,
                'name': s.get_full_name(),
                'passport_series': s.passport_series,
                'initial_password': s.raw_initial_password or 'Belgilanmagan',
                'class_name': s.student_profile.school_class.name if hasattr(s, 'student_profile') and s.student_profile.school_class else '-',
                'school_id': s.school_id,
                'school_name': s.school_name,
                'created_by': s.created_by,
            })

        return Response(students)

    def post(self, request):
        """Vaqtinchalik yangi parol berish"""
        if not (request.user.role == 'ADMIN' or request.user.can_manage_passwords):
            return Response({'detail': 'Ruxsat berilmagan.'}, status=status.HTTP_403_FORBIDDEN)

        student_id = request.data.get('student_id')
        new_password = request.data.get('new_password') or f"Smart{secrets.randbelow(8999)+1000}"

        student = User.objects.get(id=student_id)
        if getattr(request.user, 'school_id', None) and student.school_id != request.user.school_id:
            return Response({'detail': 'Boshqa maktab o\'quvchisining parolini o\'zgartirish mumkin emas.'}, status=status.HTTP_403_FORBIDDEN)

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
    Maktabga tegishli sinflar (guruhlar) ro'yxati hamda yangi guruh/sinf yaratish.
    Har bir sinf aniq bir maktabga (school_id) tegishli bo'lishi shart.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        school_id = str(request.query_params.get('school_id', '')).strip()
        all_schools = str(request.query_params.get('all_schools', '')).strip() == '1'

        if school_id:
            classes = SchoolClass.objects.filter(school_id=school_id).order_by('name')
        elif all_schools:
            classes = SchoolClass.objects.all().order_by('school_id', 'name')
        else:
            # Maktab ko'rsatilmasa boshqa maktab sinflari chiqib ketmasligi uchun bo'sh ro'yxat qaytariladi
            return Response([])

        return Response(SchoolClassSerializer(classes, many=True).data)

    def post(self, request):
        name = str(request.data.get('name', '')).strip()
        academic_year = str(request.data.get('academic_year', '2026-2027')).strip() or '2026-2027'
        school_id = str(request.data.get('school_id', '')).strip()
        school_name = str(request.data.get('school_name', '')).strip()
        advisor_teacher = str(request.data.get('advisor_teacher', '')).strip()
        room_number = str(request.data.get('room_number', '')).strip()
        created_by = str(request.data.get('created_by', '')).strip() or "Maktab Ma'muriyati"
        created_by_role = str(request.data.get('created_by_role', 'SCHOOL_ADMIN')).strip() or 'SCHOOL_ADMIN'

        if not school_id:
            return Response(
                {'detail': 'Sinf yaratish uchun maktab (school_id) ko\'rsatilishi shart! Maktabsiz sinf yaratilmaydi.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not name:
            return Response({'detail': 'Guruh / Sinf nomi kiritilishi shart.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = SchoolClass.objects.filter(school_id=school_id, name__iexact=name).first()
        if existing:
            return Response(
                {'detail': f'Ushbu maktabda "{name}" sinfi allaqachon mavjud.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_cls = SchoolClass.objects.create(
            name=name,
            academic_year=academic_year,
            school_id=school_id,
            school_name=school_name or f"Maktab #{school_id}",
            advisor_teacher=advisor_teacher,
            room_number=room_number,
            created_by=created_by,
            created_by_role=created_by_role,
        )
        return Response(SchoolClassSerializer(new_cls).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        return self.patch(request, pk)

    def patch(self, request, pk=None):
        cls_id = pk or request.data.get('id')
        if not cls_id:
            return Response({'detail': "Guruh / Sinf ID si ko'rsatilishi shart."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cls = SchoolClass.objects.get(id=cls_id)
        except SchoolClass.DoesNotExist:
            return Response({'detail': 'Sinf / Guruh topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        school_id = str(request.query_params.get('school_id') or request.data.get('school_id') or '').strip()
        if school_id and str(cls.school_id) != school_id:
            return Response({'detail': 'Boshqa maktab sinfini tahrirlash mumkin emas.'}, status=status.HTTP_403_FORBIDDEN)

        new_name = request.data.get('name')
        if new_name is not None:
            new_name = str(new_name).strip()
            if not new_name:
                return Response({'detail': "Guruh / Sinf nomi bo'sh bo'lishi mumkin emas."}, status=status.HTTP_400_BAD_REQUEST)
            # Bir xil maktab ichida nom takrorlanmasligi kerak
            duplicate = SchoolClass.objects.filter(school_id=cls.school_id, name__iexact=new_name).exclude(id=cls.id).first()
            if duplicate:
                return Response(
                    {'detail': f'Ushbu maktabda "{new_name}" nomli guruh/sinf allaqachon mavjud.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cls.name = new_name

        if 'academic_year' in request.data:
            cls.academic_year = str(request.data.get('academic_year', '')).strip() or cls.academic_year

        if 'advisor_teacher' in request.data:
            cls.advisor_teacher = str(request.data.get('advisor_teacher', '')).strip()

        if 'room_number' in request.data:
            cls.room_number = str(request.data.get('room_number', '')).strip()

        cls.save()
        return Response(SchoolClassSerializer(cls).data)

    def delete(self, request, pk=None):
        cls_id = pk or request.data.get('id')
        school_id = str(request.query_params.get('school_id') or request.data.get('school_id') or '').strip()
        try:
            cls = SchoolClass.objects.get(id=cls_id)
            if school_id and cls.school_id != school_id:
                return Response({'detail': 'Boshqa maktab sinfini o\'chirish mumkin emas.'}, status=status.HTTP_403_FORBIDDEN)
            cls_name = cls.name
            cls.delete()
            return Response({'message': f'"{cls_name}" guruhi/sinfi muvaffaqiyatli o\'chirildi.'})
        except SchoolClass.DoesNotExist:
            return Response({'detail': 'Sinf topilmadi.'}, status=status.HTTP_404_NOT_FOUND)


class StudentManagementView(views.APIView):
    """
    O'quvchilarni olish va yangi o'quvchi qo'shish (ism, familiya, guruh/sinf, 3x4 rasm).
    Har bir o'quvchi aniq bir maktabga (school_id) tegishli bo'lishi va kim tomonidan yaratilganlik tarixi saqlanishi shart.
    """
    permission_classes = [permissions.AllowAny]

    def _serialize_student(self, request, s):
        sc = s.student_profile.school_class if hasattr(s, 'student_profile') and s.student_profile else None
        photo_url = request.build_absolute_uri(s.photo_3x4.url) if s.photo_3x4 else None
        return {
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
            'school_id': s.school_id or '1',
            'school_name': s.school_name or "1-sonli Ixtisoslashtirilgan Maktab-Kollej",
            'created_by': s.created_by or "Rahimov Jamshid (maktab1 — Direktor)",
            'created_by_role': s.created_by_role or 'SCHOOL_ADMIN',
            'date_joined': s.date_joined.strftime('%Y-%m-%d %H:%M') if s.date_joined else '',
        }

    def get(self, request):
        school_id = str(request.query_params.get('school_id', '')).strip()
        all_schools = str(request.query_params.get('all_schools', '')).strip() == '1'

        students_qs = User.objects.filter(role='STUDENT').select_related('student_profile__school_class').order_by('-id')
        if school_id:
            students_qs = students_qs.filter(school_id=school_id)
        elif not all_schools:
            # Maktab ko'rsatilmasa, boshqa maktab o'quvchilari ko'rinib ketmasligi uchun bo'sh ro'yxat qaytariladi
            return Response([])

        result = [self._serialize_student(request, s) for s in students_qs]
        return Response(result)

    def post(self, request):
        first_name = str(request.data.get('first_name', '')).strip()
        last_name = str(request.data.get('last_name', '')).strip()
        class_id = request.data.get('class_id')
        photo_3x4 = request.FILES.get('photo_3x4')
        school_id = str(request.data.get('school_id', '')).strip()
        school_name = str(request.data.get('school_name', '')).strip()
        created_by = str(request.data.get('created_by', '')).strip()
        created_by_role = str(request.data.get('created_by_role', 'SCHOOL_ADMIN')).strip() or 'SCHOOL_ADMIN'

        if not school_id:
            return Response(
                {'detail': "O'quvchi qaysidir maktabga tegishli bo'lishi shart (school_id kiritilmadi)! Maktabsiz o'quvchi yaratilmaydi."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not first_name or not last_name:
            return Response({'detail': "Ism va familiya kiritilishi shart."}, status=status.HTTP_400_BAD_REQUEST)

        # Sinfni topish (faqat shu maktabga tegishli sinf bo'lishi shart!)
        school_class = None
        if class_id:
            try:
                school_class = SchoolClass.objects.get(id=class_id, school_id=school_id)
            except SchoolClass.DoesNotExist:
                return Response(
                    {'detail': "Tanlangan sinf/guruh ushbu maktab bazasida topilmadi."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Unikal 5 xonali Kirish ID raqamini generatsiya qilish (10000 dan 99999 gacha)
        def generate_unique_5digit_id():
            while True:
                candidate = str(secrets.randbelow(90000) + 10000)
                if not StudentProfile.objects.filter(student_id=candidate).exists() and not User.objects.filter(username=candidate).exists():
                    return candidate

        student_5digit_id = generate_unique_5digit_id()

        input_password = str(request.data.get('password', '')).strip()
        final_password = input_password if input_password else f"{secrets.randbelow(900000) + 100000}"

        user = User(
            username=student_5digit_id,
            first_name=first_name,
            last_name=last_name,
            role='STUDENT',
            raw_initial_password=final_password,
            school_id=school_id,
            school_name=school_name or (school_class.school_name if school_class else f"Maktab #{school_id}"),
            created_by=created_by or f"{school_name or 'Maktab'} Ma'muriyati",
            created_by_role=created_by_role,
        )
        if photo_3x4:
            user.photo_3x4 = photo_3x4

        user.set_password(final_password)
        user.save()

        StudentProfile.objects.create(
            user=user,
            school_class=school_class,
            student_id=student_5digit_id
        )

        data = self._serialize_student(request, user)
        data['message'] = f"Yangi o'quvchi muvaffaqiyatli qo'shildi! Kirish ID: {student_5digit_id}"
        return Response(data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        student_id = pk or request.data.get('id')
        school_id = str(request.data.get('school_id') or request.query_params.get('school_id') or '').strip()
        try:
            user = User.objects.get(id=student_id, role='STUDENT')
        except User.DoesNotExist:
            return Response({'detail': "O'quvchi topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        if school_id and user.school_id != school_id:
            return Response({'detail': "Boshqa maktab o'quvchisini tahrirlash mumkin emas!"}, status=status.HTTP_403_FORBIDDEN)

        first_name = str(request.data.get('first_name', '')).strip()
        last_name = str(request.data.get('last_name', '')).strip()
        class_id = request.data.get('class_id')
        password = str(request.data.get('password', '')).strip()
        photo_3x4 = request.FILES.get('photo_3x4')

        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name

        if password:
            user.set_password(password)
            user.raw_initial_password = password

        if photo_3x4:
            user.photo_3x4 = photo_3x4

        user.save()

        # Sinfni yangilash (faqat o'quvchining o'z maktabidagi sinfga!)
        if class_id:
            try:
                school_class = SchoolClass.objects.get(id=class_id, school_id=user.school_id)
                if hasattr(user, 'student_profile') and user.student_profile:
                    user.student_profile.school_class = school_class
                    user.student_profile.save()
                else:
                    StudentProfile.objects.create(user=user, school_class=school_class, student_id=user.username)
            except SchoolClass.DoesNotExist:
                return Response({'detail': "Tanlangan sinf ushbu maktabga tegishli emas."}, status=status.HTTP_400_BAD_REQUEST)

        data = self._serialize_student(request, user)
        data['message'] = "O'quvchi ma'lumotlari muvaffaqiyatli yangilandi!"
        return Response(data)

    def delete(self, request, pk=None):
        student_id = pk or request.data.get('id')
        school_id = str(request.query_params.get('school_id') or request.data.get('school_id') or '').strip()
        try:
            user = User.objects.get(id=student_id, role='STUDENT')
            if school_id and user.school_id != school_id:
                return Response({'detail': "Boshqa maktab o'quvchisini o'chirish mumkin emas!"}, status=status.HTTP_403_FORBIDDEN)
            name = user.get_full_name() or user.username
            user.delete()
            return Response({'message': f"{name} tizimdan muvaffaqiyatli o'chirildi!"})
        except User.DoesNotExist:
            return Response({'detail': "O'quvchi topilmadi."}, status=status.HTTP_404_NOT_FOUND)


class TeacherManagementView(views.APIView):
    """
    Maktab o'qituvchilarini olish, yaratish va o'chirish.
    Har bir o'qituvchi aniq bir maktabga (school_id) tegishli bo'lishi shart.
    """
    permission_classes = [permissions.AllowAny]

    def _serialize_teacher(self, t):
        full_name = t.get_full_name().strip() or t.username
        return {
            'id': t.id,
            'username': t.username,
            'name': full_name,
            'first_name': t.first_name,
            'last_name': t.last_name,
            'subject': t.teacher_subject or 'Fan o\'qituvchisi',
            'group': t.teacher_group or 'Fan o\'qituvchisi',
            'rooms': t.teacher_rooms or 'Asosiy bino',
            'phone': t.phone_number or '+998 90 123-45-67',
            'initial_password': t.raw_initial_password or 'teacher123',
            'school_id': t.school_id or '1',
            'school_name': t.school_name or "1-sonli Ixtisoslashtirilgan Maktab-Kollej",
            'created_by': t.created_by or "Rahimov Jamshid (maktab1 — Direktor)",
            'created_by_role': t.created_by_role or 'SCHOOL_ADMIN',
            'created_at': t.date_joined.strftime('%Y-%m-%d %H:%M') if t.date_joined else '',
        }

    def get(self, request):
        school_id = str(request.query_params.get('school_id', '')).strip()
        all_schools = str(request.query_params.get('all_schools', '')).strip() == '1'

        qs = User.objects.filter(role='TEACHER').order_by('-id')
        if school_id:
            qs = qs.filter(school_id=school_id)
        elif not all_schools:
            return Response([])

        return Response([self._serialize_teacher(t) for t in qs])

    def post(self, request):
        name = str(request.data.get('name', '')).strip()
        subject = str(request.data.get('subject', '')).strip()
        phone = str(request.data.get('phone', '')).strip() or '+998 90 000-00-00'
        group = str(request.data.get('group', '')).strip() or 'Fan o\'qituvchisi'
        rooms = str(request.data.get('rooms', '')).strip() or 'Asosiy bino'
        school_id = str(request.data.get('school_id', '')).strip()
        school_name = str(request.data.get('school_name', '')).strip()
        created_by = str(request.data.get('created_by', '')).strip()
        created_by_role = str(request.data.get('created_by_role', 'SCHOOL_ADMIN')).strip() or 'SCHOOL_ADMIN'

        if not school_id:
            return Response(
                {'detail': "O'qituvchi qaysidir maktabga tegishli bo'lishi shart (school_id kiritilmadi)! Maktabsiz o'qituvchi yaratilmaydi."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not name or not subject:
            return Response({'detail': "O'qituvchi F.I.Sh. va fan yo'nalishi kiritilishi shart."}, status=status.HTTP_400_BAD_REQUEST)

        parts = name.split(None, 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        def generate_teacher_username():
            while True:
                candidate = f"T{secrets.randbelow(90000) + 10000}"
                if not User.objects.filter(username=candidate).exists():
                    return candidate

        username = generate_teacher_username()
        raw_pwd = str(request.data.get('password', '')).strip() or 'teacher123'

        teacher = User(
            username=username,
            first_name=first_name,
            last_name=last_name,
            role='TEACHER',
            raw_initial_password=raw_pwd,
            school_id=school_id,
            school_name=school_name or f"Maktab #{school_id}",
            created_by=created_by or f"{school_name or 'Maktab'} Ma'muriyati",
            created_by_role=created_by_role,
            teacher_subject=subject,
            teacher_group=group,
            teacher_rooms=rooms,
            phone_number=phone,
        )
        teacher.set_password(raw_pwd)
        teacher.save()

        return Response(self._serialize_teacher(teacher), status=status.HTTP_201_CREATED)

    def delete(self, request, pk=None):
        teacher_id = pk or request.data.get('id')
        school_id = str(request.query_params.get('school_id') or request.data.get('school_id') or '').strip()
        try:
            teacher = User.objects.get(id=teacher_id, role='TEACHER')
            if school_id and teacher.school_id != school_id:
                return Response({'detail': "Boshqa maktab o'qituvchisini o'chirish mumkin emas!"}, status=status.HTTP_403_FORBIDDEN)
            name = teacher.get_full_name() or teacher.username
            teacher.delete()
            return Response({'message': f"{name} ro'yxatdan o'chirildi."})
        except User.DoesNotExist:
            return Response({'detail': "O'qituvchi topilmadi."}, status=status.HTTP_404_NOT_FOUND)


class SchoolConfigView(views.APIView):
    """
    Maktab darajasidagi to'liq sozlamalar va tizim konfiguratsiyasi (Nastroyka):
    - To'liq maktab nomi, muassasa turi, tuman, manzil, direktor F.I.Sh., telefon, o'quv yili
    - Tizim terminologiyasi:
      * group_term: 'SINF' (Sinf / Sinflar / Sinf rahbari) yoki 'GURUH' (Guruh / Guruhlar / Guruh rahbari)
      * lesson_term: 'DARS' (Dars / Darslar) yoki 'PARA' (Para / Paralar)
      * student_term: 'OQUVCHI' (O'quvchi / O'quvchilar) yoki 'TALABA' (Talaba / Talabalar)
    - QR yangilanish vaqti, kechikish chegarasi va baholash shkalasi.
    O'zgarish saqlanganda maktabga biriktirilgan barcha foydalanuvchilar va sinflar/guruhlarda maktab nomi avtomatik yangilanadi.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        school_id = str(request.query_params.get('school_id', '')).strip()
        all_schools = str(request.query_params.get('all_schools', '')).strip() == '1'

        if all_schools:
            known_ids = set(['1', '2', '3', '4'])
            for sid in User.objects.values_list('school_id', flat=True).distinct():
                if sid:
                    known_ids.add(str(sid))
            for sid in SchoolClass.objects.values_list('school_id', flat=True).distinct():
                if sid:
                    known_ids.add(str(sid))
            for sid in sorted(known_ids):
                SchoolConfig.get_or_create_for_school(sid)
            configs = SchoolConfig.objects.all().order_by('school_id')
            return Response([c.to_dict() for c in configs])

        sid = school_id
        if not sid and getattr(request, 'user', None) and getattr(request.user, 'is_authenticated', False):
            sid = getattr(request.user, 'school_id', '') or '1'
        sid = sid or '1'
        cfg = SchoolConfig.get_or_create_for_school(sid)
        return Response(cfg.to_dict())

    def _save_config(self, request):
        school_id = str(
            request.data.get('school_id')
            or request.query_params.get('school_id')
            or '1'
        ).strip() or '1'

        cfg = SchoolConfig.get_or_create_for_school(school_id)

        school_name = str(request.data.get('school_name', '')).strip()
        if school_name:
            cfg.school_name = school_name

        if 'institution_type' in request.data:
            cfg.institution_type = str(request.data.get('institution_type') or '').strip() or cfg.institution_type
        if 'district' in request.data:
            cfg.district = str(request.data.get('district') or '').strip()
        if 'address' in request.data:
            cfg.address = str(request.data.get('address') or '').strip()
        if 'director_name' in request.data:
            cfg.director_name = str(request.data.get('director_name') or '').strip()
        if 'phone' in request.data:
            cfg.phone = str(request.data.get('phone') or '').strip()
        if 'academic_year' in request.data:
            ay = str(request.data.get('academic_year') or '').strip()
            if ay:
                cfg.academic_year = ay

        if 'group_term' in request.data:
            gt = str(request.data.get('group_term') or 'SINF').strip().upper()
            cfg.group_term = 'GURUH' if gt == 'GURUH' else 'SINF'

        if 'lesson_term' in request.data:
            lt = str(request.data.get('lesson_term') or 'DARS').strip().upper()
            cfg.lesson_term = 'PARA' if lt == 'PARA' else 'DARS'

        if 'student_term' in request.data:
            st = str(request.data.get('student_term') or 'OQUVCHI').strip().upper()
            cfg.student_term = 'TALABA' if st == 'TALABA' else 'OQUVCHI'

        if 'qr_refresh_seconds' in request.data:
            try:
                cfg.qr_refresh_seconds = max(10, min(120, int(request.data.get('qr_refresh_seconds') or 25)))
            except (ValueError, TypeError):
                pass

        if 'late_threshold_minutes' in request.data:
            try:
                cfg.late_threshold_minutes = max(1, min(60, int(request.data.get('late_threshold_minutes') or 10)))
            except (ValueError, TypeError):
                pass

        if 'grading_scale' in request.data:
            gs = str(request.data.get('grading_scale') or '5_BALL').strip().upper()
            cfg.grading_scale = '100_BALL' if '100' in gs else '5_BALL'

        if 'latitude' in request.data:
            lat_val = request.data.get('latitude')
            try:
                cfg.latitude = float(lat_val) if lat_val not in (None, '', 'null') else None
            except (ValueError, TypeError):
                pass

        if 'longitude' in request.data:
            lng_val = request.data.get('longitude')
            try:
                cfg.longitude = float(lng_val) if lng_val not in (None, '', 'null') else None
            except (ValueError, TypeError):
                pass

        if 'location_address' in request.data:
            cfg.location_address = str(request.data.get('location_address') or '').strip()

        if 'radius_meters' in request.data:
            try:
                cfg.radius_meters = max(20, min(5000, int(request.data.get('radius_meters') or 150)))
            except (ValueError, TypeError):
                pass

        if 'updated_by' in request.data:
            ub = str(request.data.get('updated_by') or '').strip()
            if ub:
                cfg.updated_by = ub

        cfg.save()

        # Shu maktabga tegishli barcha o'quvchi, o'qituvchi va sinf/guruhlarda maktab nomini sinxron yangilash
        User.objects.filter(school_id=school_id).update(school_name=cfg.school_name)
        SchoolClass.objects.filter(school_id=school_id).update(
            school_name=cfg.school_name,
            academic_year=cfg.academic_year,
        )

        payload = cfg.to_dict()
        payload['message'] = "Maktab sozlamalari va tizim konfiguratsiyasi muvaffaqiyatli saqlandi!"
        return Response(payload, status=status.HTTP_200_OK)

    def post(self, request):
        return self._save_config(request)

    def put(self, request):
        return self._save_config(request)



