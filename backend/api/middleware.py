import json
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .models import SystemConfig, SchoolConfig

class MaintenanceAndSchoolStatusMiddleware(MiddlewareMixin):
    """
    1. Tizim miqyosidagi Texnik Ishlar Rejimi (Global Maintenance Mode)
    2. Maktab miqyosidagi to'xtatish / bloklash / qarzdorlik tekshiruvi (School Status Gate)
    
    Super Admin hech qachon bloklanmaydi.
    Barcha boshqa foydalanuvchilar, maktab dashbortlari, mobil ilovalar va qurilmalar
    tegishli tushunarli xabar bilan qulflanadi.
    """

    WHITELIST_PATHS = [
        '/admin/',
        '/api/system-config/',
        '/api/school-config/status/',
        '/static/',
        '/media/',
        '/favicon.ico',
    ]

    def _is_super_admin(self, request):
        # 1. Django superuser / staff
        if getattr(request, 'user', None) and getattr(request.user, 'is_authenticated', False):
            if request.user.is_superuser or request.user.is_staff:
                return True
            if getattr(request.user, 'role', '') == 'ADMIN' and getattr(request.user, 'school_id', '') in ('superadmin', '0', ''):
                return True

        # 2. Maxsus headerlar (Frontend Super Admin paneli yuboradigan)
        role_header = (request.headers.get('X-User-Role') or request.headers.get('X-Role') or '').upper()
        if role_header in ('SUPER_ADMIN', 'SUPERADMIN'):
            return True
        if request.headers.get('X-Super-Admin') in ('1', 'true', 'True'):
            return True

        # 3. Query param or session
        if request.GET.get('as_super_admin') == '1':
            return True

        return False

    def process_request(self, request):
        path = request.path

        # 1. Oq ro'yxatdagi manzillar tekshirilmaydi
        for wp in self.WHITELIST_PATHS:
            if path.startswith(wp):
                return None

        # 2. Super Admin har qanday holatda to'liq ruxsatga ega
        if self._is_super_admin(request):
            return None

        # -------------------------------------------------------------
        # 3. GLOBAL TEXNIK ISHLAR REJIMI (Global Maintenance Mode)
        # -------------------------------------------------------------
        try:
            sys_cfg = SystemConfig.get_solo()
            if sys_cfg.is_maintenance_mode:
                return JsonResponse({
                    'maintenance': True,
                    'scope': 'GLOBAL',
                    'title': sys_cfg.maintenance_title,
                    'message': sys_cfg.maintenance_message,
                    'estimated_end': sys_cfg.estimated_end_time or "Tez orada",
                    'support_phone': sys_cfg.support_phone or "+998 71 200-00-00",
                    'support_email': sys_cfg.support_email or "support@smart-school.uz",
                    'detail': sys_cfg.maintenance_message,
                }, status=503)
        except Exception:
            # Agar baza migratsiyasi payti yoki favqulodda holat bo'lsa o'tkazib yuborish
            pass

        # -------------------------------------------------------------
        # 4. MAKTAB MIQYOSIDAGI BLOKLASH / TO'XTATISH / QARZDORLIK
        # -------------------------------------------------------------
        # Maktab ID sini aniqlash
        school_id = request.headers.get('X-School-Id') or request.GET.get('school_id')
        if not school_id and getattr(request, 'user', None) and getattr(request.user, 'is_authenticated', False):
            school_id = getattr(request.user, 'school_id', None)

        if school_id and str(school_id) not in ('superadmin', '0', ''):
            try:
                school_cfg = SchoolConfig.objects.filter(school_id=str(school_id)).first()
                if school_cfg and school_cfg.status in ('SUSPENDED', 'BLOCKED', 'ARCHIVED'):
                    # Faqat maktab sozlamalarini ko'rish va status tekshirishga ruxsat (read-only info uchun)
                    if path.endswith('/access-status/') or path.endswith('/school-config/'):
                        return None

                    client_type = (request.headers.get('X-Client-Type') or 'DASHBOARD').upper()
                    access_info = school_cfg.get_access_info(client_type=client_type)

                    return JsonResponse({
                        'school_blocked': True,
                        'school_id': school_cfg.school_id,
                        'school_name': school_cfg.school_name,
                        'status': school_cfg.status,
                        'access_info': access_info,
                        'title': access_info.get('title'),
                        'message': access_info.get('message'),
                        'detail': access_info.get('message'),
                        'warning_banner': access_info.get('warning_banner', ''),
                    }, status=403)
            except Exception:
                pass

        return None
