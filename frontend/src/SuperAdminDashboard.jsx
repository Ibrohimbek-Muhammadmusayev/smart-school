import React, { useState, useEffect } from 'react';
import {
  Building2, Shield, Users, CheckCircle2, AlertTriangle,
  Search, Plus, RefreshCw, Key, Send, TrendingUp,
  BarChart3, Activity, ChevronRight, Filter, Download,
  ArrowUpRight, School, Bell, X,
  Power, Lock, Unlock, Eye, EyeOff, MapPin, Phone, Mail, Award,
  Sliders, Layers, Server, Database, LogOut, UserPlus, BookOpen,
  Calendar, CheckCircle, QrCode, GraduationCap, Clock,
  FolderOpen, Sparkles, Smartphone, Check, Edit, Trash2,
  FileSpreadsheet, FileText, FileCode, Monitor, Cpu, ScanFace,
  Bot, Zap, CreditCard, Wrench, Star, Pause, Archive,
  HelpCircle, MessageSquare, ShieldCheck, AlertCircle, CheckSquare, Square, DoorOpen
} from 'lucide-react';

const THEME = {
  primary: '#6C5CE7',
  primaryDark: '#5845D8',
  primaryLight: '#F3F1FF',
  gradient: 'linear-gradient(135deg, #7C69EF 0%, #5845D8 100%)',
  softGradient: 'linear-gradient(145deg, #F6F7FD 0%, #EEF0FA 55%, #F7F8FE 100%)',
  warmGradient: 'linear-gradient(135deg, #FF9F43 0%, #FF6584 100%)',
  orange: '#F59E0B',
  pink: '#EC4899',
  cyan: '#0EA5E9',
  green: '#10B981',
  bgSoft: '#F6F7FB',
  cardBg: '#FFFFFF',
  textDark: '#1E2235',
  textMuted: '#7E869E',
  border: 'rgba(108, 92, 231, 0.08)',
  softShadow: '0 12px 32px -8px rgba(108, 92, 231, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
};

const INITIAL_REGIONS = [
  { id: 'toshkent_sh', name: 'Toshkent shahri', schools: 42, students: 38400, attendance: 96.8, density: 94 },
  { id: 'samarqand', name: 'Samarqand viloyati', schools: 28, students: 24100, attendance: 95.4, density: 82 },
  { id: 'fargona', name: 'Farg‘ona viloyati', schools: 24, students: 21500, attendance: 95.9, density: 78 },
  { id: 'andijon', name: 'Andijon viloyati', schools: 19, students: 17200, attendance: 96.1, density: 74 },
  { id: 'buxoro', name: 'Buxoro viloyati', schools: 16, students: 14300, attendance: 97.2, density: 68 },
  { id: 'namangan', name: 'Namangan viloyati', schools: 18, students: 15900, attendance: 94.8, density: 70 },
  { id: 'xorazm', name: 'Xorazm viloyati', schools: 14, students: 12400, attendance: 96.5, density: 64 },
  { id: 'qashqadaryo', name: 'Qashqadaryo viloyati', schools: 15, students: 13800, attendance: 93.9, density: 62 },
];

const INITIAL_PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Boshlang‘ich',
    pricePerMonth: '1 200 000 so‘m / oy',
    perStudent: '3 500 so‘m / o‘quvchi',
    maxStudents: 500,
    maxRooms: 25,
    storageGb: 20,
    features: ['Dinamik 25s QR Davomat', 'Dars Matritsasi va Jurnal', '5 xonali ID Avtorizatsiya', 'CSV Hisobotlar'],
    color: '#0EA5E9',
    popular: false,
    modules: {
      face_id: false,
      dynamic_qr: true,
      telegram_bot: false,
      turnstile_api: false,
      anti_spoofing: false,
      sms_alerts: false,
      journal_matrix: true,
      gps_geofence: true,
      vip_support: false,
    },
  },
  {
    id: 'standard',
    name: 'Standart',
    pricePerMonth: '2 500 000 so‘m / oy',
    perStudent: '5 000 so‘m / o‘quvchi',
    maxStudents: 1200,
    maxRooms: 60,
    storageGb: 100,
    features: ['Face ID Biometrik Kirish', 'Dinamik 25s QR Davomat', 'Ota-onalar Telegram Boti', 'Turniket Integratsiyasi'],
    color: '#6C5CE7',
    popular: true,
    modules: {
      face_id: true,
      dynamic_qr: true,
      telegram_bot: true,
      turnstile_api: true,
      anti_spoofing: false,
      sms_alerts: true,
      journal_matrix: true,
      gps_geofence: true,
      vip_support: false,
    },
  },
  {
    id: 'pro',
    name: 'Litsenziyali Pro',
    pricePerMonth: '4 800 000 so‘m / oy',
    perStudent: 'Cheklovsiz paket',
    maxStudents: 5000,
    maxRooms: 200,
    storageGb: 500,
    features: ['Dedicated AI Face Server', 'Anti-Spoofing Liveness v3', 'SMS + Telegram + Push', '24/7 VIP SLA & Backup'],
    color: '#10B981',
    popular: false,
    modules: {
      face_id: true,
      dynamic_qr: true,
      telegram_bot: true,
      turnstile_api: true,
      anti_spoofing: true,
      sms_alerts: true,
      journal_matrix: true,
      gps_geofence: true,
      vip_support: true,
    },
  },
];

const INITIAL_INVOICES = [
  { id: 'INV-2026-101', schoolName: '1-sonli Ixtisoslashtirilgan Maktab-Kollej', plan: 'Litsenziyali Pro', amount: '4 800 000 so‘m', method: 'Bank Hisob-raqami', date: '2026-10-15', dueDate: '2026-11-15', status: 'PAID' },
  { id: 'INV-2026-102', schoolName: '24-sonli Prezident va IT Maktabi', plan: 'Litsenziyali Pro', amount: '4 800 000 so‘m', method: 'Payme Business', date: '2026-10-14', dueDate: '2026-11-14', status: 'PAID' },
  { id: 'INV-2026-103', schoolName: '45-sonli IDUM (Aniq fanlar maktabi)', plan: 'Standart', amount: '2 500 000 so‘m', method: 'Click Corporate', date: '2026-10-10', dueDate: '2026-10-20', status: 'PENDING' },
  { id: 'INV-2026-104', schoolName: '112-sonli Umumta\'lim Maktabi', plan: 'Boshlang‘ich', amount: '1 200 000 so‘m', method: 'Uzum Business', date: '2026-09-17', dueDate: '2026-10-17', status: 'OVERDUE' },
  { id: 'INV-2026-105', schoolName: '8-sonli Xorijiy Tillar va Texnologiya Litseyi', plan: 'Standart', amount: '2 500 000 so‘m', method: 'Payme Business', date: '2026-10-12', dueDate: '2026-11-12', status: 'PAID' },
];

const INITIAL_SPOOF_LOGS = [
  { id: 1, time: 'Bugun, 08:24:11', school: '112-sonli Umumta\'lim Maktabi', studentId: '49281', studentName: 'Tursunov Bekzod', reason: 'Anti-Spoofing: Telefon ekranidan rasm ko‘rsatish aniqlandi (Liveness Score: 0.12)', severity: 'CRITICAL' },
  { id: 2, time: 'Bugun, 08:19:45', school: '45-sonli IDUM', studentId: '38104', studentName: 'Aliyeva Mohira', reason: 'Past sifatli rasm: Kamera yorug‘ligi yetarli emas (Blur Score: 0.34)', severity: 'WARNING' },
  { id: 3, time: 'Bugun, 08:11:03', school: '1-sonli Ixtisoslashtirilgan Maktab-Kollej', studentId: '10492', studentName: 'Karimov Sardor', reason: 'Anti-Spoofing: Bosma qog‘oz fotosurat orqali urinish bloklandi', severity: 'CRITICAL' },
  { id: 4, time: 'Kecha, 13:45:20', school: '24-sonli Prezident va IT Maktabi', studentId: '22910', studentName: 'Rustamov Javohir', reason: 'Yuz burchagi 45° dan katta — qayta skanerlash so‘raldi', severity: 'WARNING' },
];

const INITIAL_QR_ALERTS = [
  { id: 1, time: 'Bugun, 08:31:09', school: '112-sonli Maktab', student: 'Nazarov Doston (ID: 55102)', issue: 'Bir xil 25s QR token 2 ta turli qurilmadan 1.2 soniya farq bilan skanerlandi (Screenshot ulashish shubhasi)', status: 'BLOCKED' },
  { id: 2, time: 'Bugun, 08:29:50', school: '45-sonli IDUM', student: 'Qodirova Sevara (ID: 33019)', issue: 'Muddati o‘tgan (38 soniyalik) QR token bilan kirish urinishi', status: 'REJECTED' },
  { id: 3, time: 'Kecha, 10:02:14', school: '1-sonli Maktab-Kollej', student: 'Hasanov Amir (ID: 19283)', issue: 'Noto‘g‘ri xonada QR validatsiya so‘rovi', status: 'WARNED' },
];

const INITIAL_RBAC_ADMINS = [
  { id: 1, name: 'Bosh Boshqarma (Super Owner)', role: 'SUPER_OWNER', email: 'root@idrokedu.uz', twoFactor: true, permissions: 'To‘liq ruxsat (Barcha modullar)' },
  { id: 2, name: 'Sardorbek Usmonov', role: 'TECH_SUPPORT', email: 'devops@idrokedu.uz', twoFactor: true, permissions: 'AI Serverlar, Turniketlar, Backup va Helpdesk' },
  { id: 3, name: 'Malika Rahimova', role: 'FINANCE_MANAGER', email: 'billing@idrokedu.uz', twoFactor: true, permissions: 'Obunalar, Fakturalar va MRR Tahlil' },
  { id: 4, name: 'Komiljon Toshmatov', role: 'SECURITY_AUDITOR', email: 'audit@idrokedu.uz', twoFactor: false, permissions: 'Global Audit Jurnali va Xavfsizlik loglari' },
];

const INITIAL_BACKUPS = [
  { id: 'BKP-20261017-0400', date: '2026-10-17 04:00:00', type: 'Kunlik Avtomatik (PostgreSQL + Media S3)', size: '1.84 GB', status: 'COMPLETED' },
  { id: 'BKP-20261016-0400', date: '2026-10-16 04:00:00', type: 'Kunlik Avtomatik (PostgreSQL + Media S3)', size: '1.81 GB', status: 'COMPLETED' },
  { id: 'BKP-20261013-0200', date: '2026-10-13 02:00:00', type: 'Haftalik To‘liq Snapshot (Full Cluster)', size: '6.40 GB', status: 'COMPLETED' },
];

const INITIAL_TICKETS = [
  { id: 'TCK-901', school: '112-sonli Umumta\'lim Maktabi', director: 'Mirzayev Otabek', subject: '2-bino kirish turniketi IP manzili o‘zgardi, qayta sozlash kerak', priority: 'HIGH', createdAt: 'Bugun, 08:15', status: 'OPEN', reply: '' },
  { id: 'TCK-902', school: '45-sonli IDUM', director: 'Xoliqova Dilnoza', subject: 'Yangi o‘quv yili uchun qo‘shimcha 35 ta o‘quvchi kvotasini ochib berish', priority: 'MEDIUM', createdAt: 'Kecha, 16:40', status: 'OPEN', reply: '' },
  { id: 'TCK-903', school: '24-sonli Prezident va IT Maktabi', director: 'Karimov Ulug‘bek', subject: 'Ota-onalar Telegram botiga yangi maktab logotipini biriktirish', priority: 'LOW', createdAt: '2026-10-15', status: 'RESOLVED', reply: 'Logotip yangilandi va webhook qayta ishga tushirildi.' },
];

const INITIAL_FAQS = [
  { id: 1, q: "Yangi o'quvchi qo'shilganda Face ID embedding qancha vaqtda faollashadi?", a: "Rasm (3x4) yuklangan zahoti InsightFace klasteri 18-25 millisoniya ichida yuz vektorini hisoblab, barcha turniket va mobil ilovalarga sinxronlaydi." },
  { id: 2, q: "O'quvchi telefonini uyda qoldirsa davomat qanday olinadi?", a: "Fan o'qituvchisi o'z mobil ilovasidan yoki Maktab Direktori web-panelidan o'quvchini qo'lda davomatdan o'tkazishi mumkin." },
  { id: 3, q: "Maktab obuna to'lovi kechiksa ma'lumotlar o'chib ketadimi?", a: "Yo'q, maktab vaqtincha muzlatilgan holatiga o'tadi va barcha jurnallar hamda rasmlar S3 zaxira omborida 100% saqlanadi." },
];

