"""
Idrok Edu — Maktablarni Ro'yxatdan O'tkazish Arizalari (School Onboarding Applications)
1. SchoolApplicationCreateView: Landing sahifasidan kelgan arizalarni qabul qilish.
2. SchoolApplicationListView: Super Admin uchun barcha arizalar ro'yxati va statistikasi.
3. SchoolApplicationApproveView: Arizani qabul qilish va 1 ta bosishda yangi maktab va direktor hisobini yaratish.
4. SchoolApplicationRejectView: Arizani rad etish.
"""

import re
import secrets
import logging
import requests
from django.utils import timezone
from django.db.models import Q
from rest_framework import views, status, permissions
from rest_framework.response import Response

from .models import SchoolApplication, SchoolConfig, User, SystemConfig

logger = logging.getLogger(__name__)


def _send_telegram_notification_to_superadmin(application: SchoolApplication):
    """
    Yangi ariza kelganda Super Admin Telegram botiga tezkor xabar yuboradi.
    """
    try:
        cfg = SystemConfig.get_solo()
        bot_token = cfg.telegram_bot_token
        chat_id = getattr(cfg, 'telegram_admin_id', None) or getattr(cfg, 'support_telegram', None)

        if not bot_token:
            return

        # Agar admin_chat_id bo'lmasa, getUpdates orqali oxirgi admin chat_id ni topishga harakat qiladi
        if not chat_id:
            try:
                upd_res = requests.get(f"https://api.telegram.org/bot{bot_token}/getUpdates?limit=5", timeout=4)
                if upd_res.status_code == 200:
                    upds = upd_res.json().get('result', [])
                    if upds:
                        chat_id = str(upds[-1].get('message', {}).get('chat', {}).get('id', ''))
            except Exception:
                pass

        if not chat_id:
            return

        msg = (
            "🔔 <b>YANGI MAKTAB RO'YXATDAN O'TISH ARIZASI TUSHDI!</b>\n\n"
            f"🏛 <b>Maktab nomi:</b> {application.school_name}\n"
            f"🏷 <b>Turi:</b> {application.get_school_type_display()}\n"
            f"📍 <b>Hudud:</b> {application.region}, {application.district}\n"
            f"👤 <b>Mas'ul:</b> {application.contact_name} ({application.contact_role})\n"
            f"📞 <b>Telefon:</b> {application.phone}\n"
        )
        if application.telegram_username:
            msg += f"✈️ <b>Telegram:</b> @{application.telegram_username.lstrip('@')}\n"

        msg += (
            f"👥 <b>Hajmi:</b> ~{application.estimated_students} o'quvchi, ~{application.estimated_teachers} o'qituvchi\n"
            f"🛡 <b>Turniket:</b> {application.get_turnstile_status_display()}\n"
            f"✨ <b>Funksiyalar:</b> Barcha standart funksiyalar to'liq faol\n"
        )

        if application.notes:
            msg += f"📝 <b>Izoh:</b> {application.notes}\n"

        msg += (
            f"\n⏰ <i>Vaqt: {application.created_at.strftime('%Y-%m-%d %H:%M')}</i>\n"
            "👉 <b>Super Admin Boshqaruv Panelida arizani ko'rib chiqishingiz va bir bosishda maktab yaratishingiz mumkin.</b>"
        )

        requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json={
                "chat_id": chat_id,
                "text": msg,
                "parse_mode": "HTML"
            },
            timeout=5
        )
    except Exception as e:
        logger.warning(f"Super Admin Telegram xabarnomasi yuborishda ogohlantirish: {e}")


