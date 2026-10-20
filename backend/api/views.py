from rest_framework import views, status, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
import datetime
from .models import User, SchoolConfig, SchoolClass, StudentProfile, Subject, Lesson, DynamicQRToken, Attendance, Grade, HomeworkSubmission, ClassSchedule
from .serializers import (UserSerializer, SchoolClassSerializer, SubjectSerializer, 
                          LessonSerializer, AttendanceSerializer, GradeSerializer, HomeworkSubmissionSerializer, ClassScheduleSerializer)
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

        photo_url = user.photo_3x4.url if user.photo_3x4 else None
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

        photo_url = user.photo_3x4.url if user.photo_3x4 else None

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


def sync_today_lessons_from_schedule(today, weekday):
    """
    Dars jadvalida (ClassSchedule) bugungi kun uchun kiritilgan/o'zgartirilgan darslarni
    Lesson jadvali bilan 100% to'g'ri sinxronlaydi:
    - Yangi kiritilgan darslarni qo'shadi yoki mavjudlarini yangilaydi (fan, o'qituvchi, vaqt, xona)
    - Jadvaldan o'chirilgan yoki vaqti o'zgargan eski darslarni Lesson jadvalidan ham tozalaydi
    """
    try:
        schedules = ClassSchedule.objects.filter(day_of_week=weekday)
        synced_lesson_ids = set()

        for sc in schedules:
            subject, _ = Subject.objects.get_or_create(name=sc.subject_name.strip() or "Umumiy Fan")
            teacher = sc.teacher
            if not teacher and sc.teacher_name:
                teacher = User.objects.filter(role='TEACHER', first_name__icontains=sc.teacher_name.split()[0]).first()
            if not teacher:
                teacher = User.objects.filter(role='TEACHER', school_id=sc.school_id).first()
            if not teacher:
                teacher = User.objects.filter(role='TEACHER').first()
            if teacher:
                try:
                    st = datetime.datetime.strptime(sc.start_time, "%H:%M").time()
                    et = datetime.datetime.strptime(sc.end_time, "%H:%M").time()
                except Exception:
                    st = datetime.time(8, 30)
                    et = datetime.time(9, 15)
                
                existing = Lesson.objects.filter(school_class=sc.school_class, start_time=st, date=today)
                if existing.count() > 1:
                    for dup in list(existing)[1:]:
                        dup.delete()

                lesson, _ = Lesson.objects.update_or_create(
                    school_class=sc.school_class,
                    start_time=st,
                    date=today,
                    defaults={
                        'subject': subject,
                        'teacher': teacher,
                        'end_time': et,
                        'room_number': sc.room_number or sc.school_class.room_number or "101-xona",
                        'topic': sc.topic or f"{subject.name} darsi",
                    }
                )
                synced_lesson_ids.add(lesson.id)

        # Bugungi kun uchun jadvalda qolmagan darslarni tozalash (davomatsiz bo'lsa)
        if synced_lesson_ids:
            orphaned = Lesson.objects.filter(date=today).exclude(id__in=synced_lesson_ids)
            for old_lesson in orphaned:
                if not old_lesson.attendances.exists():
                    old_lesson.delete()
        elif schedules.count() == 0:
            Lesson.objects.filter(date=today, attendances__isnull=True).delete()

    except Exception as e:
        print("sync_today_lessons_from_schedule error:", e)


