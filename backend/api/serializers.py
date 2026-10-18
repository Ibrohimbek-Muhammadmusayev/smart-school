from rest_framework import serializers
from .models import User, SchoolClass, StudentProfile, Subject, Lesson, DynamicQRToken, Attendance, Grade, HomeworkSubmission

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'role', 'passport_series',
            'photo_3x4', 'can_manage_passwords', 'parent_phone', 'parent_telegram_chat_id',
            'raw_initial_password', 'stars_count',
            'school_id', 'school_name', 'created_by', 'created_by_role',
            'teacher_subject', 'teacher_group', 'teacher_rooms', 'phone_number', 'date_joined',
        ]
        extra_kwargs = {'raw_initial_password': {'read_only': True}}


class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_name = serializers.CharField(source='school_class.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'subject', 'subject_name', 'school_class', 'class_name', 'teacher', 
                  'teacher_name', 'room_number', 'start_time', 'end_time', 'date', 
                  'topic', 'materials_url', 'homework_description', 'status']


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    passport_series = serializers.CharField(source='student.passport_series', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'lesson', 'student', 'student_name', 'passport_series', 'status', 'timestamp', 'is_manual']


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='lesson.subject.name', read_only=True)
    topic = serializers.CharField(source='lesson.topic', read_only=True)
    date = serializers.DateField(source='lesson.date', read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'lesson', 'student', 'student_name', 'subject_name', 'topic', 'date', 'score', 'grade_type', 'comment', 'is_starred', 'created_at']


class HomeworkSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeworkSubmission
        fields = '__all__'
