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

    # 2. Sinflar
    class_9a, _ = SchoolClass.objects.get_or_create(name='9-A')
    class_9b, _ = SchoolClass.objects.get_or_create(name='9-B')

    # 3. Fanlar
    math, _ = Subject.objects.get_or_create(name='Matematika')
    physics, _ = Subject.objects.get_or_create(name='Fizika')
    it, _ = Subject.objects.get_or_create(name='Informatika')

    # 4. Ustoz (Teacher - Admin Huquqi bilan)
    teacher, _ = User.objects.get_or_create(
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
    teacher.set_password('teacher123')
    teacher.can_manage_passwords = True
    teacher.save()

    # 5. O'quvchilar
    students_data = [
        ('Aliyev', 'Vali', 'AA 1234567', 'pass123', '998901112233', '123456789'),
        ('Karimova', 'Zilola', 'AA 7654321', 'pass123', '998902223344', '987654321'),
        ('Toshmatov', 'Sardor', 'AB 9988776', 'pass123', '998903334455', '555666777'),
    ]

    for last, first, passport, raw_pwd, phone, tg_id in students_data:
        uname = passport.replace(' ', '').lower()
        st_user, _ = User.objects.get_or_create(
            username=uname,
            defaults={
                'role': 'STUDENT',
                'first_name': first,
                'last_name': last,
                'passport_series': passport,
                'raw_initial_password': raw_pwd,
                'parent_phone': phone,
                'parent_telegram_chat_id': tg_id
            }
        )
        st_user.set_password(raw_pwd)
        st_user.raw_initial_password = raw_pwd
        st_user.save()
        
        StudentProfile.objects.get_or_create(
            user=st_user,
            defaults={'school_class': class_9a, 'student_id': f"STU-{st_user.id}"}
        )

    # 6. Bugungi Darslar
    today = timezone.now().date()
    l1, _ = Lesson.objects.get_or_create(
        subject=math,
        school_class=class_9a,
        teacher=teacher,
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
        teacher=teacher,
        date=today,
        start_time=time(9, 25),
        end_time=time(10, 10),
        defaults={
            'room_number': '204-laboratoriya',
            'topic': 'Nyutonning ikkinchi qonuni',
            'status': 'PENDING'
        }
    )

    print("[OK] Baza boshlang'ich ma'lumotlar bilan to'ldirildi!")
    print("O'quvchi: Passport: 'AA 1234567' / Parol: 'pass123'")
    print("O'qituvchi: Passport: 'AB 1122334' / Parol: 'teacher123'")
    print("Admin: 'admin' / 'admin123'")

if __name__ == '__main__':
    seed()