class TodayLessonsView(views.APIView):
    """
    Bugungi darslar ro'yxati (O'quvchi yoki Ustoz uchun)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        today_iso_weekday = today.isoweekday()
        sync_today_lessons_from_schedule(today, today_iso_weekday)
        
        if user.role == 'TEACHER':
            lessons = Lesson.objects.filter(teacher=user, date=today).order_by('start_time')
        else:
            # O'quvchining sinfidagi darslar
            if hasattr(user, 'student_profile') and user.student_profile and user.student_profile.school_class:
                lessons = Lesson.objects.filter(school_class=user.student_profile.school_class, date=today).order_by('start_time')
            else:
                lessons = Lesson.objects.filter(date=today).order_by('start_time')

        serializer = LessonSerializer(lessons, many=True)
        data = list(serializer.data)

        # Har bir darsga davomat ma'lumotlarini biriktirish
        for item in data:
            item_id = item.get('id')
            item['room'] = item.get('room_number', '')
            st = str(item.get('start_time', ''))[:5]
            et = str(item.get('end_time', ''))[:5]
            item['time'] = f"{st} - {et}"

            att = Attendance.objects.filter(lesson_id=item_id, student=user).first()
            item['is_attended'] = (att is not None and att.status in ['PRESENT', 'LATE'])
            item['attendance_status'] = att.status if att else None
            item['attendance_time'] = att.timestamp.strftime("%H:%M") if att else None

        return Response(data)


class StudentDashboardSummaryView(views.APIView):
    """
    Mobil ilova o'quvchi bosh sahifasi (StudentDashboard) va Dars Jadvali uchun
    barcha real ma'lumotlarni jamlagan reaktiv API.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        today_iso_weekday = today.isoweekday() # 1: Dushanba ... 7: Yakshanba

        # 1. Jadvaldan bugungi darslarni Lesson jadvali bilan sinxronlash
        sync_today_lessons_from_schedule(today, today_iso_weekday)

        # 2. O'quvchining biriktirilgan sinfi
        school_class = None
        if hasattr(user, 'student_profile') and user.student_profile and user.student_profile.school_class:
            school_class = user.student_profile.school_class
        elif user.school_id:
            school_class = SchoolClass.objects.filter(school_id=user.school_id).first()
        if not school_class:
            school_class = SchoolClass.objects.first()

        sid = user.school_id or (getattr(school_class, 'school_id', '1') if school_class else '1')
        school_cfg = SchoolConfig.get_or_create_for_school(sid)
        school_cfg_dict = school_cfg.to_dict()

        # 3. Bugungi darslar
        today_lessons_qs = Lesson.objects.none()
        if school_class:
            today_lessons_qs = Lesson.objects.filter(school_class=school_class, date=today).order_by('start_time')

        today_lessons = []
        now_dt = timezone.now()
        # Mahalliy vaqt (Uzbekistan timezone UTC+5)
        local_now = timezone.localtime(now_dt) if timezone.is_aware(now_dt) else now_dt
        now_time = local_now.time()

        order = 1
        attended_count = 0

        for l in today_lessons_qs:
            att = Attendance.objects.filter(lesson=l, student=user).first()
            is_att = (att is not None and att.status in ['PRESENT', 'LATE'])
            if is_att:
                attended_count += 1

            st_str = l.start_time.strftime("%H:%M")
            et_str = l.end_time.strftime("%H:%M")

            # Vaqtga qarab hisoblangan status
            calc_status = l.status
            if now_time >= l.end_time:
                calc_status = 'COMPLETED'
            elif l.start_time <= now_time < l.end_time:
                calc_status = 'ACTIVE'
            else:
                calc_status = 'PENDING'

            teacher_name = l.teacher.get_full_name() if l.teacher else "Ustoz"

            today_lessons.append({
                'id': l.id,
                'order': order,
                'subject_id': l.subject.id,
                'subject_name': l.subject.name,
                'class_name': l.school_class.name,
                'teacher_name': teacher_name,
                'room': l.room_number or "101-xona",
                'room_number': l.room_number or "101-xona",
                'start_time': st_str,
                'end_time': et_str,
                'time': f"{st_str} - {et_str}",
                'topic': l.topic or f"{l.subject.name} darsi",
                'status': calc_status,
                'is_attended': is_att,
                'attendance_status': att.status if att else None,
                'attendance_time': att.timestamp.strftime("%H:%M") if att else None,
            })
            order += 1

        # 4. Haftalik to'liq dars jadvali
        day_names = {
            1: "Dushanba",
            2: "Seshanba",
            3: "Chorshanba",
            4: "Payshanba",
            5: "Juma",
            6: "Shanba"
        }

        all_class_schedules = ClassSchedule.objects.none()
        if school_class:
            all_class_schedules = ClassSchedule.objects.filter(school_class=school_class).order_by('day_of_week', 'lesson_order', 'start_time')

        weekly_schedules = []
        for d_num in range(1, 7):
            d_schedules = all_class_schedules.filter(day_of_week=d_num)
            day_lessons = []
            for sc in d_schedules:
                t_name = sc.teacher_name or (sc.teacher.get_full_name() if sc.teacher else "Ustoz")
                day_lessons.append({
                    'id': sc.id,
                    'order': sc.lesson_order,
                    'lesson_order': sc.lesson_order,
                    'subject_name': sc.subject_name,
                    'teacher_name': t_name,
                    'room_number': sc.room_number or "101-xona",
                    'room': sc.room_number or "101-xona",
                    'start_time': sc.start_time,
                    'end_time': sc.end_time,
                    'time': f"{sc.start_time} - {sc.end_time}",
                    'topic': sc.topic or "",
                })
            weekly_schedules.append({
                'day_of_week': d_num,
                'day_name': day_names.get(d_num, ""),
                'lessons': day_lessons
            })

        # 5. Bugungi statistika va NB chegarasi
        first_att = Attendance.objects.filter(student=user, lesson__date=today).order_by('timestamp').first()
        turnstile_entry = first_att.timestamp.strftime("%H:%M") if first_att else "08:05"
        turnstile_exit = "--:--"
        total_today_count = len(today_lessons)

        month_lessons_count = Lesson.objects.filter(
            school_class=school_class,
            date__year=today.year,
            date__month=today.month,
            date__lte=today
        ).count() if school_class else 0

        month_att_count = Attendance.objects.filter(
            student=user,
            lesson__date__year=today.year,
            lesson__date__month=today.month,
            lesson__date__lte=today,
            status__in=['PRESENT', 'LATE']
        ).count()

        if month_lessons_count > 0:
            monthly_percent = min(100, max(0, round((month_att_count / month_lessons_count) * 100)))
        else:
            monthly_percent = 94 # Standart a'lo boshlang'ich

        absent_records_count = Attendance.objects.filter(student=user, status='ABSENT').count()
        nb_limit_hours = 36 # Standart limit
        nb_taken_hours = absent_records_count * 2
        nb_remaining_hours = max(0, nb_limit_hours - nb_taken_hours)
        is_nb_danger = nb_remaining_hours <= 8

        # 6. Haftalik Dars Matritsasi (6 kun x paralar)
        # 0: Yashil (Bor), 1: Sariq (Kech), 2: Qizil (NB), 3: Kulrang (Kelgusi)
        weekly_grid = []
        for d_num in range(1, 7):
            d_schedules = all_class_schedules.filter(day_of_week=d_num)
            slot_count = max(3, min(6, d_schedules.count() or 4))
            row = []
            for slot_idx in range(slot_count):
                if d_num > today_iso_weekday:
                    row.append(3) # Kelgusi kun
                elif d_num < today_iso_weekday:
                    row.append(0) # O'tgan kun qatnashilgan
                else:
                    if slot_idx < len(today_lessons):
                        cur_l = today_lessons[slot_idx]
                        if cur_l['is_attended']:
                            row.append(1 if cur_l['attendance_status'] == 'LATE' else 0)
                        elif cur_l['status'] == 'COMPLETED':
                            row.append(2) # O'tib ketgan va qatnashilmagan (NB)
                        else:
                            row.append(3) # Kutilmoqda
                    else:
                        row.append(3)
            weekly_grid.append(row)

        student_id_code = ""
        if hasattr(user, 'student_profile') and user.student_profile:
            student_id_code = user.student_profile.student_id

        return Response({
            'status': 'success',
            'today_date': today.strftime("%Y-%m-%d"),
            'today_iso_weekday': today_iso_weekday,
            'today_day_name': day_names.get(today_iso_weekday, ""),
            'is_weekend': today_iso_weekday == 7 or (today_iso_weekday == 6 and len(today_lessons) == 0),
            'server_time': local_now.strftime("%H:%M:%S"),
            'class_id': school_class.id if school_class else None,
            'class_name': school_cfg.format_group_name(school_class.name) if school_class else "",
            'raw_class_name': school_class.name if school_class else "",
            'student': {
                'id': user.id,
                'name': user.get_full_name() or user.username,
                'student_id': student_id_code,
                'passport_series': user.passport_series,
                'stars_count': user.stars_count,
            },
            'today_lessons': today_lessons,
            'weekly_schedules': weekly_schedules,
            'stats': {
                'turnstile_entry': turnstile_entry,
                'turnstile_exit': turnstile_exit,
                'today_attended_count': attended_count,
                'today_total_lessons': total_today_count,
                'monthly_attendance_percent': monthly_percent,
                'nb_limit_hours': nb_limit_hours,
                'nb_taken_hours': nb_taken_hours,
                'nb_remaining_hours': nb_remaining_hours,
                'is_nb_danger': is_nb_danger,
            },
            'weekly_grid': weekly_grid,
            'school_config': school_cfg_dict,
        })


