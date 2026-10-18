from django.urls import path
from .views import (
    DeviceRegisterView, DeviceInfoView,
    SessionConnectView, SessionStatusView, SessionDisconnectView,
    SaveCanvasView, RequestSaveView, LoadCanvasView,
    TeacherSessionStatusView,
)

urlpatterns = [
    # Qurilma
    path('device/register/', DeviceRegisterView.as_view(), name='board_device_register'),
    path('device/<str:token>/', DeviceInfoView.as_view(), name='board_device_info'),
    
    # Sessiya
    path('session/connect/', SessionConnectView.as_view(), name='board_session_connect'),
    path('session/status/', SessionStatusView.as_view(), name='board_session_status'),
    path('session/<int:session_id>/disconnect/', SessionDisconnectView.as_view(), name='board_session_disconnect'),
    path('session/<int:session_id>/request-save/', RequestSaveView.as_view(), name='board_request_save'),
    
    # Canvas
    path('canvas/save/', SaveCanvasView.as_view(), name='board_canvas_save'),
    path('canvas/load/', LoadCanvasView.as_view(), name='board_canvas_load'),
    
    # Ustoz sessiya holati
    path('my-session/', TeacherSessionStatusView.as_view(), name='teacher_session_status'),
]
