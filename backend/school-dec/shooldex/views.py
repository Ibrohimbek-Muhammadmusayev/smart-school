from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import BoardDevice, BoardSession, BoardCanvas
from .serializers import BoardDeviceSerializer, BoardSessionSerializer, BoardCanvasSerializer
from api.models import User
import json


class DeviceRegisterView(views.APIView):
    """
    Doska qurilmasi birinchi marta ro'yxatdan o'tadi → token oladi.
    Electron doska APK ochilganida 1 marta chaqiriladi.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        device_name = request.data.get('device_name', 'IdrokBoard')
        # Yangi token generatsiya
        token = BoardDevice.generate_token()
        device = BoardDevice.objects.create(
            device_token=token,
            device_name=device_name
        )
        return Response({
            'device_token': device.device_token,
            'device_id': device.id,
            'message': 'Qurilma muvaffaqiyatli ro\'yxatdan o\'tdi!'
        }, status=status.HTTP_201_CREATED)


class DeviceInfoView(views.APIView):
    """
    QR kodda ko'rsatiladigan qurilma ma'lumotlari.
    GET /shooldex/device/<token>/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            device = BoardDevice.objects.get(device_token=token)
        except BoardDevice.DoesNotExist:
            return Response({'detail': 'Qurilma topilmadi.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Aktiv sessiya bormi?
        active_session = BoardSession.objects.filter(
            device=device, status='ACTIVE'
        ).first()
        
        return Response({
            'device_token': device.device_token,
            'device_name': device.device_name,
            'has_active_session': active_session is not None,
            'teacher_name': active_session.teacher.get_full_name() if active_session else None,
        })


class SessionConnectView(views.APIView):
    """
    Idrok Mobile ilovasidan ustoz IdrokBoard QR kodini skanerlaydi.
    POST /shooldex/session/connect/
    Body: { device_token, teacher_id }
    JWT token bilan (ustoz autentifikatsiyalangan bo'lishi kerak)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        device_token = request.data.get('device_token')
        
        if not device_token:
            return Response({'detail': 'device_token kiritilmadi.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            device = BoardDevice.objects.get(device_token=device_token)
        except BoardDevice.DoesNotExist:
            return Response({'detail': 'Qurilma topilmadi. QR kodni qayta skanerlang.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        teacher = request.user
        if teacher.role != 'TEACHER' and teacher.role != 'ADMIN':
            return Response({'detail': 'Faqat o\'qituvchilar doskaga ulanishi mumkin.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Oldingi sessiyalarni DISCONNECTED qilish
        BoardSession.objects.filter(
            Q(device=device) | Q(teacher=teacher),
            status='ACTIVE'
        ).update(status='DISCONNECTED')
        
        # Yangi sessiya yaratish
        session = BoardSession.objects.create(
            device=device,
            teacher=teacher,
            status='ACTIVE'
        )
        
        # Shu ustoz uchun saqlangan listlarni topish
        saved_canvases = BoardCanvas.objects.filter(teacher=teacher).values(
            'list_index', 'list_name', 'canvas_data'
        )
        
        return Response({
            'session_id': session.id,
            'teacher_name': teacher.get_full_name() or teacher.username,
            'teacher_id': teacher.id,
            'device_token': device.device_token,
            'message': f'Doska muvaffaqiyatli ulandi! Ustoz: {teacher.get_full_name()}',
            'saved_canvases': list(saved_canvases),
        })


class SessionStatusView(views.APIView):
    """
    Doska polling: Har 3 soniyada server holatini tekshiradi.
    Agar pending_command bo'lsa, doska uni bajaradi.
    GET /shooldex/session/status/?token=<device_token>
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        device_token = request.query_params.get('token')
        if not device_token:
            return Response({'detail': 'token parametri kerak.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            device = BoardDevice.objects.get(device_token=device_token)
        except BoardDevice.DoesNotExist:
            return Response({'detail': 'Qurilma topilmadi.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Aktiv sessiyani topish
        session = BoardSession.objects.filter(
            device=device, status='ACTIVE'
        ).select_related('teacher').first()
        
        if not session:
            return Response({
                'status': 'WAITING',
                'message': 'Ustoz ulanishini kuting...',
                'session': None,
                'teacher': None,
                'saved_canvases': [],
                'pending_command': None,
            })
        
        # Saqlangan listlarni topish
        saved_canvases = list(BoardCanvas.objects.filter(
            teacher=session.teacher
        ).values('list_index', 'list_name', 'canvas_data'))
        
        pending_cmd = session.pending_command
        
        return Response({
            'status': 'CONNECTED',
            'session_id': session.id,
            'teacher': {
                'id': session.teacher.id,
                'name': session.teacher.get_full_name() or session.teacher.username,
            },
            'saved_canvases': saved_canvases,
            'pending_command': pending_cmd,
        })


class SessionDisconnectView(views.APIView):
    """
    Sessiyani uzish (telefon yoki doska tomonidan).
    POST /shooldex/session/<session_id>/disconnect/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = BoardSession.objects.get(id=session_id)
        except BoardSession.DoesNotExist:
            return Response({'detail': 'Sessiya topilmadi.'}, status=status.HTTP_404_NOT_FOUND)
        
        session.status = 'DISCONNECTED'
        session.pending_command = {'type': 'DISCONNECT'}  # Doskaga uzilish buyrug'i
        session.save()
        
        return Response({'message': 'Sessiya uzildi. Doska QR kod holatiga qaytdi.'})


class SaveCanvasView(views.APIView):
    """
    Doska ma'lumotlarini saqlash.
    Bu endpoint 2 xil holatda ishlatiladi:
    1. Telefon 'Saqlash' bosadi → server doskaga GET_CANVAS buyrug'i yuboradi
    2. Doska ma'lumotlarni serverga yuboradi → server saqlaydi
    
    POST /shooldex/canvas/save/
    Body: { session_id, canvases: [{list_index, list_name, canvas_data}] }
    """
    permission_classes = [permissions.AllowAny]  # Doska JWT yo'q, token bilan ishlaydi

    def post(self, request):
        session_id = request.data.get('session_id')
        device_token = request.data.get('device_token')
        canvases = request.data.get('canvases', [])
        
        # Session topish
        session = None
        if session_id:
            try:
                session = BoardSession.objects.get(id=session_id, status='ACTIVE')
            except BoardSession.DoesNotExist:
                pass
        elif device_token:
            try:
                device = BoardDevice.objects.get(device_token=device_token)
                session = BoardSession.objects.filter(device=device, status='ACTIVE').first()
            except BoardDevice.DoesNotExist:
                pass
        
        if not session:
            return Response({'detail': 'Aktiv sessiya topilmadi.'}, status=status.HTTP_404_NOT_FOUND)
        
        teacher = session.teacher
        saved_count = 0
        
        for canvas_data in canvases:
            list_index = canvas_data.get('list_index', 0)
            list_name = canvas_data.get('list_name', f'List {list_index + 1}')
            data = canvas_data.get('canvas_data', '')
            
            BoardCanvas.objects.update_or_create(
                teacher=teacher,
                list_index=list_index,
                defaults={
                    'session': session,
                    'list_name': list_name,
                    'canvas_data': data if isinstance(data, str) else json.dumps(data),
                }
            )
            saved_count += 1
        
        # Pending commandni tozalash
        session.pending_command = None
        session.save()
        
        return Response({
            'message': f'{saved_count} ta list muvaffaqiyatli saqlandi!',
            'saved_count': saved_count,
        })


class RequestSaveView(views.APIView):
    """
    Telefon 'Saqlash' tugmasini bosadi → server doskaga buyruq yuboradi.
    Doska polling orqali buni ko'radi va canvas ma'lumotlarini serverga POST qiladi.
    POST /shooldex/session/<session_id>/request-save/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = BoardSession.objects.get(id=session_id, status='ACTIVE')
        except BoardSession.DoesNotExist:
            return Response({'detail': 'Aktiv sessiya topilmadi.'}, status=status.HTTP_404_NOT_FOUND)
        
        if session.teacher != request.user:
            return Response({'detail': 'Bu sessiya sizga tegishli emas.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Doskaga GET_CANVAS buyrug'i yuborish
        session.pending_command = {'type': 'SAVE_CANVAS', 'requested_at': timezone.now().isoformat()}
        session.save()
        
        return Response({'message': "Saqlash buyrug'i doskaga yuborildi. Doska javob berishi kutilmoqda..."})


class LoadCanvasView(views.APIView):
    """
    Saqlangan doskani yuklash (ustoz yoki qurilma uchun).
    GET /shooldex/canvas/load/?teacher_id=<id>
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        teacher_id = request.query_params.get('teacher_id')
        if not teacher_id:
            return Response({'detail': 'teacher_id kerak.'}, status=status.HTTP_400_BAD_REQUEST)
        
        canvases = BoardCanvas.objects.filter(teacher_id=teacher_id).values(
            'list_index', 'list_name', 'canvas_data', 'updated_at'
        )
        return Response(list(canvases))


class TeacherSessionStatusView(views.APIView):
    """
    Telefon uchun: O'z sessiyasining holatini tekshirish.
    GET /shooldex/my-session/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        session = BoardSession.objects.filter(
            teacher=request.user, status='ACTIVE'
        ).select_related('device').first()
        
        if not session:
            return Response({'status': 'NO_SESSION', 'session': None})
        
        return Response({
            'status': 'ACTIVE',
            'session_id': session.id,
            'device_token': session.device.device_token,
            'device_name': session.device.device_name,
            'created_at': session.created_at,
        })