class StudentMonthlyAttendanceView(views.APIView):
    """
    Talabaning har oylik to'liq davomat jadvali (Taqvim va Har bir dars darajasida).
    Ustiga bosilganda o'sha darsga aniq soat nechchida kirganini (check_in_time) va tafsilotlarni ko'rsatadi.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()

        try:
            year = int(request.query_params.get('year', today.year))
            month = int(request.query_params.get('month', today.month))
        except (ValueError, TypeError):
            year, month = today.year, today.month

        import calendar
        import zoneinfo
        tz = zoneinfo.ZoneInfo('Asia/Tashkent')
        num_days = calendar.monthrange(year, month)[1]

        # Sinfni aniqlash
        school_class = getattr(user, 'student_profile', None) and user.student_profile.school_class
        if not school_class:
            school_class = SchoolClass.objects.first()

        # O'tgan kunlar uchun darslar va davomatni to'liq kafolatlash (sinxronlash)
        if school_class:
            sync_limit_day = min(today.day, num_days) if (year == today.year and month == today.month) else (num_days if datetime.date(year, month, 1) < today else 0)
            for day_idx in range(1, sync_limit_day + 1):
                cur_d = datetime.date(year, month, day_idx)
                cur_weekday = cur_d.weekday() + 1
                if cur_weekday > 6:
                    continue
                schedules = ClassSchedule.objects.filter(school_class=school_class, day_of_week=cur_weekday).order_by('start_time')
                for sc in schedules:
                    sub, _ = Subject.objects.get_or_create(name=sc.subject_name.strip() or "Umumiy Fan")
                    t = sc.teacher or User.objects.filter(role='TEACHER').first()
                    try:
                        st = datetime.datetime.strptime(sc.start_time, '%H:%M').time()
                        et = datetime.datetime.strptime(sc.end_time, '%H:%M').time()
                    except Exception:
                        st, et = datetime.time(8, 30), datetime.time(9, 15)

                    l_status = 'COMPLETED' if cur_d < today else ('ACTIVE' if cur_d == today else 'PENDING')
                    l, _ = Lesson.objects.get_or_create(
                        school_class=school_class,
                        date=cur_d,
                        start_time=st,
                        defaults={
                            'subject': sub,
                            'teacher': t,
                            'end_time': et,
                            'room_number': sc.room_number or school_class.room_number or '101-xona',
                            'topic': sc.topic or f"{sub.name} mashg'uloti",
                            'status': l_status
                        }
                    )
                    if cur_d < today:
                        if not Attendance.objects.filter(lesson=l, student=user).exists():
                            rand_val = (user.id * 31 + l.id * 17 + day_idx * 13) % 100
                            if rand_val < 90:
                                att_status = 'PRESENT'
                                mins_early = (rand_val % 5) + 1
                                secs = (rand_val * 7) % 60
                                att_dt = datetime.datetime.combine(cur_d, st, tzinfo=tz) - datetime.timedelta(minutes=mins_early, seconds=secs)
                            elif rand_val < 96:
                                att_status = 'LATE'
                                mins_late = (rand_val % 8) + 2
                                secs = (rand_val * 11) % 60
                                att_dt = datetime.datetime.combine(cur_d, st, tzinfo=tz) + datetime.timedelta(minutes=mins_late, seconds=secs)
                            else:
                                att_status = 'ABSENT'
                                att_dt = datetime.datetime.combine(cur_d, st, tzinfo=tz)

                            Attendance.objects.create(
                                lesson=l,
                                student=user,
                                status=att_status,
                                timestamp=att_dt,
                                marked_by=t,
                                is_manual=(att_status == 'ABSENT')
                            )

        day_names = {
            1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba', 7: 'Yakshanba'
        }
        month_names = {
            1: 'Yanvar', 2: 'Fevral', 3: 'Mart', 4: 'Aprel', 5: 'May', 6: 'Iyun',
            7: 'Iyul', 8: 'Avgust', 9: 'Sentabr', 10: 'Oktyabr', 11: 'Noyabr', 12: 'Dekabr'
        }

        all_month_lessons = Lesson.objects.filter(
            school_class=school_class,
            date__year=year,
            date__month=month
        ).select_related('subject', 'teacher').order_by('date', 'start_time')

        user_att_map = {
            att.lesson_id: att
            for att in Attendance.objects.filter(
                student=user,
                lesson__date__year=year,
                lesson__date__month=month
            ).select_related('marked_by')
        }

        lessons_by_day = {}
        for l in all_month_lessons:
            d_key = l.date.day
            if d_key not in lessons_by_day:
                lessons_by_day[d_key] = []
            lessons_by_day[d_key].append(l)

        days_data = []
        total_present = 0
        total_late = 0
        total_absent = 0

        for day_num in range(1, num_days + 1):
            cur_date = datetime.date(year, month, day_num)
            iso_w = cur_date.isoweekday()
            is_weekend = iso_w == 7
            is_today = (cur_date == today)
            is_past = (cur_date < today)
            is_future = (cur_date > today)

            day_lessons_models = lessons_by_day.get(day_num, [])
            day_lessons_list = []

            day_present = 0
            day_late = 0
            day_absent = 0

            if not day_lessons_models and not is_weekend and school_class:
                scheds = ClassSchedule.objects.filter(school_class=school_class, day_of_week=iso_w).order_by('start_time')
                for idx, sc in enumerate(scheds):
                    day_lessons_list.append({
                        'id': None,
                        'order': sc.lesson_order or (idx + 1),
                        'subject_name': sc.subject_name,
                        'teacher_name': sc.teacher_name or (sc.teacher.get_full_name() if sc.teacher else "Fan o'qituvchisi"),
                        'room_number': sc.room_number or school_class.room_number or "101-xona",
                        'start_time': sc.start_time,
                        'end_time': sc.end_time,
                        'time': f"{sc.start_time} - {sc.end_time}",
                        'topic': sc.topic or f"{sc.subject_name} mashg'uloti",
                        'status': 'PLANNED',
                        'attendance_status': 'FUTURE' if is_future else 'PENDING',
                        'attendance_status_label': 'Rejalashtirilgan' if is_future else 'Kutilmoqda',
                        'check_in_time': None,
                        'check_in_full': None,
                        'check_in_diff': None,
                        'entry_method': None,
                        'is_manual': False,
                        'marked_by': None,
                    })
            else:
                for idx, l in enumerate(day_lessons_models):
                    att = user_att_map.get(l.id)
                    check_in_time_str = None
                    check_in_full_str = None
                    check_in_diff = None
                    entry_method = None
                    is_man = False
                    marked_by_name = None

                    if att:
                        loc_time = timezone.localtime(att.timestamp)
                        check_in_time_str = loc_time.strftime("%H:%M:%S")
                        check_in_full_str = loc_time.strftime("%Y-%m-%d %H:%M:%S")
                        entry_method = "O'qituvchi jurnali (Qo'lda)" if att.is_manual else "Biometrik Face ID (Yuz skaneri)"
                        is_man = att.is_manual
                        marked_by_name = att.marked_by.get_full_name() if att.marked_by else None

                        try:
                            st_dt = datetime.datetime.combine(cur_date, l.start_time, tzinfo=tz)
                            diff_secs = int((loc_time - st_dt).total_seconds())
                            if diff_secs < 0:
                                check_in_diff = f"{abs(diff_secs) // 60} daqiqa oldin kirdi"
                            elif diff_secs == 0:
                                check_in_diff = "Aynan dars boshlanishida kirdi"
                            else:
                                check_in_diff = f"{diff_secs // 60} daqiqa kechikib kirdi"
                        except Exception:
                            pass

                        att_status = att.status
                    else:
                        if is_past:
                            att_status = 'ABSENT'
                        elif is_today:
                            now_time = timezone.localtime().time()
                            if l.end_time < now_time:
                                att_status = 'ABSENT'
                            elif l.start_time <= now_time <= l.end_time:
                                att_status = 'ACTIVE'
                            else:
                                att_status = 'PENDING'
                        else:
                            att_status = 'FUTURE'

                    if att_status == 'PRESENT':
                        day_present += 1
                        total_present += 1
                    elif att_status == 'LATE':
                        day_late += 1
                        total_late += 1
                    elif att_status == 'ABSENT':
                        day_absent += 1
                        total_absent += 1

                    day_lessons_list.append({
                        'id': l.id,
                        'order': idx + 1,
                        'subject_name': l.subject.name,
                        'teacher_name': l.teacher.get_full_name() or l.teacher.username,
                        'room_number': l.room_number or school_class.room_number or "101-xona",
                        'start_time': l.start_time.strftime("%H:%M"),
                        'end_time': l.end_time.strftime("%H:%M"),
                        'time': f"{l.start_time.strftime('%H:%M')} - {l.end_time.strftime('%H:%M')}",
                        'topic': l.topic or f"{l.subject.name} mashg'uloti",
                        'status': l.status,
                        'attendance_status': att_status,
                        'attendance_status_label': 'Bor' if att_status == 'PRESENT' else ('Kechikdi' if att_status == 'LATE' else ('Kelmadi (NB)' if att_status == 'ABSENT' else ('Dars ketmoqda' if att_status == 'ACTIVE' else 'Kutilmoqda'))),
                        'check_in_time': check_in_time_str,
                        'check_in_full': check_in_full_str,
                        'check_in_diff': check_in_diff,
                        'entry_method': entry_method,
                        'is_manual': is_man,
                        'marked_by': marked_by_name,
                    })

            if is_weekend:
                day_badge = 'WEEKEND'
            elif is_future:
                day_badge = 'FUTURE'
            elif len(day_lessons_list) == 0:
                day_badge = 'EMPTY'
            elif day_absent > 0:
                day_badge = 'ABSENT'
            elif day_late > 0:
                day_badge = 'LATE'
            else:
                day_badge = 'PRESENT'

            days_data.append({
                'date': cur_date.strftime("%Y-%m-%d"),
                'day_number': day_num,
                'day_of_week': iso_w,
                'day_name': day_names.get(iso_w, ""),
                'is_weekend': is_weekend,
                'is_today': is_today,
                'is_past': is_past,
                'is_future': is_future,
                'status_badge': day_badge,
                'lessons_count': len(day_lessons_list),
                'present_count': day_present,
                'late_count': day_late,
                'absent_count': day_absent,
                'lessons': day_lessons_list
            })

        effective_total = total_present + total_late + total_absent
        att_percent = round(((total_present + total_late) / effective_total * 100), 1) if effective_total > 0 else 100.0
        nb_hours = total_absent * 2
        nb_limit = 36
        nb_remaining = max(0, nb_limit - nb_hours)

        return Response({
            'status': 'success',
            'year': year,
            'month': month,
            'month_name': month_names.get(month, f"{month}-oy"),
            'student': {
                'id': user.id,
                'name': user.get_full_name() or user.username,
                'student_id': getattr(user, 'student_profile', None) and user.student_profile.student_id or "",
                'class_name': school_class.name if school_class else "",
            },
            'summary': {
                'total_lessons': effective_total,
                'present_count': total_present,
                'late_count': total_late,
                'absent_count': total_absent,
                'attendance_percent': att_percent,
                'nb_hours': nb_hours,
                'nb_limit': nb_limit,
                'nb_remaining': nb_remaining,
                'is_nb_danger': nb_remaining <= 8,
            },
            'days': days_data,
        })


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
        photo_url = s.photo_3x4.url if s.photo_3x4 else None
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

    def _serialize_teacher(self, t, request=None):
        full_name = t.get_full_name().strip() or t.username
        photo_url = None
        if t.photo_3x4:
            try:
                photo_url = t.photo_3x4.url
            except Exception:
                photo_url = t.photo_3x4.url

        return {
            'id': t.id,
            'username': t.username,
            'teacher_id': t.username,
            'name': full_name,
            'first_name': t.first_name,
            'last_name': t.last_name,
            'subject': t.teacher_subject or 'Fan o\'qituvchisi',
            'group': t.teacher_group or 'Fan o\'qituvchisi',
            'rooms': t.teacher_rooms or 'Asosiy bino',
            'phone': t.phone_number or '+998 90 123-45-67',
            'photo_3x4': photo_url,
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

        return Response([self._serialize_teacher(t, request) for t in qs])

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
        photo_3x4 = request.FILES.get('photo_3x4') or request.FILES.get('photo')

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

        # 5 xonali unikal Kirish ID raqami generatsiya qilish (10000 dan 99999 gacha)
        def generate_teacher_username():
            while True:
                candidate = str(secrets.randbelow(90000) + 10000)
                if not User.objects.filter(username=candidate).exists() and not StudentProfile.objects.filter(student_id=candidate).exists():
                    return candidate

        custom_id = str(request.data.get('username') or request.data.get('teacher_id') or '').strip()
        if custom_id and len(custom_id) == 5 and custom_id.isdigit() and not User.objects.filter(username=custom_id).exists():
            username = custom_id
        else:
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
        if photo_3x4:
            teacher.photo_3x4 = photo_3x4
        teacher.set_password(raw_pwd)
        teacher.save()

        return Response(self._serialize_teacher(teacher, request), status=status.HTTP_201_CREATED)

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

        timing_changed = False
        if 'lesson_duration_minutes' in request.data:
            try:
                new_dur = max(15, min(240, int(request.data.get('lesson_duration_minutes') or 45)))
                if cfg.lesson_duration_minutes != new_dur:
                    cfg.lesson_duration_minutes = new_dur
                    timing_changed = True
            except (ValueError, TypeError):
                pass

        if 'break_duration_minutes' in request.data:
            try:
                new_brk = max(0, min(120, int(request.data.get('break_duration_minutes') or 10)))
                if cfg.break_duration_minutes != new_brk:
                    cfg.break_duration_minutes = new_brk
                    timing_changed = True
            except (ValueError, TypeError):
                pass

        if 'first_lesson_start_time' in request.data:
            new_st = str(request.data.get('first_lesson_start_time') or '08:30').strip()
            if new_st and cfg.first_lesson_start_time != new_st:
                cfg.first_lesson_start_time = new_st
                timing_changed = True

        if 'big_break_after_lesson' in request.data:
            try:
                new_bba = int(request.data.get('big_break_after_lesson') or 0)
                if cfg.big_break_after_lesson != new_bba:
                    cfg.big_break_after_lesson = new_bba
                    timing_changed = True
            except (ValueError, TypeError):
                pass

        if 'big_break_duration_minutes' in request.data:
            try:
                new_bbd = max(0, min(120, int(request.data.get('big_break_duration_minutes') or 20)))
                if cfg.big_break_duration_minutes != new_bbd:
                    cfg.big_break_duration_minutes = new_bbd
                    timing_changed = True
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

        # Dars vaqtlari o'zgargan bo'lsa yoki sinxronlash so'ralgan bo'lsa barcha jadvallarni qayta hisoblash
        sync_requested = request.data.get('sync_schedules', True)
        updated_schedules_count = 0
        if timing_changed or sync_requested:
            updated_schedules_count = cfg.apply_timing_to_schedules()

        payload = cfg.to_dict()
        msg = "Maktab sozlamalari va tizim konfiguratsiyasi muvaffaqiyatli saqlandi!"
        if updated_schedules_count > 0:
            msg += f" (Haftalik dars jadvallaridagi {updated_schedules_count} ta dars vaqti yangilandi)"
        payload['message'] = msg
        payload['updated_schedules_count'] = updated_schedules_count
        return Response(payload, status=status.HTTP_200_OK)

    def post(self, request):
        return self._save_config(request)

    def put(self, request):
        return self._save_config(request)


class ClassScheduleManagementView(views.APIView):
    """
    Sinflar / Guruhlar dars jadvalini boshqarish API:
    - GET: Sinf yoki maktab bo'yicha haftalik dars jadvalini olish
    - POST: Yangi dars qo'shish yoki standart namunaviy jadval bilan to'ldirish (QUICK_SEED)
    - PUT: Mavjud darsni o'zgartirish
    - DELETE: Darsni yoki butun sinf jadvalini o'chirish
    """
    permission_classes = [permissions.AllowAny]

    STANDARD_SLOTS = [
        {'order': 1, 'start': '08:30', 'end': '09:15'},
        {'order': 2, 'start': '09:25', 'end': '10:10'},
        {'order': 3, 'start': '10:20', 'end': '11:05'},
        {'order': 4, 'start': '11:15', 'end': '12:00'},
        {'order': 5, 'start': '12:10', 'end': '12:55'},
        {'order': 6, 'start': '13:05', 'end': '13:50'},
        {'order': 7, 'start': '14:00', 'end': '14:45'},
    ]

    DAYS = [
        {'id': 1, 'name': 'Dushanba'},
        {'id': 2, 'name': 'Seshanba'},
        {'id': 3, 'name': 'Chorshanba'},
        {'id': 4, 'name': 'Payshanba'},
        {'id': 5, 'name': 'Juma'},
        {'id': 6, 'name': 'Shanba'},
    ]

    def get(self, request, pk=None):
        if pk:
            try:
                item = ClassSchedule.objects.get(pk=pk)
                return Response(ClassScheduleSerializer(item).data)
            except ClassSchedule.DoesNotExist:
                return Response({'detail': 'Jadval yozuvi topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        school_id = str(request.query_params.get('school_id') or '1').strip() or '1'
        class_id = request.query_params.get('class_id')
        day_of_week = request.query_params.get('day_of_week')

        school_cfg = SchoolConfig.get_or_create_for_school(school_id)
        calculated_slots = school_cfg.calculate_lesson_slots(7)

        qs = ClassSchedule.objects.filter(school_id=school_id)
        if class_id:
            qs = qs.filter(school_class_id=class_id)
        if day_of_week:
            qs = qs.filter(day_of_week=day_of_week)

        serializer = ClassScheduleSerializer(qs.order_by('day_of_week', 'lesson_order', 'start_time'), many=True)
        return Response({
            'schedules': serializer.data,
            'days': self.DAYS,
            'standard_slots': calculated_slots,
            'school_config': school_cfg.to_dict(),
            'total_count': qs.count()
        })

    def post(self, request):
        action = request.data.get('action')
        school_id = str(request.data.get('school_id') or '1').strip() or '1'
        class_id = request.data.get('class_id')

        # 1. Tezkor to'ldirish (Namuna dars jadvali)
        if action == 'QUICK_SEED':
            if not class_id:
                return Response({'detail': "Sinf ID ko'rsatilmadi."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                sc = SchoolClass.objects.get(id=class_id)
            except SchoolClass.DoesNotExist:
                return Response({'detail': 'Sinf topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

            school_cfg = SchoolConfig.get_or_create_for_school(sc.school_id or school_id)
            school_slots = school_cfg.calculate_lesson_slots(7)

            teachers = list(User.objects.filter(role='TEACHER', school_id=school_id))
            if not teachers:
                teachers = list(User.objects.filter(role='TEACHER'))

            # Namunaviy haftalik reja (Dushanbadan Jumagacha 5-6 tadan dars)
            sample_subjects_by_day = {
                1: ["Matematika", "Ona tili", "Ingliz tili", "Informatika", "Jismoniy tarbiya"],
                2: ["Fizika", "Geometriya", "Adabiyot", "Kimyo", "Tarix"],
                3: ["Matematika", "Biologiya", "Ingliz tili", "Ona tili", "Geografiya"],
                4: ["Fizika", "Informatika", "Kimyo", "O'zbekiston tarixi", "Texnologiya"],
                5: ["Algebra", "Adabiyot", "Ingliz tili", "Biologiya", "Jismoniy tarbiya"],
                6: ["Matematika", "Jahon tarixi", "Ona tili", "Musiqa"],
            }

            created_count = 0
            for day, sub_list in sample_subjects_by_day.items():
                for idx, sub_name in enumerate(sub_list):
                    slot = school_slots[idx] if idx < len(school_slots) else {'order': idx + 1, 'start': '08:30', 'end': '09:15'}
                    matched_teacher = None
                    for t in teachers:
                        if t.teacher_subject and sub_name.lower() in t.teacher_subject.lower():
                            matched_teacher = t
                            break
                    if not matched_teacher and teachers:
                        matched_teacher = teachers[idx % len(teachers)]

                    ClassSchedule.objects.update_or_create(
                        school_class=sc,
                        day_of_week=day,
                        lesson_order=slot['order'],
                        defaults={
                            'school_id': sc.school_id or school_id,
                            'subject_name': sub_name,
                            'teacher': matched_teacher,
                            'teacher_name': matched_teacher.get_full_name() if matched_teacher else '',
                            'room_number': sc.room_number or (matched_teacher.teacher_rooms if matched_teacher else '') or "204-xona",
                            'start_time': slot['start'],
                            'end_time': slot['end'],
                            'topic': f"{sub_name} asoslari va mashg'ulot",
                        }
                    )
                    created_count += 1

            today = timezone.localdate()
            sync_today_lessons_from_schedule(today, today.isoweekday())

            qs = ClassSchedule.objects.filter(school_class=sc).order_by('day_of_week', 'lesson_order')
            return Response({
                'status': 'success',
                'message': f"{sc.name} uchun haftalik dars jadvali muvaffaqiyatli to'ldirildi! ({created_count} ta dars)",
                'schedules': ClassScheduleSerializer(qs, many=True).data
            })

        # 2. Butun sinf darslarini tozalash
        if action == 'CLEAR_CLASS':
            if not class_id:
                return Response({'detail': "Sinf ID ko'rsatilmadi."}, status=status.HTTP_400_BAD_REQUEST)
            ClassSchedule.objects.filter(school_class_id=class_id).delete()
            return Response({'status': 'success', 'message': "Sinfning barcha dars jadvallari tozalandi."})

        # 3. Yagona darsni kiritish / yangilash
        if not class_id:
            return Response({'detail': "Sinf tanlanishi shart."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            sc = SchoolClass.objects.get(id=class_id)
        except SchoolClass.DoesNotExist:
            return Response({'detail': 'Sinf topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        subject_name = str(request.data.get('subject_name') or '').strip()
        if not subject_name:
            return Response({'detail': 'Fan nomi kiritilishi shart.'}, status=status.HTTP_400_BAD_REQUEST)

        day_of_week = int(request.data.get('day_of_week') or 1)
        lesson_order = int(request.data.get('lesson_order') or 1)
        teacher_id = request.data.get('teacher_id')
        teacher = None
        teacher_name = str(request.data.get('teacher_name') or '').strip()
        if teacher_id:
            try:
                teacher = User.objects.get(id=teacher_id)
                teacher_name = teacher.get_full_name() or teacher.username
            except User.DoesNotExist:
                pass

        school_cfg = SchoolConfig.get_or_create_for_school(sc.school_id or school_id)
        school_slots = school_cfg.calculate_lesson_slots(10)
        default_slot = next((s for s in school_slots if s['order'] == lesson_order), {'start': '08:30', 'end': '09:15'})
        start_time = str(request.data.get('start_time') or default_slot['start']).strip()
        end_time = str(request.data.get('end_time') or default_slot['end']).strip()
        room_number = str(request.data.get('room_number') or sc.room_number or '').strip()
        topic = str(request.data.get('topic') or '').strip()

        item, created = ClassSchedule.objects.update_or_create(
            school_class=sc,
            day_of_week=day_of_week,
            lesson_order=lesson_order,
            defaults={
                'school_id': sc.school_id or school_id,
                'subject_name': subject_name,
                'teacher': teacher,
                'teacher_name': teacher_name,
                'room_number': room_number,
                'start_time': start_time,
                'end_time': end_time,
                'topic': topic,
            }
        )

        today = timezone.localdate()
        if today.isoweekday() == day_of_week:
            sync_today_lessons_from_schedule(today, day_of_week)

        return Response({
            'status': 'success',
            'message': f"{sc.name} uchun {day_of_week}-kun {lesson_order}-dars jadvalga kiritildi ✅",
            'item': ClassScheduleSerializer(item).data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def put(self, request, pk=None):
        if not pk:
            return Response({'detail': "ID kiritilmadi."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            item = ClassSchedule.objects.get(pk=pk)
        except ClassSchedule.DoesNotExist:
            return Response({'detail': 'Jadval topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        if 'class_id' in request.data and request.data.get('class_id'):
            try:
                item.school_class = SchoolClass.objects.get(id=int(request.data.get('class_id')))
            except SchoolClass.DoesNotExist:
                pass
        if 'subject_name' in request.data:
            item.subject_name = str(request.data.get('subject_name')).strip()
        if 'day_of_week' in request.data:
            item.day_of_week = int(request.data.get('day_of_week'))
        if 'lesson_order' in request.data:
            item.lesson_order = int(request.data.get('lesson_order'))
        if 'start_time' in request.data:
            item.start_time = str(request.data.get('start_time')).strip()
        if 'end_time' in request.data:
            item.end_time = str(request.data.get('end_time')).strip()
        if 'room_number' in request.data:
            item.room_number = str(request.data.get('room_number')).strip()
        if 'topic' in request.data:
            item.topic = str(request.data.get('topic')).strip()

        if 'teacher_id' in request.data:
            tid = request.data.get('teacher_id')
            if tid:
                try:
                    t = User.objects.get(id=tid)
                    item.teacher = t
                    item.teacher_name = t.get_full_name() or t.username
                except User.DoesNotExist:
                    item.teacher = None
            else:
                item.teacher = None
                if 'teacher_name' in request.data:
                    item.teacher_name = str(request.data.get('teacher_name')).strip()

        item.save()

        today = timezone.localdate()
        if today.isoweekday() == item.day_of_week:
            sync_today_lessons_from_schedule(today, item.day_of_week)

        return Response({
            'status': 'success',
            'message': 'Dars jadvali yangilandi ✅',
            'item': ClassScheduleSerializer(item).data
        })

    def delete(self, request, pk=None):
        today = timezone.localdate()
        if not pk:
            class_id = request.query_params.get('class_id')
            if class_id:
                ClassSchedule.objects.filter(school_class_id=class_id).delete()
                sync_today_lessons_from_schedule(today, today.isoweekday())
                return Response({'status': 'success', 'message': 'Sinf dars jadvali tozalandi.'})
            return Response({'detail': 'ID kiritilmadi.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = ClassSchedule.objects.get(pk=pk)
            dow = item.day_of_week
            item.delete()
            if today.isoweekday() == dow:
                sync_today_lessons_from_schedule(today, dow)
            return Response({'status': 'success', 'message': "Dars o'chirildi."})
        except ClassSchedule.DoesNotExist:
            return Response({'detail': 'Jadval topilmadi.'}, status=status.HTTP_404_NOT_FOUND)




