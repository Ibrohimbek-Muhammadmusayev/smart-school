import time
import requests
import logging
from django.core.management.base import BaseCommand
from api.models import SystemConfig
from api.telegram_ai_service import handle_telegram_update

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Run the Super Admin Telegram Bot with Gemini AI Integration"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("[INFO] Super Admin Telegram AI Boti ishga tushmoqda..."))

        offset = 0
        while True:
            try:
                cfg = SystemConfig.get_solo()
                token = (cfg.telegram_bot_token or "").strip()

                if not token:
                    self.stdout.write(self.style.WARNING("[WAIT] Telegram Bot Token kiritilmagan. Nastroykadan kiritilishini kutyapman..."))
                    time.sleep(10)
                    continue

                url = f"https://api.telegram.org/bot{token}/getUpdates"
                params = {
                    'offset': offset,
                    'timeout': 20,
                }

                resp = requests.get(url, params=params, timeout=25)
                if resp.status_code == 200:
                    data = resp.json()
                    for update in data.get('result', []):
                        offset = update['update_id'] + 1
                        try:
                            handle_telegram_update(update, token)
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f"[ERROR] Update handle xatosi: {e}"))
                elif resp.status_code == 401:
                    self.stdout.write(self.style.ERROR("[AUTH ERROR] Telegram Bot Token notogri (401 Unauthorized)!"))
                    time.sleep(10)
                else:
                    time.sleep(3)

            except requests.exceptions.RequestException as e:
                time.sleep(5)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"[ERROR] Kutilmagan xato: {e}"))
                time.sleep(5)
