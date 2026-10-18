from django.db import models
from api.models import User
import secrets
import uuid


class BoardDevice(models.Model):
    """Electron doska qurilmasi"""
    device_token = models.CharField(max_length=64, unique=True)  # QR kodda ko'rsatiladigan token
    device_name = models.CharField(max_length=100, default='Smart Board')
    gemini_api_key = models.CharField(max_length=200, blank=True, default='')  # Qurilmada saqlangan API key
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    @classmethod
    def generate_token(cls):
        return secrets.token_urlsafe(32)

    def __str__(self):
        return f"Board {self.device_name} ({self.device_token[:8]}...)"


class BoardSession(models.Model):
    """Ustoz va qurilma o'rtasidagi aktiv sessiya"""
    STATUS_CHOICES = [
        ('ACTIVE', 'Ulangan'),
        ('DISCONNECTED', 'Uzilgan'),
    ]
    device = models.ForeignKey(BoardDevice, on_delete=models.CASCADE, related_name='sessions')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='board_sessions',
                                limit_choices_to={'role': 'TEACHER'})
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Server → Doska buyrug'i (qisqa muddatli)
    pending_command = models.JSONField(null=True, blank=True)  # {'type': 'GET_CANVAS', 'list_id': 1}
    command_response = models.JSONField(null=True, blank=True)  # Doska javob yuboradi

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.teacher.get_full_name()} ↔ {self.device} ({self.status})"


class BoardCanvas(models.Model):
    """Har bir list uchun saqlangan doska ma'lumoti"""
    session = models.ForeignKey(BoardSession, on_delete=models.CASCADE, related_name='canvases')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='board_canvases')
    list_index = models.IntegerField(default=0)  # 0 = 1-list, 1 = 2-list ...
    list_name = models.CharField(max_length=100, default='List 1')
    canvas_data = models.TextField()  # JSON string: chiziqlar, nuqtalar
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('teacher', 'list_index')
        ordering = ['list_index']

    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.list_name}"
