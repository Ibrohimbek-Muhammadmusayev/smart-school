from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import secrets

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

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"



class SchoolClass(models.Model):
    name = models.CharField(max_length=50) # Masalan, "9-A" yoki "11-B"
    academic_year = models.CharField(max_length=20, default="2026-2027")

    def __str__(self):
        return self.name


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
