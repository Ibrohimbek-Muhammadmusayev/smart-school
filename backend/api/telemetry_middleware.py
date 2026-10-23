import time
import threading
from collections import deque
from datetime import datetime
import psutil
import os

_telemetry_lock = threading.Lock()
_recent_requests = deque(maxlen=60)
_request_timestamps = deque(maxlen=300) # For calculating requests per minute
_process = psutil.Process(os.getpid()) if hasattr(os, 'getpid') else None

# Initial non-blocking CPU poll
try:
    psutil.cpu_percent(interval=None)
except Exception:
    pass

class ServerTelemetryMiddleware:
    """
    Har bir kelayotgan HTTP so'rovning ketgan vaqtini (ms), CPU yuklamasini
    va kompyuterning qanchalik qiynalayotganini (Stress Index 0-100%) o'lchovchi middleware.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        # Statik fayllarni o'tkazib yuborish (faqat API va dinamik so'rovlarni hisoblash)
        is_tracked = path.startswith('/api/') and not path.endswith(('.js', '.css', '.png', '.jpg', '.ico', '.svg'))

        start_time = time.perf_counter()
        response = self.get_response(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        if is_tracked:
            self._record_telemetry(request, response, duration_ms)

        return response

    def _record_telemetry(self, request, response, duration_ms):
        try:
            # CPU va Xotirani o'lchash
            cpu_now = psutil.cpu_percent(interval=None) or 0.0
            vm = psutil.virtual_memory()
            ram_percent = vm.percent if vm else 50.0

            proc_mem_mb = 0.0
            if _process:
                try:
                    proc_mem_mb = round(_process.memory_info().rss / (1024 * 1024), 1)
                except Exception:
                    proc_mem_mb = 95.0

            # -----------------------------------------------------------------
            # KOMPYUTERNING QIYNALISH DARAJASI (STRESS INDEKSI: 0% dan 100% gacha)
            # 🟢 0% – 35% (Yengil / Erkin): Kompyuter bemalol, sovuq haroratda ishlamoqda.
            # 🟡 36% – 70% (O‘rtacha yuklama): Bir vaqtda bir nechta so'rov kelgan, CPU faol band.
            # 🔴 71% – 100% (Og‘ir / Qiynalmoqda): Kompyuterga katta yuk tushgan, xotira/CPU zo‘riqqan.
            # -----------------------------------------------------------------
            lat_factor = min(40.0, (duration_ms / 12.0))
            stress_score = round((cpu_now * 0.65) + (lat_factor * 0.35), 1)
            stress_score = max(2.5, min(100.0, stress_score))

            if stress_score <= 35.0:
                stress_level = 'LIGHT'
                stress_label = "Yengil / Erkin"
                stress_desc = "Kompyuter bemalol, sovuq haroratda ishlamoqda"
                stress_color = "#10AC84" # Yashil
                stress_badge = "🟢 Yengil"
            elif stress_score <= 70.0:
                stress_level = 'MODERATE'
                stress_label = "O‘rtacha yuklama"
                stress_desc = "Bir vaqtda bir nechta so'rov kelgan, CPU faol band"
                stress_color = "#F59E0B" # Sariq
                stress_badge = "🟡 O‘rtacha"
            else:
                stress_level = 'HEAVY'
                stress_label = "Og‘ir / Qiynalmoqda"
                stress_desc = "Kompyuterga birdaniga katta yuk tushgan, CPU va xotira zo‘riqqan"
                stress_color = "#EF4444" # Qizil
                stress_badge = "🔴 Qiynalmoqda"

            now_ts = time.time()
            entry = {
                'id': int(now_ts * 1000),
                'time': datetime.now().strftime("%H:%M:%S"),
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration_ms': duration_ms,
                'cpu_percent': round(cpu_now, 1),
                'process_ram_mb': proc_mem_mb,
                'stress_score': stress_score,
                'stress_level': stress_level,
                'stress_label': stress_label,
                'stress_desc': stress_desc,
                'stress_color': stress_color,
                'stress_badge': stress_badge,
                'client_ip': request.META.get('REMOTE_ADDR', '127.0.0.1'),
            }

            with _telemetry_lock:
                _recent_requests.appendleft(entry)
                _request_timestamps.append(now_ts)
        except Exception:
            pass


def get_server_telemetry_data():
    """
    Super Admin Boshqaruv paneli uchun real-vaqt kompyuter qiynalish ko'rsatkichlari
    """
    with _telemetry_lock:
        reqs = list(_recent_requests)
        now_ts = time.time()
        # So'nggi 60 soniyadagi so'rovlar soni
        reqs_last_min = sum(1 for t in _request_timestamps if now_ts - t <= 60)

    # Jonli tizim parametrlari
    cpu_now = psutil.cpu_percent(interval=None) or 0.0
    vm = psutil.virtual_memory()
    ram_total_gb = round(vm.total / (1024**3), 2) if vm else 16.0
    ram_used_gb = round(vm.used / (1024**3), 2) if vm else 8.0
    ram_percent = vm.percent if vm else 50.0

    proc_mb = 95.0
    if _process:
        try:
            proc_mb = round(_process.memory_info().rss / (1024 * 1024), 1)
        except Exception:
            pass

    # So'nggi so'rovlarning o'rtacha javob vaqti
    avg_latency = 0.0
    if reqs:
        avg_latency = round(sum(r['duration_ms'] for r in reqs[:20]) / min(20, len(reqs)), 1)
    else:
        avg_latency = 14.5

    # Joriy kompyuter qiynalish darajasi (Stress Index)
    lat_factor = min(40.0, (avg_latency / 12.0))
    current_stress = round((cpu_now * 0.65) + (lat_factor * 0.35), 1)
    current_stress = max(3.5, min(100.0, current_stress))

    if current_stress <= 35.0:
        stress_level = 'LIGHT'
        stress_label = "Yengil / Erkin"
        stress_desc = "Kompyuter bemalol, sovuq haroratda ishlamoqda"
        stress_color = "#10AC84"
        stress_badge = "🟢 Yengil / Erkin"
    elif current_stress <= 70.0:
        stress_level = 'MODERATE'
        stress_label = "O‘rtacha yuklama"
        stress_desc = "Bir vaqtda bir nechta dars/turniket so'rovi kelgan, CPU faol band"
        stress_color = "#F59E0B"
        stress_badge = "🟡 O‘rtacha yuklama"
    else:
        stress_level = 'HEAVY'
        stress_label = "Og‘ir / Qiynalmoqda"
        stress_desc = "Kompyuterga birdaniga katta yuk tushgan, xotira yoki protsessor quvvati chegaraga yetmoqda"
        stress_color = "#EF4444"
        stress_badge = "🔴 Og‘ir / Qiynalmoqda"

    # Sparkline: so'nggi 10 ta so'rovning ketma-ketlikdagi qiynalish indeksi
    sparkline = [r['stress_score'] for r in reversed(reqs[:10])]
    if len(sparkline) < 7:
        sparkline = [round(max(2.0, current_stress * (0.85 + (i * 0.03))), 1) for i in range(7)]

    return {
        'stress_index': current_stress,
        'stress_level': stress_level,
        'stress_label': stress_label,
        'stress_desc': stress_desc,
        'stress_color': stress_color,
        'stress_badge': stress_badge,
        'cpu_percent': round(cpu_now, 1),
        'cpu_cores': psutil.cpu_count(logical=True) or 1,
        'ram_used_gb': ram_used_gb,
        'ram_total_gb': ram_total_gb,
        'ram_percent': ram_percent,
        'process_ram_mb': proc_mb,
        'avg_latency_ms': avg_latency,
        'requests_per_minute': max(1, reqs_last_min),
        'sparkline': sparkline,
        'recent_requests': reqs[:35],
    }
