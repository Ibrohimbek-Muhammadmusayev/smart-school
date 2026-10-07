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
        passport = request.data.get('passport_series', '').strip().upper()
        password = request.data.get('password', '')

        if not passport or not password:
            return Response({'detail': 'Passport seriyasi va parol talab qilinadi.'}, status=status.HTTP_400_BAD_REQUEST)

        # Foydalanuvchini topish
        try:
            user = User.objects.get(passport_series=passport)
        except User.DoesNotExist:
            return Response({'detail': 'Foydalanuvchi topilmadi. Ma\'lumotlarni tekshiring.'}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({'detail': 'Parol noto\'g\'ri.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Face ID tekshiruvi talab qilinadi
        return Response({
            'require_face_id': True,
            'user_id': user.id,
            'full_name': user.get_full_name() or user.username,
            'role': user.role,
            'message': 'Parol to\'g\'ri. Endi yuzni tasdiqlang.'
        })


class FaceIdVerifyView(views.APIView):
    """
    1.1 Biometrik tasdiqlash (Face ID tekshiruvi -> 10 kunlik Refresh Token)
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        liveness_verified = request.data.get('liveness_verified', True)
        # Haqiqiy kameradan rasm yoki vektor kelishi mumkin, sinov rejimida liveness_verified tekshiriladi

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'Foydalanuvchi topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        if not liveness_verified:
            return Response({'detail': 'Yuz mos kelmadi, qayta urining.'}, status=status.HTTP_400_BAD_REQUEST)

        # 10 kunlik Refresh token yaratish
        refresh = RefreshToken.for_user(user)

        # Sinf ma'lumotlari
        class_name = ""
        if hasattr(user, 'student_profile') and user.student_profile.school_class:
            class_name = user.student_profile.school_class.name

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'full_name': user.get_full_name() or user.username,
                'role': user.role,
                'passport_series': user.passport_series,
                'class_name': class_name,
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
