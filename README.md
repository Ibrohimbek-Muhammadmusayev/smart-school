# Smart School: QR kodli Davomat Tizimi

Ushbu tizim maktablarda davomatni avtomatlashtirish, sinfxonalarda dinamik o'zgaruvchi QR-kod orqali o'quvchilar davomatini qayd etish hamda ota-onalarga Telegram orqali avtomatik xabar yuborish imkonini beradi.

---

## 1. Tizimning Ishlash Prinsipi

1. **Sinfxona Ekrani (Smart TV / Monitor / Planshet):**
   - Ekranda dinamik (har 15-30 soniyada yangilanadigan va vaqtga bog'langan tokenli) **QR-kod** ko'rinadi. Bu bir o'quvchi skrinshot qilib olib, do'stiga yuborishining oldini oladi.
2. **O'quvchi Telefoni (Mobil brauzer / Web ilova):**
   - O'quvchi o'z profiliga kirgan holda kamerasi orqali ekrandagi QR kodni skanerlaydi.
   - Server dinamik tokenni tekshiradi va davomat "Keldi" deb tasdiqlanadi.
3. **Telegram Bot:**
   - O'quvchi kelishi bilan uning ota-onasining Telegram akkauntiga avtomatik bildirishnoma boradi:
     *(Masalan: "Farzandingiz Aliyev Vali 08:15 da maktabga yetib keldi.")*
4. **Web Dashboard (Maktab Ma'muriyati va O'qituvchilar uchun):**
   - Barcha sinflar bo'yicha real vaqt rejimidagi statistika, grafiklar, o'quvchilar ro'yxati, kechikkanlar tahlili.
   - Hisobotlarni Excel va PDF formatida yuklab olish.

---

## 2. Texnologik Stack

- **Backend:** Python (`FastAPI`)
- **Ma'lumotlar bazasi:** `SQLite` (ishlab chiqish uchun) / `PostgreSQL` (production) + `SQLAlchemy`
- **Telegram Bot:** `Aiogram 3`
- **Frontend / Dashboard:** `React` (Vite + Tailwind CSS + Lucide Icons)
- **Mobil qism:** HTML5 Camera Scanner bilan mobil veb interfeys

---

## 3. Loyiha Tuzilmasi

```
smart-school/
├── backend/
│   ├── app/
│   │   ├── api/             # API endpoints (auth, attendance, classes, students)
│   │   ├── core/            # Sozlamalar, xavfsizlik (JWT)
│   │   ├── models/          # DB jadvallari
│   │   ├── schemas/         # Pydantic modellari
│   │   ├── services/        # QR kod logikasi, Telegram xabar yuborish
│   │   └── main.py          # Asosiy dastur
│   ├── bot/                 # Telegram bot kodi
│   └── requirements.txt
├── frontend/                # Web Dashboard, Sinf QR ekrani va Mobil Skaner
│   ├── src/
│   └── package.json
└── README.md
```
