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

    school_id = models.CharField(max_length=64, unique=True, db_index=True)
    school_name = models.CharField(max_length=255, default="1-sonli Ixtisoslashtirilgan Maktab-Kollej")
    institution_type = models.CharField(max_length=100, blank=True, default="Ixtisoslashtirilgan Maktab-Kollej")
    district = models.CharField(max_length=150, blank=True, default="Yunusobod tumani")
    address = models.CharField(max_length=255, blank=True, default="Amir Temur shoh ko'chasi, 14-uy")
    director_name = models.CharField(max_length=150, blank=True, default="Rahimov Jamshid")
    phone = models.CharField(max_length=50, blank=True, default="+998 71 234-56-78")
    academic_year = models.CharField(max_length=30, default="2026-2027")

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
    lesson_duration_minutes = models.IntegerField(default=45) # Masalan: 45, 60, 80, 90 yoki erkin daqiqa
    break_duration_minutes = models.IntegerField(default=10) # Tanaffus: 5, 10, 15 daqiqa
    first_lesson_start_time = models.CharField(max_length=10, default="08:30") # Birinchi dars boshlanish vaqti
    big_break_after_lesson = models.IntegerField(default=0) # 0 = Yo'q, 2 = 2-darsdan keyin, 3 = 3-darsdan keyin
    big_break_duration_minutes = models.IntegerField(default=20) # Katta tanaffus / tushlik

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

    def calculate_lesson_slots(self, total_slots=7):
        """
        Dars vaqti (lesson_duration_minutes), tanaffus (break_duration_minutes),
        katta tanaffus va birinchi dars boshlanish vaqti (first_lesson_start_time)
        asosida barcha para/darslarning aniq boshlanish va tugash vaqtlarini hisoblab beradi.
        """
        duration = max(15, min(240, int(self.lesson_duration_minutes or 45)))
        break_min = max(0, min(120, int(self.break_duration_minutes or 10)))
        big_break_after = int(self.big_break_after_lesson or 0)
        big_break_min = max(break_min, min(120, int(self.big_break_duration_minutes or 20)))
        
        start_str = str(self.first_lesson_start_time or "08:30").strip()
        try:
            parts = start_str.split(':')
            cur_hour = int(parts[0])
            cur_min = int(parts[1])
        except Exception:
            cur_hour, cur_min = 8, 30

        slots = []
        current_dt = datetime.datetime(2026, 1, 1, cur_hour, cur_min)

        for order in range(1, total_slots + 1):
            end_dt = current_dt + datetime.timedelta(minutes=duration)
            slots.append({
                'order': order,
                'start': current_dt.strftime("%H:%M"),
                'end': end_dt.strftime("%H:%M"),
                'duration_minutes': duration,
            })
            applied_break = big_break_min if (big_break_after > 0 and order == big_break_after) else break_min
            current_dt = end_dt + datetime.timedelta(minutes=applied_break)

        return slots

    def apply_timing_to_schedules(self):
        """
        Ushbu maktabdagi barcha sinflar/guruhlarning ClassSchedule yozuvlariga
        yangilangan slot vaqtlarini tartib raqamiga (lesson_order) ko'ra avtomatik tatbiq qiladi.
        Bugungi Lesson yozuvlarini ham sinxronlaydi.
        """
        slots = self.calculate_lesson_slots(10)
        slot_map = {s['order']: s for s in slots}
        
        schedules = ClassSchedule.objects.filter(school_id=self.school_id)
        updated_count = 0
        for cs in schedules:
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
            'lesson_slots': self.calculate_lesson_slots(7),
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
    name = models.CharField(max_length=50) # Masalan, "9-A" yoki "11-B"
    academic_year = models.CharField(max_length=20, default="2026-2027")
    school_id = models.CharField(max_length=64, db_index=True, default='1')
    school_name = models.CharField(max_length=255, blank=True, default="1-sonli Ixtisoslashtirilgan Maktab-Kollej")
    advisor_teacher = models.CharField(max_length=150, blank=True, default="")
    room_number = models.CharField(max_length=100, blank=True, default="")
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
        expires = timezone.now() + timezone.timedelta(seconds=25)
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

