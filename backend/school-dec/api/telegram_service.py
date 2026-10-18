import httpx
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def send_telegram_message(chat_id: str, text: str):
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    if not token or token == "YOUR_BOT_TOKEN_HERE" or not chat_id:
        logger.info(f"[TELEGRAM SIMULATION] Chat ID: {chat_id} -> {text}")
        print(f"\n📢 [TELEGRAM BILDIRISHNOMA] Chat ID: {chat_id}\nXabar: {text}\n")
        return False
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.post(url, json=payload)
            return resp.status_code == 200
    except Exception as e:
        logger.error(f"Error sending telegram message: {e}")
        return False


def notify_parent_attendance(student, lesson):
    if not student.parent_telegram_chat_id:
        return
    text = (
        f"✅ <b>Davomat tasdiqlandi!</b>\n\n"
        f"Farzandingiz: <b>{student.get_full_name()}</b>\n"
        f"Fan: <b>{lesson.subject.name}</b>\n"
        f"Xona: {lesson.room_number}\n"
        f"Ustoz: {lesson.teacher.get_full_name()}\n"
        f"Vaqti: Bugun darsga o'z vaqtida qatnashdi."
    )
    send_telegram_message(student.parent_telegram_chat_id, text)


def notify_parent_grade(student, lesson, grade):
    if not student.parent_telegram_chat_id:
        return
    type_display = dict(grade.GRADE_TYPE_CHOICES).get(grade.grade_type, grade.grade_type)
    text = (
        f"📊 <b>Yangi Baho qo'yildi!</b>\n\n"
        f"Farzandingiz: <b>{student.get_full_name()}</b>\n"
        f"Fan: <b>{lesson.subject.name}</b>\n"
        f"Baho: <b>{grade.score}</b> ({type_display})\n"
        f"Izoh: <i>{grade.comment or 'Izohsiz'}</i>\n"
        f"Ustoz: {lesson.teacher.get_full_name()}"
    )
    send_telegram_message(student.parent_telegram_chat_id, text)
