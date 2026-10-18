from rest_framework import serializers
from .models import BoardDevice, BoardSession, BoardCanvas


class BoardDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardDevice
        fields = ['id', 'device_token', 'device_name', 'created_at']


class BoardSessionSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    device_token = serializers.SerializerMethodField()

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.username

    def get_device_token(self, obj):
        return obj.device.device_token

    class Meta:
        model = BoardSession
        fields = ['id', 'teacher_name', 'device_token', 'status', 'created_at', 'pending_command']


class BoardCanvasSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardCanvas
        fields = ['id', 'list_index', 'list_name', 'canvas_data', 'updated_at']
