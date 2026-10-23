"""
Idrok Edu — Mobil Kabinet: Qorovul va Darvoza Nazoratchisi (Checkpoint Kiosk)
Ushbu modul maktab darvozasi oldida turgan qorovul yoki navbatchi o'qituvchi
uchun mo'ljallangan mobil kabinetning backend API larini ta'minlaydi:
1. CheckpointSearchStudentsView: O'quvchilarni F.I.SH, ID kodi yoki pasport bo'yicha qidirish.
2. CheckpointVerifyQRView: O'quvchi QR kodini skanerlab, tezkor kiritish va davomatni qayd etish.
3. CheckpointVerifyFaceView: O'quvchi yuzini rasmga olib, bazadagi 3x4 rasm bilan solishtirib tasdiqlash.
4. CheckpointTodayStatsView: Bugungi kirishlar soni, davomat foizi va oxirgi 20 ta kirishlar logi.
"""

import os
import datetime
from django.utils import timezone
from django.db.models import Q
from rest_framework import views, status, permissions
from rest_framework.response import Response

from .models import (
    User, StudentProfile, SchoolClass, Lesson, Attendance,
    DeviceEventLog, DynamicQRToken, SchoolConfig, SystemConfig
)
from .telegram_service import notify_parent_attendance
from .biometric_service import verify_student_face_biometric


def _sync_today_lesson_for_student(student, now):
    """
    O'quvchi uchun bugungi kungi faol yoki birinchi darsni topadi va Attendance yozadi.
    """
    today = now.date()
    sp = getattr(student, 'student_profile', None)
    s_class = sp.school_class if sp else None
    if not s_class:
        return None

    lesson = Lesson.objects.filter(
        school_class=s_class,
        date=today,
        status__in=['ACTIVE', 'PENDING']
    ).order_by('id').first()

    if not lesson:
        from .views import sync_today_lessons_from_schedule
        try:
            sync_today_lessons_from_schedule(today, now.isoweekday())
        except Exception:
            pass
        lesson = Lesson.objects.filter(school_class=s_class, date=today).order_by('id').first()

    if lesson:
        att_status = 'PRESENT'
        cfg = SchoolConfig.objects.filter(school_id=student.school_id).first()
        threshold = cfg.late_threshold_minutes if cfg else 10
        if lesson.start_time:
            try:
                lh, lm = map(int, lesson.start_time.split(':'))
                lesson_start_dt = now.replace(hour=lh, minute=lm, second=0, microsecond=0)
                if now > lesson_start_dt + datetime.timedelta(minutes=threshold):
                    att_status = 'LATE'
            except Exception:
                pass

        Attendance.objects.update_or_create(
            lesson=lesson,
            student=student,
            defaults={
                'status': att_status,
                'timestamp': now,
                'is_manual': False
            }
        )
        try:
            notify_parent_attendance(student, lesson)
        except Exception:
            pass

    return lesson