class SchoolApplicationCreateView(views.APIView):
    """
    Landing sahifasidan ochiq ariza qabul qilish API.
    POST /api/school-applications/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data or {}

        school_name = str(data.get('school_name', '')).strip()
        contact_name = str(data.get('contact_name', '')).strip()
        phone = str(data.get('phone', '')).strip()
        region = str(data.get('region', '')).strip()
        district = str(data.get('district', '')).strip()

        if not school_name:
            return Response({'detail': "Maktab nomi kiritilishi majburiy."}, status=status.HTTP_400_BAD_REQUEST)
        if not contact_name:
            return Response({'detail': "Mas'ul shaxs (Direktor) F.I.SH kiritilishi majburiy."}, status=status.HTTP_400_BAD_REQUEST)
        if not phone:
            return Response({'detail': "Aloqa telefon raqami kiritilishi majburiy."}, status=status.HTTP_400_BAD_REQUEST)
        if not region or not district:
            return Response({'detail': "Viloyat va tuman tanlanishi lozim."}, status=status.HTTP_400_BAD_REQUEST)

        # O'quvchilar va o'qituvchilar soni
        try:
            est_students = int(data.get('estimated_students') or 0)
        except (ValueError, TypeError):
            est_students = 0

        try:
            est_teachers = int(data.get('estimated_teachers') or 0)
        except (ValueError, TypeError):
            est_teachers = 0

        application = SchoolApplication.objects.create(
            school_name=school_name,
            school_type=data.get('school_type') or 'PUBLIC',
            region=region,
            district=district,
            address=str(data.get('address') or '').strip(),
            contact_name=contact_name,
            contact_role=str(data.get('contact_role') or 'Direktor').strip(),
            phone=phone,
            telegram_username=str(data.get('telegram_username') or '').strip().lstrip('@'),
            estimated_students=est_students,
            estimated_teachers=est_teachers,
            turnstile_status=data.get('turnstile_status') or 'MOBILE_KIOSK',
            desired_modules=data.get('desired_modules') or [],
            notes=str(data.get('notes') or '').strip(),
            status='PENDING'
        )

        # Telegram botga xabar
        _send_telegram_notification_to_superadmin(application)

        return Response({
            'success': True,
            'application_id': application.id,
            'message': f"Hurmatli {contact_name}, so'rovingiz muvaffaqiyatli qabul qilindi! So'rovingizni ko'rib chiqib, tez orada siz bilan aloqaga chiqamiz.",
            'data': application.to_dict()
        }, status=status.HTTP_201_CREATED)


class SchoolApplicationListView(views.APIView):
    """
    Super Admin uchun arizalar ro'yxatini qaytarish API.
    GET /api/superadmin/school-applications/?status=PENDING&q=...
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        status_filter = str(request.query_params.get('status', '')).strip().upper()
        search_query = str(request.query_params.get('q', '')).strip()

        qs = SchoolApplication.objects.all().order_by('-created_at')

        if status_filter and status_filter in ['PENDING', 'APPROVED', 'REJECTED']:
            qs = qs.filter(status=status_filter)

        if search_query:
            qs = qs.filter(
                Q(school_name__icontains=search_query) |
                Q(contact_name__icontains=search_query) |
                Q(phone__icontains=search_query) |
                Q(district__icontains=search_query) |
                Q(region__icontains=search_query)
            )

        # Statistik ko'rsatkichlar
        all_apps = SchoolApplication.objects.all()
        total_count = all_apps.count()
        pending_count = all_apps.filter(status='PENDING').count()
        approved_count = all_apps.filter(status='APPROVED').count()
        rejected_count = all_apps.filter(status='REJECTED').count()

        results = [app.to_dict() for app in qs]

        return Response({
            'stats': {
                'total': total_count,
                'pending': pending_count,
                'approved': approved_count,
                'rejected': rejected_count,
            },
            'applications': results,
            'count': len(results)
        })


