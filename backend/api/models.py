from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import secrets
import datetime

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Administrator'),
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
        ('GUARD', 'Qorovul / Kirish Nazoratchisi'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    passport_series = models.CharField(max_length=20, unique=True, null=True, blank=True) # e.g. "AA 1234567"
    photo_3x4 = models.ImageField(upload_to='photos_3x4/', null=True, blank=True)
    face_embedding = models.TextField(null=True, blank=True) # Vector or hash for face verification
    can_manage_passwords = models.BooleanField(default=False) # For Admin-Teacher role
    raw_initial_password = models.CharField(max_length=128, null=True, blank=True) # Visible only to admin-teacher

    # Parent notification details
    parent_phone = models.CharField(max_length=20, null=True, blank=True)
    parent_telegram_chat_id = models.CharField(max_length=50, null=True, blank=True)

    # Yulduzlar balansi (A'lo baho va pulli yutuqlar uchun)
    stars_count = models.IntegerField(default=0)

    # Multi-tenant Maktab izolyatsiyasi va yaratilganlik tarixi
    school_id = models.CharField(max_length=64, db_index=True, default='1')
    school_name = models.CharField(max_length=255, blank=True, default="1-sonli Ixtisoslashtirilgan Maktab-Kollej")
    created_by = models.CharField(max_length=255, blank=True, default="Rahimov Jamshid (maktab1 — Direktor)")
    created_by_role = models.CharField(max_length=50, blank=True, default="SCHOOL_ADMIN")

    # O'qituvchi qo'shimcha ma'lumotlari
    teacher_subject = models.CharField(max_length=150, blank=True, default="")
    teacher_group = models.CharField(max_length=100, blank=True, default="")
    teacher_rooms = models.CharField(max_length=100, blank=True, default="")
    phone_number = models.CharField(max_length=40, blank=True, default="")

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"



class SystemConfig(models.Model):
    # Global loyiha nomi va brending sozlamalari
    project_name = models.CharField(max_length=150, default="Idrok Edu")
    project_badge = models.CharField(max_length=50, default="CORE")
    project_slogan = models.CharField(max_length=255, default="Aqlli Ta'lim va Biometrik Davomat Platformasi")

    # Global xavfsizlik va davomat sozlamalari
    qr_refresh_seconds = models.IntegerField(default=15)
    face_id_min_confidence = models.IntegerField(default=90)
    default_gps_radius = models.IntegerField(default=150)
    session_timeout_minutes = models.IntegerField(default=60)

    # Global yordam va aloqa markazi ma'lumotlari
    support_phone = models.CharField(max_length=50, blank=True, default="+998 71 200-00-00")
    support_telegram = models.CharField(max_length=100, blank=True, default="@idrok_support_bot")
    support_email = models.CharField(max_length=100, blank=True, default="support@smart-school.uz")
    support_hours = models.CharField(max_length=150, blank=True, default="Dushanba – Shanba, 08:00 – 20:00")

    # Global SMS integratsiya sozlamalari
    sms_provider = models.CharField(max_length=100, blank=True, default="Eskiz.uz Official Gateway")
    sms_token = models.CharField(max_length=255, blank=True, default="")
    sms_template = models.TextField(blank=True, default="Hurmatli ota-ona! Farzandingiz {student_name} bugun darsga kelmadi.")

    # Mobil ilova versiya nazorati
    android_min_version = models.CharField(max_length=50, blank=True, default="2.4.1")
    ios_min_version = models.CharField(max_length=50, blank=True, default="2.4.0")
    force_update = models.BooleanField(default=True)

    # Texnik ishlar (Maintenance mode)
    is_maintenance_mode = models.BooleanField(default=False)
    maintenance_title = models.CharField(max_length=255, default="Tizimda profilaktika ishlari olib borilmoqda")
    maintenance_message = models.TextField(
        default="Tizim serverlarida rejali modernizatsiya va texnik sozlash ishlari amalga oshirilmoqda. Tez orada barcha xizmatlar to'liq tiklanadi."
    )
    estimated_end_time = models.CharField(max_length=100, blank=True, default="14:00")

    # Tashqi AI va Telegram integratsiyalari
    telegram_bot_token = models.CharField(max_length=255, blank=True, default="")
    telegram_admin_id = models.CharField(max_length=255, blank=True, default="")
    gemini_api_key = models.CharField(max_length=255, blank=True, default="")
    updated_by = models.CharField(max_length=255, blank=True, default="Super Administrator")
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj

    def to_dict(self):
        return {
            'id': self.id,
            'project_name': self.project_name or "Idrok Edu",
            'project_badge': self.project_badge or "CORE",
            'project_slogan': self.project_slogan or "Aqlli Ta'lim va Biometrik Davomat Platformasi",
            'qr_refresh_seconds': int(self.qr_refresh_seconds or 15),
            'face_id_min_confidence': int(self.face_id_min_confidence or 90),
            'default_gps_radius': int(self.default_gps_radius or 150),
            'session_timeout_minutes': int(self.session_timeout_minutes or 60),
            'is_maintenance_mode': bool(self.is_maintenance_mode),
            'maintenance_title': self.maintenance_title,
            'maintenance_message': self.maintenance_message,
            'estimated_end_time': self.estimated_end_time or "Tez orada",
            'support_phone': self.support_phone or "+998 71 200-00-00",
            'support_telegram': self.support_telegram or "@idrok_support_bot",
            'support_email': self.support_email or "support@smart-school.uz",
            'support_hours': self.support_hours or "Dushanba – Shanba, 08:00 – 20:00",
            'sms_provider': self.sms_provider or "Eskiz.uz Official Gateway",
            'sms_token': self.sms_token or "",
            'sms_template': self.sms_template or "Hurmatli ota-ona! Farzandingiz {student_name} bugun darsga kelmadi.",
            'android_min_version': self.android_min_version or "2.4.1",
            'ios_min_version': self.ios_min_version or "2.4.0",
            'force_update': bool(self.force_update),
            'telegram_bot_token': self.telegram_bot_token or "",
            'telegram_admin_id': self.telegram_admin_id or "",
            'gemini_api_key': self.gemini_api_key or "",
            'updated_by': self.updated_by or "Super Administrator",
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M') if self.updated_at else '',
        }


class SchoolConfig(models.Model):
    GROUP_TERM_CHOICES = (
        ('SINF', 'Sinf / Sinflar (Maktab standarti)'),
        ('GURUH', 'Guruh / Guruhlar (Kollej / Litsey / Markaz standarti)'),
    )
    LESSON_TERM_CHOICES = (
        ('DARS', 'Dars / Darslar (45 daqiqa)'),
        ('PARA', 'Para / Paralar (80 daqiqa)'),
    )
    STUDENT_TERM_CHOICES = (
        ('OQUVCHI', "O'quvchi / O'quvchilar"),
        ('TALABA', 'Talaba / Talabalar'),
    )
    STATUS_CHOICES = (
        ('ACTIVE', 'Faol'),
        ('SUSPENDED', "Vaqtincha to'xtatilgan (Pauza)"),
        ('BLOCKED', 'Bloklangan'),
        ('TRIAL', 'Sinov muddati (Trial)'),
        ('ARCHIVED', 'Arxivlangan'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('PAID', "To'langan"),
        ('PENDING', 'Kutilmoqda'),
        ('OVERDUE', 'Muddati o‘tgan (Qarzdorlik)'),
    )

    school_id = models.CharField(max_length=64, unique=True, db_index=True)
    school_name = models.CharField(max_length=255, default="1-sonli Ixtisoslashtirilgan Maktab-Kollej")
    institution_type = models.CharField(max_length=100, blank=True, default="Ixtisoslashtirilgan Maktab-Kollej")
    district = models.CharField(max_length=150, blank=True, default="Yunusobod tumani")
    address = models.CharField(max_length=255, blank=True, default="Amir Temur shoh ko'chasi, 14-uy")
    director_name = models.CharField(max_length=150, blank=True, default="Rahimov Jamshid")
    phone = models.CharField(max_length=50, blank=True, default="+998 71 234-56-78")
    academic_year = models.CharField(max_length=30, default="2026-2027")

    # Direktor Login va Paroli (Super Admin boshqaruvi uchun)
    admin_username = models.CharField(max_length=150, blank=True, default="")
    admin_password = models.CharField(max_length=128, blank=True, default="school123")

    # Maktab holati, to'lov holati va ogohlantirish bannerlari
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    status_reason = models.TextField(blank=True, default='') # Sababi (masalan: "Oylik abonent to'lovi to'lanmaganligi sababli to'xtatildi")
    warning_banner = models.TextField(blank=True, default='') # Maktab dashbortida ko'rinuvchi ogohlantirish
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PAID')
    debt_amount = models.CharField(max_length=50, blank=True, default="0 so'm")
    monthly_price = models.IntegerField(default=1000000)
    is_free_trial = models.BooleanField(default=False)
    trial_until_date = models.DateField(null=True, blank=True)

    # Tizim terminologiyasi va rejim sozlamalari (Sinf vs Guruh, Dars vs Para, O'quvchi vs Talaba)
    group_term = models.CharField(max_length=20, choices=GROUP_TERM_CHOICES, default='SINF')
    lesson_term = models.CharField(max_length=20, choices=LESSON_TERM_CHOICES, default='DARS')
    student_term = models.CharField(max_length=20, choices=STUDENT_TERM_CHOICES, default='OQUVCHI')

    qr_refresh_seconds = models.IntegerField(default=25)
    late_threshold_minutes = models.IntegerField(default=10)
    grading_scale = models.CharField(max_length=30, default='5_BALL')
    updated_by = models.CharField(max_length=255, blank=True, default="Maktab Ma'muriyati")
    updated_at = models.DateTimeField(auto_now=True)

    # Geolokatsiya va Xaritadagi Geometka (To'ldirish majburiy)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    location_address = models.CharField(max_length=255, blank=True, default='')
    radius_meters = models.IntegerField(default=150)

    # Dars vaqti va qo'ng'iroqlar jadvali konfiguratsiyasi (Daqiqalarda)
    lesson_duration_minutes = models.IntegerField(default=45) # Masalan: 45, 60, 80, 90 yoki erkin daqiqa (Ikkala smenada ham bir xil)
    break_duration_minutes = models.IntegerField(default=10) # Odatiy tanaffus: 5, 10, 15 daqiqa (Ikkala smenada ham bir xil)
    
    # 1-smena (Ertalabki) dars boshlanish vaqti va katta tanaffusi
    first_lesson_start_time = models.CharField(max_length=10, default="08:30") # Birinchi dars boshlanish vaqti
    big_break_after_lesson = models.IntegerField(default=0) # 0 = Yo'q, 2 = 2-darsdan keyin, 3 = 3-darsdan keyin
    big_break_duration_minutes = models.IntegerField(default=20) # Katta tanaffus / tushlik

    # 2-smena (Abeddan keyingi) dars boshlanish vaqti va katta tanaffusi
    shift2_start_time = models.CharField(max_length=10, default="13:30") # 2-smena boshlanish vaqti
    shift2_big_break_after_lesson = models.IntegerField(default=0) # 0 = Yo'q, 2 = 2-darsdan keyin, 3 = 3-darsdan keyin
    shift2_big_break_duration_minutes = models.IntegerField(default=20) # 2-smena katta tanaffus

    DEFAULT_SCHOOLS = {
        '1': {
            'school_name': "1-sonli Ixtisoslashtirilgan Maktab-Kollej",
            'institution_type': "Ixtisoslashtirilgan Maktab-Kollej",
            'district': "Yunusobod tumani",
            'director_name': "Rahimov Jamshid",
            'phone': "+998 90 123-45-67",
            'group_term': 'SINF',
            'lesson_term': 'DARS',
            'student_term': 'OQUVCHI',
            'lesson_duration_minutes': 45,
            'break_duration_minutes': 10,
            'first_lesson_start_time': "08:30",
        },
        '2': {
            'school_name': "45-sonli Umumta'lim Maktabi",
            'institution_type': "Umumta'lim maktabi",
            'district': "Chilonzor tumani",
            'director_name': "Karimova Dilnoza",
            'phone': "+998 93 456-78-90",
            'group_term': 'SINF',
            'lesson_term': 'DARS',
            'student_term': 'OQUVCHI',
            'lesson_duration_minutes': 45,
            'break_duration_minutes': 10,
            'first_lesson_start_time': "08:30",
        },
        '3': {
            'school_name': "Al-Xorazmiy nomidagi IT Maktabi",
            'institution_type': "IT Ixtisoslashtirilgan Maktab",
            'district': "Mirzo Ulug'bek tumani",
            'director_name': "Usmonov Sardor",
            'phone': "+998 99 777-88-99",
            'group_term': 'GURUH',
            'lesson_term': 'PARA',
            'student_term': 'OQUVCHI',
            'lesson_duration_minutes': 80,
            'break_duration_minutes': 10,
            'first_lesson_start_time': "08:30",
        },
        '4': {
            'school_name': "Prezident Maktabi (Toshkent)",
            'institution_type': "Prezident Maktabi",
            'district': "Yashnobod tumani",
            'director_name': "Tursunov Alisher",
            'phone': "+998 97 111-22-33",
            'group_term': 'SINF',
            'lesson_term': 'DARS',
            'student_term': 'OQUVCHI',
            'lesson_duration_minutes': 45,
            'break_duration_minutes': 10,
            'first_lesson_start_time': "08:30",
        },
    }

    @classmethod
    def get_or_create_for_school(cls, school_id, default_name=None):
        sid = str(school_id or '1').strip() or '1'
        obj = cls.objects.filter(school_id=sid).first()
        if obj:
            return obj
        preset = cls.DEFAULT_SCHOOLS.get(sid, {})
        inferred_name = default_name or preset.get('school_name')
        if not inferred_name:
            sc = SchoolClass.objects.filter(school_id=sid).first()
            u = User.objects.filter(school_id=sid).first()
            inferred_name = (sc.school_name if sc and sc.school_name else None) or (u.school_name if u and u.school_name else None) or f"{sid}-sonli Maktab"
        obj = cls.objects.create(
            school_id=sid,
            school_name=inferred_name,
            institution_type=preset.get('institution_type', "Umumta'lim maktabi"),
            district=preset.get('district', "Toshkent shahri"),
            director_name=preset.get('director_name', "Maktab Direktori"),
            phone=preset.get('phone', "+998 71 200-00-00"),
            group_term=preset.get('group_term', 'SINF'),
            lesson_term=preset.get('lesson_term', 'DARS'),
            student_term=preset.get('student_term', 'OQUVCHI'),
            lesson_duration_minutes=preset.get('lesson_duration_minutes', 45),
            break_duration_minutes=preset.get('break_duration_minutes', 10),
            first_lesson_start_time=preset.get('first_lesson_start_time', "08:30"),
        )
        return obj

    def calculate_lesson_slots(self, total_slots=7, shift=1):
        """
        Dars vaqti (lesson_duration_minutes), tanaffus (break_duration_minutes),
        va smenaga (shift 1 = ertalabki, shift 2 = tushdan keyingi) qarab
        barcha darslarning aniq boshlanish va tugash vaqtlarini hisoblab beradi.
        """
        duration = max(15, min(240, int(self.lesson_duration_minutes or 45)))
        break_min = max(0, min(120, int(self.break_duration_minutes or 10)))
        
        is_shift2 = int(shift or 1) == 2
        big_break_after = int(self.shift2_big_break_after_lesson if is_shift2 else (self.big_break_after_lesson or 0))
        big_break_min = max(break_min, min(120, int(self.shift2_big_break_duration_minutes if is_shift2 else (self.big_break_duration_minutes or 20))))
        
        start_str = str((self.shift2_start_time if is_shift2 else self.first_lesson_start_time) or ("13:30" if is_shift2 else "08:30")).strip()
        try:
            parts = start_str.split(':')
            cur_hour = int(parts[0])
            cur_min = int(parts[1])
        except Exception:
            cur_hour, cur_min = (13, 30) if is_shift2 else (8, 30)

        slots = []
        current_dt = datetime.datetime(2026, 1, 1, cur_hour, cur_min)

        for order in range(1, total_slots + 1):
            end_dt = current_dt + datetime.timedelta(minutes=duration)
            slots.append({
                'order': order,
                'start': current_dt.strftime("%H:%M"),
                'end': end_dt.strftime("%H:%M"),
                'duration_minutes': duration,
                'shift': 2 if is_shift2 else 1,
            })
            applied_break = big_break_min if (big_break_after > 0 and order == big_break_after) else break_min
            current_dt = end_dt + datetime.timedelta(minutes=applied_break)

        return slots

    def apply_timing_to_schedules(self):
        """
        Ushbu maktabdagi barcha sinflar/guruhlarning ClassSchedule yozuvlariga
        sinfning smenasiga (1 yoki 2) qarab yangilangan slot vaqtlarini
        tartib raqamiga (lesson_order) ko'ra avtomatik tatbiq qiladi.
        Bugungi Lesson yozuvlarini ham sinxronlaydi.
        """
        shift1_slots = self.calculate_lesson_slots(10, shift=1)
        shift2_slots = self.calculate_lesson_slots(10, shift=2)
        shift1_map = {s['order']: s for s in shift1_slots}
        shift2_map = {s['order']: s for s in shift2_slots}
        
        schedules = ClassSchedule.objects.filter(school_id=self.school_id).select_related('school_class')
        updated_count = 0
        for cs in schedules:
            cls_shift = getattr(cs.school_class, 'shift', 1) or 1
            slot_map = shift2_map if cls_shift == 2 else shift1_map
            if cs.lesson_order in slot_map:
                new_start = slot_map[cs.lesson_order]['start']
                new_end = slot_map[cs.lesson_order]['end']
                if cs.start_time != new_start or cs.end_time != new_end:
                    cs.start_time = new_start
                    cs.end_time = new_end
                    cs.save(update_fields=['start_time', 'end_time'])
                    updated_count += 1
        
        # Bugungi Lesson yozuvlarini ham yangilash
        today = timezone.now().date()
        today_schedules = schedules.filter(day_of_week=today.isoweekday())
        for sc in today_schedules:
            cls_shift = getattr(sc.school_class, 'shift', 1) or 1
            slot_map = shift2_map if cls_shift == 2 else shift1_map
            if sc.lesson_order in slot_map:
                try:
                    st = datetime.datetime.strptime(slot_map[sc.lesson_order]['start'], "%H:%M").time()
                    et = datetime.datetime.strptime(slot_map[sc.lesson_order]['end'], "%H:%M").time()
                    Lesson.objects.filter(
                        school_class=sc.school_class,
                        subject__name__iexact=sc.subject_name.strip(),
                        date=today
                    ).update(start_time=st, end_time=et)
                except Exception:
                    pass

        return updated_count

    def format_group_name(self, raw_name):
        base = str(raw_name or '').strip()
        if not base:
            return ''
        for suffix in [' sinf', '-sinf', ' guruh', '-guruh', ' Sinf', ' Guruh']:
            if base.lower().endswith(suffix.lower()):
                base = base[:len(base) - len(suffix)].strip()
        unit = 'guruh' if (self.group_term or 'SINF').upper() == 'GURUH' else 'sinf'
        return f"{base} {unit}"

    def sync_credentials(self):
        """
        SchoolConfig va User (role='ADMIN') o'rtasida login va parolni sinxron saqlaydi.
        """
        sid = str(self.school_id)
        uname = (self.admin_username or f"maktab{sid}").strip()
        pwd = (self.admin_password or "school123").strip()

        changed = False
        if self.admin_username != uname:
            self.admin_username = uname
            changed = True
        if self.admin_password != pwd:
            self.admin_password = pwd
            changed = True
        if changed:
            self.save(update_fields=['admin_username', 'admin_password'])

        # Maktab adminini User jadvalida topish yoki yaratish
        admin_u = User.objects.filter(school_id=sid, role='ADMIN').exclude(is_superuser=True).first()
        if not admin_u:
            admin_u = User.objects.filter(username__iexact=uname).exclude(is_superuser=True).first()

        if admin_u:
            admin_u.username = uname
            admin_u.role = 'ADMIN'
            admin_u.school_id = sid
            admin_u.school_name = self.school_name
            admin_u.raw_initial_password = pwd
            admin_u.set_password(pwd)
            admin_u.save()
        else:
            final_uname = uname
            counter = 1
            while User.objects.filter(username__iexact=final_uname).exists():
                final_uname = f"{uname}_{counter}"
                counter += 1
            if final_uname != self.admin_username:
                self.admin_username = final_uname
                self.save(update_fields=['admin_username'])

            admin_u = User.objects.create(
                username=final_uname,
                role='ADMIN',
                school_id=sid,
                school_name=self.school_name,
                raw_initial_password=pwd,
                is_staff=False,
                is_superuser=False,
            )
            admin_u.set_password(pwd)
            admin_u.save()

        return admin_u

    def get_access_info(self, client_type='DASHBOARD'):
        """
        Mijoz turiga (DASHBOARD - Maktab Admini, MOBILE - O'quvchi/Ota-ona ilovasi, DEVICE - Turniket/Face ID)
        qarab mos ma'lumot va ogohlantirish qaytaradi.
        """
        is_active = (self.status == 'ACTIVE' or self.status == 'TRIAL')
        if is_active:
            return {
                'is_allowed': True,
                'status': self.status,
                'payment_status': self.payment_status,
                'warning_banner': self.warning_banner or '',
            }

        is_debt = (self.payment_status == 'OVERDUE') or ('qarzdor' in (self.status_reason or '').lower())
        
        if client_type == 'DASHBOARD':
            # Maktab Admini (Direktor) uchun aniq, batafsil sabab
            title = "Maktab xizmatlari qarzdorlik sababli to'xtatilgan" if is_debt else (
                "Maktab xizmatlari vaqtincha to'xtatilgan (Pauza)" if self.status == 'SUSPENDED' else "Maktab bloklangan"
            )
            msg = self.status_reason or (
                f"Hurmatli maktab ma'muriyati! Tizimdan foydalanish oylik to'lovi muddati o'tganligi sababli xizmatlar vaqtincha to'xtatildi. "
                f"Qarzdorlik: {self.debt_amount or 'Mavjud'}. Iltimos, hisob-kitob bo'limi yoki Bosh administrator bilan bog'laning."
                if is_debt else "Tizim ma'muri (Super Admin) tomonidan maktab faoliyati vaqtincha to'xtatilgan."
            )
            return {
                'is_allowed': False,
                'status': self.status,
                'is_debt': is_debt,
                'debt_amount': self.debt_amount or "0 so'm",
                'title': title,
                'message': msg,
                'warning_banner': self.warning_banner or '',
                'support_phone': "+998 71 200-00-00",
            }
        else:
            # MOBIL ILOVA va QURILMALAR uchun: Ota-onalar va o'quvchilarga noqulaylik bo'lmasligi uchun neytral xabar!
            return {
                'is_allowed': False,
                'status': self.status,
                'is_debt': False,
                'title': "Xizmatlar vaqtincha to'xtatilgan",
                'message': "Maktab tizimida rejali profilaktika yoki texnik yangilanish ishlari sababli xizmatlar vaqtincha to'xtatilgan. Iltimos, ma'lumot olish uchun maktab ma'muriyati bilan bog'laning.",
                'warning_banner': '',
                'support_phone': "+998 71 200-00-00",
            }

    def to_dict(self):
        is_guruh = (self.group_term or 'SINF').upper() == 'GURUH'
        is_para = (self.lesson_term or 'DARS').upper() == 'PARA'
        is_talaba = (self.student_term or 'OQUVCHI').upper() == 'TALABA'
        return {
            'id': self.id,
            'school_id': self.school_id,
            'school_name': self.school_name,
            'institution_type': self.institution_type,
            'district': self.district,
            'address': self.address,
            'director_name': self.director_name,
            'phone': self.phone,
            'academic_year': self.academic_year,
            'admin_username': self.admin_username or f'maktab{self.school_id}',
            'admin_password': self.admin_password or 'school123',
            'username': self.admin_username or f'maktab{self.school_id}',
            'password': self.admin_password or 'school123',
            'status': self.status or 'ACTIVE',
            'status_reason': self.status_reason or '',
            'warning_banner': self.warning_banner or '',
            'payment_status': self.payment_status or 'PAID',
            'debt_amount': self.debt_amount or "0 so'm",
            'monthly_price': self.monthly_price or 1000000,
            'is_free_trial': bool(self.is_free_trial),
            'trial_until_date': self.trial_until_date.strftime('%Y-%m-%d') if self.trial_until_date else '',
            'access_info_dashboard': self.get_access_info('DASHBOARD'),
            'access_info_mobile': self.get_access_info('MOBILE'),
            'group_term': 'GURUH' if is_guruh else 'SINF',
            'lesson_term': 'PARA' if is_para else 'DARS',
            'student_term': 'TALABA' if is_talaba else 'OQUVCHI',
            'qr_refresh_seconds': self.qr_refresh_seconds or 25,
            'late_threshold_minutes': self.late_threshold_minutes or 10,
            'grading_scale': self.grading_scale or '5_BALL',
            'latitude': self.latitude,
            'longitude': self.longitude,
            'location_address': self.location_address or self.address or '',
            'radius_meters': self.radius_meters or 150,
            'is_location_set': bool(self.latitude is not None and self.longitude is not None),
            'lesson_duration_minutes': self.lesson_duration_minutes or 45,
            'break_duration_minutes': self.break_duration_minutes or 10,
            'first_lesson_start_time': self.first_lesson_start_time or "08:30",
            'big_break_after_lesson': self.big_break_after_lesson or 0,
            'big_break_duration_minutes': self.big_break_duration_minutes or 20,
            'shift2_start_time': self.shift2_start_time or "13:30",
            'shift2_big_break_after_lesson': self.shift2_big_break_after_lesson or 0,
            'shift2_big_break_duration_minutes': self.shift2_big_break_duration_minutes or 20,
            'lesson_slots': self.calculate_lesson_slots(7, shift=1),
            'shift1_lesson_slots': self.calculate_lesson_slots(7, shift=1),
            'shift2_lesson_slots': self.calculate_lesson_slots(7, shift=2),
            'updated_by': self.updated_by,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M') if self.updated_at else '',
            'labels': {
                'group_singular': 'Guruh' if is_guruh else 'Sinf',
                'group_plural': 'Guruhlar' if is_guruh else 'Sinflar',
                'my_groups': 'Guruhlarim' if is_guruh else 'Sinflarim',
                'advisor_label': 'Guruh rahbari' if is_guruh else 'Sinf rahbari',
                'no_group': 'Guruhsiz' if is_guruh else 'Sinfsiz',
                'lesson_singular': 'Para' if is_para else 'Dars',
                'lesson_plural': 'Paralar' if is_para else 'Darslar',
                'student_singular': 'Talaba' if is_talaba else "O'quvchi",
                'student_plural': 'Talabalar' if is_talaba else "O'quvchilar",
            }
        }

    def __str__(self):
        return f"{self.school_name} (#{self.school_id} - {self.group_term})"


class SchoolClass(models.Model):
    SHIFT_CHOICES = (
        (1, "1-smena (Ertalabki)"),
        (2, "2-smena (Tushdan keyingi)"),
    )
    name = models.CharField(max_length=50) # Masalan, "9-A" yoki "11-B"
    academic_year = models.CharField(max_length=20, default="2026-2027")
    school_id = models.CharField(max_length=64, db_index=True, default='1')
    school_name = models.CharField(max_length=255, blank=True, default="1-sonli Ixtisoslashtirilgan Maktab-Kollej")
    advisor_teacher = models.CharField(max_length=150, blank=True, default="")
    room_number = models.CharField(max_length=100, blank=True, default="")
    shift = models.IntegerField(default=1, choices=SHIFT_CHOICES)
    created_by = models.CharField(max_length=255, blank=True, default="Rahimov Jamshid (maktab1 — Direktor)")
    created_by_role = models.CharField(max_length=50, blank=True, default="SCHOOL_ADMIN")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.school_name})"


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    school_class = models.ForeignKey(SchoolClass, on_delete=models.SET_NULL, null=True, related_name='students')
    student_id = models.CharField(max_length=30, unique=True) # Takrorlanmas raqam

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.school_class}"


