from django.urls import path
from .views import (PassportLoginView, FaceIdVerifyView, GenerateDynamicQRView, 
                    ScanAttendanceView, TodayLessonsView, LessonRoomView, 
                    SubmitHomeworkView, TeacherLiveLessonSummaryView, AddGradeView, 
                    TeacherManagePasswordsView, GradesListView, FinishAttendanceView, CompleteLessonView,
                    SchoolClassesListView, StudentManagementView)

urlpatterns = [
    path('auth/passport-login/', PassportLoginView.as_view(), name='passport_login'),
    path('auth/face-verify/', FaceIdVerifyView.as_view(), name='face_verify'),
    path('qr/generate/', GenerateDynamicQRView.as_view(), name='generate_qr'),
    path('attendance/scan/', ScanAttendanceView.as_view(), name='scan_attendance'),
    path('lessons/today/', TodayLessonsView.as_view(), name='today_lessons'),
    path('lessons/<int:lesson_id>/room/', LessonRoomView.as_view(), name='lesson_room'),
    path('lessons/<int:lesson_id>/finish-attendance/', FinishAttendanceView.as_view(), name='finish_attendance'),
    path('lessons/<int:lesson_id>/complete/', CompleteLessonView.as_view(), name='complete_lesson'),
    path('lessons/<int:lesson_id>/homework/', SubmitHomeworkView.as_view(), name='submit_homework'),
    path('lessons/<int:lesson_id>/teacher-summary/', TeacherLiveLessonSummaryView.as_view(), name='teacher_summary'),
    path('grades/add/', AddGradeView.as_view(), name='add_grade'),
    path('grades/my/', GradesListView.as_view(), name='my_grades'),
    path('teacher/manage-passwords/', TeacherManagePasswordsView.as_view(), name='manage_passwords'),
    path('classes/', SchoolClassesListView.as_view(), name='school_classes'),
    path('students/', StudentManagementView.as_view(), name='student_management'),
]