class SchoolApplicationApproveView(views.APIView):
    """
    Super Admin: Arizani qabul qilish va 1 ta bosish bilan yangi maktab va direktor hisobini yaratish.
    POST /api/superadmin/school-applications/<int:pk>/approve/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            application = SchoolApplication.objects.get(pk=pk)
        except SchoolApplication.DoesNotExist:
            return Response({'detail': "Ariza topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        if application.status == 'APPROVED' and application.created_school_id:
            return Response({
                'success': True,
                'message': "Ushbu ariza allaqachon tasdiqlangan va maktab yaratilgan.",
                'school_id': application.created_school_id,
                'credentials': application.admin_credentials
            })

        # 1. Yangi noyob school_id hosil qilish
        # Masalan: maktab_7 yoki viloyat prefiksi
        existing_ids = set(SchoolConfig.objects.values_list('school_id', flat=True))
        new_school_id = None
        # Avval raqamli tekshirish
        for i in range(1, 1000):
            sid = str(i)
            if sid not in existing_ids:
                new_school_id = sid
                break
        if not new_school_id:
            new_school_id = f"SCH-{secrets.token_hex(3).upper()}"

        # 2. Direktor uchun login va parol yaratish
        clean_name = re.sub(r'[^a-zA-Z0-9]', '', application.school_name.lower())[:10]
        if not clean_name:
            clean_name = f"maktab{new_school_id}"
        
        base_username = f"maktab_{clean_name}"
        username = base_username
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{suffix}"
            suffix += 1

        raw_password = f"Smart{secrets.randbelow(8999) + 1000}!"

        # 3. SchoolConfig yaratish
        inst_type = application.get_school_type_display()
        group_term = 'GURUH' if application.school_type in ['COLLEGE', 'LEARNING_CENTER'] else 'SINF'
        lesson_term = 'PARA' if application.school_type == 'COLLEGE' else 'DARS'
        student_term = 'TALABA' if application.school_type == 'COLLEGE' else 'OQUVCHI'

        school_cfg, _ = SchoolConfig.objects.get_or_create(
            school_id=new_school_id,
            defaults={
                'school_name': application.school_name,
                'institution_type': inst_type,
                'district': f"{application.region}, {application.district}",
                'address': application.address or f"{application.region}, {application.district}",
                'director_name': application.contact_name,
                'phone': application.phone,
                'status': 'ACTIVE',
                'payment_status': 'PAID',
                'monthly_price': int(request.data.get('monthly_price') or 1000000),
                'admin_username': username,
                'admin_password': raw_password,
                'group_term': group_term,
                'lesson_term': lesson_term,
                'student_term': student_term,
            }
        )

        # 4. Direktor User hisobini yaratish
        first_name = application.contact_name
        last_name = ""
        parts = application.contact_name.split()
        if len(parts) >= 2:
            first_name = parts[0]
            last_name = " ".join(parts[1:])

        director_user = User.objects.create(
            username=username,
            role='ADMIN',
            first_name=first_name,
            last_name=last_name,
            school_id=new_school_id,
            school_name=application.school_name,
            phone_number=application.phone,
            created_by="Super Admin (Ariza tasdiqlash orqali)",
            created_by_role="SUPER_ADMIN"
        )
        director_user.set_password(raw_password)
        director_user.save()

        # 5. Arizani APPROVED qilish va hisob ma'lumotlarini saqlash
        credentials = {
            'username': username,
            'password': raw_password,
            'school_id': new_school_id,
            'school_name': application.school_name,
            'director_name': application.contact_name,
            'phone': application.phone,
            'login_url': f"/#/login"
        }

        application.status = 'APPROVED'
        application.created_school_id = new_school_id
        application.admin_credentials = credentials
        application.save()

        return Response({
            'success': True,
            'message': f"{application.school_name} muvaffaqiyatli qabul qilindi va tizimda yangi maktab ochildi! 🎉",
            'school_id': new_school_id,
            'school': school_cfg.to_dict(),
            'credentials': credentials
        }, status=status.HTTP_200_OK)


class SchoolApplicationRejectView(views.APIView):
    """
    Super Admin: Arizani rad etish.
    POST /api/superadmin/school-applications/<int:pk>/reject/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            application = SchoolApplication.objects.get(pk=pk)
        except SchoolApplication.DoesNotExist:
            return Response({'detail': "Ariza topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        reason = str(request.data.get('reason') or "Ma'lumotlar to'liq emas yoki aloqa o'rnatilmadi.").strip()
        application.status = 'REJECTED'
        application.rejection_reason = reason
        application.save()

        return Response({
            'success': True,
            'message': f"Ariza #{application.id} ({application.school_name}) rad etildi.",
            'data': application.to_dict()
        })
