"""
Smart School (Idrok Edu) - Super Admin Telegram Bot Background Daemon
Ushbu modul Django backend ishga tushganda Super Admin Telegram Botini avtomatik
tarzda alohida fonda (daemon thread) ishga tushiradi va 24/7 rejimda xabarlarni
Google AI Studio (Gemini) va real baza tahlili asosida qayta ishlaydi.
"""

import time
import logging
import threading
import requests
from django.db import connection

logger = logging.getLogger(__name__)

_bot_thread = None
_stop_event = threading.Event()
_lock = threading.Lock()


def is_bot_running():
    """
    Telegram bot daemon fonda ishlab turganligini tekshiradi.
    """
    global _bot_thread
    return _bot_thread is not None and _bot_thread.is_alive()


def stop_bot():
    """
    Bot daemonni to'xtatish.
    """
    global _stop_event
    _stop_event.set()


def _bot_loop():
    """
    Telegram getUpdates long-polling sikli.
    Har bir qadamda ma'lumotlar bazasi ulanishini yangilab boradi.
    """
    from api.models import SystemConfig
    from api.telegram_ai_service import handle_telegram_update

    logger.info("[TELEGRAM BOT] Super Admin Telegram Bot daemon sikli boshlandi.")
    try:
        print("\n[TELEGRAM BOT] [OK] Super Admin Telegram AI Boti avtomatik ishga tushirildi!")
    except Exception:
        pass

    offset = 0

    while not _stop_event.is_set():
        try:
            cfg = SystemConfig.get_solo()
            token = (cfg.telegram_bot_token or "").strip()

            if not token:
                logger.warning("[TELEGRAM BOT] Token topilmadi. Kutilmoqda...")
                time.sleep(10)
                continue

            url = f"https://api.telegram.org/bot{token}/getUpdates"
            params = {
                'offset': offset,
                'timeout': 15,
            }

            resp = requests.get(url, params=params, timeout=20)

            if resp.status_code == 200:
                data = resp.json()
                for update in data.get('result', []):
                    offset = update['update_id'] + 1
                    try:
                        handle_telegram_update(update, token)
                    except Exception as e:
                        logger.error(f"[TELEGRAM BOT] Update handle xatosi: {e}")
            elif resp.status_code == 409:
                # 409 Conflict: agar eski webhook qolib ketgan bo'lsa
                logger.warning("[TELEGRAM BOT] 409 Conflict aniqlandi. Webhook tozalanmoqda...")
                try:
                    requests.get(f"https://api.telegram.org/bot{token}/deleteWebhook", timeout=10)
                except Exception:
                    pass
                time.sleep(3)
            elif resp.status_code == 401:
                logger.error("[TELEGRAM BOT] Token noto'g'ri (401 Unauthorized)!")
                time.sleep(15)
            else:
                time.sleep(2)

        except requests.exceptions.Timeout:
            # Oddiy long-polling timeout — davom etamiz
            pass
        except requests.exceptions.RequestException as e:
            logger.debug(f"[TELEGRAM BOT] Tarmoq xatosi: {e}")
            time.sleep(5)
        except Exception as e:
            logger.error(f"[TELEGRAM BOT] Kutilmagan xato: {e}")
            time.sleep(5)
        finally:
            # SQLite / DB connectionni har siklda yopib, qotib qolish va xotira sizib chiqishini oldini olamiz
            try:
                connection.close()
            except Exception:
                pass

    logger.info("[TELEGRAM BOT] Bot daemon to'xtatildi.")


def start_bot_in_background():
    """
    Agar bot ishga tushmagan bo'lsa, uni xavfsiz holda daemon thread orqali ishga tushiradi.
    """
    global _bot_thread, _stop_event

    with _lock:
        if is_bot_running():
            logger.info("[TELEGRAM BOT] Bot allaqachon fonda ishlab turibdi.")
            return True

        _stop_event.clear()
        _bot_thread = threading.Thread(
            target=_bot_loop,
            name="SuperAdminTelegramBotDaemon",
            daemon=True
        )
        _bot_thread.start()
        logger.info("[TELEGRAM BOT] Bot daemon oqimi muvaffaqiyatli start berildi.")
        return True