class CheckpointSearchStudentsView(views.APIView):
    """
    Mobil ilovaning Qorovul / Kirish Nazoratchisi kabineti uchun o'quvchilarni
    F.I.SH, ID kodi yoki pasport seriyasi bo'yicha qidirish API.
    GET /api/checkpoint/search-students/?school_id=1&q=...
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        school_id = str(request.query_params.get('school_id', '1')).strip() or '1'
        query = str(request.query_params.get('q', '')).strip()

        qs = User.objects.filter(role='STUDENT', school_id=school_id).select_related(
            'student_profile', 'student_profile__school_class'
        )

        if query:
            q_filter = (
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(username__icontains=query) |
                Q(passport_series__icontains=query) |
                Q(student_profile__student_id__icontains=query)
            )
            if query.isdigit():
                q_filter |= Q(id=int(query))
            qs = qs.filter(q_filter)

        today = timezone.now().date()
        results = []
        for s in qs[:40]:
            sp = getattr(s, 'student_profile', None)
            s_class = sp.school_class if sp else None
            class_name = s_class.name if s_class else ""
            student_code = sp.student_id if sp and sp.student_id else str(s.username or s.id)

            today_log = DeviceEventLog.objects.filter(
                student=s,
                timestamp__date=today,
                direction='IN',
                status='SUCCESS'
            ).order_by('-timestamp').first()

            results.append({
                'id': s.id,
                'full_name': s.get_full_name() or s.username,
                'student_id': student_code,
                'passport_series': s.passport_series or '',
                'class_name': class_name,
                'photo_url': s.photo_3x4.url if s.photo_3x4 else None,
                'has_photo': bool(s.photo_3x4 and os.path.exists(s.photo_3x4.path)),
                'today_entry': {
                    'entered': bool(today_log),
                    'time': today_log.timestamp.strftime("%H:%M") if today_log else None,
                    'method': today_log.event_type if today_log else None,
                } if today_log else None
            })

        return Response({'results': results, 'count': len(results)})


class CheckpointVerifyQRView(views.APIView):
    """
    Mobil ilova Qorovul / Nazoratchi kabineti: O'quvchi QR-kodini skanerlab maktabga kiritish API.
    POST /api/checkpoint/verify-qr/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        qr_token = str(request.data.get('qr_token') or request.data.get('qr_code') or '').strip()
        school_id = str(request.data.get('school_id') or '1').strip()
        direction = str(request.data.get('direction') or 'IN').upper()
        if direction not in ['IN', 'OUT']:
            direction = 'IN'

        if not qr_token:
            return Response({'detail': "QR kod ma'lumotlari kiritilmadi."}, status=status.HTTP_400_BAD_REQUEST)

        student = None
        # 1. DynamicQRToken orqali qidirish
        d_token = DynamicQRToken.objects.filter(token=qr_token).select_related('student').first()
        if d_token and d_token.is_valid():
            student = d_token.student

        # 2. Agar student_id yoki username yoki ID bo'lsa
        if not student:
            sp = StudentProfile.objects.filter(student_id__iexact=qr_token, user__school_id=school_id).select_related('user').first()
            if sp:
                student = sp.user
            elif qr_token.isdigit():
                student = User.objects.filter(id=int(qr_token), role='STUDENT', school_id=school_id).first()
            if not student:
                student = User.objects.filter(
                    Q(username__iexact=qr_token) | Q(passport_series__iexact=qr_token),
                    role='STUDENT',
                    school_id=school_id
                ).first()

        if not student:
            return Response({
                'success': False,
                'detail': "QR kod bazadagi birorta o'quvchiga tegishli emas yoki muddati tugagan."
            }, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        sp = getattr(student, 'student_profile', None)
        s_class = sp.school_class if sp else None
        class_name = s_class.name if s_class else ""
        student_code = sp.student_id if sp and sp.student_id else str(student.id)

        # Bugungi dars va Attendance bog'lash
        if direction == 'IN' and s_class:
            _sync_today_lesson_for_student(student, now)

        # DeviceEventLog yaratish
        log = DeviceEventLog.objects.create(
            school_id=school_id,
            device_name="Mobil Nazoratchi (QR Kiosk)",
            device_ip=request.META.get('REMOTE_ADDR') or "127.0.0.1",
            student=student,
            student_name=student.get_full_name() or student.username,
            student_code=student_code,
            class_name=class_name,
            event_type='QR_CODE',
            direction=direction,
            status='SUCCESS',
            confidence=100.0,
            details=f"Mobil QR orqali {'KIRISH' if direction == 'IN' else 'CHIQISH'} qayd etildi",
            timestamp=now
        )

        return Response({
            'success': True,
            'message': f"{student.get_full_name()} ({class_name}) — QR orqali muvaffaqiyatli kirdi! ✅",
            'student': {
                'id': student.id,
                'full_name': student.get_full_name() or student.username,
                'student_id': student_code,
                'class_name': class_name,
                'photo_url': student.photo_3x4.url if student.photo_3x4 else None,
                'time': now.strftime("%H:%M:%S")
            },
            'log': log.to_dict()
        })


class CheckpointVerifyFaceView(views.APIView):
    """
    Mobil ilova Qorovul / Nazoratchi kabineti: O'quvchi yuzini kameradan rasmga olib,
    bazadagi 3x4 fotosurati bilan real biometrik solishtirib kelganlikni tasdiqlash API.
    POST /api/checkpoint/verify-face/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        student_id = request.data.get('student_id')
        school_id = str(request.data.get('school_id') or '1').strip()
        direction = str(request.data.get('direction') or 'IN').upper()
        if direction not in ['IN', 'OUT']:
            direction = 'IN'

        face_image_b64 = request.data.get('face_image')
        face_file = request.FILES.get('face_image')

        if not student_id:
            return Response({'detail': "O'quvchi ID raqami kiritilmadi."}, status=status.HTTP_400_BAD_REQUEST)

        if not face_image_b64 and not face_file:
            return Response({'detail': "Tekshirish uchun yuz fotosurati olinmadi."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = User.objects.get(id=student_id, role='STUDENT', school_id=school_id)
        except User.DoesNotExist:
            return Response({'detail': "O'quvchi maktab bazasidan topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        if not student.photo_3x4 or not os.path.exists(student.photo_3x4.path):
            return Response({
                'success': False,
                'detail': f"{student.get_full_name()}ning bazada 3x4 fotosurati mavjud emas. Avval fotosurat biriktirilishi shart."
            }, status=status.HTTP_400_BAD_REQUEST)

        cam_input = face_file if face_file else face_image_b64
        sys_cfg = SystemConfig.get_solo()
        gemini_key = sys_cfg.gemini_api_key

        now = timezone.now()
        sp = getattr(student, 'student_profile', None)
        s_class = sp.school_class if sp else None
        class_name = s_class.name if s_class else ""
        student_code = sp.student_id if sp and sp.student_id else str(student.id)

        try:
            bio_result = verify_student_face_biometric(
                student.photo_3x4.path,
                cam_input,
                gemini_api_key=gemini_key
            )
        except Exception as e:
            return Response({
                'success': False,
                'detail': f"Yuzni solishtirishda texnik xatolik: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        is_match = bio_result.get('match', False)
        confidence = bio_result.get('confidence', 0.0)

        if is_match:
            # Bugungi dars va Attendance
            if direction == 'IN' and s_class:
                _sync_today_lesson_for_student(student, now)

            log = DeviceEventLog.objects.create(
                school_id=school_id,
                device_name="Mobil Nazoratchi (Face ID)",
                device_ip=request.META.get('REMOTE_ADDR') or "127.0.0.1",
                student=student,
                student_name=student.get_full_name() or student.username,
                student_code=student_code,
                class_name=class_name,
                event_type='FACE_RECOGNITION',
                direction=direction,
                status='SUCCESS',
                confidence=confidence,
                details=f"Mobil Nazoratchi: Yuz bazadagi 3x4 rasm bilan tasdiqlandi (Aniqlik: {confidence}%)",
                timestamp=now
            )

            return Response({
                'success': True,
                'match': True,
                'confidence': confidence,
                'message': f"{student.get_full_name()} ({class_name}) — Yuz orqali muvaffaqiyatli tasdiqlandi! ✅",
                'student': {
                    'id': student.id,
                    'full_name': student.get_full_name() or student.username,
                    'student_id': student_code,
                    'class_name': class_name,
                    'photo_url': student.photo_3x4.url if student.photo_3x4 else None,
                    'time': now.strftime("%H:%M:%S")
                },
                'log': log.to_dict()
            })
        else:
            log = DeviceEventLog.objects.create(
                school_id=school_id,
                device_name="Mobil Nazoratchi (Face ID)",
                device_ip=request.META.get('REMOTE_ADDR') or "127.0.0.1",
                student=student,
                student_name=student.get_full_name() or student.username,
                student_code=student_code,
                class_name=class_name,
                event_type='FACE_RECOGNITION',
                direction=direction,
                status='FAILED',
                confidence=confidence,
                details=f"Shaxs tasdiqlanmadi: Surat bazadagi 3x4 rasmga mos kelmadi (Aniqlik: {confidence}%)",
                timestamp=now
            )

            return Response({
                'success': False,
                'match': False,
                'confidence': confidence,
                'message': f"❌ Shaxs tasdiqlanmadi! Olingan yuz surati bazadagi o'quvchi rasmi bilan mos kelmadi (Aniqlik: {confidence}%). Kirish rad etildi!",
                'student': {
                    'id': student.id,
                    'full_name': student.get_full_name() or student.username,
                    'student_id': student_code,
                    'class_name': class_name
                },
                'log': log.to_dict()
            }, status=status.HTTP_200_OK)


class CheckpointTodayStatsView(views.APIView):
    """
    Mobil ilova Qorovul / Nazoratchi kabineti: Bugungi statistika va oxirgi kirishlar ro'yxati.
    GET /api/checkpoint/today-stats/?school_id=1
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        school_id = str(request.query_params.get('school_id', '1')).strip() or '1'
        today = timezone.now().date()

        total_students = User.objects.filter(role='STUDENT', school_id=school_id).count()

        today_logs = DeviceEventLog.objects.filter(
            school_id=school_id,
            timestamp__date=today,
            direction='IN',
            status='SUCCESS'
        )

        unique_entered_ids = today_logs.exclude(student__isnull=True).values_list('student_id', flat=True).distinct()
        entered_count = len(unique_entered_ids)

        qr_count = today_logs.filter(event_type='QR_CODE').count()
        face_count = today_logs.filter(event_type='FACE_RECOGNITION').count()

        attendance_rate = round((entered_count / max(1, total_students)) * 100.0, 1)

        recent_logs = []
        for l in today_logs.order_by('-timestamp')[:20]:
            photo = l.student.photo_3x4.url if (l.student and l.student.photo_3x4) else None
            recent_logs.append({
                'id': l.id,
                'student_id': l.student_id,
                'student_name': l.student_name,
                'class_name': l.class_name,
                'time': l.timestamp.strftime("%H:%M:%S"),
                'event_type': l.event_type,
                'confidence': l.confidence,
                'photo_url': photo,
                'status': l.status
            })

        return Response({
            'total_students': total_students,
            'entered_count': entered_count,
            'attendance_rate': attendance_rate,
            'qr_count': qr_count,
            'face_count': face_count,
            'recent_logs': recent_logs
        })
