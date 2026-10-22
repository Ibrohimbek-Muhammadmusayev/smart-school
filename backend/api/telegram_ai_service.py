"""
Smart School (Idrok Edu) - Super Admin Telegram Bot & Google AI Studio (Gemini) Service
Ushbu modul butun loyihaning barcha ma'lumotlar bazasini real vaqt rejimida yig'ib,
Super Admin Telegram boti orqali erkin tahlil va monitoring qilishni ta'minlaydi.
"""

import os
import json
import logging
import requests
import datetime
from django.utils import timezone
from api.models import (
    User, SchoolConfig, SchoolClass, StudentProfile, Attendance,
    DeviceEventLog, SystemConfig
)

logger = logging.getLogger(__name__)

def get_system_full_context():
    """
    Butun platformaning 100% REAL vaqtli to'liq ma'lumotlar bazasi ko'chirmasini tayyorlaydi.
    """
    cfg = SystemConfig.get_solo()
    configs = SchoolConfig.objects.all().order_by('school_id')

    schools_info = []
    for sc in configs:
        sid = str(sc.school_id)
        st_count = User.objects.filter(role='STUDENT', school_id=sid).count()
        tc_count = User.objects.filter(role='TEACHER', school_id=sid).count()
        cl_count = SchoolClass.objects.filter(school_id=sid).count()

        att_qs = Attendance.objects.filter(student__school_id=sid)
        att_total = att_qs.count()
        att_present = att_qs.filter(status__in=['PRESENT', 'LATE']).count()
        att_rate = round(att_present / max(1, att_total) * 100, 1) if att_total > 0 else 0.0

        face_count = User.objects.filter(role='STUDENT', school_id=sid, photo_3x4__isnull=False).exclude(photo_3x4='').count()
        has_turnstile = DeviceEventLog.objects.filter(school_id=sid).exists()

        m_price = getattr(sc, 'monthly_price', 1000000) or 1000000
        is_trial = bool(getattr(sc, 'is_free_trial', False))
        trial_date = sc.trial_until_date.strftime('%Y-%m-%d') if getattr(sc, 'trial_until_date', None) else ''

        schools_info.append({
            'school_id': sid,
            'name': sc.school_name,
            'district': sc.district or "Toshkent shahri",
            'director': sc.director_name or "Noma'lum",
            'phone': sc.phone or "+998 71 200-00-00",
            'status': 'TRIAL' if is_trial else (sc.status or 'ACTIVE'),
            'payment_status': 'TRIAL' if is_trial else (sc.payment_status or 'PAID'),
            'monthly_price_uzs': m_price,
            'monthly_price_formatted': f"{m_price:,} so'm".replace(',', ' '),
            'is_free_trial': is_trial,
            'trial_until_date': trial_date or "Muddatsiz / Yo'q",
            'debt_amount': sc.debt_amount or "0 so'm",
            'students_count': st_count,
            'teachers_count': tc_count,
            'classes_count': cl_count,
            'attendance_rate_percent': f"{att_rate}%",
            'face_id_students_count': face_count,
            'turnstile_online': bool(has_turnstile),
        })

    total_st = User.objects.filter(role='STUDENT').count()
    total_tc = User.objects.filter(role='TEACHER').count()
    total_cl = SchoolClass.objects.count()
    total_att = Attendance.objects.count()
    att_pres = Attendance.objects.filter(status__in=['PRESENT', 'LATE']).count()
    avg_rate = round(att_pres / max(1, total_att) * 100, 1) if total_att > 0 else 0.0
    total_face = User.objects.filter(role='STUDENT', photo_3x4__isnull=False).exclude(photo_3x4='').count()

    active_paid = [s for s in schools_info if not s['is_free_trial'] and s['status'] == 'ACTIVE']
    mrr = sum(s['monthly_price_uzs'] for s in active_paid)
    arr = mrr * 12
    overdue = [s for s in schools_info if s['payment_status'] == 'OVERDUE']
    debt = sum(int(str(s['debt_amount']).replace("so'm", "").replace(" ", "").strip() or 0) or s['monthly_price_uzs'] for s in overdue)

    recent_events = []
    for ev in DeviceEventLog.objects.all().order_by('-timestamp')[:20]:
        recent_events.append({
            'time': ev.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'student': ev.student_name,
            'school_id': ev.school_id,
            'direction': ev.direction,
            'device_ip': ev.device_ip,
            'event_type': ev.event_type,
            'details': ev.details or ''
        })

    return {
        'platform_summary': {
            'total_schools': len(schools_info),
            'total_students': total_st,
            'total_teachers': total_tc,
            'total_classes': total_cl,
            'total_face_id_registered': total_face,
            'total_attendance_logs': total_att,
            'overall_attendance_rate': f"{avg_rate}%",
            'is_maintenance_mode': bool(cfg.is_maintenance_mode),
        },
        'financials': {
            'mrr_monthly_revenue': f"{mrr:,} so'm".replace(',', ' '),
            'arr_annual_revenue': f"{arr:,} so'm".replace(',', ' '),
            'total_debt': f"{debt:,} so'm".replace(',', ' '),
            'active_paid_schools_count': len(active_paid),
            'overdue_debt_schools_count': len(overdue),
            'trial_free_schools_count': sum(1 for s in schools_info if s['is_free_trial']),
        },
        'schools': schools_info,
        'recent_turnstile_and_face_events': recent_events,
        'system_contacts': {
            'support_phone': cfg.support_phone,
            'support_email': cfg.support_email,
        }
    }


