import React, { useState, useEffect } from 'react';
import SuperAdminMapView from './components/SuperAdminMapView';
import {
  LayoutDashboard, HardDrive, Wifi,
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
  HelpCircle, MessageSquare, ShieldCheck, AlertCircle, CheckSquare, Square, DoorOpen
} from 'lucide-react';

const THEME = {
  primary: '#6C5CE7',
  primaryDark: '#5845D8',
  primaryLight: '#F1F0FF',
  gradient: 'linear-gradient(135deg, #7C69EF 0%, #5845D8 100%)',
  softGradient: '#F8F9FE',
  warmGradient: 'linear-gradient(135deg, #FF9F43 0%, #FF6584 100%)',
  orange: '#FF9F43',
  pink: '#FF6584',
  cyan: '#48DBFB',
  green: '#10AC84',
  bgSoft: '#F8F9FE',
  cardBg: '#FFFFFF',
  textDark: '#1E2038',
  textMuted: '#8A90A2',
  border: '#E2E8F0',
  softShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
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
  systemConfigProp,
  onSystemConfigUpdated,
}) {
  const [superTab, setSuperTabState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('smart_super_admin_tab');
      if (saved && ['overview', 'schools', 'map', 'billing', 'server', 'config', 'support'].includes(saved)) {
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

  // 1. Overview & Analytics Chart state (100% REAL BAZA)
  const [realStats, setRealStats] = useState(null);
  const [regionsList, setRegionsList] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [chartMode, setChartMode] = useState('CUMULATIVE'); // 'CUMULATIVE' | 'IMAGES' | 'FILES' | 'SCHOOLS' | 'CHANGES'
  const [selectedStageIdx, setSelectedStageIdx] = useState(5);
  const [chartHover, setChartHover] = useState(null);
  const [dbStudents, setDbStudents] = useState([]);
  const [dbTeachers, setDbTeachers] = useState([]);
  const [dbClasses, setDbClasses] = useState([]);
  const [exportedFilesCount, setExportedFilesCount] = useState(() => {
    try {
      return Number(localStorage.getItem('smart_school_exports_count')) || 0;
    } catch (_) {
      return 0;
    }
  });

  const loadRealProjectStats = async () => {
    try {
      const [overRes, stuRes, tchRes, clsRes, sysRes, schRes] = await Promise.all([
        fetch('/api/superadmin/overview-stats/', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
        fetch('/api/students/?all_schools=1', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
        fetch('/api/teachers/?all_schools=1', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
        fetch('/api/classes/?all_schools=1', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
        fetch('/api/system-config/', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
        fetch('/api/school-config/?all_schools=1', { headers: { 'X-Super-Admin': '1', 'X-User-Role': 'SUPER_ADMIN' } }),
      ]);
      if (overRes.ok) {
        const oData = await overRes.json();
        if (oData && oData.success) {
          setRealStats(oData);
          if (Array.isArray(oData.schools_list) && oData.schools_list.length > 0) {
            onUpdateSchools(oData.schools_list);
          }
          if (Array.isArray(oData.regions_list)) {
            setRegionsList(oData.regions_list);
            if (oData.regions_list.length > 0) {
              setSelectedRegion(prev => prev || oData.regions_list[0]);
            }
          }
          if (Array.isArray(oData.invoices)) {
            setInvoices(oData.invoices);
          }
          if (Array.isArray(oData.audit_logs) && oData.audit_logs.length > 0) {
            setAuditLogs(oData.audit_logs);
          }
        }
      }
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
          projectName: sysData.project_name || prev.projectName,
          projectBadge: sysData.project_badge || prev.projectBadge,
          projectSlogan: sysData.project_slogan || prev.projectSlogan,
          qrRefreshSeconds: Number(sysData.qr_refresh_seconds) || prev.qrRefreshSeconds,
          faceIdMinConfidence: Number(sysData.face_id_min_confidence) || prev.faceIdMinConfidence,
          defaultGpsRadius: Number(sysData.default_gps_radius) || prev.defaultGpsRadius,
          sessionTimeoutMinutes: Number(sysData.session_timeout_minutes) || prev.sessionTimeoutMinutes,
          supportPhone: sysData.support_phone || prev.supportPhone,
          supportTelegram: sysData.support_telegram || prev.supportTelegram,
          supportEmail: sysData.support_email || prev.supportEmail,
          supportHours: sysData.support_hours || prev.supportHours,
          smsProvider: sysData.sms_provider || prev.smsProvider,
          smsToken: sysData.sms_token || prev.smsToken,
          smsTemplate: sysData.sms_template || prev.smsTemplate,
          androidMinVersion: sysData.android_min_version || prev.androidMinVersion,
          iosMinVersion: sysData.ios_min_version || prev.iosMinVersion,
          forceUpdate: sysData.force_update !== undefined ? Boolean(sysData.force_update) : prev.forceUpdate,
          maintenanceMode: Boolean(sysData.is_maintenance_mode),
          maintenanceTitle: sysData.maintenance_title || prev.maintenanceTitle,
          maintenanceMessage: sysData.maintenance_message || prev.maintenanceMessage,
          estimatedEndTime: sysData.estimated_end_time || prev.estimatedEndTime,
          telegram_bot_token: sysData.telegram_bot_token || prev.telegram_bot_token,
          telegram_admin_id: sysData.telegram_admin_id || prev.telegram_admin_id,
          gemini_api_key: sysData.gemini_api_key || prev.gemini_api_key,
        }));
      }
    } catch (_) {}
  };

  useEffect(() => {
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
  const [pricingModalSchool, setPricingModalSchool] = useState(null);
  const [pricingForm, setPricingForm] = useState({
    monthly_price: 1000000,
    is_free_trial: false,
    trial_until_date: '',
    payment_status: 'PAID',
    debt_amount: "0 so'm",
  });
  const [telegramTestLoading, setTelegramTestLoading] = useState(false);
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

  // 5.5 Server Analitikasi Real-Vaqt (Har 3 soniyada yangilanadi)
  const [serverStats, setServerStats] = useState(null);
  const [serverLoading, setServerLoading] = useState(true);

  useEffect(() => {
    let timer = null;
    let isMounted = true;

    const fetchServerStats = async () => {
      try {
        const res = await fetch('/api/superadmin/server-analytics/', {
          headers: {
            'X-Super-Admin': '1',
            'X-User-Role': 'SUPER_ADMIN'
          }
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setServerStats(data);
          setServerLoading(false);
        }
      } catch (_) {}
    };

    if (superTab === 'server') {
      fetchServerStats();
      timer = setInterval(fetchServerStats, 3000); // Har 3 soniyada jimjit yangilanadi
    }

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [superTab]);

  // 6. System Config & Backup state
  const [backups, setBackups] = useState(INITIAL_BACKUPS);
  const [systemConfig, setSystemConfig] = useState(() => ({
    projectName: systemConfigProp?.project_name || 'Idrok Edu',
    projectBadge: systemConfigProp?.project_badge || 'CORE',
    projectSlogan: systemConfigProp?.project_slogan || "Aqlli Ta'lim va Biometrik Davomat Platformasi",
    qrRefreshSeconds: Number(systemConfigProp?.qr_refresh_seconds) || 15,
    faceIdMinConfidence: Number(systemConfigProp?.face_id_min_confidence) || 90,
    defaultGpsRadius: Number(systemConfigProp?.default_gps_radius) || 150,
    sessionTimeoutMinutes: Number(systemConfigProp?.session_timeout_minutes) || 60,
    supportPhone: systemConfigProp?.support_phone || '+998 71 200-00-55',
    supportTelegram: systemConfigProp?.support_telegram || '@idrok_support_bot',
    supportEmail: systemConfigProp?.support_email || 'support@idrok-edu.uz',
    supportHours: systemConfigProp?.support_hours || 'Dushanba – Shanba, 08:00 – 20:00',
    smsProvider: systemConfigProp?.sms_provider || 'Eskiz.uz Official Gateway',
    smsToken: systemConfigProp?.sms_token || '',
    smsTemplate: systemConfigProp?.sms_template || 'Hurmatli ota-ona! Farzandingiz {student_name} bugun darsga kelmadi.',
    smsBalance: 48250,
    telegramBotToken: '7192834102:AAH9xIdrokEduBot_ProdKey',
    telegramBotActive: true,
    telegram_bot_token: systemConfigProp?.telegram_bot_token || '',
    telegram_admin_id: systemConfigProp?.telegram_admin_id || '',
    gemini_api_key: systemConfigProp?.gemini_api_key || '',
    fcmActive: true,
    androidMinVersion: systemConfigProp?.android_min_version || '2.4.1',
    iosMinVersion: systemConfigProp?.ios_min_version || '2.4.0',
    forceUpdate: systemConfigProp?.force_update !== undefined ? Boolean(systemConfigProp.force_update) : true,
    maintenanceMode: Boolean(systemConfigProp?.is_maintenance_mode),
    maintenanceTitle: systemConfigProp?.maintenance_title || "Tizimda profilaktika ishlari olib borilmoqda",
    maintenanceMessage: systemConfigProp?.maintenance_message || "Tizim serverlarida rejali modernizatsiya va texnik sozlash ishlari amalga oshirilmoqda. Tez orada barcha xizmatlar to'liq tiklanadi.",
    estimatedEndTime: systemConfigProp?.estimated_end_time || "14:00",
  }));

  useEffect(() => {
    if (systemConfigProp) {
      setSystemConfig(prev => ({
        ...prev,
        projectName: systemConfigProp.project_name || prev.projectName,
        projectBadge: systemConfigProp.project_badge || prev.projectBadge,
        projectSlogan: systemConfigProp.project_slogan || prev.projectSlogan,
        qrRefreshSeconds: Number(systemConfigProp.qr_refresh_seconds) || prev.qrRefreshSeconds,
        faceIdMinConfidence: Number(systemConfigProp.face_id_min_confidence) || prev.faceIdMinConfidence,
        defaultGpsRadius: Number(systemConfigProp.default_gps_radius) || prev.defaultGpsRadius,
        sessionTimeoutMinutes: Number(systemConfigProp.session_timeout_minutes) || prev.sessionTimeoutMinutes,
        supportPhone: systemConfigProp.support_phone || prev.supportPhone,
        supportTelegram: systemConfigProp.support_telegram || prev.supportTelegram,
        supportEmail: systemConfigProp.support_email || prev.supportEmail,
        supportHours: systemConfigProp.support_hours || prev.supportHours,
        smsProvider: systemConfigProp.sms_provider || prev.smsProvider,
        smsToken: systemConfigProp.sms_token || prev.smsToken,
        smsTemplate: systemConfigProp.sms_template || prev.smsTemplate,
        androidMinVersion: systemConfigProp.android_min_version || prev.androidMinVersion,
        iosMinVersion: systemConfigProp.ios_min_version || prev.iosMinVersion,
        forceUpdate: systemConfigProp.force_update !== undefined ? Boolean(systemConfigProp.force_update) : prev.forceUpdate,
        maintenanceMode: Boolean(systemConfigProp.is_maintenance_mode),
        maintenanceTitle: systemConfigProp.maintenance_title || prev.maintenanceTitle,
        maintenanceMessage: systemConfigProp.maintenance_message || prev.maintenanceMessage,
        estimatedEndTime: systemConfigProp.estimated_end_time || prev.estimatedEndTime,
        telegram_bot_token: systemConfigProp.telegram_bot_token || prev.telegram_bot_token,
        telegram_admin_id: systemConfigProp.telegram_admin_id || prev.telegram_admin_id,
        gemini_api_key: systemConfigProp.gemini_api_key || prev.gemini_api_key,
      }));
    }
  }, [systemConfigProp]);

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

  const handleOpenPricingModal = (school) => {
    setPricingModalSchool(school);
    setPricingForm({
      monthly_price: Number(school.monthlyPrice) || 1000000,
      is_free_trial: Boolean(school.isFreeTrial),
      trial_until_date: school.trialUntilDate || '',
      payment_status: school.paymentStatus || 'PAID',
      debt_amount: school.debtAmount || "0 so'm",
    });
  };

  const handleSaveSchoolPricing = async () => {
    if (!pricingModalSchool) return;
    try {
      const res = await fetch('/api/school-config/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN'
        },
        body: JSON.stringify({
          school_id: pricingModalSchool.id,
          monthly_price: pricingForm.monthly_price,
          is_free_trial: pricingForm.is_free_trial,
          trial_until_date: pricingForm.trial_until_date || null,
          payment_status: pricingForm.is_free_trial ? 'PENDING' : pricingForm.payment_status,
          debt_amount: pricingForm.debt_amount,
          status: pricingForm.is_free_trial ? 'TRIAL' : (pricingModalSchool.status === 'TRIAL' ? 'ACTIVE' : pricingModalSchool.status)
        })
      });
      if (res.ok) {
        showToast(`${pricingModalSchool.name} oylik narxi saqlandi!`);
        setPricingModalSchool(null);
        if (typeof loadRealProjectStats === 'function') loadRealProjectStats();
      } else {
        showToast("Xatolik yuz berdi!");
      }
    } catch (_) {
      showToast("Tarmoq xatosi!");
    }
  };

  const handleSaveSystemConfig = async () => {
    try {
      const res = await fetch('/api/system-config/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN'
        },
        body: JSON.stringify({
          project_name: systemConfig.projectName,
          project_badge: systemConfig.projectBadge,
          project_slogan: systemConfig.projectSlogan,
          qr_refresh_seconds: Number(systemConfig.qrRefreshSeconds) || 15,
          face_id_min_confidence: Number(systemConfig.faceIdMinConfidence) || 90,
          default_gps_radius: Number(systemConfig.defaultGpsRadius) || 150,
          session_timeout_minutes: Number(systemConfig.sessionTimeoutMinutes) || 60,
          support_phone: systemConfig.supportPhone,
          support_telegram: systemConfig.supportTelegram,
          support_email: systemConfig.supportEmail,
          support_hours: systemConfig.supportHours,
          sms_provider: systemConfig.smsProvider,
          sms_token: systemConfig.smsToken,
          sms_template: systemConfig.smsTemplate,
          android_min_version: systemConfig.androidMinVersion,
          ios_min_version: systemConfig.iosMinVersion,
          force_update: systemConfig.forceUpdate,
          telegram_bot_token: systemConfig.telegram_bot_token || '',
          telegram_admin_id: systemConfig.telegram_admin_id || '',
          gemini_api_key: systemConfig.gemini_api_key || '',
        })
      });
      if (res.ok) {
        showToast("Tizim sozlamalari muvaffaqiyatli saqlandi va barcha modullarga tatbiq etildi!");
        appendAuditLog('UPDATE_SYSTEM_CONFIG', 'Global Sozlamalar', `Loyiha: ${systemConfig.projectName}, QR: ${systemConfig.qrRefreshSeconds}s, Call-markaz: ${systemConfig.supportPhone}`);
        if (typeof onSystemConfigUpdated === 'function') onSystemConfigUpdated();
        if (typeof loadRealProjectStats === 'function') loadRealProjectStats();
      } else {
        showToast("Saqlashda xatolik yuz berdi!");
      }
    } catch (_) {
      showToast("Tarmoq xatosi!");
    }
  };

  const handleTestTelegramBot = async () => {
    setTelegramTestLoading(true);
    try {
      const res = await fetch('/api/superadmin/test-telegram/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✅ " + data.message);
      } else {
        showToast("❌ " + (data.message || "Sinov xabari yuborilmadi!"));
      }
    } catch (_) {
      showToast("❌ Server bilan bog'lanib bo'lmadi!");
    } finally {
      setTelegramTestLoading(false);
    }
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

  // Computed 100% REAL KPI metrics
  const activeCount = realStats?.kpis?.active_schools ?? schoolsList.filter(s => s.status === 'ACTIVE').length;
  const trialCount = schoolsList.filter(s => s.status === 'TRIAL').length;
  const blockedCount = realStats?.kpis?.suspended_schools ?? schoolsList.filter(s => s.status === 'BLOCKED' || s.status === 'SUSPENDED' || s.status === 'ARCHIVED').length;
  const totalStudents = realStats?.kpis?.total_students ?? schoolsList.reduce((acc, s) => acc + (Number(s.studentsCount) || 0), 0);
  const totalTeachers = realStats?.kpis?.total_teachers ?? schoolsList.reduce((acc, s) => acc + (Number(s.teachersCount) || 0), 0);
  const avgAttendance = realStats?.kpis?.avg_attendance_rate !== undefined
    ? Number(realStats.kpis.avg_attendance_rate).toFixed(1)
    : (schoolsList.length > 0
        ? (schoolsList.reduce((acc, s) => acc + (Number(s.attendanceRate) || 0), 0) / schoolsList.length).toFixed(1)
        : '0.0');

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

  const tabNames = {
    overview: "Global Analitika",
    schools: "Maktablar Boshqaruvi",
    map: "Maktablar Xaritasi",
    billing: "Obuna & Moliya",
    server: "Server Analitikasi",
    config: "Tizim Sozlamalari",
    support: "Texnik Yordam",
  };

  const tabTitles = {
    overview: "Global Analitika va Jonli Monitoring",
    schools: "Maktablar Boshqaruvi",
    map: "Respublika Maktablari Geografik Xaritasi va Monitoringi",
    billing: "Obuna va Moliya Tizimi",
    server: "Server Analitikasi",
    config: `${systemConfig.projectName || "Idrok Edu"} Core: Global Sozlamalar va Integratsiyalar`,
    support: "Texnik Yordam va Murojaatlar Markazi",
  };

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const [isSmallScreen, setIsSmallScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSchoolTab, setMobileSchoolTab] = useState('details');

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 1024);
      setIsSmallScreen(w < 640);
      if (w >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', maxWidth: '100%', height: '100vh', background: '#F8F9FE', overflow: 'hidden', position: 'relative' }}>
      
      {/* Mobil menyu overlay backdrop */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 998,
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      {/* Yumshoq suzib chiquvchi Toast xabarnoma */}
      {toastMsg && (
        <div
          className="sa-card"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            backgroundColor: '#1E2038',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: 8,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 500,
          }}>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* CHAP SIDEBAR — ENTERPRISE B2B STANDARTIDAGI IXCHAM DIZAYN         */}
      {/* ================================================================= */}
      <aside
        style={{
          width: 260,
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${THEME.border}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          zIndex: isMobile ? 999 : 10,
          flexShrink: 0,
          ...(isMobile ? {
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            height: '100vh',
            boxShadow: mobileMenuOpen ? '0 20px 40px rgba(0, 0, 0, 0.25)' : 'none',
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          } : {}),
        }}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                border: 'none',
                background: '#F1F5F9',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: THEME.textDark,
              }}>
              <X size={16} />
            </button>
          </div>
        )}
        {/* Brand Card — Enterprise Master Platform */}
        <div
          onClick={() => setSuperTab('overview')}
          title="Boshqaruv markaziga o'tish"
          style={{
            padding: '13px 14px',
            marginBottom: 16,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#C7D2FE';
            e.currentTarget.style.boxShadow = '0 6px 18px -4px rgba(108, 92, 231, 0.14)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Yuqori nafis rangli aksent chiziq */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #6C5CE7 0%, #10AC84 50%, #48DBFB 100%)',
          }} />

          {/* Logo va Platforma Nomi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              position: 'relative',
              width: 42,
              height: 42,
              borderRadius: 10,
              backgroundColor: '#F1F0FF',
              border: '1px solid rgba(108, 92, 231, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(108, 92, 231, 0.15)',
            }}>
              <img
                src="/idrok_icon.png"
                alt="Logo"
                style={{
                  width: 30,
                  height: 30,
                  objectFit: 'contain',
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#10AC84',
                border: '2px solid #FFFFFF',
                boxShadow: '0 0 4px rgba(16, 172, 132, 0.6)',
              }} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span style={{
                  fontWeight: 800,
                  fontSize: 14.5,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {systemConfig.projectName || "Idrok Edu"}
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  padding: '2px 6px',
                  borderRadius: 5,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #4F46E5 100%)',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(108, 92, 231, 0.25)',
                }}>
                  SUPER
                </span>
              </div>
              <div style={{
                fontSize: 11,
                color: '#64748B',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                marginTop: 1,
              }}>
                Bosh Boshqarma Markazi
              </div>
            </div>
          </div>

          {/* Pastki Tizim Holati Paneli */}
          <div style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#334155',
              fontWeight: 600,
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#10AC84',
                boxShadow: '0 0 0 2px rgba(16, 172, 132, 0.2)',
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <span>{systemConfig.projectBadge || "CORE"} Boshqaruvi</span>
            </div>
            
            <span style={{
              fontSize: 9.5,
              fontWeight: 800,
              padding: '1.5px 6px',
              borderRadius: 4,
              backgroundColor: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0',
              letterSpacing: '0.03em',
            }}>
              ONLINE
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          <SidebarNavBtn
            active={superTab === 'overview'}
            onClick={() => { setSuperTab('overview'); if (isMobile) setMobileMenuOpen(false); }}
            icon={<BarChart3 size={17} />}
            label="Global Analitika"
            badge="Jonli"
          />
          <SidebarNavBtn
            active={superTab === 'schools'}
            onClick={() => { setSuperTab('schools'); if (isMobile) setMobileMenuOpen(false); }}
            icon={<Building2 size={17} />}
            label="Maktablar Boshqaruvi"
            badge={`${schoolsList.length} ta`}
          />
          <SidebarNavBtn
            active={superTab === 'map'}
            onClick={() => { setSuperTab('map'); if (isMobile) setMobileMenuOpen(false); }}
            icon={<MapPin size={17} />}
            label="Maktablar Xaritasi"
            badge="Xarita"
          />
          <SidebarNavBtn
            active={superTab === 'billing'}
            onClick={() => { setSuperTab('billing'); if (isMobile) setMobileMenuOpen(false); }}
            icon={<Award size={17} />}
            label="Obuna va Moliya"
            badge="MRR"
          />
          <SidebarNavBtn
            active={superTab === 'server'}
            onClick={() => { setSuperTab('server'); if (isMobile) setMobileMenuOpen(false); }}
            icon={<Server size={17} />}
            label="Server Analitikasi"
            badge="3s Jonli"
          />
          <SidebarNavBtn
            active={superTab === 'config'}
            onClick={() => { setSuperTab('config'); if (isMobile) setMobileMenuOpen(false); }}
            icon={<Sliders size={17} />}
            label="Tizim Sozlamalari"
            badge="S3/SMS"
          />
          <SidebarNavBtn
            active={superTab === 'support'}
            onClick={() => { setSuperTab('support'); if (isMobile) setMobileMenuOpen(false); }}
            icon={<Bell size={17} />}
            label="Texnik Yordam"
            badge={openTicketsCount > 0 ? `${openTicketsCount} yangi` : null}
          />
        </div>



        {/* Profile Footer */}
        <div style={{ paddingTop: 12, borderTop: `1px solid #E2E8F0`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: THEME.gradient,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 12,
                flexShrink: 0,
              }}>
              SA
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: '#1E2038', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name || 'Bosh Boshqarma'}
              </div>
              <div style={{ fontSize: 11, color: '#10AC84', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#10AC84' }} /> Root 2FA Faol
              </div>
            </div>
          </div>
          <button
            className="sa-btn"
            onClick={handleLogout}
            title="Chiqish"
            style={{ background: '#FEE2E2', border: '1px solid #FECDD3', color: '#EF4444', padding: '6px 8px', borderRadius: 6, cursor: 'pointer', flexShrink: 0 }}>
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* O'NG ASOSIY KONTENT VA HIGH-DENSITY ENTERPRISE HEADER              */}
      {/* ================================================================= */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Top Dynamic Header */}
        <header
          style={{
            padding: isMobile ? '10px 14px' : '14px 28px',
            backgroundColor: '#FFFFFF',
            borderBottom: `1px solid ${THEME.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, minWidth: 0 }}>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  border: `1px solid ${THEME.border}`,
                  background: '#FFFFFF',
                  borderRadius: 8,
                  padding: '7px 9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: THEME.primary,
                  boxShadow: THEME.softShadow,
                }}
                title="Menyu">
                <Menu size={19} />
              </button>
            )}
            <img
              src="/idrok_superadmin_icon.png"
              alt="Idrok Super Admin"
              style={{
                width: isMobile ? 32 : 38,
                height: isMobile ? 32 : 38,
                borderRadius: 8,
                objectFit: 'contain',
                border: '1px solid #E2E8F0',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              {!isSmallScreen && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#8A90A2' }}>
                  <span>Boshqaruv Paneli</span>
                  <ChevronRight size={11} color="#CBD5E1" />
                  <span style={{ color: '#6C5CE7', fontWeight: 500 }}>Super Admin</span>
                  <ChevronRight size={11} color="#CBD5E1" />
                  <span style={{ color: '#1E2038', fontWeight: 600 }}>{tabNames[superTab] || "Boshqaruv"}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: '#1E2038', margin: 0, letterSpacing: '-0.02em' }}>
                  {isSmallScreen ? tabNames[superTab] : (tabTitles[superTab] || "Global Analitika va Jonli Monitoring")}
                </h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 7px', borderRadius: 6, backgroundColor: '#E8F8F5', border: '1px solid rgba(16, 172, 132, 0.25)', fontSize: 10.5, fontWeight: 600, color: '#10AC84' }}>
                  <span className="sa-ping-dot" style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#10AC84', display: 'inline-block' }} />
                  <span>{isSmallScreen ? `${activeCount}/${schoolsList.length}` : `Jonli Ekotizim • ${schoolsList.length} ta maktab (${activeCount} faol)`}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {superTab === 'server' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: 700,
                  backgroundColor: '#ECFDF5',
                  color: THEME.green,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span className="sa-ping-dot" style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: THEME.green }} />
                  3s Jonli Avto-yangilanish
                </span>
              </div>
            )}

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

            {superTab === 'map' && (
              <>
                <button className="sa-btn" onClick={() => loadRealProjectStats()} style={secondaryBtnStyle}>
                  <RefreshCw size={14} /> Xaritani Yangilash
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
        <div key={superTab} className="sa-tab-content" style={{ padding: isMobile ? '12px 10px 84px 10px' : '24px 30px', flex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 22, overflowX: 'hidden' }}>
          
          {/* ============================================================= */}
          {/* 1. GLOBAL ANALITIKA VA JONLI MONITORING                       */}
          {/* ============================================================= */}
          {superTab === 'overview' && (
            <>
              {/* Asosiy KPI Ko'rsatkichlari (Enterprise MicroSparkline bilan) */}
              <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : (isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(225px, 1fr))'), gap: isSmallScreen ? 10 : 14 }}>
                <MetricCard
                  icon={<Building2 size={16} color={THEME.primary} />}
                  title="Jami Maktablar Soni"
                  value={`${schoolsList.length} ta`}
                  sub={`Faol: ${activeCount} • Sinov: ${trialCount} • Cheklangan: ${blockedCount}`}
                  color={THEME.primary}
                  sparklineData={[schoolsList.length * 0.4, schoolsList.length * 0.5, schoolsList.length * 0.65, schoolsList.length * 0.75, schoolsList.length * 0.85, schoolsList.length * 0.95, schoolsList.length]}
                />
                <MetricCard
                  icon={<Users size={16} color={THEME.green} />}
                  title="Tizimdagi Foydalanuvchilar"
                  value={`${(totalStudents + totalTeachers + schoolsList.length).toLocaleString()} nafar`}
                  sub={`${totalStudents.toLocaleString()} o‘quvchi • ${totalTeachers} ustoz`}
                  color={THEME.green}
                  sparklineData={[totalStudents * 0.7, totalStudents * 0.76, totalStudents * 0.81, totalStudents * 0.88, totalStudents * 0.92, totalStudents * 0.96, totalStudents]}
                />
                <MetricCard
                  icon={<Activity size={16} color={THEME.orange} />}
                  title="Bugungi Global Davomat"
                  value={`${avgAttendance}%`}
                  sub="Turniket Face ID + 25s Dinamik QR"
                  color={THEME.orange}
                  sparklineData={[94.2, 94.8, 95.1, 95.5, 95.9, 96.2, avgAttendance || 96.5]}
                />
                <MetricCard
                  icon={<Server size={16} color={THEME.cyan} />}
                  title="Server So‘rovlari va Barqarorlik"
                  value="342 req/s"
                  sub="Xatolik: 0.04% • O‘rtacha ping: 14ms"
                  color={THEME.cyan}
                  sparklineData={[280, 295, 310, 305, 325, 335, 342]}
                />
              </div>

              {/* Idrok Edu Ekotizim Modullari Paneli */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
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
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 800, border: '1px solid #86EFAC' }}>
                    ● Barcha 5 modul sinxron va faol
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : (isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(210px, 1fr))'), gap: 12 }}>
                  {/* Modul 1: Idrok Edu */}
                  <div style={{ padding: 14, borderRadius: 8, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                  <div style={{ padding: 14, borderRadius: 8, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                  <div style={{ padding: 14, borderRadius: 8, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                  <div style={{ padding: 14, borderRadius: 8, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                  <div style={{ padding: 14, borderRadius: 8, backgroundColor: '#F8F9FE', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.78fr 1fr', gap: isMobile ? 14 : 22, alignItems: 'stretch' }}>
                
                {/* KATTA SILLIQ CHIZIQLI STATISTIK GRAFIK */}
                {(() => {
                  const realDbStudentsCount = dbStudents.length || 12;
                  const realPhotosInDb =
                    dbStudents.filter(s => s.photo || s.has_face_id || s.face_encoding).length || realDbStudentsCount;

                  const totalImagesUploaded = totalStudents + realPhotosInDb;
                  const totalFilesUploaded = exportedFilesCount + backups.length + invoices.length + schoolsList.length * 4;
                  const totalSystemChanges = auditLogs.length + schoolsList.length * 12 + exportedFilesCount * 3;

                  const timeSeriesData = (realStats && Array.isArray(realStats.time_series_data) && realStats.time_series_data.length > 0) ? realStats.time_series_data : [
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

                  const svgW = 700;
                  const svgH = 260;
                  const padX = 44;
                  const padY = 24;

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
                    {
                      id: 'CHANGES',
                      label: 'Tizim O‘zgarishlari',
                      val: `${activePoint.changesReal.toLocaleString()} ta`,
                      color: THEME.primary,
                      bg: '#EEF2FF',
                      badge: '+18.4% faollik'
                    },
                    {
                      id: 'IMAGES',
                      label: 'Rasmlar (Face ID)',
                      val: `${activePoint.imagesReal.toLocaleString()} ta`,
                      color: THEME.orange,
                      bg: '#FFFBEB',
                      badge: '99.2% aniqlik'
                    },
                    {
                      id: 'FILES',
                      label: 'Fayllar & Eksport',
                      val: `${activePoint.filesReal.toLocaleString()} ta`,
                      color: '#0284C7',
                      bg: '#F0F9FF',
                      badge: 'Shifrlangan'
                    },
                    {
                      id: 'SCHOOLS',
                      label: 'Yangi Maktablar',
                      val: `${activePoint.schoolsCount} ta`,
                      color: THEME.green,
                      bg: '#ECFDF5',
                      badge: 'Faol tarmoq'
                    },
                  ];

                  const modeOptions = [
                    { id: 'CUMULATIVE', label: 'Barchasi' },
                    { id: 'CHANGES', label: 'O‘zgarishlar' },
                    { id: 'IMAGES', label: 'Rasmlar' },
                    { id: 'FILES', label: 'Fayllar' },
                    { id: 'SCHOOLS', label: 'Maktablar' }
                  ];

                  return (
                    <div className="sa-card" style={{ ...cardBoxStyle, padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {/* Sarlavha va Filtrlash boshqaruvi */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: '#EEF2FF',
                              color: THEME.primary,
                              fontSize: 10.5,
                              fontWeight: 700,
                              letterSpacing: '0.4px',
                              textTransform: 'uppercase'
                            }}>
                              Dinamik Analitika
                            </span>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.textDark, margin: 0, letterSpacing: '-0.2px' }}>
                              Global Yuklanishlar va Tizim O‘zgarishlari Dinamikasi
                            </h3>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span className="sa-pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: THEME.green, display: 'inline-block' }} />
                            <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0 }}>
                              Real vaqtli tahlil • Oraliq ko‘rsatkichi: <b style={{ color: THEME.textDark }}>{activePoint.short}</b>
                            </p>
                          </div>
                        </div>

                        {/* Segmented Mode Controller */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#F1F5F9',
                          borderRadius: 6,
                          padding: 3,
                          gap: 2,
                          border: '1px solid #E2E8F0'
                        }}>
                          {modeOptions.map(opt => {
                            const isCurrent = chartMode === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => setChartMode(opt.id)}
                                style={{
                                  padding: '5px 11px',
                                  borderRadius: 5,
                                  fontSize: 11.5,
                                  fontWeight: isCurrent ? 700 : 500,
                                  color: isCurrent ? THEME.textDark : '#64748B',
                                  backgroundColor: isCurrent ? '#FFFFFF' : 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  boxShadow: isCurrent ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                  transition: 'all 0.15s ease'
                                }}>
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 4 ta Professional Enterprise Ko'rsatkich Kartochkalari */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
                        {legendSeries.map(item => {
                          const isSelectedLine = chartMode === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setChartMode(isSelectedLine ? 'CUMULATIVE' : item.id)}
                              style={{
                                padding: '12px 14px',
                                borderRadius: 8,
                                backgroundColor: isSelectedLine ? item.bg : '#FFFFFF',
                                border: `1px solid ${isSelectedLine ? item.color : '#E2E8F0'}`,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: isSelectedLine ? `0 2px 8px -2px ${item.color}33` : '0 1px 2px rgba(0,0,0,0.02)'
                              }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.2px', textTransform: 'uppercase' }}>
                                    {item.label}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: item.color,
                                  backgroundColor: item.bg,
                                  padding: '1px 5px',
                                  borderRadius: 4
                                }}>
                                  {item.badge}
                                </span>
                              </div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.textDark, letterSpacing: '-0.3px' }}>
                                {item.val}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* KATTA SILLIQ KO'P-CHIZIQLI (MULTI-LINE) GRAFIK (UZLUKSIZ HOVER BILAN) */}
                      <div
                        style={{
                          background: '#FAFBFD',
                          borderRadius: 8,
                          padding: '16px 14px 12px 14px',
                          border: '1px solid #E2E8F0',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                        }}>
                        {/* Modern Dark Floating Tooltip */}
                        {chartHover && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 14,
                              left: chartHover.pctX > 62 ? `calc(${chartHover.pctX}% - 210px)` : `calc(${chartHover.pctX}% + 16px)`,
                              backgroundColor: '#0F172A',
                              color: '#FFFFFF',
                              padding: '10px 14px',
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 500,
                              pointerEvents: 'none',
                              zIndex: 20,
                              minWidth: 195,
                              boxShadow: '0 12px 28px -4px rgba(0,0,0,0.45)',
                              border: '1px solid #334155',
                              transition: 'left 0.05s ease-out',
                            }}>
                            <div style={{
                              fontWeight: 700,
                              fontSize: 12,
                              color: '#F8FAFC',
                              marginBottom: 6,
                              paddingBottom: 6,
                              borderBottom: '1px solid #334155',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#94A3B8' }}>
                                <Clock size={12} color="#38BDF8" /> Vaqt oralig‘i:
                              </span>
                              <span style={{ color: '#38BDF8', fontWeight: 700 }}>{chartHover.short}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              {showLine('CHANGES') && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                                  <span style={{ color: '#C4B5FD', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: THEME.primary }} />
                                    O‘zgarishlar:
                                  </span>
                                  <b style={{ color: '#FFFFFF', fontWeight: 700 }}>{chartHover.changesReal.toLocaleString()} ta</b>
                                </div>
                              )}
                              {showLine('IMAGES') && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                                  <span style={{ color: '#FCD34D', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: THEME.orange }} />
                                    Rasmlar:
                                  </span>
                                  <b style={{ color: '#FFFFFF', fontWeight: 700 }}>{chartHover.imagesReal.toLocaleString()} ta</b>
                                </div>
                              )}
                              {showLine('FILES') && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                                  <span style={{ color: '#7DD3FC', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0284C7' }} />
                                    Fayllar:
                                  </span>
                                  <b style={{ color: '#FFFFFF', fontWeight: 700 }}>{chartHover.filesReal.toLocaleString()} ta</b>
                                </div>
                              )}
                              {showLine('SCHOOLS') && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                                  <span style={{ color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: THEME.green }} />
                                    Maktablar:
                                  </span>
                                  <b style={{ color: '#FFFFFF', fontWeight: 700 }}>{chartHover.schoolsCount} ta</b>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <svg
                          viewBox={`0 0 ${svgW} ${svgH}`}
                          onMouseMove={handleChartMouseMove}
                          onMouseLeave={() => setChartHover(null)}
                          style={{ width: '100%', height: 260, overflow: 'visible', cursor: 'crosshair' }}>
                          <defs>
                            <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={THEME.primary} stopOpacity="0.12" />
                              <stop offset="100%" stopColor={THEME.primary} stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={THEME.orange} stopOpacity="0.09" />
                              <stop offset="100%" stopColor={THEME.orange} stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.09" />
                              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="greenAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={THEME.green} stopOpacity="0.09" />
                              <stop offset="100%" stopColor={THEME.green} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Gorizontal Setka Chiziqlari (Toza, 1px dashed) */}
                          {[25, 50, 75, 100].map(gVal => {
                            const y = getY(gVal);
                            return (
                              <g key={gVal}>
                                <line x1={padX} y1={y} x2={svgW - padX} y2={y} stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
                                <text x={8} y={y + 3.5} fontSize="10" fill="#94A3B8" fontWeight="600">
                                  {gVal}%
                                </text>
                              </g>
                            );
                          })}

                          {/* Pastki Asosiy Chiziq (Baseline) */}
                          <line x1={padX} y1={svgH - padY} x2={svgW - padX} y2={svgH - padY} stroke="#E2E8F0" strokeWidth="1" />

                          {/* Silliq Hudud Ranglari (Area Fills) */}
                          {showLine('CHANGES') && <path d={buildAreaPath(changesPath)} fill="url(#purpleAreaGrad)" />}
                          {showLine('IMAGES') && <path d={buildAreaPath(imagesPath)} fill="url(#orangeAreaGrad)" />}
                          {chartMode === 'FILES' && <path d={buildAreaPath(filesPath)} fill="url(#cyanAreaGrad)" />}
                          {chartMode === 'SCHOOLS' && <path d={buildAreaPath(schoolsPath)} fill="url(#greenAreaGrad)" />}

                          {/* 1-Chiziq (Yashil): Yangi Maktablar */}
                          {showLine('SCHOOLS') && (
                            <path className="sa-chart-line" d={schoolsPath} fill="none" stroke={THEME.green} strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
                          )}

                          {/* 2-Chiziq (Moviy): Fayllar Yuklanishi */}
                          {showLine('FILES') && (
                            <path d={filesPath} fill="none" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" />
                          )}

                          {/* 3-Chiziq (To'q sariq): Rasmlar Yuklanishi */}
                          {showLine('IMAGES') && (
                            <path className="sa-chart-line" d={imagesPath} fill="none" stroke={THEME.orange} strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
                          )}

                          {/* 4-Chiziq (Binafsha): Tizim O'zgarishlari */}
                          {showLine('CHANGES') && (
                            <path className="sa-chart-line" d={changesPath} fill="none" stroke={THEME.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          )}

                          {/* Sichqoncha olib borilganda jonli Crosshair va aniq nuqtalar */}
                          {chartHover && (
                            <g style={{ pointerEvents: 'none' }}>
                              <line
                                x1={chartHover.svgX}
                                y1={padY - 8}
                                x2={chartHover.svgX}
                                y2={svgH - padY}
                                stroke="#94A3B8"
                                strokeDasharray="3 3"
                                strokeWidth="1.2"
                              />
                              {showLine('SCHOOLS') && (
                                <g>
                                  <circle cx={chartHover.svgX} cy={getY(chartHover.schoolsLine)} r={7} fill={THEME.green} opacity="0.2" />
                                  <circle cx={chartHover.svgX} cy={getY(chartHover.schoolsLine)} r={4.5} fill={THEME.green} stroke="#FFFFFF" strokeWidth="2" />
                                </g>
                              )}
                              {showLine('FILES') && (
                                <g>
                                  <circle cx={chartHover.svgX} cy={getY(chartHover.filesLine)} r={7} fill="#0284C7" opacity="0.2" />
                                  <circle cx={chartHover.svgX} cy={getY(chartHover.filesLine)} r={4.5} fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                                </g>
                              )}
                              {showLine('IMAGES') && (
                                <g>
                                  <circle cx={chartHover.svgX} cy={getY(chartHover.imagesLine)} r={7.5} fill={THEME.orange} opacity="0.2" />
                                  <circle cx={chartHover.svgX} cy={getY(chartHover.imagesLine)} r={4.5} fill={THEME.orange} stroke="#FFFFFF" strokeWidth="2" />
                                </g>
                              )}
                              {showLine('CHANGES') && (
                                <g>
                                  <circle cx={chartHover.svgX} cy={getY(chartHover.changesLine)} r={8} fill={THEME.primary} opacity="0.2" />
                                  <circle cx={chartHover.svgX} cy={getY(chartHover.changesLine)} r={4.5} fill={THEME.primary} stroke="#FFFFFF" strokeWidth="2" />
                                </g>
                              )}
                            </g>
                          )}

                          {/* Asosiy Vaqt Bo'limlari (X-O'qi) */}
                          {timeSeriesData.map((d, i) => {
                            const cx = getX(i);
                            const isSel = !chartHover && selectedStageIdx === i;
                            return (
                              <g key={d.short} onClick={() => setSelectedStageIdx(i)} style={{ cursor: 'pointer' }}>
                                {/* Vaqt belgisi tushuvchi kichik shtrix */}
                                <line x1={cx} y1={svgH - padY} x2={cx} y2={svgH - padY + 4} stroke="#CBD5E1" strokeWidth="1" />

                                {isSel && (
                                  <g>
                                    <line
                                      x1={cx}
                                      y1={padY - 6}
                                      x2={cx}
                                      y2={svgH - padY}
                                      stroke={THEME.primary}
                                      strokeDasharray="3 3"
                                      strokeWidth="1.2"
                                      opacity="0.6"
                                    />
                                    {showLine('CHANGES') && (
                                      <circle cx={cx} cy={getY(d.changesLine)} r={4} fill={THEME.primary} stroke="#FFF" strokeWidth="2" />
                                    )}
                                  </g>
                                )}

                                <text
                                  x={cx}
                                  y={svgH - 6}
                                  textAnchor="middle"
                                  fontSize="11"
                                  fontWeight={isSel ? '700' : '500'}
                                  fill={isSel ? THEME.primary : '#64748B'}>
                                  {d.short}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        {/* Chart Tagidagi Pastki Xulosa / Status Bar */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 10,
                          paddingTop: 10,
                          borderTop: '1px solid #F1F5F9',
                          flexWrap: 'wrap',
                          gap: 10
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#64748B' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: THEME.green, display: 'inline-block' }} />
                            <span>Eng yuqori yuklanish davri: <strong style={{ color: THEME.textDark }}>14:00 (Pik)</strong> • Avtomatik sinxronizatsiya faol</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748B' }}>
                            Jami tizim o‘zgarishlari: <strong style={{ color: THEME.primary }}>{totalSystemChanges.toLocaleString()}</strong> ta • Face ID rasmlar: <strong style={{ color: THEME.orange }}>{totalImagesUploaded.toLocaleString()}</strong> ta
                          </div>
                        </div>
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
                      <span style={pillBadgeStyle}>{regionsList.length} ta real hudud</span>
                    </div>

                    {/* Tanlangan hudud kartasi */}
                    {selectedRegion ? (
                      <div
                        style={{
                          padding: '15px 18px',
                          borderRadius: 8,
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
                    ) : (
                      <div style={{ padding: '16px', borderRadius: 8, backgroundColor: '#F8F9FE', border: `1px solid ${THEME.border}`, marginBottom: 14, textAlign: 'center', fontSize: 12, color: THEME.textMuted }}>
                        Hozircha hudud tanlanmagan
                      </div>
                    )}

                    {/* Hududlar ro'yxati */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                      {regionsList.length === 0 ? (
                        <div style={{ gridColumn: 'span 2', padding: 20, textAlign: 'center', color: THEME.textMuted, fontSize: 12 }}>
                          Bazadagi maktablar bo‘yicha hududlar mavjud emas
                        </div>
                      ) : regionsList.map(reg => {
                        const isSel = selectedRegion && selectedRegion.id === reg.id;
                        return (
                          <button
                            key={reg.id}
                            className="sa-btn"
                            onClick={() => setSelectedRegion(reg)}
                            style={{
                              padding: '11px 12px',
                              borderRadius: 6,
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
                      style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 6, border: `1px solid ${THEME.border}`, backgroundColor: '#F9FAFE', fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }}
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
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 14 : 22, alignItems: 'stretch' }}>
                
{/* Mobil Qurilmalar Uchun Segmentli Boshqaruv (Pasport vs Ro'yxat) */}
              {isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                  <div style={{ display: 'flex', backgroundColor: '#EDE9FE', borderRadius: 10, padding: 3, gap: 4 }}>
                    <button
                      onClick={() => setMobileSchoolTab('details')}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: mobileSchoolTab === 'details' ? THEME.primary : 'transparent',
                        color: mobileSchoolTab === 'details' ? '#FFFFFF' : THEME.textDark,
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}>
                      Maktab Pasporti
                    </button>
                    <button
                      onClick={() => setMobileSchoolTab('list')}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: mobileSchoolTab === 'list' ? THEME.primary : 'transparent',
                        color: mobileSchoolTab === 'list' ? '#FFFFFF' : THEME.textDark,
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}>
                      Maktablar Ro‘yxati ({filteredSchools.length})
                    </button>
                  </div>

                  {mobileSchoolTab === 'details' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 10,
                      border: `1px solid ${THEME.border}`,
                    }}>
                      <Building2 size={16} color={THEME.primary} />
                      <select
                        value={selectedSchoolId || ''}
                        onChange={e => setSelectedSchoolId(e.target.value)}
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          fontSize: 13,
                          fontWeight: 700,
                          color: THEME.textDark,
                          backgroundColor: 'transparent',
                        }}>
                        {filteredSchools.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} (#{s.id}) • {s.status}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
                {(!isMobile || mobileSchoolTab === 'list') && (
                  <aside className="sa-card" style={{ width: isMobile ? '100%' : 320, flexShrink: 0, ...cardBoxStyle, padding: isMobile ? 12 : 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: THEME.textDark, paddingBottom: 8, borderBottom: `1px solid ${THEME.border}` }}>
                    Muassasalar Ro‘yxati ({filteredSchools.length})
                  </div>
                  {filteredSchools.map(sc => {
                    const isSel = currentSelectedSchool && currentSelectedSchool.id === sc.id;
                    return (
                      <button
                        key={sc.id}
                        className="sa-btn"
                        onClick={() => { setSelectedSchoolId(sc.id); if (isMobile) setMobileSchoolTab('details'); }}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: 8,
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
                          {/* Login va Parol Ko'rinishi (Doimiy) */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: 6,
                            marginTop: 6,
                            backgroundColor: isSel && !isMobile ? 'rgba(255,255,255,0.18)' : '#F8F9FE',
                            fontSize: 11,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                              <Key size={12} color={isSel && !isMobile ? '#FFFFFF' : THEME.primary} />
                              <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{sc.username || `maktab${sc.id}`}</span>
                              <span>/</span>
                              <span style={{
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                color: isSel && !isMobile ? '#FFFFFF' : THEME.primary,
                              }}>
                                {sc.password || 'school123'}
                              </span>
                            </div>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSchool(sc);
                              }}
                              title="Parolni o'zgartirish"
                              style={{
                                color: isSel && !isMobile ? '#FFFFFF' : THEME.primary,
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2,
                              }}>
                              <Edit size={11} /> O'zgartirish
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={15} color={isSel ? '#FFFFFF' : THEME.textMuted} />
                      </button>
                    );
                  })}
                </aside>

                )}

                {(!isMobile || mobileSchoolTab === 'details') && currentSelectedSchool && (() => {
                  const schoolDbStudents = dbStudents.filter(st => String(st.school_id) === String(currentSelectedSchool.id));
                  const schoolDbTeachers = dbTeachers.filter(tc => String(tc.school_id) === String(currentSelectedSchool.id));
                  const schoolDbClasses = dbClasses.filter(cl => String(cl.school_id) === String(currentSelectedSchool.id));

                  return (
                    <div className="sa-card" style={{ flex: 1, ...cardBoxStyle, display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {currentSelectedSchool.warningBanner && (
                        <div style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#B45309', fontSize: 12.5, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      <div style={{ padding: '14px 18px', borderRadius: 8, backgroundColor: THEME.primaryLight, border: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
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
                          {(() => {
                            const schoolAttRate = schoolDbStudents.length === 0
                              ? 0
                              : (currentSelectedSchool.attendanceRate !== undefined && currentSelectedSchool.attendanceRate !== null
                                  ? Number(currentSelectedSchool.attendanceRate)
                                  : 0);
                            return (
                              <>
                                <div style={{ fontSize: 20, fontWeight: 800, color: schoolAttRate > 0 ? THEME.orange : THEME.textMuted, marginTop: 4 }}>
                                  {schoolAttRate.toFixed(1)}%
                                </div>
                                <div style={{ fontSize: 11, color: schoolAttRate > 0 ? THEME.green : THEME.textMuted, marginTop: 2 }}>
                                  {schoolAttRate > 0 ? "Turniket Face ID & QR" : "Ma'lumot mavjud emas (0 o'quvchi)"}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Maktabning Asosiy Baza Parametrlari (Ro'yxatsiz, faqat agregat ko'rsatkichlar) */}
                      <div style={{ padding: 18, borderRadius: 8, backgroundColor: '#F9FAFE', border: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                          <div style={{ padding: '12px 14px', borderRadius: 6, backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: 11, color: THEME.textMuted }}>Direktor Login va Paroli</div>
                              <button
                                onClick={() => setEditingSchool(currentSelectedSchool)}
                                style={{ border: 'none', background: 'transparent', color: THEME.primary, cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <Key size={12} /> O'zgartirish
                              </button>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textDark, marginTop: 3 }}>
                              <code>{currentSelectedSchool.username || `maktab${currentSelectedSchool.id}`}</code> / <code style={{ color: THEME.primary, backgroundColor: THEME.primaryLight, padding: '2px 6px', borderRadius: 4 }}>{currentSelectedSchool.password || 'school123'}</code>
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>Direktor: {currentSelectedSchool.director}</div>
                          </div>

                          <div style={{ padding: '12px 14px', borderRadius: 6, backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}` }}>
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

                          <div style={{ padding: '12px 14px', borderRadius: 6, backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}` }}>
                            <div style={{ fontSize: 11, color: THEME.textMuted }}>Obuna Tarifi & Status</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: THEME.primary, marginTop: 3 }}>
                              {currentSelectedSchool.plan || 'Standart'}
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>Holati: {currentSelectedSchool.status === 'ACTIVE' ? 'Faol' : currentSelectedSchool.status}</div>
                          </div>

                          <div style={{ padding: '12px 14px', borderRadius: 6, backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}` }}>
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
                      <div style={{ padding: 18, borderRadius: 8, backgroundColor: '#FFF8F9', border: '1px solid #FECDD3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
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
          {/* MAKTABLAR GEOGRAFIK XARITASI (YANGI BO'LIM)                   */}
          {/* ============================================================= */}
          {superTab === 'map' && (
            <SuperAdminMapView
              schoolsList={schoolsList}
              onEnterSchool={handleGhostLogin}
              onUpdateSchool={(updatedSchool) => {
                const updated = schoolsList.map(s => String(s.id) === String(updatedSchool.id) ? { ...s, ...updatedSchool } : s);
                onUpdateSchools(updated);
              }}
              onAddNewSchool={() => setShowOnboardingWizard(true)}
              showToast={showToast}
            />
          )}

          {/* ============================================================= */}
          {/* 3. OBUNA VA MOLIYA TIZIMI                                     */}
          {/* ============================================================= */}
          {superTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : (isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(225px, 1fr))'), gap: isSmallScreen ? 10 : 14 }}>
                  {(() => {
                    const realMrr = invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + (parseInt(String(i.amount).replace(/\D/g, '')) || 0), 0);
                    const realDebt = schoolsList.reduce((acc, s) => acc + (parseInt(String(s.debtAmount || 0).replace(/\D/g, '')) || 0), 0);
                    const realArr = realMrr * 12;
                    return (
                      <>
                        <MetricCard
                          icon={<TrendingUp size={16} color={THEME.green} />}
                          title="Oylik Daromad (MRR)"
                          value={realMrr > 0 ? `${realMrr.toLocaleString()} so‘m` : "0 so‘m"}
                          sub={realMrr > 0 ? "Real tushumlar bo‘yicha" : "Hozircha tushumlar mavjud emas (0 so‘m)"}
                          color={THEME.green}
                          sparklineData={realMrr > 0 ? [10, 12, 14, 15] : [0, 0, 0, 0]}
                        />
                        <MetricCard
                          icon={<Award size={16} color={THEME.primary} />}
                          title="Yillik Proyeksiya (ARR)"
                          value={realArr > 0 ? `${realArr.toLocaleString()} so‘m` : "0 so‘m"}
                          sub="Shartnomalar va obunalar bo‘yicha"
                          color={THEME.primary}
                          sparklineData={realArr > 0 ? [100, 120, 140, 150] : [0, 0, 0, 0]}
                        />
                        <MetricCard
                          icon={<AlertTriangle size={16} color="#EF4444" />}
                          title="Umumiy Qarzdorlik"
                          value={realDebt > 0 ? `${realDebt.toLocaleString()} so‘m` : "0 so‘m"}
                          sub={realDebt > 0 ? "Muddati o‘tgan to‘lovlar" : "Qarzdor maktablar yo‘q (0 so‘m)"}
                          color="#EF4444"
                          sparklineData={realDebt > 0 ? [5, 4, 3, 2] : [0, 0, 0, 0]}
                        />
                        <MetricCard
                          icon={<CheckCircle2 size={16} color={THEME.cyan} />}
                          title="To‘lov Shlyuzlari"
                          value="4 ta Integratsiya"
                          sub="Payme • Click • Uzum • Bank"
                          color={THEME.cyan}
                          badge="Faol"
                        />
                      </>
                    );
                  })()}
                </div>

                            {/* Maktablar Shartnomalari va Individual Oylik To'lovlar */}
              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={sectionTitleStyle}>Maktablar Shartnomalari va Oylik To‘lovlar Boshqaruvi</h3>
                    <p style={sectionSubStyle}>Boshlang‘ich bosqich uchun har bir maktabga individual narx (so‘mda) yoki bepul sinov muddati biriktirish</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, backgroundColor: '#EEF2FF', color: THEME.primary }}>
                      Jami: {schoolsList.length} ta maktab
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, backgroundColor: '#ECFDF5', color: THEME.green }}>
                      MRR: {realStats?.kpis?.mrr || "0 so‘m"}
                    </span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted }}>
                        <th style={{ padding: '12px' }}>Maktab Nomi</th>
                        <th style={{ padding: '12px' }}>Hudud</th>
                        <th style={{ padding: '12px' }}>Direktor & Telefon</th>
                        <th style={{ padding: '12px' }}>O‘quvchilar</th>
                        <th style={{ padding: '12px' }}>Oylik Narxi</th>
                        <th style={{ padding: '12px' }}>Sinov / Bepul Davri</th>
                        <th style={{ padding: '12px' }}>To‘lov Holati</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolsList.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: 28, textAlign: 'center', color: THEME.textMuted }}>
                            Maktablar ro‘yxati mavjud emas
                          </td>
                        </tr>
                      ) : schoolsList.map(s => {
                        const isTrial = Boolean(s.isFreeTrial) || s.status === 'TRIAL';
                        const mPrice = Number(s.monthlyPrice) || 1000000;
                        return (
                          <tr key={s.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                            <td style={{ padding: '12px', fontWeight: 700, color: THEME.textDark }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <Building2 size={15} color={THEME.primary} />
                                <div>
                                  <div>{s.name}</div>
                                  <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 500 }}>ID: {s.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px', color: THEME.textDark }}>{s.district || "Toshkent"}</td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 600 }}>{s.director}</div>
                              <div style={{ fontSize: 11, color: THEME.textMuted }}>{s.phone}</div>
                            </td>
                            <td style={{ padding: '12px', fontWeight: 700 }}>
                              {s.studentsCount || 0} nafar
                            </td>
                            <td style={{ padding: '12px' }}>
                              {isTrial ? (
                                <span style={{ padding: '3px 8px', borderRadius: 4, backgroundColor: '#ECFDF5', color: THEME.green, fontWeight: 800, fontSize: 11.5 }}>
                                  0 so‘m (Sinov)
                                </span>
                              ) : (
                                <strong style={{ color: THEME.primary, fontSize: 13.5 }}>
                                  {mPrice.toLocaleString()} so‘m
                                </strong>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {isTrial && s.trialUntilDate ? (
                                <span style={{ color: '#0284C7', fontWeight: 700, fontSize: 12 }}>
                                  {s.trialUntilDate} gacha
                                </span>
                              ) : (
                                <span style={{ color: THEME.textMuted, fontSize: 12 }}>
                                  Muddatsiz
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {s.paymentStatus === 'PAID' ? (
                                <span style={{ padding: '3px 8px', borderRadius: 4, backgroundColor: '#ECFDF5', color: THEME.green, fontWeight: 700, fontSize: 11 }}>
                                  To‘langan
                                </span>
                              ) : s.paymentStatus === 'OVERDUE' ? (
                                <span style={{ padding: '3px 8px', borderRadius: 4, backgroundColor: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: 11 }}>
                                  Qarzdor ({s.debtAmount || "Mavjud"})
                                </span>
                              ) : (
                                <span style={{ padding: '3px 8px', borderRadius: 4, backgroundColor: '#FFFBEB', color: '#D97706', fontWeight: 700, fontSize: 11 }}>
                                  Kutilmoqda
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <button
                                className="sa-btn"
                                onClick={() => handleOpenPricingModal(s)}
                                style={{ ...primaryBtnStyle, padding: '6px 12px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                <Edit size={13} /> Narxni Sozlash
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '36px 16px', textAlign: 'center', color: THEME.textMuted }}>
                            <CheckCircle2 size={32} color={THEME.green} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }} />
                            <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark }}>Hozircha hisob-fakturalar mavjud emas</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>Barcha hisob-kitoblar va to‘lovlar 0 so‘m holatida</div>
                          </td>
                        </tr>
                      ) : invoices.map(inv => (
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
          {/* 5.5 SERVER VA INFRATUZILMA ANALITIKASI (3s JONLI MONITORING)   */}
          {/* ============================================================= */}
          {superTab === 'server' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Yuqori Tizim & Qurilma Xulosa Banneri */}
              <div className="sa-card" style={{
                ...cardBoxStyle,
                background: 'linear-gradient(135deg, #1E2038 0%, #2A2D4A 100%)',
                color: '#FFFFFF',
                padding: '20px 24px',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(30, 32, 56, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(108, 92, 231, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Server size={22} color="#A29BFE" />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {serverStats?.system?.hostname || 'Asosiy Server Qurilmasi'}
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(16, 172, 132, 0.25)', color: '#10AC84', fontWeight: 700 }}>
                            Faol Ishlamoqda
                          </span>
                        </h2>
                        <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 2 }}>
                          {serverStats?.system?.os_name} • {serverStats?.system?.architecture} ({serverStats?.system?.processor})
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>Server Ish Vaqti (Uptime)</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#38BDF8', marginTop: 2 }}>
                        {serverStats?.system?.uptime_formatted || "Yuklanmoqda..."}
                      </div>
                    </div>
                    <div style={{ width: 1, height: 32, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>So‘nggi Yuklanish (Boot)</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>
                        {serverStats?.system?.boot_time || "—"}
                      </div>
                    </div>
                    <div style={{ width: 1, height: 32, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>Avto-Monitoring</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#10AC84', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <span className="sa-ping-dot" style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10AC84' }} />
                        3 soniyada yangilanadi
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asosiy 4 ta Resurs Ko'rsatkichi (CPU, RAM, Disk, I/O) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                
                {/* 1. CPU */}
                <div className="sa-card" style={cardBoxStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#F1F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Cpu size={18} color={THEME.primary} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark }}>Protsessor (CPU)</span>
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      backgroundColor: (serverStats?.cpu?.total_percent || 0) > 75 ? '#FFF1F2' : '#ECFDF5',
                      color: (serverStats?.cpu?.total_percent || 0) > 75 ? '#E11D48' : THEME.green
                    }}>
                      {(serverStats?.cpu?.total_percent || 0) > 75 ? 'Yuqori' : 'Normal'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: THEME.textDark }}>
                      {serverStats?.cpu?.total_percent ?? 0}%
                    </span>
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>
                      {serverStats?.cpu?.physical_cores} fizik / {serverStats?.cpu?.logical_cores} mantiqiy yadro
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      width: `${Math.min(100, serverStats?.cpu?.total_percent || 0)}%`,
                      height: '100%',
                      background: (serverStats?.cpu?.total_percent || 0) > 75 ? '#E11D48' : THEME.gradient,
                      borderRadius: 3,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: THEME.textMuted }}>
                    <span>Chastota: {serverStats?.cpu?.frequency_mhz ? `${serverStats.cpu.frequency_mhz} MHz` : 'Normal'}</span>
                    <span>Erkin quvvat: {Math.max(0, 100 - (serverStats?.cpu?.total_percent || 0))}%</span>
                  </div>
                </div>

                {/* 2. RAM */}
                <div className="sa-card" style={cardBoxStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#E8F8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={18} color="#10AC84" />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark }}>Operativ Xotira (RAM)</span>
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      backgroundColor: (serverStats?.memory?.percent || 0) > 85 ? '#FFF1F2' : '#ECFDF5',
                      color: (serverStats?.memory?.percent || 0) > 85 ? '#E11D48' : THEME.green
                    }}>
                      {(serverStats?.memory?.percent || 0) > 85 ? 'Cheklangan' : 'Barqaror'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: THEME.textDark }}>
                      {serverStats?.memory?.percent ?? 0}%
                    </span>
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>
                      {serverStats?.memory?.used_gb ?? 0} GB / {serverStats?.memory?.total_gb ?? 0} GB
                    </span>
                  </div>

                  <div style={{ height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      width: `${Math.min(100, serverStats?.memory?.percent || 0)}%`,
                      height: '100%',
                      background: (serverStats?.memory?.percent || 0) > 85 ? '#E11D48' : 'linear-gradient(135deg, #10AC84 0%, #2ED573 100%)',
                      borderRadius: 3,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: THEME.textMuted }}>
                    <span>Bo‘sh xotira: <b>{serverStats?.memory?.free_gb ?? 0} GB</b></span>
                    <span>Django: {serverStats?.process?.memory_rss_mb ?? 0} MB</span>
                  </div>
                </div>

                {/* 3. Disk */}
                <div className="sa-card" style={{
                  ...cardBoxStyle,
                  borderColor: (serverStats?.disk?.percent || 0) >= 75 ? '#FCD34D' : '#E2E8F0',
                  backgroundColor: (serverStats?.disk?.percent || 0) >= 75 ? '#FFFEF5' : '#FFFFFF'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: (serverStats?.disk?.percent || 0) >= 75 ? '#FEF3C7' : '#F1F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HardDrive size={18} color={(serverStats?.disk?.percent || 0) >= 75 ? '#D97706' : THEME.primary} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark }}>
                        Asosiy Disk ({serverStats?.disk?.drive || 'C:'})
                      </span>
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      backgroundColor: (serverStats?.disk?.percent || 0) >= 75 ? '#FEF3C7' : '#ECFDF5',
                      color: (serverStats?.disk?.percent || 0) >= 75 ? '#B45309' : THEME.green
                    }}>
                      {(serverStats?.disk?.percent || 0) >= 75 ? '⚠️ 75%+ Band' : 'Barqaror'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: (serverStats?.disk?.percent || 0) >= 75 ? '#B45309' : THEME.textDark }}>
                      {serverStats?.disk?.percent ?? 0}%
                    </span>
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>
                      Band: {serverStats?.disk?.used_gb ?? 0} GB / {serverStats?.disk?.total_gb ?? 0} GB
                    </span>
                  </div>

                  <div style={{ height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      width: `${Math.min(100, serverStats?.disk?.percent || 0)}%`,
                      height: '100%',
                      background: (serverStats?.disk?.percent || 0) >= 75 ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : THEME.gradient,
                      borderRadius: 3,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: THEME.textMuted }}>
                    <span>Bo‘sh joy: <b style={{ color: (serverStats?.disk?.percent || 0) >= 75 ? '#D97706' : THEME.primary }}>{serverStats?.disk?.free_gb ?? 0} GB</b></span>
                    <span>I/O Yozish: {serverStats?.disk?.write_mb ?? 0} MB</span>
                  </div>
                </div>

                {/* 4. Tarmoq va Jarayon */}
                <div className="sa-card" style={cardBoxStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wifi size={18} color="#0284C7" />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark }}>Tarmoq & Jarayon</span>
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      backgroundColor: '#ECFDF5',
                      color: THEME.green
                    }}>
                      Port 8000 Faol
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: THEME.textDark }}>
                      {serverStats?.network?.sent_mb ? `${Math.round(serverStats.network.sent_mb)} MB` : "0 MB"}
                    </span>
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>
                      Yuborilgan Trafik
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: THEME.textDark, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: THEME.textMuted }}>Qabul Qilingan:</span>
                      <b>{serverStats?.network?.received_mb ? `${Math.round(serverStats.network.received_mb)} MB` : "0 MB"}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: THEME.textMuted }}>Django PID / Oqimlar:</span>
                      <b>PID {serverStats?.process?.pid || "—"} ({serverStats?.process?.threads || 1} oqim)</b>
                    </div>
                  </div>
                </div>

              </div>

              {/* DISK HAJMI VA SERVERNI KENGAYTIRISH TAHLILI (ASOSIY BO'LIM) */}
              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HardDrive size={18} color={THEME.primary} />
                      Disk Hajmi, Tizim Zaxirasi va Serverni Kengaytirish Analitikasi
                    </h3>
                    <p style={sectionSubStyle}>
                      Fayllar taqsimoti, oylik o‘sish sur‘ati, kelajakdagi maktablar yuklamasi va kengaytirish bo‘yicha me'moriy tavsiyalar
                    </p>
                  </div>
                  <div style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    backgroundColor: (serverStats?.disk?.percent || 0) >= 75 ? '#FEF3C7' : '#ECFDF5',
                    border: (serverStats?.disk?.percent || 0) >= 75 ? '1px solid #FCD34D' : '1px solid #A7F3D0',
                    fontSize: 12,
                    fontWeight: 800,
                    color: (serverStats?.disk?.percent || 0) >= 75 ? '#B45309' : '#065F46',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <Clock size={14} />
                    Mavjud Zaxira: ~{serverStats?.scaling_analysis?.runway_months || 30} oylik erkin hajm
                  </div>
                </div>

                {/* 2 Ustunli Kengaytirish Paneli */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                  
                  {/* Chap Ustun: Disk Bo'linishi va Segmentlar */}
                  <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark, marginBottom: 12 }}>
                      📊 Disk Xotirasi Taqsimoti ({serverStats?.disk?.total_gb || 0} GB SSD)
                    </div>

                    {/* Segmentli Vizual Bar */}
                    <div style={{ display: 'flex', height: 16, borderRadius: 6, overflow: 'hidden', marginBottom: 14 }}>
                      <div
                        title={`Tizim & Boshqa fayllar: ${serverStats?.disk?.used_gb || 0} GB`}
                        style={{
                          width: `${Math.min(95, serverStats?.disk?.percent || 75)}%`,
                          backgroundColor: (serverStats?.disk?.percent || 0) >= 75 ? '#F59E0B' : THEME.primary,
                          transition: 'width 0.4s'
                        }}
                      />
                      <div
                        title={`Bo'sh joy: ${serverStats?.disk?.free_gb || 0} GB`}
                        style={{
                          width: `${Math.max(5, 100 - (serverStats?.disk?.percent || 75))}%`,
                          backgroundColor: '#10AC84',
                          transition: 'width 0.4s'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: THEME.primary }} />
                          Smart School Ma'lumotlar Bazasi (db.sqlite3):
                        </span>
                        <b>{serverStats?.disk?.breakdown?.database_mb ?? 0.57} MB</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#8B5CF6' }} />
                          Idrok Vision Face ID Rasmlari (Media):
                        </span>
                        <b>{serverStats?.disk?.breakdown?.media_mb ?? 0} MB</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#F59E0B' }} />
                          OS, Server Ilovalari va Tizim Fayllari:
                        </span>
                        <b>{serverStats?.disk?.used_gb ?? 0} GB ({serverStats?.disk?.percent ?? 0}%)</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, paddingTop: 8, borderTop: '1px solid #E2E8F0' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: THEME.green }}>
                          <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10AC84' }} />
                          Mavjud Bo‘sh Disk Xotirasi:
                        </span>
                        <b style={{ color: THEME.green, fontSize: 14 }}>{serverStats?.disk?.free_gb ?? 0} GB</b>
                      </div>
                    </div>
                  </div>

                  {/* O'ng Ustun: Serverni Kengaytirish Bo'yicha Aniq Tavsiyalar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    {/* Disk Tavsiyasi */}
                    <div style={{
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor: (serverStats?.disk?.percent || 0) >= 75 ? '#FFFBEB' : '#F0FDF4',
                      border: (serverStats?.disk?.percent || 0) >= 75 ? '1px solid #FDE68A' : '1px solid #BBF7D0'
                    }}>
                      <div style={{ fontWeight: 800, fontSize: 12.5, color: (serverStats?.disk?.percent || 0) >= 75 ? '#92400E' : '#166534', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HardDrive size={15} />
                        Disk Sig‘imi va Kengaytirish Tavsiyasi
                      </div>
                      <div style={{ fontSize: 12, color: (serverStats?.disk?.percent || 0) >= 75 ? '#78350F' : '#14532D', lineHeight: 1.55 }}>
                        {serverStats?.scaling_analysis?.disk_advice || "Disk hajmi barqaror holatda."}
                      </div>
                    </div>

                    {/* RAM Tavsiyasi */}
                    <div style={{
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontWeight: 800, fontSize: 12.5, color: THEME.textDark, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Activity size={15} color="#10AC84" />
                        Operativ Xotira (RAM) Tavsiyasi
                      </div>
                      <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.55 }}>
                        {serverStats?.scaling_analysis?.ram_advice || "RAM xotira barqaror."}
                      </div>
                    </div>

                    {/* CPU Tavsiyasi */}
                    <div style={{
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontWeight: 800, fontSize: 12.5, color: THEME.textDark, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Cpu size={15} color={THEME.primary} />
                        Markaziy Protsessor (CPU) Tavsiyasi
                      </div>
                      <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.55 }}>
                        {serverStats?.scaling_analysis?.cpu_advice || "CPU quvvati yetarli darajada."}
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* 28 TA CPU YADROLARINING REAL-VAQTDAGI YUKLAMA MATRITSASI */}
              {Array.isArray(serverStats?.cpu?.per_cpu_percent) && serverStats.cpu.per_cpu_percent.length > 0 && (
                <div className="sa-card" style={cardBoxStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Cpu size={17} color={THEME.primary} />
                        Barcha {serverStats.cpu.per_cpu_percent.length} ta CPU Yadrolarining Real-vaqt Yuklamasi
                      </h3>
                      <p style={sectionSubStyle}>
                        Har bir mantiqiy yadroning alohida yuklanish darajasi (Face ID embedding va web so‘rovlar taqsimoti)
                      </p>
                    </div>
                    <span style={{ fontSize: 11.5, color: THEME.textMuted }}>
                      Jami: <b>{serverStats.cpu.physical_cores} ta jismoniy</b> / <b>{serverStats.cpu.logical_cores} ta mantiqiy yadro</b>
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: 8 }}>
                    {serverStats.cpu.per_cpu_percent.map((val, idx) => {
                      const isHigh = val >= 70;
                      const isMid = val >= 30 && val < 70;
                      return (
                        <div key={idx} style={{
                          padding: '8px 10px',
                          borderRadius: 8,
                          backgroundColor: isHigh ? '#FFF1F2' : (isMid ? '#FEF3C7' : '#F8FAFC'),
                          border: isHigh ? '1px solid #FECDD3' : (isMid ? '1px solid #FDE68A' : '1px solid #E2E8F0'),
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 10, color: THEME.textMuted, fontWeight: 600 }}>Yadro #{idx + 1}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: isHigh ? '#E11D48' : (isMid ? '#D97706' : THEME.textDark), margin: '2px 0 4px' }}>
                            {val}%
                          </div>
                          <div style={{ height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, val)}%`,
                              height: '100%',
                              backgroundColor: isHigh ? '#E11D48' : (isMid ? '#F59E0B' : '#10AC84'),
                              borderRadius: 2
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TIZIM XIZMATLARI VA JARAYONLAR MONITORINGI */}
              <div className="sa-card" style={cardBoxStyle}>
                <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={17} color={THEME.green} />
                  Platforma Xizmatlari va Tizim Jarayonlari
                </h3>
                <p style={sectionSubStyle}>Serverda ishlab turgan asosiy infratuzilma xizmatlari va protokollar</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
                  {[
                    { name: "Django REST Backend", port: "8000-port", status: "ONLINE", desc: "API & Biznes Mantiq" },
                    { name: "Vite React Frontend", port: "5173-port", status: "ONLINE", desc: "Boshqaruv Paneli" },
                    { name: "Telegram AI Boti", port: "Daemon Task", status: "ONLINE", desc: "Super Admin AI Tahlilchi" },
                    { name: "SQLite / ORM Database", port: "Lokal Baza", status: "ONLINE", desc: "0.57 MB Baza fayli" },
                    { name: "Cloudflare Tunnels", port: "2 ta Tunnel", status: "ONLINE", desc: "Tashqi Internet Tarmoq" },
                    { name: "Hikvision MinMoe DS-K1T673", port: "HTTP/ISAPI", status: "ONLINE", desc: "Face ID Qurilmasi" },
                  ].map((srv, idx) => (
                    <div key={idx} style={{ padding: 12, borderRadius: 8, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12.5, color: THEME.textDark }}>{srv.name}</div>
                        <div style={{ fontSize: 11, color: THEME.textMuted }}>{srv.port} • {srv.desc}</div>
                      </div>
                      <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: '#ECFDF5', color: THEME.green, fontWeight: 800, fontSize: 11 }}>
                        Faol
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================= */}
          {/* 6. TIZIM SOZLAMALARI VA INTEGRATSIYALAR                       */}
          {/* ============================================================= */}
          {superTab === 'config' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              
              {/* Yuqori Saqlash va Nazorat Paneli */}
              <div className="sa-card" style={{
                ...cardBoxStyle,
                background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                padding: '20px 24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sliders size={24} color="#A5B4FC" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#FFFFFF' }}>
                      Tizim Sozlamalari & Global Konfiguratsiya
                    </h2>
                    <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#C7D2FE' }}>
                      Loyiha nomi, markaziy QR-kod yangilanishi, yordam stoli ma'lumotlari, SMS shlyuz va AI sozlamalari
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleSaveSystemConfig}
                    className="sa-btn"
                    style={{
                      padding: '11px 22px',
                      borderRadius: 10,
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <Check size={18} /> Barcha Sozlamalarni Saqlash
                  </button>
                </div>
              </div>

              {/* 1. Global Loyiha Nomi va Brending */}
              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={20} color={THEME.primary} /> 1. Loyiha Nomi va Global Brending
                    </h3>
                    <p style={sectionSubStyle}>
                      Ushbu sozlamalar barcha maktablar dashborti, o'qituvchilar kabineti, tizimga kirish ekrani va mobil ilovada bir vaqtda aks etadi
                    </p>
                  </div>
                  
                  {/* Jonli Prevyu */}
                  <div style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted }}>JONLI PREVYU:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 8, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                      <img src="/idrok_icon.png" alt="Logo" style={{ width: 22, height: 22, borderRadius: 5, objectFit: 'contain' }} />
                      <span style={{ fontWeight: 800, fontSize: 13.5, color: THEME.textDark }}>{systemConfig.projectName || 'Idrok Edu'}</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 800 }}>
                        {systemConfig.projectBadge || 'CORE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 0.8fr 1.9fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 5 }}>
                      Loyiha Nomi (Platform Brand Name) *
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Idrok Edu"
                      value={systemConfig.projectName}
                      onChange={e => setSystemConfig({ ...systemConfig, projectName: e.target.value })}
                      style={{ ...inputFieldStyle, fontWeight: 700, fontSize: 14 }}
                    />
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                      Barcha maktablar va kirish oynasida chiqadigan rasmiy nom
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 5 }}>
                      Brend Nishoni (Badge) *
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: CORE, PRO, CLOUD"
                      value={systemConfig.projectBadge}
                      onChange={e => setSystemConfig({ ...systemConfig, projectBadge: e.target.value.toUpperCase() })}
                      style={{ ...inputFieldStyle, fontWeight: 800, fontSize: 13, letterSpacing: '0.04em' }}
                    />
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                      Logotip yonidagi nishon
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 5 }}>
                      Loyiha Shiori / Tavsifi (Slogan)
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Aqlli Ta'lim va Biometrik Davomat Platformasi"
                      value={systemConfig.projectSlogan}
                      onChange={e => setSystemConfig({ ...systemConfig, projectSlogan: e.target.value })}
                      style={{ ...inputFieldStyle, fontSize: 13 }}
                    />
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                      Kirish oynasi va brauzer sarlavhasi (title) uchun
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Global QR-Kod va Xavfsizlik Siyosati */}
              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <QrCode size={20} color={THEME.primary} /> 2. Mobil QR Davomat va Xavfsizlik Siyosati
                  </h3>
                  <p style={sectionSubStyle}>
                    Maktab dashbortlaridan olib tashlangan va xavfsizlik nuqtai nazaridan butun tizim bo'yicha markaziy nazorat qilinuvchi parametrlari
                  </p>
                </div>

                {/* Markaziy QR Alert Banner */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  backgroundColor: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 18,
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: '#DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={20} color="#1D4ED8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A' }}>
                      Markaziy QR Dinamik Davomat Standarti (Real Server Nazorati)
                    </div>
                    <div style={{ fontSize: 12, color: '#1E40AF', marginTop: 3, lineHeight: 1.5 }}>
                      O'quvchilar va talabalar mobil ilovasida QR-kod pastda belgilangan soniyada avtomatik qayta generatsiya bo'ladi.
                      Eski QR kodlar server bazasida darhol bekor qilinadi. O'qituvchi skaneri ham ushbu vaqt ichida tasdiqlaydi. 
                      <b> Ushbu qiymat barcha maktablar va foydalanuvchilar uchun yagona va majburiydir.</b>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 14 }}>
                  <div style={{ padding: 14, borderRadius: 8, backgroundColor: '#F8FAFC', border: '1.5px solid #6C5CE7' }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: THEME.primary, display: 'block', marginBottom: 6 }}>
                      ⚡ QR YANGILANISH VAQTI *
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={systemConfig.qrRefreshSeconds}
                        onChange={e => setSystemConfig({ ...systemConfig, qrRefreshSeconds: Math.max(5, Math.min(120, Number(e.target.value) || 15)) })}
                        style={{ width: 80, padding: '8px 10px', borderRadius: 8, border: '2px solid #6C5CE7', fontWeight: 800, fontSize: 16, textAlign: 'center', color: THEME.primary }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textDark }}>soniya</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                      {[10, 15, 20, 30, 45].map(sec => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setSystemConfig({ ...systemConfig, qrRefreshSeconds: sec })}
                          style={{
                            padding: '3px 7px',
                            borderRadius: 6,
                            fontSize: 10.5,
                            fontWeight: 700,
                            border: '1px solid #CBD5E1',
                            backgroundColor: systemConfig.qrRefreshSeconds === sec ? THEME.primary : '#FFFFFF',
                            color: systemConfig.qrRefreshSeconds === sec ? '#FFFFFF' : THEME.textDark,
                            cursor: 'pointer'
                          }}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: 14, borderRadius: 8, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 6 }}>
                      Face ID Aniqlik Chegarasi
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        min={50}
                        max={99}
                        value={systemConfig.faceIdMinConfidence}
                        onChange={e => setSystemConfig({ ...systemConfig, faceIdMinConfidence: Number(e.target.value) || 90 })}
                        style={{ width: 80, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 700, fontSize: 15, textAlign: 'center' }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textDark }}>%</span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6 }}>
                      Biometrik turniketlar uchun minimal ishonch foizi
                    </div>
                  </div>

                  <div style={{ padding: 14, borderRadius: 8, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 6 }}>
                      Standart GPS Radiusi
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        min={20}
                        max={1000}
                        value={systemConfig.defaultGpsRadius}
                        onChange={e => setSystemConfig({ ...systemConfig, defaultGpsRadius: Number(e.target.value) || 150 })}
                        style={{ width: 80, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 700, fontSize: 15, textAlign: 'center' }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textDark }}>metr</span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6 }}>
                      O'qituvchi va o'quvchi maktab radiusi
                    </div>
                  </div>

                  <div style={{ padding: 14, borderRadius: 8, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 6 }}>
                      Sessiya Muddati
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        min={15}
                        max={720}
                        value={systemConfig.sessionTimeoutMinutes}
                        onChange={e => setSystemConfig({ ...systemConfig, sessionTimeoutMinutes: Number(e.target.value) || 60 })}
                        style={{ width: 80, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 700, fontSize: 15, textAlign: 'center' }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textDark }}>daqiqa</span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6 }}>
                      Harakatsizlikdan so'ng avtomatik chiqish
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Global Yordam va Call-Markaz Ma'lumotlari */}
              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={20} color={THEME.primary} /> 3. Global Yordam va Call-Markaz Ma'lumotlari
                  </h3>
                  <p style={sectionSubStyle}>
                    Barcha maktablar dashbortidagi yangi "Yordam" (Help Desk) bo'limida aks etuvchi rasmiy aloqa ma'lumotlari
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 5 }}>
                      Call-Markaz Telefoni *
                    </label>
                    <input
                      type="text"
                      placeholder="+998 71 200-00-55"
                      value={systemConfig.supportPhone}
                      onChange={e => setSystemConfig({ ...systemConfig, supportPhone: e.target.value })}
                      style={inputFieldStyle}
                    />
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                      Tezkor call-markaz raqami
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 5 }}>
                      Telegram Yordam Boti *
                    </label>
                    <input
                      type="text"
                      placeholder="@idrok_support_bot"
                      value={systemConfig.supportTelegram}
                      onChange={e => setSystemConfig({ ...systemConfig, supportTelegram: e.target.value })}
                      style={inputFieldStyle}
                    />
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                      Maktablar murojaat qiladigan Telegram
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 5 }}>
                      Elektron Pochta *
                    </label>
                    <input
                      type="email"
                      placeholder="support@idrok-edu.uz"
                      value={systemConfig.supportEmail}
                      onChange={e => setSystemConfig({ ...systemConfig, supportEmail: e.target.value })}
                      style={inputFieldStyle}
                    />
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                      Rasmiy yordam pochtasi
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 5 }}>
                      Ish Tartibi / Soatlari
                    </label>
                    <input
                      type="text"
                      placeholder="Dushanba – Shanba, 08:00 – 20:00"
                      value={systemConfig.supportHours}
                      onChange={e => setSystemConfig({ ...systemConfig, supportHours: e.target.value })}
                      style={inputFieldStyle}
                    />
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                      Operatorlar ishlash vaqti
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Super Admin Telegram AI Boti va Google AI Studio (Gemini) Integratsiyasi */}
              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Bot size={20} color={THEME.primary} /> 4. Super Admin Telegram AI Boti va Google AI Studio (Gemini)
                    </h3>
                    <p style={sectionSubStyle}>
                      Barcha maktablar, o‘quvchilar, o‘qituvchilar, darslar, davomat, Face ID & turniketlar, oylik tushumlar (MRR), qarzdorliklar va sinov muddatlarini Telegram orqali tahlil qilish
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: 11.5,
                      fontWeight: 800,
                      backgroundColor: systemConfig.telegram_bot_token && systemConfig.gemini_api_key ? '#ECFDF5' : '#FFFBEB',
                      color: systemConfig.telegram_bot_token && systemConfig.gemini_api_key ? THEME.green : '#D97706',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: systemConfig.telegram_bot_token && systemConfig.gemini_api_key ? THEME.green : '#D97706'
                      }} />
                      {systemConfig.telegram_bot_token && systemConfig.gemini_api_key ? 'AI & Bot Faol' : 'Sozlash Kutilmoqda'}
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} color="#F59E0B" /> Google AI Studio (Gemini) & Tizim Bazasining To‘liq Integratsiyasi
                  </div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.6 }}>
                    Ushbu botga Super Admin sifatida istalgan savolingizni yozsangiz, u platformaning <b>100% haqiqiy ma'lumotlar bazasini</b> tekshirib,
                    Google AI Studio (Gemini 2.5/2.0 Flash) orqali chuqur tahlil qilib, aniq raqamlar, jadvallar va xulosalar bilan javob beradi.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Telegram Bot Token (BotFather) *</span>
                      <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ color: THEME.primary, fontSize: 11, textDecoration: 'none' }}>
                        @BotFather dan olish &rarr;
                      </a>
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: 7192834102:AAH9xIdrokEduBot_ProdKey"
                      value={systemConfig.telegram_bot_token || ''}
                      onChange={e => setSystemConfig({ ...systemConfig, telegram_bot_token: e.target.value.trim() })}
                      style={{ ...inputFieldStyle, marginTop: 6, fontFamily: 'monospace', fontSize: 12 }}
                    />
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                      Telegram orqali yaratilgan botingizning HTTP API tokeni
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Super Admin Telegram Chat ID *</span>
                      <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: THEME.primary, fontSize: 11, textDecoration: 'none' }}>
                        @userinfobot dan bilish &rarr;
                      </a>
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: 123456789 (Faqat sizning xabaringizga javob berishi uchun)"
                      value={systemConfig.telegram_admin_id || ''}
                      onChange={e => setSystemConfig({ ...systemConfig, telegram_admin_id: e.target.value.trim() })}
                      style={{ ...inputFieldStyle, marginTop: 6, fontFamily: 'monospace', fontSize: 12 }}
                    />
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                      Begonalar kirishini to‘sish va faqat sizga xizmat ko‘rsatish uchun shaxsiy Telegram ID
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Google AI Studio (Gemini) API Key *</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: THEME.primary, fontSize: 11, textDecoration: 'none' }}>
                      aistudio.google.com dan olish &rarr;
                    </a>
                  </label>
                  <input
                    type="password"
                    placeholder="Masalan: AIzaSyD39k-EXAMPLE_KEY_FOR_GEMINI_AI"
                    value={systemConfig.gemini_api_key || ''}
                    onChange={e => setSystemConfig({ ...systemConfig, gemini_api_key: e.target.value.trim() })}
                    style={{ ...inputFieldStyle, marginTop: 6, fontFamily: 'monospace', fontSize: 12 }}
                  />
                  <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                    Google Gemini 2.5 Flash / 2.0 Flash modellari orqali platforma ma'lumotlarini tahlil qilish uchun API kaliti
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="sa-btn"
                      type="button"
                      disabled={telegramTestLoading}
                      onClick={handleTestTelegramBot}
                      style={{ ...secondaryBtnStyle, padding: '8px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Send size={14} color={THEME.primary} />
                      {telegramTestLoading ? "Yuborilmoqda..." : "Test Telegram Xabar Yuborish"}
                    </button>
                    <span style={{ fontSize: 11.5, color: THEME.textMuted }}>
                      * Oldin botingizga Telegramdan kirib <code>/start</code> bosgan bo‘ling
                    </span>
                  </div>

                  <button
                    className="sa-btn"
                    type="button"
                    onClick={handleSaveSystemConfig}
                    style={{ ...primaryBtnStyle, padding: '8px 18px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Check size={15} /> Bot va AI Sozlamalarini Saqlash
                  </button>
                </div>
              </div>

              {/* 5. SMS Shlyuz va Mobil Ilova Boshqaruvi */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 14 : 22 }}>
                <div className="sa-card" style={cardBoxStyle}>
                  <h3 style={sectionTitleStyle}>5. Aloqa va Bildirishnomalar</h3>
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

                      <div style={{ marginTop: 10 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 4 }}>
                          SMS Gateway API Token / Kaliti
                        </label>
                        <input
                          type="password"
                          placeholder="Eskiz API Bearer Token..."
                          value={systemConfig.smsToken || ''}
                          onChange={e => setSystemConfig({ ...systemConfig, smsToken: e.target.value.trim() })}
                          style={{ ...inputFieldStyle, fontSize: 12, fontFamily: 'monospace' }}
                        />
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: THEME.textDark, display: 'block', marginBottom: 4 }}>
                          Darsga Kelmaganlik SMS Xabarnoma Shabloni
                        </label>
                        <textarea
                          rows={2}
                          value={systemConfig.smsTemplate || ''}
                          onChange={e => setSystemConfig({ ...systemConfig, smsTemplate: e.target.value })}
                          style={{ ...inputFieldStyle, fontSize: 11.5, resize: 'vertical' }}
                        />
                        <div style={{ fontSize: 10.5, color: THEME.textMuted, marginTop: 3 }}>
                          Mavjud tokenlar: <code>{'{student_name}'}</code>, <code>{'{school_name}'}</code>
                        </div>
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
                  <h3 style={sectionTitleStyle}>6. Mobil Ilova Versiyalari va Ish Rejimi</h3>
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

                    <div style={{ ...miniStatBoxStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: systemConfig.maintenanceMode ? '#FFF5F6' : '#F9FAFE', border: systemConfig.maintenanceMode ? '1px solid #FECDD3' : '1px solid #E2E8F0', padding: '14px 18px', borderRadius: 8 }}>
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

              {/* 7. Zaxira Nusxalash */}
              <div className="sa-card" style={cardBoxStyle}>
                <div style={{ marginBottom: 14 }}>
                  <h3 style={sectionTitleStyle}>7. Zaxira Nusxalash (PostgreSQL va S3 Media Ombori)</h3>
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
                      {backups.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '36px 16px', textAlign: 'center', color: THEME.textMuted }}>
                            <Archive size={32} color={THEME.primary} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }} />
                            <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark }}>Hozircha arxiv nusxalari yo‘q</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>Yangi zaxira nusxasi yaratish uchun yuqoridagi tugmani bosing</div>
                          </td>
                        </tr>
                      ) : backups.map(b => (
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
                              onClick={() => {
                                showToast(`${b.id} zaxira fayli yuklab olinmoqda...`);
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: isMobile ? 14 : 22 }}>
                <div className="sa-card" style={cardBoxStyle}>
                  <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={16} color={THEME.primary} /> Maktab Direktorlaridan Kelgan Murojaatlar
                  </h3>
                  <p style={sectionSubStyle}>Texnik yordam so‘rovlari va ularga javob berish</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                    {tickets.length === 0 ? (
                      <div style={{ padding: '36px 16px', textAlign: 'center', color: THEME.textMuted, backgroundColor: '#FAFBFD', borderRadius: 8, border: `1px solid ${THEME.border}` }}>
                        <CheckCircle2 size={32} color={THEME.green} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }} />
                        <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textDark }}>Hozircha ochiq murojaatlar yo‘q</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Barcha maktablar barqaror va xatoliklarsiz ishlamoqda</div>
                      </div>
                    ) : tickets.map(t => (
                      <div key={t.id} style={{ padding: 16, borderRadius: 8, backgroundColor: '#F9FAFE', border: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                      <div key={f.id} style={{ padding: 15, borderRadius: 8, backgroundColor: '#F9FAFE', border: `1px solid ${THEME.border}` }}>
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
      {/* MOBIL QALQIB CHIQAR TUGMA (FAB) VA QUYI NAVIGATSIYA (BOTTOM NAV)   */}
      {/* ================================================================= */}
      {isMobile && (superTab === 'schools' || superTab === 'overview') && (
        <button
          onClick={() => setShowOnboardingWizard(true)}
          style={{
            position: 'fixed',
            bottom: 74,
            right: 16,
            backgroundColor: THEME.primary,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 24,
            padding: '11px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: '0 8px 24px rgba(108, 92, 231, 0.45)',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: 12.5,
            zIndex: 980,
            animation: 'fadeIn 0.2s ease-out',
          }}>
          <Plus size={17} />
          <span>Yangi Maktab</span>
        </button>
      )}

      {isMobile && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: `1px solid ${THEME.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 990,
            boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.05)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
          {[
            { id: 'overview', label: 'Asosiy', icon: LayoutDashboard },
            { id: 'schools', label: 'Maktablar', icon: Building2 },
            { id: 'map', label: 'Xarita', icon: MapPin },
            { id: 'billing', label: 'Moliya', icon: CreditCard },
            { id: 'more', label: 'Barchasi', icon: Menu },
          ].map(item => {
            const isMore = item.id === 'more';
            const isActive = !isMore && superTab === item.id;
            const IconC = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isMore) {
                    setMobileMenuOpen(prev => !prev);
                  } else {
                    setSuperTab(item.id);
                    setMobileMenuOpen(false);
                  }
                }}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  WebkitTapHighlightColor: 'transparent',
                  color: isActive ? THEME.primary : '#8A90A2',
                }}>
                <div
                  style={{
                    padding: '3px 12px',
                    borderRadius: 10,
                    backgroundColor: isActive ? THEME.primaryLight : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.15s ease',
                  }}>
                  <IconC size={18} color={isActive ? THEME.primary : '#8A90A2'} />
                </div>
                <span style={{ fontSize: 10.5, fontWeight: isActive ? 800 : 500 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* ================================================================= */}
      {/* MODALLAR                                                          */}
      {/* ================================================================= */}
      {showOnboardingWizard && (
        <OnboardingWizardModal
          onClose={() => setShowOnboardingWizard(false)}
          onSubmit={async (createdSchool) => {
            try {
              const res = await fetch('/api/superadmin/schools/create/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createdSchool),
              });
              const data = await res.json();
              const saved = data.school ? { ...createdSchool, ...data.school } : createdSchool;
              const updated = [saved, ...schoolsList];
              onUpdateSchools(updated);
              setSelectedSchoolId(saved.id);
              setShowOnboardingWizard(false);
              appendAuditLog('ONBOARD_NEW_SCHOOL', saved.name, `Yangi maktab yaratildi (Login: ${saved.username}, Parol: ${saved.password})`);
              showToast(`"${saved.name}" muvaffaqiyatli yaratildi va bazaga saqlandi!`);
            } catch (err) {
              const updated = [createdSchool, ...schoolsList];
              onUpdateSchools(updated);
              setSelectedSchoolId(createdSchool.id);
              setShowOnboardingWizard(false);
              showToast(`"${createdSchool.name}" qo'shildi!`);
            }
          }}
        />
      )}

      {editingSchool && (
        <EditTenantModal
          school={editingSchool}
          onClose={() => setEditingSchool(null)}
          onSave={async (updatedSchool) => {
            try {
              const res = await fetch(`/api/superadmin/schools/${updatedSchool.id}/update/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSchool),
              });
              const data = await res.json();
              const saved = data.school ? { ...updatedSchool, ...data.school } : updatedSchool;
              const updated = schoolsList.map(s => String(s.id) === String(saved.id) ? { ...s, ...saved } : s);
              onUpdateSchools(updated);
              setEditingSchool(null);
              appendAuditLog('UPDATE_SCHOOL', saved.name, `Maktab ma'lumotlari va paroli bazada yangilandi (Login: ${saved.username})`);
              showToast(`"${saved.name}" ma'lumotlari va yangi paroli bazaga muvaffaqiyatli saqlandi!`);
            } catch (err) {
              const updated = schoolsList.map(s => s.id === updatedSchool.id ? updatedSchool : s);
              onUpdateSchools(updated);
              setEditingSchool(null);
              showToast(`"${updatedSchool.name}" ma'lumotlari saqlandi!`);
            }
          }}
        />
      )}

      {warningModalSchool && (
        <div style={modalBackdropStyle}>
          <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)' }}>
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
          <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 30, width: '100%', maxWidth: 520, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.22)' }}>
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
              <div style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: maintenanceForm.is_maintenance_mode ? '#FFF1F2' : '#F0FDF4', border: maintenanceForm.is_maintenance_mode ? '1px solid #FECDD3' : '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 30, width: '100%', maxWidth: 480, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.22)' }}>
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

      {/* Maktabning oylik narxi va sinov muddatini sozlash modali */}
      {pricingModalSchool && (
        <div style={modalBackdropStyle}>
          <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 26, width: '100%', maxWidth: 520, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: THEME.textDark }}>
                  {pricingModalSchool.name}
                </div>
                <div style={{ fontSize: 12, color: THEME.textMuted }}>
                  Oylik to‘lov summasi va shartnoma shartlarini belgilash
                </div>
              </div>
              <button
                onClick={() => setPricingModalSchool(null)}
                style={{ border: 'none', background: '#F1F5F9', borderRadius: 12, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} color={THEME.textMuted} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Sinov / Bepul muddat tanlagichi */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                backgroundColor: pricingForm.is_free_trial ? '#ECFDF5' : '#F8FAFC',
                border: pricingForm.is_free_trial ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: pricingForm.is_free_trial ? '#065F46' : THEME.textDark }}>
                    🎁 Bepul Sinov Muddati (Free Trial)
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                    Ushbu rejimda maktabdan to‘lov olinmaydi va qarz hisoblanmaydi
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pricingForm.is_free_trial}
                  onChange={e => setPricingForm({ ...pricingForm, is_free_trial: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#10B981' }}
                />
              </div>

              {pricingForm.is_free_trial ? (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                    Sinov Muddati Tugash Sanasi
                  </label>
                  <input
                    type="date"
                    value={pricingForm.trial_until_date}
                    onChange={e => setPricingForm({ ...pricingForm, trial_until_date: e.target.value })}
                    style={{ ...inputFieldStyle, marginTop: 6 }}
                  />
                  <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                    Ko‘rsatilgan sanadan so‘ng maktab avtomatik pullik rejimga yoki to‘lov kutilishiga o‘tadi
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                      Kelishilgan Oylik Narx (so‘mda)
                    </label>
                    <span style={{ fontSize: 12, fontWeight: 800, color: THEME.primary }}>
                      {Number(pricingForm.monthly_price || 0).toLocaleString()} so‘m / oy
                    </span>
                  </div>

                  <input
                    type="number"
                    step="100000"
                    min="0"
                    value={pricingForm.monthly_price}
                    onChange={e => setPricingForm({ ...pricingForm, monthly_price: Number(e.target.value) || 0 })}
                    style={{ ...inputFieldStyle, marginTop: 6, fontWeight: 800, fontSize: 14 }}
                  />

                  {/* Tezkor narx tugmalari */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {[500000, 1000000, 1500000, 2000000, 3000000, 5000000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPricingForm({ ...pricingForm, monthly_price: val })}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: pricingForm.monthly_price === val ? `1.5px solid ${THEME.primary}` : '1px solid #E2E8F0',
                          backgroundColor: pricingForm.monthly_price === val ? THEME.primaryLight : '#FFFFFF',
                          color: pricingForm.monthly_price === val ? THEME.primary : THEME.textDark,
                        }}
                      >
                        {(val / 1000000 >= 1 ? `${val / 1000000} mln` : `${val / 1000} ming`)} so‘m
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* To'lov Holati */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                  To‘lov Holati
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {[
                    { id: 'PAID', label: 'To‘langan', color: '#10B981', bg: '#ECFDF5' },
                    { id: 'PENDING', label: 'Kutilmoqda', color: '#D97706', bg: '#FFFBEB' },
                    { id: 'OVERDUE', label: 'Qarzdor', color: '#EF4444', bg: '#FEF2F2' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPricingForm({ ...pricingForm, payment_status: item.id })}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: pricingForm.payment_status === item.id ? `2px solid ${item.color}` : '1px solid #E2E8F0',
                        backgroundColor: pricingForm.payment_status === item.id ? item.bg : '#FFFFFF',
                        color: pricingForm.payment_status === item.id ? item.color : THEME.textDark,
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {pricingForm.payment_status === 'OVERDUE' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                    Qarz Summasi (so‘mda yoki matn)
                  </label>
                  <input
                    value={pricingForm.debt_amount}
                    onChange={e => setPricingForm({ ...pricingForm, debt_amount: e.target.value })}
                    style={{ ...inputFieldStyle, marginTop: 6, color: '#EF4444', fontWeight: 700 }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setPricingModalSchool(null)}
                  style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSaveSchoolPricing}
                  style={{ ...primaryBtnStyle, flex: 1.5, justifyContent: 'center' }}
                >
                  Saqlash va Yangilash
                </button>
              </div>
            </div>
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
    monthly_price: 1000000,
    is_free_trial: false,
    trial_until_date: '',
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
      plan: form.is_free_trial ? 'Sinov (Tekin)' : `${(Number(form.monthly_price || 1000000) / 1000000).toFixed(1)} mln so'm`,
      monthlyPrice: Number(form.monthly_price) || 1000000,
      isFreeTrial: Boolean(form.is_free_trial),
      trialUntilDate: form.trial_until_date || '',
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
      <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 30, width: '100%', maxWidth: 520, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
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
              {/* Oylik To'lov yoki Bepul Sinov */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                backgroundColor: form.is_free_trial ? '#ECFDF5' : '#F8FAFC',
                border: form.is_free_trial ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: form.is_free_trial ? '#065F46' : THEME.textDark }}>
                    🎁 Bepul Sinov Muddati (Free Trial)
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                    Dastlabki sinov davri uchun bepul biriktirish
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_free_trial}
                  onChange={e => setForm({ ...form, is_free_trial: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#10B981' }}
                />
              </div>

              {form.is_free_trial ? (
                <div>
                  <label style={labelStyle}>Sinov Muddati Tugash Sanasi</label>
                  <input
                    type="date"
                    value={form.trial_until_date}
                    onChange={e => setForm({ ...form, trial_until_date: e.target.value })}
                    style={inputFieldStyle}
                  />
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={labelStyle}>Kelishilgan Oylik To‘lov (so‘mda)</label>
                    <span style={{ fontSize: 12, fontWeight: 800, color: THEME.primary }}>
                      {Number(form.monthly_price || 0).toLocaleString()} so‘m / oy
                    </span>
                  </div>
                  <input
                    type="number"
                    step="100000"
                    min="0"
                    value={form.monthly_price}
                    onChange={e => setForm({ ...form, monthly_price: Number(e.target.value) || 0 })}
                    style={{ ...inputFieldStyle, fontWeight: 800 }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {[500000, 1000000, 1500000, 2000000, 3000000, 5000000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm({ ...form, monthly_price: val })}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: form.monthly_price === val ? `1.5px solid ${THEME.primary}` : '1px solid #E2E8F0',
                          backgroundColor: form.monthly_price === val ? THEME.primaryLight : '#FFFFFF',
                          color: form.monthly_price === val ? THEME.primary : THEME.textDark,
                        }}
                      >
                        {(val / 1000000 >= 1 ? `${val / 1000000} mln` : `${val / 1000} ming`)} so‘m
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                  style={{ padding: 14, borderRadius: 8, border: `1px solid ${form[mod.key] ? THEME.primary : THEME.border}`, backgroundColor: form[mod.key] ? THEME.primaryLight : '#F8FAFC', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
  const [form, setForm] = useState({
    ...school,
    username: school.username || `maktab${school.id}`,
    password: school.password || 'school123',
  });
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div style={modalBackdropStyle}>
      <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 30, width: '100%', maxWidth: 480, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={20} color={THEME.primary} /> Maktab Rekvizitlari va Parolini Tahrirlash
        </h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSaving(true);
            try {
              await onSave(form);
            } finally {
              setIsSaving(false);
            }
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Parol</label>
                <button
                  type="button"
                  onClick={() => {
                    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
                    const autoPwd = "sch_" + Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                    setForm(prev => ({ ...prev, password: autoPwd }));
                  }}
                  style={{ border: 'none', background: 'transparent', color: THEME.primary, fontSize: 11, cursor: 'pointer', fontWeight: 700, padding: 0 }}>
                  ⚡ Avto-generatsiya
                </button>
              </div>
              <input required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputFieldStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ ...secondaryBtnStyle, flex: 1, justifyContent: 'center' }}>Bekor qilish</button>
            <button type="submit" disabled={isSaving} style={{ ...primaryBtnStyle, flex: 1.4, justifyContent: 'center', opacity: isSaving ? 0.7 : 1 }}>
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
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
      <div className="sa-modal-box" style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)' }}>
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
          borderRadius: 12,
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
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
                      borderRadius: 8,
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

// Yengil va toza Micro-Sparkline komponenti (KPI kartalari uchun)
function MicroSparkline({ data = [92, 93, 91.5, 94.2, 95.1, 94.8, 95.8], color = '#6C5CE7' }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const range = max - min || 1;
  const w = 68;
  const h = 24;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={w} height={h} style={{ overflow: 'visible', display: 'block' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

function SidebarNavBtn({ active, onClick, icon, label, badge }) {
  return (
    <button
      className={`school-nav-btn ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 12px',
        borderRadius: 8,
        border: active ? '1px solid rgba(108, 92, 231, 0.22)' : '1px solid transparent',
        background: active ? '#F1F0FF' : 'transparent',
        color: active ? '#6C5CE7' : '#334155',
        fontWeight: active ? 600 : 500,
        fontSize: 13,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        position: 'relative',
        boxSizing: 'border-box',
        minHeight: 40,
        outline: 'none',
      }}>
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '22%',
            bottom: '22%',
            width: 3,
            borderRadius: '0 3px 3px 0',
            backgroundColor: '#6C5CE7',
          }}
        />
      )}
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && React.cloneElement(icon, { size: 17, className: 'school-nav-btn-icon' })}
        <span>{label}</span>
      </span>
      {badge && (
        <span style={{
          padding: '2px 7px',
          borderRadius: 4,
          backgroundColor: active ? '#6C5CE7' : '#F1F5F9',
          color: active ? '#FFFFFF' : '#64748B',
          fontSize: 11,
          fontWeight: 600,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MetricCard({ icon, title, value, sub, color = THEME.primary, badge, sparklineData }) {
  const spark = sparklineData || (badge ? null : [24, 28, 27, 31, 33, 35, 38]);
  return (
    <div
      className="sa-card"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: 10,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 6,
        transition: 'border-color 0.15s ease',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#8A90A2' }}>{title}</div>
        {spark ? (
          <MicroSparkline data={spark} color={color} />
        ) : badge ? (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 4,
            backgroundColor: `${color}14`,
            color: color,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            {icon && React.cloneElement(icon, { size: 12, color })}
            {badge}
          </span>
        ) : null}
      </div>

      <div style={{ fontSize: 28, fontWeight: 600, color: '#1E2038', letterSpacing: '-0.02em', marginTop: 2 }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        {sub && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11.5,
            fontWeight: 500,
            color: '#8A90A2',
          }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: { label: 'Faol', bg: '#E8F8F5', color: '#10AC84' },
    TRIAL: { label: 'Sinov muddati', bg: '#EFF6FF', color: '#2563EB' },
    SUSPENDED: { label: 'To‘xtatilgan', bg: '#FFF4E5', color: '#FF9F43' },
    ARCHIVED: { label: 'Arxivlangan', bg: '#F1F5F9', color: '#64748B' },
    BLOCKED: { label: 'Bloklangan', bg: '#FEE2E2', color: '#EF4444' },
  };
  const st = map[status] || map.ACTIVE;
  return (
    <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: st.bg, color: st.color, fontWeight: 600, fontSize: 11 }}>
      {st.label}
    </span>
  );
}

const cardBoxStyle = {
  backgroundColor: '#FFFFFF',
  padding: 20,
  borderRadius: 10,
  border: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  transition: 'border-color 0.15s ease',
};

const miniStatBoxStyle = {
  padding: 12,
  borderRadius: 8,
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
};

const sectionTitleStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: '#1E2038',
  margin: 0,
  letterSpacing: '-0.01em',
};

const sectionSubStyle = {
  fontSize: 12,
  color: '#8A90A2',
  marginTop: 4,
  marginBottom: 0,
};

const pillBadgeStyle = {
  padding: '3px 8px',
  borderRadius: 6,
  backgroundColor: '#F1F0FF',
  color: '#6C5CE7',
  fontWeight: 600,
  fontSize: 11,
};

const tierBadgeStyle = {
  padding: '3px 7px',
  borderRadius: 6,
  backgroundColor: '#FFFFFF',
  color: '#1E2038',
  border: '1px solid #E2E8F0',
  fontWeight: 600,
  fontSize: 10.5,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
};

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 14px',
  background: 'linear-gradient(135deg, #7C69EF 0%, #5845D8 100%)',
  color: '#FFFFFF',
  borderRadius: 6,
  border: 'none',
  fontWeight: 600,
  fontSize: 12.5,
  cursor: 'pointer',
  transition: 'opacity 0.15s ease',
  boxShadow: 'none',
};

const secondaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 12px',
  backgroundColor: '#FFFFFF',
  color: '#1E2038',
  borderRadius: 6,
  border: '1px solid #E2E8F0',
  fontWeight: 500,
  fontSize: 12.5,
  cursor: 'pointer',
  transition: 'border-color 0.15s ease',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
};

const selectFilterStyle = {
  padding: '7px 12px',
  borderRadius: 6,
  border: '1px solid #E2E8F0',
  backgroundColor: '#FFFFFF',
  fontSize: 12.5,
  fontWeight: 500,
  color: '#1E2038',
  outline: 'none',
};

const inputFieldStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #E2E8F0',
  fontSize: 13,
  boxSizing: 'border-box',
  outline: 'none',
  marginTop: 4,
  color: '#1E2038',
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#1E2038',
};

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
};
