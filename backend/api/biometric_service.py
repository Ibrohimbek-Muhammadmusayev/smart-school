"""
Idrok Biometric Engine — Yuzni Solishtirish va Shaxsni Tasdiqlash Xizmati
Ushbu modul maktab nazoratchisi / qorovul mobil ilovasi orqali olingan jonli
yuz fotosuratini o'quvchining bazadagi 3x4 fotosurati bilan solishtiradi.

Ishlash usuli:
1. OpenCV SIFT (Scale-Invariant Feature Transform) orqali yuz belgilarini (descriptor) solishtirish.
2. Rang va tekstura gistogrammasi korrelyatsiyasi (Histogram Correlation).
3. Strukturaviy o'xshashlik (Normalized Cross Correlation).
4. Google Gemini Vision API (agar token sozlangan bo'lsa) orqali qo'shimcha tasdiqlash.
"""

import io
import os
import json
import base64
import logging
import numpy as np
from PIL import Image

try:
    import cv2
except ImportError:
    cv2 = None

logger = logging.getLogger(__name__)


def load_pil_image(image_input):
    """
    Turli formatdagi (fayl yo'li, BytesIO, base64 matn, PIL Image) rasmni
    RGB formatidagi PIL Image obyektiga o'tkazadi.
    """
    if isinstance(image_input, Image.Image):
        return image_input.convert('RGB')

    if isinstance(image_input, str):
        # 1. Agar base64 matn bo'lsa
        if image_input.startswith('data:image') or ';base64,' in image_input or len(image_input) > 500:
            clean_b64 = image_input
            if ';base64,' in clean_b64:
                clean_b64 = clean_b64.split(';base64,', 1)[1]
            elif ',' in clean_b64 and clean_b64.startswith('data:'):
                clean_b64 = clean_b64.split(',', 1)[1]
            img_bytes = base64.b64decode(clean_b64)
            return Image.open(io.BytesIO(img_bytes)).convert('RGB')
        # 2. Agar fayl yo'li bo'lsa
        if os.path.exists(image_input):
            return Image.open(image_input).convert('RGB')

    if isinstance(image_input, bytes):
        return Image.open(io.BytesIO(image_input)).convert('RGB')

    if hasattr(image_input, 'read'):
        content = image_input.read()
        return Image.open(io.BytesIO(content)).convert('RGB')

    raise ValueError("Noma'lum rasm formati taqdim etildi.")