export default function SuperAdminDashboardView({
  currentUser,
  schoolsList,
  onUpdateSchools,
  onEnterSchool,
  handleLogout,
  globalAnnouncement,
  onUpdateAnnouncement,
}) {
  const [superTab, setSuperTabState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('smart_super_admin_tab');
      if (saved && ['overview', 'schools', 'billing', 'ai', 'security', 'config', 'support'].includes(saved)) {
        return saved;
      }
    } catch (_) {}
    return 'overview';
  });

  const setSuperTab = (tab) => {
    try {
      sessionStorage.setItem('smart_super_admin_tab', tab);
    } catch (_) {}
    setSuperTabState(tab);
  };

  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => {
      setToastMsg(prev => (prev === text ? null : prev));
    }, 3400);
  };

  // 1. Overview & Analytics Chart state
  const [selectedRegion, setSelectedRegion] = useState(INITIAL_REGIONS[0]);
  const [chartMode, setChartMode] = useState('CUMULATIVE'); // 'CUMULATIVE' | 'IMAGES' | 'FILES' | 'SCHOOLS' | 'CHANGES'
  const [selectedStageIdx, setSelectedStageIdx] = useState(5);
  const [chartHover, setChartHover] = useState(null);
  const [dbStudents, setDbStudents] = useState([]);
  const [dbTeachers, setDbTeachers] = useState([]);
  const [dbClasses, setDbClasses] = useState([]);
  const [exportedFilesCount, setExportedFilesCount] = useState(() => {
    try {
      return Number(localStorage.getItem('smart_school_exports_count')) || 18;
    } catch (_) {
      return 18;
    }
  });

  useEffect(() => {
    const loadRealProjectStats = async () => {
      try {
        const [stuRes, tchRes, clsRes, sysRes, schRes] = await Promise.all([
          fetch('/api/students/?all_schools=1', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
          fetch('/api/teachers/?all_schools=1', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
          fetch('/api/classes/?all_schools=1', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
          fetch('/api/system-config/', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
          fetch('/api/school-config/?all_schools=1', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
        ]);
        if (stuRes.ok) {
          const sData = await stuRes.json();
          if (Array.isArray(sData)) setDbStudents(sData);
        }
        if (tchRes.ok) {
          const tData = await tchRes.json();
          if (Array.isArray(tData)) setDbTeachers(tData);
        }
        if (clsRes.ok) {
          const cData = await clsRes.json();
          if (Array.isArray(cData)) setDbClasses(cData);
        }
        if (sysRes.ok) {
          const sysData = await sysRes.json();
          setSystemConfig(prev => ({
            ...prev,
            maintenanceMode: Boolean(sysData.is_maintenance_mode),
            maintenanceTitle: sysData.maintenance_title || "Tizimda profilaktika ishlari olib borilmoqda",
            maintenanceMessage: sysData.maintenance_message || "Serverlarda rejali modernizatsiya va texnik sozlash ishlari amalga oshirilmoqda. Tez orada barcha xizmatlar to'liq tiklanadi.",
            estimatedEndTime: sysData.estimated_end_time || "14:00",
            supportPhone: sysData.support_phone || "+998 71 200-00-00",
          }));
        }
        if (schRes.ok) {
          const schData = await schRes.json();
          if (Array.isArray(schData) && schData.length > 0) {
            const map = {};
            schData.forEach(c => { if (c && c.school_id) map[String(c.school_id)] = c; });
            const merged = schoolsList.map(s => {
              const c = map[String(s.id)];
              return c ? {
                ...s,
                status: c.status || s.status || 'ACTIVE',
                statusReason: c.status_reason || s.statusReason || '',
                warningBanner: c.warning_banner !== undefined ? c.warning_banner : (s.warningBanner || ''),
                paymentStatus: c.payment_status || s.paymentStatus || 'PAID',
                debtAmount: c.debt_amount || s.debtAmount || "0 so'm",
                accessInfoDashboard: c.access_info_dashboard,
                accessInfoMobile: c.access_info_mobile,
              } : s;
            });
            onUpdateSchools(merged);
          }
        }
      } catch (_) {}
    };
    loadRealProjectStats();
  }, []);

  // 2. Schools Multi-tenancy state
  const [selectedSchoolId, setSelectedSchoolIdState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('smart_super_admin_selected_school_id');
      if (saved && schoolsList.some(s => String(s.id) === String(saved))) {
        return saved;
      }
    } catch (_) {}
    return schoolsList[0] ? schoolsList[0].id : null;
  });

  const setSelectedSchoolId = (id) => {
    try {
      sessionStorage.setItem('smart_super_admin_selected_school_id', String(id));
    } catch (_) {}
    setSelectedSchoolIdState(id);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [warningModalSchool, setWarningModalSchool] = useState(null);
  const [warningBannerInput, setWarningBannerInput] = useState('');

  // Maintenance va Maktab to'xtatish modallari
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    is_maintenance_mode: false,
    maintenance_title: "Tizimda profilaktika ishlari olib borilmoqda",
    maintenance_message: "Tizim serverlarida rejali modernizatsiya va texnik sozlash ishlari amalga oshirilmoqda. Tez orada barcha xizmatlar to'liq tiklanadi.",
    estimated_end_time: "14:00",
    support_phone: "+998 71 200-00-00",
  });
  const [schoolSuspendModalSchool, setSchoolSuspendModalSchool] = useState(null);
  const [suspendForm, setSuspendForm] = useState({
    reason_type: 'DEBT',
    status_reason: "Oylik obuna to'lovi to'lanmaganligi sababli xizmatlar vaqtincha to'xtatildi",
    debt_amount: "4 800 000 so‘m",
  });

  // 3. Billing & Subscriptions state
  const [pricingTiers, setPricingTiers] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_school_pricing_tiers');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_PRICING_TIERS;
  });

  const savePricingTiers = (tiers) => {
    setPricingTiers(tiers);
    try {
      localStorage.setItem('smart_school_pricing_tiers', JSON.stringify(tiers));
    } catch (_) {}
  };

  const [editingTier, setEditingTier] = useState(null);
  const [showTierModal, setShowTierModal] = useState(false);

  const handleOpenEditTier = (tier) => {
    setEditingTier(JSON.parse(JSON.stringify(tier)));
    setShowTierModal(true);
  };

  const handleOpenCreateTier = () => {
    setEditingTier({
      id: 'tier_' + Date.now(),
      name: 'Yangi Tarif Rejasi',
      pricePerMonth: '3 000 000 so‘m / oy',
      perStudent: '4 500 so‘m / o‘quvchi',
      maxStudents: 1000,
      maxRooms: 50,
      storageGb: 80,
      color: '#6C5CE7',
      popular: false,
      features: [
        'Dinamik 25s QR Davomat',
        'Dars Matritsasi va Jurnal',
        'Ota-onalar Telegram Boti',
      ],
      modules: {
        face_id: true,
        dynamic_qr: true,
        telegram_bot: true,
        turnstile_api: false,
        anti_spoofing: false,
        sms_alerts: false,
        journal_matrix: true,
        gps_geofence: true,
        vip_support: false,
      },
    });
    setShowTierModal(true);
  };

  const handleSaveTier = (tierData) => {
    const exists = pricingTiers.some(t => t.id === tierData.id);
    const updated = exists ? pricingTiers.map(t => t.id === tierData.id ? tierData : t) : [...pricingTiers, tierData];
    savePricingTiers(updated);
    setShowTierModal(false);
    setEditingTier(null);
    appendAuditLog('UPDATE_PRICING_TIER', tierData.name, `Tarif rejasi sozlamalari yangilandi (${tierData.pricePerMonth})`);
    showToast(`"${tierData.name}" tarif rejasi muvaffaqiyatli saqlandi!`);
  };

  const handleDeleteTier = (tierId) => {
    if (pricingTiers.length <= 1) {
      showToast("Kamida 1 ta tarif rejasi mavjud bo‘lishi shart!");
      return;
    }
    const tier = pricingTiers.find(t => t.id === tierId);
    if (window.confirm(`"${tier?.name || 'Ushbu'}" tarif rejasini o‘chirmoqchimisiz?`)) {
      const updated = pricingTiers.filter(t => t.id !== tierId);
      savePricingTiers(updated);
      appendAuditLog('DELETE_PRICING_TIER', tier?.name, `Tarif rejasi o‘chirildi`);
      showToast(`"${tier?.name}" tarifi o‘chirildi!`);
    }
  };

  const handleResetDefaultTiers = () => {
    if (window.confirm("Barcha tarif rejalarini dastlabki standart holatiga qaytarmoqchimisiz?")) {
      savePricingTiers(INITIAL_PRICING_TIERS);
      showToast("Tarif rejalari standart holatiga qaytarildi!");
    }
  };

  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);

  // 4. AI & Biometrics state
  const [activeAiModel, setActiveAiModel] = useState('InsightFace ArcFace v2.4 (GPU TensorRT)');
  const [reindexing, setReindexing] = useState(false);
  const [reindexProgress, setReindexProgress] = useState(100);
  const [spoofLogs] = useState(INITIAL_SPOOF_LOGS);

  // 5. Security & Audit Logs state
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_school_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      { id: 101, time: '2026-10-17 04:10:22', actor: 'Super Admin (root)', ip: '192.168.1.10', action: 'SYSTEM_CHECK', target: 'Global Cluster', detail: 'Barcha 5 ta maktab serverlari holati tekshirildi' },
      { id: 102, time: '2026-10-17 03:45:12', actor: 'Rahimov Jamshid (maktab1)', ip: '10.10.4.21', action: 'UPLOAD_PHOTO', target: '1-sonli Maktab-Kollej', detail: 'Yangi o‘quvchilar 3x4 Face ID rasmlari yuklandi' },
      { id: 103, time: '2026-10-17 03:18:05', actor: 'Karimov Ulug‘bek (maktab2)', ip: '10.10.8.14', action: 'UPDATE_GRADE', target: '24-sonli Prezident Maktabi', detail: 'O‘quvchi bahosi va davomat jurnali yangilandi' },
      { id: 104, time: '2026-10-16 18:20:40', actor: 'Malika Rahimova (Moliyachi)', ip: '192.168.1.45', action: 'INVOICE_ISSUED', target: '45-sonli IDUM', detail: 'INV-2026-103 raqamli hisob-faktura yuborildi' },
    ];
  });
  const [qrAlerts] = useState(INITIAL_QR_ALERTS);
  const [rbacAdmins, setRbacAdmins] = useState(INITIAL_RBAC_ADMINS);
  const [require2FA, setRequire2FA] = useState({ superAdmins: true, directors: true, teachers: false });

  // 6. System Config & Backup state
  const [backups, setBackups] = useState(INITIAL_BACKUPS);
  const [systemConfig, setSystemConfig] = useState({
    smsProvider: 'Eskiz.uz Official Gateway',
    smsBalance: 48250,
    telegramBotToken: '7192834102:AAH9xIdrokEduBot_ProdKey',
    telegramBotActive: true,
    fcmActive: true,
    androidMinVersion: '2.4.1',
    iosMinVersion: '2.4.0',
    forceUpdate: true,
    maintenanceMode: false,
  });

  // 7. Support & Helpdesk state
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [broadcastInput, setBroadcastInput] = useState(globalAnnouncement || '');
  const [activeTicketReply, setActiveTicketReply] = useState({});

  const appendAuditLog = (action, target, detail) => {
    const entry = {
      id: Date.now(),
      time: new Date().toLocaleString('uz-UZ'),
      actor: `${currentUser?.name || 'Super Admin'} (${currentUser?.username || 'admin'})`,
      ip: '127.0.0.1 (Admin VPN)',
      action,
      target,
      detail,
    };
    const updated = [entry, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('smart_school_audit_logs', JSON.stringify(updated));
  };

  const handleGhostLogin = (school) => {
    if (!school) return;
    appendAuditLog(
      'IMPERSONATE_SCHOOL_ADMIN',
      school.name,
      `Super Admin impersonated School Admin (${school.username} — ${school.director})`
    );
    onEnterSchool(school);
  };

  // Computed KPI metrics
  const activeCount = schoolsList.filter(s => s.status === 'ACTIVE').length;
  const trialCount = schoolsList.filter(s => s.status === 'TRIAL').length;
  const blockedCount = schoolsList.filter(s => s.status === 'BLOCKED' || s.status === 'SUSPENDED' || s.status === 'ARCHIVED').length;
  const totalStudents = schoolsList.reduce((acc, s) => acc + (Number(s.studentsCount) || 0), 0);
  const totalTeachers = schoolsList.reduce((acc, s) => acc + (Number(s.teachersCount) || 0), 0);
  const avgAttendance =
    schoolsList.length > 0
      ? (schoolsList.reduce((acc, s) => acc + (Number(s.attendanceRate) || 95), 0) / schoolsList.length).toFixed(1)
      : '96.2';

  const currentSelectedSchool =
    schoolsList.find(s => s.id === selectedSchoolId) || schoolsList[0] || null;

  const filteredSchools = schoolsList.filter(s => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (regionFilter !== 'ALL' && !(s.district || '').toLowerCase().includes(regionFilter.toLowerCase())) return false;
    if (paymentFilter !== 'ALL' && (s.paymentStatus || 'PAID') !== paymentFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return `${s.name} ${s.inn || ''} ${s.district} ${s.director} ${s.username}`.toLowerCase().includes(q);
  });

  const handleExportReport = (format = 'csv') => {
    const nextExports = exportedFilesCount + 1;
    setExportedFilesCount(nextExports);
    try {
      localStorage.setItem('smart_school_exports_count', String(nextExports));
    } catch (_) {}
    appendAuditLog('EXPORT_REPORT', `Maktablar (${format.toUpperCase()})`, `${schoolsList.length} ta maktab hisoboti eksport qilindi`);
    if (format === 'pdf') {
      window.print();
      return;
    }
    let content = "\uFEFFID,Maktab Nomi,INN / Litsenziya,Hudud,Direktor,Telefon,Login,Tarif,To'lov Holati,O'quvchilar,Sig'im,Davomat %,Status\n";
    schoolsList.forEach(s => {
      content += `${s.id},"${s.name}","${s.inn || '309481023'}","${s.district}","${s.director}","${s.phone}",${s.username},"${s.plan || 'Standart'}",${s.paymentStatus || 'PAID'},${s.studentsCount},${s.capacity || 800},${s.attendanceRate}%,${s.status}\n`;
    });
    const mime = format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';
    const ext = format === 'excel' ? 'xls' : 'csv';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `idrok_edu_tenants_report.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`${format.toUpperCase()} hisobot muvaffaqiyatli yuklab olindi!`);
  };

  const handleSetSchoolStatus = async (school, newStatus, reason = '', paymentStatus = null, debtAmount = null) => {
    const isDebt = newStatus === 'SUSPENDED' && (reason.toLowerCase().includes('o‘lov') || reason.toLowerCase().includes('qarz') || reason.toLowerCase().includes("to'lov"));
    const pStatus = paymentStatus || (isDebt ? 'OVERDUE' : (newStatus === 'ACTIVE' ? 'PAID' : (school.paymentStatus || 'PAID')));
    const dAmount = debtAmount !== null ? debtAmount : (isDebt ? (school.debtAmount || "4 800 000 so‘m") : (newStatus === 'ACTIVE' ? "0 so'm" : (school.debtAmount || "0 so'm")));

    try {
      const res = await fetch(`/api/schools/${school.id}/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN',
        },
        body: JSON.stringify({
          status: newStatus,
          status_reason: reason,
          warning_banner: (newStatus === 'ACTIVE' && !reason) ? '' : (reason || school.warningBanner || ''),
          payment_status: pStatus,
          debt_amount: dAmount,
          updated_by: `${currentUser?.name || 'Super Admin'}`,
        }),
      });

      if (res.ok) {
        const respData = await res.json();
        const updated = schoolsList.map(s =>
          s.id === school.id
            ? {
                ...s,
                status: newStatus,
                statusReason: reason,
                warningBanner: (newStatus === 'ACTIVE' && !reason) ? '' : (reason || s.warningBanner),
                paymentStatus: pStatus,
                debtAmount: dAmount,
                accessInfoDashboard: respData.access_info_dashboard,
                accessInfoMobile: respData.access_info_mobile,
              }
            : s
        );
        onUpdateSchools(updated);
        appendAuditLog(`SCHOOL_STATUS_${newStatus}`, school.name, `Holat ${newStatus} ga o'zgartirildi. ${reason}`);
        showToast(`"${school.name}" holati bazada yangilandi!`);
        return;
      }
    } catch (err) {
      console.warn("Backend status update error:", err);
    }

    // Local fallback
    const updated = schoolsList.map(s =>
      s.id === school.id
        ? {
            ...s,
            status: newStatus,
            statusReason: reason,
            warningBanner: (newStatus === 'ACTIVE' && !reason) ? '' : (reason || s.warningBanner),
            paymentStatus: pStatus,
            debtAmount: dAmount,
          }
        : s
    );
    onUpdateSchools(updated);
    appendAuditLog(`SCHOOL_STATUS_${newStatus}`, school.name, `Holat ${newStatus} ga o'zgartirildi. ${reason}`);
    showToast(`"${school.name}" holati yangilandi!`);
  };

  const handleConfirmSuspendSchool = (e) => {
    e.preventDefault();
    if (!schoolSuspendModalSchool) return;
    const isDebt = suspendForm.reason_type === 'DEBT';
    const reasonText = suspendForm.status_reason.trim() || (
      isDebt 
        ? "Oylik obuna to'lovi to'lanmaganligi sababli xizmatlar vaqtincha to'xtatildi"
        : "Rejali profilaktika va texnik sozlash ishlari sababli vaqtincha to'xtatildi"
    );
    const pStatus = isDebt ? 'OVERDUE' : 'PAID';
    const dAmount = isDebt ? (suspendForm.debt_amount || "4 800 000 so‘m") : "0 so'm";

    handleSetSchoolStatus(schoolSuspendModalSchool, 'SUSPENDED', reasonText, pStatus, dAmount);
    setSchoolSuspendModalSchool(null);
  };

  const handleSaveMaintenanceConfig = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await fetch('/api/system-config/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN',
        },
        body: JSON.stringify({
          is_maintenance_mode: maintenanceForm.is_maintenance_mode,
          maintenance_title: maintenanceForm.maintenance_title,
          maintenance_message: maintenanceForm.maintenance_message,
          estimated_end_time: maintenanceForm.estimated_end_time,
          support_phone: maintenanceForm.support_phone,
          updated_by: `${currentUser?.name || 'Super Admin'}`,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setSystemConfig(prev => ({
          ...prev,
          maintenanceMode: Boolean(saved.is_maintenance_mode),
          maintenanceTitle: saved.maintenance_title,
          maintenanceMessage: saved.maintenance_message,
          estimatedEndTime: saved.estimated_end_time,
          supportPhone: saved.support_phone,
        }));
        setMaintenanceModalOpen(false);
        appendAuditLog(
          saved.is_maintenance_mode ? 'MAINTENANCE_ENABLED' : 'MAINTENANCE_DISABLED',
          'Global System',
          saved.is_maintenance_mode 
            ? `Texnik profilaktika yoqildi. Tugash: ${saved.estimated_end_time}` 
            : 'Normal ish rejimi tiklandi'
        );
        showToast(
          saved.is_maintenance_mode 
            ? "⚠️ Texnik profilaktika rejimi yoqildi! Barcha tashqi mijozlar qulflondi." 
            : "✅ Normal ish rejimi muvaffaqiyatli tiklandi!"
        );
      }
    } catch (err) {
      showToast("Xatolik yuz berdi: " + err.message);
    }
  };

  const handleQuickToggleMaintenance = async () => {
    const nextMode = !systemConfig.maintenanceMode;
    try {
      const res = await fetch('/api/system-config/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN',
        },
        body: JSON.stringify({
          is_maintenance_mode: nextMode,
          updated_by: `${currentUser?.name || 'Super Admin'}`,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setSystemConfig(prev => ({
          ...prev,
          maintenanceMode: Boolean(saved.is_maintenance_mode),
        }));
        appendAuditLog(
          nextMode ? 'MAINTENANCE_ENABLED' : 'MAINTENANCE_DISABLED',
          'Global System',
          nextMode ? 'Texnik profilaktika yoqildi' : 'Normal rejim tiklandi'
        );
        showToast(nextMode ? "⚠️ Profilaktika rejimi yoqildi!" : "✅ Normal rejim tiklandi!");
      }
    } catch (err) {
      showToast("Xatolik: " + err.message);
    }
  };

  const handleHardDeleteSchool = (school) => {
    if (!window.confirm(`DIQQAT!\n"${school.name}" maktabini tizimdan butunlay o'chirmoqchimisiz?`)) {
      return;
    }
    const updated = schoolsList.filter(s => s.id !== school.id);
    onUpdateSchools(updated);
    appendAuditLog('HARD_DELETE_SCHOOL', school.name, `Maktab tizimdan butunlay o'chirildi`);
    if (selectedSchoolId === school.id && updated.length > 0) {
      setSelectedSchoolId(updated[0].id);
    }
    showToast(`"${school.name}" tizimdan o'chirildi.`);
  };

  const handleSaveWarningBanner = async (e) => {
    e.preventDefault();
    if (!warningModalSchool) return;
    const bannerText = warningBannerInput.trim();
    try {
      await fetch(`/api/schools/${warningModalSchool.id}/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN',
        },
        body: JSON.stringify({
          warning_banner: bannerText,
          updated_by: `${currentUser?.name || 'Super Admin'}`,
        }),
      });
    } catch (_) {}

    const updated = schoolsList.map(s =>
      s.id === warningModalSchool.id ? { ...s, warningBanner: bannerText } : s
    );
    onUpdateSchools(updated);
    appendAuditLog('SET_WARNING_BANNER', warningModalSchool.name, `Ogohlantirish banneri: "${bannerText}"`);
    const schoolName = warningModalSchool.name;
    setWarningModalSchool(null);
    showToast(`"${schoolName}" paneliga ogohlantirish banneri o'rnatildi!`);
  };

  const triggerReindexBiometrics = () => {
    if (reindexing) return;
    setReindexing(true);
    setReindexProgress(15);
    appendAuditLog('BIOMETRIC_REINDEX', 'Face ID Cluster', 'Barcha o‘quvchilar yuz embeddinglarini qayta indeksatsiyalash boshlandi');
    setTimeout(() => setReindexProgress(52), 450);
    setTimeout(() => setReindexProgress(88), 900);
    setTimeout(() => {
      setReindexProgress(100);
      setReindexing(false);
      showToast('Biometrik baza (3,520 ta Face Embedding) muvaffaqiyatli yangilandi!');
    }, 1350);
  };

  const triggerCreateBackup = () => {
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const code = 'BKP-' + Date.now().toString().slice(-8);
    const created = {
      id: code,
      date: nowStr,
      type: 'Qo‘lda yaratilgan Snapshot (PostgreSQL + Media S3)',
      size: '1.86 GB',
      status: 'COMPLETED',
    };
    setBackups([created, ...backups]);
    appendAuditLog('MANUAL_BACKUP', code, 'PostgreSQL va S3 Media omboridan zaxira nusxa olindi');
    showToast(`Yangi zaxira nusxasi (${code}) muvaffaqiyatli yaratildi!`);
  };

  const openTicketsCount = tickets.filter(t => t.status === 'OPEN').length;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: THEME.softGradient, overflow: 'hidden', position: 'relative' }}>
      
      {/* Yumshoq suzib chiquvchi Toast xabarnoma */}
      {toastMsg && (
        <div
          className="sa-modal-box"
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 9999,
            backgroundColor: 'rgba(30, 34, 53, 0.94)',
            backdropFilter: 'blur(12px)',
            color: '#FFFFFF',
            padding: '13px 20px',
            borderRadius: 18,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 18px 38px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* CHAP SIDEBAR — YUMSHOQ VA NAFIS DIZAYN                            */}
      {/* ================================================================= */}
      <aside
        style={{
          width: 286,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          borderRight: `1px solid ${THEME.border}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '22px 16px',
          zIndex: 10,
          flexShrink: 0,
          boxShadow: '4px 0 24px rgba(108, 92, 231, 0.03)',
        }}>
        {/* Brand */}
        <div
          style={{
            padding: '14px 16px',
            marginBottom: 22,
            background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(88, 69, 216, 0.02) 100%)',
            borderRadius: 20,
            border: '1px solid rgba(108, 92, 231, 0.12)',
            boxShadow: '0 4px 16px -4px rgba(108, 92, 231, 0.08)',
          }}>
          <img
            src="/idrok_superadmin_logo.png"
            alt="Idrok Super Admin"
            style={{
              height: 48,
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: THEME.primary,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingTop: 8,
              marginTop: 6,
              borderTop: '1px dashed rgba(108, 92, 231, 0.16)',
            }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span>Idrok Core Markaziy Boshqaruvi</span>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
          <SidebarNavBtn
            active={superTab === 'overview'}
            onClick={() => setSuperTab('overview')}
            icon={<BarChart3 size={17} />}
            label="Global Analitika"
            badge="Jonli"
          />
          <SidebarNavBtn
            active={superTab === 'schools'}
            onClick={() => setSuperTab('schools')}
            icon={<Building2 size={17} />}
            label="Maktablar Boshqaruvi"
            badge={`${schoolsList.length} ta`}
          />
          <SidebarNavBtn
            active={superTab === 'billing'}
            onClick={() => setSuperTab('billing')}
            icon={<Award size={17} />}
            label="Obuna va Moliya"
            badge="MRR"
          />
          <SidebarNavBtn
            active={superTab === 'ai'}
            onClick={() => setSuperTab('ai')}
            icon={<Sparkles size={17} />}
            label="Idrok Vision (Face ID)"
            badge="99.4%"
          />
          <SidebarNavBtn
            active={superTab === 'security'}
            onClick={() => setSuperTab('security')}
            icon={<Lock size={17} />}
            label="Xavfsizlik va Audit"
            badge={`${auditLogs.length}`}
          />
          <SidebarNavBtn
            active={superTab === 'config'}
            onClick={() => setSuperTab('config')}
            icon={<Sliders size={17} />}
            label="Idrok Core Sozlamalari"
            badge="S3/SMS"
          />
          <SidebarNavBtn
            active={superTab === 'support'}
            onClick={() => setSuperTab('support')}
            icon={<Bell size={17} />}
            label="Texnik Yordam"
            badge={openTicketsCount > 0 ? `${openTicketsCount} yangi` : null}
          />
        </div>

        {/* Cluster Health Mini Card */}
        <div
          style={{
            padding: 13,
            borderRadius: 18,
            backgroundColor: '#F8F9FE',
            border: `1px solid ${THEME.border}`,
            marginBottom: 14,
            fontSize: 11.5,
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, color: THEME.textDark }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sa-pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: THEME.green, display: 'inline-block' }} />
              Server Klasteri
            </span>
            <span style={{ color: THEME.green, fontWeight: 800 }}>342 RPS • 0.04%</span>
          </div>
          <div style={{ marginTop: 8, height: 5, borderRadius: 99, backgroundColor: '#E9ECF5', overflow: 'hidden' }}>
            <div style={{ width: '92%', height: '100%', background: THEME.gradient, borderRadius: 99, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Profile Footer */}
        <div style={{ paddingTop: 14, borderTop: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 13,
                background: THEME.gradient,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 12.5,
                flexShrink: 0,
              }}>
              SA
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name || 'Bosh Boshqarma'}
              </div>
              <div style={{ fontSize: 11, color: THEME.green, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: THEME.green }} /> Root 2FA Faol
              </div>
            </div>
          </div>
          <button
            className="sa-btn"
            onClick={handleLogout}
            title="Chiqish"
            style={{ background: '#FFF1F2', border: 'none', color: '#E11D48', padding: 9, borderRadius: 12, cursor: 'pointer', flexShrink: 0 }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* O'NG ASOSIY KONTENT VA SHISHA (GLASS) HEADER                      */}
      {/* ================================================================= */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Top Dynamic Glass Header */}
        <header
          style={{
            padding: '16px 30px',
            backgroundColor: 'rgba(255, 255, 255, 0.84)',
            backdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${THEME.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src="/idrok_superadmin_icon.png"
              alt="Idrok Super Admin"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                objectFit: 'contain',
                boxShadow: '0 6px 16px rgba(108, 92, 231, 0.25)',
                flexShrink: 0,
              }}
            />
            <div>
              <h1 style={{ fontSize: 19, fontWeight: 800, color: THEME.textDark, margin: 0, letterSpacing: '-0.3px' }}>
                {superTab === 'overview' && "Global Analitika va Jonli Monitoring"}
                {superTab === 'schools' && "Maktablar Boshqaruvi"}
                {superTab === 'billing' && "Obuna va Moliya Tizimi"}
                {superTab === 'ai' && "Idrok Vision: AI & Face ID Server Nazorati"}
                {superTab === 'security' && "Tizim Xavfsizligi va Audit Jurnali"}
                {superTab === 'config' && "Idrok Core: Tizim Sozlamalari va Integratsiyalar"}
                {superTab === 'support' && "Texnik Yordam va Murojaatlar Markazi"}
              </h1>
              <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 3 }}>
                Respublika Yagona Idrok Edu Ekotizimi • {schoolsList.length} ta maktab ({activeCount} faol, {trialCount} sinovda, {blockedCount} cheklangan)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {superTab === 'overview' && (
              <>
                <button className="sa-btn" onClick={() => handleExportReport('csv')} style={secondaryBtnStyle}>
                  <Download size={14} /> Global Hisobot (CSV)
                </button>
                <button className="sa-btn" onClick={() => setShowOnboardingWizard(true)} style={primaryBtnStyle}>
                  <Plus size={16} /> Yangi Maktab Qo‘shish
                </button>
              </>
            )}

            {superTab === 'schools' && (
              <>
                <button className="sa-btn" onClick={() => handleExportReport('excel')} style={secondaryBtnStyle}>
                  <FileSpreadsheet size={14} /> Excel
                </button>
                <button className="sa-btn" onClick={() => handleExportReport('csv')} style={secondaryBtnStyle}>
                  <FileText size={14} /> CSV
                </button>
                <button className="sa-btn" onClick={() => handleExportReport('pdf')} style={secondaryBtnStyle}>
                  <FileCode size={14} /> PDF
                </button>
                <button className="sa-btn" onClick={() => setShowOnboardingWizard(true)} style={primaryBtnStyle}>
                  <Plus size={16} /> Yangi Maktab Qo‘shish
                </button>
              </>
            )}

            {superTab === 'billing' && (
              <>
                <button
                  className="sa-btn"
                  onClick={() => {
                    appendAuditLog('BILLING_REMINDER', 'Qarzdor maktablar', 'Avtomatik SMS va Email invoys eslatmalari yuborildi');
                    showToast('Qarzdor maktab direktorlariga SMS va Email eslatmalar yuborildi!');
                  }}
                  style={secondaryBtnStyle}>
                  <Send size={14} /> Qarzdorlarga SMS Eslatma
                </button>
                <button className="sa-btn" onClick={() => setShowNewInvoiceModal(true)} style={primaryBtnStyle}>
                  <Plus size={16} /> Yangi Faktura Yaratish
                </button>
              </>
            )}

            {superTab === 'ai' && (
              <>
                <button
                  className="sa-btn"
                  onClick={() => {
                    appendAuditLog('CLEAN_EMBEDDINGS', 'Face ID DB', 'Chiqib ketgan 42 nafar sobiq o‘quvchi embeddinglari tozalandi');
                    showToast("Eski va bitirgan o'quvchilarning 42 ta yuz embedding'lari tozalandi!");
                  }}
                  style={secondaryBtnStyle}>
                  <Trash2 size={14} /> Eski Embeddinglarni Tozalash
                </button>
                <button className="sa-btn" onClick={triggerReindexBiometrics} style={primaryBtnStyle}>
                  <RefreshCw size={15} /> {reindexing ? `Yangilanmoqda (${reindexProgress}%)...` : 'Biometrik Bazani Yangilash'}
                </button>
              </>
            )}

            {superTab === 'security' && (
              <>
                <button
                  className="sa-btn"
                  onClick={() => {
                    let csv = "\uFEFFVaqt,Foydalanuvchi,IP Manzil,Amal,Maqsad,Tafsilot\n";
                    auditLogs.forEach(l => {
                      csv += `"${l.time}","${l.actor}","${l.ip}","${l.action}","${l.target}","${l.detail}"\n`;
                    });
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.setAttribute('download', 'global_security_audit_logs.csv');
                    a.click();
                    showToast('Audit jurnali CSV formatda yuklab olindi!');
                  }}
                  style={secondaryBtnStyle}>
                  <Download size={14} /> Audit Jurnalini Yuklash
                </button>
                <button
                  className="sa-btn"
                  onClick={() => {
                    const name = window.prompt("Yangi Super Admin yordamchisi F.I.Sh.ni kiriting:");
                    if (!name) return;
                    const role = window.prompt("Roli (TECH_SUPPORT, AUDITOR, FINANCE_MANAGER):", "AUDITOR") || "AUDITOR";
                    setRbacAdmins([
                      ...rbacAdmins,
                      { id: Date.now(), name, role, email: `${name.toLowerCase().replace(/\s+/g, '.')}@idrokedu.uz`, twoFactor: true, permissions: 'Tanlangan modul ruxsati' }
                    ]);
                    appendAuditLog('CREATE_RBAC_ADMIN', name, `Yangi ${role} yordamchi admin qo'shildi`);
                    showToast(`"${name}" yordamchi admin sifatida qo'shildi!`);
                  }}
                  style={primaryBtnStyle}>
                  <UserPlus size={16} /> Yangi Admin Qo‘shish
                </button>
              </>
            )}

            {superTab === 'config' && (
              <>
                <button
                  className="sa-btn"
                  onClick={() => {
                    appendAuditLog('CLEAR_CACHE', 'Redis & Web CDN', 'Global web-panel va API keshi tozalandi');
                    showToast('Web-panel va Redis API keshi muvaffaqiyatli tozalandi!');
                  }}
                  style={secondaryBtnStyle}>
                  <RefreshCw size={14} /> Keshni Tozalash
                </button>
                <button className="sa-btn" onClick={triggerCreateBackup} style={primaryBtnStyle}>
                  <Database size={16} /> Zaxira Nusxa Olish
                </button>
              </>
            )}

            {superTab === 'support' && (
              <button
                className="sa-btn"
                onClick={() => {
                  const q = window.prompt("Yangi FAQ savolini kiriting:");
                  if (!q) return;
                  const a = window.prompt("Javobni kiriting:");
                  if (!a) return;
                  setFaqs([{ id: Date.now(), q, a }, ...faqs]);
                  showToast('Yangi FAQ savol-javobi qo‘shildi!');
                }}
                style={primaryBtnStyle}>
                <Plus size={16} /> Yangi FAQ Qo‘shish
              </button>
            )}
          </div>
        </header>

        {/* =============================================================== */}
        {/* SAHIFA KONTENTI (HAR BIR TAB ALMASHGANDA YUMSHOQ ANIMATSIYA)     */}
        {/* =============================================================== */}
        <div key={superTab} className="sa-tab-content" style={{ padding: '24px 30px', flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
          
          {/* ============================================================= */}
          {/* 1. GLOBAL ANALITIKA VA JONLI MONITORING                       */}
          {/* ============================================================= */}
          {superTab === 'overview' && (
            <>
              {/* Asosiy KPI Ko'rsatkichlari */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 1fr))', gap: 18 }}>
                <MetricCard
                  icon={<Building2 size={18} color={THEME.primary} />}
                  title="Jami Maktablar Soni"
                  value={`${schoolsList.length} ta`}
                  sub={`Faol: ${activeCount} • Sinov: ${trialCount} • Cheklangan: ${blockedCount}`}
                  color={THEME.primary}
                  badge="Multi-Tenant"
                />
                <MetricCard
                  icon={<Users size={18} color={THEME.green} />}
                  title="Tizimdagi Foydalanuvchilar"
                  value={`${(totalStudents + totalTeachers + schoolsList.length).toLocaleString()} nafar`}
                  sub={`${totalStudents.toLocaleString()} o‘quvchi • ${totalTeachers} ustoz • ${schoolsList.length} direktor`}
                  color={THEME.green}
                  badge="Faol baza"
                />
                <MetricCard
                  icon={<Activity size={18} color={THEME.orange} />}
                  title="Bugungi Global Davomat"
                  value={`${avgAttendance}%`}
                  sub="Turniket Face ID + 25s Dinamik QR"
                  color={THEME.orange}
                  badge="+1.4% o‘sish"
                />
                <MetricCard
                  icon={<Server size={18} color={THEME.cyan} />}
                  title="Server So‘rovlari va Barqarorlik"
                  value="342 req/s"
                  sub="Xatolik: 0.04% • O‘rtacha ping: 14ms"
                  color={THEME.cyan}
                  badge="99.98% Uptime"
                />
              </div>

              {/* Idrok Edu Ekotizim Modullari Paneli */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: '20px 24px',
                border: `1px solid ${THEME.border}`,
                boxShadow: '0 8px 24px rgba(108, 92, 231, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 12, background: THEME.gradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: THEME.textDark, margin: 0 }}>
                        Idrok Edu — Tizim Arxitekturasi va Modullar
                      </h3>
                      <p style={{ fontSize: 11.5, color: THEME.textMuted, margin: 0, marginTop: 2 }}>
                        Platformaning 5 ta o'zaro integratsiyalashgan asosiy arxitektura bo'g'inlari
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 800, border: '1px solid #86EFAC' }}>
                    ● Barcha 5 modul sinxron va faol
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
                  {/* Modul 1: Idrok Edu */}
                  <div style={{ padding: 14, borderRadius: 16, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: THEME.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src="/idrok_icon.png" alt="Idrok" style={{ width: 17, height: 17, borderRadius: 5, objectFit: 'contain' }} />
                        <span>Idrok Edu</span>
                      </span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 800 }}>Master Brand</span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textDark, fontWeight: 700 }}>Bosh ekotizim brendi</div>
                    <div style={{ fontSize: 10.5, color: THEME.textMuted, lineHeight: 1.35 }}>Asosiy platforma, landing sahifasi va umumiy boshqaruv shlyuzi.</div>
                  </div>

                  {/* Modul 2: IdrokBoard */}
                  <div style={{ padding: 14, borderRadius: 16, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#D97706', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Monitor size={16} />
                        <span>IdrokBoard</span>
                      </span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 800 }}>Smart Board</span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textDark, fontWeight: 700 }}>Interaktiv aqlli doska</div>
                    <div style={{ fontSize: 10.5, color: THEME.textMuted, lineHeight: 1.35 }}>AI vizualizatsiyasi, interaktiv doska va virtual laboratoriya.</div>
                  </div>

                  {/* Modul 3: Idrok Core */}
                  <div style={{ padding: 14, borderRadius: 16, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#2563EB', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Cpu size={16} />
                        <span>Idrok Core</span>
                      </span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: 800 }}>Backend & DB</span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textDark, fontWeight: 700 }}>Markaziy boshqaruv dvigateli</div>
                    <div style={{ fontSize: 10.5, color: THEME.textMuted, lineHeight: 1.35 }}>Dars jadvallari algoritmi, Face ID oqimlari, RBAC va baza integratsiyasi.</div>
                  </div>

                  {/* Modul 4: Idrok Vision */}
                  <div style={{ padding: 14, borderRadius: 16, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ScanFace size={16} />
                        <span>Idrok Vision</span>
                      </span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, backgroundColor: '#D1FAE5', color: '#047857', fontWeight: 800 }}>Computer Vision</span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textDark, fontWeight: 700 }}>Kameralar & Face ID moduli</div>
                    <div style={{ fontSize: 10.5, color: THEME.textMuted, lineHeight: 1.35 }}>Kirish-chiqish avtomat davomati, darsdagi ishtirok monitoringi.</div>
                  </div>

                  {/* Modul 5: Idrok Mobile */}
                  <div style={{ padding: 14, borderRadius: 16, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#7C3AED', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src="/idrok_mobile_icon.png" alt="Idrok Mobile" style={{ width: 17, height: 17, borderRadius: 5, objectFit: 'contain' }} />
                        <span>Idrok Mobile</span>
                      </span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, backgroundColor: '#EDE9FE', color: '#6D28D9', fontWeight: 800 }}>Flutter App</span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textDark, fontWeight: 700 }}>Kross-platforma mobil ilova</div>
                    <div style={{ fontSize: 10.5, color: THEME.textMuted, lineHeight: 1.35 }}>Shaxsiy jadval, baholar, davomat bildirishnomalari va darslar.</div>
                  </div>
                </div>
              </div>

              {/* Chapda: Katta Silliq Chiziqli Analitik Grafik + O'ngda: Interaktiv Xarita va Geografiya */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.78fr 1fr', gap: 22, alignItems: 'stretch' }}>
                
                {/* KATTA SILLIQ CHIZIQLI STATISTIK GRAFIK */}
                {(() => {
                  const realDbStudentsCount = dbStudents.length || 12;
                  const realPhotosInDb =
                    dbStudents.filter(s => s.photo || s.has_face_id || s.face_encoding).length || realDbStudentsCount;

                  const totalImagesUploaded = totalStudents + realPhotosInDb;
                  const totalFilesUploaded = exportedFilesCount + backups.length + invoices.length + schoolsList.length * 4;
                  const totalSystemChanges = auditLogs.length + schoolsList.length * 12 + exportedFilesCount * 3;

                  const timeSeriesData = [
                    {
                      short: '08:00',
                      imagesLine: 36,
                      filesLine: 22,
                      schoolsLine: 30,
                      changesLine: 52,
                      schoolsCount: Math.max(2, Math.round(schoolsList.length * 0.4)),
                      imagesReal: Math.round(totalImagesUploaded * 0.25),
                      filesReal: Math.round(totalFilesUploaded * 0.22),
                      changesReal: Math.round(totalSystemChanges * 0.24),
                    },
                    {
                      short: '10:00',
                      imagesLine: 72,
                      filesLine: 48,
                      schoolsLine: 50,
                      changesLine: 80,
                      schoolsCount: Math.max(3, Math.round(schoolsList.length * 0.6)),
                      imagesReal: Math.round(totalImagesUploaded * 0.52),
                      filesReal: Math.round(totalFilesUploaded * 0.45),
                      changesReal: Math.round(totalSystemChanges * 0.48),
                    },
                    {
                      short: '12:00',
                      imagesLine: 60,
                      filesLine: 72,
                      schoolsLine: 64,
                      changesLine: 68,
                      schoolsCount: Math.max(3, Math.round(schoolsList.length * 0.75)),
                      imagesReal: Math.round(totalImagesUploaded * 0.68),
                      filesReal: Math.round(totalFilesUploaded * 0.67),
                      changesReal: Math.round(totalSystemChanges * 0.63),
                    },
                    {
                      short: '14:00 (Pik)',
                      imagesLine: 94,
                      filesLine: 86,
                      schoolsLine: 82,
                      changesLine: 98,
                      schoolsCount: schoolsList.length,
                      imagesReal: Math.round(totalImagesUploaded * 0.89),
                      filesReal: Math.round(totalFilesUploaded * 0.86),
                      changesReal: Math.round(totalSystemChanges * 0.88),
                    },
                    {
                      short: '16:00',
                      imagesLine: 80,
                      filesLine: 76,
                      schoolsLine: 88,
                      changesLine: 85,
                      schoolsCount: schoolsList.length,
                      imagesReal: Math.round(totalImagesUploaded * 0.95),
                      filesReal: Math.round(totalFilesUploaded * 0.94),
                      changesReal: Math.round(totalSystemChanges * 0.94),
                    },
                    {
                      short: 'Hozir',
                      imagesLine: 90,
                      filesLine: 84,
                      schoolsLine: 94,
                      changesLine: 95,
                      schoolsCount: schoolsList.length,
                      imagesReal: totalImagesUploaded,
                      filesReal: totalFilesUploaded,
                      changesReal: totalSystemChanges,
                    },
                  ];

                  const svgW = 680;
                  const svgH = 268;
                  const padX = 38;
                  const padY = 26;

                  const getX = idx => padX + (idx * (svgW - padX * 2)) / (timeSeriesData.length - 1);
                  const getY = val => svgH - padY - (val / 105) * (svgH - padY * 2);

                  const buildSmoothPath = key => {
                    const pts = timeSeriesData.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));
                    if (pts.length === 0) return '';
                    let path = `M ${pts[0].x} ${pts[0].y}`;
                    for (let i = 0; i < pts.length - 1; i++) {
                      const curr = pts[i];
                      const next = pts[i + 1];
                      const ctrlX = (curr.x + next.x) / 2;
                      path += ` C ${ctrlX} ${curr.y}, ${ctrlX} ${next.y}, ${next.x} ${next.y}`;
                    }
                    return path;
                  };

                  const changesPath = buildSmoothPath('changesLine');
                  const imagesPath = buildSmoothPath('imagesLine');
                  const filesPath = buildSmoothPath('filesLine');
                  const schoolsPath = buildSmoothPath('schoolsLine');

                  const buildAreaPath = linePath =>
                    `${linePath} L ${getX(timeSeriesData.length - 1)} ${svgH - padY} L ${getX(0)} ${svgH - padY} Z`;

                  const showLine = lineName => chartMode === 'CUMULATIVE' || chartMode === lineName;

                  const handleChartMouseMove = e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relX = ((e.clientX - rect.left) / rect.width) * svgW;
                    const clampedX = Math.max(padX, Math.min(svgW - padX, relX));
                    const ratio = (clampedX - padX) / (svgW - padX * 2);
                    const floatIdx = ratio * (timeSeriesData.length - 1);
                    const i0 = Math.min(timeSeriesData.length - 2, Math.max(0, Math.floor(floatIdx)));
                    const i1 = i0 + 1;
                    const t = floatIdx - i0;
                    const smoothT = t * t * (3 - 2 * t);

                    const p0 = timeSeriesData[i0];
                    const p1 = timeSeriesData[i1];
                    const lerp = (a, b) => a + (b - a) * smoothT;

                    const totalMinutes = Math.round(480 + ratio * 600);
                    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
                    const mm = String(totalMinutes % 60).padStart(2, '0');
                    const timeLabel = ratio > 0.96 ? 'Hozir (Jonli)' : `${hh}:${mm}`;

                    setChartHover({
                      svgX: clampedX,
                      pctX: (clampedX / svgW) * 100,
                      short: timeLabel,
                      imagesLine: lerp(p0.imagesLine, p1.imagesLine),
                      filesLine: lerp(p0.filesLine, p1.filesLine),
                      schoolsLine: lerp(p0.schoolsLine, p1.schoolsLine),
                      changesLine: lerp(p0.changesLine, p1.changesLine),
                      imagesReal: Math.round(lerp(p0.imagesReal, p1.imagesReal)),
                      filesReal: Math.round(lerp(p0.filesReal, p1.filesReal)),
                      schoolsCount: Math.round(lerp(p0.schoolsCount, p1.schoolsCount)),
                      changesReal: Math.round(lerp(p0.changesReal, p1.changesReal)),
                    });
                  };

                  const activePoint = chartHover || timeSeriesData[selectedStageIdx] || timeSeriesData[3];

                  const legendSeries = [
                    { id: 'IMAGES', label: 'Rasmlar Yuklanishi', val: `${activePoint.imagesReal.toLocaleString()} ta`, color: THEME.orange, bg: '#FFFBEB' },
                    { id: 'FILES', label: 'Fayllar Yuklanishi', val: `${activePoint.filesReal.toLocaleString()} ta`, color: THEME.cyan, bg: '#F0F9FF' },
                    { id: 'SCHOOLS', label: 'Yangi Maktablar', val: `${activePoint.schoolsCount} ta maktab`, color: THEME.green, bg: '#ECFDF5' },
                    { id: 'CHANGES', label: 'Tizim O‘zgarishlari', val: `${activePoint.changesReal} ta`, color: THEME.primary, bg: THEME.primaryLight },
                  ];

                  return (
                    <div className="sa-card" style={{ ...cardBoxStyle, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {/* Sarlavha */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="sa-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: THEME.green, display: 'inline-block' }} />
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.textDark, margin: 0, letterSpacing: '-0.2px' }}>
                              Global Yuklanishlar, Yaratilishlar va Tizim O‘zgarishlari Dinamikasi
                            </h3>
                          </div>
                          <p style={{ fontSize: 12, color: THEME.textMuted, margin: '4px 0 0 0' }}>
                            Sichqonchani grafik ustiga olib boring — tanlangan oraliq: <b style={{ color: THEME.primary }}>{activePoint.short}</b>
                          </p>
                        </div>

                        {chartMode !== 'CUMULATIVE' && (
                          <button
                            className="sa-btn"
                            onClick={() => setChartMode('CUMULATIVE')}
                            style={{ padding: '6px 12px', borderRadius: 12, border: `1px solid ${THEME.border}`, backgroundColor: THEME.primaryLight, fontSize: 11.5, fontWeight: 700, color: THEME.primary, cursor: 'pointer' }}>
                            Barcha chiziqlarni ko‘rsatish
                          </button>
                        )}
                      </div>

                      {/* 4 ta Yumshoq Interaktiv Ko'rsatkich Kartochkalari */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                        {legendSeries.map(item => {
                          const isSelectedLine = chartMode === item.id;
                          return (
                            <div
                              key={item.id}
                              className="sa-btn"
                              onClick={() => setChartMode(isSelectedLine ? 'CUMULATIVE' : item.id)}
                              style={{
                                padding: '11px 13px',
                                borderRadius: 16,
                                backgroundColor: isSelectedLine ? item.bg : '#F9FAFE',
                                border: `1.5px solid ${isSelectedLine ? item.color : 'rgba(108, 92, 231, 0.07)'}`,
                                cursor: 'pointer',
                              }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: THEME.textMuted }}>
                                <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0, boxShadow: `0 0 8px ${item.color}66` }} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                              </div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: THEME.textDark, marginTop: 4 }}>
                                {item.val}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* KATTA SILLIQ KO'P-CHIZIQLI (MULTI-LINE) GRAFIK (UZLUKSIZ HOVER BILAN) */}
                      <div
                        style={{
                          background: 'linear-gradient(180deg, #FAFBFD 0%, #F4F6FC 100%)',
                          borderRadius: 22,
                          padding: '18px 14px 10px 14px',
                          border: `1px solid ${THEME.border}`,
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                        }}>
                        {/* Floating Glass Hover Tooltip */}
                        {chartHover && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 14,
                              left: chartHover.pctX > 62 ? `calc(${chartHover.pctX}% - 196px)` : `calc(${chartHover.pctX}% + 14px)`,
                              backgroundColor: 'rgba(24, 28, 46, 0.92)',
                              backdropFilter: 'blur(12px)',
                              color: '#FFFFFF',
                              padding: '11px 14px',
                              borderRadius: 16,
                              fontSize: 11.5,
                              fontWeight: 600,
                              pointerEvents: 'none',
                              zIndex: 15,
                              minWidth: 180,
                              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.22)',
                              border: '1px solid rgba(255,255,255,0.14)',
                              transition: 'left 0.06s ease-out',
                            }}>
                            <div style={{ fontWeight: 800, fontSize: 12, color: '#F8FAFC', marginBottom: 6, paddingBottom: 5, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={13} color="#38BDF8" /> Vaqt oralig‘i:</span>
                              <span style={{ color: '#38BDF8' }}>{chartHover.short}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4.5 }}>
                              {showLine('IMAGES') && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                  <span style={{ color: '#FCD34D' }}>● Rasmlar:</span>
                                  <b>{chartHover.imagesReal.toLocaleString()} ta</b>
                                </div>
                              )}
                              {showLine('FILES') && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                  <span style={{ color: '#7DD3FC' }}>● Fayllar:</span>
                                  <b>{chartHover.filesReal.toLocaleString()} ta</b>
                                </div>
                              )}
                              {showLine('SCHOOLS') && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                  <span style={{ color: '#6EE7B7' }}>● Maktablar:</span>
                                  <b>{chartHover.schoolsCount} ta</b>
                                </div>
                              )}
                              {showLine('CHANGES') && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                  <span style={{ color: '#C4B5FD' }}>● O‘zgarishlar:</span>
                                  <b>{chartHover.changesReal} ta</b>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <svg
                          viewBox={`0 0 ${svgW} ${svgH}`}
                          onMouseMove={handleChartMouseMove}
                          onMouseLeave={() => setChartHover(null)}
                          style={{ width: '100%', height: 280, overflow: 'visible', cursor: 'crosshair' }}>
                          <defs>
                            <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={THEME.primary} stopOpacity="0.18" />
                              <stop offset="100%" stopColor={THEME.primary} stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={THEME.orange} stopOpacity="0.12" />
                              <stop offset="100%" stopColor={THEME.orange} stopOpacity="0.0" />
                            </linearGradient>
                            <filter id="softLineGlow" x="-10%" y="-10%" width="120%" height="120%">
                              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6C5CE7" floodOpacity="0.16" />
                            </filter>
                          </defs>

                          {/* Yumshoq Gorizontal Setka Chiziqlari */}
                          {[25, 50, 75, 100].map(gVal => {
                            const y = getY(gVal);
                            return (
                              <g key={gVal}>
                                <line x1={padX} y1={y} x2={svgW - padX} y2={y} stroke="#E5E9F5" strokeDasharray="5 5" strokeWidth="1" />
                                <text x={4} y={y + 4} fontSize="10" fill={THEME.textMuted} fontWeight="600">
                                  {gVal}%
                                </text>
                              </g>
                            );
                          })}

                          {/* Yumshoq Soya Qatlamlari */}
                          {showLine('CHANGES') && <path d={buildAreaPath(changesPath)} fill="url(#purpleAreaGrad)" />}
                          {showLine('IMAGES') && <path d={buildAreaPath(imagesPath)} fill="url(#orangeAreaGrad)" />}

                          {/* 1-Chiziq (Yashil): Yangi Maktablar */}
                          {showLine('SCHOOLS') && (
                            <path className="sa-chart-line" d={schoolsPath} fill="none" stroke={THEME.green} strokeWidth="3.2" strokeLinecap="round" />
                          )}

                          {/* 2-Chiziq (Moviy): Fayllar Yuklanishi */}
                          {showLine('FILES') && (
                            <path d={filesPath} fill="none" stroke={THEME.cyan} strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round" />
                          )}

                          {/* 3-Chiziq (To'q sariq): Rasmlar Yuklanishi */}
                          {showLine('IMAGES') && (
                            <path className="sa-chart-line" d={imagesPath} fill="none" stroke={THEME.orange} strokeWidth="3.4" strokeLinecap="round" />
                          )}

                          {/* 4-Chiziq (Binafsha): Tizim O'zgarishlari */}
                          {showLine('CHANGES') && (
                            <path className="sa-chart-line" d={changesPath} fill="none" stroke={THEME.primary} strokeWidth="3.8" strokeLinecap="round" filter="url(#softLineGlow)" />
                          )}

                          {/* Sichqoncha olib borilganda jonli Crosshair va porlovchi nuqtalar */}
                          {chartHover && (
                            <g style={{ pointerEvents: 'none' }}>
                              <line
                                x1={chartHover.svgX}
                                y1={padY - 12}
                                x2={chartHover.svgX}
                                y2={svgH - padY}
                                stroke={THEME.primary}
                                strokeDasharray="4 4"
                                strokeWidth="1.5"
                                opacity="0.65"
                              />
                              {showLine('SCHOOLS') && (
                                <circle cx={chartHover.svgX} cy={getY(chartHover.schoolsLine)} r={6.5} fill={THEME.green} stroke="#FFFFFF" strokeWidth="2.5" />
                              )}
                              {showLine('FILES') && (
                                <circle cx={chartHover.svgX} cy={getY(chartHover.filesLine)} r={6.5} fill={THEME.cyan} stroke="#FFFFFF" strokeWidth="2.5" />
                              )}
                              {showLine('IMAGES') && (
                                <circle cx={chartHover.svgX} cy={getY(chartHover.imagesLine)} r={7} fill={THEME.orange} stroke="#FFFFFF" strokeWidth="2.5" />
                              )}
                              {showLine('CHANGES') && (
                                <circle cx={chartHover.svgX} cy={getY(chartHover.changesLine)} r={7.5} fill={THEME.primary} stroke="#FFFFFF" strokeWidth="2.5" />
                              )}
                            </g>
                          )}

                          {/* Asosiy Vaqt Nuqtalari */}
                          {timeSeriesData.map((d, i) => {
                            const cx = getX(i);
                            const isSel = !chartHover && selectedStageIdx === i;
                            return (
                              <g key={d.short} onClick={() => setSelectedStageIdx(i)} style={{ cursor: 'pointer' }}>
                                {isSel && (
                                  <line
                                    x1={cx}
                                    y1={padY - 10}
                                    x2={cx}
                                    y2={svgH - padY}
                                    stroke={THEME.primary}
                                    strokeDasharray="3 3"
                                    strokeWidth="1.4"
                                    opacity="0.5"
                                  />
                                )}

                                {showLine('SCHOOLS') && (
                                  <circle cx={cx} cy={getY(d.schoolsLine)} r={isSel ? 6 : 4} fill={isSel ? THEME.green : '#FFF'} stroke={THEME.green} strokeWidth="2.4" />
                                )}
                                {showLine('FILES') && (
                                  <circle cx={cx} cy={getY(d.filesLine)} r={isSel ? 6 : 4} fill={isSel ? THEME.cyan : '#FFF'} stroke={THEME.cyan} strokeWidth="2.4" />
                                )}
                                {showLine('IMAGES') && (
                                  <circle cx={cx} cy={getY(d.imagesLine)} r={isSel ? 6.5 : 4.2} fill={isSel ? THEME.orange : '#FFF'} stroke={THEME.orange} strokeWidth="2.5" />
                                )}
                                {showLine('CHANGES') && (
                                  <circle cx={cx} cy={getY(d.changesLine)} r={isSel ? 7 : 4.5} fill={isSel ? THEME.primary : '#FFF'} stroke={THEME.primary} strokeWidth="2.6" />
                                )}

                                <text
                                  x={cx}
                                  y={svgH - 4}
                                  textAnchor="middle"
                                  fontSize="11"
                                  fontWeight={isSel ? '800' : '600'}
                                  fill={isSel ? THEME.primary : THEME.textMuted}>
                                  {d.short}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  );
                })()}

                {/* INTERAKTIV XARITA VA GEOGRAFIYA (O'NG TOMONDA YUMSHOQ VA TOZA DIZAYNDA) */}
                <div className="sa-card" style={{ ...cardBoxStyle, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div>
                        <h3 style={{ fontSize: 15.5, fontWeight: 800, color: THEME.textDark, margin: 0 }}>
                          Interaktiv Xarita va Geografiya
                        </h3>
                        <p style={{ fontSize: 11.5, color: THEME.textMuted, margin: '3px 0 0 0' }}>
                          Hududlar bo‘yicha maktablar va o‘quvchilar zichligi
                        </p>
                      </div>
                      <span style={pillBadgeStyle}>{INITIAL_REGIONS.length} hudud</span>
                    </div>

                    {/* Tanlangan hudud kartasi */}
                    <div
                      style={{
                        padding: '15px 18px',
                        borderRadius: 18,
                        background: THEME.gradient,
                        color: '#FFFFFF',
                        marginBottom: 14,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 10px 24px -6px rgba(108, 92, 231, 0.35)',
                        transition: 'all 0.3s ease',
                      }}>
                      <div>
                        <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700, letterSpacing: '0.5px' }}>TANLANGAN HUDUD</div>
                        <div style={{ fontSize: 15.5, fontWeight: 800, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {selectedRegion.name}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 14, textAlign: 'right' }}>
                        <div>
                          <div style={{ fontSize: 10, opacity: 0.8 }}>Maktab</div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{selectedRegion.schools} ta</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, opacity: 0.8 }}>O‘quvchi</div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{selectedRegion.students.toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, opacity: 0.8 }}>Davomat</div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{selectedRegion.attendance}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Hududlar ro'yxati */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                      {INITIAL_REGIONS.map(reg => {
                        const isSel = selectedRegion.id === reg.id;
                        return (
                          <button
                            key={reg.id}
                            className="sa-btn"
                            onClick={() => setSelectedRegion(reg)}
                            style={{
                              padding: '11px 12px',
                              borderRadius: 15,
                              border: `1.5px solid ${isSel ? THEME.primary : 'rgba(108, 92, 231, 0.07)'}`,
                              backgroundColor: isSel ? THEME.primaryLight : '#F9FAFE',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12, color: isSel ? THEME.primary : THEME.textDark }}>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reg.name}</span>
                              <span>{reg.schools} ta</span>
                            </div>
                            <div style={{ fontSize: 10.5, color: THEME.textMuted, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                              <span>{reg.students.toLocaleString()} o‘quvchi</span>
                              <span style={{ fontWeight: 700, color: THEME.green }}>{reg.attendance}%</span>
                            </div>
                            <div style={{ marginTop: 6, height: 4.5, backgroundColor: '#E9ECF5', borderRadius: 99, overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${reg.density}%`,
                                  height: '100%',
                                  backgroundColor: isSel ? THEME.primary : THEME.green,
                                  borderRadius: 99,
                                  transition: 'width 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ============================================================= */}
          {/* 2. MAKTABLAR BOSHQARUVI                                       */}
          {/* ============================================================= */}
          {superTab === 'schools' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              
              {/* Filtrlar va Qidiruv Paneli */}
              <div className="sa-card" style={{ ...cardBoxStyle, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: 250 }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: THEME.textMuted }} />
                    <input
                      placeholder="Maktab, INN, direktor qidirish..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 13, border: `1px solid ${THEME.border}`, backgroundColor: '#F9FAFE', fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectFilterStyle}>
                    <option value="ALL">Barcha Statuslar</option>
                    <option value="ACTIVE">Faol</option>
                    <option value="TRIAL">Sinov muddati</option>
                    <option value="SUSPENDED">To‘xtatilgan</option>
                    <option value="ARCHIVED">Arxivlangan</option>
                  </select>

                  <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={selectFilterStyle}>
                    <option value="ALL">Barcha Hududlar</option>
                    <option value="Toshkent">Toshkent sh.</option>
                    <option value="Samarqand">Samarqand</option>
                    <option value="Farg'ona">Farg‘ona</option>
                    <option value="Buxoro">Buxoro</option>
                  </select>

                  <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} style={selectFilterStyle}>
                    <option value="ALL">Barcha To‘lov Holatlari</option>
                    <option value="PAID">To‘langan</option>
                    <option value="PENDING">Kutilmoqda</option>
                    <option value="OVERDUE">Qarzdor</option>
                  </select>
                </div>

                <div style={{ fontSize: 12, fontWeight: 800, color: THEME.primary }}>
                  Natija: {filteredSchools.length} ta maktab
                </div>
              </div>

              {/* Chapda Maktablar Ro'yxati + O'ngda Maktab Pasporti */}
              <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
                
                <aside className="sa-card" style={{ width: 320, flexShrink: 0, ...cardBoxStyle, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: THEME.textDark, paddingBottom: 8, borderBottom: `1px solid ${THEME.border}` }}>
                    Muassasalar Ro‘yxati ({filteredSchools.length})
                  </div>
                  {filteredSchools.map(sc => {
                    const isSel = currentSelectedSchool && currentSelectedSchool.id === sc.id;
                    return (
                      <button
                        key={sc.id}
                        className="sa-btn"
                        onClick={() => setSelectedSchoolId(sc.id)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: 16,
                          border: `1px solid ${isSel ? THEME.primary : THEME.border}`,
                          background: isSel ? THEME.gradient : '#F9FAFE',
                          color: isSel ? '#FFFFFF' : THEME.textDark,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: isSel ? '0 8px 20px -4px rgba(108, 92, 231, 0.35)' : 'none',
                        }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sc.name}
                          </div>
                          <div style={{ fontSize: 11, color: isSel ? 'rgba(255,255,255,0.82)' : THEME.textMuted, marginTop: 2 }}>
                            INN: {sc.inn || '309182736'} • {sc.plan || 'Standart'}
                          </div>
                        </div>
                        <ChevronRight size={15} color={isSel ? '#FFFFFF' : THEME.textMuted} />
                      </button>
                    );
                  })}
                </aside>

                {currentSelectedSchool && (() => {
                  const schoolDbStudents = dbStudents.filter(st => String(st.school_id) === String(currentSelectedSchool.id));
                  const schoolDbTeachers = dbTeachers.filter(tc => String(tc.school_id) === String(currentSelectedSchool.id));
                  const schoolDbClasses = dbClasses.filter(cl => String(cl.school_id) === String(currentSelectedSchool.id));

                  return (
                    <div className="sa-card" style={{ flex: 1, ...cardBoxStyle, display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {currentSelectedSchool.warningBanner && (
                        <div style={{ padding: '12px 16px', borderRadius: 16, backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#B45309', fontSize: 12.5, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={15} color="#D97706" /> Faol ogohlantirish banneri: "{currentSelectedSchool.warningBanner}"
                          </span>
                          <button
                            onClick={() => {
                              const updated = schoolsList.map(s => s.id === currentSelectedSchool.id ? { ...s, warningBanner: '' } : s);
                              onUpdateSchools(updated);
                              showToast('Banner olib tashlandi');
                            }}
                            style={{ border: 'none', background: 'transparent', color: '#B45309', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            Olib tashlash <X size={14} />
                          </button>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, paddingBottom: 16, borderBottom: `1px solid ${THEME.border}` }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: 19, fontWeight: 800, color: THEME.textDark, margin: 0 }}>{currentSelectedSchool.name}</h2>
                            <StatusBadge status={currentSelectedSchool.status} />
                            <span style={pillBadgeStyle}>
                              <Lock size={12} style={{ display: 'inline', marginRight: 4 }} /> Izolyatsiyalangan Baza #{currentSelectedSchool.id}
                            </span>
                          </div>
                          <div style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={13} /> {currentSelectedSchool.district}
                            </span>
                            • INN/Kod: <b>{currentSelectedSchool.inn || '309481023'}</b> • Direktor: <b>{currentSelectedSchool.director}</b> ({currentSelectedSchool.phone})
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            className="sa-btn"
                            onClick={() => handleGhostLogin(currentSelectedSchool)}
                            style={primaryBtnStyle}
                            title="Maktabning o'z dashbordiga kirib sinf, o'qituvchi va o'quvchi yaratish">
                            Maktab Dashbordiga Kirib Boshqarish <ArrowUpRight size={15} />
                          </button>
                          <button
                            className="sa-btn"
                            onClick={() => setEditingSchool(currentSelectedSchool)}
                            style={secondaryBtnStyle}>
                            <Edit size={14} /> Rekvizitlar
                          </button>
                        </div>
                      </div>

                      {/* Izolyatsiya qoidasi eslatmasi */}
                      <div style={{ padding: '14px 18px', borderRadius: 18, backgroundColor: THEME.primaryLight, border: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 12.5, color: THEME.textDark, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <Lock size={16} color={THEME.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <b>Multi-Tenant Izolyatsiya Qoidasi:</b> Super Admin o‘z dashbordidan turib to‘g‘ridan-to‘g‘ri o‘quvchi, o‘qituvchi yoki sinf yaratmaydi. Ushbu maktab bazasiga yangi sinf, o‘qituvchi yoki o‘quvchi qo‘shish va sozlash uchun <b>"Maktab Dashbordiga Kirib Boshqarish"</b> tugmasi orqali maktabning ichki paneliga kiring.
                          </div>
                        </div>
                      </div>

                      {/* Miqdoriy Ko'rsatkichlar (Faqat raqamlar va agregat ma'lumotlar — ro'yxatsiz) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        <div style={miniStatBoxStyle}>
                          <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>Jami O‘quvchilar Soni</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.primary, marginTop: 4 }}>
                            {schoolDbStudents.length} nafar
                          </div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>Kvota: {currentSelectedSchool.capacity || 800} ta</div>
                        </div>

                        <div style={miniStatBoxStyle}>
                          <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>
                            Jami {currentSelectedSchool.groupTerm === 'GURUH' ? 'Guruhlar' : 'Sinflar'} Soni
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.textDark, marginTop: 4 }}>
                            {schoolDbClasses.length} ta {currentSelectedSchool.groupTerm === 'GURUH' ? 'guruh' : 'sinf'}
                          </div>
                          <div style={{ fontSize: 11, color: THEME.green, marginTop: 2 }}>
                            {currentSelectedSchool.groupTerm === 'GURUH' ? 'Guruh tizimida' : 'Sinf tizimida'}
                          </div>
                        </div>

                        <div style={miniStatBoxStyle}>
                          <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>Jami O‘qituvchilar Soni</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.textDark, marginTop: 4 }}>
                            {schoolDbTeachers.length} nafar
                          </div>
                          <div style={{ fontSize: 11, color: THEME.cyan, marginTop: 2 }}>
                            Fan ustozlari bazasi
                          </div>
                        </div>

                        <div style={miniStatBoxStyle}>
                          <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600 }}>Bugungi Davomat Ko‘rsatkichi</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.orange, marginTop: 4 }}>
                            {currentSelectedSchool.attendanceRate || 96.2}%
                          </div>
                          <div style={{ fontSize: 11, color: THEME.green, marginTop: 2 }}>Turniket Face ID & QR</div>
                        </div>
                      </div>

                      {/* Maktabning Asosiy Baza Parametrlari (Ro'yxatsiz, faqat agregat ko'rsatkichlar) */}
                      <div style={{ padding: 18, borderRadius: 20, backgroundColor: '#F9FAFE', border: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <FileText size={16} color={THEME.primary} /> {currentSelectedSchool.name} — Baza va Konfiguratsiya Ko‘rsatkichlari
                            </div>
                            <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 2 }}>
                              Sinflar va o‘quvchilar ro‘yxati multi-tenant xavfsizlik talabiga binoan faqat maktab ichki dashbordida to‘liq ochiladi
                            </div>
                          </div>
                          <button
                            className="sa-btn"
                            onClick={() => handleGhostLogin(currentSelectedSchool)}
                            style={{ ...secondaryBtnStyle, color: THEME.primary, borderColor: THEME.primary, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            Maktab Dashbordiga Kirish <ChevronRight size={15} />
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                          <div style={{ padding: '12px 14px', borderRadius: 14, backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}` }}>
                            <div style={{ fontSize: 11, color: THEME.textMuted }}>Direktor Login va Paroli</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textDark, marginTop: 3 }}>
                              <code>{currentSelectedSchool.username}</code> / <code>{currentSelectedSchool.password}</code>
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>Direktor: {currentSelectedSchool.director}</div>
                          </div>

                          <div style={{ padding: '12px 14px', borderRadius: 14, backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}` }}>
                            <div style={{ fontSize: 11, color: THEME.textMuted }}>Xaritadagi Joylashuv & Radius</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: THEME.textDark, marginTop: 3 }}>
                              {currentSelectedSchool.is_location_set !== false ? (
                                <span style={{ color: THEME.green, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <MapPin size={13} /> Belgilangan ({currentSelectedSchool.radius_meters || 150} metr)
                                </span>
                              ) : (
                                <span style={{ color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <AlertTriangle size={13} /> Belgilanmagan
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>{currentSelectedSchool.district}</div>
                          </div>

                          <div style={{ padding: '12px 14px', borderRadius: 14, backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}` }}>
                            <div style={{ fontSize: 11, color: THEME.textMuted }}>Obuna Tarifi & Status</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: THEME.primary, marginTop: 3 }}>
                              {currentSelectedSchool.plan || 'Standart'}
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>Holati: {currentSelectedSchool.status === 'ACTIVE' ? 'Faol' : currentSelectedSchool.status}</div>
                          </div>

                          <div style={{ padding: '12px 14px', borderRadius: 14, backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}` }}>
                            <div style={{ fontSize: 11, color: THEME.textMuted }}>Faol Tizim Modullari</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.green, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><ScanFace size={13} /> Face ID</span>
                              •
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><QrCode size={13} /> 25s QR</span>
                              •
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Bot size={13} /> TG Bot</span>
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              Baza: <Lock size={11} /> Izolyatsiyalangan #{currentSelectedSchool.id}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cheklovlar va Bloklash */}
                      <div style={{ padding: 18, borderRadius: 20, backgroundColor: '#FFF8F9', border: '1px solid #FECDD3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: '#9F1239' }}>
                            Cheklovlar, Muzlatish va Ogohlantirish Banneri
                          </div>
                          <div style={{ fontSize: 11.5, color: '#BE123C', marginTop: 2 }}>
                            To‘lov kechikkanda kirishni to‘xtatish, ogohlantirish banneri chiqarish yoki arxivga olish
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            className="sa-btn"
                            onClick={() => {
                              setWarningModalSchool(currentSelectedSchool);
                              setWarningBannerInput(currentSelectedSchool.warningBanner || "Diqqat: Maktab obuna to'lov muddati tugashiga 3 kun qoldi!");
                            }}
                            style={{ padding: '8px 13px', borderRadius: 12, border: '1px solid #FDE68A', backgroundColor: '#FFFBEB', color: '#B45309', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Bell size={13} /> Ogohlantirish Banneri
                          </button>

                          {(currentSelectedSchool.status !== 'SUSPENDED' && currentSelectedSchool.status !== 'BLOCKED') ? (
                            <button
                              className="sa-btn"
                              onClick={() => {
                                setSchoolSuspendModalSchool(currentSelectedSchool);
                                setSuspendForm({
                                  reason_type: 'DEBT',
                                  status_reason: "Oylik obuna to'lovi to'lanmaganligi sababli xizmatlar vaqtincha to'xtatildi",
                                  debt_amount: currentSelectedSchool.debtAmount || "4 800 000 so‘m"
                                });
                              }}
                              style={{ padding: '8px 13px', borderRadius: 12, border: 'none', backgroundColor: '#F59E0B', color: '#FFFFFF', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <Pause size={13} /> Vaqtincha To‘xtatish
                            </button>
                          ) : (
                            <button
                              className="sa-btn"
                              onClick={() => handleSetSchoolStatus(currentSelectedSchool, 'ACTIVE', '', 'PAID', "0 so'm")}
                              style={{ padding: '8px 13px', borderRadius: 12, border: 'none', backgroundColor: THEME.green, color: '#FFFFFF', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <CheckCircle2 size={13} /> Faollashtirish (Tiklash)
                            </button>
                          )}

                          <button
                            className="sa-btn"
                            onClick={() => handleSetSchoolStatus(currentSelectedSchool, 'ARCHIVED', 'Maktab ma\'lumotlari arxivlandi')}
                            style={{ padding: '8px 13px', borderRadius: 12, border: `1px solid ${THEME.border}`, backgroundColor: '#FFFFFF', color: THEME.textDark, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Archive size={13} /> Arxivlash
                          </button>

                          <button
                            className="sa-btn"
                            onClick={() => handleHardDeleteSchool(currentSelectedSchool)}
                            style={{ padding: '8px 13px', borderRadius: 12, border: 'none', backgroundColor: '#F43F5E', color: '#FFFFFF', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Trash2 size={13} /> O‘chirish
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 3. OBUNA VA MOLIYA TIZIMI                                     */}
          {/* ============================================================= */}
          {superTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 1fr))', gap: 18 }}>
                <MetricCard icon={<TrendingUp size={18} color={THEME.green} />} title="Oylik Daromad (MRR)" value="15 800 000 so‘m" sub="O‘tgan oyga nisbatan +18.5%" color={THEME.green} badge="MRR" />
                <MetricCard icon={<Award size={18} color={THEME.primary} />} title="Yillik Proyeksiya (ARR)" value="189 600 000 so‘m" sub="Shartnomalar bo‘yicha yillik" color={THEME.primary} badge="ARR" />
                <MetricCard icon={<AlertTriangle size={18} color="#F43F5E" />} title="Umumiy Qarzdorlik" value="3 700 000 so‘m" sub="2 ta maktab to‘lovi kutilmoqda" color="#F43F5E" badge="Nazoratda" />
                <MetricCard icon={<CheckCircle2 size={18} color={THEME.cyan} />} title="To‘lov Shlyuzlari" value="4 ta Faol" sub="Payme • Click • Uzum • Bank" color={THEME.cyan} badge="Online" />
              </div>

              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={sectionTitleStyle}>Tarif Rejalari Konstruktori</h3>
                    <p style={sectionSubStyle}>Maktab paketlari, modul ruxsatlari, oylik narxlar va xotira limitlarini to‘liq sozlash</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      className="sa-btn"
                      onClick={handleResetDefaultTiers}
                      style={{ ...secondaryBtnStyle, fontSize: 12 }}
                      title="Barcha tariflarni standart boshlang'ich holatiga qaytarish">
                      <RefreshCw size={13} /> Dastlabki Holatga Qaytarish
                    </button>
                    <button
                      className="sa-btn"
                      onClick={handleOpenCreateTier}
                      style={{ ...primaryBtnStyle, fontSize: 12 }}>
                      <Plus size={15} /> Yangi Tarif Qo‘shish
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
                  {pricingTiers.map(tier => {
                    const activeModulesCount = tier.modules ? Object.values(tier.modules).filter(Boolean).length : 0;
                    return (
                      <div
                        key={tier.id}
                        className="sa-metric-card"
                        style={{
                          padding: 22,
                          borderRadius: 24,
                          border: `1.5px solid ${tier.popular ? tier.color || THEME.primary : THEME.border}`,
                          backgroundColor: tier.popular ? '#FCFBFF' : '#FFFFFF',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14,
                          position: 'relative',
                          boxShadow: tier.popular ? '0 12px 30px -8px rgba(108, 92, 231, 0.18)' : 'none',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 900, fontSize: 17, color: tier.color || THEME.primary }}>
                            {tier.name}
                          </span>
                          {tier.popular && (
                            <span style={pillBadgeStyle}>
                              <Star size={12} fill="#F59E0B" color="#F59E0B" style={{ display: 'inline', marginRight: 4 }} /> Eng Ommabop
                            </span>
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: 22, fontWeight: 900, color: THEME.textDark }}>
                            {tier.pricePerMonth}
                          </div>
                          <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                            Yoki: <b>{tier.perStudent}</b>
                          </div>
                        </div>

                        {/* Limitlar */}
                        <div style={{ padding: 13, borderRadius: 16, backgroundColor: '#F8F9FE', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={14} color={THEME.primary} /> Maksimal o‘quvchilar: <b>{tier.maxStudents} nafar</b>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building2 size={14} color={THEME.primary} /> Xonalar sig‘imi: <b>{tier.maxRooms} ta</b>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Database size={14} color={THEME.primary} /> Cloud Xotira: <b>{tier.storageGb} GB S3</b>
                          </div>
                        </div>

                        {/* Modullar piktogrammalari */}
                        {tier.modules && (
                          <div style={{ padding: '10px 12px', borderRadius: 14, backgroundColor: '#F1F5F9', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, width: '100%', marginBottom: 2 }}>
                              Yoqilgan tizim modullari ({activeModulesCount} ta):
                            </span>
                            {tier.modules.face_id && <span style={tierBadgeStyle}><ScanFace size={12} /> Face ID</span>}
                            {tier.modules.dynamic_qr && <span style={tierBadgeStyle}><QrCode size={12} /> 25s QR</span>}
                            {tier.modules.telegram_bot && <span style={tierBadgeStyle}><Bot size={12} /> TG Bot</span>}
                            {tier.modules.turnstile_api && <span style={tierBadgeStyle}><DoorOpen size={12} /> Turniket</span>}
                            {tier.modules.anti_spoofing && <span style={tierBadgeStyle}><ShieldCheck size={12} /> Anti-Spoof</span>}
                            {tier.modules.sms_alerts && <span style={tierBadgeStyle}><Send size={12} /> SMS</span>}
                            {tier.modules.journal_matrix && <span style={tierBadgeStyle}><FileSpreadsheet size={12} /> Jurnal</span>}
                            {tier.modules.gps_geofence && <span style={tierBadgeStyle}><MapPin size={12} /> Geometka</span>}
                            {tier.modules.vip_support && <span style={tierBadgeStyle}><Zap size={12} /> VIP SLA</span>}
                          </div>
                        )}

                        {/* Imkoniyatlar ro'yxati */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, flex: 1 }}>
                          {(tier.features || []).map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, color: THEME.textDark }}>
                              <CheckCircle2 size={14} color={THEME.green} style={{ flexShrink: 0 }} />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pastki boshqaruv tugmalari */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: `1px solid ${THEME.border}` }}>
                          <button
                            className="sa-btn"
                            onClick={() => handleOpenEditTier(tier)}
                            style={{ ...primaryBtnStyle, flex: 1, justifyContent: 'center', fontSize: 12, padding: '9px 12px', background: tier.color ? `linear-gradient(135deg, ${tier.color} 0%, #4338CA 100%)` : THEME.gradient }}>
                            <Edit size={13} /> To‘liq Sozlash
                          </button>
                          {pricingTiers.length > 1 && (
                            <button
                              className="sa-btn"
                              onClick={() => handleDeleteTier(tier.id)}
                              title="Tarifni o‘chirish"
                              style={{ ...secondaryBtnStyle, color: '#EF4444', borderColor: '#FCA5A5', padding: '9px 12px' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={sectionTitleStyle}>Fakturalar va To‘lov Tizimlari Arxivi</h3>
                  <p style={sectionSubStyle}>Payme, Click, Uzum Business va Bank hisob-raqami orqali kelib tushgan to‘lovlar</p>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', minWidth: 650, borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted }}>
                        <th style={{ padding: '12px' }}>Invoice ID</th>
                        <th style={{ padding: '12px' }}>Maktab</th>
                        <th style={{ padding: '12px' }}>Tarif</th>
                        <th style={{ padding: '12px' }}>Summa</th>
                        <th style={{ padding: '12px' }}>To‘lov Tizimi</th>
                        <th style={{ padding: '12px' }}>Muddati</th>
                        <th style={{ padding: '12px' }}>Holati</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                          <td style={{ padding: '12px', fontWeight: 700, fontFamily: 'monospace' }}>{inv.id}</td>
                          <td style={{ padding: '12px', fontWeight: 700 }}>{inv.schoolName}</td>
                          <td style={{ padding: '12px' }}>{inv.plan}</td>
                          <td style={{ padding: '12px', fontWeight: 800, color: THEME.primary }}>{inv.amount}</td>
                          <td style={{ padding: '12px' }}>{inv.method}</td>
                          <td style={{ padding: '12px', fontSize: 12, color: THEME.textMuted }}>{inv.dueDate}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor: inv.status === 'PAID' ? '#ECFDF5' : inv.status === 'PENDING' ? '#FFFBEB' : '#FFF1F2',
                              color: inv.status === 'PAID' ? THEME.green : inv.status === 'PENDING' ? '#D97706' : '#E11D48',
                            }}>
                              {inv.status === 'PAID' ? 'To‘langan' : inv.status === 'PENDING' ? 'Kutilmoqda' : 'Qarzdor'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 4. AI VA BIOMETRIK SERVER NAZORATI                            */}
          {/* ============================================================= */}
          {superTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 1fr))', gap: 18 }}>
                <MetricCard icon={<Sparkles size={18} color={THEME.primary} />} title="Faol AI Model" value="InsightFace v2.4" sub={activeAiModel} color={THEME.primary} badge="ArcFace 512D" />
                <MetricCard icon={<Activity size={18} color={THEME.green} />} title="Embedding Tezligi" value="18.4 ms" sub="Muvaffaqiyat darajasi: 99.4%" color={THEME.green} badge="Real-Time" />
                <MetricCard icon={<Server size={18} color={THEME.cyan} />} title="GPU Yuklamasi (A100)" value="42% Load" sub="VRAM: 14.2 GB / 40 GB" color={THEME.cyan} badge="Optimal" />
                <MetricCard icon={<Shield size={18} color={THEME.orange} />} title="Anti-Spoofing Himoya" value="99.8% Aniqlik" sub="Ekran va qog‘oz rasm filtri" color={THEME.orange} badge="3D Depth AI" />
              </div>

              <div className="sa-card" style={{ ...cardBoxStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h3 style={sectionTitleStyle}>AI Biometrik Dvigatel va Model Versiyasi</h3>
                  <p style={sectionSubStyle}>Maktablar turniketi va mobil Face ID tekshiruvi uchun asosiy neyron tarmoq modeli</p>
                </div>
                <select
                  value={activeAiModel}
                  onChange={e => {
                    setActiveAiModel(e.target.value);
                    appendAuditLog('CHANGE_AI_MODEL', e.target.value, 'Face ID klaster modeli almashtirildi');
                    showToast(`AI model "${e.target.value}" ga o'tkazildi!`);
                  }}
                  style={{ ...selectFilterStyle, fontWeight: 700, padding: '11px 16px' }}>
                  <option value="InsightFace ArcFace v2.4 (GPU TensorRT)">InsightFace ArcFace v2.4 (GPU TensorRT)</option>
                  <option value="FaceNet-512 High-Precision v3.1">FaceNet-512 High-Precision v3.1</option>
                  <option value="DeepFace Hybrid Anti-Spoof v4.0">DeepFace Hybrid Anti-Spoof v4.0</option>
                </select>
              </div>

              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={sectionTitleStyle}>Sifat va Anti-Spoofing Nazorati Jurnali</h3>
                  <p style={sectionSubStyle}>Telefon ekranidan rasm ko‘rsatish yoki xira fotosurat tufayli qaytarilgan urinishlar</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {spoofLogs.map(log => (
                    <div key={log.id} style={{ padding: 15, borderRadius: 18, backgroundColor: log.severity === 'CRITICAL' ? '#FFF5F6' : '#FFFBEB', border: `1px solid ${log.severity === 'CRITICAL' ? '#FECDD3' : '#FDE68A'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ padding: '3px 9px', borderRadius: 8, backgroundColor: log.severity === 'CRITICAL' ? '#F43F5E' : '#F59E0B', color: '#FFFFFF', fontWeight: 700, fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {log.severity === 'CRITICAL' ? <ShieldCheck size={11} /> : <AlertTriangle size={11} />}
                            {log.severity === 'CRITICAL' ? 'ANTI-SPOOFING' : 'SIFAT OGOHLANTIRISHI'}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark }}>{log.school}</span>
                          <span style={{ fontSize: 12, color: THEME.textMuted }}>• O‘quvchi: <b>{log.studentName}</b> (ID: {log.studentId})</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: THEME.textDark, marginTop: 6 }}>{log.reason}</div>
                      </div>
                      <span style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 600 }}>{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 5. TIZIM XAVFSIZLIGI VA AUDIT                                 */}
          {/* ============================================================= */}
          {superTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                <div className="sa-card" style={cardBoxStyle}>
                  <h3 style={sectionTitleStyle}>Dinamik QR Monitoringi (25s Token)</h3>
                  <p style={sectionSubStyle}>Generatsiya tezligi: <b>3.1 ms</b> • Validatsiya tezligi: <b>4.8 ms</b></p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                    {qrAlerts.map(al => (
                      <div key={al.id} style={{ padding: 13, borderRadius: 16, backgroundColor: '#F9FAFE', borderLeft: '4px solid #F43F5E' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700 }}>
                          <span style={{ color: THEME.primary }}>{al.school} — {al.student}</span>
                          <span style={{ color: '#F43F5E' }}>{al.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: THEME.textDark, marginTop: 4 }}>{al.issue}</div>
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>{al.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sa-card" style={cardBoxStyle}>
                  <h3 style={sectionTitleStyle}>Kirish Huquqlari (RBAC) va 2FA Sozlamalari</h3>
                  <p style={sectionSubStyle}>Super Admin yordamchilari va ikki bosqichli autentifikatsiya</p>

                  <div style={{ display: 'flex', gap: 10, marginTop: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                    {[
                      { key: 'superAdmins', label: 'Super Adminlar 2FA' },
                      { key: 'directors', label: 'Direktorlar 2FA' },
                      { key: 'teachers', label: 'Ustozlar 2FA' },
                    ].map(item => (
                      <button
                        key={item.key}
                        className="sa-btn"
                        onClick={() => setRequire2FA(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 12,
                          border: `1px solid ${require2FA[item.key] ? THEME.green : THEME.border}`,
                          backgroundColor: require2FA[item.key] ? '#ECFDF5' : '#F9FAFE',
                          color: require2FA[item.key] ? THEME.green : THEME.textMuted,
                          fontWeight: 700,
                          fontSize: 11.5,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                        {require2FA[item.key] ? <CheckSquare size={13} /> : <Square size={13} />} {item.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rbacAdmins.map(adm => (
                      <div key={adm.id} style={{ padding: 11, borderRadius: 14, backgroundColor: '#F9FAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12.5, color: THEME.textDark }}>{adm.name} <span style={{ color: THEME.primary }}>({adm.role})</span></div>
                          <div style={{ fontSize: 11, color: THEME.textMuted }}>{adm.email} • {adm.permissions}</div>
                        </div>
                        <span style={{ padding: '3px 9px', borderRadius: 8, backgroundColor: adm.twoFactor ? '#ECFDF5' : '#FFFBEB', color: adm.twoFactor ? THEME.green : '#D97706', fontWeight: 700, fontSize: 10.5 }}>
                          {adm.twoFactor ? '2FA Faol' : '2FA O‘chiq'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bazadagi barcha o'quvchilarning yaratilganlik tarixi (Maktablar kesimida) */}
              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={sectionTitleStyle}>Bazadagi Jami O‘quvchilarning Kim Tomonidan Yaratilganlik Tarixi</h3>
                    <p style={sectionSubStyle}>
                      Har bir o‘quvchining qaysi maktab bazasiga tegishli ekanligi, kim tomonidan va qachon yaratilganligi (Jami: <b>{dbStudents.length} nafar</b>)
                    </p>
                  </div>
                  <span style={pillBadgeStyle}>100% Izolyatsiyalangan</span>
                </div>

                <div style={{ overflowX: 'auto', width: '100%', marginTop: 14 }}>
                  <table style={{ width: '100%', minWidth: 650, borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted }}>
                        <th style={{ padding: '10px' }}>O‘quvchi F.I.Sh.</th>
                        <th style={{ padding: '10px' }}>Kirish ID</th>
                        <th style={{ padding: '10px' }}>Tegishli Maktab Bazasi</th>
                        <th style={{ padding: '10px' }}>Sinf / Guruh</th>
                        <th style={{ padding: '10px' }}>Kim Tomonidan Yaratilgan</th>
                        <th style={{ padding: '10px' }}>Yaratilgan Vaqti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbStudents.map(st => {
                        const isSuper = (st.created_by_role || '').includes('SUPER') || (st.created_by || '').toLowerCase().includes('super');
                        return (
                          <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                            <td style={{ padding: '10px', fontWeight: 700, color: THEME.textDark }}>{st.last_name} {st.first_name}</td>
                            <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 700, color: THEME.primary }}>{st.student_id}</td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ padding: '3px 9px', borderRadius: 8, backgroundColor: '#F8FAFC', border: `1px solid ${THEME.border}`, fontWeight: 700, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Lock size={11} /> {st.school_name || `Maktab #${st.school_id}`}
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 700, fontSize: 11 }}>
                                {st.class_name || 'Guruhsiz'}
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{
                                padding: '2px 7px',
                                borderRadius: 6,
                                fontSize: 10,
                                fontWeight: 800,
                                marginRight: 6,
                                backgroundColor: isSuper ? '#FFF0F3' : '#ECFDF5',
                                color: isSuper ? '#E11D48' : THEME.green,
                              }}>
                                {isSuper ? 'SUPER ADMIN' : 'MAKTAB ADMINI'}
                              </span>
                              <span style={{ fontWeight: 600, color: THEME.textDark }}>{st.created_by || 'Maktab Direktori'}</span>
                            </td>
                            <td style={{ padding: '10px', fontFamily: 'monospace', color: THEME.textMuted }}>{st.date_joined}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="sa-card" style={cardBoxStyle}>
                <h3 style={sectionTitleStyle}>Global Audit Jurnali</h3>
                <p style={sectionSubStyle}>Barcha tizim amallari, Ghost Login o‘tishlari va ma'lumotlar o‘zgarishi tarixi</p>

                <div style={{ overflowX: 'auto', width: '100%', marginTop: 14 }}>
                  <table style={{ width: '100%', minWidth: 650, borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted }}>
                        <th style={{ padding: '10px' }}>Vaqt</th>
                        <th style={{ padding: '10px' }}>Foydalanuvchi</th>
                        <th style={{ padding: '10px' }}>IP Manzil</th>
                        <th style={{ padding: '10px' }}>Amal</th>
                        <th style={{ padding: '10px' }}>Obyekt</th>
                        <th style={{ padding: '10px' }}>Tafsilot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                          <td style={{ padding: '10px', fontFamily: 'monospace', color: THEME.textMuted }}>{log.time}</td>
                          <td style={{ padding: '10px', fontWeight: 700 }}>{log.actor}</td>
                          <td style={{ padding: '10px', fontFamily: 'monospace' }}>{log.ip}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ padding: '3px 9px', borderRadius: 8, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 700, fontSize: 11 }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: '10px', fontWeight: 700 }}>{log.target}</td>
                          <td style={{ padding: '10px', color: THEME.textDark }}>{log.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 6. TIZIM SOZLAMALARI VA INTEGRATSIYALAR                       */}
          {/* ============================================================= */}
          {superTab === 'config' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                <div className="sa-card" style={cardBoxStyle}>
                  <h3 style={sectionTitleStyle}>Aloqa va Bildirishnomalar</h3>
                  <p style={sectionSubStyle}>SMS shlyuz, Telegram Bot va Firebase Push xabarnomalar sozlamalari</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                    <div style={miniStatBoxStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Send size={14} color={THEME.primary} /> SMS Shlyuz ({systemConfig.smsProvider})
                        </span>
                        <span style={{ color: THEME.green, fontWeight: 800 }}>Balans: {systemConfig.smsBalance.toLocaleString()} SMS</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <select
                          value={systemConfig.smsProvider}
                          onChange={e => setSystemConfig({ ...systemConfig, smsProvider: e.target.value })}
                          style={selectFilterStyle}>
                          <option value="Eskiz.uz Official Gateway">Eskiz.uz Official Gateway</option>
                          <option value="PlayMobile Corporate SMS">PlayMobile Corporate SMS</option>
                        </select>
                        <button className="sa-btn" onClick={() => showToast('Test SMS muvaffaqiyatli yuborildi!')} style={secondaryBtnStyle}>
                          Test SMS
                        </button>
                      </div>
                    </div>

                    <div style={miniStatBoxStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Bot size={14} color={THEME.primary} /> Ota-onalar Telegram Boti (@IdrokEdu_Bot)
                        </span>
                        <span style={{ color: THEME.green, fontWeight: 700, fontSize: 11 }}>Webhook Faol</span>
                      </div>
                      <input
                        value={systemConfig.telegramBotToken}
                        onChange={e => setSystemConfig({ ...systemConfig, telegramBotToken: e.target.value })}
                        style={{ ...inputFieldStyle, marginTop: 8, fontFamily: 'monospace', fontSize: 12 }}
                      />
                    </div>

                    <div style={miniStatBoxStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Bell size={14} color={THEME.primary} /> Firebase Cloud Messaging (FCM Push)
                        </span>
                        <button
                          className="sa-btn"
                          onClick={() => setSystemConfig({ ...systemConfig, fcmActive: !systemConfig.fcmActive })}
                          style={{ padding: '5px 12px', borderRadius: 10, border: 'none', backgroundColor: systemConfig.fcmActive ? '#ECFDF5' : '#FFF1F2', color: systemConfig.fcmActive ? THEME.green : '#E11D48', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                          {systemConfig.fcmActive ? 'FCM Yoqilgan' : 'FCM O‘chiq'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sa-card" style={cardBoxStyle}>
                  <h3 style={sectionTitleStyle}>Mobil Ilova Versiyalari va Ish Rejimi</h3>
                  <p style={sectionSubStyle}>Majburiy yangilanish (Force Update) va texnik profilaktika rejimi</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div style={miniStatBoxStyle}>
                        <div style={{ fontSize: 11, color: THEME.textMuted }}>Android Min. Versiya</div>
                        <input
                          value={systemConfig.androidMinVersion}
                          onChange={e => setSystemConfig({ ...systemConfig, androidMinVersion: e.target.value })}
                          style={{ ...inputFieldStyle, marginTop: 6, fontWeight: 700 }}
                        />
                      </div>
                      <div style={miniStatBoxStyle}>
                        <div style={{ fontSize: 11, color: THEME.textMuted }}>iOS Min. Versiya</div>
                        <input
                          value={systemConfig.iosMinVersion}
                          onChange={e => setSystemConfig({ ...systemConfig, iosMinVersion: e.target.value })}
                          style={{ ...inputFieldStyle, marginTop: 6, fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div style={{ ...miniStatBoxStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Smartphone size={14} color={THEME.primary} /> Majburiy Yangilanish (Force Update)
                        </div>
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>Eski versiyadagi ilovalardan yangilashni talab qilish</div>
                      </div>
                      <button
                        className="sa-btn"
                        onClick={() => setSystemConfig({ ...systemConfig, forceUpdate: !systemConfig.forceUpdate })}
                        style={{ padding: '8px 14px', borderRadius: 12, border: 'none', backgroundColor: systemConfig.forceUpdate ? THEME.primary : '#CBD5E1', color: '#FFFFFF', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                        {systemConfig.forceUpdate ? 'Yoqilgan' : 'O‘chiq'}
                      </button>
                    </div>

                    <div style={{ ...miniStatBoxStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: systemConfig.maintenanceMode ? '#FFF5F6' : '#F9FAFE', border: systemConfig.maintenanceMode ? '1px solid #FECDD3' : '1px solid #E2E8F0', padding: '14px 18px', borderRadius: 18 }}>
                      <div style={{ flex: 1, marginRight: 14 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: systemConfig.maintenanceMode ? '#E11D48' : THEME.textDark, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Wrench size={16} color={systemConfig.maintenanceMode ? '#E11D48' : THEME.primary} /> Texnik Ishlar Rejimi (Maintenance)
                        </div>
                        <div style={{ fontSize: 11, color: systemConfig.maintenanceMode ? '#BE123C' : THEME.textMuted, marginTop: 3 }}>
                          {systemConfig.maintenanceMode 
                            ? `⚠️ PROFILAKTIKA FAOL • Dashbortlar, mobil ilovalar va qurilmalar qulflangan (${systemConfig.estimatedEndTime || '14:00'})`
                            : "Normal Ish Rejimi • Barcha maktablar, mobil ilovalar va qurilmalar faol ishlamoqda"}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="sa-btn"
                          type="button"
                          onClick={() => {
                            setMaintenanceForm({
                              is_maintenance_mode: Boolean(systemConfig.maintenanceMode),
                              maintenance_title: systemConfig.maintenanceTitle || "Tizimda profilaktika ishlari olib borilmoqda",
                              maintenance_message: systemConfig.maintenanceMessage || "Tizim serverlarida rejali modernizatsiya va texnik sozlash ishlari amalga oshirilmoqda. Tez orada barcha xizmatlar to'liq tiklanadi.",
                              estimated_end_time: systemConfig.estimatedEndTime || "14:00",
                              support_phone: systemConfig.supportPhone || "+998 71 200-00-00",
                            });
                            setMaintenanceModalOpen(true);
                          }}
                          style={{ padding: '8px 14px', borderRadius: 12, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: THEME.textDark, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Settings size={13} /> Sozlash
                        </button>
                        <button
                          className="sa-btn"
                          type="button"
                          onClick={handleQuickToggleMaintenance}
                          style={{ padding: '8px 14px', borderRadius: 12, border: 'none', backgroundColor: systemConfig.maintenanceMode ? '#E11D48' : '#10B981', color: '#FFFFFF', fontWeight: 800, fontSize: 12, cursor: 'pointer', boxShadow: systemConfig.maintenanceMode ? '0 4px 12px rgba(225, 29, 72, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                          {systemConfig.maintenanceMode ? 'O‘chirish' : 'Yoqish'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ marginBottom: 14 }}>
                  <h3 style={sectionTitleStyle}>Zaxira Nusxalash (PostgreSQL va S3 Media Ombori)</h3>
                  <p style={sectionSubStyle}>S3 Object Storage bandligi: <b>42.8 GB / 500 GB (8.5%)</b> • Avtomatik kunlik backup soat 04:00 da</p>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', minWidth: 650, borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted }}>
                        <th style={{ padding: '10px' }}>Snapshot ID</th>
                        <th style={{ padding: '10px' }}>Yaratilgan Vaqti</th>
                        <th style={{ padding: '10px' }}>Zaxira Turi</th>
                        <th style={{ padding: '10px' }}>Hajmi</th>
                        <th style={{ padding: '10px' }}>Holati</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Yuklab Olish</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map(b => (
                        <tr key={b.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                          <td style={{ padding: '10px', fontWeight: 700, fontFamily: 'monospace' }}>{b.id}</td>
                          <td style={{ padding: '10px' }}>{b.date}</td>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{b.type}</td>
                          <td style={{ padding: '10px', fontWeight: 700, color: THEME.primary }}>{b.size}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ padding: '3px 9px', borderRadius: 8, backgroundColor: '#ECFDF5', color: THEME.green, fontWeight: 700, fontSize: 11 }}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button
                              className="sa-btn"
                              onClick={() => {
                                const blob = new Blob([JSON.stringify({ backupId: b.id, timestamp: b.date, schools: schoolsList }, null, 2)], { type: 'application/json' });
                                const a = document.createElement('a');
                                a.href = URL.createObjectURL(blob);
                                a.setAttribute('download', `${b.id}_dump.json`);
                                a.click();
                                showToast(`${b.id} zaxira nusxasi yuklab olindi!`);
                              }}
                              style={{ ...secondaryBtnStyle, padding: '6px 12px', display: 'inline-flex' }}>
                              <Download size={13} /> Yuklab olish
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 7. TEXNIK YORDAM VA QO'LLAB-QUVVATLASH                        */}
          {/* ============================================================= */}
          {superTab === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div className="sa-card" style={cardBoxStyle}>
                <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={16} color={THEME.primary} /> Barcha Maktablar Paneliga Rasmiy Xabarnoma Chiqarish
                </h3>
                <p style={sectionSubStyle}>Bu yerga yozilgan e'lon barcha maktab direktorlarining ish stolida yuqori banner sifatida ko‘rinadi</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <input
                    placeholder="Masalan: Diqqat! 20-oktyabr kuni soat 23:00 da AI Face ID serverlari yangilanadi."
                    value={broadcastInput}
                    onChange={e => setBroadcastInput(e.target.value)}
                    style={{ ...inputFieldStyle, flex: 1, marginTop: 0 }}
                  />
                  <button
                    className="sa-btn"
                    onClick={() => {
                      if (onUpdateAnnouncement) onUpdateAnnouncement(broadcastInput.trim());
                      appendAuditLog('BROADCAST_ANNOUNCEMENT', 'Barcha Maktablar', broadcastInput.trim() || 'E\'lon tozalandi');
                      showToast(broadcastInput.trim() ? 'Rasmiy e\'lon barcha maktablar paneliga chiqarildi!' : 'Global e\'lon olib tashlandi.');
                    }}
                    style={primaryBtnStyle}>
                    <Send size={15} /> Barcha Maktablarga Chiqarish
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 22 }}>
                <div className="sa-card" style={cardBoxStyle}>
                  <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={16} color={THEME.primary} /> Maktab Direktorlaridan Kelgan Murojaatlar
                  </h3>
                  <p style={sectionSubStyle}>Texnik yordam so‘rovlari va ularga javob berish</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                    {tickets.map(t => (
                      <div key={t.id} style={{ padding: 16, borderRadius: 18, backgroundColor: '#F9FAFE', border: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: THEME.primary }}>{t.id} • {t.school}</span>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: 8,
                            fontSize: 10.5,
                            fontWeight: 700,
                            backgroundColor: t.status === 'OPEN' ? '#FFFBEB' : '#ECFDF5',
                            color: t.status === 'OPEN' ? '#D97706' : THEME.green,
                          }}>
                            {t.status === 'OPEN' ? 'OCHIQ MUROJAAT' : 'HAL QILINDI'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark }}>{t.subject}</div>
                        <div style={{ fontSize: 11.5, color: THEME.textMuted }}>Direktor: {t.director} • {t.createdAt}</div>

                        {t.reply && (
                          <div style={{ padding: 10, borderRadius: 12, backgroundColor: '#ECFDF5', color: '#065F46', fontSize: 12 }}>
                            <b>Javob:</b> {t.reply}
                          </div>
                        )}

                        {t.status === 'OPEN' && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <input
                              placeholder="Javob yozish va yopish..."
                              value={activeTicketReply[t.id] || ''}
                              onChange={e => setActiveTicketReply({ ...activeTicketReply, [t.id]: e.target.value })}
                              style={{ ...inputFieldStyle, flex: 1, padding: '8px 12px', marginTop: 0 }}
                            />
                            <button
                              className="sa-btn"
                              onClick={() => {
                                const replyText = (activeTicketReply[t.id] || 'Muammo texnik bo‘lim to‘monidan hal qilindi.').trim();
                                setTickets(tickets.map(item => item.id === t.id ? { ...item, status: 'RESOLVED', reply: replyText } : item));
                                appendAuditLog('RESOLVE_TICKET', t.id, replyText);
                                showToast(`${t.id} murojaati yopildi!`);
                              }}
                              style={{ ...primaryBtnStyle, padding: '8px 14px' }}>
                              Yopish <Check size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sa-card" style={cardBoxStyle}>
                  <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HelpCircle size={16} color={THEME.primary} /> Tez-tez Uchraydigan Savollar (FAQ)
                  </h3>
                  <p style={sectionSubStyle}>Maktab direktorlari va ustozlar uchun yo‘riqnomalar</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                    {faqs.map(f => (
                      <div key={f.id} style={{ padding: 15, borderRadius: 16, backgroundColor: '#F9FAFE', border: `1px solid ${THEME.border}` }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <HelpCircle size={14} color={THEME.primary} /> {f.q}
                        </div>
                        <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 6, lineHeight: 1.5 }}>{f.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================================================================= */}
      {/* MODALLAR                                                          */}
      {/* ================================================================= */}
      {showOnboardingWizard && (
        <OnboardingWizardModal
          onClose={() => setShowOnboardingWizard(false)}
          onSubmit={(createdSchool) => {
            const updated = [createdSchool, ...schoolsList];
            onUpdateSchools(updated);
            setSelectedSchoolId(createdSchool.id);
            setShowOnboardingWizard(false);
            appendAuditLog('ONBOARD_NEW_SCHOOL', createdSchool.name, `Yangi maktab qo'shildi (Login: ${createdSchool.username})`);
            showToast(`"${createdSchool.name}" muvaffaqiyatli qo'shildi!`);
          }}
        />
      )}

      {editingSchool && (
        <EditTenantModal
          school={editingSchool}
          onClose={() => setEditingSchool(null)}
          onSave={(updatedSchool) => {
            const updated = schoolsList.map(s => s.id === updatedSchool.id ? updatedSchool : s);
            onUpdateSchools(updated);
            setEditingSchool(null);
            appendAuditLog('UPDATE_SCHOOL', updatedSchool.name, 'Maktab rekvizitlari yangilandi');
            showToast(`"${updatedSchool.name}" ma'lumotlari saqlandi!`);
          }}
        />
      )}

      {warningModalSchool && (
        <div style={modalBackdropStyle}>
          <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)' }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} color="#D97706" /> "{warningModalSchool.name}" ga Ogohlantirish
            </h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
              Ushbu xabar maktab direktorining ichki kabinetida ogohlantirish banneri bo‘lib chiqadi.
            </p>
            <form onSubmit={handleSaveWarningBanner} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              <textarea
                rows={3}
                value={warningBannerInput}
                onChange={e => setWarningBannerInput(e.target.value)}
                style={{ ...inputFieldStyle, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setWarningModalSchool(null)} style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}>
                  Bekor qilish
                </button>
                <button type="submit" style={{ ...primaryBtnStyle, flex: 1.4, justifyContent: 'center' }}>
                  Bannerni O‘rnatish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Texnik Profilaktika (Maintenance) Modali */}
      {maintenanceModalOpen && (
        <div style={modalBackdropStyle}>
          <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, width: '100%', maxWidth: 520, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.22)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#0F172A' }}>
                <Wrench size={20} color="#EA580C" /> Texnik Ishlar Rejimi (Maintenance)
              </h3>
              <button 
                type="button" 
                onClick={() => setMaintenanceModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: THEME.textMuted }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Ushbu rejim yoqilganda Super Admindan tashqari barcha maktab boshqaruv dashbortlari, o'qituvchilar kabinetlari, mobil ilovalar va turniket qurilmalari qulflanadi va ushbu xabar ko'rsatiladi.
            </p>

            <form onSubmit={handleSaveMaintenanceConfig} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 16px', borderRadius: 16, backgroundColor: maintenanceForm.is_maintenance_mode ? '#FFF1F2' : '#F0FDF4', border: maintenanceForm.is_maintenance_mode ? '1px solid #FECDD3' : '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: maintenanceForm.is_maintenance_mode ? '#E11D48' : '#15803D' }}>
                    {maintenanceForm.is_maintenance_mode ? "Profilaktika Rejimi Yoqilgan" : "Normal Rejim (Tizim Ochiq)"}
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                    {maintenanceForm.is_maintenance_mode ? "Tashqi mijozlar to'liq bloklangan" : "Barcha tizimlar odatdagidek ishlamoqda"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceForm({ ...maintenanceForm, is_maintenance_mode: !maintenanceForm.is_maintenance_mode })}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: maintenanceForm.is_maintenance_mode ? '#E11D48' : '#10B981',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  {maintenanceForm.is_maintenance_mode ? "O'CHIRISH" : "YOQISH"}
                </button>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Ogohlantirish Sarlavhasi</label>
                <input
                  required
                  value={maintenanceForm.maintenance_title}
                  onChange={e => setMaintenanceForm({ ...maintenanceForm, maintenance_title: e.target.value })}
                  style={{ ...inputFieldStyle, marginTop: 6 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Foydalanuvchilarga Ko'rsatiladigan Xabar</label>
                <textarea
                  rows={3}
                  required
                  value={maintenanceForm.maintenance_message}
                  onChange={e => setMaintenanceForm({ ...maintenanceForm, maintenance_message: e.target.value })}
                  style={{ ...inputFieldStyle, resize: 'vertical', marginTop: 6 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Taxminiy Tugash Vaqti</label>
                  <input
                    placeholder="Masalan: 14:00 yoki 18:30"
                    value={maintenanceForm.estimated_end_time}
                    onChange={e => setMaintenanceForm({ ...maintenanceForm, estimated_end_time: e.target.value })}
                    style={{ ...inputFieldStyle, marginTop: 6 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Aloqa / Yordam Telefoni</label>
                  <input
                    value={maintenanceForm.support_phone}
                    onChange={e => setMaintenanceForm({ ...maintenanceForm, support_phone: e.target.value })}
                    style={{ ...inputFieldStyle, marginTop: 6 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setMaintenanceModalOpen(false)} style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}>
                  Bekor qilish
                </button>
                <button type="submit" style={{ ...primaryBtnStyle, flex: 1.4, justifyContent: 'center' }}>
                  Saqlash va Tatbiq Qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maktabni Vaqtincha To'xtatish (Pauza / Qarzdorlik) Modali */}
      {schoolSuspendModalSchool && (
        <div style={modalBackdropStyle}>
          <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, width: '100%', maxWidth: 480, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.22)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#0F172A' }}>
                <Pause size={18} color="#D97706" /> "{schoolSuspendModalSchool.name}" ni To‘xtatish
              </h3>
              <button 
                type="button" 
                onClick={() => setSchoolSuspendModalSchool(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: THEME.textMuted }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Maktab xizmatlari vaqtincha to‘xtatilganda: maktab direktoriga aniq sabab va qarzdorlik ma'lumoti chiqadi. O‘quvchi va ota-onalar mobil ilovalarida esa faqat neytral "Xizmatlar vaqtincha to‘xtatilgan" xabari ko‘rinadi.
            </p>

            <form onSubmit={handleConfirmSuspendSchool} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>To‘xtatish Sababi Turi</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSuspendForm({
                        ...suspendForm,
                        reason_type: 'DEBT',
                        status_reason: "Oylik obuna to'lovi to'lanmaganligi sababli xizmatlar vaqtincha to'xtatildi",
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 12,
                      border: suspendForm.reason_type === 'DEBT' ? '2px solid #E11D48' : '1px solid #E2E8F0',
                      backgroundColor: suspendForm.reason_type === 'DEBT' ? '#FFF1F2' : '#FFFFFF',
                      color: suspendForm.reason_type === 'DEBT' ? '#E11D48' : THEME.textDark,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Qarzdorlik
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSuspendForm({
                        ...suspendForm,
                        reason_type: 'MAINTENANCE',
                        status_reason: "Rejali profilaktika va texnik sozlash ishlari sababli vaqtincha to'xtatildi",
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 12,
                      border: suspendForm.reason_type === 'MAINTENANCE' ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                      backgroundColor: suspendForm.reason_type === 'MAINTENANCE' ? '#FFFBEB' : '#FFFFFF',
                      color: suspendForm.reason_type === 'MAINTENANCE' ? '#B45309' : THEME.textDark,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Profilaktika / Pauza
                  </button>
                </div>
              </div>

              {suspendForm.reason_type === 'DEBT' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Qarzdorlik Summasi</label>
                  <input
                    required
                    value={suspendForm.debt_amount}
                    onChange={e => setSuspendForm({ ...suspendForm, debt_amount: e.target.value })}
                    style={{ ...inputFieldStyle, marginTop: 6, fontWeight: 800, color: '#E11D48' }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Direktor Dashbordida Ko‘rinadigan Aniq Xabar</label>
                <textarea
                  rows={3}
                  required
                  value={suspendForm.status_reason}
                  onChange={e => setSuspendForm({ ...suspendForm, status_reason: e.target.value })}
                  style={{ ...inputFieldStyle, resize: 'vertical', marginTop: 6 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setSchoolSuspendModalSchool(null)} style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}>
                  Bekor qilish
                </button>
                <button type="submit" style={{ ...primaryBtnStyle, backgroundColor: '#E11D48', background: '#E11D48', flex: 1.4, justifyContent: 'center' }}>
                  Maktabni To‘xtatish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewInvoiceModal && (
        <NewInvoiceModal
          schoolsList={schoolsList}
          onClose={() => setShowNewInvoiceModal(false)}
          onCreate={(inv) => {
            setInvoices([inv, ...invoices]);
            setShowNewInvoiceModal(false);
            appendAuditLog('CREATE_INVOICE', inv.schoolName, `${inv.id} (${inv.amount}) hisob-fakturasi yaratildi`);
            showToast(`${inv.id} fakturasi yaratildi!`);
          }}
        />
      )}

      {showTierModal && editingTier && (
        <TariffPlanModal
          tier={editingTier}
          onClose={() => {
            setShowTierModal(false);
            setEditingTier(null);
          }}
          onSave={handleSaveTier}
        />
      )}
    </div>
  );
}

// =========================================================================
// 4-QADAMLI ONBOARDING WIZARD MODALI
// =========================================================================
function OnboardingWizardModal({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    district: 'Toshkent sh., Yunusobod tumani',
    address: '',
    inn: '309' + Math.floor(100000 + Math.random() * 900000),
    plan: 'Standart',
    capacity: 800,
    roomsLimit: 45,
    storageGb: 100,
    director: '',
    phone: '+998 90 ',
    username: '',
    password: 'school123',
    faceIdEnabled: true,
    qrAttendanceEnabled: true,
    telegramBotEnabled: true,
  });

  const handleFinish = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.director.trim() || !form.username.trim()) {
      alert("Iltimos, maktab nomi, direktor F.I.Sh. va loginini kiriting!");
      return;
    }
    onSubmit({
      id: Date.now(),
      name: form.name.trim(),
      district: form.district.trim(),
      address: form.address.trim(),
      inn: form.inn.trim(),
      plan: form.plan,
      capacity: Number(form.capacity) || 800,
      roomsLimit: Number(form.roomsLimit) || 40,
      storageGb: Number(form.storageGb) || 100,
      director: form.director.trim(),
      phone: form.phone.trim(),
      username: form.username.trim(),
      password: form.password.trim() || 'school123',
      studentsCount: 0,
      teachersCount: 12,
      attendanceRate: 100,
      paymentStatus: 'PAID',
      turnstileStatus: 'ONLINE',
      status: 'ACTIVE',
      features: {
        faceId: form.faceIdEnabled,
        dynamicQr: form.qrAttendanceEnabled,
        telegramBot: form.telegramBotEnabled,
      },
    });
  };

  return (
    <div style={modalBackdropStyle}>
      <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, width: '100%', maxWidth: 520, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: THEME.textDark }}>Yangi Maktab Qo‘shish</div>
            <div style={{ fontSize: 12, color: THEME.textMuted }}>Qadam {step} / 4</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', borderRadius: 12, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} color={THEME.textMuted} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 20 }}>
          {['1. Rekvizitlar', '2. Limitlar', '3. Direktor', '4. Modullar'].map((label, idx) => {
            const active = step >= idx + 1;
            return (
              <div key={idx} style={{ padding: '7px 8px', borderRadius: 11, textAlign: 'center', fontSize: 11, fontWeight: 700, backgroundColor: active ? THEME.primary : '#F1F5F9', color: active ? '#FFFFFF' : THEME.textMuted, transition: 'all 0.25s ease' }}>
                {label}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleFinish} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {step === 1 && (
            <>
              <div>
                <label style={labelStyle}>Maktab Nomi *</label>
                <input required placeholder="Masalan: 15-sonli IT va Aniq Fanlar Litseyi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputFieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Viloyat va Tuman *</label>
                <input required placeholder="Toshkent sh., Shayxontohur tumani" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} style={inputFieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Yuridik Manzil</label>
                <input placeholder="Navoiy shoh ko‘chasi, 42-uy" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputFieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>INN / Litsenziya Raqami *</label>
                <input required value={form.inn} onChange={e => setForm({ ...form, inn: e.target.value })} style={inputFieldStyle} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label style={labelStyle}>Tarif Rejasi</label>
                <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} style={{ ...inputFieldStyle, backgroundColor: '#FFF' }}>
                  <option value="Boshlang‘ich">Boshlang‘ich</option>
                  <option value="Standart">Standart</option>
                  <option value="Litsenziyali Pro">Litsenziyali Pro</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Maks. O‘quvchilar</label>
                  <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} style={inputFieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Maks. Xonalar</label>
                  <input type="number" value={form.roomsLimit} onChange={e => setForm({ ...form, roomsLimit: e.target.value })} style={inputFieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Xotira (GB)</label>
                  <input type="number" value={form.storageGb} onChange={e => setForm({ ...form, storageGb: e.target.value })} style={inputFieldStyle} />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label style={labelStyle}>Direktor F.I.Sh. *</label>
                <input required placeholder="Salimov Anvar" value={form.director} onChange={e => setForm({ ...form, director: e.target.value })} style={inputFieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Telefon Raqami *</label>
                <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputFieldStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Direktor Logini *</label>
                  <input required placeholder="maktab15" value={form.username} onChange={e => setForm({ ...form, username: e.target.value.trim() })} style={inputFieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Maxfiy Paroli *</label>
                  <input required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputFieldStyle} />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'faceIdEnabled', icon: <ScanFace size={16} color={THEME.primary} />, title: 'Face ID Biometrik Kirish va Turniket', desc: '3x4 rasm orqali yuzni solishtirish va turniket integratsiyasi' },
                { key: 'qrAttendanceEnabled', icon: <QrCode size={16} color={THEME.cyan} />, title: '25-soniyalik Dinamik QR Davomat', desc: 'Soxtalashtirishga qarshi har 25 soniyada yangilanuvchi QR kod' },
                { key: 'telegramBotEnabled', icon: <Bot size={16} color="#0EA5E9" />, title: 'Ota-onalar Telegram Bildirishnomasi', desc: 'O‘quvchi maktabga kirganda ota-onaga avtomatik xabar yuborish' },
              ].map(mod => (
                <div
                  key={mod.key}
                  onClick={() => setForm({ ...form, [mod.key]: !form[mod.key] })}
                  style={{ padding: 14, borderRadius: 16, border: `1px solid ${form[mod.key] ? THEME.primary : THEME.border}`, backgroundColor: form[mod.key] ? THEME.primaryLight : '#F8FAFC', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ marginTop: 2 }}>{mod.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{mod.title}</div>
                      <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 2 }}>{mod.desc}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: form[mod.key] ? THEME.primary : THEME.textMuted, fontSize: 11 }}>
                    {form[mod.key] ? 'YOQILGAN' : 'O‘CHIQ'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 12 }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}>
                Orqaga
              </button>
            ) : (
              <button type="button" onClick={onClose} style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}>
                Bekor qilish
              </button>
            )}

            {step < 4 ? (
              <button type="button" onClick={() => setStep(step + 1)} style={{ ...primaryBtnStyle, flex: 1.5, justifyContent: 'center' }}>
                Keyingi Qadam ({step + 1}/4) <ChevronRight size={14} />
              </button>
            ) : (
              <button type="submit" style={{ ...primaryBtnStyle, flex: 1.5, justifyContent: 'center' }}>
                <CheckCircle2 size={16} /> Maktabni Ishga Tushirish
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function EditTenantModal({ school, onClose, onSave }) {
  const [form, setForm] = useState({ ...school });
  return (
    <div style={modalBackdropStyle}>
      <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 30, width: '100%', maxWidth: 480, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Maktab Rekvizitlarini Tahrirlash</h3>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <div>
            <label style={labelStyle}>Maktab Nomi</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputFieldStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Hudud / Tuman</label>
              <input required value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} style={inputFieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>INN / Kod</label>
              <input value={form.inn || '309481023'} onChange={e => setForm({ ...form, inn: e.target.value })} style={inputFieldStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Direktor F.I.Sh.</label>
              <input required value={form.director} onChange={e => setForm({ ...form, director: e.target.value })} style={inputFieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputFieldStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Login</label>
              <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value.trim() })} style={inputFieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Parol</label>
              <input required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputFieldStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}>Bekor qilish</button>
            <button type="submit" style={{ ...primaryBtnStyle, flex: 1.4, justifyContent: 'center' }}>Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewInvoiceModal({ schoolsList, onClose, onCreate }) {
  const [schoolName, setSchoolName] = useState(schoolsList[0]?.name || '');
  const [plan, setPlan] = useState('Standart');
  const [amount, setAmount] = useState('2 500 000 so‘m');
  const [method, setMethod] = useState('Payme Business');

  return (
    <div style={modalBackdropStyle}>
      <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={18} color={THEME.primary} /> Yangi Hisob-Faktura Yaratish
        </h3>
        <form
          onSubmit={e => {
            e.preventDefault();
            onCreate({
              id: 'INV-2026-' + Math.floor(110 + Math.random() * 890),
              schoolName,
              plan,
              amount,
              method,
              date: '2026-10-17',
              dueDate: '2026-11-17',
              status: 'PENDING',
            });
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Maktabni tanlang</label>
            <select value={schoolName} onChange={e => setSchoolName(e.target.value)} style={{ ...inputFieldStyle, backgroundColor: '#FFF' }}>
              {schoolsList.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tarif</label>
            <select value={plan} onChange={e => setPlan(e.target.value)} style={{ ...inputFieldStyle, backgroundColor: '#FFF' }}>
              <option value="Boshlang‘ich">Boshlang‘ich</option>
              <option value="Standart">Standart</option>
              <option value="Litsenziyali Pro">Litsenziyali Pro</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>To‘lov Summasi</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} style={inputFieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>To‘lov Tizimi</label>
            <select value={method} onChange={e => setMethod(e.target.value)} style={{ ...inputFieldStyle, backgroundColor: '#FFF' }}>
              <option value="Payme Business">Payme Business</option>
              <option value="Click Corporate">Click Corporate</option>
              <option value="Uzum Business">Uzum Business</option>
              <option value="Bank Hisob-raqami">Bank Hisob-raqami</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}>Bekor qilish</button>
            <button type="submit" style={{ ...primaryBtnStyle, flex: 1.4, justifyContent: 'center' }}>Fakturani Yuborish</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TariffPlanModal({ tier, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    id: tier.id || 'tier_' + Date.now(),
    name: tier.name || '',
    pricePerMonth: tier.pricePerMonth || '',
    perStudent: tier.perStudent || '',
    maxStudents: tier.maxStudents || 1000,
    maxRooms: tier.maxRooms || 50,
    storageGb: tier.storageGb || 100,
    color: tier.color || '#6C5CE7',
    popular: Boolean(tier.popular),
    features: Array.isArray(tier.features) ? [...tier.features] : [],
    modules: {
      face_id: false,
      dynamic_qr: true,
      telegram_bot: false,
      turnstile_api: false,
      anti_spoofing: false,
      sms_alerts: false,
      journal_matrix: true,
      gps_geofence: true,
      vip_support: false,
      ...(tier.modules || {}),
    },
  }));

  const [newFeatureText, setNewFeatureText] = useState('');

  const PRESET_COLORS = [
    { label: 'Binafsha', color: '#6C5CE7' },
    { label: 'Moviy', color: '#0EA5E9' },
    { label: 'Yashil', color: '#10B981' },
    { label: 'To‘q sariq', color: '#F59E0B' },
    { label: 'Pushti', color: '#EC4899' },
    { label: 'Qizil', color: '#EF4444' },
    { label: 'Indigo', color: '#4F46E5' },
    { label: 'Zumrad', color: '#059669' },
  ];

  const MODULE_DEFINITIONS = [
    {
      key: 'face_id',
      icon: <ScanFace size={18} color={THEME.primary} />,
      title: 'Face ID Biometrik Identifikatsiya',
      desc: '3x4 fotosurat orqali yuzni tanish va eshik/turniketlarda avtomatik ochish',
      badge: 'AI Vision v2.4',
    },
    {
      key: 'dynamic_qr',
      icon: <QrCode size={18} color={THEME.cyan} />,
      title: '25-soniyalik Dinamik QR Kod Davomat',
      desc: 'Har 25 soniyada yangilanuvchi xavfsiz QR orqali darsga kirishni qayd etish',
      badge: 'Anti-Clone',
    },
    {
      key: 'telegram_bot',
      icon: <Bot size={18} color="#0EA5E9" />,
      title: 'Ota-onalar Avtomat Telegram Boti',
      desc: 'Farzandi maktabga kirgani va chiqqani haqida oniy xabarnoma yuborish',
      badge: 'Telegram API',
    },
    {
      key: 'turnstile_api',
      icon: <DoorOpen size={18} color={THEME.orange} />,
      title: 'Turniket va Darvoza Apparat Integratsiyasi',
      desc: 'Hikvision, Dahua va ZKTeco kontrollerlari bilan to‘g‘ridan-to‘g‘ri apparat aloqasi',
      badge: 'Hardware SDK',
    },
    {
      key: 'anti_spoofing',
      icon: <ShieldCheck size={18} color="#10B981" />,
      title: 'Anti-Spoofing (Liveness Detection)',
      desc: 'Yuz o‘rniga telefon ekrani yoki qog‘oz rasm tutilganda darhol soxtalashtirishni aniqlash',
      badge: 'Security v3',
    },
    {
      key: 'sms_alerts',
      icon: <Send size={18} color={THEME.primary} />,
      title: 'SMS Xabarnomalar (Eskiz.uz)',
      desc: 'Telegrami yo‘q ota-onalar yoki favqulodda e’lonlar uchun to‘g‘ridan-to‘g‘ri SMS shlyuzi',
      badge: 'SMS Gateway',
    },
    {
      key: 'journal_matrix',
      icon: <FileSpreadsheet size={18} color="#10B981" />,
      title: 'Elektron Jurnal va Dars Matritsasi',
      desc: 'Kundalik baholash, choraklik hisobotlar va dars jadvali matritsasini to‘liq yuritish',
      badge: 'Jurnal Core',
    },
    {
      key: 'gps_geofence',
      icon: <MapPin size={18} color="#EF4444" />,
      title: 'GPS Geofence (Xaritadagi Metka)',
      desc: 'O‘qituvchi va xodimlar faqat belgilangan radius ichida davomat qila olishi',
      badge: 'Geolocation',
    },
    {
      key: 'vip_support',
      icon: <Zap size={18} color="#F59E0B" />,
      title: '24/7 Shaxsiy VIP SLA Texnik Yordam',
      desc: 'Alohida ajratilgan server quvvati, kunlik avtomatik backup va shaxsiy muhandis',
      badge: 'VIP SLA',
    },
  ];

  const handleToggleModule = (key) => {
    setForm(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [key]: !prev.modules[key],
      },
    }));
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    const txt = newFeatureText.trim();
    if (!txt) return;
    if (form.features.includes(txt)) {
      setNewFeatureText('');
      return;
    }
    setForm(prev => ({
      ...prev,
      features: [...prev.features, txt],
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const activeModulesCount = Object.values(form.modules).filter(Boolean).length;

  return (
    <div style={modalBackdropStyle}>
      <div
        className="sa-modal-box"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 28,
          width: '100%',
          maxWidth: 740,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
        }}>
        {/* Modal Sarlavhasi */}
        <div style={{
          padding: '20px 26px',
          borderBottom: `1px solid ${THEME.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FCFBFF',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: form.color || THEME.primary,
                boxShadow: `0 0 10px ${form.color || THEME.primary}`,
              }} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={18} color={form.color || THEME.primary} /> {form.name ? `"${form.name}" Tarifini To‘liq Sozlash` : 'Yangi Tarif Rejasi'}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: THEME.textMuted }}>
              Narxlar, texnik limitlar va maktablarga beriladigan modullarni boshqaring ({activeModulesCount}/9 modul faol)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: '#F1F5F9',
              borderRadius: 12,
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: THEME.textMuted,
            }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) {
              alert("Iltimos, tarif nomini kiriting!");
              return;
            }
            onSave(form);
          }}
          style={{
            padding: '22px 26px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}>
          {/* 1. Asosiy identifikatsiya va vizual dizayn */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.textDark, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              1. Tarif Nomi va Brend Rangi
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Tarif Rejasi Nomi *</label>
                <input
                  required
                  placeholder="Masalan: Standart, Litsenziyali Pro, VIP Maktab"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputFieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Ommaboplik Belgisi</label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 6,
                  padding: '9px 12px',
                  borderRadius: 12,
                  backgroundColor: form.popular ? THEME.primaryLight : '#F8FAFC',
                  border: `1px solid ${form.popular ? THEME.primary : THEME.border}`,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  color: form.popular ? THEME.primary : THEME.textDark,
                }}>
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={e => setForm({ ...form, popular: e.target.checked })}
                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                  />
                  <Star size={13} fill="#F59E0B" color="#F59E0B" /> Eng Ommabop
                </label>
              </div>
            </div>

            {/* Ranglar palitrasi */}
            <div>
              <label style={labelStyle}>Tarif Kartasi Rangi</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(p => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setForm({ ...form, color: p.color })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      borderRadius: 10,
                      border: form.color === p.color ? `2px solid ${p.color}` : `1px solid ${THEME.border}`,
                      backgroundColor: form.color === p.color ? `${p.color}15` : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: THEME.textDark,
                    }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: p.color }} />
                    {p.label}
                  </button>
                ))}
                <input
                  type="color"
                  value={form.color || '#6C5CE7'}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  style={{ width: 34, height: 32, borderRadius: 8, border: `1px solid ${THEME.border}`, cursor: 'pointer', padding: 2 }}
                  title="Boshqa rang tanlash"
                />
              </div>
            </div>
          </div>

          {/* 2. Narxlar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.textDark, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              2. Narxlar va To‘lov Modeli
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Oylik Obuna To‘lovi *</label>
                <input
                  required
                  placeholder="2 500 000 so‘m / oy"
                  value={form.pricePerMonth}
                  onChange={e => setForm({ ...form, pricePerMonth: e.target.value })}
                  style={inputFieldStyle}
                />
                <span style={{ fontSize: 11, color: THEME.textMuted }}>Katta shriftda asosiy oylik to‘lov bo‘lib ko‘rinadi</span>
              </div>
              <div>
                <label style={labelStyle}>Har Bir O‘quvchi Uchun Narx *</label>
                <input
                  required
                  placeholder="5 000 so‘m / o‘quvchi"
                  value={form.perStudent}
                  onChange={e => setForm({ ...form, perStudent: e.target.value })}
                  style={inputFieldStyle}
                />
                <span style={{ fontSize: 11, color: THEME.textMuted }}>O‘quvchilar soniga nisbatan tarif qiymati</span>
              </div>
            </div>
          </div>

          {/* 3. Tizim Cheklovlari (Kvotalar) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.textDark, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              3. Tizim Cheklovlari (Kvotalar)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Maks. O‘quvchilar Soni</label>
                <input
                  type="number"
                  min="50"
                  max="50000"
                  value={form.maxStudents}
                  onChange={e => setForm({ ...form, maxStudents: Number(e.target.value) || 0 })}
                  style={inputFieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Xonalar Sig‘imi (Sinf/Xona)</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  value={form.maxRooms}
                  onChange={e => setForm({ ...form, maxRooms: Number(e.target.value) || 0 })}
                  style={inputFieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Cloud S3 Xotira (GB)</label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={form.storageGb}
                  onChange={e => setForm({ ...form, storageGb: Number(e.target.value) || 0 })}
                  style={inputFieldStyle}
                />
              </div>
            </div>
          </div>

          {/* 4. Tizim Modullari va Ruxsatlar (NIMALARNI QILA OLISHI) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.textDark, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  4. Ruxsat Berilgan Modullar (Nimalarni qila olishi)
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: 11.5, color: THEME.textMuted }}>
                  Ushbu tarifdagi maktablar quyidagi modullardan foydalanishi mumkin bo‘ladi:
                </p>
              </div>
              <span style={{ padding: '3px 9px', borderRadius: 10, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 800, fontSize: 11 }}>
                {activeModulesCount} / {MODULE_DEFINITIONS.length} Faol
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {MODULE_DEFINITIONS.map(mod => {
                const isEnabled = Boolean(form.modules[mod.key]);
                return (
                  <div
                    key={mod.key}
                    onClick={() => handleToggleModule(mod.key)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 16,
                      border: `1.5px solid ${isEnabled ? form.color || THEME.primary : THEME.border}`,
                      backgroundColor: isEnabled ? `${form.color || THEME.primary}0D` : '#FAFAFA',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{mod.icon}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 12.5, color: THEME.textDark }}>
                            {mod.title}
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textMuted }}>
                            {mod.badge}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 8,
                        fontSize: 10.5,
                        fontWeight: 800,
                        backgroundColor: isEnabled ? (form.color || THEME.primary) : '#E2E8F0',
                        color: isEnabled ? '#FFFFFF' : '#64748B',
                        flexShrink: 0,
                      }}>
                        {isEnabled ? 'YOQILGAN' : 'O‘CHIQ'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.35 }}>
                      {mod.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Mijozga Ko'rsatiladigan Imkoniyatlar (Bullet points) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.textDark, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              5. Tarif Xususiyatlari (Ro‘yxatdagi bandlar)
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {form.features.map((feat, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 12,
                    backgroundColor: '#F1F5F9',
                    fontSize: 12,
                    fontWeight: 600,
                    color: THEME.textDark,
                  }}>
                  <Check size={13} color={THEME.green} />
                  {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: 0,
                      marginLeft: 2,
                    }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Yangi xususiyat matnini yozing..."
                value={newFeatureText}
                onChange={e => setNewFeatureText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature(e);
                  }
                }}
                style={{ ...inputFieldStyle, flex: 1, marginTop: 0 }}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                style={{ ...secondaryBtnStyle, padding: '9px 16px', fontWeight: 700 }}>
                + Qo‘shish
              </button>
            </div>
          </div>

          {/* Modal Tugmalari */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 6,
            paddingTop: 16,
            borderTop: `1px solid ${THEME.border}`,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...secondaryBtnStyle, padding: '11px 20px', justifyContent: 'center' }}>
              Bekor qilish
            </button>
            <button
              type="submit"
              style={{
                ...primaryBtnStyle,
                padding: '11px 26px',
                justifyContent: 'center',
                background: form.color ? `linear-gradient(135deg, ${form.color} 0%, #4338CA 100%)` : THEME.gradient,
              }}>
              <CheckCircle2 size={16} /> Tarif Rejasini Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SidebarNavBtn({ active, onClick, icon, label, badge }) {
  return (
    <button
      className="sa-nav-btn"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 14px',
        borderRadius: 15,
        border: 'none',
        background: active ? THEME.gradient : 'transparent',
        color: active ? '#FFFFFF' : THEME.textDark,
        fontWeight: active ? 700 : 600,
        fontSize: 13,
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: active ? '0 8px 20px -4px rgba(108, 92, 231, 0.32)' : 'none',
      }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon} {label}
      </span>
      {badge && (
        <span style={{
          padding: '2px 8px',
          borderRadius: 9,
          backgroundColor: active ? 'rgba(255, 255, 255, 0.22)' : '#F1F4FA',
          color: active ? '#FFFFFF' : THEME.textMuted,
          fontSize: 10.5,
          fontWeight: 700,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MetricCard({ icon, title, value, sub, color, badge }) {
  return (
    <div
      className="sa-metric-card"
      style={{
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 24,
        border: `1px solid ${THEME.border}`,
        boxShadow: THEME.softShadow,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && (
            <div style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </div>
          )}
          <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700 }}>{title}</span>
        </div>
        {badge && (
          <span style={{ padding: '3px 9px', borderRadius: 8, backgroundColor: THEME.primaryLight, color: THEME.primary, fontSize: 10, fontWeight: 700 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.3px' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: THEME.textMuted }}>{sub}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: { label: 'Faol', bg: '#ECFDF5', color: '#10B981' },
    TRIAL: { label: 'Sinov muddati', bg: '#EFF6FF', color: '#2563EB' },
    SUSPENDED: { label: 'To‘xtatilgan', bg: '#FFFBEB', color: '#D97706' },
    ARCHIVED: { label: 'Arxivlangan', bg: '#F1F5F9', color: '#64748B' },
    BLOCKED: { label: 'Bloklangan', bg: '#FFF1F2', color: '#E11D48' },
  };
  const st = map[status] || map.ACTIVE;
  return (
    <span style={{ padding: '4px 10px', borderRadius: 10, backgroundColor: st.bg, color: st.color, fontWeight: 700, fontSize: 11 }}>
      {st.label}
    </span>
  );
}

const cardBoxStyle = {
  backgroundColor: '#FFFFFF',
  padding: 24,
  borderRadius: 26,
  border: `1px solid ${THEME.border}`,
  boxShadow: THEME.softShadow,
};

const miniStatBoxStyle = {
  padding: 14,
  borderRadius: 18,
  backgroundColor: '#F9FAFE',
  border: `1px solid ${THEME.border}`,
};

const sectionTitleStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: THEME.textDark,
  margin: 0,
  letterSpacing: '-0.2px',
};

const sectionSubStyle = {
  fontSize: 12,
  color: THEME.textMuted,
  marginTop: 4,
  marginBottom: 0,
};

const pillBadgeStyle = {
  padding: '4px 10px',
  borderRadius: 10,
  backgroundColor: THEME.primaryLight,
  color: THEME.primary,
  fontWeight: 700,
  fontSize: 11,
};

const tierBadgeStyle = {
  padding: '3px 8px',
  borderRadius: 8,
  backgroundColor: '#FFFFFF',
  color: THEME.textDark,
  border: `1px solid ${THEME.border}`,
  fontWeight: 700,
  fontSize: 10.5,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
};

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 18px',
  background: THEME.gradient,
  color: '#FFFFFF',
  borderRadius: 15,
  border: 'none',
  fontWeight: 700,
  fontSize: 12.5,
  cursor: 'pointer',
  boxShadow: '0 8px 18px -4px rgba(108, 92, 231, 0.32)',
};

const secondaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 15px',
  backgroundColor: '#FFFFFF',
  color: THEME.textDark,
  borderRadius: 15,
  border: `1px solid ${THEME.border}`,
  fontWeight: 700,
  fontSize: 12.5,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
};

const selectFilterStyle = {
  padding: '9px 12px',
  borderRadius: 13,
  border: `1px solid ${THEME.border}`,
  backgroundColor: '#FFFFFF',
  fontSize: 12.5,
  fontWeight: 600,
  color: THEME.textDark,
  outline: 'none',
};

const inputFieldStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 14,
  border: '1px solid #E2E8F0',
  fontSize: 13,
  boxSizing: 'border-box',
  outline: 'none',
  marginTop: 4,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: THEME.textDark,
};

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.45)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
};