class Subject(models.Model):
    name = models.CharField(max_length=100) # Masalan: Matematika, Fizika, Informatika

    def __str__(self):
        return self.name


class Lesson(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Kutilmoqda'),
        ('ACTIVE', 'Boshlangan'),
        ('COMPLETED', 'Yakunlangan'),
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'TEACHER'})
    room_number = models.CharField(max_length=20) # Masalan: "204-xona"
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField(default=timezone.now)
    topic = models.CharField(max_length=255, blank=True, default="Kirish darsi")
    materials_url = models.TextField(blank=True, default="")
    homework_description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    def __str__(self):
        return f"{self.subject.name} - {self.school_class.name} ({self.date} {self.start_time})"


class DynamicQRToken(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @classmethod
    def generate_for_student(cls, student):
        token = secrets.token_urlsafe(24)
        sys_cfg = SystemConfig.get_solo()
        qr_sec = max(5, min(300, int(sys_cfg.qr_refresh_seconds or 15)))
        expires = timezone.now() + timezone.timedelta(seconds=qr_sec + 5)
        # Old tokens can be cleared
        cls.objects.filter(student=student).delete()
        return cls.objects.create(student=student, token=token, expires_at=expires)

    def is_valid(self):
        return timezone.now() <= self.expires_at


class Attendance(models.Model):
    STATUS_CHOICES = (
        ('PRESENT', 'Keldi'),
        ('LATE', 'Kechikdi'),
        ('ABSENT', 'Kelmadi'),
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PRESENT')
    timestamp = models.DateTimeField(default=timezone.now)
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='marked_attendances')
    is_manual = models.BooleanField(default=False)

    class Meta:
        unique_together = ('lesson', 'student')

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.lesson.subject.name} ({self.status})"


