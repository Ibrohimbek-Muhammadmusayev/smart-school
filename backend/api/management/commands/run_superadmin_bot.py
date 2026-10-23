from django.core.management.base import BaseCommand
from api.telegram_bot_daemon import _bot_loop, start_bot_in_background, is_bot_running
import time

class Command(BaseCommand):
    help = "Run the Super Admin Telegram Bot with Gemini AI Integration in foreground"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("[INFO] Super Admin Telegram AI Boti to'g'ridan-to'g'ri ishga tushmoqda..."))
        try:
            _bot_loop()
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("\n[INFO] Bot to'xtatildi."))