def compare_faces_local(ref_img: Image.Image, cam_img: Image.Image):
    """
    OpenCV va NumPy asosida 100% lokal va tezkor yuz solishtiruvi.
    Natija: (is_match: bool, confidence: float, details: dict)
    """
    if cv2 is None:
        return False, 0.0, {"error": "OpenCV o'rnatilmagan"}

    # O'lchamlarni me'yorlashtirish
    ref_rgb = np.array(ref_img)
    cam_rgb = np.array(cam_img)

    # Grayscale
    ref_gray = cv2.cvtColor(ref_rgb, cv2.COLOR_RGB2GRAY)
    cam_gray = cv2.cvtColor(cam_rgb, cv2.COLOR_RGB2GRAY)

    # Yorug'lik va kontrastni tenglashtirish (Histogram Equalization)
    ref_eq = cv2.equalizeHist(ref_gray)
    cam_eq = cv2.equalizeHist(cam_gray)

    # 1. SIFT xususiyatlar nuqtalari
    sift_matches_count = 0
    sift_ratio = 0.0
    try:
        sift = cv2.SIFT_create(nfeatures=800)
        kp1, des1 = sift.detectAndCompute(ref_eq, None)
        kp2, des2 = sift.detectAndCompute(cam_eq, None)

        if des1 is not None and des2 is not None and len(des1) > 5 and len(des2) > 5:
            bf = cv2.BFMatcher(cv2.NORM_L2)
            raw_matches = bf.knnMatch(des1, des2, k=2)
            good_matches = []
            for m in raw_matches:
                if len(m) == 2 and m[0].distance < 0.78 * m[1].distance:
                    good_matches.append(m[0])
            sift_matches_count = len(good_matches)
            min_pts = min(len(kp1), len(kp2))
            sift_ratio = (sift_matches_count / max(1, min_pts)) * 100.0
    except Exception as e:
        logger.warning(f"SIFT hisoblashda ogohlantirish: {e}")

    # 2. Rang va Gistogramma taqqoslash
    hist_sim = 0.0
    try:
        ref_hsv = cv2.cvtColor(ref_rgb, cv2.COLOR_RGB2HSV)
        cam_hsv = cv2.cvtColor(cam_rgb, cv2.COLOR_RGB2HSV)
        h_bins = 30
        s_bins = 32
        histSize = [h_bins, s_bins]
        ranges = [0, 180, 0, 256]
        channels = [0, 1]

        hist_ref = cv2.calcHist([ref_hsv], channels, None, histSize, ranges, accumulate=False)
        cv2.normalize(hist_ref, hist_ref, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)

        hist_cam = cv2.calcHist([cam_hsv], channels, None, histSize, ranges, accumulate=False)
        cv2.normalize(hist_cam, hist_cam, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)

        hist_sim = float(cv2.compareHist(hist_ref, hist_cam, cv2.HISTCMP_CORREL))
        hist_sim = max(0.0, hist_sim)
    except Exception as e:
        logger.warning(f"Gistogramma taqqoslashda ogohlantirish: {e}")

    # 3. Strukturaviy korrelyatsiya (Template matching standard)
    struct_sim = 0.0
    try:
        size = (128, 128)
        r_resized = cv2.resize(ref_eq, size)
        c_resized = cv2.resize(cam_eq, size)
        res = cv2.matchTemplate(r_resized, c_resized, cv2.TM_CCOEFF_NORMED)
        struct_sim = float(res[0][0])
        struct_sim = max(0.0, struct_sim)
    except Exception as e:
        logger.warning(f"Struktura taqqoslashda ogohlantirish: {e}")

    # Kompleks hisoblangan ko'rsatkich
    # SIFT matches > 25 kuchli signal
    # sift_score: 25 match = ~80%, 40+ match = 95%
    sift_score = min(100.0, (sift_matches_count / 30.0) * 85.0) if sift_matches_count > 0 else 0.0

    # Umumiy ishonchlilik foizi (0 - 100%)
    if sift_matches_count >= 20:
        confidence = (sift_score * 0.60) + (hist_sim * 20.0) + (struct_sim * 20.0)
    else:
        # SIFT nuqtalar kam bo'lsa (masalan burilish yoki fokus past bo'lsa)
        confidence = (sift_score * 0.40) + (hist_sim * 30.0) + (struct_sim * 30.0)

    confidence = round(max(5.0, min(99.5, confidence)), 1)

    # Mos kelish chegarasi:
    # 1) Agar SIFT matches kamida 18 ta bo'lsa -> mos
    # 2) Yoki confidence >= 58.0% va struct_sim >= 0.50 -> mos
    is_match = (sift_matches_count >= 18) or (confidence >= 58.0 and struct_sim >= 0.50)

    return is_match, confidence, {
        "sift_matches": sift_matches_count,
        "sift_ratio": round(sift_ratio, 2),
        "hist_sim": round(hist_sim, 3),
        "struct_sim": round(struct_sim, 3),
        "local_confidence": confidence
    }


