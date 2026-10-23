import os
import sys
import logging
from django.apps import AppConfig

logger = logging.getLogger(__name__)


class ApiConfig(AppConfig):
    name = 'api'
    verbose_name = 'Idrok Core (Markaziy Boshqaruv Dvigateli)'

    def ready(self):
        # 1. Buyruqlar qatorini tekshirish: migration, test, check yoki shell vaqtida bot ishga tushmasligi kerak
        skip_commands = {
            'migrate', 'makemigrations', 'check', 'collectstatic',
            'test', 'createsuperuser', 'shell', 'seed_data',
            'showmigrations', 'squashmigrations', 'inspectdb',
            'dumpdata', 'loaddata', 'run_superadmin_bot'
        }
        cmd_args = set(sys.argv[1:]) if len(sys.argv) > 1 else set()
        if cmd_args & skip_commands:
            return

        # 2. Agar manage.py orqali chaqirilgan bo'lsa va bu runserver bo'lsa:
        # Django runserver ikkita jarayon (watcher va worker) ochadi.
        # Takroriy polling (409 conflict) oldini olish uchun faqat asosiy ishchi jarayonda (RUN_MAIN == 'true')
        # yoki --noreload bilan chaqirilganda ishga tushiramiz.
        is_manage_py = any('manage.py' in arg for arg in sys.argv)
        is_runserver = 'runserver' in sys.argv

        if is_manage_py:
            if not is_runserver:
                return

            is_worker = (os.environ.get('RUN_MAIN') == 'true') or ('--noreload' in sys.argv)
            if not is_worker:
                return

        # 3. Super Admin Telegram Botini orqa fonda (daemon thread) avtomatik ishga tushirish
        try:
            from api.telegram_bot_daemon import start_bot_in_background
            start_bot_in_background()
        except Exception as e:
            logger.error(f"[TELEGRAM BOT] Avtomatik start berishda xatolik: {e}")