def query_gemini_ai(user_question, context_data=None):
    """
    Google AI Studio (Gemini API) orqali tizim ma'lumotlar bazasi asosida javob oladi.
    """
    cfg = SystemConfig.get_solo()
    api_key = (cfg.gemini_api_key or os.environ.get('GEMINI_API_KEY', '')).strip()

    if not api_key:
        return (
            "⚠️ **Google AI Studio (Gemini) API kaliti topilmadi!**\n\n"
            "Iltimos, Super Admin veb-paneliga kiring va **'Idrok Core Sozlamalari'** "
            "bo‘limida Google AI Studio API kalitini kiriting va saqlang."
        )

    if context_data is None:
        context_data = get_system_full_context()

    context_json = json.dumps(context_data, ensure_ascii=False, indent=2)

    system_instruction = (
        "Siz Smart School (Idrok Edu) platformasi uchun ixtisoslashgan bosh aqlli AI Biznes va Texnik Tahlilchisiz (Executive AI Assistant). "
        "Sizga platforma Super Admini (egasi) murojaat qilmoqda.\n\n"
        "Quyida sizga butun platformaning barcha modullari (maktablar, o'quvchilar, o'qituvchilar, sinflar, "
        "Idrok Vision Face ID, turniket qurilmalari, oylik to'lovlar, tushumlar, qarzdorliklar, sinov muddatlari) "
        "bo'yicha 100% REAL vaqtli to'liq ma'lumotlar bazasi beriladi.\n\n"
        "QAT'IY QOIDALAR:\n"
        "1. Super Adminning har qanday savoliga faqat berilgan haqiqiy baza ma'lumotlari asosida juda aniq, "
        "tushunarli, professional va to'liq o'zbek tilida javob bering.\n"
        "2. Aslo taxminiy yoki soxta raqamlarni to'qimang. Agar biror maktabda o'quvchi 0 bo'lsa yoki qarzdorlik 0 bo'lsa, "
        "aynan 0 ekanligini to'g'ri ayting.\n"
        "3. Javoblarni Telegram o'quvchisiga qulay formatda chiroyli emojilar (📊, 🏫, 💰, 👥, ⚡️), "
        "qalin shrift (bold) va tartiblangan ro'yxatlar bilan taqdim eting.\n"
        "4. Agar savol moliya, qarzdorlik yoki sinov muddati haqida bo'lsa, aniq so'm summalarini va muddatlarini keltiring.\n"
        "5. Agar savol maktablar yoki davomat haqida bo'lsa, maktab nomlari, direktorlari, telefonlari va davomat foizlarini keltiring."
    )

    # 2026-yilgi rasmiy Google Gemini API modellari:
    # Yangi API kalitlar uchun gemini-3.5-flash va gemini-3.5-flash-lite eng tezkor va barqaror
    models_to_try = [
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.6-flash',
        'gemini-flash-latest',
        'gemini-3.8-flash',
    ]
    last_err = None

    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        headers = {'Content-Type': 'application/json'}
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"Haqiqiy baza ma'lumotlari:\n```json\n{context_json}\n```\n\nSuper Admin savoli:\n{user_question}"
                        }
                    ]
                }
            ],
            "systemInstruction": {
                "parts": [
                    {"text": system_instruction}
                ]
            },
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
            }
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=25)
            if resp.status_code == 200:
                res_data = resp.json()
                candidates = res_data.get('candidates', [])
                if candidates and 'content' in candidates[0]:
                    parts = candidates[0]['content'].get('parts', [])
                    if parts and 'text' in parts[0]:
                        return parts[0]['text'].strip()
            else:
                last_err = f"Status {resp.status_code}: {resp.text[:200]}"
        except Exception as e:
            last_err = str(e)

    return f"⚠️ AI javob berishda xatolik yuz berdi: {last_err}"


