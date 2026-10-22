import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Send, MessageSquare, Phone, Mail, Clock, 
  CheckCircle2, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, 
  Search, ExternalLink, Headphones, FileText, Check, Plus, RefreshCw
} from 'lucide-react';

const THEME = {
  primary: '#6C5CE7',
  primaryDark: '#5845D8',
  primaryLight: '#F1F0FF',
  gradient: 'linear-gradient(135deg, #7C69EF 0%, #5845D8 100%)',
  orange: '#FF9F43',
  green: '#10AC84',
  textDark: '#1E293B',
  textMuted: '#64748B',
  border: '#E2E8F0',
  bgSoft: '#F8FAFC',
};

const CATEGORIES = [
  { id: 'turnstile', label: 'Turniket & Face ID qurilmalari', icon: '🖥️' },
  { id: 'schedule', label: 'Dars jadvali va smenalar', icon: '📅' },
  { id: 'database', label: "O'quvchi va o'qituvchilar bazasi", icon: '👥' },
  { id: 'mobile', label: 'Mobil ilova & Dinamik QR kod', icon: '📱' },
  { id: 'general', label: 'Umumiy texnik yordam yoki taklif', icon: '⚙️' },
];

const INITIAL_FAQS = [
  {
    q: "Turniket qurilmasi internet uzilib qolsa qanday ishlaydi?",
    a: "Hikvision va MinMoe biometrik turniketlari to'liq oflayn xotira buferiga ega. Internet uzilgan paytda ham yuzni tanish va davomat belgilash to'xtovsiz davom etadi. Internet aloqasi tiklanishi bilan barcha kirish-chiqish qaydlari avtomatik ravishda serverga uzatiladi.",
    category: 'turnstile'
  },
  {
    q: "O'quvchi yoki o'qituvchining parolini qanday o'zgartirish mumkin?",
    a: "Maktab dashbordida 'O'quvchilar' yoki 'O'qituvchilar' bo'limiga kiring. Ro'yxatdan kerakli shaxsni topib, uning qatoridagi 'Tahrirlash' tugmasini bosing. Ochilgan oynada 'Yangi Parol' maydoniga xohlagan yangi parolni yozib saqlang.",
    category: 'database'
  },
  {
    q: "Dars jadvalini namunaviy reja bilan qanday tez to'ldirish mumkin?",
    a: "'Dars Jadvali' sahifasiga o'ting, tegishli sinf yoki guruhni tanlang va yuqori o'ng burchakdagi 'Namuna Jadval Yuklash' tugmasini bosing. Dushanbadan shanbagacha bo'lgan barcha asosiy fanlar va maktab o'qituvchilari dars jadvaliga avtomatik biriktiriladi.",
    category: 'schedule'
  },
  {
    q: "Mobil ilovada QR kod skanerlashda xatolik bo'lsa nima qilish kerak?",
    a: "Mobil ilovadagi QR kod har 15-20 soniyada xavfsizlik maqsadida yangilanadi. Agar skanerlashda muammo bo'lsa, o'qituvchi ekrandagi QR kodni yangilab qayta ko'rsatishi yoki o'quvchi smartfonida internet aloqasi barqarorligini tekshirish lozim.",
    category: 'mobile'
  },
  {
    q: "Maktab hududining GPS xaritadagi koordinatasini qanday yangilayman?",
    a: "'Maktab Sozlamalari' sahifasiga o'ting. 2-kartadagi interaktiv xaritadan maktab binosining aniq markaziy nuqtasini bosing va 'Joylashuvni Tasdiqlash' tugmasini bosing. Shundan so'ng mobil ilovadagi masofa cheklovi avtomatik yangilanadi.",
    category: 'general'
  },
  {
    q: "Ota-onalarga Telegram orqali xabarnoma bormayotgan bo'lsa nima qilish kerak?",
    a: "O'quvchi kartasida ota-onaning telefon raqami to'g'ri kiritilganligini tekshiring. So'ngra ota-ona o'z telefonida @idrok_maktab_bot botiga kirib /start buyrug'ini berishi va 'Telefon raqamimni ulashish' tugmasini bosgan bo'lishi shart.",
    category: 'mobile'
  }
];

