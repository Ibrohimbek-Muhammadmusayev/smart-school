# Idrok Edu — Yagona Ta'lim va Davomat Ekotizimi

**Idrok Edu** — bu maktablar, o‘quv markazlari, kollejlar va universitetlar uchun zamonaviy, biometrik va sun'iy intellektga asoslangan kompleks ta'lim boshqaruv ekotizimi.

---

## 1. Platformaning Asosiy Qismlari (System Architecture Modules)

| Modul Nomi | To‘liq Tushuntirish (AI & Dev Context) | Mas'uliyati |
| :--- | :--- | :--- |
| **Idrok Edu** | Barcha xizmatlarni o‘z ichiga olgan bosh ekotizim brendi. | Asosiy platforma, landing sahifasi va umumiy boshqaruv shlyuzi. |
| **IdrokBoard** | Sinfdagi interaktiv aqlli doska dasturi (Smart Interactive Board OS/App). | Mavzuga mos AI vizualizatsiyasi, interaktiv doska, virtual laboratoriya va doska rejimlarini boshqarish. |
| **Idrok Core** | Markaziy boshqaruv dvigateli (Backend & Data Processor). | Dars jadvallari algoritmi, Face ID/davomat oqimlari, rollar (RBAC) va ma'lumotlar bazasi integratsiyasi. |
| **Idrok Vision** | Kameralar va Face ID bilan ishlovchi kompyuter ko‘rish moduli. | Kirish-chiqishdagi avtomatik davomat tahlili, darsdagi o‘quvchilar soni va ishtirok monitoringi. |
| **Idrok Mobile** | O‘quvchi, o‘qituvchi va ota-onalar uchun kross-platforma mobil ilova. | Shaxsiy jadval, baholar, davomat bildirishnomalari va dars materiallari. |

---

## 2. Texnologik Stack

- **Idrok Core (Backend):** Python (`Django 6`, Django REST Framework) + SQLite / PostgreSQL
- **Idrok Vision (Biometriya & ISAPI):** Hikvision MinMoe REST (ISAPI Digest Auth) + Face Embeddings + WebSocket/Polling
- **Idrok Edu Web (Dashboard):** React (`Vite`, Lucide Icons, Leaflet Maps)
- **Idrok Mobile (Mobil Ilova):** Flutter (`Dart 3`, Material 3, Connectivity Plus, Permission Handler)
- **IdrokBoard (Aqlli Doska):** Electron / Web Canvas + Google Gemini AI integratsiyasi
- **Xabarnomalar:** Telegram Bot API + SMS Gateway (Eskiz.uz)

---

## 3. Repozitoriy Tuzilmasi

```
smart-school/
├── backend/            # Idrok Core & Idrok Vision dvigateli
│   ├── api/            # API endpoints, Hikvision ISAPI servisi, Telegram xabarlar
│   ├── config/         # Django konfiguratsiyasi va settings
│   └── shooldex/       # IdrokBoard interaktiv doska backend API
├── frontend/           # Idrok Edu Web Dashboard (Super Admin, Maktab Admin, Ustoz)
│   ├── src/            # React UI komponentlari va sahifalari
│   └── index.html      # Idrok Edu bosh sahifasi
└── mobile_app/         # Idrok Mobile kross-platforma ilovasi (Flutter)
    ├── lib/            # Onboarding, Splash, O'quvchi, Ustoz va IdrokBoard pulti
    └── android/        # Android manifest va ruxsatlar
```
