"""
Idrok Vision — Hikvision MinMoe (DS-K1T673 va boshqa modellar) Terminal Sinxronizatsiya Moduli
Hikvision ISAPI protokoli orqali o'quvchilar profili (ID, F.I.SH) va yuz rasmlarini
terminalga avtomatik yuklash va yangilash.
"""

import os
import json
import logging
import datetime
import xml.etree.ElementTree as ET
from urllib.parse import urljoin
import requests
from requests.auth import HTTPDigestAuth
from django.conf import settings
from django.utils import timezone
from .models import User, StudentProfile

logger = logging.getLogger(__name__)


class HikvisionISAPIClient:
    """
    Hikvision Access Control va MinMoe Face Recognition terminallari bilan
    ISAPI REST protokoli orqali ishlovchi mijoz (Client).
    """

    def __init__(self, host="192.168.1.120", port=80, username="admin", password="password", timeout=8, use_https=False):
        self.host = str(host).strip()
        self.port = int(port or 80)
        self.username = str(username).strip()
        self.password = str(password).strip()
        self.timeout = int(timeout or 8)
        self.use_https = bool(use_https)

        schema = "https" if self.use_https else "http"
        self.base_url = f"{schema}://{self.host}:{self.port}"
        self.auth = HTTPDigestAuth(self.username, self.password)

    def _parse_response(self, response):
        """
        Hikvision ISAPI javobini (JSON yoki XML) tahlil qilish va umumiy lug'atga aylantirish.
        """
        content_type = response.headers.get('Content-Type', '').lower()
        text = response.text.strip()

        # 1. Agar JSON formatida bo'lsa
        if 'json' in content_type or text.startswith('{'):
            try:
                data = json.loads(text)
                status_code = data.get('statusCode') or data.get('code')
                sub_status = data.get('subStatusCode') or ''
                status_str = data.get('statusString') or data.get('errorMsg') or ''
                is_ok = status_code == 1 or sub_status.lower() in ['ok', 'success']
                return {
                    'success': is_ok,
                    'status_code': status_code,
                    'sub_status': sub_status,
                    'message': status_str or ('Muvaffaqiyatli' if is_ok else 'Xatolik'),
                    'raw': data,
                    'format': 'json'
                }
            except Exception:
                pass

        # 2. Agar XML formatida bo'lsa (ba'zi eski proshivkalar xatolikni XML qaytaradi)
        if '<ResponseStatus' in text or text.startswith('<'):
            try:
                root = ET.fromstring(text)
                # Hikvision XML namespace ni hisobga olish
                def get_tag_val(tag_name):
                    for el in root.iter():
                        if el.tag.endswith(tag_name):
                            return el.text
                    return None

                status_code = get_tag_val('statusCode')
                sub_status = get_tag_val('subStatusCode') or ''
                status_str = get_tag_val('statusString') or ''

                is_ok = status_code == '1' or sub_status.lower() in ['ok', 'success']
                return {
                    'success': is_ok,
                    'status_code': int(status_code) if status_code and status_code.isdigit() else status_code,
                    'sub_status': sub_status,
                    'message': status_str or ('Muvaffaqiyatli' if is_ok else 'Xatolik'),
                    'raw': text,
                    'format': 'xml'
                }
            except Exception:
                pass

        # 3. Oddiy matn yoki HTTP status
        is_ok = 200 <= response.status_code < 300
        return {
            'success': is_ok,
            'status_code': response.status_code,
            'sub_status': '',
            'message': text or response.reason,
            'raw': text,
            'format': 'text'
        }

    def test_connection(self):
        """
        Terminal bilan aloqani tekshirish: /ISAPI/System/deviceInfo
        Model, seriya raqami va proshivka versiyasini qaytaradi.
        """
        endpoint = f"{self.base_url}/ISAPI/System/deviceInfo"
        try:
            res = requests.get(endpoint, auth=self.auth, timeout=self.timeout)
            parsed = self._parse_response(res)
            
            if res.status_code == 401:
                return {
                    'success': False,
                    'connected': False,
                    'message': "Autentifikatsiya xatosi: Hikvision admin login yoki paroli noto'g'ri (401 Unauthorized)",
                    'host': self.host,
                }

            device_info = {}
            if parsed['format'] == 'json' and isinstance(parsed.get('raw'), dict):
                info = parsed['raw'].get('DeviceInfo', parsed['raw'])
                device_info = {
                    'device_name': info.get('deviceName', 'Hikvision MinMoe Terminal'),
                    'model': info.get('model', 'DS-K1T673'),
                    'serial_number': info.get('serialNumber', ''),
                    'firmware_version': info.get('firmwareVersion', ''),
                }
            elif parsed['format'] == 'xml':
                try:
                    root = ET.fromstring(parsed['raw'])
                    def find_val(name):
                        for el in root.iter():
                            if el.tag.endswith(name):
                                return el.text
                        return None
                    device_info = {
                        'device_name': find_val('deviceName') or 'Hikvision MinMoe Terminal',
                        'model': find_val('model') or 'DS-K1T673',
                        'serial_number': find_val('serialNumber') or '',
                        'firmware_version': find_val('firmwareVersion') or '',
                    }
                except Exception:
                    pass

            return {
                'success': True,
                'connected': True,
                'message': f"Hikvision terminaliga muvaffaqiyatli ulandi ({device_info.get('model', 'DS-K1T673')})",
                'device_info': device_info,
                'host': self.host,
            }
        except requests.exceptions.ConnectTimeout:
            return {
                'success': False,
                'connected': False,
                'message': f"Aloqa vaqti tugadi (Timeout): {self.host} manzilidagi terminal javob bermadi",
                'host': self.host,
            }
        except requests.exceptions.ConnectionError:
            return {
                'success': False,
                'connected': False,
                'message': f"Ulanib bo'lmadi: {self.host}:{self.port} tarmoqda topilmadi yoki o'chirilgan",
                'host': self.host,
            }
        except Exception as e:
            return {
                'success': False,
                'connected': False,
                'message': f"Xatolik yuz berdi: {str(e)}",
                'host': self.host,
            }

    def sync_user_profile(self, employee_no, name, valid_from=None, valid_to=None):
        """
        O'quvchi profilini yaratish yoki yangilash:
        1. Avval POST /ISAPI/AccessControl/UserInfo/Record?format=json orqali yaratishga urinadi.
        2. Agar o'quvchi oldin mavjud bo'lsa (employeeNoAlreadyExist), PUT /ISAPI/AccessControl/UserInfo/Modify?format=json orqali yangilaydi.
        """
        now = timezone.now()
        begin_str = valid_from or now.strftime("%Y-%m-%dT00:00:00")
        end_str = valid_to or (now + datetime.timedelta(days=365 * 4)).strftime("%Y-%m-%dT23:59:59")

        user_info_payload = {
            "UserInfo": {
                "employeeNo": str(employee_no).strip(),
                "name": str(name).strip()[:32], # Hikvision 32 belgidan oshmasligi kerak
                "userType": "normal",
                "closeDelayEnabled": False,
                "Valid": {
                    "enable": True,
                    "beginTime": begin_str,
                    "endTime": end_str,
                    "timeType": "local"
                },
                "doorRight": "1",
                "RightPlan": [
                    {
                        "doorNo": 1,
                        "planTemplateNo": "1"
                    }
                ]
            }
        }

        # 1. Yaratish (POST)
        post_endpoint = f"{self.base_url}/ISAPI/AccessControl/UserInfo/Record?format=json"
        try:
            res = requests.post(
                post_endpoint,
                auth=self.auth,
                json=user_info_payload,
                timeout=self.timeout
            )
            parsed = self._parse_response(res)

            if parsed['success']:
                return {
                    'success': True,
                    'action': 'created',
                    'message': f"O'quvchi ({employee_no} - {name}) terminalda yangi yaratildi ✅",
                    'details': parsed
                }

            # 2. Agar foydalanuvchi oldin qo'shilgan bo'lsa -> Yangilash (PUT)
            sub_status = str(parsed.get('sub_status', '')).lower()
            raw_msg = str(parsed.get('message', '')).lower()
            if 'exist' in sub_status or 'exist' in raw_msg or parsed.get('status_code') == 4:
                put_endpoint = f"{self.base_url}/ISAPI/AccessControl/UserInfo/Modify?format=json"
                put_res = requests.put(
                    put_endpoint,
                    auth=self.auth,
                    json=user_info_payload,
                    timeout=self.timeout
                )
                put_parsed = self._parse_response(put_res)
                if put_parsed['success']:
                    return {
                        'success': True,
                        'action': 'updated',
                        'message': f"O'quvchi ({employee_no} - {name}) terminalda yangilandi (Modify) 🔄",
                        'details': put_parsed
                    }
                else:
                    return {
                        'success': False,
                        'action': 'modify_failed',
                        'message': f"Mavjud o'quvchini yangilashda xatolik: {put_parsed['message']}",
                        'details': put_parsed
                    }

            return {
                'success': False,
                'action': 'create_failed',
                'message': f"O'quvchi yaratishda terminal xatosi: {parsed['message']}",
                'details': parsed
            }

        except Exception as e:
            return {
                'success': False,
                'action': 'network_error',
                'message': f"Terminalga so'rov yuborishda xatolik: {str(e)}"
            }

    def upload_face_picture(self, employee_no, image_bytes=None, image_path=None, face_url=None):
        """
        O'quvchining yuz rasmini terminalga biriktirish:
        Endpoint: POST /ISAPI/Intelligent/FDLib/FaceDataRecord?format=json
        Multipart/form-data orqali FaceDataRecord (JSON) + img (JPEG bytes).
        Terminal yuz modeli (Face Feature / Embeddings) ni o'zida hisoblab saqlaydi.
        """
        endpoint = f"{self.base_url}/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json"
        fd_record = {
            "faceLibType": "blackFD",
            "FDID": "1",
            "FPID": str(employee_no).strip() # FPID = employeeNo
        }

        # Agar FaceURL ko'rsatilgan bo'lsa
        if face_url and not image_bytes and not image_path:
            fd_record["faceURL"] = face_url
            try:
                res = requests.post(endpoint, auth=self.auth, json={"FaceDataRecord": fd_record}, timeout=self.timeout)
                return self._parse_response(res)
            except Exception as e:
                return {'success': False, 'message': f"FaceURL yuklashda xatolik: {str(e)}"}

        # Binary rasm faylini olish
        raw_bytes = None
        if image_bytes:
            raw_bytes = image_bytes
        elif image_path and os.path.exists(image_path):
            try:
                with open(image_path, 'rb') as f:
                    raw_bytes = f.read()
            except Exception as e:
                return {'success': False, 'message': f"Rasm faylini o'qib bo'lmadi: {str(e)}"}

        if not raw_bytes:
            return {'success': False, 'message': "Yuklash uchun yuz rasmi topilmadi."}

        # Hikvision multipart talabi: FaceDataRecord (application/json) va img (image/jpeg)
        files = {
            'FaceDataRecord': (None, json.dumps(fd_record), 'application/json'),
            'img': ('face.jpg', raw_bytes, 'image/jpeg')
        }

        try:
            res = requests.post(endpoint, auth=self.auth, files=files, timeout=self.timeout)
            parsed = self._parse_response(res)

            if parsed['success']:
                return {
                    'success': True,
                    'message': f"Yuz rasmi ({employee_no}) terminalga yuklandi va model hisoblandi ✅",
                    'details': parsed
                }

            # Xatoliklarni aniqlashtirish
            sub = str(parsed.get('sub_status', '')).lower()
            msg = parsed.get('message', '')
            if 'facefeatureerror' in sub or 'quality' in sub or 'noface' in sub:
                friendly_msg = "Rasmda yuz aniqlanmadi yoki rasm sifati talabga javob bermaydi (Face quality error)"
            elif 'storagefull' in sub:
                friendly_msg = "Terminal xotirasi to'lgan (Face storage full)"
            elif 'exist' in sub:
                friendly_msg = "Ushbu o'quvchining yuz rasmi oldin yuklangan"
            else:
                friendly_msg = f"Yuz yuklash xatoligi: {msg}"

            return {
                'success': False,
                'message': friendly_msg,
                'details': parsed
            }

        except Exception as e:
            return {
                'success': False,
                'message': f"Yuz rasmini yuklashda tarmoq xatosi: {str(e)}"
            }

    def delete_user(self, employee_no):
        """
        Terminaldan o'quvchini o'chirish:
        PUT /ISAPI/AccessControl/UserInfo/SetUp?format=json
        """
        endpoint = f"{self.base_url}/ISAPI/AccessControl/UserInfo/SetUp?format=json"
        payload = {
            "UserInfoDetail": {
                "mode": "byEmployeeNo",
                "EmployeeNoList": [{"employeeNo": str(employee_no).strip()}]
            }
        }
        try:
            res = requests.put(endpoint, auth=self.auth, json=payload, timeout=self.timeout)
            return self._parse_response(res)
        except Exception as e:
            return {'success': False, 'message': str(e)}