export default function SchoolHelpSupportSection({ schoolId, schoolName, schoolConfig, currentUser, actorLabel, systemConfig }) {
  const supportPhone = systemConfig?.support_phone || "+998 (71) 200-00-55";
  const supportTelegram = systemConfig?.support_telegram || "@idrok_support_bot";
  const supportEmail = systemConfig?.support_email || "support@idrok-edu.uz";
  const supportHours = systemConfig?.support_hours || "Har kuni 08:00 – 20:00";
  const cleanTgUser = supportTelegram.replace('@', '');
  const supportTelegramLink = `https://t.me/${cleanTgUser}`;
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem(`smart_school_tickets_${schoolId}`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'TKT-1042',
        category: 'turnstile',
        categoryLabel: 'Turniket & Face ID qurilmalari',
        urgency: 'MEDIUM',
        subject: "Turniket va server aloqasi bo'yicha ko'mak",
        description: "Bosh kirishdagi MinMoe qurilmasining IP manzili yangilandi, dastur bilan qayta bog'lashda yordam kerak.",
        phone: schoolConfig?.phone || '+998 90 100-11-22',
        contactName: schoolConfig?.director_name || 'Rahimov Jamshid',
        status: 'RESOLVED',
        createdAt: '2026-10-18 11:20',
        responseNote: "Muhandis tomonidan masofadan IP manzil qayta sozlandi va test sinovi muvaffaqiyatli o'tdi. Qurilma jonli monitoringda faol.",
        respondedBy: "Jamshidbek Aliyev (Bosh muhandis)",
        respondedAt: '2026-10-18 11:45'
      }
    ];
  });

  const [form, setForm] = useState({
    category: 'turnstile',
    urgency: 'MEDIUM',
    subject: '',
    description: '',
    phone: schoolConfig?.phone || '+998 90 100-11-22',
    contactName: schoolConfig?.director_name || (currentUser?.name ? currentUser.name.replace(/\s*\(Direktor\)/i, '') : 'Rahimov Jamshid')
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(0); // first item open by default
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(`smart_school_tickets_${schoolId}`, JSON.stringify(tickets));
    } catch (_) {}
  }, [tickets, schoolId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      alert("Iltimos, so'rov mavzusi va batafsil tavsifini yozing.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const catObj = CATEGORIES.find(c => c.id === form.category) || CATEGORIES[0];
      const newTicketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowStr = new Date().toLocaleString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

      const newTicket = {
        id: newTicketNumber,
        category: form.category,
        categoryLabel: catObj.label,
        urgency: form.urgency,
        subject: form.subject.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
        contactName: form.contactName.trim(),
        status: 'PENDING',
        createdAt: nowStr,
        responseNote: "So'rovingiz qabul qilindi. Idrok Edu texnik mutaxassisi 15 daqiqa ichida siz bilan bog'lanadi yoki tizim orqali javob beradi.",
        respondedBy: "Idrok Edu Navbatchi Muhandisi",
        respondedAt: "Hozir ko'rib chiqilmoqda"
      };

      setTickets([newTicket, ...tickets]);
      setIsSubmitting(false);
      setSuccessBanner({
        ticketId: newTicketNumber,
        message: `Yordam so'rovingiz muvaffaqiyatli qabul qilindi (#${newTicketNumber})! Tez orada texnik mutaxassis siz bilan bog'lanadi.`
      });

      setForm({
        ...form,
        subject: '',
        description: '',
      });
      setExpandedTicketId(newTicketNumber);
    }, 400);
  };

  const filteredFaqs = INITIAL_FAQS.filter(faq => {
    const qMatch = faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || faq.a.toLowerCase().includes(faqSearch.toLowerCase());
    const catMatch = selectedCategoryFilter === 'ALL' || faq.category === selectedCategoryFilter;
    return qMatch && catMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1300, margin: '0 auto' }}>
      
      {/* 1. HEADER INFO BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        borderRadius: 14,
        padding: '24px 28px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: '0 10px 25px rgba(49, 46, 129, 0.15)'
      }}>
        <div style={{ maxWidth: 650 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 6,
              backgroundColor: 'rgba(255,255,255,0.15)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              24/7 Texnik Qo'llab-quvvatlash
            </span>
            <span style={{ fontSize: 11, color: '#A5B4FC' }}>• Idrok Edu Support Center</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Maktabingizga qanday yordam bera olamiz?
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#C7D2FE', lineHeight: 1.5 }}>
            Turniketlar, dars jadvallari, davomat yoki mobil ilovalar bo'yicha savollaringiz bo'lsa, to'g'ridan-to'g'ri so'rov qoldiring yoki biz bilan tezkor aloqaga chiqing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            padding: '12px 18px',
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(16, 172, 132, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={18} color="#34D399" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 600 }}>Tezkor Call-markaz</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}>{supportPhone}</div>
            </div>
          </div>

          <a
            href={supportTelegramLink}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '12px 18px',
              borderRadius: 10,
              backgroundColor: '#38BDF8',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
              transition: 'transform 0.15s ease'
            }}>
            <MessageSquare size={16} /> Telegram Yordam ({supportTelegram})
          </a>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 10,
          backgroundColor: '#ECFDF5',
          border: '1.5px solid #10B981',
          color: '#065F46',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={18} color="#10B981" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{successBanner.message}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#065F46', fontWeight: 700, fontSize: 13 }}>
            Tushundim
          </button>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN SECTION: Ticket Form & Direct Contacts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* LEFT: SUBMIT TICKET FORM */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 26,
          border: `1px solid ${THEME.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={18} color={THEME.primary} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: THEME.textDark }}>
                Yangi Yordam So'rovi Yuborish
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: THEME.textMuted }}>
                Texnik mutaxassislarimiz so'rovingizni tezda qabul qilib, yechim berishadi
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Kategoriya Tanlash */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 6 }}>
                1. So'rov Yo'nalishi / Bo'limi *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const isSel = form.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.id })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: isSel ? `1.5px solid ${THEME.primary}` : '1px solid #E2E8F0',
                        backgroundColor: isSel ? THEME.primaryLight : '#F8FAFC',
                        color: isSel ? THEME.primary : THEME.textDark,
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.15s ease'
                      }}>
                      <span>{cat.icon}</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shoshilinchlik darajasi */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 6 }}>
                2. Muhimlik Darajasi *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { key: 'LOW', label: 'Oddiy', sub: "Savol / Yo'riqnoma", color: '#10AC84' },
                  { key: 'MEDIUM', label: "O'rta", sub: 'Qisman nosozlik', color: '#F59E0B' },
                  { key: 'HIGH', label: 'Shoshilinch', sub: "Tizim to'xtab qolgan", color: '#EF4444' }
                ].map(urg => {
                  const isSel = form.urgency === urg.key;
                  return (
                    <button
                      key={urg.key}
                      type="button"
                      onClick={() => setForm({ ...form, urgency: urg.key })}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: isSel ? `1.5px solid ${urg.color}` : '1px solid #E2E8F0',
                        backgroundColor: isSel ? `${urg.color}15` : '#F8FAFC',
                        color: isSel ? urg.color : THEME.textDark,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}>
                      <div>{urg.label}</div>
                      <div style={{ fontSize: 10, color: THEME.textMuted, fontWeight: 500, marginTop: 2 }}>{urg.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mavzu */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 6 }}>
                3. Muammo / So'rov Mavzusi (Qisqacha) *
              </label>
              <input
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Masalan: 1-kirishdagi turniket qurilmasi qizil yonib qoldi..."
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  fontWeight: 500,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Batafsil tavsif */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 6 }}>
                4. Batafsil Tavsif (Qanday yordam kerak?) *
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Vaziyatni iloji boricha aniq bayon qiling: qachon boshlandi, qaysi sinf yoki qurilma bilan bog'liq..."
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  fontWeight: 500,
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Bog'lanish ma'lumotlari */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 4 }}>
                  Aloqa Telefoni *
                </label>
                <input
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+998 90 123-45-67"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 12.5,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 4 }}>
                  Mas'ul Shaxs
                </label>
                <input
                  value={form.contactName}
                  onChange={e => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Mas'ul xodim ismi"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 12.5,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: 6,
                padding: '13px 20px',
                borderRadius: 8,
                background: THEME.gradient,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13.5,
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(108, 92, 231, 0.25)',
                transition: 'opacity 0.15s ease'
              }}>
              <Send size={16} />
              {isSubmitting ? "Yuborilmoqda..." : "Yordam So'rovini Yuborish"}
            </button>
          </form>
        </div>

        {/* RIGHT: CONTACT CHANNELS & EMERGENCY HOTLINES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Operatorlar & Call-center kartasi */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 22,
            border: `1px solid ${THEME.border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#10AC84" /> Idrok Edu Rasmiy Texnik Xizmati
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={16} color={THEME.primary} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>Asosiy Call-markaz (Bepul)</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.textDark }}>{supportPhone}</div>
                  <div style={{ fontSize: 10.5, color: '#10AC84', fontWeight: 600 }}>{supportHours}</div>
                </div>
              </div>

              <a href={supportTelegramLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', padding: 12, borderRadius: 8, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={16} color="#10AC84" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>Telegram Qo'llab-quvvatlash</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.primary }}>{supportTelegram}</div>
                  <div style={{ fontSize: 10.5, color: THEME.textMuted }}>O'rtacha javob vaqti: 5 daqiqa</div>
                </div>
              </a>

              <a href={`mailto:${supportEmail}`} style={{ textDecoration: 'none', color: 'inherit', padding: 12, borderRadius: 8, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={16} color="#3B82F6" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>Elektron Pochta</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.primary }}>{supportEmail}</div>
                </div>
              </a>
            </div>
          </div>

          {/* Regional Engineer Info */}
          <div style={{
            padding: 18,
            borderRadius: 12,
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={16} color="#1D4ED8" />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1E3A8A' }}>
                Hududiy Muhandis Kafolati
              </div>
              <div style={{ fontSize: 11.5, color: '#1E40AF', marginTop: 3, lineHeight: 1.45 }}>
                Agar turniket yoki server qurilmasi jismonan ishdan chiqsa, 24 soat ichida mutaxassis maktab hududiga tashrif buyurib, joyida bartaraf etadi.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MENING YORDAM SO'ROVLARIM (MY TICKETS LIST) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 26,
        border: `1px solid ${THEME.border}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color={THEME.primary} /> Mening Yordam So'rovlarim ({tickets.length})
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: THEME.textMuted }}>
              Ushbu maktab tomonidan yuborilgan barcha texnik murojaatlar va ularning hal bo'lish holati
            </p>
          </div>
          <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>
            Avtomatik saqlanadi
          </div>
        </div>

        {tickets.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
            Hozircha yordam so'rovi yuborilmagan.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tickets.map(t => {
              const isExp = expandedTicketId === t.id;
              const isResolved = t.status === 'RESOLVED';
              return (
                <div
                  key={t.id}
                  style={{
                    borderRadius: 10,
                    border: isResolved ? '1px solid #A7F3D0' : '1px solid #FED7AA',
                    backgroundColor: isResolved ? '#F0FDF4' : '#FFFBEB',
                    padding: 16,
                    transition: 'all 0.15s ease'
                  }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: 10 }}
                    onClick={() => setExpandedTicketId(isExp ? null : t.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        backgroundColor: isResolved ? '#10B981' : '#F59E0B',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: '0.02em'
                      }}>
                        {t.id}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: THEME.textDark }}>
                        {t.subject}
                      </span>
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.06)', color: THEME.textMuted, fontWeight: 600 }}>
                        {t.categoryLabel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: isResolved ? '#059669' : '#D97706',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}>
                        {isResolved ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {isResolved ? "Hal qilindi" : "Ko'rib chiqilmoqda"}
                      </span>
                      <span style={{ fontSize: 11, color: THEME.textMuted }}>{t.createdAt}</span>
                      {isExp ? <ChevronUp size={16} color={THEME.textMuted} /> : <ChevronDown size={16} color={THEME.textMuted} />}
                    </div>
                  </div>

                  {/* Expanded Ticket Details */}
                  {isExp && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <div style={{ fontSize: 12.5, color: THEME.textDark, lineHeight: 1.5, marginBottom: 12 }}>
                        <b>Murojaat tavsifi:</b> {t.description}
                      </div>

                      {t.responseNote && (
                        <div style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          backgroundColor: '#FFFFFF',
                          border: '1px solid rgba(0,0,0,0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: THEME.primary, display: 'flex', justifyContent: 'space-between' }}>
                            <span>👨‍💻 {t.respondedBy || "Texnik Mutaxassis"}:</span>
                            <span style={{ color: THEME.textMuted, fontWeight: 500 }}>{t.respondedAt}</span>
                          </div>
                          <div style={{ fontSize: 12.5, color: THEME.textDark, lineHeight: 1.5 }}>
                            {t.responseNote}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: THEME.textMuted }}>
                        <span>Aloqa: <b>{t.contactName}</b> ({t.phone})</span>
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() => {
                              setTickets(tickets.map(item => item.id === t.id ? { ...item, status: 'RESOLVED', responseNote: item.responseNote + " (Foydalanuvchi muammo hal bo'lganligini tasdiqladi)" } : item));
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              backgroundColor: '#10B981',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}>
                            ✓ Muammo hal bo'ldi deb belgilash
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. KO'P BERILADIGAN SAVOLLAR (FAQ ACCORDION) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 26,
        border: `1px solid ${THEME.border}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={18} color={THEME.primary} /> Ko'p Beriladigan Savollar va Foydalanish Qo'llanmasi (FAQ)
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: THEME.textMuted }}>
              Tizimdan foydalanishda eng ko'p uchraydigan savollarga tezkor javoblar
            </p>
          </div>

          <div style={{ position: 'relative', width: 260 }}>
            <Search size={14} color={THEME.textMuted} style={{ position: 'absolute', left: 10, top: 10 }} />
            <input
              value={faqSearch}
              onChange={e => setFaqSearch(e.target.value)}
              placeholder="Savollar ichidan izlash..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 12,
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: selectedCategoryFilter === 'ALL' ? `1.5px solid ${THEME.primary}` : '1px solid #E2E8F0',
              backgroundColor: selectedCategoryFilter === 'ALL' ? THEME.primaryLight : '#F8FAFC',
              color: selectedCategoryFilter === 'ALL' ? THEME.primary : THEME.textDark,
              fontWeight: 600,
              fontSize: 11.5,
              cursor: 'pointer'
            }}>
            Barcha savollar ({INITIAL_FAQS.length})
          </button>
          {CATEGORIES.map(c => {
            const count = INITIAL_FAQS.filter(f => f.category === c.id).length;
            const isSel = selectedCategoryFilter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(c.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: isSel ? `1.5px solid ${THEME.primary}` : '1px solid #E2E8F0',
                  backgroundColor: isSel ? THEME.primaryLight : '#F8FAFC',
                  color: isSel ? THEME.primary : THEME.textDark,
                  fontWeight: 600,
                  fontSize: 11.5,
                  cursor: 'pointer'
                }}>
                {c.icon} {c.label} ({count})
              </button>
            );
          })}
        </div>

        {/* FAQ List Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredFaqs.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
              Mos keladigan savollar topilmadi. Yuqoridagi form orqali so'rov qoldirishingiz mumkin.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: 8,
                    border: isOpen ? `1.5px solid ${THEME.primary}` : '1px solid #E2E8F0',
                    backgroundColor: isOpen ? '#FAF9FF' : '#FFFFFF',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease'
                  }}>
                  <div
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      gap: 12
                    }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: isOpen ? THEME.primary : THEME.textDark }}>
                      {faq.q}
                    </div>
                    {isOpen ? <ChevronUp size={16} color={THEME.primary} /> : <ChevronDown size={16} color={THEME.textMuted} />}
                  </div>
                  {isOpen && (
                    <div style={{
                      padding: '0 18px 16px',
                      fontSize: 13,
                      color: '#475569',
                      lineHeight: 1.6,
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: 12
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