class HomeworkSubmission(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    file_attachment = models.FileField(upload_to='homeworks/', null=True, blank=True)
    text_content = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.lesson.topic}"


class Grade(models.Model):
    GRADE_TYPE_CHOICES = (
        ('ACTIVITY', 'Darsda faollik'),
        ('HOMEWORK', 'Uyga vazifa'),
        ('CONTROL', 'Nazorat ishi'),
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='grades')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grades')
    score = models.IntegerField(default=5) # 1-5 yoki 100 ball
    grade_type = models.CharField(max_length=20, choices=GRADE_TYPE_CHOICES, default='ACTIVITY')
    comment = models.TextField(blank=True, default="")
    is_starred = models.BooleanField(default=False) # A'lo bahoga ustoz yulduz berishi
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.score} ({self.grade_type})"


class ClassSchedule(models.Model):
    DAY_CHOICES = (
        (1, 'Dushanba'),
        (2, 'Seshanba'),
        (3, 'Chorshanba'),
        (4, 'Payshanba'),
        (5, 'Juma'),
        (6, 'Shanba'),
    )
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='schedules')
    school_id = models.CharField(max_length=64, db_index=True, default='1')
    day_of_week = models.IntegerField(choices=DAY_CHOICES, default=1)
    lesson_order = models.IntegerField(default=1)
    subject_name = models.CharField(max_length=150)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='teaching_schedules')
    teacher_name = models.CharField(max_length=150, blank=True, default="")
    room_number = models.CharField(max_length=50, blank=True, default="")
    start_time = models.CharField(max_length=10, default="08:30")
    end_time = models.CharField(max_length=10, default="09:15")
    topic = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['day_of_week', 'lesson_order', 'start_time']

    def __str__(self):
        return f"{self.school_class.name} | {self.get_day_of_week_display()} {self.lesson_order}-dars: {self.subject_name}"


