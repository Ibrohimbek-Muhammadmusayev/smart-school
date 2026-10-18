import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User, SchoolClass, Subject, Lesson, StudentProfile
from django.utils import timezone
from datetime import time

def seed():
    # 1. Admin
    admin, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'role': 'ADMIN',
            'first_name': 'Maktab',
            'last_name': 'Direktori',
            'passport_series': 'AD 0000001',
            'is_staff': True,
            'is_superuser': True
        }
    )
    admin.set_password('admin123')
    admin.save()

    # 2. Sinflar / Guruhlar
    class_9a, _ = SchoolClass.objects.get_or_create(name='9-A', defaults={'academic_year': '2026-2027'})
    class_9b, _ = SchoolClass.objects.get_or_create(name='9-B', defaults={'academic_year': '2026-2027'})
    class_10a, _ = SchoolClass.objects.get_or_create(name='10-A', defaults={'academic_year': '2026-2027'})
    class_11a, _ = SchoolClass.objects.get_or_create(name='11-A', defaults={'academic_year': '2026-2027'})

    # 3. Fanlar
    math, _ = Subject.objects.get_or_create(name='Matematika')
    physics, _ = Subject.objects.get_or_create(name='Fizika')
    it, _ = Subject.objects.get_or_create(name='Informatika')
    english, _ = Subject.objects.get_or_create(name='Ingliz tili')
    chemistry, _ = Subject.objects.get_or_create(name='Kimyo')

    # 4. Ustozlar
    teacher1, _ = User.objects.get_or_create(
        username='teacher1',
        defaults={
            'role': 'TEACHER',
            'first_name': 'Akmal',
            'last_name': 'Rahimov',
            'passport_series': 'AB 1122334',
            'can_manage_passwords': True,
            'raw_initial_password': 'teacher123'
        }
    )
    teacher1.set_password('teacher123')
    teacher1.can_manage_passwords = True
    teacher1.save()

    teacher2, _ = User.objects.get_or_create(
        username='teacher2',
        defaults={
            'role': 'TEACHER',
            'first_name': 'Nodira',
            'last_name': 'Samadova',
            'passport_series': 'AB 5566778',
            'can_manage_passwords': True,
            'raw_initial_password': 'teacher123'
        }
    )
    teacher2.set_password('teacher123')
    teacher2.save()

    # 5. O'quvchilar ro'yxati (Asosiy talaba: 23089 - Ibrohimbek Muhammadmusayev va boshqalar)
    students_data = [
        # (ID, familiya, ism, pasport, parol, sinf, telefon)
        ('23089', 'Muhammadmusayev', 'Ibrohimbek', 'AA 2308901', 'pass123', class_9a, '998901234567'),
        ('65167', 'Aliyev', 'Vali', 'AA 1234567', 'pass123', class_9a, '998901112233'),
        ('42414', 'Karimova', 'Zilola', 'AA 7654321', 'pass123', class_9a, '998902223344'),
        ('81828', 'Toshmatov', 'Sardor', 'AB 9988776', 'pass123', class_9a, '998903334455'),
        ('12431', 'Sobirova', 'Fotima', 'AB 3344556', 'pass123', class_9a, '998904445566'),
        ('55120', 'Husanov', 'Hasan', 'AC 1020304', 'pass123', class_9b, '998905556677'),
        ('77301', 'Ergasheva', 'Madina', 'AC 4050607', 'pass123', class_9b, '998906667788'),
        ('33190', 'Qodirov', 'Jasur', 'AD 7080901', 'pass123', class_10a, '998907778899'),
        ('99204', 'Yusupova', 'Shahzoda', 'AD 9010203', 'pass123', class_10a, '998908889900'),
        ('64152', 'Norboyev', 'Bobur', 'AE 1133557', 'pass123', class_11a, '998909990011'),
        ('88419', 'Mirzayeva', 'Rayhona', 'AE 2244668', 'pass123', class_11a, '998901011122'),
    ]

    for st_id, last, first, passport, raw_pwd, s_class, phone in students_data:
        st_user, _ = User.objects.get_or_create(
            username=st_id,
            defaults={
                'role': 'STUDENT',
                'first_name': first,
                'last_name': last,
                'passport_series': passport,
                'raw_initial_password': raw_pwd,
                'parent_phone': phone,
                'parent_telegram_chat_id': f"tg_{st_id}"
            }
        )
        st_user.set_password(raw_pwd)
        st_user.raw_initial_password = raw_pwd
        st_user.save()

        sp, _ = StudentProfile.objects.get_or_create(
            user=st_user,
            defaults={'school_class': s_class, 'student_id': st_id}
        )
        sp.school_class = s_class
        sp.student_id = st_id
        sp.save()

    # 6. Bugungi Darslar
    today = timezone.now().date()
    l1, _ = Lesson.objects.get_or_create(
        subject=math,
        school_class=class_9a,
        teacher=teacher1,
        date=today,
        start_time=time(8, 30),
        end_time=time(9, 15),
        defaults={
            'room_number': '302-xona',
            'topic': 'Kvadrat tenglamalar va diskriminant formulasi',
            'status': 'ACTIVE',
            'homework_description': 'Darslikdagi 45-48 mashqlarni yechish va formulalarni yodlash.'
        }
    )
    l1.status = 'ACTIVE'
    l1.save()

    l2, _ = Lesson.objects.get_or_create(
        subject=physics,
        school_class=class_9a,
        teacher=teacher1,
        date=today,
        start_time=time(9, 25),
        end_time=time(10, 10),
        defaults={
            'room_number': '204-laboratoriya',
            'topic': 'Nyutonning ikkinchi qonuni',
            'status': 'PENDING'
        }
    )

    l3, _ = Lesson.objects.get_or_create(
        subject=it,
        school_class=class_9a,
        teacher=teacher2,
        date=today,
        start_time=time(10, 20),
        end_time=time(11, 5),
        defaults={
            'room_number': '105-kompyuter zali',
            'topic': 'Python dasturlash asoslari va sikllar',
            'status': 'PENDING'
        }
    )

    print(f"[OK] Baza {len(students_data)} ta yangi o'quvchi va darslar bilan to'ldirildi!")

if __name__ == '__main__':
    seed()
