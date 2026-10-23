import React, { useState, useEffect } from 'react';
import {
  Building2, Shield, Users, CheckCircle2, AlertTriangle,
  Search, Plus, RefreshCw, Key, Send, TrendingUp,
  BarChart3, Activity, ChevronRight, Filter, Download,
  ArrowUpRight, School, Bell, X, Menu,
  Power, Lock, Unlock, Eye, EyeOff, MapPin, Phone, Mail, Award,
  Sliders, Layers, Server, Database, LogOut, UserPlus, BookOpen,
  Calendar, CheckCircle, QrCode, GraduationCap, Clock,
  FolderOpen, Sparkles, Smartphone, Check, Edit, Trash2,
  FileSpreadsheet, FileText, FileCode, Monitor, Cpu, ScanFace,
  Bot, Zap, CreditCard, Wrench, Star, Pause, Archive, Settings,
  HelpCircle, MessageSquare, ShieldCheck, AlertCircle, CheckSquare, Square, DoorOpen,
  ChevronDown, ExternalLink, ArrowRight, Laptop, Tablet, Radio
} from 'lucide-react';

const UZBEKISTAN_REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Farg‘ona viloyati",
  "Andijon viloyati",
  "Namangan viloyati",
  "Buxoro viloyati",
  "Xorazm viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Navoiy viloyati",
  "Qoraqalpog‘iston Respublikasi"
];

const SCHOOL_TYPES = [
  { value: "PUBLIC", label: "Davlat umumta'lim maktabi" },
  { value: "PRIVATE", label: "Xususiy maktab" },
  { value: "SPECIALIZED", label: "Ixtisoslashtirilgan / Prezident maktabi" },
  { value: "COLLEGE", label: "Texnikum / Kollej / Litsey" },
  { value: "LEARNING_CENTER", label: "O'quv markazi / Kurs" }
];

const TURNSTILE_OPTIONS = [
  { value: "EQUIPPED", label: "Face ID turniket apparati mavjud (Hikvision, Dahua va b.)", desc: "Terminal to'g'ridan-to'g'ri integratsiya qilinadi" },
  { value: "MOBILE_KIOSK", label: "Turniket yo'q — Mobil Darvoza Kioski va QR orqali", desc: "Qorovul / navbatchi planshet yoki telefondan tekshiradi" },
  { value: "NEED_INSTALLATION", label: "Yangi turniket o'rnatmoqchimiz (Maslahat kerak)", desc: "Mutaxassislarimiz uskunalarni o'rnatishda yordam beradi" }
];

const AVAILABLE_MODULES = [
  { id: "face_turnstile", label: "Face ID & QR Turniket Davomat Tizimi" },
  { id: "parent_bot", label: "Ota-onalar Uchun 24/7 Telegram Xabarnoma Boti" },
  { id: "electronic_journal", label: "Elektron Jurnal, Dars Jadvali & Baholash" },
  { id: "idrok_board", label: "Aqlli Doska (IdrokBoard AI Masofaviy Pulti)" },
  { id: "mobile_app", label: "O'quvchi va O'qituvchilar Mobil Ilovasi (iOS / Android)" },
  { id: "kiosk_mode", label: "Qorovul / Nazoratchi Uchun Mobil Kiosk Kabineti" },
  { id: "finance_analytics", label: "Moliya, Shartnomalar & Super Admin Analitikasi" }
];