def compare_faces_gemini_vision(ref_img: Image.Image, cam_img: Image.Image, api_key: str):
    """
    Google Gemini Vision orqali eng yuqori darajadagi biometrik tahlil.
    Ikkala rasmni solishtirib, aynan bitta o'quvchimi yo'qligini aniqlaydi.
    """
    import requests

    try:
        # Rasmlarni JPEG formatiga siqish
        def to_b64(img):
            buf = io.BytesIO()
            # Katta rasmlarni optimal o'lchamga keltirish
            max_size = (640, 640)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(buf, format='JPEG', quality=85)
            return base64.b64encode(buf.getvalue()).decode('utf-8')

        ref_b64 = to_b64(ref_img)
        cam_b64 = to_b64(cam_img)

        prompt = (
            "Siz maktab darvozasidagi biometrik xavfsizlik va yuzni tanib olish tizimisiz.\n"
            "1-rasm: O'quvchining maktab bazasidagi rasmiy 3x4 fotosurati.\n"
            "2-rasm: O'quvchining hozirgina maktabga kirishida qorovul/nazoratchi tomonidan olingan jonli surati.\n"
            "Vazifa: Ikkala rasmdagi shaxs bir xil odammi yoki boshqa odammi ekanligini sinchkovlik bilan tekshiring.\n"
            "Yuz tuzilishi, ko'zlar, qoshlar, burun va yuz proporsiyalarini hisobga oling.\n"
            "Faqat quyidagi JSON formatida javob bering, ortiqcha matn yozmang:\n"
            "{\n"
            '  "match": true,\n'
            '  "confidence": 96.5,\n'
            '  "reason": "Yuz suyak tuzilishi va ko\'z shakli to\'liq mos keldi"\n'
            "}"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": "image/jpeg", "data": ref_b64}},
                    {"inline_data": {"mime_type": "image/jpeg", "data": cam_b64}}
                ]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }

        resp = requests.post(url, json=payload, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get('candidates', [])
            if candidates:
                raw_text = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '').strip()
                # Clean json markers
                if raw_text.startswith('```'):
                    raw_text = raw_text.split('\n', 1)[1]
                    if raw_text.endswith('```'):
                        raw_text = raw_text.rsplit('```', 1)[0]
                parsed = json.loads(raw_text.strip())
                is_match = bool(parsed.get('match'))
                confidence = float(parsed.get('confidence') or (95.0 if is_match else 25.0))
                reason = parsed.get('reason') or ("Shaxs yuzi to'liq mos keldi" if is_match else "Yuz bazadagi rasmga mos kelmadi")
                return True, is_match, confidence, reason

    except Exception as e:
        logger.warning(f"Gemini Vision biometrik tahlilda xatolik: {e}")

    return False, False, 0.0, ""


def verify_student_face_biometric(ref_input, cam_input, gemini_api_key: str = None):
    """
    Asosiy funksiya:
    1. Rasmlarni yuklaydi va tekshiradi.
    2. Mahalliy OpenCV SIFT/Histogram tahlilini amalga oshiradi.
    3. Agar Gemini API mavjud bo'lsa, multimodal sun'iy intellekt orqali yakuniy xulosa chiqaradi.
    4. Xulosa va batafsil ko'rsatkichlarni qaytaradi.
    """
    ref_img = load_pil_image(ref_input)
    cam_img = load_pil_image(cam_input)

    # 1. Mahalliy tahlil
    local_match, local_conf, details = compare_faces_local(ref_img, cam_img)

    # 2. Agar Gemini API mavjud bo'lsa, sun'iy intellektdan ham foydalanamiz
    if gemini_api_key and len(gemini_api_key.strip()) > 10:
        ai_success, ai_match, ai_conf, ai_reason = compare_faces_gemini_vision(ref_img, cam_img, gemini_api_key.strip())
        if ai_success:
            details['ai_used'] = True
            details['ai_reason'] = ai_reason
            details['ai_confidence'] = ai_conf
            # Gemini aniq xulosa berganda unga ustuvorlik beriladi
            final_match = ai_match
            final_conf = ai_conf
            msg = ai_reason if ai_reason else ("Shaxs tasdiqlandi ✅" if final_match else "Shaxs mos kelmadi ❌")
            return {
                "match": final_match,
                "confidence": round(final_conf, 1),
                "message": msg,
                "engine": "gemini_vision_and_local",
                "details": details
            }

    # 3. Lokal xulosa
    details['ai_used'] = False
    if local_match:
        msg = f"Shaxs Face ID orqali muvaffaqiyatli tasdiqlandi (Aniqlik: {local_conf}%) ✅"
    else:
        msg = f"Shaxs tasdiqlanmadi: Olingan surat bazadagi o'quvchi rasmi bilan mos kelmadi (Aniqlik: {local_conf}%) ❌"

    return {
        "match": local_match,
        "confidence": round(local_conf, 1),
        "message": msg,
        "engine": "local_opencv_sift",
        "details": details
    }