def sync_student_to_hikvision(student_user, client):
    """
    Bitta o'quvchini (profil va yuz rasmi bilan) berilgan Hikvision terminaliga sinxronlash.
    """
    sp = getattr(student_user, 'student_profile', None)
    emp_no = sp.student_id if sp and sp.student_id else str(student_user.id)
    full_name = student_user.get_full_name() or student_user.username

    # 1. Profilni yuklash (UserInfo)
    profile_res = client.sync_user_profile(employee_no=emp_no, name=full_name)
    if not profile_res['success']:
        return {
            'student_id': emp_no,
            'name': full_name,
            'success': False,
            'step': 'profile',
            'message': profile_res['message']
        }

    # 2. Yuz rasmini tekshirish va yuklash
    face_res = {'success': True, 'message': "Rasm yuklanmadi (Rasm mavjud emas)"}
    if student_user.photo_3x4:
        try:
            photo_path = student_user.photo_3x4.path
            if os.path.exists(photo_path):
                face_res = client.upload_face_picture(employee_no=emp_no, image_path=photo_path)
        except Exception as ex:
            face_res = {'success': False, 'message': f"Rasm fayli xatosi: {str(ex)}"}

    return {
        'student_id': emp_no,
        'name': full_name,
        'success': True,
        'profile_sync': profile_res,
        'face_sync': face_res,
        'message': f"{full_name} ({emp_no}) muvaffaqiyatli yuklandi ✅"
    }


def sync_all_students_to_hikvision(client, school_id='1'):
    """
    Maktabdagi barcha o'quvchilarni Hikvision terminaliga to'liq sinxronizatsiya qilish.
    """
    students = User.objects.filter(role='STUDENT').select_related('student_profile__school_class')
    results = []
    success_count = 0
    fail_count = 0

    for st in students:
        res = sync_student_to_hikvision(st, client)
        if res['success']:
            success_count += 1
        else:
            fail_count += 1
        results.append(res)

    return {
        'total': len(students),
        'success_count': success_count,
        'fail_count': fail_count,
        'terminal_host': client.host,
        'results': results,
    }