def send_telegram_message(bot_token, chat_id, text, reply_markup=None):
    """
    Telegram Bot API orqali xabar yuborish.
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'Markdown',
    }
    if reply_markup:
        payload['reply_markup'] = reply_markup

    try:
        res = requests.post(url, json=payload, timeout=15)
        # Agar markdown parse xatosi bersa, parse_mode siz qayta yuboramiz
        if res.status_code != 200 and 'parse' in res.text.lower():
            payload.pop('parse_mode', None)
            res = requests.post(url, json=payload, timeout=15)
        return res.status_code == 200
    except Exception as e:
        logger.error(f"Telegram send error: {e}")
        return False


def send_chat_action(bot_token, chat_id, action="typing"):
    """
    Telegramda 'yozmoqda...' (typing) statusini yoqish.
    """
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendChatAction"
        requests.post(url, json={'chat_id': chat_id, 'action': action}, timeout=5)
    except Exception:
        pass


def get_default_keyboard():
    return {
        'keyboard': [
            [{'text': '📊 Bugungi Davomat & Holat'}, {'text': '🏫 Maktablar Ro‘yxati'}],
            [{'text': '💰 Moliya & Tushumlar'}, {'text': '⚠️ Qarzdor & Sinovdagi Maktablar'}],
            [{'text': '🤖 AI To‘liq Tahlil & Xulosa'}],
        ],
        'resize_keyboard': True,
        'persistent': True,
    }


def handle_telegram_update(update, bot_token, admin_id=None):
    """
    Bitta Telegram yangilanishini qayta ishlash.
    """
    msg = update.get('message') or update.get('edited_message')
    if not msg:
        return

    chat_id = msg.get('chat', {}).get('id')
    user_text = (msg.get('text') or '').strip()
    from_user = msg.get('from', {})

    if not chat_id or not user_text:
        return

    cfg = SystemConfig.get_solo()
    saved_admin_id = (cfg.telegram_admin_id or '').strip()

    # Agar admin ID kiritilgan bo'lsa va bu boshqa foydalanuvchi bo'lsa — ruxsat bermaymiz
    if saved_admin_id and str(chat_id) != saved_admin_id:
        send_telegram_message(
            bot_token,
            chat_id,
            "⛔ **Ruxsat yo‘q!**\n\nUshbu bot faqat Smart School / Idrok Edu Boshqaruvchisi (Super Admin) uchun maxsus yaratilgan."
        )
        return

    # Agar hali admin ID saqlanmagan bo'lsa, birinchi yozgan foydalanuvchini admin sifatida saqlashimiz mumkin
    if not saved_admin_id:
        cfg.telegram_admin_id = str(chat_id)
        cfg.save()

    # /start yoki /help buyruqlari
    if user_text.lower() in ('/start', '/help', 'salom', 'start'):
        welcome_text = (
            f"👋 **Assalomu alaykum, Hurmatli Super Admin ({from_user.get('first_name', 'Boshqaruvchi')})!**\n\n"
            "Smart School (Idrok Edu) Executive AI boshqaruv botiga xush kelibsiz.\n\n"
            "Men tizimdagi butun ma'lumotlar bazasini real vaqt rejimida bilaman:\n"
            "• 🏫 **Maktablar**: Direktorlar, telefonlar, o‘quvchilar va sinflar soni\n"
            "• 📊 **Davomat**: Bugungi kirish-chiqishlar, Face ID va turniketlar\n"
            "• 💰 **Moliya**: Oylik tushumlar (MRR), qarzdorliklar va kutilayotgan to‘lovlar\n"
            "• ⏳ **Sinov davri**: Qaysi maktablar bepul sinovda va muddati qachongacha\n\n"
            "Quyidagi tugmalardan birini bosing yoki menga **istalgan savolingizni** yozing!"
        )
        send_telegram_message(bot_token, chat_id, welcome_text, reply_markup=get_default_keyboard())
        return

    # Tezkor buyruqlar va erkin savollarga javob berish
    send_chat_action(bot_token, chat_id, "typing")

    prompt = user_text
    if user_text == '📊 Bugungi Davomat & Holat':
        prompt = "Bugungi umumiy platforma davomati, kelganlar, kechikkanlar, o'quvchilar soni va turniketlar holati bo'yicha to'liq hisobot ber."
    elif user_text == '🏫 Maktablar Ro‘yxati':
        prompt = "Barcha ro'yxatdan o'tgan maktablar, ularning direktorlari, telefonlari, o'quvchilari va statusi haqida ro'yxat tuzib ber."
    elif user_text == '💰 Moliya & Tushumlar':
        prompt = "Platformaning hozirgi moliyaviy holati: oylik tushum (MRR), yillik (ARR), har bir maktabning oylik narxi va to'lov holati haqida hisobot ber."
    elif user_text == '⚠️ Qarzdor & Sinovdagi Maktablar':
        prompt = "To'lovi kutilayotgan yoki muddati o'tgan qarzdor maktablar hamda sinov (bepul) muddatidagi maktablar va ularning tugash sanalarini ko'rsat."
    elif user_text == '🤖 AI To‘liq Tahlil & Xulosa':
        prompt = "Butun tizim holatini (maktablar, o'quvchilar, davomat va moliya) har tomonlama chuqur tahlil qilib, Super Admin uchun xulosa va takliflar ber."

    ai_reply = query_gemini_ai(prompt)
    send_telegram_message(bot_token, chat_id, ai_reply, reply_markup=get_default_keyboard())