export default function LandingPage({ onGoToLogin, systemConfig }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Ariza formasi holati
  const [formData, setFormData] = useState({
    school_name: '',
    school_type: 'PUBLIC',
    region: 'Toshkent shahri',
    district: '',
    address: '',
    contact_name: '',
    contact_role: 'Direktor',
    phone: '',
    telegram_username: '',
    estimated_students: '',
    estimated_teachers: '',
    turnstile_status: 'MOBILE_KIOSK',
    desired_modules: [
      'Face ID & QR Turniket Davomat Tizimi',
      'Ota-onalar Uchun 24/7 Telegram Xabarnoma Boti',
      'Elektron Jurnal, Dars Jadvali & Baholash',
      "O'quvchi va O'qituvchilar Mobil Ilovasi (iOS / Android)"
    ],
    notes: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const handleModuleToggle = (moduleLabel) => {
    setFormData(prev => {
      const exists = prev.desired_modules.includes(moduleLabel);
      return {
        ...prev,
        desired_modules: exists
          ? prev.desired_modules.filter(m => m !== moduleLabel)
          : [...prev.desired_modules, moduleLabel]
      };
    });
  };

  const validateStep = (stepNumber) => {
    setSubmitError(null);
    if (stepNumber === 1) {
      if (!formData.school_name.trim()) {
        setSubmitError("Iltimos, maktab nomini kiriting.");
        return false;
      }
      if (!formData.district.trim()) {
        setSubmitError("Iltimos, tuman yoki shaharni kiriting.");
        return false;
      }
      return true;
    }
    if (stepNumber === 2) {
      if (!formData.contact_name.trim()) {
        setSubmitError("Iltimos, mas'ul shaxs (Direktor) F.I.SH ni kiriting.");
        return false;
      }
      if (!formData.phone.trim() || formData.phone.length < 9) {
        setSubmitError("Iltimos, to'liq telefon raqamini kiriting.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setSubmitError(null);
      setCurrentStep(prev => Math.min(4, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmitApplication = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitError(null);

    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/school-applications/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(data);
        setCurrentStep(1);
        setFormData({
          school_name: '',
          school_type: 'PUBLIC',
          region: 'Toshkent shahri',
          district: '',
          address: '',
          contact_name: '',
          contact_role: 'Direktor',
          phone: '',
          telegram_username: '',
          estimated_students: '',
          estimated_teachers: '',
          turnstile_status: 'MOBILE_KIOSK',
          desired_modules: [
            'Face ID & QR Turniket Davomat Tizimi',
            'Ota-onalar Uchun 24/7 Telegram Xabarnoma Boti',
            'Elektron Jurnal, Dars Jadvali & Baholash',
            "O'quvchi va O'qituvchilar Mobil Ilovasi (iOS / Android)"
          ],
          notes: ''
        });
      } else {
        setSubmitError(data.detail || "Arizani yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    } catch (err) {
      setSubmitError("Server bilan aloqa o'rnatib bo'lmadi. Internet aloqasini tekshiring.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToApply = () => {
    const el = document.getElementById('apply-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", backgroundColor: '#FFFFFF', color: '#0F172A', minHeight: '100vh' }}>
      
      {/* =========================================================================
          1. NAVBAR (HEADER)
      ========================================================================= */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', padding: '14px 24px'
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)'
            }}>
              <GraduationCap size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Idrok Edu
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, backgroundColor: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}>
                  SMART SCHOOL
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                Milliy Ta'limni Raqamlashtirish Platformasi
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div style={{ display: 'none', mdDisplay: 'flex', alignItems: 'center', gap: 28 }} className="desktop-menu">
            <button onClick={() => scrollToSection('modules-section')} style={navLinkStyle}>Imkoniyatlar</button>
            <button onClick={() => scrollToSection('devices-section')} style={navLinkStyle}>Face ID & Kiosk</button>
            <button onClick={() => scrollToSection('idrokboard-section')} style={navLinkStyle}>Aqlli Doska</button>
            <button onClick={() => scrollToSection('benefits-section')} style={navLinkStyle}>Afzalliklar</button>
            <button onClick={() => scrollToSection('steps-section')} style={navLinkStyle}>Qanday ishlaydi?</button>
            <button onClick={() => scrollToSection('faq-section')} style={navLinkStyle}>Savollar</button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onGoToLogin}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 12, border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF', color: '#1E293B', fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#94A3B8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            >
              <Lock size={15} color="#4F46E5" />
              Tizimga Kirish
            </button>

            <button
              onClick={scrollToApply}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: '#FFFFFF', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)'; }}
            >
              <Plus size={16} />
              Maktabni Qo'shish
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================= */}
      <section style={{
        position: 'relative', overflow: 'hidden', padding: '70px 24px 90px',
        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(99, 102, 241, 0.15), rgba(255, 255, 255, 0))'
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', textAlign: 'center' }}>
          
          {/* Pill Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 30, backgroundColor: '#EEF2FF',
            border: '1px solid #C7D2FE', color: '#4338CA', fontSize: 13, fontWeight: 700,
            marginBottom: 24, boxShadow: '0 2px 6px rgba(79, 70, 229, 0.08)'
          }}>
            <Sparkles size={16} color="#4F46E5" />
            <span>O'zbekistondagi 1-Raqamli Maktab Raqamlashtirish Ekotizimi</span>
            <span style={{ backgroundColor: '#4F46E5', color: '#FFF', fontSize: 10, padding: '2px 8px', borderRadius: 10 }}>2026 Yangi</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 900, lineHeight: 1.15,
            letterSpacing: '-1.5px', color: '#0F172A', maxWidth: 950, margin: '0 auto 24px'
          }}>
            Zamonaviy Maktabingiz Uchun <br/>
            <span style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Yagona Aqlli Boshqaruv Platformasi
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)', color: '#475569', lineHeight: 1.6,
            maxWidth: 780, margin: '0 auto 36px', fontWeight: 400
          }}>
            Face ID va QR turniket kirish nazorati, interaktiv aqlli doska (<strong>IdrokBoard</strong>), elektron jurnal, 24/7 ota-onalar Telegram boti hamda sun'iy intellekt tahlili — qimmat uskunalarsiz ham har qanday maktabga oson moslashadi.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 50 }}>
            <button
              onClick={scrollToApply}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 36px', borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: '#FFFFFF', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.35)', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 30px rgba(79, 70, 229, 0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.35)'; }}
            >
              <Building2 size={20} />
              Maktabingizni Ulash Uchun Ariza Qoldiring
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onGoToLogin}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 28px', borderRadius: 16, border: '1.5px solid #CBD5E1',
                backgroundColor: '#FFFFFF', color: '#1E293B', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#94A3B8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            >
              <Monitor size={18} color="#4F46E5" />
              Tizim Boshqaruv Paneliga Kirish
            </button>
          </div>

          {/* Live Trust Metrics Bar */}
          <div style={{
            maxWidth: 1000, margin: '0 auto', padding: '24px 30px',
            backgroundColor: '#FFFFFF', borderRadius: 24,
            border: '1px solid #E2E8F0', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 20
          }}>
            <MetricItem number="50+" label="Maktablar & Kollejlar" sub="O'zbekiston bo'ylab faol" />
            <MetricItem number="25 000+" label="O'quvchi & O'qituvchi" sub="Kunlik real foydalanuvchilar" />
            <MetricItem number="99.5%" label="Biometrik Aniqlik" sub="Face ID & Anti-spoofing" />
            <MetricItem number="0.3 sek" label="Tezkor O'tish" sub="Turniket va QR skanerlash" />
            <MetricItem number="100%" label="Ota-onalar Xabardorligi" sub="Lahzalik Telegram bot" />
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. IKKI XIL INTEGRATSIYA: USKUNALI VA MOBIL KIOSK
      ========================================================================= */}
      <section id="devices-section" style={{ padding: '80px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: '#EEF2FF', padding: '4px 14px', borderRadius: 20 }}>
              Moslashuvchan Kirish Nazorati
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: '#0F172A', marginTop: 12 }}>
              Maktabingizda Qimmatbaho Face ID Turniket Bo'lmasa Ham Ishlaydi!
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 680, margin: '8px auto 0' }}>
              Bizning tizimimiz maktabingizdagi mavjud sharoitga 100% moslashadi. Ikkala usul ham to'liq integratsiya qilingan:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 30 }}>
            
            {/* 1-USUL: Face ID qurilmasi bor maktablar */}
            <div style={{
              backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32,
              border: '1.5px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, backgroundColor: '#EEF2FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
                }}>
                  <ScanFace size={30} color="#4F46E5" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ backgroundColor: '#DEF7EC', color: '#03543F', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                    1-USUL: USKUNALI TURNIKET
                  </span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                  Hikvision MinMoe va Face ID Qurilmalari
                </h3>
                <p style={{ color: '#64748B', fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}>
                  Maktabingiz darvozasida jismoniy Face ID turniketi bo'lsa, u bizning markaziy ISAPI protokolimiz orqali to'g'ridan-to'g'ri ulanadi. O'quvchi o'tishi bilan yuz avtomatik taniladi va darhol bazaga yoziladi.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <FeatureCheck text="Hikvision MinMoe (DS-K1T673 va boshqalar) bilan sinxronizatsiya" />
                  <FeatureCheck text="0.3 soniyada anti-spoofing (surat yoki videodan himoya)" />
                  <FeatureCheck text="Internet uzilganda ham lokal xotirada saqlash" />
                  <FeatureCheck text="RFID plastik karta va yuz orqali birdek ishlash" />
                </div>
              </div>
            </div>

            {/* 2-USUL: Face ID qurilmasi bo'lmagan maktablar uchun Mobil Kiosk */}
            <div style={{
              backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32,
              border: '2px solid #818CF8', boxShadow: '0 12px 30px rgba(99, 102, 241, 0.12)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: -12, right: 24, backgroundColor: '#4F46E5', color: '#FFF', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
                TAVSIYA ETILADI • TEJAMKOR
              </div>
              <div>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, backgroundColor: '#FAF5FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
                }}>
                  <Smartphone size={30} color="#7C3AED" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ backgroundColor: '#F3E8FF', color: '#6B21A8', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                    2-USUL: QOROVUL MOBIL KIOSKI
                  </span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                  Mobil Ilova Orqali QR va Jonli Yuz Tekshiruvi
                </h3>
                <p style={{ color: '#64748B', fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}>
                  Turniket sotib olishga hojat yo'q! Qorovul yoki navbatchi o'qituvchi o'z telefoni orqali o'quvchining QR kodini skanerlaydi yoki ismi/ID sini topib, yuzini suratga oladi. Tizim bazadagi 3x4 rasm bilan solishtirib tasdiqlaydi!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <FeatureCheck text="QR kod orqali 1 soniyada uzluksiz skanerlash" />
                  <FeatureCheck text="Telefoni yo'q o'quvchini Ism yoki ID bo'yicha qidirish" />
                  <FeatureCheck text="Kameradan olingan yuzni bazadagi 3x4 rasm bilan biometrik solishtirish" />
                  <FeatureCheck text="Begona shaxslarni rad etish va ota-onaga lahzalik xabar" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          4. BARCHA TIZIM MODULLARI
      ========================================================================= */}
      <section id="modules-section" style={{ padding: '90px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: '#EEF2FF', padding: '4px 14px', borderRadius: 20 }}>
              To'liq Ekotizim
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#0F172A', marginTop: 12 }}>
              Maktab Faoliyatining Barcha Bo'g'inlarini Qamrab Oluvchi Modullar
            </h2>
            <p style={{ color: '#64748B', fontSize: 16.5, maxWidth: 740, margin: '10px auto 0' }}>
              Qog'ozbozlik, kechikishlar va intizomsizlikka chek qo'ying. Har bir foydalanuvchi uchun qulay va intuitiv vositalar:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            
            <ModuleCard
              icon={<ScanFace size={26} color="#4F46E5" />}
              iconBg="#EEF2FF"
              title="1. Biometrik Davomat & Turniket"
              desc="Face ID, QR-kod yoki mobil kiosk orqali maktabga kirish-chiqishni to'liq nazorat qiling. Kunlik davomat real vaqtda yangilanadi va o'quvchilar soni avtomatik hisoblanadi."
            />

            <div id="idrokboard-section">
              <ModuleCard
                icon={<Monitor size={26} color="#7C3AED" />}
                iconBg="#FAF5FF"
                title="2. Aqlli Doska (IdrokBoard AI)"
                desc="Sinfdagi televizor yoki interaktiv doska uchun raqamli doska. O'qituvchi o'z telefonidagi ilova bilan doskani masofadan boshqaradi, yozadi va Gemini AI orqali misollar yaratadi."
              />
            </div>

            <ModuleCard
              icon={<BookOpen size={26} color="#059669" />}
              iconBg="#ECFDF5"
              title="3. Elektron Jurnal & Baholash"
              desc="O'qituvchilar uchun qulay elektron jurnal. Dars jadvaliga asosan darslar, davomat, 1-5 yoki 100 balli tizimda baholar hamda mavzular 1 ta bosishda to'ldiriladi."
            />

            <ModuleCard
              icon={<Bot size={26} color="#D97706" />}
              iconBg="#FFFBEB"
              title="4. Ota-onalar Uchun 24/7 Telegram Boti"
              desc="Farzandi maktabga qachon kirdi? Darsda qanday baho oldi? Kechikdimi yoki sababsiz dars qoldirdimi? Ota-onaning shaxsiy Telegramiga soniyalar ichida avtomatik hisobot boradi."
            />

            <ModuleCard
              icon={<Smartphone size={26} color="#2563EB" />}
              iconBg="#EFF6FF"
              title="5. O'quvchi & O'qituvchi Mobil Ilovasi"
              desc="O'quvchining shaxsiy dinamik QR kodi, dars jadvali, baholari va yulduzlar balansi. O'qituvchi uchun parollarni boshqarish, jurnal va masofaviy boshqaruv pulti."
            />

            <ModuleCard
              icon={<BarChart3 size={26} color="#DC2626" />}
              iconBg="#FEF2F2"
              title="6. Boshqaruv & Server Analitikasi"
              desc="Direktor va ma'muriyat uchun real vaqtli grafiklar, sinflar davomat reytingi, xodimlar intizomi, oylik obuna hisob-kitoblari va server xotirasi holati."
            />

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. NEGA BIZ? AFZALLIKLAR & MOSLASHUVCHANLIK
      ========================================================================= */}
      <section id="benefits-section" style={{ padding: '80px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: '#EEF2FF', padding: '4px 14px', borderRadius: 20 }}>
              Nega Aynan Biz?
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, color: '#0F172A', marginTop: 12 }}>
              Har Qanday Maktab va Ta'lim Muassasasiga Moslashadi
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 700, margin: '8px auto 0' }}>
              Oddiy dasturlardan farqli o'laroq, bizning platformamiz o'quv dargohingizning qonun-qoidalari va atamalariga avtomatik moslashadi:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <BenefitCard
              icon={<Layers size={22} color="#4F46E5" />}
              title="Avtomatik Terminologiya"
              desc="Maktablarda: Sinf, Dars, O'quvchi. Kollej va Texnikumlarda: Guruh, Para, Talaba. Tizim muassasangizga qarab o'zgaradi."
            />
            <BenefitCard
              icon={<ShieldCheck size={22} color="#059669" />}
              title="To'liq Xavfsizlik & Izolyatsiya"
              desc="Har bir maktabning ma'lumotlari, o'quvchilari va fotosuratlari boshqa maktablardan mutlaqo ajratilgan (Multi-tenant xavfsizlik)."
            />
            <BenefitCard
              icon={<Zap size={22} color="#D97706" />}
              title="1 Kunda Tezkor Ishga Tushirish"
              desc="Server yoki murakkab o'rnatish talab etilmaydi. Super Admin arizangizni tasdiqlashi bilan tizim darhol tayyor bo'ladi."
            />
            <BenefitCard
              icon={<CreditCard size={22} color="#7C3AED" />}
              title="Moslashuvchan Narxlar"
              desc="Boshlang'ich davrda tekin sinov muddati (Trial) yoki maktabingiz byudjetiga mos hamyonbop oylik to'lovlar."
            />
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. QANDAY ISHLAYDI? BOSQICHLAR
      ========================================================================= */}
      <section id="steps-section" style={{ padding: '80px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: '#EEF2FF', padding: '4px 14px', borderRadius: 20 }}>
              Oddiy va Tezkor
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0F172A', marginTop: 12 }}>
              Maktabingizni Tizimga Ulash 4 Bosqichda
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            <StepItem step="1" title="Arizani To'ldiring" desc="Quyidagi so'rovnomaga maktabingiz ma'lumotlari va aloqa raqamini kiriting." />
            <StepItem step="2" title="Super Admin Tasdiqlaydi" desc="Super admin so'rovingizni ko'rib chiqib, 1 ta bosishda maktabingizni ochadi." />
            <StepItem step="3" title="Login & Parolni Oling" desc="Direktor uchun shaxsiy boshqaruv kabineti ma'lumotlari Telegram orqali yuboriladi." />
            <StepItem step="4" title="Foydalanishni Boshlang" desc="O'qituvchilar va o'quvchilarni kiritib, zamonaviy raqamli ta'limdan bahramand bo'ling." />
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. MAKTABNI RO'YXATDAN O'TKAZISH ARIZA SO'ROVNOMASI (INTERACTIVE FORM)
      ========================================================================= */}
      <section id="apply-section" style={{
        padding: '90px 24px',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
        color: '#FFFFFF'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#C7D2FE', fontSize: 12, fontWeight: 800, padding: '5px 16px', borderRadius: 20, letterSpacing: '1px' }}>
              ONLAYN SO'ROVNOMA
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginTop: 14, color: '#FFFFFF' }}>
              Maktabingizni Platformaga Qo'shish Uchun Ariza Yuboring
            </h2>
            <p style={{ color: '#E0E7FF', fontSize: 16, maxWidth: 640, margin: '10px auto 0', lineHeight: 1.6 }}>
              So'rovnomani to'ldiring. Ma'lumotlaringiz to'g'ridan-to'g'ri Super Adminga boradi va maktabingiz uchun shaxsiy hisob ochiladi.
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: 28, padding: '36px 32px',
            color: '#0F172A', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
          }}>

            {/* Success Alert Modal */}
            {submitSuccess && (
              <div style={{
                padding: '24px', borderRadius: 20, backgroundColor: '#F0FDF4',
                border: '1.5px solid #86EFAC', marginBottom: 24, textAlign: 'center'
              }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <CheckCircle2 size={36} color="#16A34A" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#166534', marginBottom: 8 }}>
                  Arizangiz Muvaffaqiyatli Qabul Qilindi! 🎉
                </h3>
                <p style={{ color: '#15803D', fontSize: 14.5, lineHeight: 1.6, maxWidth: 540, margin: '0 auto 16px' }}>
                  {submitSuccess.message}
                </p>
                <button
                  onClick={() => setSubmitSuccess(null)}
                  style={{
                    padding: '8px 20px', borderRadius: 10, border: 'none',
                    backgroundColor: '#16A34A', color: '#FFF', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                  }}
                >
                  Yangi ariza to'ldirish
                </button>
              </div>
            )}

            {submitError && (
              <div style={{
                padding: '14px 18px', borderRadius: 14, backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20
              }}>
                <AlertTriangle size={20} color="#DC2626" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); if (currentStep < 4) handleNextStep(); else handleSubmitApplication(e); }}>

              {/* Stepper Header */}
              <div style={{ marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #F1F5F9' }}>
                {/* Progress Indicators and Titles */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20,
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      color: '#FFFFFF', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.5px'
                    }}>
                      {currentStep} / 4-QADAM
                    </span>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                      {currentStep === 1 && "Maktabingiz haqida"}
                      {currentStep === 2 && "Mas'ul shaxs va aloqa"}
                      {currentStep === 3 && "Turniket va maktab hajmi"}
                      {currentStep === 4 && "Kerakli modullar va tasdiqlash"}
                    </h3>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6366F1' }}>
                    {currentStep === 1 && "25% to'ldirildi"}
                    {currentStep === 2 && "50% to'ldirildi"}
                    {currentStep === 3 && "75% to'ldirildi"}
                    {currentStep === 4 && "So'nggi qadam (100%)"}
                  </span>
                </div>

                {/* Animated Gradient Progress Line */}
                <div style={{ width: '100%', height: 7, backgroundColor: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: `${currentStep * 25}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #10B981 100%)',
                    borderRadius: 10,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>

                {/* Step Pills Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginTop: 14 }}>
                  {[
                    { step: 1, label: "1. Maktab", icon: Building2 },
                    { step: 2, label: "2. Mas'ul", icon: Users },
                    { step: 3, label: "3. Turniket", icon: Sliders },
                    { step: 4, label: "4. Modullar", icon: CheckCircle }
                  ].map(s => {
                    const isCurrent = currentStep === s.step;
                    const isPast = currentStep > s.step;
                    const IconC = s.icon;
                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => {
                          if (s.step < currentStep) {
                            setSubmitError(null);
                            setCurrentStep(s.step);
                          } else if (s.step === 2 && validateStep(1)) {
                            setCurrentStep(2);
                          } else if (s.step === 3 && validateStep(1) && validateStep(2)) {
                            setCurrentStep(3);
                          } else if (s.step === 4 && validateStep(1) && validateStep(2)) {
                            setCurrentStep(4);
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px 12px', borderRadius: 12,
                          border: isCurrent ? '2px solid #4F46E5' : (isPast ? '1px solid #A7F3D0' : '1px solid #E2E8F0'),
                          backgroundColor: isCurrent ? '#EEF2FF' : (isPast ? '#F0FDF4' : '#FFFFFF'),
                          color: isCurrent ? '#4F46E5' : (isPast ? '#166534' : '#94A3B8'),
                          fontSize: 12, fontWeight: isCurrent ? 800 : 600,
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        {isPast ? <Check size={14} color="#16A34A" /> : <IconC size={14} />}
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ============================================================== */}
              {/* QADAM 1: MAKTAB HAQIDA (ATIGI 3 TA MAYDON)                      */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
                      Muassasangiz nomi va hududini belgilang. Qolgan ma'lumotlarni keyingi qisqa qadamlarda olasiz.
                    </div>

                    {/* Maktab Nomi */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Maktab / Muassasa Nomi *</label>
                      <input
                        type="text"
                        placeholder="Masalan: 1-sonli Ixtisoslashtirilgan Maktab yoki Ziyo Zukko litseyi"
                        value={formData.school_name}
                        onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                        style={{ ...inputStyle, fontSize: 14.5, padding: '13px 16px' }}
                        autoFocus
                        required
                      />
                    </div>

                    {/* Muassasa Turi (Zamonaviy bosiladigan tabletkalar) */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={labelStyle}>Muassasa Turi:</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {SCHOOL_TYPES.map(t => {
                          const isSelected = formData.school_type === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, school_type: t.value })}
                              style={{
                                padding: '9px 15px', borderRadius: 12,
                                border: isSelected ? '1.5px solid #4F46E5' : '1px solid #CBD5E1',
                                backgroundColor: isSelected ? '#4F46E5' : '#F8FAFC',
                                color: isSelected ? '#FFFFFF' : '#334155',
                                fontSize: 13, fontWeight: isSelected ? 700 : 600,
                                cursor: 'pointer', transition: 'all 0.15s',
                                display: 'inline-flex', alignItems: 'center', gap: 6
                              }}
                            >
                              <span>{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hudud va Tuman (Yonma-yon) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
                      <div>
                        <label style={labelStyle}>Hudud (Viloyat) *</label>
                        <select
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          style={{ ...inputStyle, padding: '12px 14px' }}
                        >
                          {UZBEKISTAN_REGIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>Tuman / Shahar *</label>
                        <input
                          type="text"
                          placeholder="Masalan: Quva tumani yoki Yunusobod"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          style={{ ...inputStyle, padding: '12px 14px' }}
                          required
                        />
                      </div>
                    </div>

                    {/* Aniq Manzil */}
                    <div>
                      <label style={labelStyle}>Aniq Manzil (Ixtiyoriy)</label>
                      <input
                        type="text"
                        placeholder="Masalan: Amir Temur ko'chasi, 24-uy"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      style={{
                        padding: '13px 28px', borderRadius: 14, border: 'none',
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        color: '#FFFFFF', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 6px 18px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
                      }}
                    >
                      <span>Keyingi qadam (Aloqa)</span>
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* QADAM 2: MAS'UL SHAXS VA ALOQA (DIREKTOR LOGIN-PAROL UCHUN)    */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
                      Maktab tasdiqlanganda shaxsiy direktor hisobi va maxfiy login-parol ushbu raqamga yuboriladi.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
                      {/* F.I.SH */}
                      <div>
                        <label style={labelStyle}>Mas'ul Shaxs F.I.SH (Direktor) *</label>
                        <input
                          type="text"
                          placeholder="Masalan: Rahimov Jamshid Akmalovich"
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          style={{ ...inputStyle, fontSize: 14.5, padding: '13px 16px' }}
                          autoFocus
                          required
                        />
                      </div>

                      {/* Telefon */}
                      <div>
                        <label style={labelStyle}>Telefon Raqami *</label>
                        <input
                          type="tel"
                          placeholder="+998 90 123 45 67"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          style={{ ...inputStyle, fontSize: 14.5, padding: '13px 16px' }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                      {/* Telegram Username */}
                      <div>
                        <label style={labelStyle}>Telegram Username (Ixtiyoriy)</label>
                        <input
                          type="text"
                          placeholder="@username (tezkor aloqa uchun)"
                          value={formData.telegram_username}
                          onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                          style={inputStyle}
                        />
                      </div>

                      {/* Lavozim Chips */}
                      <div>
                        <label style={labelStyle}>Lavozimingiz:</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {["Direktor", "O'rinbosar", "Ta'sischi", "IT Menejer"].map(role => {
                            const isSelected = formData.contact_role === role;
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => setFormData({ ...formData, contact_role: role })}
                                style={{
                                  padding: '7px 12px', borderRadius: 10,
                                  border: isSelected ? '1.5px solid #4F46E5' : '1px solid #CBD5E1',
                                  backgroundColor: isSelected ? '#EEF2FF' : '#F8FAFC',
                                  color: isSelected ? '#4F46E5' : '#475569',
                                  fontSize: 12, fontWeight: isSelected ? 700 : 500,
                                  cursor: 'pointer', transition: 'all 0.15s'
                                }}
                              >
                                {role}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      style={{
                        padding: '12px 20px', borderRadius: 14, border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC', color: '#475569', fontSize: 13.5, fontWeight: 700,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                      <span>Orqaga</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      style={{
                        padding: '13px 28px', borderRadius: 14, border: 'none',
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        color: '#FFFFFF', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 6px 18px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
                      }}
                    >
                      <span>Keyingi qadam (Qurilmalar)</span>
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* QADAM 3: KIRISH USULI VA MAKTAB HAJMI (BITTA BOSISHDA TANLASH) */}
              {/* ============================================================== */}
              {currentStep === 3 && (
                <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
                      Maktabingizga qaysi kirish usuli qulay? Turniket apparati bo'lmasa, oddiy telefon/planshet orqali ishlayveradi.
                    </div>

                    {/* Turniket holati radiolar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                      {TURNSTILE_OPTIONS.map(opt => {
                        const isChecked = formData.turnstile_status === opt.value;
                        return (
                          <div
                            key={opt.value}
                            onClick={() => setFormData({ ...formData, turnstile_status: opt.value })}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
                              borderRadius: 16, border: isChecked ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                              backgroundColor: isChecked ? '#EEF2FF' : '#F8FAFC', cursor: 'pointer',
                              transition: 'all 0.15s', boxShadow: isChecked ? '0 4px 12px rgba(79, 70, 229, 0.12)' : 'none'
                            }}
                          >
                            <input
                              type="radio"
                              name="turnstile_status"
                              value={opt.value}
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ marginTop: 4, accentColor: '#4F46E5', width: 17, height: 17 }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: isChecked ? '#1E1B4B' : '#1E293B' }}>
                                {opt.label}
                              </div>
                              <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3, lineHeight: 1.4 }}>
                                {opt.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* O'quvchilar Soni & O'qituvchilar Soni */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Taxminiy O'quvchilar Soni (Ixtiyoriy):</label>
                        <input
                          type="number"
                          placeholder="Masalan: 650"
                          value={formData.estimated_students}
                          onChange={(e) => setFormData({ ...formData, estimated_students: e.target.value })}
                          style={inputStyle}
                        />
                        {/* Tezkor tanlov knopkalari */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          {["300", "600", "900", "1200"].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setFormData({ ...formData, estimated_students: num })}
                              style={{
                                padding: '3px 8px', borderRadius: 6, border: '1px solid #CBD5E1',
                                backgroundColor: '#FFF', fontSize: 11, color: '#475569', cursor: 'pointer'
                              }}
                            >
                              {num} ta
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>O'qituvchilar Soni (Ixtiyoriy):</label>
                        <input
                          type="number"
                          placeholder="Masalan: 45"
                          value={formData.estimated_teachers}
                          onChange={(e) => setFormData({ ...formData, estimated_teachers: e.target.value })}
                          style={inputStyle}
                        />
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          {["25", "45", "70", "100"].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setFormData({ ...formData, estimated_teachers: num })}
                              style={{
                                padding: '3px 8px', borderRadius: 6, border: '1px solid #CBD5E1',
                                backgroundColor: '#FFF', fontSize: 11, color: '#475569', cursor: 'pointer'
                              }}
                            >
                              {num} ta
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      style={{
                        padding: '12px 20px', borderRadius: 14, border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC', color: '#475569', fontSize: 13.5, fontWeight: 700,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                      <span>Orqaga</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      style={{
                        padding: '13px 28px', borderRadius: 14, border: 'none',
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        color: '#FFFFFF', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 6px 18px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
                      }}
                    >
                      <span>Keyingi qadam (Modullar)</span>
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* QADAM 4: MODULLAR VA YAKUNIY YUBORISH (MINI XULOSA BILAN)      */}
              {/* ============================================================== */}
              {currentStep === 4 && (
                <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
                      Asosiy 4 ta modul avtomatik belgilangan. Xohlasangiz boshqalarini ham qo'shishingiz mumkin:
                    </div>

                    {/* Modullar Chiptalari */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 18 }}>
                      {AVAILABLE_MODULES.map(m => {
                        const isSelected = formData.desired_modules.includes(m.label);
                        return (
                          <div
                            key={m.id}
                            onClick={() => handleModuleToggle(m.label)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                              borderRadius: 12, border: isSelected ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
                              backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF', cursor: 'pointer',
                              userSelect: 'none', transition: 'all 0.15s'
                            }}
                          >
                            {isSelected ? (
                              <CheckSquare size={18} color="#4F46E5" />
                            ) : (
                              <Square size={18} color="#94A3B8" />
                            )}
                            <span style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1E1B4B' : '#475569' }}>
                              {m.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Qo'shimcha Izoh (1 qator) */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Qo'shimcha Taklif yoki Izoh (Ixtiyoriy):</label>
                      <input
                        type="text"
                        placeholder="Masalan: Test qilish uchun sinov muddatini xohlaymiz..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        style={inputStyle}
                      />
                    </div>

                    {/* Mini Xulosa Kartochkasi */}
                    <div style={{
                      padding: '16px 18px', borderRadius: 16,
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
                      border: '1.5px solid #E0E7FF'
                    }}>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                        📋 Ariza Xulosasi:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, fontSize: 13, color: '#1E1B4B' }}>
                        <div>🏫 <b>Maktab:</b> {formData.school_name || "—"}</div>
                        <div>📍 <b>Hudud:</b> {formData.region}, {formData.district || "—"}</div>
                        <div>👤 <b>Mas'ul:</b> {formData.contact_name || "—"}</div>
                        <div>📞 <b>Aloqa:</b> {formData.phone || "—"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      style={{
                        padding: '12px 20px', borderRadius: 14, border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC', color: '#475569', fontSize: 13.5, fontWeight: 700,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                      <span>Orqaga</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitApplication}
                      disabled={submitting}
                      style={{
                        padding: '14px 32px', borderRadius: 16, border: 'none',
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        color: '#FFFFFF', fontSize: 15.5, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                      }}
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={19} className="spin-animate" />
                          <span>Yuborilmoqda...</span>
                        </>
                      ) : (
                        <>
                          <Send size={19} />
                          <span>Arizani Super Adminga Yuborish 🚀</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>

          </div>

        </div>
      </section>

      {/* =========================================================================
          8. FAQ (KO'P BERILADIGAN SAVOLLAR)
      ========================================================================= */}
      <section id="faq-section" style={{ padding: '80px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: '#EEF2FF', padding: '4px 14px', borderRadius: 20 }}>
              FAQ
            </span>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: '#0F172A', marginTop: 10 }}>
              Ko'p Beriladigan Savollarga Javoblar
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FaqAccordion
              question="Maktabimizda jismoniy turniket yo'q, tizimni baribir ishlatsak bo'ladimi?"
              answer="Albatta! Tizimimiz maxsus Mobil Darvoza Kioski rejimiga ega. Qorovul yoki navbatchi ustoz har qanday oddiy Android/iOS telefon yoki planshet orqali o'quvchilarning QR kodini skanerlaydi yoki ularning yuzini suratga olib bazadagi 3x4 rasm bilan solishtiradi. Hech qanday qo'shimcha uskunaga ehtiyoj yo'q!"
              isOpen={activeFaq === 0}
              onToggle={() => setActiveFaq(activeFaq === 0 ? null : 0)}
            />
            <FaqAccordion
              question="Ariza yuborilganidan so'ng maktab qancha vaqtda ishga tushadi?"
              answer="Arizangiz to'ldirilishi bilan Super Adminimizga avtomatik Telegram bildirishnomasi boradi. Super admin arizani ko'rib chiqib, 1 ta bosishda maktabingizni tizimda ochadi va direktor uchun login-parol taqdim etiladi. Tizim 1 kunda to'liq ishga tushadi."
              isOpen={activeFaq === 1}
              onToggle={() => setActiveFaq(activeFaq === 1 ? null : 1)}
            />
            <FaqAccordion
              question="Ota-onalarga xabarlar qanday yetkaziladi va bu pullikmi?"
              answer="Ota-onalarga xabarlar rasmiy Telegram boti orqali mutlaqo BEPUL va lahzalik yetkaziladi. SMS xarajatlari talab etilmaydi. Farzandi kirgan va chiqqan vaqti, baholari va jurnaldagi barcha ma'lumotlar ota-onaning shaxsiy Telegramiga boradi."
              isOpen={activeFaq === 2}
              onToggle={() => setActiveFaq(activeFaq === 2 ? null : 2)}
            />
            <FaqAccordion
              question="Biz xususiy maktab yoki kollejimiz, tizim bizga ham mos keladimi?"
              answer="Ha! Tizim sozlamalaridan muassasa turini tanlaysiz: Kollej va litseylar uchun 'Sinf' so'zi avtomatik 'Guruh'ga, 'Dars' esa 'Para'ga, 'O'quvchi' esa 'Talaba'ga aylanadi. Shuningdek har xil baholash tizimlari qo'llab-quvvatlanadi."
              isOpen={activeFaq === 3}
              onToggle={() => setActiveFaq(activeFaq === 3 ? null : 3)}
            />
          </div>

        </div>
      </section>

      {/* =========================================================================
          9. FOOTER
      ========================================================================= */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', padding: '60px 24px 30px', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 40 }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={20} color="#FFF" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>Idrok Edu</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#64748B' }}>
              O'zbekistondagi maktablar, kollejlar va ta'lim muassasalarini raqamlashtirish bo'yicha yagona milliy platforma.
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 14 }}>Asosiy Bo'limlar</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <li><button onClick={() => scrollToSection('modules-section')} style={footerLinkStyle}>Tizim Modullari</button></li>
              <li><button onClick={() => scrollToSection('devices-section')} style={footerLinkStyle}>Face ID & Turniket</button></li>
              <li><button onClick={() => scrollToSection('idrokboard-section')} style={footerLinkStyle}>Aqlli Doska</button></li>
              <li><button onClick={scrollToApply} style={footerLinkStyle}>Maktabni Ulash</button></li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 14 }}>Aloqa & Yordam</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <li>Telefon: +998 (71) 200-00-55</li>
              <li>Telegram Bot: @IdrokEduBot</li>
              <li>Email: info@idrokedu.uz</li>
              <li>Toshkent shahri, O'zbekiston</li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 14 }}>Tizimga Kirish</h5>
            <p style={{ fontSize: 12.5, color: '#64748B', marginBottom: 12 }}>
              Maktab ma'muriyati, o'qituvchilar va Super Admin uchun kirish:
            </p>
            <button
              onClick={onGoToLogin}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 10, border: 'none',
                backgroundColor: '#4F46E5', color: '#FFF', fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}
            >
              <Lock size={14} />
              Boshqaruv Paneliga Kirish
            </button>
          </div>

        </div>

        <div style={{ maxWidth: 1140, margin: '0 auto', paddingTop: 24, borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#475569' }}>
          <div>© 2026 Idrok Edu / Smart School Technologies. Barcha huquqlar himoyalangan.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Maxfiylik Siyosati</span>
            <span>Foydalanish Qoidalari</span>
            <span>Texnik Xavfsizlik</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Yordamchi Kichik Komponentlar
function MetricItem({ number, label, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, color: '#4F46E5', letterSpacing: '-0.5px' }}>
        {number}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
        {sub}
      </div>
    </div>
  );
}

function FeatureCheck({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 13.5, color: '#334155', fontWeight: 500 }}>{text}</span>
    </div>
  );
}

function ModuleCard({ icon, iconBg, title, desc }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 20, padding: 26,
      border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
      transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 14
    }}>
      <div style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{title}</h3>
      <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

function BenefitCard({ icon, title, desc }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22,
      border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        {icon}
      </div>
      <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>{title}</h4>
      <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.55, margin: 0 }}>{desc}</p>
    </div>
  );
}

function StepItem({ step, title, desc }) {
  return (
    <div style={{
      backgroundColor: '#F8FAFC', borderRadius: 20, padding: 24,
      border: '1px solid #E2E8F0', position: 'relative'
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12, backgroundColor: '#4F46E5',
        color: '#FFFFFF', fontWeight: 900, fontSize: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14
      }}>
        {step}
      </div>
      <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>{title}</h4>
      <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>{desc}</p>
    </div>
  );
}

function FaqAccordion({ question, answer, isOpen, onToggle }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
      overflow: 'hidden', transition: 'all 0.2s'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '18px 20px', border: 'none', backgroundColor: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left'
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{question}</span>
        <ChevronDown size={18} color="#64748B" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {isOpen && (
        <div style={{ padding: '0 20px 18px', color: '#475569', fontSize: 14, lineHeight: 1.6, borderTop: '1px solid #F1F5F9' }}>
          {answer}
        </div>
      )}
    </div>
  );
}

const navLinkStyle = {
  border: 'none', background: 'transparent', color: '#475569',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '6px 0'
};

const footerLinkStyle = {
  border: 'none', background: 'transparent', color: '#94A3B8',
  fontSize: 13, cursor: 'pointer', padding: 0, textAlign: 'left'
};

const labelStyle = {
  display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6
};

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid #CBD5E1', backgroundColor: '#F8FAFC',
  color: '#0F172A', fontSize: 13.5, outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box'
};