class DeviceEventLog(models.Model):
    EVENT_TYPE_CHOICES = (
        ('ENTRY', 'KIRISH (Turniket)'),
        ('EXIT', 'CHIQISH (Turniket)'),
        ('FACE_RECOGNITION', 'Face ID Tanib Olish'),
        ('CARD_SWIPE', 'RFID Karta O\'qish'),
        ('QR_CODE', 'QR Kod Davomat'),
        ('MANUAL', 'Qo\'lda belgilash'),
    )
    STATUS_CHOICES = (
        ('SUCCESS', 'Muvaffaqiyatli'),
        ('UNKNOWN_PERSON', 'Noma\'lum shaxs'),
        ('FAILED', 'Rad etildi / Xatolik'),
        ('DUPLICATE', 'Takroriy o\'tish'),
    )

    school_id = models.CharField(max_length=64, db_index=True, default='1')
    device_name = models.CharField(max_length=150, default="Hikvision MinMoe DS-K1T673")
    device_ip = models.CharField(max_length=50, blank=True, default="192.168.1.120")
    device_serial = models.CharField(max_length=100, blank=True, default="")
    
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='device_logs')
    student_name = models.CharField(max_length=200, blank=True, default="")
    student_code = models.CharField(max_length=100, blank=True, default="")
    class_name = models.CharField(max_length=100, blank=True, default="")

    event_type = models.CharField(max_length=30, choices=EVENT_TYPE_CHOICES, default='ENTRY')
    direction = models.CharField(max_length=10, default="IN")  # 'IN' or 'OUT'
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUCCESS')
    confidence = models.FloatField(default=99.0)  # Face match %
    temperature = models.FloatField(null=True, blank=True)  # Thermal sensor C
    snapshot_url = models.TextField(blank=True, default="")
    raw_payload = models.JSONField(default=dict, blank=True)
    details = models.CharField(max_length=255, blank=True, default="")
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%H:%M:%S')}] {self.direction} - {self.student_name} ({self.device_name})"

    def to_dict(self):
        return {
            'id': self.id,
            'school_id': self.school_id,
            'device_name': self.device_name,
            'device_ip': self.device_ip,
            'device_serial': self.device_serial,
            'student_id': self.student.id if self.student else None,
            'student_name': self.student_name or (self.student.get_full_name() if self.student else "Noma'lum shaxs"),
            'student_code': self.student_code or (getattr(self.student.student_profile, 'student_id', '') if self.student and hasattr(self.student, 'student_profile') else ''),
            'class_name': self.class_name or (self.student.student_profile.school_class.name if self.student and hasattr(self.student, 'student_profile') and self.student.student_profile.school_class else ''),
            'event_type': self.event_type,
            'direction': self.direction,
            'status': self.status,
            'confidence': round(self.confidence, 1) if self.confidence else 99.0,
            'temperature': self.temperature,
            'snapshot_url': self.snapshot_url,
            'details': self.details,
            'timestamp': self.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            'time': self.timestamp.strftime("%H:%M:%S"),
            'date': self.timestamp.strftime("%Y-%m-%d"),
        }


