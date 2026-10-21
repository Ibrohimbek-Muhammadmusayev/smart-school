import React, { useState, useEffect } from 'react';
import { 
  Building2, Shield, Users, CheckCircle2, AlertTriangle, 
  Search, Plus, RefreshCw, Key, Send, TrendingUp, 
  BarChart3, Activity, ChevronRight, Filter, Download, 
  ArrowUpRight, ArrowDownRight, School, Bell, Menu, X, 
  Power, Lock, Unlock, Eye, MapPin, Phone, Mail, Award,
  Sliders, Layers, Server, Database, LogOut, UserPlus, BookOpen,
  Calendar, CheckCircle, UserX, QrCode, GraduationCap, Clock,
  FolderOpen, EyeOff, Sparkles, Smartphone, ChevronDown, Check,
  Edit, Trash2, Copy, ZoomIn, ExternalLink,
  Radio, Play, Pause, Cpu, Upload
} from 'lucide-react';
import SuperAdminDashboardView from './SuperAdminDashboard';
import SchoolMapPicker from './components/SchoolMapPicker';

// Easy Learn Palette Constants
const THEME = {
  primary: '#6C5CE7',
  primaryDark: '#5845D8',
  primaryLight: '#F1F0FF',
  gradient: 'linear-gradient(135deg, #7C69EF 0%, #5845D8 100%)',
  warmGradient: 'linear-gradient(135deg, #FF9F43 0%, #FF6584 100%)',
  orange: '#FF9F43',
  pink: '#FF6584',
  cyan: '#48DBFB',
  green: '#10AC84',
  bgSoft: '#F8F9FE',
  cardBg: '#FFFFFF',
  textDark: '#1E2038',
  textMuted: '#8A90A2',
  border: 'rgba(0, 0, 0, 0.05)',
};

export const normalizeMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.includes('/media/')) {
    return '/media/' + url.substring(url.indexOf('/media/') + 7);
  }
  return url;
};

const DEFAULT_SCHOOLS = [
  {
    id: 1,
    name: "1-sonli Ixtisoslashtirilgan Maktab-Kollej",
    inn: "309481023",
    district: "Toshkent sh., Yunusobod tumani",
    director: "Rahimov Jamshid",
    phone: "+998 90 100-11-22",
    username: "maktab1",
    password: "school123",
    plan: "Litsenziyali Pro",
    paymentStatus: "PAID",
    studentsCount: 420,
    capacity: 800,
    roomsLimit: 55,
    storageGb: 200,
    teachersCount: 34,
    attendanceRate: 96.4,
    turnstileStatus: "ONLINE",
    status: "ACTIVE",
    warningBanner: "",
  },
  {
    id: 2,
    name: "24-sonli Prezident va IT Maktabi",
    inn: "309551842",
    district: "Toshkent sh., Mirzo Ulug'bek tumani",
    director: "Karimov Ulug'bek",
    phone: "+998 90 240-22-33",
    username: "maktab2",
    password: "school123",
    plan: "Litsenziyali Pro",
    paymentStatus: "PAID",
    studentsCount: 640,
    capacity: 1000,
    roomsLimit: 65,
    storageGb: 250,
    teachersCount: 48,
    attendanceRate: 98.4,
    turnstileStatus: "ONLINE",
    status: "ACTIVE",
    warningBanner: "",
  },
  {
    id: 3,
    name: "45-sonli IDUM (Aniq fanlar maktabi)",
    inn: "309772190",
    district: "Toshkent sh., Chilonzor tumani",
    director: "Xoliqova Dilnoza",
    phone: "+998 93 450-33-44",
    username: "maktab3",
    password: "school123",
    plan: "Standart",
    paymentStatus: "PENDING",
    studentsCount: 820,
    capacity: 1200,
    roomsLimit: 60,
    storageGb: 100,
    teachersCount: 62,
    attendanceRate: 95.1,
    turnstileStatus: "ONLINE",
    status: "TRIAL",
    warningBanner: "",
  },
  {
    id: 4,
    name: "112-sonli Umumta'lim Maktabi",
    inn: "309883411",
    district: "Toshkent sh., Sergeli tumani",
    director: "Mirzayev Otabek",
    phone: "+998 97 112-44-55",
    username: "maktab4",
    password: "school123",
    plan: "BoshlangвЂich",
    paymentStatus: "OVERDUE",
    studentsCount: 1150,
    capacity: 1500,
    roomsLimit: 70,
    storageGb: 50,
    teachersCount: 76,
    attendanceRate: 91.8,
    turnstileStatus: "ONLINE",
    status: "ACTIVE",
    warningBanner: "вљ пёЏ Diqqat: Maktab obuna to'lov muddati tugagan. Iltimos, hisob-fakturani to'lang!",
  },
  {
    id: 5,
    name: "8-sonli Xorijiy Tillar va Texnologiya Litseyi",
    inn: "309619044",
    district: "Samarqand sh., Markaziy tuman",
    director: "Jo'rayev Farrux",
    phone: "+998 91 508-55-66",
    username: "maktab5",
    password: "school123",
    plan: "Standart",
    paymentStatus: "PAID",
    studentsCount: 490,
    capacity: 750,
    roomsLimit: 40,
    storageGb: 100,
    teachersCount: 38,
    attendanceRate: 97.2,
    turnstileStatus: "ONLINE",
    status: "ACTIVE",
    warningBanner: "",
  },
];

function buildSchoolTerms(cfg) {
  const isGuruh = (cfg?.group_term || cfg?.groupTerm || 'SINF').toUpperCase() === 'GURUH';
  const isPara = (cfg?.lesson_term || cfg?.lessonTerm || 'DARS').toUpperCase() === 'PARA';
  const isTalaba = (cfg?.student_term || cfg?.studentTerm || 'OQUVCHI').toUpperCase() === 'TALABA';
  
  const formatGroupFn = (rawName) => {
    if (!rawName || rawName === 'Guruhsiz' || rawName === 'Sinfsiz') {
      return isGuruh ? 'Guruhsiz' : 'Sinfsiz';
    }
    const clean = String(rawName).replace(/\s*(sinfi?|guruhi?)$/i, '').trim();
    return `${clean} ${isGuruh ? 'guruh' : 'sinf'}`;
  };

  return {
    isGuruh,
    isPara,
    isTalaba,
    groupTerm: isGuruh ? 'GURUH' : 'SINF',
    lessonTerm: isPara ? 'PARA' : 'DARS',
    studentTerm: isTalaba ? 'TALABA' : 'OQUVCHI',
    groupSingular: isGuruh ? 'Guruh' : 'Sinf',
    groupSingularLower: isGuruh ? 'guruh' : 'sinf',
    groupPlural: isGuruh ? 'Guruhlar' : 'Sinflar',
    groupGenitive: isGuruh ? 'Guruhi' : 'Sinfi',
    groupGenitiveLower: isGuruh ? 'guruhi' : 'sinfi',
    myGroups: isGuruh ? 'Guruhlarim' : 'Sinflarim',
    advisorLabel: isGuruh ? 'Guruh rahbari' : 'Sinf rahbari',
    groupLeader: isGuruh ? 'Guruh rahbari' : 'Sinf rahbari',
    noGroupLabel: isGuruh ? 'Guruhsiz' : 'Sinfsiz',
    lessonSingular: isPara ? 'Para' : 'Dars',
    lessonSingularLower: isPara ? 'para' : 'dars',
    lessonPlural: isPara ? 'Paralar' : 'Darslar',
    lessonPluralLower: isPara ? 'paralar' : 'darslar',
    studentSingular: isTalaba ? 'Talaba' : "O'quvchi",
    studentSingularLower: isTalaba ? 'talaba' : "o'quvchi",
    studentPlural: isTalaba ? 'Talabalar' : "O'quvchilar",
    studentPluralLower: isTalaba ? 'talabalar' : "o'quvchilar",
    formatGroup: formatGroupFn,
    formatGroupBadge: formatGroupFn,
  };
}

function generateLessonSlots(cfg, totalSlots = 7, shift = 1) {
  const duration = Math.max(15, Math.min(240, Number(cfg?.lesson_duration_minutes || (cfg?.lesson_term === 'PARA' ? 80 : 45))));
  const breakMin = Math.max(0, Math.min(120, Number(cfg?.break_duration_minutes ?? 10)));
  
  const isShift2 = Number(shift || 1) === 2;
  const bigBreakAfter = isShift2
    ? Number(cfg?.shift2_big_break_after_lesson ?? 0)
    : Number(cfg?.big_break_after_lesson ?? 0);
  const bigBreakMin = isShift2
    ? Math.max(breakMin, Math.min(120, Number(cfg?.shift2_big_break_duration_minutes ?? 20)))
    : Math.max(breakMin, Math.min(120, Number(cfg?.big_break_duration_minutes ?? 20)));

  const startStr = isShift2
    ? String(cfg?.shift2_start_time || '13:30').trim()
    : String(cfg?.first_lesson_start_time || '08:30').trim();

  let startHour = isShift2 ? 13 : 8;
  let startMinute = 30;
  if (startStr.includes(':')) {
    const parts = startStr.split(':');
    startHour = parseInt(parts[0], 10) || (isShift2 ? 13 : 8);
    startMinute = parseInt(parts[1], 10) || 0;
  }

  const slots = [];
  let currentTotalMin = startHour * 60 + startMinute;

  for (let order = 1; order <= totalSlots; order++) {
    const startH = Math.floor(currentTotalMin / 60) % 24;
    const startM = currentTotalMin % 60;
    const endTotalMin = currentTotalMin + duration;
    const endH = Math.floor(endTotalMin / 60) % 24;
    const endM = endTotalMin % 60;

    const pad = (n) => String(n).padStart(2, '0');
    const startFmt = `${pad(startH)}:${pad(startM)}`;
    const endFmt = `${pad(endH)}:${pad(endM)}`;

    slots.push({
      order,
      start: startFmt,
      end: endFmt,
      duration_minutes: duration,
      shift: isShift2 ? 2 : 1,
    });

    const currentBreak = (bigBreakAfter > 0 && order === bigBreakAfter) ? bigBreakMin : breakMin;
    currentTotalMin = endTotalMin + currentBreak;
  }

  return slots;
}

export default function App() {
  const [schoolsList, setSchoolsList] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_school_institutions');
      return saved ? JSON.parse(saved) : DEFAULT_SCHOOLS;
    } catch (_) {
      return DEFAULT_SCHOOLS;
    }
  });

  const [globalAnnouncement, setGlobalAnnouncement] = useState(() => {
    return localStorage.getItem('smart_school_global_announcement') || '';
  });

  const handleUpdateAnnouncement = (text) => {
    setGlobalAnnouncement(text);
    localStorage.setItem('smart_school_global_announcement', text);
  };

  const updateSchoolsList = (updated) => {
    setSchoolsList(updated);
    localStorage.setItem('smart_school_institutions', JSON.stringify(updated));
  };

  // Backenddagi SchoolConfig sozlamalari bilan maktablar ro'yxatini sinxronlash
  useEffect(() => {
    fetch('/api/school-config/?all_schools=1')
      .then(r => (r.ok ? r.json() : []))
      .then(configs => {
        if (!Array.isArray(configs) || configs.length === 0) return;
        setSchoolsList(prev => {
          const mapById = {};
          configs.forEach(c => {
            if (c && c.school_id) mapById[String(c.school_id)] = c;
          });
          const merged = prev.map(s => {
            const cfg = mapById[String(s.id)];
            if (!cfg) return s;
            return {
              ...s,
              name: cfg.school_name || s.name,
              director: cfg.director_name || s.director,
              district: cfg.district || s.district,
              phone: cfg.phone || s.phone,
              institutionType: cfg.institution_type || s.institutionType || '',
              academicYear: cfg.academic_year || s.academicYear || '2026-2027',
              groupTerm: cfg.group_term || s.groupTerm || 'SINF',
              lessonTerm: cfg.lesson_term || s.lessonTerm || 'DARS',
              studentTerm: cfg.student_term || s.studentTerm || 'OQUVCHI',
            };
          });
          localStorage.setItem('smart_school_institutions', JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => {});
  }, []);

  // Super Admin biror maktabning ichki kabinetiga o'tganda saqlanadigan state
  const [impersonatedSchool, setImpersonatedSchoolState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('smart_super_admin_impersonated_school');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });

  const setImpersonatedSchool = (school) => {
    try {
      if (school) {
        sessionStorage.setItem('smart_super_admin_impersonated_school', JSON.stringify(school));
      } else {
        sessionStorage.removeItem('smart_super_admin_impersonated_school');
      }
    } catch (_) {}
    setImpersonatedSchoolState(school);
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('smart_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return parsed.user;
        } else {
          sessionStorage.removeItem('smart_auth_session');
        }
      }
    } catch (_) {}
    return null;
  });

  const saveSession = (user) => {
    const sessionData = {
      user,
      loginAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    sessionStorage.setItem('smart_auth_session', JSON.stringify(sessionData));
    setCurrentUser(user);
  };

  const handleSchoolConfigSaved = (updatedCfg) => {
    if (!updatedCfg || !updatedCfg.school_id) return;
    const sid = String(updatedCfg.school_id);
    setSchoolsList(prev => {
      const next = prev.map(s => {
        if (String(s.id) !== sid) return s;
        return {
          ...s,
          name: updatedCfg.school_name || s.name,
          director: updatedCfg.director_name || s.director,
          district: updatedCfg.district || s.district,
          phone: updatedCfg.phone || s.phone,
          institutionType: updatedCfg.institution_type || s.institutionType,
          academicYear: updatedCfg.academic_year || s.academicYear,
          groupTerm: updatedCfg.group_term || 'SINF',
          lessonTerm: updatedCfg.lesson_term || 'DARS',
          studentTerm: updatedCfg.student_term || 'OQUVCHI',
        };
      });
      localStorage.setItem('smart_school_institutions', JSON.stringify(next));
      return next;
    });

    if (impersonatedSchool && String(impersonatedSchool.id) === sid) {
      setImpersonatedSchool(prev => ({
        ...prev,
        name: updatedCfg.school_name || prev.name,
        director: updatedCfg.director_name || prev.director,
        district: updatedCfg.district || prev.district,
        phone: updatedCfg.phone || prev.phone,
        groupTerm: updatedCfg.group_term || 'SINF',
        lessonTerm: updatedCfg.lesson_term || 'DARS',
        studentTerm: updatedCfg.student_term || 'OQUVCHI',
      }));
    }

    if (currentUser && String(currentUser.schoolId) === sid) {
      saveSession({
        ...currentUser,
        schoolName: updatedCfg.school_name || currentUser.schoolName,
        district: updatedCfg.district || currentUser.district,
        name: updatedCfg.director_name ? `${updatedCfg.director_name} (Direktor)` : currentUser.name,
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setImpersonatedSchool(null);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={saveSession} schoolsList={schoolsList} />;
  }

  if (currentUser.role === 'SUPER_ADMIN') {
    if (impersonatedSchool) {
      const latestSchool = schoolsList.find(s => String(s.id) === String(impersonatedSchool.id)) || impersonatedSchool;
      return (
        <SchoolAdminDashboardView
          key={`school-dash-${latestSchool.id}`}
          currentUser={{
            role: 'SCHOOL_ADMIN',
            schoolId: String(latestSchool.id),
            username: latestSchool.username,
            name: `${latestSchool.director} (Direktor)`,
            directorName: latestSchool.director,
            phone: latestSchool.phone,
            schoolName: latestSchool.name,
            district: latestSchool.district,
            warningBanner: latestSchool.warningBanner,
            groupTerm: latestSchool.groupTerm || 'SINF',
            lessonTerm: latestSchool.lessonTerm || 'DARS',
            studentTerm: latestSchool.studentTerm || 'OQUVCHI',
            isSuperAdminImpersonating: true,
            actorLabel: `Super Admin (${currentUser.name || 'Bosh Boshqarma'}) — ${latestSchool.name} dashbordi orqali`,
            actorRole: 'SUPER_ADMIN',
          }}
          globalAnnouncement={globalAnnouncement}
          handleLogout={handleLogout}
          onReturnToSuperAdmin={() => setImpersonatedSchool(null)}
          onSchoolConfigSaved={handleSchoolConfigSaved}
        />
      );
    }
    return (
      <SuperAdminDashboardView
        currentUser={currentUser}
        schoolsList={schoolsList}
        onUpdateSchools={updateSchoolsList}
        onEnterSchool={(school) => setImpersonatedSchool(school)}
        handleLogout={handleLogout}
        globalAnnouncement={globalAnnouncement}
        onUpdateAnnouncement={handleUpdateAnnouncement}
      />
    );
  }

  if (currentUser.role === 'TEACHER') {
    return <TeacherDashboardView currentUser={currentUser} handleLogout={handleLogout} />;
  }

  const matchedUserSchool =
    schoolsList.find(s => String(s.id) === String(currentUser.schoolId) || s.username === currentUser.username) ||
    schoolsList[0];

  return (
    <SchoolAdminDashboardView
      key={`school-dash-${matchedUserSchool.id}`}
      currentUser={{
        ...currentUser,
        schoolId: String(matchedUserSchool.id),
        schoolName: matchedUserSchool.name,
        directorName: matchedUserSchool.director,
        phone: matchedUserSchool.phone,
        district: matchedUserSchool.district,
        groupTerm: matchedUserSchool.groupTerm || 'SINF',
        lessonTerm: matchedUserSchool.lessonTerm || 'DARS',
        studentTerm: matchedUserSchool.studentTerm || 'OQUVCHI',
        warningBanner: matchedUserSchool?.warningBanner || '',
        isSuperAdminImpersonating: false,
        actorLabel: currentUser.actorLabel || `${matchedUserSchool.director} (${matchedUserSchool.username} — Direktor)`,
        actorRole: 'SCHOOL_ADMIN',
      }}
      globalAnnouncement={globalAnnouncement}
      handleLogout={handleLogout}
      onSchoolConfigSaved={handleSchoolConfigSaved}
    />
  );
}

// =========================================================================
// 1. UNIVERSAL LOGIN SAHIFASI (EASY LEARN PURPLE THEME)
// =========================================================================
function LoginPage({ onLoginSuccess, schoolsList = DEFAULT_SCHOOLS }) {
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin123' });
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    const username = (loginForm.username || '').trim();
    const password = (loginForm.password || '').trim();

    // 1. Asosiy Super Admin (Barcha maktablar boshqaruvi)
    if (username === 'admin' && password === 'admin123') {
      onLoginSuccess({
        role: 'SUPER_ADMIN',
        username: 'admin',
        name: 'Bosh Boshqarma (Super Admin)',
        organization: "Maktabgacha va Maktab Ta'limi Boshqarmasi",
      });
      return;
    }

    // 2. Maktab Direktori / Admini (Ro'yxatdagi barcha maktablar bo'yicha)
    const matchedSchool = schoolsList.find(
      (s) => s.username.toLowerCase() === username.toLowerCase() && s.password === password
    );
    if (matchedSchool) {
      if (matchedSchool.status === 'BLOCKED') {
        setLoginError(`⛔ "${matchedSchool.name}" hisobi Super Admin tomonidan vaqtincha bloklangan!`);
        return;
      }
      onLoginSuccess({
        role: 'SCHOOL_ADMIN',
        schoolId: String(matchedSchool.id),
        username: matchedSchool.username,
        name: `${matchedSchool.director} (Direktor)`,
        schoolName: matchedSchool.name,
        district: matchedSchool.district,
        isSuperAdminImpersonating: false,
        actorLabel: `${matchedSchool.director} (${matchedSchool.username} — Direktor)`,
        actorRole: 'SCHOOL_ADMIN',
      });
      return;
    }

    // 3. O'qituvchi / Ustoz Dashbordi (5 xonali unikal ID yoki teacher orqali)
    setLoading(true);
    try {
      const res = await fetch('/api/teachers/?all_schools=1');
      if (res.ok) {
        const teachers = await res.json();
        const matchedTeacher = (Array.isArray(teachers) ? teachers : []).find(
          t => (
            String(t.teacher_id) === username || 
            String(t.username) === username || 
            (username === 'teacher' && (String(t.username) === '20101' || t.id === 1))
          ) && (
            (t.initial_password && t.initial_password === password) ||
            password === 'teacher123'
          )
        );
        if (matchedTeacher) {
          onLoginSuccess({
            role: 'TEACHER',
            schoolId: String(matchedTeacher.school_id || '1'),
            schoolName: matchedTeacher.school_name || "1-sonli Ixtisoslashtirilgan Maktab-Kollej",
            username: matchedTeacher.username,
            teacherId: matchedTeacher.teacher_id || matchedTeacher.username,
            name: matchedTeacher.name,
            assignedGroup: matchedTeacher.group,
            subject: matchedTeacher.subject,
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Backend teacher verification check failed, fallback to offline check", err);
    } finally {
      setLoading(false);
    }

    // Offline / Standart Test O'qituvchi hisobi
    if ((username === 'teacher' || username === '20101') && (password === 'teacher123' || password === 'admin123')) {
      onLoginSuccess({
        role: 'TEACHER',
        schoolId: '1',
        schoolName: "1-sonli Ixtisoslashtirilgan Maktab-Kollej",
        username: '20101',
        teacherId: '20101',
        name: 'Akmal Rahimov (Matematika & IT)',
        assignedGroup: '9-A',
        subject: 'Oliy Matematika',
      });
      return;
    }

    setLoginError("Login yoki parol noto'g'ri! O'qituvchilar maktab dashbordida ko'rsatilgan 5 xonali unikal ID (masalan: 20101) va parolidan foydalanishi kerak.");
  };

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: THEME.bgSoft, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 460, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 36, boxShadow: '0 20px 40px -15px rgba(108, 92, 231, 0.15)', border: `1px solid ${THEME.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img 
            src="/idrok_logo.png" 
            alt="Idrok Edu" 
            style={{ height: 68, objectFit: 'contain', margin: '0 auto 12px auto', display: 'block' }} 
          />
          <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>Yagona Ta'lim va Davomat Boshqaruv Ekotizimi</p>
        </div>

        {loginError && (
          <div style={{ padding: 12, backgroundColor: '#FFF0F0', border: '1px solid #FFD0D0', borderRadius: 14, color: '#D63031', fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} /> {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Foydalanuvchi Logini (yoki 5 xonali O'qituvchi ID)</label>
            <input 
              required
              placeholder="admin, maktab1 yoki 5 xonali ID (masalan: 20101)"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value.trim() })}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 16, border: `1px solid #E2E8F0`, marginTop: 6, boxSizing: 'border-box', fontSize: 14, outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Maxfiy Parol</label>
            <input 
              type="password"
              required
              placeholder="••••••••"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 16, border: `1px solid #E2E8F0`, marginTop: 6, boxSizing: 'border-box', fontSize: 14, outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: 15, background: THEME.gradient, color: 'white', borderRadius: 18, border: 'none', fontWeight: 800, fontSize: 15, cursor: loading ? 'wait' : 'pointer', marginTop: 10, boxShadow: '0 10px 20px rgba(108, 92, 231, 0.3)', opacity: loading ? 0.7 : 1 }}>
            {loading ? "Tekshirilmoqda..." : "Tizimga Kirish  ➔"}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 14, backgroundColor: THEME.primaryLight, borderRadius: 18, fontSize: 12, color: THEME.primary, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 800, marginBottom: 2 }}>Tezkor Kirish (Bosib tanlang):</div>
          <button
            type="button"
            onClick={() => setLoginForm({ username: 'admin', password: 'admin123' })}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 12, border: `1px solid ${loginForm.username === 'admin' ? THEME.primary : 'transparent'}`, backgroundColor: '#FFFFFF', color: THEME.textDark, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src="/idrok_superadmin_icon.png" alt="Super Admin" style={{ width: 18, height: 18, borderRadius: 5, objectFit: 'contain' }} />
              <b>Super Admin (Barcha Maktablar):</b>
            </span>
            <code>admin / admin123</code>
          </button>
          <button
            type="button"
            onClick={() => setLoginForm({ username: 'maktab1', password: 'school123' })}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 12, border: `1px solid ${loginForm.username === 'maktab1' ? THEME.primary : 'transparent'}`, backgroundColor: '#FFFFFF', color: THEME.textDark, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src="/idrok_icon.png" alt="1-Maktab" style={{ width: 18, height: 18, borderRadius: 5, objectFit: 'contain' }} />
              <b>1-Maktab Direktori:</b>
            </span>
            <code>maktab1 / school123</code>
          </button>
          <button
            type="button"
            onClick={() => setLoginForm({ username: 'maktab2', password: 'school123' })}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 12, border: `1px solid ${loginForm.username === 'maktab2' ? THEME.primary : 'transparent'}`, backgroundColor: '#FFFFFF', color: THEME.textDark, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src="/idrok_icon.png" alt="24-Maktab" style={{ width: 18, height: 18, borderRadius: 5, objectFit: 'contain' }} />
              <b>24-Prezident Maktabi Direktori:</b>
            </span>
            <code>maktab2 / school123</code>
          </button>
          <button
            type="button"
            onClick={() => setLoginForm({ username: '20101', password: 'teacher123' })}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 12, border: `1px solid ${loginForm.username === '20101' ? THEME.primary : 'transparent'}`, backgroundColor: '#FFFFFF', color: THEME.textDark, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src="/idrok_icon.png" alt="O'qituvchi" style={{ width: 18, height: 18, borderRadius: 5, objectFit: 'contain' }} />
              <b>O'qituvchi (5 xonali ID):</b>
            </span>
            <code>20101 / teacher123</code>
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. MAKTAB ADMINI DASHBORDI (TO'LIQ IZOLYATSIYALANGAN MULTI-TENANT BAZA)
// =========================================================================
function SchoolAdminDashboardView({ currentUser, handleLogout, onReturnToSuperAdmin, globalAnnouncement, onSchoolConfigSaved }) {
  const schoolId = String(currentUser?.schoolId || '1');
  const [schoolConfig, setSchoolConfig] = useState({
    school_id: schoolId,
    school_name: currentUser?.schoolName || "1-sonli Ixtisoslashtirilgan Maktab-Kollej",
    institution_type: "Ixtisoslashtirilgan Maktab-Kollej",
    district: currentUser?.district || "Yunusobod tumani",
    address: "Amir Temur shoh ko'chasi, 14-uy",
    director_name: currentUser?.directorName || "Rahimov Jamshid",
    phone: currentUser?.phone || "+998 90 123-45-67",
    academic_year: "2026-2027",
    group_term: currentUser?.groupTerm || 'SINF',
    lesson_term: currentUser?.lessonTerm || 'DARS',
    student_term: currentUser?.studentTerm || 'OQUVCHI',
    qr_refresh_seconds: 25,
    late_threshold_minutes: 10,
    grading_scale: '5_BALL',
    latitude: null,
    longitude: null,
    location_address: '',
    radius_meters: 150,
    is_location_set: false,
  });

  const schoolName = schoolConfig?.school_name || currentUser?.schoolName || "1-sonli Ixtisoslashtirilgan Maktab-Kollej";
  const terms = buildSchoolTerms(schoolConfig);
  const isLocationMissing = !schoolConfig?.is_location_set && (schoolConfig?.latitude == null || schoolConfig?.longitude == null);

  const actorLabel =
    currentUser?.actorLabel ||
    `${schoolConfig?.director_name || currentUser?.name || 'Maktab Direktori'} (${currentUser?.username || 'maktab1'})`;
  const actorRole = currentUser?.actorRole || (currentUser?.isSuperAdminImpersonating ? 'SUPER_ADMIN' : 'SCHOOL_ADMIN');

  const [activeTab, setActiveTabState] = useState(() => {
    return sessionStorage.getItem(`school_active_tab_${schoolId}`) || 'matrix';
  });

  const setActiveTab = (tab) => {
    sessionStorage.setItem(`school_active_tab_${schoolId}`, tab);
    setActiveTabState(tab);
  };

  const [realStudents, setRealStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [selectedTeacherForModal, setSelectedTeacherForModal] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Dars jadvali (Schedule) boshqaruvi holatlari
  const [schedulesList, setSchedulesList] = useState([]);
  const [selectedScheduleClassId, setSelectedScheduleClassId] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [editingLessonSchedule, setEditingLessonSchedule] = useState(null);

  const appendGlobalAudit = (action, target, detail) => {
    try {
      const saved = localStorage.getItem('smart_school_audit_logs');
      const prev = saved ? JSON.parse(saved) : [];
      const entry = {
        id: Date.now(),
        time: new Date().toLocaleString('uz-UZ'),
        actor: actorLabel,
        ip: '127.0.0.1',
        action,
        target: `${schoolName} — ${target}`,
        detail,
      };
      localStorage.setItem('smart_school_audit_logs', JSON.stringify([entry, ...prev]));
    } catch (_) {}
  };

  // Yangi o'quvchi formasi
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    classId: '',
    password: '',
    photo: null,
    photoPreview: null
  });

  // Yangi guruh/sinf formasi
  const [newGroup, setNewGroup] = useState({
    name: '',
    academicYear: '2026-2027',
    teacher: '',
    room: '',
    shift: 1,
  });

  // Yangi o'qituvchi formasi
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    subject: '',
    phone: '+998 ',
    group: '',
    rooms: '',
    password: '',
    photo: null,
    photoPreview: null,
  });

  const fetchBackendData = async () => {
    setLoading(true);
    try {
      const q = `school_id=${encodeURIComponent(schoolId)}`;
      const [cfgRes, stuRes, clsRes, tchRes, schRes] = await Promise.all([
        fetch(`/api/school-config/?${q}`),
        fetch(`/api/students/?${q}`),
        fetch(`/api/classes/?${q}`),
        fetch(`/api/teachers/?${q}`),
        fetch(`/api/schedule/?${q}`),
      ]);
      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        if (cfgData && cfgData.school_id) {
          setSchoolConfig(cfgData);
          if (onSchoolConfigSaved) {
            onSchoolConfigSaved(cfgData);
          }
        }
      }
      if (stuRes.ok) {
        const d = await stuRes.json();
        setRealStudents(Array.isArray(d) ? d : []);
      }
      if (clsRes.ok) {
        const c = await clsRes.json();
        const sortedClasses = (Array.isArray(c) ? c : []).sort((a, b) =>
          (a.name || '').localeCompare(b.name || '', undefined, { numeric: true })
        );
        setClassesList(sortedClasses);
        if (sortedClasses.length > 0) {
          setSelectedScheduleClassId(prev => prev || sortedClasses[0].id);
          setNewStudent(prev => ({
            ...prev,
            classId: sortedClasses.some(item => String(item.id) === String(prev.classId))
              ? prev.classId
              : sortedClasses[0].id
          }));
          setSelectedGroupFilter(prev =>
            prev === 'ALL' || prev === 'Guruhsiz' || sortedClasses.some(item => item.name === prev)
              ? prev
              : sortedClasses[0].name
          );
        } else {
          setNewStudent(prev => ({ ...prev, classId: '' }));
          setSelectedGroupFilter('ALL');
        }
      }
      if (tchRes.ok) {
        const t = await tchRes.json();
        setTeachersList(Array.isArray(t) ? t : []);
      }
      if (schRes.ok) {
        const s = await schRes.json();
        setSchedulesList(Array.isArray(s.schedules) ? s.schedules : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async (targetClassId) => {
    try {
      setScheduleLoading(true);
      let url = `/api/schedule/?school_id=${encodeURIComponent(schoolId)}`;
      if (targetClassId) {
        url += `&class_id=${encodeURIComponent(targetClassId)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSchedulesList(Array.isArray(data.schedules) ? data.schedules : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleSaveScheduleItem = async (formData) => {
    try {
      const isEdit = Boolean(formData.id);
      const url = isEdit 
        ? `/api/schedule/${formData.id}/`
        : `/api/schedule/`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          school_id: schoolId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Dars jadvalini saqlashda xatolik yuz berdi");
      }
      const result = await res.json();
      await fetchSchedules();
      setShowAddLessonModal(false);
      setEditingLessonSchedule(null);
      appendGlobalAudit(
        isEdit ? 'UPDATE_SCHEDULE' : 'CREATE_SCHEDULE',
        `${formData.subject_name || 'Dars'}`,
        `${schoolName} — dars jadvaliga dars ${isEdit ? "yangilandi" : "kiritildi"}`
      );
      alert(result.message || "✅ Dars jadvali muvaffaqiyatli saqlandi!");
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleDeleteSchedule = async (scheduleId, label) => {
    if (!window.confirm(`Haqiqatan ham "${label || 'ushbu dars'}"ni dars jadvalidan o'chirmoqchimisiz?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/schedule/${scheduleId}/`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Darsni o'chirishda xatolik");
      setSchedulesList(prev => prev.filter(s => s.id !== scheduleId));
      appendGlobalAudit('DELETE_SCHEDULE', label || 'Dars', `${schoolName} jadvalidan dars o'chirildi`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleQuickSeedSchedule = async (classId, className) => {
    if (!window.confirm(`"${className || 'Ushbu sinf'}" uchun avtomatik namunaviy haftalik dars jadvalini yuklashni xohlaysizmi?\n\n(Dushanbadan Shanbagacha barcha asosiy fanlar va maktab o'qituvchilari biriktiriladi)`)) {
      return;
    }
    try {
      setScheduleLoading(true);
      const res = await fetch(`/api/schedule/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'QUICK_SEED',
          class_id: classId,
          school_id: schoolId,
        }),
      });
      if (!res.ok) throw new Error("Namuna jadvalni yuklashda xatolik yuz berdi");
      const result = await res.json();
      await fetchSchedules();
      appendGlobalAudit('SEED_SCHEDULE', className || 'Sinf', `${schoolName} — ${className} uchun haftalik dars jadvali avtomatik yaratildi`);
      alert(result.message || "✅ Haftalik dars jadvali to'liq to'ldirildi!");
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleClearClassSchedule = async (classId, className) => {
    if (!window.confirm(`Diqqat! "${className || 'Ushbu sinf'}"ning barcha haftalik dars jadvalini tozalashni tasdiqlaysizmi?`)) {
      return;
    }
    try {
      setScheduleLoading(true);
      const res = await fetch(`/api/schedule/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLEAR_CLASS',
          class_id: classId,
          school_id: schoolId,
        }),
      });
      if (!res.ok) throw new Error("Jadvalni tozalashda xatolik yuz berdi");
      await fetchSchedules();
      appendGlobalAudit('CLEAR_SCHEDULE', className || 'Sinf', `${schoolName} — ${className} dars jadvali tozalandi`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, [schoolId]);

  const handleSaveSchoolConfig = async (payload) => {
    try {
      const res = await fetch('/api/school-config/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          school_id: schoolId,
          updated_by: actorLabel,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { ok: false, error: errData.detail || "Sozlamalarni saqlashda xatolik yuz berdi" };
      }
      const saved = await res.json();
      setSchoolConfig(saved);
      if (onSchoolConfigSaved) {
        onSchoolConfigSaved(saved);
      }
      appendGlobalAudit(
        'UPDATE_SCHOOL_CONFIG',
        saved.school_name,
        `Maktab sozlamalari yangilandi: Rejim=${saved.group_term}/${saved.lesson_term}/${saved.student_term} (${actorLabel})`
      );
      await fetchBackendData();
      return { ok: true, data: saved };
    } catch (err) {
      return { ok: false, error: err.message || "Tarmoq xatoligi" };
    }
  };

  // O'quvchi bosilganda Guruhlar sahifasiga o'tib, shu o'quvchini ko'rsatish
  const handleOpenStudentInGroup = (student) => {
    setSelectedStudentForModal(student);
    if (student.class_name && student.class_name !== 'Guruhsiz') {
      setSelectedGroupFilter(student.class_name);
    }
    setActiveTab('groups');
  };

  // Yangi Guruh / Sinf yaratish (Faqat shu maktab bazasiga!)
  const handleAddGroup = async (e) => {
    e.preventDefault();
    const cleanName = newGroup.name.trim();
    if (!cleanName) {
      alert(`Iltimos, ${terms.groupSingularLower} nomini kiriting (masalan: 11-B)!`);
      return;
    }
    try {
      const res = await fetch('/api/classes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          academic_year: newGroup.academicYear.trim() || schoolConfig?.academic_year || '2026-2027',
          school_id: schoolId,
          school_name: schoolName,
          advisor_teacher: newGroup.teacher.trim() || `Maktab ${terms.advisorLabel}`,
          room_number: newGroup.room.trim() || "Asosiy o'quv binosi",
          shift: Number(newGroup.shift) || 1,
          created_by: actorLabel,
          created_by_role: actorRole,
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `${terms.groupSingular} yaratishda xatolik`);
      }
      const created = await res.json();

      const updatedClasses = [...classesList.filter(c => c.id !== created.id), created].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', undefined, { numeric: true })
      );
      setClassesList(updatedClasses);
      if (!newStudent.classId) {
        setNewStudent(prev => ({ ...prev, classId: created.id }));
      }

      appendGlobalAudit('CREATE_CLASS', `${created.name} ${terms.groupGenitiveLower}`, `${schoolName} bazasida "${created.name}" ${terms.groupGenitiveLower} yaratildi (${actorLabel})`);
      setSelectedGroupFilter(created.name);
      setShowAddGroupModal(false);
      setNewGroup({ name: '', academicYear: schoolConfig?.academic_year || '2026-2027', teacher: '', room: '', shift: 1 });
      alert(`✅ "${created.name}" ${terms.groupGenitiveLower} "${schoolName}" bazasida muvaffaqiyatli yaratildi!`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  // Guruh / Sinf ma'lumotlarini o'zgartirish (Edit Group CRUD)
  const handleUpdateGroup = async (groupId, updatedFields) => {
    try {
      const res = await fetch(`/api/classes/${groupId}/?school_id=${encodeURIComponent(schoolId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `${terms.groupSingular}ni yangilashda xatolik`);
      }
      const updated = await res.json();
      const updatedList = classesList.map(c => c.id === groupId ? updated : c).sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', undefined, { numeric: true })
      );
      setClassesList(updatedList);
      if (selectedGroupFilter === editingGroup?.name) {
        setSelectedGroupFilter(updated.name);
      }
      setEditingGroup(null);
      appendGlobalAudit(
        'UPDATE_CLASS',
        `${updated.name} ${terms.groupGenitiveLower}`,
        `${schoolName} bazasida "${updated.name}" ${terms.groupGenitiveLower} ma'lumotlari yangilandi (${actorLabel})`
      );
      // O'quvchilar ro'yxatidagi class_name larni yangilash uchun backenddan qayta olamiz
      fetchBackendData();
      alert(`✅ "${updated.name}" ${terms.groupGenitiveLower} muvaffaqiyatli yangilandi!`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleDeleteGroup = async (clsId, clsNameArg) => {
    const id = typeof clsId === 'object' ? clsId?.id : clsId;
    const name = clsNameArg || (typeof clsId === 'object' ? clsId?.name : '');
    if (!id) return;
    if (!window.confirm(`Rostdan ham "${name}" ${terms.groupGenitiveLower}ni ushbu maktab bazasidan o'chirmoqchimisiz?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/classes/${id}/?school_id=${encodeURIComponent(schoolId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`${terms.groupSingular}ni o'chirishda xatolik`);
      const remaining = classesList.filter(c => c.id !== id);
      setClassesList(remaining);
      setSelectedGroupFilter(remaining.length > 0 ? remaining[0].name : 'ALL');
      appendGlobalAudit('DELETE_CLASS', `${name} ${terms.groupGenitiveLower}`, `${schoolName} bazasidan "${name}" ${terms.groupGenitiveLower} o'chirildi`);
      fetchBackendData();
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  // Yangi O'qituvchi qo'shish (Faqat shu maktab bazasiga!)
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacher.name.trim() || !newTeacher.subject.trim()) {
      alert("Iltimos, o'qituvchi F.I.Sh. va fan nomini kiriting!");
      return;
    }
    try {
      let body;
      let headers = {};
      if (newTeacher.photo) {
        const fd = new FormData();
        fd.append('name', newTeacher.name.trim());
        fd.append('subject', newTeacher.subject.trim());
        fd.append('phone', newTeacher.phone?.trim() || "+998 90 000-00-00");
        fd.append('group', newTeacher.group?.trim() || "Fan o'qituvchisi");
        fd.append('rooms', newTeacher.rooms?.trim() || "Asosiy bino");
        fd.append('password', newTeacher.password?.trim() || "teacher123");
        fd.append('school_id', schoolId);
        fd.append('school_name', schoolName);
        fd.append('created_by', actorLabel);
        fd.append('created_by_role', actorRole);
        fd.append('photo_3x4', newTeacher.photo);
        body = fd;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          name: newTeacher.name.trim(),
          subject: newTeacher.subject.trim(),
          phone: newTeacher.phone.trim() || "+998 90 000-00-00",
          group: newTeacher.group.trim() || "Fan o'qituvchisi",
          rooms: newTeacher.rooms.trim() || "Asosiy bino",
          password: newTeacher.password?.trim() || "teacher123",
          school_id: schoolId,
          school_name: schoolName,
          created_by: actorLabel,
          created_by_role: actorRole,
        });
      }

      const res = await fetch('/api/teachers/', {
        method: 'POST',
        headers,
        body,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || "O'qituvchi qo'shishda xatolik");
      }
      const createdTeacher = await res.json();
      setTeachersList([createdTeacher, ...teachersList]);
      appendGlobalAudit('CREATE_TEACHER', createdTeacher.name, `${schoolName} bazasiga ustoz "${createdTeacher.name}" (${createdTeacher.subject}) qo'shildi`);
      setShowAddTeacherModal(false);
      setNewTeacher({ name: '', subject: '', phone: '+998 ', group: '', rooms: '', password: '', photo: null, photoPreview: null });
      alert(
        `✅ Ustoz "${createdTeacher.name}" faqat "${schoolName}" bazasiga muvaffaqiyatli qo'shildi!\n\n` +
        `🔑 5 xonali Kirish ID raqami: ${createdTeacher.teacher_id || createdTeacher.username}\n` +
        `🔒 Maxfiy Parol: ${createdTeacher.initial_password || newTeacher.password?.trim() || 'teacher123'}\n\n` +
        `O'qituvchi ushbu 5 xonali unikal ID va parol orqali veb-kabinetga hamda mobil ilovaga kirishi mumkin.`
      );
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleDeleteTeacher = async (teacherId, teacherName) => {
    if (!window.confirm(`Rostdan ham "${teacherName}" o'qituvchisini "${schoolName}" ro'yxatidan o'chirmoqchimisiz?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/teachers/${teacherId}/?school_id=${encodeURIComponent(schoolId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("O'qituvchini o'chirishda xatolik");
      setTeachersList(teachersList.filter(t => t.id !== teacherId));
      if (selectedTeacherForModal && selectedTeacherForModal.id === teacherId) {
        setSelectedTeacherForModal(null);
      }
      appendGlobalAudit('DELETE_TEACHER', teacherName, `${schoolName} bazasidan ustoz "${teacherName}" o'chirildi`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  // CSV Eksport funksiyasi (Matritsa va Davomat Auditi sahifalari uchun)
  const handleExportCSV = (mode) => {
    let csvContent = "\uFEFF";
    if (mode === 'matrix') {
      csvContent += `ID,Familiya va Ism,Maktab,${terms.groupSingular},Yaratgan Shaxs,Yaratilgan Vaqt,Dushanba,Seshanba,Chorshanba,Payshanba,Juma,Shanba\n`;
      realStudents.forEach(st => {
        csvContent += `${st.student_id},"${st.last_name} ${st.first_name}","${st.school_name || schoolName}",${st.class_name || terms.noGroupLabel},"${st.created_by || actorLabel}","${st.date_joined || ''}",Bor,Bor,Bor,Kechikkan,Bor,Bor\n`;
      });
    } else {
      csvContent += `ID,Familiya va Ism,Maktab,${terms.groupSingular},Yaratgan Shaxs,Bino Kirishi,${terms.lessonSingular} QR Skanerlash,Holat\n`;
      realStudents.forEach(st => {
        csvContent += `${st.student_id},"${st.last_name} ${st.first_name}","${st.school_name || schoolName}",${st.class_name || terms.noGroupLabel},"${st.created_by || actorLabel}",08:14:22,08:32:05 (Dinamik QR),Tasdiqlangan\n`;
      });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', mode === 'matrix' ? `maktab_${schoolId}_matritsa.csv` : `maktab_${schoolId}_davomat_auditi.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.firstName.trim() || !newStudent.lastName.trim()) {
      alert("Iltimos, ism va familiyani kiriting!");
      return;
    }
    try {
      const fd = new FormData();
      fd.append('first_name', newStudent.firstName.trim());
      fd.append('last_name', newStudent.lastName.trim());
      if (newStudent.classId) fd.append('class_id', newStudent.classId);
      if (newStudent.password) fd.append('password', newStudent.password.trim());
      if (newStudent.photo) fd.append('photo_3x4', newStudent.photo);
      // Maktab izolyatsiyasi va kim tomonidan yaratilganlik tarixi
      fd.append('school_id', schoolId);
      fd.append('school_name', schoolName);
      fd.append('created_by', actorLabel);
      fd.append('created_by_role', actorRole);

      const res = await fetch('/api/students/', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Qo'shishda xatolik");
      }
      const created = await res.json();
      setRealStudents([created, ...realStudents]);
      appendGlobalAudit(
        'CREATE_STUDENT',
        `${created.last_name} ${created.first_name} (ID: ${created.student_id})`,
        `${terms.studentSingular} "${schoolName}" bazasiga "${actorLabel}" tomonidan yaratildi`
      );
      setShowAddStudentModal(false);
      setNewStudent({
        firstName: '',
        lastName: '',
        classId: classesList.length > 0 ? classesList[0].id : '',
        password: '',
        photo: null,
        photoPreview: null
      });
      alert(
        `✅ Yangi ${terms.studentSingularLower} "${schoolName}" bazasiga qo'shildi!\n` +
        `Kirish ID (5 xonali): ${created.student_id}\n` +
        `Paroli: ${created.initial_password}\n` +
        `Yaratuvchi: ${created.created_by}`
      );
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleUpdateStudent = async (studentId, formData) => {
    try {
      formData.append('school_id', schoolId);
      const res = await fetch(`/api/students/${studentId}/?school_id=${encodeURIComponent(schoolId)}`, {
        method: 'PUT',
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || "Yangilashda xatolik");
      }
      const updated = await res.json();
      setRealStudents(realStudents.map(s => s.id === studentId ? updated : s));
      if (selectedStudentForModal && selectedStudentForModal.id === studentId) {
        setSelectedStudentForModal(updated);
      }
      setEditingStudent(null);
      appendGlobalAudit('UPDATE_STUDENT', `${updated.last_name} ${updated.first_name}`, `${terms.studentSingular} ma'lumotlari "${actorLabel}" tomonidan yangilandi`);
      alert(`✅ ${terms.studentSingular} ma'lumotlari muvaffaqiyatli yangilandi!`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Rostdan ham "${studentName}" ${terms.studentSingularLower}ni "${schoolName}" bazasidan o'chirmoqchimisiz?\nBu amal qaytarilmaydi!`)) {
      return;
    }
    try {
      const res = await fetch(`/api/students/${studentId}/?school_id=${encodeURIComponent(schoolId)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("O'chirishda xatolik");
      setRealStudents(realStudents.filter(s => s.id !== studentId));
      if (selectedStudentForModal && selectedStudentForModal.id === studentId) {
        setSelectedStudentForModal(null);
      }
      appendGlobalAudit('DELETE_STUDENT', studentName, `${terms.studentSingular} "${schoolName}" bazasidan "${actorLabel}" tomonidan o'chirildi`);
      alert(`🗑️ "${studentName}" ushbu maktab bazasidan muvaffaqiyatli o'chirildi!`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: THEME.bgSoft, overflow: 'hidden' }}>
      
      {/* SIDEBAR (EASY LEARN PURPLE THEME) */}
      <aside style={{ width: 286, backgroundColor: '#FFFFFF', borderRight: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', padding: '24px 18px', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingLeft: 6 }}>
          <img 
            src="/idrok_icon.png" 
            alt="Idrok Edu" 
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 14, 
              objectFit: 'contain', 
              boxShadow: '0 8px 18px rgba(108, 92, 231, 0.25)', 
              flexShrink: 0 
            }} 
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 900, fontSize: 15, color: THEME.textDark }}>Idrok Edu</span>
              <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 6, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 800 }}>CORE</span>
            </div>
            <div title={schoolName} style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {schoolName} • #{schoolId}
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NavButton active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')} icon={<Calendar size={18} />} label={`${terms.lessonSingular} Matritsasi`} badge="Jonli" />
          <NavButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<Calendar size={18} />} label={`${terms.lessonSingular} Jadvali`} badge={schedulesList.length > 0 ? `${schedulesList.length} ta` : undefined} />
          <NavButton active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} icon={<FolderOpen size={18} />} label={`${terms.groupPlural} Boshqaruvi`} badge={`${classesList.length} ta`} />
          <NavButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={18} />} label={terms.studentPlural} badge={`${realStudents.length} ta`} />
          <NavButton active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} icon={<GraduationCap size={18} />} label="O'qituvchilar" badge={`${teachersList.length} ta`} />
          <NavButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<Cpu size={18} />} label="Idrok Vision (Face ID)" badge="Jonli 🔴" />
          <div style={{ margin: '6px 4px', borderTop: `1px dashed ${THEME.border}` }} />
          <NavButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<Sliders size={18} />}
            label="Maktab Sozlamalari"
            badge={isLocationMissing ? "📍 Kiritish shart!" : terms.groupSingular}
            badgeColor={isLocationMissing ? "#EF4444" : undefined}
          />
        </div>

        {/* Super Admin ga qaytish tugmasi (agar Super Admin maktab kabinetiga kirgan bo'lsa) */}
        {onReturnToSuperAdmin && (
          <button
            onClick={onReturnToSuperAdmin}
            style={{
              width: '100%',
              padding: '12px 14px',
              marginBottom: 14,
              borderRadius: 16,
              border: 'none',
              background: THEME.warmGradient,
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 18px rgba(255, 101, 132, 0.3)',
            }}>
            <Shield size={16} /> ⬅ Super Adminga Qaytish
          </button>
        )}

        {/* Bottom Profile */}
        <div style={{ paddingTop: 16, borderTop: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: THEME.primaryLight, color: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, flexShrink: 0 }}>
              {currentUser?.isSuperAdminImpersonating ? 'SA' : 'DR'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.isSuperAdminImpersonating ? 'Super Admin (Boshqaruvda)' : (schoolConfig?.director_name || currentUser?.name || "Maktab Direktori")}
              </div>
              <div style={{ fontSize: 11, color: THEME.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: THEME.green }}></span> Maktab #{schoolId} izolyatsiyada
              </div>
            </div>
          </div>
          <button onClick={handleLogout} title="Chiqish" style={{ background: '#F8F9FE', border: 'none', color: '#EF4444', padding: 9, borderRadius: 12, cursor: 'pointer', flexShrink: 0 }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Top Bar — Sahifaga qarab o'zgaruvchi dinamik tugmalar */}
        <header style={{ padding: '20px 32px', backgroundColor: '#FFFFFF', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: THEME.textDark, margin: 0 }}>
                {activeTab === 'matrix' && `${terms.lessonSingular} Matritsasi & Davomat Jadvali`}
                {activeTab === 'schedule' && `${terms.groupPlural} Bo'yicha ${terms.lessonSingular} Jadvali & Rejasi`}
                {activeTab === 'groups' && `Maktab ${terms.groupPlural}i & Ularning ${terms.studentPlural}i`}
                {activeTab === 'students' && `Maktab ${terms.studentPlural} Bazasi & Yaratilganlik Tarixi`}
                {activeTab === 'teachers' && "Maktab O'qituvchilari Ro'yxati"}
                {activeTab === 'attendance' && `Idrok Vision • Bino va ${terms.groupPlural} Bo'yicha Jonli Davomat Auditi`}
                {activeTab === 'settings' && "Maktab Sozlamalari va Tizim Konfiguratsiyasi (Nastroyka)"}
              </h1>
              <span style={{ padding: '4px 10px', borderRadius: 10, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 800, fontSize: 11.5 }}>
                🔒 Faqat {schoolName} bazasi
              </span>
              <button
                onClick={() => setActiveTab('settings')}
                title="Maktab terminologiyasi va rejimini sozlash"
                style={{
                  padding: '4px 10px',
                  borderRadius: 10,
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: THEME.green,
                  fontWeight: 800,
                  fontSize: 11.5,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                <Sliders size={12} /> Rejim: {terms.groupPlural} • {terms.lessonPlural} • {terms.studentPlural}
              </button>
            </div>
            <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
              {schoolName} • {schoolConfig?.district || currentUser?.district || "Real vaqt monitoringi"} • O'quv yili: <b>{schoolConfig?.academic_year || '2026-2027'}</b> • Mas'ul: <b style={{ color: THEME.primary }}>{actorLabel}</b>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {onReturnToSuperAdmin && (
              <button
                onClick={onReturnToSuperAdmin}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', backgroundColor: '#FFF0F3', border: '1px solid #FFCCD5', borderRadius: 14, fontWeight: 800, fontSize: 13, color: '#E11D48', cursor: 'pointer' }}>
                <Shield size={14} /> Super Admin Paneli
              </button>
            )}
            <button 
              onClick={fetchBackendData} 
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}`, borderRadius: 14, fontWeight: 700, fontSize: 13, color: THEME.textDark, cursor: 'pointer' }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Yangilash
            </button>

            {/* 1. DARS MATRITSASI SAHIFASI TUGMASI */}
            {activeTab === 'matrix' && (
              <button 
                onClick={() => handleExportCSV('matrix')} 
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)' }}>
                <Download size={16} /> Matritsani Yuklash (CSV)
              </button>
            )}

            {/* DARS JADVALI SAHIFASI TUGMASI */}
            {activeTab === 'schedule' && (
              <button 
                onClick={() => {
                  setEditingLessonSchedule(null);
                  setShowAddLessonModal(true);
                }} 
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)' }}>
                <Plus size={16} /> + Yangi {terms.lessonSingular} Kiritish
              </button>
            )}

            {/* 2. GURUHLAR & SINFLAR SAHIFASI TUGMASI */}
            {activeTab === 'groups' && (
              <button 
                onClick={() => setShowAddGroupModal(true)} 
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)' }}>
                <Plus size={16} /> Yangi {terms.groupSingular} Yaratish
              </button>
            )}

            {/* 3. O'QUVCHILAR SAHIFASI TUGMASI */}
            {activeTab === 'students' && (
              <button 
                onClick={() => setShowAddStudentModal(true)} 
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)' }}>
                <UserPlus size={16} /> Yangi {terms.studentSingular} Qo'shish
              </button>
            )}

            {/* 4. O'QITUVCHILAR SAHIFASI TUGMASI */}
            {activeTab === 'teachers' && (
              <button 
                onClick={() => setShowAddTeacherModal(true)} 
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)' }}>
                <GraduationCap size={16} /> Yangi O'qituvchi Qo'shish
              </button>
            )}

            {/* 5. DAVOMAT AUDITI SAHIFASI TUGMASI */}
            {activeTab === 'attendance' && (
              <button 
                onClick={() => handleExportCSV('attendance')} 
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)' }}>
                <Download size={16} /> Audit Hisobotini Yuklash
              </button>
            )}
          </div>
        </header>

        {/* Super Admin tomonidan yuborilgan Global E'lon yoki Maktab Ogohlantirish Banneri */}
        {(globalAnnouncement || currentUser?.warningBanner) && (
          <div style={{ padding: '14px 32px 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {globalAnnouncement && (
              <div style={{ padding: '12px 18px', borderRadius: 16, background: THEME.gradient, color: '#FFFFFF', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 18px rgba(108, 92, 231, 0.2)' }}>
                <Bell size={16} /> <span><b>Rasmiy Xabarnoma (Super Admin):</b> {globalAnnouncement}</span>
              </div>
            )}
            {currentUser?.warningBanner && (
              <div style={{ padding: '12px 18px', borderRadius: 16, backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', color: '#B45309', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={16} /> <span>{currentUser.warningBanner}</span>
              </div>
            )}
          </div>
        )}

        {/* Maktab / Kollej Geometkasi (GPS Lokatsiyasi) belgilanmagan bo'lsa MAJBURIY ogohlantirish banneri */}
        {isLocationMissing && (
          <div style={{ padding: '16px 32px 0 32px' }}>
            <div style={{
              padding: '18px 24px',
              borderRadius: 22,
              background: 'linear-gradient(135deg, #FFF1F2 0%, #FEF2F2 100%)',
              border: '2px solid #F87171',
              boxShadow: '0 12px 28px rgba(239, 68, 68, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 18px rgba(239, 68, 68, 0.35)',
                  flexShrink: 0
                }}>
                  <MapPin size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      backgroundColor: '#FEE2E2',
                      color: '#B91C1C',
                      padding: '2px 8px',
                      borderRadius: 6
                    }}>
                      ⚠️ TO'LDIRISH MAJBURIY
                    </span>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#991B1B' }}>
                      Diqqat: Maktab / Kollejning xaritadagi geometkasi belgilanmagan!
                    </h4>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7F1D1D', fontWeight: 600, lineHeight: 1.45 }}>
                    Tizim to'liq ishlashi, davomat nazorati va mobil ilovalarda o'quvchi hamda o'qituvchilarning muassasa hududida ekanligini tasdiqlash uchun xaritadan nuqtani belgilash shart.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  padding: '12px 22px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 13.5,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 20px rgba(220, 38, 38, 0.35)',
                  whiteSpace: 'nowrap'
                }}>
                <MapPin size={16} /> Sozlamalarga kirish va Xaritada belgilash →
              </button>
            </div>
          </div>
        )}

        {/* Tab Contents */}
        <div style={{ padding: 32, flex: 1 }}>
          
          {/* TAB 1: DARS MATRITSASI */}
          {activeTab === 'matrix' && (
            <AttendanceMatrixSection
              realStudents={realStudents}
              schoolName={schoolName}
              terms={terms}
              onSelectStudent={handleOpenStudentInGroup}
              onAddStudent={() => setShowAddStudentModal(true)}
            />
          )}

          {/* TAB 1.5: DARS JADVALI */}
          {activeTab === 'schedule' && (
            <ScheduleManagementSection
              classesList={classesList}
              teachersList={teachersList}
              schedulesList={schedulesList}
              schoolId={schoolId}
              schoolName={schoolName}
              schoolConfig={schoolConfig}
              terms={terms}
              selectedClassId={selectedScheduleClassId}
              onSelectClassId={setSelectedScheduleClassId}
              onRefreshSchedules={() => fetchSchedules(selectedScheduleClassId)}
              onOpenAddModal={(prefill) => {
                setEditingLessonSchedule(prefill || null);
                setShowAddLessonModal(true);
              }}
              onEditSchedule={(item) => {
                setEditingLessonSchedule(item);
                setShowAddLessonModal(true);
              }}
              onDeleteSchedule={handleDeleteSchedule}
              onQuickSeed={handleQuickSeedSchedule}
              onClearClass={handleClearClassSchedule}
              onGoToSettings={() => setActiveTab('settings')}
              loading={scheduleLoading}
            />
          )}

          {/* TAB 2: GURUHLAR VA ULARNING O'QUVCHILARI */}
          {activeTab === 'groups' && (
            <GroupsManagementSection 
              classesList={classesList} 
              teachersList={teachersList}
              realStudents={realStudents}
              schoolName={schoolName}
              terms={terms}
              selectedFilter={selectedGroupFilter}
              onFilterChange={setSelectedGroupFilter}
              selectedStudentModal={selectedStudentForModal}
              onCloseStudentModal={() => setSelectedStudentForModal(null)}
              onSelectStudent={setSelectedStudentForModal}
              onEditStudent={setEditingStudent}
              onDeleteStudent={handleDeleteStudent}
              onOpenCreateGroup={() => setShowAddGroupModal(true)}
              onEditGroup={setEditingGroup}
              onDeleteGroup={handleDeleteGroup}
              onPreviewImage={setPreviewImage}
              onOpenScheduleForGroup={(classId) => {
                setSelectedScheduleClassId(classId);
                setActiveTab('schedule');
              }}
              onAddStudentToClass={(classObj) => {
                if (classObj && classObj.id) {
                  setNewStudent(prev => ({ ...prev, classId: classObj.id }));
                }
                setShowAddStudentModal(true);
              }}
            />
          )}

          {/* TAB 3: O'QUVCHILAR RO'YXATI */}
          {activeTab === 'students' && (
            <StudentsListSection 
              realStudents={realStudents} 
              schoolName={schoolName}
              terms={terms}
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              onStudentClick={handleOpenStudentInGroup} 
              onEditStudent={setEditingStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddStudent={() => setShowAddStudentModal(true)}
              onPreviewImage={setPreviewImage}
            />
          )}

          {/* TAB 4: O'QITUVCHILAR */}
          {activeTab === 'teachers' && (
            <TeachersListSection 
              teachers={teachersList}
              schoolName={schoolName}
              terms={terms}
              onTeacherClick={setSelectedTeacherForModal}
              onAddTeacher={() => setShowAddTeacherModal(true)}
              onDeleteTeacher={handleDeleteTeacher}
              onPreviewImage={setPreviewImage}
            />
          )}

          {/* TAB 5: DAVOMAT AUDITI */}
          {activeTab === 'attendance' && (
            <AttendanceAuditSection realStudents={realStudents} schoolName={schoolName} schoolId={schoolId} terms={terms} />
          )}

          {/* TAB 6: MAKTAB SOZLAMALARI (NASTROYKA) */}
          {activeTab === 'settings' && (
            <SchoolSettingsSection
              schoolId={schoolId}
              schoolConfig={schoolConfig}
              terms={terms}
              actorLabel={actorLabel}
              onSaveConfig={handleSaveSchoolConfig}
            />
          )}

        </div>
      </main>

      {/* Dars jadvalini kiritish va tahrirlash modali */}
      {showAddLessonModal && (
        <AddEditLessonModal
          initialData={editingLessonSchedule}
          classesList={classesList}
          teachersList={teachersList}
          selectedClassId={selectedScheduleClassId}
          schoolConfig={schoolConfig}
          terms={terms}
          onClose={() => {
            setShowAddLessonModal(false);
            setEditingLessonSchedule(null);
          }}
          onSave={handleSaveScheduleItem}
        />
      )}

      {/* Yangi Guruh / Sinf yaratish modali */}
      {showAddGroupModal && (
        <AddGroupModal
          newGroup={newGroup}
          setNewGroup={setNewGroup}
          teachersList={teachersList}
          terms={terms}
          onClose={() => setShowAddGroupModal(false)}
          onSubmit={handleAddGroup}
          onOpenAddTeacher={() => {
            setShowAddGroupModal(false);
            setShowAddTeacherModal(true);
          }}
        />
      )}

      {/* Guruh / Sinf tahrirlash modali (Edit Group CRUD) */}
      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          teachersList={teachersList}
          terms={terms}
          onClose={() => setEditingGroup(null)}
          onSave={handleUpdateGroup}
          onOpenAddTeacher={() => {
            setShowAddTeacherModal(true);
          }}
        />
      )}

      {/* Yangi O'qituvchi qo'shish modali */}
      {showAddTeacherModal && (
        <AddTeacherModal
          newTeacher={newTeacher}
          setNewTeacher={setNewTeacher}
          classesList={classesList}
          terms={terms}
          onClose={() => setShowAddTeacherModal(false)}
          onSubmit={handleAddTeacher}
        />
      )}

      {/* Yangi o'quvchi qo'shish modali */}
      {showAddStudentModal && (
        <AddStudentModal 
          newStudent={newStudent}
          setNewStudent={setNewStudent}
          classesList={classesList}
          terms={terms}
          onClose={() => setShowAddStudentModal(false)}
          onSubmit={handleAddStudent}
        />
      )}

      {/* O'quvchi tahrirlash modali (Edit CRUD) */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          classesList={classesList}
          terms={terms}
          onClose={() => setEditingStudent(null)}
          onSave={handleUpdateStudent}
        />
      )}

      {/* O'quvchi Ma'lumotlari Modali (Guruhlar ichida bosilganda) */}
      {selectedStudentForModal && (
        <StudentDetailDrawer 
          student={selectedStudentForModal} 
          terms={terms}
          onPreviewImage={setPreviewImage}
          onClose={() => setSelectedStudentForModal(null)} 
          onEdit={() => {
            const st = selectedStudentForModal;
            setSelectedStudentForModal(null);
            setEditingStudent(st);
          }}
          onDelete={() => {
            const id = selectedStudentForModal.id;
            const name = `${selectedStudentForModal.first_name} ${selectedStudentForModal.last_name}`;
            handleDeleteStudent(id, name);
          }}
        />
      )}

      {/* O'qituvchi Ma'lumotlari Modali (Tarix & Ko'rish bosilganda) */}
      {selectedTeacherForModal && (
        <TeacherDetailDrawer 
          teacher={selectedTeacherForModal} 
          terms={terms}
          schoolName={schoolName}
          onPreviewImage={setPreviewImage}
          onClose={() => setSelectedTeacherForModal(null)} 
          onDelete={() => {
            const id = selectedTeacherForModal.id;
            const name = selectedTeacherForModal.name;
            handleDeleteTeacher(id, name);
          }}
        />
      )}

      {/* 5.0 KATTALASHTIRILGAN RASM MODALI (LIGHTBOX) */}
      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}

// =========================================================================
// 3. MATRITSA BO'YICHA DAVOMAT (DARS MATRITSASI)
// =========================================================================
function AttendanceMatrixSection({ realStudents, schoolName, terms = buildSchoolTerms({}), onSelectStudent, onAddStudent }) {
  const days = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

  // Dars matritsasi holatlari
  const matrixStatus = [
    { text: "Bor", color: THEME.green, bg: '#E8F8F5' },
    { text: "Kechikkan", color: THEME.orange, bg: '#FFF4E5' },
    { text: "NB", color: '#EF4444', bg: '#FEE2E2' },
    { text: "Rejalashtirilgan", color: THEME.textMuted, bg: '#F1F5F9' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Legend & Summary */}
      <div style={{ backgroundColor: '#FFFFFF', padding: 22, borderRadius: 24, border: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: THEME.textDark }}>Haftalik {terms.lessonSingular} Davomati Matritsasi — {schoolName}</div>
          <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>Faqat ushbu maktabga tegishli {terms.studentPluralLower}ning {terms.lessonPluralLower} va kunlar kesimidagi davomat paneli</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {matrixStatus.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color }}></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Matritsa Jadvali */}
      <div style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, border: `1px solid ${THEME.border}`, overflowX: 'auto' }}>
        {realStudents.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: THEME.textMuted }}>
            <Users size={42} color={THEME.primary} style={{ opacity: 0.35, marginBottom: 10 }} />
            <div style={{ fontWeight: 800, fontSize: 16, color: THEME.textDark }}>
              Ushbu maktab bazasida hozircha {terms.studentPluralLower} yaratilmagan
            </div>
            <div style={{ fontSize: 12.5, marginTop: 6, marginBottom: 16 }}>
              Har bir maktab o'zining alohida bazasiga ega. Yangi {terms.studentSingularLower} qo'shish uchun quyidagi tugmani bosing.
            </div>
            {onAddStudent && (
              <button
                onClick={onAddStudent}
                style={{ padding: '10px 20px', borderRadius: 14, border: 'none', background: THEME.gradient, color: '#FFF', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                + Birinchi {terms.studentSingular}ni Yaratish
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}` }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: THEME.textMuted, width: 250 }}>{terms.studentSingular} & {terms.groupSingular}</th>
                {days.map((day, i) => (
                  <th key={i} style={{ padding: '14px 10px', color: THEME.textDark, fontWeight: 800 }}>
                    <div>{day}</div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 500 }}>14-{14 + i} okt</div>
                  </th>
                ))}
                <th style={{ padding: '14px 10px', color: THEME.primary, fontWeight: 800 }}>Oylik %</th>
              </tr>
            </thead>
            <tbody>
              {realStudents.slice(0, 12).map((st, idx) => (
                <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}`, transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                    <div 
                      onClick={() => onSelectStudent(st)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: THEME.primaryLight, color: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>
                        {st.first_name ? st.first_name[0] : 'O'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: THEME.textDark, fontSize: 13.5 }}>{st.last_name} {st.first_name}</div>
                        <div style={{ fontSize: 11, color: THEME.primary, fontWeight: 700 }}>{terms.formatGroupBadge(st.class_name)} • ID: {st.student_id}</div>
                      </div>
                    </div>
                  </td>

                  {/* 6 Kun uchun 3 parali/darsli matritsa bloklari */}
                  {days.map((d, dIdx) => (
                    <td key={dIdx} style={{ padding: '10px 6px' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        {[1, 2, 3].map((pairNum) => {
                          const isAttend = (idx + pairNum + dIdx) % 4 === 0 ? THEME.orange : (idx + pairNum) % 5 === 0 ? '#EF4444' : THEME.green;
                          return (
                            <div 
                              key={pairNum}
                              title={`${pairNum}-${terms.lessonSingularLower}`}
                              style={{ width: 18, height: 26, borderRadius: 6, backgroundColor: isAttend, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9.5, fontWeight: 'bold' }}>
                              {pairNum}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  ))}

                  <td style={{ padding: '14px 10px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 10, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 900, fontSize: 12 }}>
                      {90 + (idx % 8)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 4. GURUHLAR / SINFLAR VA O'QUVCHILARINI KO'RISH SAHIFASI (SPLIT DASHBOARD LAYOUT)
// =========================================================================
function GroupsManagementSection({
  classesList,
  teachersList = [],
  realStudents,
  schoolName,
  terms = buildSchoolTerms({}),
  selectedFilter,
  onFilterChange,
  selectedStudentModal,
  onCloseStudentModal,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenCreateGroup,
  onEditGroup,
  onDeleteGroup,
  onOpenScheduleForGroup,
  onAddStudentToClass,
  onPreviewImage,
}) {
  const [groupSearch, setGroupSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const currentClassObj =
    selectedFilter === 'ALL'
      ? null
      : classesList.find(c => c.name === selectedFilter) || { name: selectedFilter, academic_year: '2026-2027' };

  const unassignedCount = realStudents.filter(st => !st.class_name || st.class_name === 'Guruhsiz' || st.class_name === 'Sinfsiz').length;

  const filteredStudents = realStudents
    .filter(st => {
      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'Guruhsiz') return !st.class_name || st.class_name === 'Guruhsiz' || st.class_name === 'Sinfsiz';
      return st.class_name === selectedFilter;
    })
    .filter(st => {
      if (!groupSearch.trim()) return true;
      const q = groupSearch.toLowerCase();
      return `${st.last_name} ${st.first_name} ${st.student_id} ${st.class_name || ''} ${st.created_by || ''}`.toLowerCase().includes(q);
    });

  const activeAdvisor = {
    teacher: currentClassObj?.advisor_teacher || `Maktab ${terms.advisorLabel}`,
    room: currentClassObj?.room_number || "",
    createdBy: currentClassObj?.created_by || "Maktab Ma'muriyati",
    createdAt: currentClassObj?.created_at || "",
  };

  const matchedAdvisorTeacher = (teachersList || []).find(t => 
    t.name && (t.name.toLowerCase() === (activeAdvisor.teacher || '').toLowerCase() || 
    (activeAdvisor.teacher || '').toLowerCase().includes(t.name.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', minHeight: 'calc(100vh - 175px)' }}>
      
      {/* ================================================================= */}
      {/* CHAP TOMON: SINFLAR / GURUHLAR RO'YXATI (SIDEBAR PANEL)            */}
      {/* ================================================================= */}
      <aside
        style={{
          width: 320,
          flexShrink: 0,
          backgroundColor: '#FFFFFF',
          borderRadius: 26,
          border: `1px solid ${THEME.border}`,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 8px 24px rgba(108, 92, 231, 0.04)',
          position: 'sticky',
          top: 20,
        }}>
        {/* Chap panel sarlavhasi */}
        <div style={{ paddingBottom: 12, borderBottom: `1px solid ${THEME.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: THEME.primaryLight,
                  color: THEME.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <FolderOpen size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 15, color: THEME.textDark }}>Maktab {terms.groupPlural}i</div>
                <div style={{ fontSize: 11, color: THEME.textMuted }}>Faqat shu maktab {terms.groupPlural.toLowerCase()}i</div>
              </div>
            </div>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 10,
                backgroundColor: THEME.primaryLight,
                color: THEME.primary,
                fontWeight: 800,
                fontSize: 11,
              }}>
              {classesList.length} ta {terms.groupSingularLower}
            </span>
          </div>
        </div>

        {/* Sinflar / Guruhlar vertikal ro'yxati */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {classesList.length === 0 ? (
            <div style={{ padding: '20px 14px', borderRadius: 16, backgroundColor: '#F8FAFC', border: `1px dashed ${THEME.border}`, textAlign: 'center', fontSize: 12, color: THEME.textMuted }}>
              Bu maktabda hali {terms.groupSingularLower} yaratilmagan. Quyidagi tugma orqali yangi {terms.groupSingularLower} yarating.
            </div>
          ) : (
            classesList.map(c => {
              const isSel = selectedFilter === c.name;
              const count = realStudents.filter(s => s.class_name === c.name).length;

              return (
                <div
                  key={c.id}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 18,
                    border: `1px solid ${isSel ? THEME.primary : THEME.border}`,
                    background: isSel ? THEME.gradient : '#F8F9FE',
                    color: isSel ? '#FFFFFF' : THEME.textDark,
                    boxShadow: isSel ? '0 10px 22px rgba(108, 92, 231, 0.28)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}>
                  <div
                    onClick={() => onFilterChange(c.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1, cursor: 'pointer' }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 13,
                        backgroundColor: isSel ? 'rgba(255,255,255,0.22)' : '#FFFFFF',
                        color: isSel ? '#FFFFFF' : THEME.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 13,
                        flexShrink: 0,
                        border: isSel ? 'none' : `1px solid ${THEME.border}`,
                      }}>
                      {c.name}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: isSel ? '#FFFFFF' : THEME.textDark,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                        {c.name} {terms.groupGenitiveLower}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: isSel ? 'rgba(255,255,255,0.85)' : THEME.textMuted,
                          marginTop: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                        {c.advisor_teacher || `O'quv yili: ${c.academic_year || '2026-2027'}`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <span style={{
                          padding: '1.5px 6px',
                          borderRadius: 6,
                          fontSize: 9.5,
                          fontWeight: 800,
                          backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : (c.shift === 2 ? '#FEF3C7' : '#EFF6FF'),
                          color: isSel ? '#FFFFFF' : (c.shift === 2 ? '#B45309' : '#1D4ED8'),
                        }}>
                          {c.shift === 2 ? "🌇 2-smena (Abeddan keyin)" : "🌅 1-smena (Ertalabki)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span
                      onClick={() => onFilterChange(c.name)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: 10,
                        backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : THEME.primaryLight,
                        color: isSel ? '#FFFFFF' : THEME.primary,
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}>
                      {count} nafar
                    </span>
                    {onEditGroup && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGroup(c);
                        }}
                        title={`${terms.groupSingular}ni tahrirlash / o'zgartirish`}
                        style={{
                          padding: 5,
                          borderRadius: 8,
                          border: 'none',
                          backgroundColor: isSel ? 'rgba(255,255,255,0.2)' : '#EEF2FF',
                          color: isSel ? '#FFFFFF' : THEME.primary,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                        <Edit size={13} />
                      </button>
                    )}
                    {onDeleteGroup && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGroup(c.id, c.name);
                        }}
                        title={`${terms.groupSingular}ni o'chirish`}
                        style={{
                          padding: 5,
                          borderRadius: 8,
                          border: 'none',
                          backgroundColor: isSel ? 'rgba(255,255,255,0.2)' : '#FEE2E2',
                          color: isSel ? '#FFFFFF' : '#EF4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {unassignedCount > 0 && (
            <button
              onClick={() => onFilterChange('Guruhsiz')}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 18,
                border: `1px solid ${selectedFilter === 'Guruhsiz' ? THEME.orange : THEME.border}`,
                background: selectedFilter === 'Guruhsiz' ? THEME.warmGradient : '#FFF9F2',
                color: selectedFilter === 'Guruhsiz' ? '#FFFFFF' : THEME.textDark,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
              }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>{terms.noGroupLabel} {terms.studentPluralLower}</div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 8,
                  backgroundColor: selectedFilter === 'Guruhsiz' ? 'rgba(255,255,255,0.25)' : '#FFE8CC',
                  color: selectedFilter === 'Guruhsiz' ? '#FFF' : THEME.orange,
                  fontSize: 11,
                  fontWeight: 800,
                }}>
                {unassignedCount} nafar
              </span>
            </button>
          )}
        </div>

        {/* Umumiy Barcha Guruhlar va Yangi Guruh yaratish tugmasi */}
        <div style={{ paddingTop: 10, borderTop: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => onFilterChange('ALL')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 16,
              border: `1px solid ${selectedFilter === 'ALL' ? THEME.primary : THEME.border}`,
              background: selectedFilter === 'ALL' ? THEME.primaryLight : '#FFFFFF',
              color: selectedFilter === 'ALL' ? THEME.primary : THEME.textMuted,
              fontWeight: 800,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={15} /> Barcha {terms.groupPlural} (Shu Maktab)
            </span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 8,
                backgroundColor: selectedFilter === 'ALL' ? THEME.primary : '#F1F5F9',
                color: selectedFilter === 'ALL' ? '#FFFFFF' : THEME.textDark,
                fontSize: 11,
                fontWeight: 800,
              }}>
              {realStudents.length} ta
            </span>
          </button>

          {onOpenCreateGroup && (
            <button
              onClick={onOpenCreateGroup}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 16,
                border: `1px dashed ${THEME.primary}`,
                background: '#F8F9FE',
                color: THEME.primary,
                fontWeight: 800,
                fontSize: 12.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
              <Plus size={15} /> Yangi {terms.groupSingular} Yaratish
            </button>
          )}
        </div>
      </aside>

      {/* ================================================================= */}
      {/* O'NG TOMON: TANLANGAN SINF / GURUH O'QUVCHILARI VA BOSHQARUVI      */}
      {/* ================================================================= */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Tanlangan Sinf / Guruh Yuqori Boshqaruv Kartasi */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '22px 26px',
            borderRadius: 26,
            border: `1px solid ${THEME.border}`,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 8px 24px rgba(108, 92, 231, 0.04)',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: THEME.gradient,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 17,
                boxShadow: '0 8px 18px rgba(108, 92, 231, 0.28)',
                flexShrink: 0,
              }}>
              {selectedFilter === 'ALL' ? 'ALL' : selectedFilter}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: THEME.textDark, margin: 0 }}>
                  {selectedFilter === 'ALL'
                    ? `${schoolName} — Barcha ${terms.groupPlural} ${terms.studentPlural}i`
                    : `${selectedFilter} ${terms.groupGenitive} ${terms.studentPlural}i Tarkibi`}
                </h2>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 10,
                    backgroundColor: THEME.primaryLight,
                    color: THEME.primary,
                    fontWeight: 800,
                    fontSize: 12,
                  }}>
                  {filteredStudents.length} nafar {terms.studentSingularLower}
                </span>
                {currentClassObj && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 10,
                      backgroundColor: currentClassObj.shift === 2 ? '#FEF3C7' : '#EFF6FF',
                      color: currentClassObj.shift === 2 ? '#B45309' : '#1D4ED8',
                      border: currentClassObj.shift === 2 ? '1px solid #FDE68A' : '1px solid #BFDBFE',
                      fontWeight: 800,
                      fontSize: 12,
                    }}>
                    {currentClassObj.shift === 2 ? "🌇 2-smena (Abeddan keyingi)" : "🌅 1-smena (Ertalabki)"}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 5, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span>👨‍🏫 {terms.advisorLabel}: <b style={{ color: THEME.textDark }}>{activeAdvisor.teacher}</b></span>
                  {matchedAdvisorTeacher && (
                    <span style={{ padding: '2px 8px', borderRadius: 8, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 700, fontSize: 11 }}>
                      {matchedAdvisorTeacher.subject}
                    </span>
                  )}
                  {currentClassObj && currentClassObj.id && onEditGroup && (
                    <button
                      onClick={() => onEditGroup(currentClassObj)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: THEME.primary,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                      title={`${terms.groupLeader}ni o'zgartirish yoki biriktirish`}>
                      <Edit size={11} /> O'zgartirish
                    </button>
                  )}
                  {currentClassObj && currentClassObj.id && onOpenScheduleForGroup && (
                    <button
                      onClick={() => onOpenScheduleForGroup(currentClassObj.id)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 8,
                        border: `1px solid ${THEME.primary}`,
                        backgroundColor: THEME.primaryLight,
                        color: THEME.primary,
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                      title={`${currentClassObj.name} dars jadvalini ko'rish va kiritish`}>
                      <Calendar size={11} /> {terms.lessonSingular} Jadvali
                    </button>
                  )}
                </span>
                {activeAdvisor.room && <span>📍 Xona: <b style={{ color: THEME.textDark }}>{activeAdvisor.room}</b></span>}
                <span>📅 O'quv yili: <b style={{ color: THEME.textDark }}>{currentClassObj?.academic_year || '2026-2027'}</b></span>
                {currentClassObj?.created_by && (
                  <span>🛡️ {terms.groupSingular} yaratuvchisi: <b style={{ color: THEME.primary }}>{currentClassObj.created_by}</b></span>
                )}
              </div>
            </div>
          </div>

          {/* Qidiruv + Ko'rinish + Shu sinfga/guruhga o'quvchi qo'shish */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 14,
                border: `1px solid ${THEME.border}`,
                backgroundColor: THEME.bgSoft,
                width: 230,
              }}>
              <Search size={15} color={THEME.textMuted} />
              <input
                placeholder={`${terms.groupSingular} ichidan qidirish...`}
                value={groupSearch}
                onChange={e => setGroupSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12.5 }}
              />
            </div>

            <div style={{ display: 'flex', backgroundColor: THEME.bgSoft, padding: 4, borderRadius: 12, border: `1px solid ${THEME.border}` }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 9,
                  border: 'none',
                  backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'cards' ? THEME.primary : THEME.textMuted,
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'cards' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}>
                Kartalar
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 9,
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'table' ? THEME.primary : THEME.textMuted,
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}>
                Jadval
              </button>
            </div>

            {currentClassObj && currentClassObj.id && onEditGroup && (
              <button
                onClick={() => onEditGroup(currentClassObj)}
                title={`${terms.groupSingular} parametrlarini o'zgartirish`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 15px',
                  backgroundColor: '#EEF2FF',
                  color: THEME.primary,
                  borderRadius: 14,
                  border: '1px solid #C7D2FE',
                  fontWeight: 800,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}>
                <Edit size={14} />
                {terms.groupSingular}ni Tahrirlash
              </button>
            )}

            {currentClassObj && currentClassObj.id && onDeleteGroup && (
              <button
                onClick={() => onDeleteGroup(currentClassObj.id, currentClassObj.name)}
                title={`${terms.groupSingular}ni o'chirish`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  color: '#EF4444',
                  borderRadius: 14,
                  border: '1px solid #FECACA',
                  fontWeight: 800,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}>
                <Trash2 size={14} />
                O'chirish
              </button>
            )}

            {onAddStudentToClass && (
              <button
                onClick={() => onAddStudentToClass(currentClassObj)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  background: THEME.gradient,
                  color: '#FFFFFF',
                  borderRadius: 14,
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  boxShadow: '0 6px 14px rgba(108, 92, 231, 0.25)',
                }}>
                <Plus size={15} />
                {selectedFilter === 'ALL' ? `${terms.studentSingular} Qo'shish` : `${selectedFilter} ga Qo'shish`}
              </button>
            )}
          </div>
        </div>

        {/* O'quvchilar Ro'yxati (Kartalar yoki Jadval) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: 26,
            borderRadius: 26,
            border: `1px solid ${THEME.border}`,
            boxShadow: '0 8px 24px rgba(108, 92, 231, 0.03)',
          }}>
          {filteredStudents.length === 0 ? (
            <div style={{ padding: 50, textAlign: 'center', color: THEME.textMuted }}>
              <Users size={40} color={THEME.primary} style={{ opacity: 0.35, marginBottom: 10 }} />
              <div style={{ fontWeight: 800, fontSize: 15, color: THEME.textDark }}>
                {groupSearch ? `Qidiruv bo'yicha ${terms.studentSingularLower} topilmadi` : `Ushbu ${terms.groupSingularLower}da hozircha ${terms.studentPluralLower} biriktirilmagan`}
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Yuqoridagi tugma orqali ushbu maktabning tanlangan {terms.groupGenitiveLower}ga yangi {terms.studentSingularLower} qo'shishingiz mumkin.
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(305px, 1fr))', gap: 16 }}>
              {filteredStudents.map(st => (
                <div
                  key={st.id}
                  style={{
                    padding: 16,
                    borderRadius: 20,
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = THEME.primary)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = THEME.border)}>
                  {/* 3x4 Photo */}
                  <div
                    onClick={(e) => {
                      if (st.photo_3x4 && onPreviewImage) {
                        e.stopPropagation();
                        onPreviewImage({
                          url: normalizeMediaUrl(st.photo_3x4),
                          title: `${st.last_name} ${st.first_name}`,
                          subtitle: `${terms.studentSingular} • ${terms.formatGroupBadge(st.class_name)}`,
                          badge: terms.studentSingular,
                          idNumber: st.student_id,
                          schoolName: st.school_name || schoolName,
                        });
                      } else {
                        onSelectStudent(st);
                      }
                    }}
                    title={st.photo_3x4 ? "Rasmni kattalashtirib ko'rish (bosing)" : "Ma'lumotlarni ko'rish"}
                    style={{
                      width: 52,
                      height: 68,
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: '#F1F5F9',
                      border: `1px solid ${THEME.border}`,
                      flexShrink: 0,
                      cursor: st.photo_3x4 ? 'zoom-in' : 'pointer',
                      position: 'relative',
                      transition: 'transform 0.18s ease',
                    }}
                    onMouseEnter={(e) => { if (st.photo_3x4) e.currentTarget.style.transform = 'scale(1.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                    {st.photo_3x4 ? (
                      <>
                        <img src={normalizeMediaUrl(st.photo_3x4)} alt={st.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#FFF', borderRadius: 4, padding: 2, display: 'flex' }}>
                          <ZoomIn size={10} />
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: THEME.primary,
                          backgroundColor: THEME.primaryLight,
                          fontSize: 13,
                          fontWeight: 900,
                        }}>
                        {(st.last_name?.[0] || '') + (st.first_name?.[0] || '')}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => onSelectStudent(st)}>
                    <div
                      title={`${st.last_name} ${st.first_name}`}
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: THEME.textDark,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}>
                      {st.last_name} {st.first_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '2px 7px',
                          backgroundColor: THEME.primaryLight,
                          color: THEME.primary,
                          borderRadius: 6,
                          fontWeight: 900,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        }}>
                        ID: {st.student_id}
                      </span>
                      <span style={{ fontSize: 11, color: THEME.green, fontWeight: 700 }}>{terms.formatGroupBadge(st.class_name)}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: THEME.textMuted,
                        marginTop: 4,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                      Yaratdi: <b style={{ color: THEME.textDark }}>{st.created_by || "Maktab Direktori"}</b>
                    </div>
                    <div style={{ fontSize: 10.5, color: THEME.textMuted, marginTop: 2 }}>
                      🕒 {st.date_joined || '2026-10-18'} • Parol: <code>{st.initial_password}</code>
                    </div>
                  </div>

                  {/* CRUD buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                    <button
                      onClick={() => onEditStudent && onEditStudent(st)}
                      title="Tahrirlash"
                      style={{
                        padding: 7,
                        background: '#F1F0FF',
                        border: 'none',
                        borderRadius: 9,
                        color: THEME.primary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteStudent && onDeleteStudent(st.id, `${st.first_name} ${st.last_name}`)}
                      title="O'chirish"
                      style={{
                        padding: 7,
                        background: '#FEE2E2',
                        border: 'none',
                        borderRadius: 9,
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted, textTransform: 'uppercase', fontSize: 11 }}>
                  <th style={{ padding: '12px 10px' }}>№</th>
                  <th style={{ padding: '12px 14px' }}>3x4 Foto</th>
                  <th style={{ padding: '12px 14px' }}>Familiya & Ism</th>
                  <th style={{ padding: '12px 14px' }}>{terms.groupSingular}</th>
                  <th style={{ padding: '12px 14px' }}>Kirish ID</th>
                  <th style={{ padding: '12px 14px' }}>Parol</th>
                  <th style={{ padding: '12px 14px' }}>Yaratilganlik Tarixi</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st, idx) => (
                  <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: THEME.textMuted }}>{idx + 1}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div
                        onClick={(e) => {
                          if (st.photo_3x4 && onPreviewImage) {
                            e.stopPropagation();
                            onPreviewImage({
                              url: normalizeMediaUrl(st.photo_3x4),
                              title: `${st.last_name} ${st.first_name}`,
                              subtitle: `${terms.studentSingular} • ${terms.formatGroupBadge(st.class_name)}`,
                              badge: terms.studentSingular,
                              idNumber: st.student_id,
                              schoolName: st.school_name || schoolName,
                            });
                          } else {
                            onSelectStudent(st);
                          }
                        }}
                        title={st.photo_3x4 ? "Rasmni kattalashtirib ko'rish (bosing)" : ""}
                        style={{
                          width: 38,
                          height: 48,
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: `1px solid ${THEME.border}`,
                          backgroundColor: THEME.primaryLight,
                          cursor: st.photo_3x4 ? 'zoom-in' : 'pointer',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.18s ease',
                        }}
                        onMouseEnter={(e) => { if (st.photo_3x4) e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                        {st.photo_3x4 ? (
                          <>
                            <img
                              src={normalizeMediaUrl(st.photo_3x4)}
                              alt={st.full_name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#FFF', borderRadius: 3, padding: 1, display: 'flex' }}>
                              <ZoomIn size={9} />
                            </div>
                          </>
                        ) : (
                          <div
                            style={{
                              color: THEME.primary,
                              fontSize: 11,
                              fontWeight: 800,
                            }}>
                            {(st.last_name?.[0] || '') + (st.first_name?.[0] || '')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td
                      onClick={() => onSelectStudent(st)}
                      style={{
                        padding: '14px',
                        fontWeight: 800,
                        color: THEME.textDark,
                        cursor: 'pointer',
                        maxWidth: 200,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                      {st.last_name} {st.first_name}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          backgroundColor: THEME.primaryLight,
                          color: THEME.primary,
                          borderRadius: 8,
                          fontWeight: 800,
                          fontSize: 11.5,
                        }}>
                        {terms.formatGroupBadge(st.class_name)}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 800, color: THEME.primary }}>
                      <code>{st.student_id}</code>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <code style={{ padding: '3px 8px', backgroundColor: '#F1F5F9', borderRadius: 6, fontSize: 12 }}>
                        {st.initial_password}
                      </code>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: THEME.textDark }}>{st.created_by || "Maktab Direktori"}</div>
                      <div style={{ fontSize: 11, color: THEME.textMuted }}>{st.date_joined || '2026-10-18'}</div>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => onSelectStudent(st)}
                          style={{
                            padding: '6px 10px',
                            background: THEME.primaryLight,
                            border: 'none',
                            color: THEME.primary,
                            borderRadius: 8,
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontSize: 11.5,
                          }}>
                          Ko'rish
                        </button>
                        <button
                          onClick={() => onEditStudent && onEditStudent(st)}
                          title="Tahrirlash"
                          style={{
                            padding: 6,
                            background: '#F1F0FF',
                            border: 'none',
                            color: THEME.primary,
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}>
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteStudent && onDeleteStudent(st.id, `${st.first_name} ${st.last_name}`)}
                          title="O'chirish"
                          style={{
                            padding: 6,
                            background: '#FEE2E2',
                            border: 'none',
                            color: '#EF4444',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5.0 KATTALASHTIRILGAN RASM KO'RISH MODALI (LIGHTBOX MODAL)
// =========================================================================
function ImagePreviewModal({ image, onClose }) {
  if (!image) return null;

  const url = typeof image === 'string' ? image : image.url;
  const title = typeof image === 'string' ? "Fotosurat" : (image.title || "Fotosurat");
  const subtitle = typeof image === 'string' ? "" : (image.subtitle || "");
  const badge = typeof image === 'string' ? "" : (image.badge || "");
  const idNumber = typeof image === 'string' ? "" : (image.idNumber || "");
  const schoolName = typeof image === 'string' ? "" : (image.schoolName || "");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 250,
        padding: 20,
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: 26,
          padding: 20,
          maxWidth: 580,
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}>
        {/* Yuqori Panel: Ism, ID, Badge va Yopish */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              {badge && (
                <span style={{ padding: '3px 9px', backgroundColor: THEME.primaryLight, color: THEME.primary, borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                  {badge}
                </span>
              )}
              {idNumber && (
                <span style={{ padding: '3px 8px', backgroundColor: '#F1F5F9', color: THEME.textDark, borderRadius: 8, fontSize: 11.5, fontWeight: 900, fontFamily: 'monospace' }}>
                  ID: {idNumber}
                </span>
              )}
              {schoolName && (
                <span style={{ fontSize: 11.5, color: THEME.textMuted }}>
                  • {schoolName}
                </span>
              )}
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: THEME.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title="Asl nusxasini yangi oynada ochish"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: THEME.textDark,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  border: 'none',
                }}>
                <ExternalLink size={17} />
              </a>
            )}
            <button
              onClick={onClose}
              title="Yopish (Esc)"
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: 10,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: THEME.textDark,
              }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Kattalashtirilgan Rasm Konteyneri */}
        <div style={{
          width: '100%',
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320,
          maxHeight: 'calc(94vh - 160px)',
          border: `2px solid ${THEME.primary}`,
          boxShadow: '0 12px 30px rgba(108, 92, 231, 0.25)',
        }}>
          {url ? (
            <img
              src={normalizeMediaUrl(url)}
              alt={title}
              style={{
                width: '100%',
                maxHeight: 'calc(94vh - 160px)',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <div style={{ color: '#94A3B8', fontSize: 14, fontWeight: 700, padding: 40 }}>
              Fotosurat mavjud emas
            </div>
          )}
        </div>

        {/* Pastki ma'lumot va maslahat */}
        <div style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: THEME.textMuted }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: THEME.green }}></span>
            <span>Face ID & Biometrik 3x4 standarti</span>
          </div>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>Yopish uchun <b>Esc</b> yoki chetga bosing</span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5. O'QUVCHI MA'LUMOTLARI DRAWER/MODAL (3x4 RASMI, TARIXI VA REKVIZITLARI)
// =========================================================================
function StudentDetailDrawer({ student, terms = buildSchoolTerms({}), onPreviewImage, onClose, onEdit, onDelete }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>{terms.studentSingular} Pasporti va Yaratilganlik Tarixi</div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* 3x4 Rasm & Ism Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 18, backgroundColor: THEME.bgSoft, borderRadius: 22, marginBottom: 20 }}>
          <div 
            onClick={() => {
              if (student.photo_3x4 && onPreviewImage) {
                onPreviewImage({
                  url: normalizeMediaUrl(student.photo_3x4),
                  title: `${student.last_name} ${student.first_name}`,
                  subtitle: `${terms.studentSingular} • ${terms.formatGroupBadge(student.class_name)}`,
                  badge: terms.studentSingular,
                  idNumber: student.student_id,
                  schoolName: student.school_name || `Maktab #${student.school_id}`,
                });
              }
            }}
            title={student.photo_3x4 ? "Rasmni kattalashtirib ko'rish (bosing)" : ""}
            style={{ 
              width: 68, 
              height: 86, 
              borderRadius: 14, 
              overflow: 'hidden', 
              backgroundColor: '#FFF', 
              border: `2px solid ${THEME.primary}`, 
              boxShadow: '0 6px 14px rgba(108, 92, 231, 0.15)',
              cursor: student.photo_3x4 ? 'zoom-in' : 'default',
              position: 'relative',
              flexShrink: 0,
              transition: 'transform 0.18s ease',
            }}
            onMouseEnter={(e) => { if (student.photo_3x4) e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {student.photo_3x4 ? (
              <>
                <img src={normalizeMediaUrl(student.photo_3x4)} alt={student.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 3, right: 3, backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#FFF', borderRadius: 4, padding: 2, display: 'flex' }}>
                  <ZoomIn size={12} />
                </div>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.textMuted, fontSize: 11, fontWeight: 'bold' }}>
                3x4 Rasm
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: THEME.textDark }}>{student.last_name} {student.first_name}</div>
            <div style={{ fontSize: 12, color: THEME.primary, fontWeight: 800, marginTop: 4 }}>
              {terms.formatGroupBadge(student.class_name)} • {student.school_name || `Maktab #${student.school_id}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span style={{ padding: '3px 8px', backgroundColor: '#ECFDF5', color: THEME.green, borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                Face ID faol ✅
              </span>
              <span style={{ padding: '3px 8px', backgroundColor: THEME.primaryLight, color: THEME.primary, borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                Maktab ID #{student.school_id || '1'}
              </span>
            </div>
          </div>
        </div>

        {/* Tafsilotlar jadvali */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <DetailRow label="Kirish ID (5 xonali)" value={student.student_id} isCode />
          <DetailRow label="Mobil Ilova Paroli" value={student.initial_password} isCode />
          <DetailRow label="Tegishli Maktab Bazasi" value={student.school_name || `Maktab #${student.school_id}`} />
          <DetailRow label={`Biriktirilgan ${terms.groupSingular}`} value={terms.formatGroupBadge(student.class_name)} />
          <DetailRow label="Kim tomonidan yaratilgan" value={student.created_by || "Maktab Direktori"} />
          <DetailRow label="Yaratilgan vaqti (Tarix)" value={student.date_joined || "2026-10-18"} />
          <DetailRow label="Bugungi Davomat Holati" value="Bino ichida (08:14 da qayd etilgan)" />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button 
            onClick={onEdit} 
            style={{ flex: 1, padding: 13, background: THEME.primaryLight, color: THEME.primary, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Edit size={16} /> Tahrirlash
          </button>
          <button 
            onClick={onDelete} 
            style={{ padding: '13px 18px', background: '#FEE2E2', color: '#EF4444', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Trash2 size={16} /> O'chirish
          </button>
          <button 
            onClick={onClose} 
            style={{ flex: 1, padding: 13, background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isCode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 14 }}>
      <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600, flexShrink: 0 }}>{label}:</span>
      {isCode ? (
        <code style={{ fontSize: 13, fontWeight: 800, color: THEME.primary, backgroundColor: THEME.primaryLight, padding: '2px 8px', borderRadius: 6 }}>
          {value}
        </code>
      ) : (
        <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textDark, textAlign: 'right' }}>{value}</span>
      )}
    </div>
  );
}

// =========================================================================
// 5.1 O'QITUVCHI MA'LUMOTLARI DRAWER/MODAL (TARIXI VA REKVIZITLARI)
// =========================================================================
function TeacherDetailDrawer({ teacher, terms = buildSchoolTerms({}), schoolName, onPreviewImage, onClose, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!teacher) return null;

  const copyToClipboard = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const teacherId = String(teacher.teacher_id || teacher.username);
  const teacherPwd = teacher.initial_password || 'teacher123';
  const isSuperCreator = (teacher.created_by_role || '').includes('SUPER') || (teacher.created_by || '').toLowerCase().includes('super');

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>Ustoz Pasporti va Yaratilganlik Tarixi</div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Bosh harf / Foto & Ism Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 18, backgroundColor: THEME.bgSoft, borderRadius: 22, marginBottom: 20 }}>
          <div
            onClick={() => {
              if (teacher.photo_3x4 && onPreviewImage) {
                onPreviewImage({
                  url: normalizeMediaUrl(teacher.photo_3x4),
                  title: teacher.name,
                  subtitle: `${teacher.subject || "Fan o'qituvchisi"} • ${teacher.group || ''}`,
                  badge: "O'qituvchi",
                  idNumber: teacherId,
                  schoolName: teacher.school_name || schoolName,
                });
              }
            }}
            title={teacher.photo_3x4 ? "Rasmni kattalashtirib ko'rish (bosing)" : ""}
            style={{ 
              width: 68, 
              height: 86, 
              borderRadius: 16, 
              background: teacher.photo_3x4 ? '#FFF' : THEME.gradient, 
              color: '#FFF', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 900, 
              fontSize: 24, 
              boxShadow: '0 8px 18px rgba(108, 92, 231, 0.25)', 
              flexShrink: 0,
              overflow: 'hidden',
              cursor: teacher.photo_3x4 ? 'zoom-in' : 'default',
              position: 'relative',
              border: teacher.photo_3x4 ? `2px solid ${THEME.primary}` : 'none',
              transition: 'transform 0.18s ease',
            }}
            onMouseEnter={(e) => { if (teacher.photo_3x4) e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {teacher.photo_3x4 ? (
              <>
                <img src={normalizeMediaUrl(teacher.photo_3x4)} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 3, right: 3, backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#FFF', borderRadius: 4, padding: 2, display: 'flex' }}>
                  <ZoomIn size={12} />
                </div>
              </>
            ) : (
              teacher.name ? teacher.name[0] : 'U'
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: THEME.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {teacher.name}
            </div>
            <div style={{ fontSize: 12.5, color: THEME.primary, fontWeight: 800, marginTop: 4 }}>
              {teacher.subject} • {teacher.school_name || schoolName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 8px', backgroundColor: '#ECFDF5', color: THEME.green, borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                Mobil QR faol ✅
              </span>
              <span style={{ padding: '3px 8px', backgroundColor: isSuperCreator ? '#FFF0F3' : '#F1F0FF', color: isSuperCreator ? '#E11D48' : THEME.primary, borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                {isSuperCreator ? 'SUPER ADMIN' : 'MAKTAB ADMINI'}
              </span>
              <span style={{ padding: '3px 8px', backgroundColor: THEME.primaryLight, color: THEME.primary, borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                Maktab ID #{teacher.school_id || '1'}
              </span>
            </div>
          </div>
        </div>

        {/* Tafsilotlar jadvali */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {/* Kirish ID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 14 }}>
            <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>Kirish ID (5 xonali):</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ fontSize: 14, fontWeight: 900, color: THEME.primary, backgroundColor: THEME.primaryLight, padding: '3px 10px', borderRadius: 8, fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                {teacherId}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(teacherId, 'modal-id')}
                title="ID nusxalash"
                style={{ border: 'none', backgroundColor: copiedKey === 'modal-id' ? '#DCFCE7' : '#F1F0FF', color: copiedKey === 'modal-id' ? '#15803D' : THEME.primary, padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Copy size={12} />
                {copiedKey === 'modal-id' ? 'Nusxalandi!' : 'Nusxa'}
              </button>
            </div>
          </div>

          {/* Parol */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 14 }}>
            <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>Mobil & Web Paroli:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <code style={{ fontSize: 13, fontWeight: 800, color: THEME.textDark, backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}`, padding: '3px 8px', borderRadius: 8, minWidth: 80, textAlign: 'center' }}>
                {showPassword ? teacherPwd : '••••••••'}
              </code>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Parolni yashirish" : "Parolni ko'rish"}
                style={{ border: 'none', backgroundColor: '#F1F5F9', color: THEME.textDark, padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPassword ? "Yashirish" : "Ko'rish"}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(teacherPwd, 'modal-pwd')}
                title="Parolni nusxalash"
                style={{ border: 'none', backgroundColor: copiedKey === 'modal-pwd' ? '#DCFCE7' : '#F1F0FF', color: copiedKey === 'modal-pwd' ? '#15803D' : THEME.primary, padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Copy size={12} />
                {copiedKey === 'modal-pwd' ? 'Nusxalandi!' : 'Nusxa'}
              </button>
            </div>
          </div>

          <DetailRow label="Fan Yo'nalishi" value={teacher.subject} />
          <DetailRow label={`Biriktirilgan ${terms.groupSingular}`} value={terms.formatGroupBadge(teacher.group)} />
          <DetailRow label="Auditoriya / Xona" value={teacher.rooms} />
          <DetailRow label="Telefon Raqami" value={teacher.phone} />
          <DetailRow label="Tegishli Maktab Bazasi" value={teacher.school_name || schoolName} />
          <DetailRow label="Kim tomonidan yaratilgan" value={teacher.created_by || "Maktab Direktori"} />
          <DetailRow label="Yaratilgan vaqti (Tarix)" value={teacher.created_at || "2026-10-18"} />
          <DetailRow label="Tizim Holati" value="Faol (Mobil ilova va Veb kabinetga ulanish ochiq)" />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {onDelete && (
            <button 
              onClick={onDelete} 
              style={{ padding: '13px 18px', background: '#FEE2E2', color: '#EF4444', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Trash2 size={16} /> O'chirish
            </button>
          )}
          <button 
            onClick={onClose} 
            style={{ flex: 1, padding: 13, background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5.5. DARS JADVALI BOSHQARUVI (SCHEDULE MANAGEMENT SECTION)
// =========================================================================
function ScheduleManagementSection({
  classesList = [],
  teachersList = [],
  schedulesList = [],
  schoolId,
  schoolName,
  schoolConfig,
  terms = buildSchoolTerms({}),
  selectedClassId,
  onSelectClassId,
  onRefreshSchedules,
  onOpenAddModal,
  onEditSchedule,
  onDeleteSchedule,
  onQuickSeed,
  onClearClass,
  onGoToSettings,
  loading = false,
}) {
  const currentDayNum = Math.min(6, Math.max(1, new Date().getDay() === 0 ? 1 : new Date().getDay()));
  const [activeDay, setActiveDay] = useState(currentDayNum);
  const [viewMode, setViewMode] = useState('day');

  const currentClass = classesList.find(c => String(c.id) === String(selectedClassId)) || classesList[0] || null;

  const classSchedules = currentClass
    ? schedulesList.filter(s => String(s.school_class) === String(currentClass.id))
    : [];

  const daysList = [
    { id: 1, name: "Dushanba" },
    { id: 2, name: "Seshanba" },
    { id: 3, name: "Chorshanba" },
    { id: 4, name: "Payshanba" },
    { id: 5, name: "Juma" },
    { id: 6, name: "Shanba" },
  ];

  const classShift = Number(currentClass?.shift || 1);
  const standardSlots = generateLessonSlots(schoolConfig, 7, classShift);

  const getSubjectColor = (name = '') => {
    const s = name.toLowerCase();
    if (s.includes('matem') || s.includes('algeb') || s.includes('geom')) return { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE', badge: '📐' };
    if (s.includes('fizik')) return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD', badge: '⚡' };
    if (s.includes('kimyo')) return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', badge: '🧪' };
    if (s.includes('biolog')) return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', badge: '🌿' };
    if (s.includes('ingliz') || s.includes('rus') || s.includes('til')) return { bg: '#FDF4FF', text: '#C026D3', border: '#F5D0FE', badge: '🌐' };
    if (s.includes('adabiyot') || s.includes('ona tili')) return { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3', badge: '📖' };
    if (s.includes('tarix') || s.includes('huquq')) return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', badge: '🏛️' };
    if (s.includes('inform') || s.includes('it') || s.includes('dastur')) return { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC', badge: '💻' };
    if (s.includes('jismoniy') || s.includes('sport')) return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', badge: '⚽' };
    return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', badge: '📚' };
  };

  if (classesList.length === 0) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', padding: 48, borderRadius: 26, border: `1px solid ${THEME.border}`, textAlign: 'center' }}>
        <FolderOpen size={48} color={THEME.primary} style={{ opacity: 0.4, marginBottom: 12 }} />
        <div style={{ fontSize: 18, fontWeight: 900, color: THEME.textDark }}>Hozircha birorta ham {terms.groupSingularLower} mavjud emas</div>
        <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 6, marginBottom: 20 }}>
          {terms.lessonSingular} jadvalini kiritish uchun avval kamida bitta {terms.groupSingularLower} yarating.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      
      {/* 1. YUQORI SINF/GURUH TANLASH VA BOSHQARUV PANELİ */}
      <div style={{ backgroundColor: '#FFFFFF', padding: 22, borderRadius: 26, border: `1px solid ${THEME.border}`, boxShadow: '0 8px 24px rgba(108, 92, 231, 0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: THEME.gradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 17, color: THEME.textDark }}>
                  {terms.groupPlural} Bo'yicha {terms.lessonSingular} Jadvali
                </div>
                <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                  Sinfni tanlang, haftalik rejadagi darslarni kiriting, o'zgartiring yoki namunaviy jadval yuklang
                </div>
              </div>
            </div>
          </div>

          {/* O'ng tomon amallar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenAddModal({ class_id: currentClass?.id, day_of_week: activeDay === 'ALL' ? 1 : activeDay })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                borderRadius: 14, border: 'none', background: THEME.gradient,
                color: '#FFF', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(108, 92, 231, 0.28)'
              }}>
              <Plus size={16} /> + {terms.lessonSingular} Qo'shish
            </button>

            {currentClass && (
              <button
                onClick={() => onQuickSeed(currentClass.id, currentClass.name)}
                title="Barcha asosiy fanlar va o'qituvchilarni biriktirgan holda to'liq haftalik jadvalni yaratish"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                  borderRadius: 14, border: `1px solid ${THEME.orange}`,
                  backgroundColor: '#FFF9F2', color: THEME.orange,
                  fontWeight: 800, fontSize: 12.5, cursor: 'pointer'
                }}>
                <Sparkles size={15} /> ⚡ Namuna Jadval Yuklash
              </button>
            )}

            {currentClass && classSchedules.length > 0 && (
              <button
                onClick={() => onClearClass(currentClass.id, currentClass.name)}
                title="Ushbu sinfning barcha dars jadvallarini tozalash"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                  borderRadius: 14, border: '1px solid #FCA5A5',
                  backgroundColor: '#FEF2F2', color: '#DC2626',
                  fontWeight: 800, fontSize: 12.5, cursor: 'pointer'
                }}>
                <Trash2 size={15} /> Tozalash
              </button>
            )}
          </div>
        </div>

        {/* Sinflar / Guruhlar Gorizontal Tanlagichi (Tabs) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
          {classesList.map(c => {
            const isSelected = String(c.id) === String(currentClass?.id);
            const count = schedulesList.filter(s => String(s.school_class) === String(c.id)).length;
            return (
              <button
                key={c.id}
                onClick={() => onSelectClassId(c.id)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 14,
                  border: `1.5px solid ${isSelected ? THEME.primary : THEME.border}`,
                  background: isSelected ? THEME.primaryLight : '#FFFFFF',
                  color: isSelected ? THEME.primary : THEME.textDark,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 12px rgba(108, 92, 231, 0.12)' : 'none',
                }}>
                <span>{c.name}</span>
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 8,
                    backgroundColor: isSelected ? THEME.primary : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : THEME.textMuted,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                  {count} dars
                </span>
              </button>
            );
          })}
        </div>

        {/* Faol Sinf Ma'lumotlari Qatori */}
        {currentClass && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 12.5, color: THEME.textMuted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span>Tanlangan {terms.groupSingularLower}: <b style={{ color: THEME.primary, fontSize: 14 }}>{currentClass.name}</b></span>
              <span style={{
                padding: '2px 8px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                backgroundColor: classShift === 2 ? '#FEF3C7' : '#EFF6FF',
                color: classShift === 2 ? '#B45309' : '#1D4ED8',
                border: classShift === 2 ? '1px solid #FDE68A' : '1px solid #BFDBFE',
              }}>
                {classShift === 2 ? "🌇 2-smena (Abeddan keyingi)" : "🌅 1-smena (Ertalabki)"}
              </span>
              <span>👨‍🏫 {terms.advisorLabel}: <b style={{ color: THEME.textDark }}>{currentClass.advisor_teacher || "Belgilanmagan"}</b></span>
              <span>📍 Xona: <b style={{ color: THEME.textDark }}>{currentClass.room_number || "Asosiy bino"}</b></span>
              <span>⏱️ Dars: <b style={{ color: THEME.primary }}>{schoolConfig?.lesson_duration_minutes || 45} daqiqa</b> ({standardSlots[0]?.start || (classShift === 2 ? '13:30' : '08:30')} dan)</span>
              {onGoToSettings && (
                <button
                  onClick={onGoToSettings}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 800,
                    color: THEME.primary,
                    cursor: 'pointer'
                  }}>
                  ⚙️ Vaqtni Sozlash
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, color: THEME.primary }}>
                Jami haftalik: {classSchedules.length} ta {terms.lessonSingularLower}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. KUNLAR VA KO'RINISH TANLAGICHI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        {/* Kunlar Tablari */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {daysList.map(d => {
            const isDaySelected = activeDay === d.id;
            const dayLessonsCount = classSchedules.filter(s => s.day_of_week === d.id).length;
            const isToday = d.id === currentDayNum;
            return (
              <button
                key={d.id}
                onClick={() => {
                  setActiveDay(d.id);
                  if (viewMode === 'grid') setViewMode('day');
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: 14,
                  border: `1px solid ${isDaySelected && viewMode === 'day' ? THEME.primary : THEME.border}`,
                  background: isDaySelected && viewMode === 'day' ? THEME.gradient : '#FFFFFF',
                  color: isDaySelected && viewMode === 'day' ? '#FFFFFF' : THEME.textDark,
                  fontWeight: 800,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  boxShadow: isDaySelected && viewMode === 'day' ? '0 4px 14px rgba(108, 92, 231, 0.25)' : 'none',
                }}>
                <span>{d.name}</span>
                {isToday && (
                  <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 6, backgroundColor: isDaySelected ? 'rgba(255,255,255,0.3)' : '#ECFDF5', color: isDaySelected ? '#FFF' : THEME.green }}>
                    Bugun
                  </span>
                )}
                <span style={{ fontSize: 11, opacity: 0.85, fontWeight: 700 }}>
                  ({dayLessonsCount})
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '9px 16px',
              borderRadius: 14,
              border: `1px solid ${viewMode === 'grid' ? THEME.primary : THEME.border}`,
              background: viewMode === 'grid' ? THEME.gradient : '#FFFFFF',
              color: viewMode === 'grid' ? '#FFFFFF' : THEME.textDark,
              fontWeight: 800,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: viewMode === 'grid' ? '0 4px 14px rgba(108, 92, 231, 0.25)' : 'none',
            }}>
            <Calendar size={14} /> Barcha Kunlar (Haftalik Matritsa)
          </button>
        </div>
      </div>

      {/* 3. ASOSIY DARS JADVALI KO'RINISHLARI */}
      {viewMode === 'day' ? (
        /* KUNLIK BATAFSIL KO'RINISH */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(() => {
            const currentDayObj = daysList.find(d => d.id === activeDay) || daysList[0];
            const dayLessons = classSchedules.filter(s => s.day_of_week === activeDay).sort((a, b) => a.lesson_order - b.lesson_order);

            return (
              <div style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 26, border: `1px solid ${THEME.border}`, boxShadow: '0 8px 24px rgba(108, 92, 231, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: THEME.textDark }}>
                      {currentClass?.name} • {currentDayObj.name} kungi darslar
                    </div>
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 3 }}>
                      Jami {dayLessons.length} ta dars rejalashtirilgan
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenAddModal({ class_id: currentClass?.id, day_of_week: activeDay })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                      borderRadius: 12, border: `1px solid ${THEME.primary}`,
                      backgroundColor: THEME.primaryLight, color: THEME.primary,
                      fontWeight: 800, fontSize: 12, cursor: 'pointer'
                    }}>
                    <Plus size={14} /> + Bu kunga dars qo'shish
                  </button>
                </div>

                {/* Dars soatlari ro'yxati */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {standardSlots.map(slot => {
                    const lesson = dayLessons.find(l => l.lesson_order === slot.order);
                    const colorScheme = lesson ? getSubjectColor(lesson.subject_name) : null;

                    if (lesson) {
                      return (
                        <div
                          key={lesson.id}
                          style={{
                            padding: 18,
                            borderRadius: 18,
                            border: `1.5px solid ${colorScheme.border}`,
                            backgroundColor: colorScheme.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 14,
                            transition: 'all 0.2s',
                          }}>
                          {/* Chap: Tartib & Fan */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div
                              style={{
                                width: 46,
                                height: 46,
                                borderRadius: 14,
                                backgroundColor: '#FFFFFF',
                                color: colorScheme.text,
                                border: `1px solid ${colorScheme.border}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: 12,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                              }}>
                              <span style={{ fontSize: 13 }}>{slot.order}</span>
                              <span style={{ fontSize: 9.5, opacity: 0.8 }}>dars</span>
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16 }}>{colorScheme.badge}</span>
                                <span style={{ fontWeight: 900, fontSize: 16, color: THEME.textDark }}>
                                  {lesson.subject_name}
                                </span>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: 8,
                                    backgroundColor: '#FFFFFF',
                                    color: colorScheme.text,
                                    fontWeight: 800,
                                    fontSize: 11,
                                    border: `1px solid ${colorScheme.border}`
                                  }}>
                                  {lesson.start_time} - {lesson.end_time}
                                </span>
                              </div>

                              {lesson.topic && (
                                <div style={{ fontSize: 12, color: THEME.textDark, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span>📝 Mavzu:</span>
                                  <b>{lesson.topic}</b>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* O'rta: O'qituvchi & Xona */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: 12, border: `1px solid ${colorScheme.border}` }}>
                              <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: THEME.primaryLight, color: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>
                                👨‍🏫
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 12.5, color: THEME.textDark }}>
                                  {lesson.teacher_full_name || lesson.teacher_name || "O'qituvchi tayinlanmagan"}
                                </div>
                                <div style={{ fontSize: 10.5, color: THEME.textMuted }}>
                                  Fan o'qituvchisi
                                </div>
                              </div>
                            </div>

                            <div style={{ backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: 12, border: `1px solid ${colorScheme.border}`, fontWeight: 800, fontSize: 12, color: THEME.textDark }}>
                              📍 {lesson.room_number || currentClass?.room_number || "Xona belgilanmagan"}
                            </div>
                          </div>

                          {/* O'ng: Amallar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              onClick={() => onEditSchedule(lesson)}
                              title="Tahrirlash"
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                borderRadius: 10,
                                color: THEME.primary,
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}>
                              <Edit size={13} /> Tahrirlash
                            </button>
                            <button
                              onClick={() => onDeleteSchedule(lesson.id, `${lesson.subject_name} (${slot.order}-dars)`)}
                              title="O'chirish"
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#FEE2E2',
                                border: '1px solid #FCA5A5',
                                borderRadius: 10,
                                color: '#EF4444',
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}>
                              <Trash2 size={13} /> O'chirish
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      /* Bo'sh slot */
                      return (
                        <div
                          key={`empty-${slot.order}`}
                          onClick={() => onOpenAddModal({ class_id: currentClass?.id, day_of_week: activeDay, lesson_order: slot.order, start_time: slot.start, end_time: slot.end })}
                          style={{
                            padding: '14px 20px',
                            borderRadius: 16,
                            border: '1.5px dashed #CBD5E1',
                            backgroundColor: '#F8FAFC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = THEME.primary}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#CBD5E1'}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontWeight: 800, fontSize: 13, color: THEME.textMuted }}>
                              {slot.order}-dars • {slot.start} - {slot.end}
                            </span>
                            <span style={{ fontSize: 12, color: THEME.textMuted }}>
                              (Bo'sh soat — dars rejalashtirilmagan)
                            </span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 800, color: THEME.primary, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Plus size={14} /> Dars kiritish
                          </span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* HAFTALIK MATRITSA JADVALI */
        <div style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 26, border: `1px solid ${THEME.border}`, overflowX: 'auto', boxShadow: '0 8px 24px rgba(108, 92, 231, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, color: THEME.textDark }}>
                {currentClass?.name} — To'liq Haftalik Dars Jadvali
              </div>
              <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                Dushanbadan Shanbagacha barcha soatlar kesimidagi to'liq reja
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}` }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: THEME.textMuted, width: 130 }}>Soat / Vaqt</th>
                {daysList.map(d => (
                  <th key={d.id} style={{ padding: '12px 10px', color: THEME.textDark, fontWeight: 900, fontSize: 13 }}>
                    {d.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standardSlots.map(slot => (
                <tr key={slot.order} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                  <td style={{ padding: '14px 10px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 900, color: THEME.textDark }}>{slot.order}-dars</div>
                    <div style={{ fontSize: 10.5, color: THEME.textMuted }}>{slot.start} - {slot.end}</div>
                  </td>
                  {daysList.map(d => {
                    const item = classSchedules.find(s => s.day_of_week === d.id && s.lesson_order === slot.order);
                    const colorScheme = item ? getSubjectColor(item.subject_name) : null;

                    return (
                      <td key={d.id} style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                        {item ? (
                          <div
                            style={{
                              padding: '10px 8px',
                              borderRadius: 12,
                              backgroundColor: colorScheme.bg,
                              border: `1px solid ${colorScheme.border}`,
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 4,
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 900, color: THEME.textDark, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {colorScheme.badge} {item.subject_name}
                              </span>
                              <div style={{ display: 'flex', gap: 3 }}>
                                <button
                                  onClick={() => onEditSchedule(item)}
                                  style={{ padding: 2, background: 'transparent', border: 'none', cursor: 'pointer', color: THEME.primary }}
                                  title="Tahrirlash">
                                  <Edit size={11} />
                                </button>
                                <button
                                  onClick={() => onDeleteSchedule(item.id, item.subject_name)}
                                  style={{ padding: 2, background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                                  title="O'chirish">
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                            <div style={{ fontSize: 10.5, color: THEME.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              👨‍🏫 {item.teacher_full_name || item.teacher_name || "Ustoz"}
                            </div>
                            <div style={{ fontSize: 10, color: colorScheme.text, fontWeight: 700 }}>
                              📍 {item.room_number || currentClass?.room_number || "Xona"}
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => onOpenAddModal({ class_id: currentClass?.id, day_of_week: d.id, lesson_order: slot.order, start_time: slot.start, end_time: slot.end })}
                            style={{
                              padding: 10,
                              borderRadius: 10,
                              border: '1px dashed #E2E8F0',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              fontSize: 11,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 60,
                            }}
                            title="Dars kiritish">
                            +
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 5.6. DARS JADVALINI QO'SHISH VA TAHRIRLASH MODALI
// =========================================================================
function AddEditLessonModal({
  initialData,
  classesList = [],
  teachersList = [],
  selectedClassId,
  schoolConfig,
  terms = buildSchoolTerms({}),
  onClose,
  onSave,
}) {
  const isEdit = Boolean(initialData && initialData.id);

  const [classId, setClassId] = useState(
    initialData?.school_class || initialData?.class_id || selectedClassId || (classesList[0]?.id || '')
  );

  const selectedClass = classesList.find(c => String(c.id) === String(classId));
  const classShift = Number(selectedClass?.shift || 1);
  const activeSlots = generateLessonSlots(schoolConfig, 7, classShift);

  const standardTimes = {};
  activeSlots.forEach(s => {
    standardTimes[s.order] = { start: s.start, end: s.end };
  });

  const [dayOfWeek, setDayOfWeek] = useState(initialData?.day_of_week || 1);
  const [lessonOrder, setLessonOrder] = useState(initialData?.lesson_order || 1);
  const [subjectName, setSubjectName] = useState(initialData?.subject_name || '');
  const [teacherId, setTeacherId] = useState(initialData?.teacher || initialData?.teacher_id || '');
  const [teacherName, setTeacherName] = useState(initialData?.teacher_name || '');
  const [roomNumber, setRoomNumber] = useState(initialData?.room_number || '');
  const [startTime, setStartTime] = useState(
    initialData?.start_time || standardTimes[initialData?.lesson_order || 1]?.start || (classShift === 2 ? '13:30' : '08:30')
  );
  const [endTime, setEndTime] = useState(
    initialData?.end_time || standardTimes[initialData?.lesson_order || 1]?.end || (classShift === 2 ? '14:15' : '09:15')
  );
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [submitting, setSubmitting] = useState(false);

  const handleClassChange = (newCid) => {
    setClassId(newCid);
    const cls = classesList.find(c => String(c.id) === String(newCid));
    const s = Number(cls?.shift || 1);
    const slots = generateLessonSlots(schoolConfig, 7, s);
    const curSlot = slots.find(item => item.order === lessonOrder) || slots[0];
    if (curSlot) {
      setStartTime(curSlot.start);
      setEndTime(curSlot.end);
    }
  };

  const days = [
    { id: 1, name: "Dushanba" },
    { id: 2, name: "Seshanba" },
    { id: 3, name: "Chorshanba" },
    { id: 4, name: "Payshanba" },
    { id: 5, name: "Juma" },
    { id: 6, name: "Shanba" },
  ];

  const handleLessonOrderChange = (order) => {
    setLessonOrder(order);
    if (standardTimes[order]) {
      setStartTime(standardTimes[order].start);
      setEndTime(standardTimes[order].end);
    }
  };

  const popularSubjects = [
    "Matematika", "Algebra", "Geometriya", "Ona tili", "Adabiyot",
    "Fizika", "Kimyo", "Biologiya", "Ingliz tili", "Informatika",
    "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Jismoniy tarbiya", "Musiqa"
  ];

  const handleTeacherSelect = (tid) => {
    setTeacherId(tid);
    const found = teachersList.find(t => String(t.id) === String(tid));
    if (found) {
      setTeacherName(found.name);
      if (!roomNumber && found.rooms) {
        setRoomNumber(found.rooms);
      }
    } else {
      setTeacherName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classId) return alert("Iltimos, sinfni tanlang!");
    if (!subjectName.trim()) return alert("Iltimos, fan nomini kiriting!");

    setSubmitting(true);
    await onSave({
      id: initialData?.id,
      class_id: classId,
      day_of_week: Number(dayOfWeek),
      lesson_order: Number(lessonOrder),
      subject_name: subjectName.trim(),
      teacher_id: teacherId || null,
      teacher_name: teacherName.trim(),
      room_number: roomNumber.trim(),
      start_time: startTime.trim(),
      end_time: endTime.trim(),
      topic: topic.trim(),
    });
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, maxWidth: 540, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: 30, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: THEME.gradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={22} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: THEME.textDark }}>
                {isEdit ? `${terms.lessonSingular}ni Tahrirlash` : `Yangi ${terms.lessonSingular} Kiritish`}
              </div>
              <div style={{ fontSize: 12, color: THEME.textMuted }}>
                Haftalik dars jadvaliga dars va ustozni biriktirish
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color={THEME.textMuted} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* 1. Sinf & Hafta kuni */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>{terms.groupSingular}ni Tanlang *</label>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 6,
                  backgroundColor: classShift === 2 ? '#FEF3C7' : '#EFF6FF',
                  color: classShift === 2 ? '#B45309' : '#1D4ED8',
                }}>
                  {classShift === 2 ? "🌇 2-smena" : "🌅 1-smena"}
                </span>
              </div>
              <select
                value={classId}
                onChange={e => handleClassChange(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, fontWeight: 700 }}>
                {classesList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shift === 2 ? "2-smena (Abeddan keyin)" : "1-smena (Ertalabki)"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Hafta Kuni *</label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value))}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, fontWeight: 700 }}>
                {days.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Dars tartibi & Vaqtlari */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>{terms.lessonSingular} Tartibi *</label>
              <select
                value={lessonOrder}
                onChange={e => handleLessonOrderChange(Number(e.target.value))}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, fontWeight: 700 }}>
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>{num}-{terms.lessonSingularLower}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Boshlanish</label>
              <input
                type="text"
                placeholder="08:30"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Tugash</label>
              <input
                type="text"
                placeholder="09:15"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* 3. Fan nomi va Tezkor teglar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Fan Nomi *</label>
              <span style={{ fontSize: 11, color: THEME.textMuted }}>yoki pastdagi teglardan birini bosing</span>
            </div>
            <input
              type="text"
              placeholder="Masalan: Matematika, Fizika, Kimyo..."
              value={subjectName}
              onChange={e => setSubjectName(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
            />
            {/* Tezkor teglar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {popularSubjects.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubjectName(sub)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: subjectName === sub ? THEME.primaryLight : '#F8FAFC',
                    color: subjectName === sub ? THEME.primary : THEME.textDark,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}>
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* 4. O'qituvchini tanlash */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Dars O'qituvchisi (Ustoz)</label>
            <select
              value={teacherId}
              onChange={e => handleTeacherSelect(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, fontWeight: 600 }}>
              <option value="">-- Maktab o'qituvchilaridan tanlang ({teachersList.length} nafar) --</option>
              {teachersList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.subject} • ID: {t.teacher_id || t.username})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Xona raqami va Mavzu */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Xona Raqami</label>
              <input
                type="text"
                placeholder="204-xona"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Rejadagi Mavzu (Ixtiyoriy)</label>
              <input
                type="text"
                placeholder="Mavzu nomi..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: 13, background: '#F1F5F9', color: THEME.textDark, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ flex: 1.5, padding: 13, background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Saqlanmoqda..." : (isEdit ? "O'zgarishlarni Saqlash" : "Jadvalga Kiritish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



// =========================================================================
// 6. O'QUVCHILAR RO'YXATI VA YARATILGANLIK TARIXI SAHIFASI
// =========================================================================
function StudentsListSection({ realStudents, schoolName, terms = buildSchoolTerms({}), searchTerm, setSearchTerm, onStudentClick, onEditStudent, onDeleteStudent, onAddStudent, onPreviewImage }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: 26, borderRadius: 26, border: `1px solid ${THEME.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: THEME.textDark, margin: 0 }}>
            {schoolName} — {terms.studentPlural} Bazasi va Yaratilganlik Tarixi
          </h3>
          <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
            Ushbu maktab bazasida jami <b>{realStudents.length} nafar</b> {terms.studentSingularLower} ro'yxatga olingan (boshqa maktablarga ko'rinmaydi)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: `1px solid ${THEME.border}`, borderRadius: 14, width: 300, backgroundColor: THEME.bgSoft }}>
          <Search size={16} color={THEME.textMuted} />
          <input 
            placeholder="Ism, ID yoki yaratgan shaxs..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13 }} 
          />
        </div>
      </div>

      {realStudents.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: THEME.textMuted }}>
          <Users size={42} color={THEME.primary} style={{ opacity: 0.35, marginBottom: 10 }} />
          <div style={{ fontWeight: 800, fontSize: 16, color: THEME.textDark }}>
            Ushbu maktab bazasida hozircha {terms.studentPluralLower} yo'q
          </div>
          <div style={{ fontSize: 12.5, marginTop: 6, marginBottom: 16 }}>
            Har bir maktab o'z {terms.studentPluralLower}ini mustaqil yaratadi va ular faqat shu maktab bazasida saqlanadi.
          </div>
          {onAddStudent && (
            <button
              onClick={onAddStudent}
              style={{ padding: '10px 20px', borderRadius: 14, border: 'none', background: THEME.gradient, color: '#FFF', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              + Yangi {terms.studentSingular} Yaratish
            </button>
          )}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted, textTransform: 'uppercase', fontSize: 11 }}>
              <th style={{ padding: '12px 14px' }}>3x4 Foto</th>
              <th style={{ padding: '12px 14px' }}>Familiya & Ism</th>
              <th style={{ padding: '12px 14px' }}>{terms.groupSingular}</th>
              <th style={{ padding: '12px 14px' }}>Kirish ID</th>
              <th style={{ padding: '12px 14px' }}>Parol</th>
              <th style={{ padding: '12px 14px' }}>Yaratilganlik Tarixi (Kim & Qachon)</th>
              <th style={{ padding: '12px 14px' }}>Maktab Bazasi</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {realStudents
              .filter(st => {
                const full = `${st.last_name} ${st.first_name} ${st.student_id} ${st.created_by || ''} ${st.class_name || ''}`.toLowerCase();
                return full.includes(searchTerm.toLowerCase());
              })
              .map(st => {
                const isSuperCreator = (st.created_by_role || '').includes('SUPER') || (st.created_by || '').toLowerCase().includes('super');
                return (
                  <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div
                        onClick={(e) => {
                          if (st.photo_3x4 && onPreviewImage) {
                            e.stopPropagation();
                            onPreviewImage({
                              url: normalizeMediaUrl(st.photo_3x4),
                              title: `${st.last_name} ${st.first_name}`,
                              subtitle: `${terms.studentSingular} • ${terms.formatGroupBadge(st.class_name)}`,
                              badge: terms.studentSingular,
                              idNumber: st.student_id,
                              schoolName: st.school_name || schoolName,
                            });
                          }
                        }}
                        title={st.photo_3x4 ? "Rasmni kattalashtirib ko'rish (bosing)" : ""}
                        style={{
                          width: 40,
                          height: 50,
                          borderRadius: 8,
                          overflow: 'hidden',
                          cursor: st.photo_3x4 ? 'zoom-in' : 'default',
                          position: 'relative',
                          border: `1px solid ${THEME.border}`,
                          backgroundColor: THEME.primaryLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.18s ease',
                        }}
                        onMouseEnter={(e) => { if (st.photo_3x4) e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                        {st.photo_3x4 ? (
                          <>
                            <img src={normalizeMediaUrl(st.photo_3x4)} alt={st.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#FFF', borderRadius: 3, padding: 1, display: 'flex' }}>
                              <ZoomIn size={10} />
                            </div>
                          </>
                        ) : (
                          <div style={{ color: THEME.primary, fontSize: 11, fontWeight: 800 }}>
                            {(st.last_name?.[0] || '') + (st.first_name?.[0] || '')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 800, color: THEME.textDark }}>
                      {st.last_name} {st.first_name}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ padding: '4px 10px', backgroundColor: THEME.primaryLight, color: THEME.primary, borderRadius: 8, fontWeight: 800, fontSize: 11.5 }}>
                        {terms.formatGroupBadge(st.class_name)}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 800, color: THEME.primary }}>
                      <code>{st.student_id}</code>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <code style={{ padding: '3px 8px', backgroundColor: '#F1F5F9', borderRadius: 6, fontSize: 12 }}>{st.initial_password}</code>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 800,
                          backgroundColor: isSuperCreator ? '#FFF0F3' : '#ECFDF5',
                          color: isSuperCreator ? '#E11D48' : THEME.green,
                        }}>
                          {isSuperCreator ? 'SUPER ADMIN' : 'MAKTAB ADMINI'}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: THEME.textDark }}>
                          {st.created_by || "Maktab Direktori"}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>
                        🕒 Yaratilgan vaqti: <b>{st.date_joined || '2026-10-18'}</b>
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ padding: '4px 8px', backgroundColor: '#F8FAFC', border: `1px solid ${THEME.border}`, color: THEME.textDark, borderRadius: 8, fontWeight: 700, fontSize: 11 }}>
                        🔒 {st.school_name || schoolName}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button 
                          onClick={() => onStudentClick(st)}
                          title="Batafsil va yaratilganlik tarixini ko'rish"
                          style={{ padding: '7px 11px', background: THEME.primaryLight, border: 'none', color: THEME.primary, borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: 12 }}>
                          Tarix & Ko'rish
                        </button>
                        <button 
                          onClick={() => onEditStudent(st)}
                          title="Tahrirlash"
                          style={{ padding: '7px 9px', background: '#F1F0FF', border: 'none', color: THEME.primary, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => onDeleteStudent(st.id, `${st.first_name} ${st.last_name}`)}
                          title="O'chirish"
                          style={{ padding: '7px 9px', background: '#FEE2E2', border: 'none', color: '#EF4444', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// =========================================================================
// 7. O'QITUVCHILAR RO'YXATI VA YARATILGANLIK TARIXI SAHIFASI
// =========================================================================
function TeachersListSection({ teachers = [], schoolName, terms = buildSchoolTerms({}), onTeacherClick, onAddTeacher, onDeleteTeacher, onPreviewImage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const full = `${t.name || ''} ${t.teacher_id || t.username || ''} ${t.subject || ''} ${t.group || ''} ${t.rooms || ''} ${t.phone || ''} ${t.created_by || ''}`.toLowerCase();
    return full.includes(q);
  });

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: 26, borderRadius: 26, border: `1px solid ${THEME.border}` }}>
      {/* Sarlavha va Qidiruv (Xuddi O'quvchilar sahifasidek) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: THEME.textDark, margin: 0 }}>
            {schoolName} — O'qituvchilar Bazasi va Yaratilganlik Tarixi
          </h3>
          <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
            Ushbu maktab bazasida jami <b>{teachers.length} nafar</b> o'qituvchi ro'yxatga olingan (boshqa maktablarga ko'rinmaydi)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: `1px solid ${THEME.border}`, borderRadius: 14, width: 280, backgroundColor: THEME.bgSoft }}>
            <Search size={16} color={THEME.textMuted} />
            <input 
              placeholder="Ism, 5 xonali ID yoki yaratgan shaxs..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13 }} 
            />
          </div>
          {onAddTeacher && (
            <button
              onClick={onAddTeacher}
              style={{ padding: '10px 18px', borderRadius: 14, border: 'none', background: THEME.gradient, color: '#FFF', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 8px 18px rgba(108, 92, 231, 0.25)', whiteSpace: 'nowrap' }}>
              <Plus size={16} /> + O'qituvchi Qo'shish
            </button>
          )}
        </div>
      </div>

      {teachers.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: THEME.textMuted }}>
          <GraduationCap size={42} color={THEME.primary} style={{ opacity: 0.35, marginBottom: 10 }} />
          <div style={{ fontWeight: 800, fontSize: 16, color: THEME.textDark }}>
            Ushbu maktab bazasida hozircha o'qituvchilar yo'q
          </div>
          <div style={{ fontSize: 12.5, marginTop: 6, marginBottom: 16 }}>
            Har bir maktab o'z o'qituvchilarini mustaqil ro'yxatga oladi va har biriga 5 xonali unikal ID hamda maxfiy parol biriktiriladi.
          </div>
          {onAddTeacher && (
            <button
              onClick={onAddTeacher}
              style={{ padding: '10px 20px', borderRadius: 14, border: 'none', background: THEME.gradient, color: '#FFF', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              + Yangi O'qituvchi Yaratish
            </button>
          )}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted, textTransform: 'uppercase', fontSize: 11 }}>
              <th style={{ padding: '12px 14px' }}>Ustoz</th>
              <th style={{ padding: '12px 14px' }}>Familiya & Ism</th>
              <th style={{ padding: '12px 14px' }}>Fan Yo'nalishi</th>
              <th style={{ padding: '12px 14px' }}>Biriktirilgan {terms.groupSingular}</th>
              <th style={{ padding: '12px 14px' }}>Kirish ID (5 xonali)</th>
              <th style={{ padding: '12px 14px' }}>Parol</th>
              <th style={{ padding: '12px 14px' }}>Yaratilganlik Tarixi (Kim & Qachon)</th>
              <th style={{ padding: '12px 14px' }}>Maktab Bazasi</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map(t => {
              const isSuperCreator = (t.created_by_role || '').includes('SUPER') || (t.created_by || '').toLowerCase().includes('super');
              const teacherId = String(t.teacher_id || t.username);
              const teacherPwd = t.initial_password || 'teacher123';
              const isPwdVisible = !!visiblePasswords[t.id];

              return (
                <tr key={t.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div 
                      onClick={(e) => {
                        if (t.photo_3x4 && onPreviewImage) {
                          e.stopPropagation();
                          onPreviewImage({
                            url: normalizeMediaUrl(t.photo_3x4),
                            title: t.name,
                            subtitle: `${t.subject} • ${terms.formatGroupBadge(t.group)}`,
                            badge: "O'qituvchi",
                            idNumber: teacherId,
                            schoolName: t.school_name || schoolName,
                          });
                        }
                      }}
                      title={t.photo_3x4 ? "Rasmni kattalashtirib ko'rish (bosing)" : ""}
                      style={{ 
                        width: 42, 
                        height: 52, 
                        borderRadius: 12, 
                        background: t.photo_3x4 ? '#FFF' : THEME.gradient, 
                        color: '#FFF', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold', 
                        fontSize: 15, 
                        boxShadow: '0 4px 10px rgba(108, 92, 231, 0.2)',
                        overflow: 'hidden',
                        cursor: t.photo_3x4 ? 'zoom-in' : 'default',
                        position: 'relative',
                        border: t.photo_3x4 ? `1.5px solid ${THEME.border}` : 'none',
                        transition: 'transform 0.18s ease',
                      }}
                      onMouseEnter={(e) => { if (t.photo_3x4) e.currentTarget.style.transform = 'scale(1.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {t.photo_3x4 ? (
                        <>
                          <img src={normalizeMediaUrl(t.photo_3x4)} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#FFF', borderRadius: 3, padding: 1, display: 'flex' }}>
                            <ZoomIn size={10} />
                          </div>
                        </>
                      ) : (
                        t.name ? t.name[0] : 'U'
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 800, color: THEME.textDark }}>
                    {t.name}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', backgroundColor: THEME.primaryLight, color: THEME.primary, borderRadius: 8, fontWeight: 800, fontSize: 11.5 }}>
                      {t.subject}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 8px', backgroundColor: '#F8FAFC', border: `1px solid ${THEME.border}`, color: THEME.textDark, borderRadius: 8, fontWeight: 700, fontSize: 11 }}>
                      {terms.formatGroupBadge(t.group)}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <code style={{ padding: '4px 8px', backgroundColor: THEME.primaryLight, color: THEME.primary, borderRadius: 8, fontFamily: 'monospace', fontWeight: 900, fontSize: 13, letterSpacing: '0.06em' }}>
                        {teacherId}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(teacherId, `id-${t.id}`)}
                        title="5 xonali ID dan nusxa olish"
                        style={{ border: 'none', backgroundColor: copiedKey === `id-${t.id}` ? '#DCFCE7' : '#F1F0FF', color: copiedKey === `id-${t.id}` ? '#15803D' : THEME.primary, padding: '3px 6px', borderRadius: 6, fontSize: 10.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Copy size={11} />
                        {copiedKey === `id-${t.id}` ? 'OK' : ''}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <code style={{ padding: '3px 8px', backgroundColor: '#F1F5F9', borderRadius: 6, fontSize: 12, fontFamily: isPwdVisible ? 'monospace' : 'inherit' }}>
                        {isPwdVisible ? teacherPwd : '••••••••'}
                      </code>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(t.id)}
                        title={isPwdVisible ? "Parolni yashirish" : "Parolni ko'rish"}
                        style={{ border: 'none', backgroundColor: '#F8FAFC', color: THEME.textDark, padding: '3px 6px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {isPwdVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(teacherPwd, `pwd-${t.id}`)}
                        title="Paroldan nusxa olish"
                        style={{ border: 'none', backgroundColor: copiedKey === `pwd-${t.id}` ? '#DCFCE7' : '#F1F0FF', color: copiedKey === `pwd-${t.id}` ? '#15803D' : THEME.primary, padding: '3px 6px', borderRadius: 6, fontSize: 10.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Copy size={11} />
                        {copiedKey === `pwd-${t.id}` ? 'OK' : ''}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 800,
                        backgroundColor: isSuperCreator ? '#FFF0F3' : '#ECFDF5',
                        color: isSuperCreator ? '#E11D48' : THEME.green,
                      }}>
                        {isSuperCreator ? 'SUPER ADMIN' : 'MAKTAB ADMINI'}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 12, color: THEME.textDark }}>
                        {t.created_by || "Maktab Direktori"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>
                      🕒 Yaratilgan vaqti: <b>{t.created_at || '2026-10-18'}</b>
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 8px', backgroundColor: '#F8FAFC', border: `1px solid ${THEME.border}`, color: THEME.textDark, borderRadius: 8, fontWeight: 700, fontSize: 11 }}>
                      🔒 {t.school_name || schoolName}
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <button 
                        onClick={() => onTeacherClick && onTeacherClick(t)}
                        title="Batafsil va yaratilganlik tarixini ko'rish"
                        style={{ padding: '7px 11px', background: THEME.primaryLight, border: 'none', color: THEME.primary, borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        Tarix & Ko'rish
                      </button>
                      {onDeleteTeacher && (
                        <button 
                          onClick={() => onDeleteTeacher(t.id, t.name)}
                          title="O'chirish"
                          style={{ padding: '7px 9px', background: '#FEE2E2', border: 'none', color: '#EF4444', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// =========================================================================
// 8. DAVOMAT VA MAKTAB AUDITI (FACE ID VA TURNIKET — HIKVISION INTEGRATSIYASI)
// =========================================================================
function AttendanceAuditSection({ realStudents = [], schoolName, schoolId = '1', terms = buildSchoolTerms({}) }) {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total_today: 0,
    today_entries: 0,
    today_exits: 0,
    inside_count: 0,
    unique_students_today: 0,
    unrecognized_today: 0,
    success_rate: 99.2,
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState('ALL'); // ALL, IN, OUT, UNKNOWN
  const [newLogIds, setNewLogIds] = useState(new Set());
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showApiDocsModal, setShowApiDocsModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Hikvision terminal sinxronizatsiyasi parametrlari
  const [syncHost, setSyncHost] = useState('192.168.1.120');
  const [syncPort, setSyncPort] = useState(80);
  const [syncUsername, setSyncUsername] = useState('admin');
  const [syncPassword, setSyncPassword] = useState('hik12345');
  const [syncSimulate, setSyncSimulate] = useState(true);
  const [syncSelectedStudent, setSyncSelectedStudent] = useState('');
  const [syncTestingConnection, setSyncTestingConnection] = useState(false);
  const [syncConnResult, setSyncConnResult] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState(null);

  // Simulyator formasi holati
  const [simForm, setSimForm] = useState({
    studentId: '',
    direction: 'IN',
    deviceName: 'Hikvision MinMoe DS-K1T673 - Bosh Kirish',
    confidence: 99.5,
    temperature: 36.5,
  });

  const prevLogIdsRef = React.useRef(new Set());

  // Backenddan loglarni olish
  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/devices/logs/?school_id=${encodeURIComponent(schoolId)}&limit=150`);
      if (res.ok) {
        const data = await res.json();
        const incomingLogs = data.logs || [];
        setLogs(incomingLogs);
        if (data.stats) setStats(data.stats);

        const nowStr = new Date().toLocaleTimeString('uz-UZ');
        setLastUpdated(nowStr);

        // Yangi kelgan loglarni aniqlash va ularni 8 sekundga porlash effekti bilan ajratib ko'rsatish
        const currentIds = new Set(incomingLogs.map(l => l.id));
        if (prevLogIdsRef.current.size > 0) {
          const freshIds = new Set();
          currentIds.forEach(id => {
            if (!prevLogIdsRef.current.has(id)) {
              freshIds.add(id);
            }
          });
          if (freshIds.size > 0) {
            setNewLogIds(prev => new Set([...prev, ...freshIds]));
            setTimeout(() => {
              setNewLogIds(prev => {
                const next = new Set(prev);
                freshIds.forEach(id => next.delete(id));
                return next;
              });
            }, 8000);
          }
        }
        prevLogIdsRef.current = currentIds;
      }
    } catch (_) {
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Har 3 soniyada real vaqtda bazadan avtomatik yangilash (POLLING)
  useEffect(() => {
    fetchLogs(false);
    let intervalId = null;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchLogs(true);
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [schoolId, autoRefresh]);

  // Test signalini yuborish (Face ID yoki Turniket o'tishini simulyatsiya qilish)
  const handleSendSimulateEvent = async (overrideData = null) => {
    setSimulating(true);
    try {
      const payload = overrideData || {
        student_id: simForm.studentId || (realStudents[0]?.student_id || '23089'),
        direction: simForm.direction,
        device_name: simForm.deviceName,
        confidence: Number(simForm.confidence) || 99.2,
        temperature: Number(simForm.temperature) || 36.5,
        school_id: String(schoolId),
      };

      const res = await fetch('/api/devices/event/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.log) {
        setNewLogIds(prev => new Set([...prev, result.log.id]));
      }

      setActionNotice({
        type: result.success ? 'success' : 'warning',
        text: result.message || "Face ID signali bazaga muvaffaqiyatli qabul qilindi!",
      });
      setTimeout(() => setActionNotice(null), 5000);

      setShowSimulateModal(false);
      await fetchLogs(true);
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setSimulating(false);
    }
  };

  // Hikvision terminali bilan aloqani tekshirish
  const handleTestDeviceConnection = async () => {
    setSyncTestingConnection(true);
    setSyncConnResult(null);
    try {
      const res = await fetch('/api/devices/hikvision/test-connection/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: syncHost.trim() || '192.168.1.120',
          port: Number(syncPort) || 80,
          username: syncUsername.trim() || 'admin',
          password: syncPassword.trim(),
          simulate: syncSimulate,
        }),
      });
      const data = await res.json();
      setSyncConnResult(data);
    } catch (err) {
      setSyncConnResult({ connected: false, message: "Tarmoq xatosi: " + err.message });
    } finally {
      setSyncTestingConnection(false);
    }
  };

  // O'quvchilar va Yuz rasmlarini Hikvision terminaliga ISAPI orqali yuklash
  const handleExecuteHikvisionSync = async () => {
    setSyncing(true);
    setSyncResults(null);
    try {
      const res = await fetch('/api/devices/hikvision/sync/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: syncHost.trim() || '192.168.1.120',
          port: Number(syncPort) || 80,
          username: syncUsername.trim() || 'admin',
          password: syncPassword.trim(),
          student_id: syncSelectedStudent || undefined,
          school_id: String(schoolId),
          simulate: syncSimulate,
        }),
      });
      const data = await res.json();
      setSyncResults(data);
      if (data.success) {
        setActionNotice({
          type: 'success',
          text: data.message || "O'quvchilar Hikvision terminaliga muvaffaqiyatli yuklandi!",
        });
        await fetchLogs(true);
      } else {
        alert("Xatolik: " + (data.message || "Sinxronlashda xatolik yuz berdi"));
      }
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Tezkor bir marta bosish bilan test qilish
  const handleQuickTest = (direction) => {
    const randomStudent = realStudents.length > 0
      ? realStudents[Math.floor(Math.random() * realStudents.length)]
      : null;
    const stId = randomStudent ? (randomStudent.student_id || String(randomStudent.id)) : '23089';
    handleSendSimulateEvent({
      student_id: stId,
      direction: direction,
      device_name: direction === 'IN' ? 'Hikvision MinMoe DS-K1T673 - Bosh Kirish' : 'Hikvision MinMoe DS-K1T673 - Chiqish Turniket 2',
      confidence: Math.round((98 + Math.random() * 1.8) * 10) / 10,
      temperature: 36.5,
      school_id: String(schoolId),
    });
  };

  // Noma'lum shaxs test signali
  const handleUnknownFaceTest = () => {
    handleSendSimulateEvent({
      student_id: 'UNKNOWN_' + Math.floor(1000 + Math.random() * 9000),
      student_name: "Noma'lum Shaxs (Begona)",
      direction: 'IN',
      device_name: 'Hikvision MinMoe DS-K1T673 - Bosh Kirish',
      confidence: 43.5,
      temperature: 36.7,
      school_id: String(schoolId),
    });
  };

  // CSV Eksport
  const handleExportAuditCSV = () => {
    let csv = "\uFEFFID,Vaqt,Sana,O'quvchi F.I.Sh.,ID Kod,Sinf,Harakat,Qurilma,Qurilma IP,Aniqlik %,Harorat,Holat,Tafsilotlar\n";
    filteredLogs.forEach(l => {
      csv += `${l.id},"${l.time || ''}","${l.date || ''}","${l.student_name || ''}","${l.student_code || ''}","${l.class_name || ''}","${l.direction === 'IN' ? 'KIRISH' : 'CHIQISH'}","${l.device_name || ''}","${l.device_ip || ''}",${l.confidence || ''},${l.temperature || ''},"${l.status === 'SUCCESS' ? 'Qabul qilindi' : 'Begona shaxs'}","${l.details || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Maktab_Auditi_FaceID_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loglarni tozalash (test auditni reset qilish)
  const handleClearLogs = async () => {
    if (!window.confirm("Rostdan ham ushbu maktabning barcha qurilma va turniket audit loglarini tozalamoqchimisiz?")) {
      return;
    }
    try {
      await fetch(`/api/devices/logs/?school_id=${encodeURIComponent(schoolId)}`, { method: 'DELETE' });
      setLogs([]);
      setStats({
        total_today: 0,
        today_entries: 0,
        today_exits: 0,
        inside_count: 0,
        unique_students_today: 0,
        unrecognized_today: 0,
        success_rate: 100,
      });
      alert("✅ Audit loglari tozalandi.");
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  // Filtrlash
  const filteredLogs = logs.filter(l => {
    if (directionFilter === 'IN' && l.direction !== 'IN') return false;
    if (directionFilter === 'OUT' && l.direction !== 'OUT') return false;
    if (directionFilter === 'UNKNOWN' && l.status !== 'UNKNOWN_PERSON') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (l.student_name || '').toLowerCase().includes(q) ||
        (l.student_code || '').toLowerCase().includes(q) ||
        (l.class_name || '').toLowerCase().includes(q) ||
        (l.device_name || '').toLowerCase().includes(q) ||
        (l.device_ip || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const apiEndpointUrl = `${window.location.origin}/api/devices/event/`;
  const curlExample = `curl -X POST ${apiEndpointUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"student_id": "${realStudents[0]?.student_id || '23089'}", "direction": "IN", "device_name": "Hikvision MinMoe DS-K1T673 - Bosh Kirish", "confidence": 99.4, "temperature": 36.5}'`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* 1. JONLI MONITORING STATUS PANELI */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: '18px 24px',
        border: `1.5px solid ${autoRefresh ? '#86EFAC' : '#E2E8F0'}`,
        boxShadow: autoRefresh ? '0 10px 25px -5px rgba(34, 197, 94, 0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Idrok Vision Brand Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 14px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, #6C5CE7 0%, #8E44AD 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 12.5,
            boxShadow: '0 4px 14px rgba(108, 92, 231, 0.25)',
          }}>
            <Cpu size={15} />
            <span>Idrok Vision</span>
          </div>

          {/* Pulsating status badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 20,
            backgroundColor: autoRefresh ? '#DCFCE7' : '#F1F5F9',
            border: `1px solid ${autoRefresh ? '#86EFAC' : '#CBD5E1'}`,
          }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: autoRefresh ? '#22C55E' : '#94A3B8',
              boxShadow: autoRefresh ? '0 0 0 4px rgba(34, 197, 94, 0.3)' : 'none',
              animation: autoRefresh ? 'pulse 2s infinite' : 'none',
            }} />
            <span style={{
              fontSize: 12.5,
              fontWeight: 800,
              color: autoRefresh ? '#15803D' : '#64748B',
              letterSpacing: '0.3px',
            }}>
              {autoRefresh ? "JONLI EFIR (Har 3 soniyada)" : "MONITORING TO'XTATILDI"}
            </span>
          </div>

          <div style={{ fontSize: 12, color: THEME.textMuted }}>
            {lastUpdated ? (
              <span>So'nggi qabul: <b>{lastUpdated}</b></span>
            ) : (
              <span>Bog'lanmoqda...</span>
            )}
          </div>
        </div>

        {/* Tezkor boshqaruv tugmalari */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 15px',
              borderRadius: 14,
              border: `1.5px solid ${autoRefresh ? '#CBD5E1' : THEME.primary}`,
              backgroundColor: autoRefresh ? '#FFFFFF' : THEME.primaryLight,
              color: autoRefresh ? THEME.textDark : THEME.primary,
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}>
            {autoRefresh ? <Pause size={14} /> : <Play size={14} />}
            {autoRefresh ? "To'xtatish" : "Jonli rejimni yoqish"}
          </button>

          <button
            onClick={() => fetchLogs(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 15px',
              borderRadius: 14,
              border: `1px solid #CBD5E1`,
              backgroundColor: '#FFFFFF',
              color: THEME.textDark,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Yangilash
          </button>

          <button
            onClick={() => setShowSimulateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 16px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 14px rgba(16, 185, 129, 0.3)',
            }}>
            <Sparkles size={14} />
            Face ID Test Simulyatori
          </button>

          <button
            onClick={() => {
              setShowSyncModal(true);
              setSyncConnResult(null);
              setSyncResults(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 16px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 14px rgba(99, 102, 241, 0.3)',
            }}>
            <Upload size={14} />
            🔄 Terminalga Yuklash (ISAPI Sync)
          </button>

          <button
            onClick={() => setShowApiDocsModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 14,
              border: `1.5px solid ${THEME.primary}`,
              backgroundColor: THEME.primaryLight,
              color: THEME.primary,
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}>
            <Radio size={14} />
            📡 Hikvision API Yo'riqnomasi
          </button>
        </div>
      </div>

      {/* Xabarnoma tosti */}
      {actionNotice && (
        <div style={{
          padding: '13px 20px',
          borderRadius: 16,
          backgroundColor: actionNotice.type === 'success' ? '#DCFCE7' : '#FEF3C7',
          border: `1.5px solid ${actionNotice.type === 'success' ? '#86EFAC' : '#FDE68A'}`,
          color: actionNotice.type === 'success' ? '#14532D' : '#92400E',
          fontWeight: 800,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'fadeIn 0.3s ease',
        }}>
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* 2. REAL-VAQT KPI STATISTIKA KARTALARI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <KpiCard
          title="Bino Ichida (Turniket)"
          value={`${stats.inside_count || 0} nafar`}
          sub="Turniketdan o'tgan o'quvchilar"
          color={THEME.green}
        />
        <KpiCard
          title="Bugungi Kirishlar"
          value={`${stats.today_entries || 0} ta`}
          sub="Yuz tanish / Karta orqali"
          color={THEME.primary}
        />
        <KpiCard
          title="Bugungi Chiqishlar"
          value={`${stats.today_exits || 0} ta`}
          sub="Turniket 2 orqali chiqish"
          color={THEME.orange}
        />
        <KpiCard
          title="Face ID Aniqligi"
          value={`${stats.success_rate || 99.2}%`}
          sub="Biometrik o'xshashlik"
          color="#10B981"
        />
        <KpiCard
          title="Noma'lum / Begonalar"
          value={`${stats.unrecognized_today || 0} ta`}
          sub={stats.unrecognized_today > 0 ? "⚠️ Xavfsizlik signali" : "Xavfsizlik nazorati me'yorda"}
          color={stats.unrecognized_today > 0 ? "#EF4444" : THEME.textMuted}
        />
      </div>

      {/* 3. TEZKOR TEST VA MONITORING HARAKATLARI PANELI */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: '16px 22px',
        border: `1px solid ${THEME.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: THEME.textDark }}>⚡ Tezkor Test Sinovlari:</span>
          <span style={{ fontSize: 11.5, color: THEME.textMuted }}>(Hikvision qurilmasidan keladigan signallarni sinab ko'rish)</span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleQuickTest('IN')}
            disabled={simulating}
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              border: '1px solid #86EFAC',
              backgroundColor: '#F0FDF4',
              color: '#166534',
              fontSize: 12,
              fontWeight: 800,
              cursor: simulating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
            🟢 + Face ID KIRISH (Tasodifiy)
          </button>

          <button
            onClick={() => handleQuickTest('OUT')}
            disabled={simulating}
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              border: '1px solid #FED7AA',
              backgroundColor: '#FFF7ED',
              color: '#9A3412',
              fontSize: 12,
              fontWeight: 800,
              cursor: simulating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
            🟠 - Turniket CHIQISH (Tasodifiy)
          </button>

          <button
            onClick={handleUnknownFaceTest}
            disabled={simulating}
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              border: '1px solid #FECACA',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              fontSize: 12,
              fontWeight: 800,
              cursor: simulating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
            ⚠️ Noma'lum Shaxs (Xavfsizlik)
          </button>
        </div>
      </div>

      {/* 4. ASOSIY AUDIT JADVALI VA FILTRLAR */}
      <div style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, border: `1px solid ${THEME.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: THEME.textDark, margin: 0 }}>
              Face ID va Turniket Maktab Auditi ({schoolName})
            </h3>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 3 }}>
              Hikvision, Dahua va ZKTeco qurilmalaridan kelayotgan real-vaqt biometrik loglari
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleExportAuditCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: THEME.textDark,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}>
              <Download size={14} /> CSV Yuklash
            </button>

            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 12,
                  border: '1px solid #FECACA',
                  backgroundColor: '#FFF1F2',
                  color: '#BE123C',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}>
                <Trash2 size={13} /> Tozalash
              </button>
            )}
          </div>
        </div>

        {/* Filterlar va Qidiruv */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setDirectionFilter('ALL')}
              style={{
                padding: '7px 14px',
                borderRadius: 12,
                border: directionFilter === 'ALL' ? `2px solid ${THEME.primary}` : '1px solid #E2E8F0',
                backgroundColor: directionFilter === 'ALL' ? THEME.primaryLight : '#FFF',
                color: directionFilter === 'ALL' ? THEME.primary : THEME.textDark,
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}>
              Barchasi ({logs.length})
            </button>
            <button
              onClick={() => setDirectionFilter('IN')}
              style={{
                padding: '7px 14px',
                borderRadius: 12,
                border: directionFilter === 'IN' ? `2px solid #22C55E` : '1px solid #E2E8F0',
                backgroundColor: directionFilter === 'IN' ? '#DCFCE7' : '#FFF',
                color: directionFilter === 'IN' ? '#15803D' : THEME.textDark,
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}>
              🟢 Faqat Kirishlar ({stats.today_entries || 0})
            </button>
            <button
              onClick={() => setDirectionFilter('OUT')}
              style={{
                padding: '7px 14px',
                borderRadius: 12,
                border: directionFilter === 'OUT' ? `2px solid ${THEME.orange}` : '1px solid #E2E8F0',
                backgroundColor: directionFilter === 'OUT' ? '#FFF7ED' : '#FFF',
                color: directionFilter === 'OUT' ? THEME.orange : THEME.textDark,
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}>
              🟠 Faqat Chiqishlar ({stats.today_exits || 0})
            </button>
            <button
              onClick={() => setDirectionFilter('UNKNOWN')}
              style={{
                padding: '7px 14px',
                borderRadius: 12,
                border: directionFilter === 'UNKNOWN' ? `2px solid #EF4444` : '1px solid #E2E8F0',
                backgroundColor: directionFilter === 'UNKNOWN' ? '#FEE2E2' : '#FFF',
                color: directionFilter === 'UNKNOWN' ? '#B91C1C' : THEME.textDark,
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}>
              ⚠️ Begona / Noma'lum ({stats.unrecognized_today || 0})
            </button>
          </div>

          <div style={{ position: 'relative', width: 280 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: THEME.textMuted }} />
            <input
              placeholder="F.I.Sh., ID yoki qurilma bo'yicha qidiruv..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Jadval */}
        {filteredLogs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
            {searchQuery || directionFilter !== 'ALL' ? (
              <div>Filtr bo'yicha hech qanday log topilmadi.</div>
            ) : (
              <div>
                Hozircha birorta qurilma logi mavjud emas. Yuqoridagi <b>"Face ID Test Simulyatori"</b> orqali signal yuborib ko'rishingiz mumkin.
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <th style={{ padding: '12px 14px' }}>Vaqt</th>
                  <th style={{ padding: '12px 14px' }}>{terms.studentSingular} (F.I.Sh.)</th>
                  <th style={{ padding: '12px 14px' }}>{terms.groupSingular}</th>
                  <th style={{ padding: '12px 14px' }}>Harakat (Yo'nalish)</th>
                  <th style={{ padding: '12px 14px' }}>Qurilma & IP</th>
                  <th style={{ padding: '12px 14px' }}>Aniqlik</th>
                  <th style={{ padding: '12px 14px' }}>Tizim Holati</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const isFresh = newLogIds.has(log.id);
                  const isEntry = log.direction === 'IN';
                  const isSuccess = log.status === 'SUCCESS';

                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: `1px solid ${THEME.bgSoft}`,
                        backgroundColor: isFresh ? '#F0FDF4' : 'transparent',
                        transition: 'background-color 0.8s ease',
                      }}>
                      {/* Vaqt */}
                      <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 800, color: THEME.textDark, fontSize: 13 }}>
                          {log.time || '--:--:--'}
                        </div>
                        <div style={{ fontSize: 10.5, color: THEME.textMuted }}>
                          {log.date || ''}
                        </div>
                      </td>

                      {/* O'quvchi */}
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ fontWeight: 800, color: isSuccess ? THEME.textDark : '#B91C1C', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {log.student_name}
                          {isFresh && (
                            <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 6, backgroundColor: '#22C55E', color: '#FFF', fontWeight: 900 }}>
                              YANGI
                            </span>
                          )}
                        </div>
                        {log.student_code && (
                          <div style={{ fontSize: 11, color: THEME.primary, fontWeight: 700 }}>
                            ID: {log.student_code}
                          </div>
                        )}
                      </td>

                      {/* Sinf */}
                      <td style={{ padding: '13px 14px' }}>
                        {log.class_name && log.class_name !== "Begona" && log.class_name !== "Noma'lum" ? (
                          terms.formatGroupBadge(log.class_name)
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: 8, backgroundColor: '#F1F5F9', color: '#64748B', fontSize: 11, fontWeight: 700 }}>
                            {log.class_name || "—"}
                          </span>
                        )}
                      </td>

                      {/* Harakat / Yo'nalish */}
                      <td style={{ padding: '13px 14px' }}>
                        <span style={{
                          padding: '5px 12px',
                          borderRadius: 10,
                          backgroundColor: isEntry ? '#DCFCE7' : '#FFEDD5',
                          color: isEntry ? '#15803D' : '#C2410C',
                          fontWeight: 800,
                          fontSize: 11.5,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}>
                          {isEntry ? '🟢 KIRISH' : '🟠 CHIQISH'}
                        </span>
                      </td>

                      {/* Qurilma */}
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: THEME.textDark }}>
                          {log.device_name || 'Hikvision Terminal'}
                        </div>
                        <div style={{ fontSize: 11, color: THEME.textMuted }}>
                          IP: {log.device_ip || '192.168.1.120'}
                        </div>
                      </td>

                      {/* Aniqlik va Harorat */}
                      <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{
                          fontWeight: 800,
                          color: (log.confidence || 0) >= 90 ? THEME.green : '#D97706',
                          fontSize: 12.5,
                        }}>
                          🎯 {log.confidence ? `${log.confidence}%` : '99.0%'}
                        </div>
                        {log.temperature && (
                          <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700 }}>
                            🌡️ {log.temperature}°C
                          </div>
                        )}
                      </td>

                      {/* Holat */}
                      <td style={{ padding: '13px 14px' }}>
                        {isSuccess ? (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 8,
                            backgroundColor: '#ECFDF5',
                            color: THEME.green,
                            fontWeight: 800,
                            fontSize: 11,
                          }}>
                            ✅ Qabul qilindi
                          </span>
                        ) : (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 8,
                            backgroundColor: '#FEE2E2',
                            color: '#B91C1C',
                            fontWeight: 800,
                            fontSize: 11,
                          }}>
                            ⚠️ Noma'lum Shaxs
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. FACE ID TEST SIMULYATORI MODALI */}
      {showSimulateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 130,
          padding: 20,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: 30,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>
                  ⚡ Face ID Test Simulyatori
                </div>
                <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                  Hikvision MinMoe terminalidan keladigan biometrik signalni sinab ko'rish
                </div>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: 10,
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendSimulateEvent();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* O'quvchini tanlash */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                  👨‍🎓 {terms.studentSingular}ni tanlang *
                </label>
                <select
                  value={simForm.studentId}
                  onChange={e => setSimForm({ ...simForm, studentId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 14,
                    border: '1.5px solid #CBD5E1',
                    marginTop: 6,
                    fontSize: 13,
                    backgroundColor: '#FFF',
                  }}>
                  <option value="">— Tasodifiy birinchi o'quvchi —</option>
                  {realStudents.map(st => (
                    <option key={st.id} value={st.student_id || st.id}>
                      {st.last_name} {st.first_name} ({st.class_name || 'Sinfsiz'}) — ID: {st.student_id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Harakat yo'nalishi (KIRISH vs CHIQISH) */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                  🚪 Turniket Harakati (Yo'nalish) *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setSimForm({ ...simForm, direction: 'IN' })}
                    style={{
                      padding: '11px',
                      borderRadius: 12,
                      border: simForm.direction === 'IN' ? '2px solid #22C55E' : '1.5px solid #CBD5E1',
                      backgroundColor: simForm.direction === 'IN' ? '#DCFCE7' : '#FFF',
                      color: simForm.direction === 'IN' ? '#15803D' : THEME.textDark,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}>
                    🟢 KIRISH (Turniket)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimForm({ ...simForm, direction: 'OUT' })}
                    style={{
                      padding: '11px',
                      borderRadius: 12,
                      border: simForm.direction === 'OUT' ? '2px solid #F97316' : '1.5px solid #CBD5E1',
                      backgroundColor: simForm.direction === 'OUT' ? '#FFEDD5' : '#FFF',
                      color: simForm.direction === 'OUT' ? '#C2410C' : THEME.textDark,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}>
                    🟠 CHIQISH (Turniket)
                  </button>
                </div>
              </div>

              {/* Qurilma tanlash */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                  📷 Terminal / Qurilma Modeli *
                </label>
                <select
                  value={simForm.deviceName}
                  onChange={e => setSimForm({ ...simForm, deviceName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 14,
                    border: '1.5px solid #CBD5E1',
                    marginTop: 6,
                    fontSize: 13,
                    backgroundColor: '#FFF',
                  }}>
                  <option value="Hikvision MinMoe DS-K1T673 - Bosh Kirish">Hikvision MinMoe DS-K1T673 - Bosh Kirish (Asosiy Bino)</option>
                  <option value="Hikvision MinMoe DS-K1T673 - Chiqish Turniket 2">Hikvision MinMoe DS-K1T673 - Chiqish Turniket 2</option>
                  <option value="Hikvision DS-K5671 - Korpus B Turniket">Hikvision DS-K5671 - Korpus B Turniket</option>
                  <option value="Dahua ASI7213X-T1 Face Terminal">Dahua ASI7213X-T1 Face Terminal</option>
                  <option value="ZKTeco SpeedFace-V5L Turniket">ZKTeco SpeedFace-V5L Turniket</option>
                </select>
              </div>

              {/* Biometrik parametrlar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Face Match (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={simForm.confidence}
                    onChange={e => setSimForm({ ...simForm, confidence: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #CBD5E1', marginTop: 5, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Harorat (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="42"
                    value={simForm.temperature}
                    onChange={e => setSimForm({ ...simForm, temperature: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #CBD5E1', marginTop: 5, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  style={{
                    flex: 1,
                    padding: 13,
                    borderRadius: 14,
                    border: 'none',
                    backgroundColor: '#F1F5F9',
                    color: THEME.textDark,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}>
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  style={{
                    flex: 1.6,
                    padding: 13,
                    borderRadius: 14,
                    border: 'none',
                    background: THEME.gradient,
                    color: '#FFF',
                    fontWeight: 800,
                    cursor: simulating ? 'wait' : 'pointer',
                    boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)',
                  }}>
                  {simulating ? "Yuborilmoqda..." : "🚀 Face ID Signalini Yuborish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.B HIKVISION MINMOE TERMINALIGA O'QUVCHILARNI YUKLASH (ISAPI SINXRONIZATSIYA) MODALI */}
      {showSyncModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 130,
          padding: 20,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: 32,
            width: '100%',
            maxWidth: 680,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Upload size={20} color="#6366F1" />
                  Idrok Vision • Hikvision MinMoe Sinxronizatsiya Markazi
                </div>
                <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 3 }}>
                  Markaziy bazadagi o'quvchilar ID si, F.I.SH va Yuz rasmlarini terminalga avtomatik yuklash
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: 10,
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Rejim tanlash (Test / Real) */}
              <div style={{ display: 'flex', gap: 8, padding: 4, backgroundColor: '#F1F5F9', borderRadius: 14 }}>
                <button
                  type="button"
                  onClick={() => setSyncSimulate(true)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: syncSimulate ? '#FFFFFF' : 'transparent',
                    color: syncSimulate ? '#4F46E5' : THEME.textMuted,
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: syncSimulate ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  🧪 Test / Simulyatsiya Rejimi (Tavsiya etiladi)
                </button>
                <button
                  type="button"
                  onClick={() => setSyncSimulate(false)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: !syncSimulate ? '#FFFFFF' : 'transparent',
                    color: !syncSimulate ? '#15803D' : THEME.textMuted,
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: !syncSimulate ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  🌐 Haqiqiy Hikvision Qurilmasi (Lokal IP)
                </button>
              </div>

              {/* Terminal ulanish parametrlari */}
              <div style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 18, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark }}>
                  ⚙️ Hikvision Terminali Sozlamalari:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: THEME.textDark }}>Terminal IP Manzili *</label>
                    <input
                      value={syncHost}
                      onChange={e => setSyncHost(e.target.value)}
                      placeholder="Masalan: 192.168.1.120"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #CBD5E1', marginTop: 4, boxSizing: 'border-box', fontSize: 12.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: THEME.textDark }}>Port</label>
                    <input
                      type="number"
                      value={syncPort}
                      onChange={e => setSyncPort(e.target.value)}
                      placeholder="80"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #CBD5E1', marginTop: 4, boxSizing: 'border-box', fontSize: 12.5 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: THEME.textDark }}>Admin Login</label>
                    <input
                      value={syncUsername}
                      onChange={e => setSyncUsername(e.target.value)}
                      placeholder="admin"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #CBD5E1', marginTop: 4, boxSizing: 'border-box', fontSize: 12.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: THEME.textDark }}>Admin Parol (Digest Auth)</label>
                    <input
                      type="password"
                      value={syncPassword}
                      onChange={e => setSyncPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #CBD5E1', marginTop: 4, boxSizing: 'border-box', fontSize: 12.5 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={handleTestDeviceConnection}
                    disabled={syncTestingConnection}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: THEME.textDark,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: syncTestingConnection ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                    <RefreshCw size={13} className={syncTestingConnection ? "animate-spin" : ""} />
                    {syncTestingConnection ? "Tekshirilmoqda..." : "📡 Aloqani Tekshirish (ISAPI Ping)"}
                  </button>
                </div>

                {/* Aloqa natijasi */}
                {syncConnResult && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    backgroundColor: syncConnResult.connected ? '#DCFCE7' : '#FEE2E2',
                    border: `1px solid ${syncConnResult.connected ? '#86EFAC' : '#FCA5A5'}`,
                    color: syncConnResult.connected ? '#15803D' : '#991B1B',
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    <div>{syncConnResult.message}</div>
                    {syncConnResult.device_info && (
                      <div style={{ fontSize: 11, marginTop: 4, opacity: 0.9 }}>
                        Model: <b>{syncConnResult.device_info.model}</b> | Proshivka: {syncConnResult.device_info.firmware_version}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Yuklash obyekti (Kimlarni yuklash kerak) */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                  Yuklash ko'lami:
                </label>
                <select
                  value={syncSelectedStudent}
                  onChange={e => setSyncSelectedStudent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #CBD5E1',
                    marginTop: 6,
                    fontSize: 13,
                    backgroundColor: '#FFF',
                  }}>
                  <option value="">— Barcha o'quvchilarni yuklash ({realStudents.length} nafar) —</option>
                  {realStudents.map(st => (
                    <option key={st.id} value={st.student_id || st.id}>
                      Faqat: {st.last_name} {st.first_name} ({st.class_name || 'Sinfsiz'}) — ID: {st.student_id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Yuklash tugmasi */}
              <button
                type="button"
                onClick={handleExecuteHikvisionSync}
                disabled={syncing}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 13.5,
                  cursor: syncing ? 'wait' : 'pointer',
                  boxShadow: '0 8px 18px rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}>
                <Upload size={16} />
                {syncing ? "Hikvision ISAPI orqali yuklanmoqda..." : "🚀 O'quvchilar va Yuzlarni Terminalga Yuklash (ISAPI Sync)"}
              </button>

              {/* Sinxronizatsiya natijalari ro'yxati */}
              {syncResults && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    fontWeight: 800,
                    fontSize: 12.5,
                  }}>
                    {syncResults.message}
                  </div>

                  <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 14 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                      <thead style={{ backgroundColor: '#F8FAFC', color: THEME.textMuted }}>
                        <tr>
                          <th style={{ padding: '8px 12px' }}>O'quvchi</th>
                          <th style={{ padding: '8px 12px' }}>ID Kod</th>
                          <th style={{ padding: '8px 12px' }}>UserInfo (Profil)</th>
                          <th style={{ padding: '8px 12px' }}>FaceDataRecord (Yuz)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(syncResults.results || []).map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 800 }}>{item.name}</td>
                            <td style={{ padding: '8px 12px', color: THEME.primary, fontWeight: 700 }}>{item.student_id}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{ color: '#15803D', fontWeight: 700 }}>✅ Yuklandi</span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {item.face_sync?.success ? (
                                <span style={{ color: '#15803D', fontWeight: 700 }}>✅ Model hisoblandi</span>
                              ) : (
                                <span style={{ color: '#D97706', fontWeight: 700 }}>⚠️ {item.face_sync?.message || 'Rasm yo\'q'}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. HIKVISION & TURNIKET API INTEGRATSIYA YO'RIQNOMASI MODALI */}
      {showApiDocsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 130,
          padding: 20,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: 32,
            width: '100%',
            maxWidth: 680,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Radio size={20} color={THEME.primary} />
                  Hikvision & Face ID Qurilmalari API Integratsiyasi
                </div>
                <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                  Turniket va biometrik kameralarni ushbu maktab bazasiga ulash protokoli
                </div>
              </div>
              <button
                onClick={() => setShowApiDocsModal(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: 10,
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Endpoint kartasi */}
              <div style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, textTransform: 'uppercase' }}>API Qabul Qiluvchi URL (POST)</div>
                <div style={{
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: THEME.primary,
                  marginTop: 4,
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}>
                  {apiEndpointUrl}
                </div>
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                  Qo'shimcha alias manzillar: <code>/api/devices/hikvision/</code> va <code>/api/devices/turnstile/</code>
                </div>
              </div>

              {/* Qo'llab-quvvatlanadigan qurilmalar */}
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark, marginBottom: 6 }}>
                  Qo'llab-quvvatlanadigan uskunalar:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: 12 }}>
                  <div style={{ padding: '8px 12px', borderRadius: 10, backgroundColor: '#F1F5F9' }}>
                    📹 <b>Hikvision MinMoe:</b> DS-K1T671, DS-K1T673, DS-K1T341
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: 10, backgroundColor: '#F1F5F9' }}>
                    📹 <b>Dahua Technology:</b> ASI7213X, ASI7223X series
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: 10, backgroundColor: '#F1F5F9' }}>
                    🚪 <b>ZKTeco:</b> ProFace X, SpeedFace-V5L, FaceDepot
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: 10, backgroundColor: '#F1F5F9' }}>
                    🌐 Har qanday <b>HTTP / Webhook</b> turniket boshqaruvchisi
                  </div>
                </div>
              </div>

              {/* JSON Payload formati */}
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark, marginBottom: 6 }}>
                  Standart JSON formati:
                </div>
                <pre style={{
                  backgroundColor: '#0F172A',
                  color: '#38BDF8',
                  padding: 14,
                  borderRadius: 14,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                }}>
{`{
  "student_id": "23089",               // O'quvchi 5 xonali ID si yoki pasport/RFID karta raqami
  "direction": "IN",                   // "IN" (KIRISH) yoki "OUT" (CHIQISH)
  "device_name": "Hikvision MinMoe DS-K1T673",
  "device_ip": "192.168.1.120",        // Qurilma IP manzili
  "confidence": 99.4,                  // Yuz tanish foizi (ixtiyoriy)
  "temperature": 36.5,                 // Harorat (ixtiyoriy)
  "school_id": "${schoolId}"                     // Maktab ID raqami
}`}
                </pre>
              </div>

              {/* Tayyor cURL buyrug'i */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark }}>
                    Terminaldan to'g'ridan-to'g'ri sinash (cURL):
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(curlExample);
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 2500);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: THEME.primary,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                    <Copy size={13} /> {copiedCurl ? "Nusxa olindi! ✅" : "cURL nusxasini olish"}
                  </button>
                </div>
                <pre style={{
                  backgroundColor: '#0F172A',
                  color: '#A7F3D0',
                  padding: 14,
                  borderRadius: 14,
                  fontSize: 11.5,
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {curlExample}
                </pre>
              </div>

              {/* Integratsiya afzalliklari */}
              <div style={{
                padding: '12px 16px',
                borderRadius: 14,
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                fontSize: 12,
                color: '#1E40AF',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                <div style={{ fontWeight: 800 }}>⚡ Avtomatik Davomat va Bildirishnoma:</div>
                <div>1. Qurilmadan <code>KIRISH</code> kelganda, o'quvchining bugungi dars davomati avtomatik ravishda <b>Keldi (PRESENT)</b> yoki dars vaqtiga qarab <b>Kechikdi (LATE)</b> qilib belgilanadi.</div>
                <div>2. O'quvchi ota-onasining Telegram botiga <i>"Farzandingiz soat 08:05 da maktab turniketidan kirdi"</i> xabari avtomatik yuboriladi.</div>
                <div>3. Ushbu sahifada har 3 soniyada yangi o'tishlar yashil porlash bilan real vaqtda paydo bo'ladi.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 8.B MAKTAB SOZLAMALARI / NASTROYKA BO'LIMI (SCHOOL-WIDE CONFIGURATION)
// =========================================================================
function SchoolSettingsSection({ schoolId, schoolConfig, terms, actorLabel, onSaveConfig }) {
  const [form, setForm] = useState({
    school_name: schoolConfig?.school_name || '',
    institution_type: schoolConfig?.institution_type || 'MAKTAB',
    district: schoolConfig?.district || '',
    address: schoolConfig?.address || '',
    director_name: schoolConfig?.director_name || '',
    phone: schoolConfig?.phone || '',
    academic_year: schoolConfig?.academic_year || '2026-2027',
    group_term: schoolConfig?.group_term || 'SINF',
    lesson_term: schoolConfig?.lesson_term || 'DARS',
    student_term: schoolConfig?.student_term || 'OQUVCHI',
    qr_refresh_seconds: schoolConfig?.qr_refresh_seconds || 15,
    late_threshold_minutes: schoolConfig?.late_threshold_minutes || 10,
    grading_scale: schoolConfig?.grading_scale || '5-BALLIK',
    latitude: schoolConfig?.latitude ?? null,
    longitude: schoolConfig?.longitude ?? null,
    location_address: schoolConfig?.location_address || '',
    radius_meters: schoolConfig?.radius_meters || 150,
    lesson_duration_minutes: schoolConfig?.lesson_duration_minutes || (schoolConfig?.lesson_term === 'PARA' ? 80 : 45),
    break_duration_minutes: schoolConfig?.break_duration_minutes ?? 10,
    first_lesson_start_time: schoolConfig?.first_lesson_start_time || '08:30',
    big_break_after_lesson: schoolConfig?.big_break_after_lesson ?? 0,
    big_break_duration_minutes: schoolConfig?.big_break_duration_minutes ?? 20,
    shift2_start_time: schoolConfig?.shift2_start_time || '13:30',
    shift2_big_break_after_lesson: schoolConfig?.shift2_big_break_after_lesson ?? 0,
    shift2_big_break_duration_minutes: schoolConfig?.shift2_big_break_duration_minutes ?? 20,
    sync_schedules: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState(null);

  useEffect(() => {
    if (schoolConfig) {
      setForm({
        school_name: schoolConfig.school_name || '',
        institution_type: schoolConfig.institution_type || 'MAKTAB',
        district: schoolConfig.district || '',
        address: schoolConfig.address || '',
        director_name: schoolConfig.director_name || '',
        phone: schoolConfig.phone || '',
        academic_year: schoolConfig.academic_year || '2026-2027',
        group_term: schoolConfig.group_term || 'SINF',
        lesson_term: schoolConfig.lesson_term || 'DARS',
        student_term: schoolConfig.student_term || 'OQUVCHI',
        qr_refresh_seconds: schoolConfig.qr_refresh_seconds || 15,
        late_threshold_minutes: schoolConfig.late_threshold_minutes || 10,
        grading_scale: schoolConfig.grading_scale || '5-BALLIK',
        latitude: schoolConfig.latitude ?? null,
        longitude: schoolConfig.longitude ?? null,
        location_address: schoolConfig.location_address || schoolConfig.address || '',
        radius_meters: schoolConfig.radius_meters || 150,
        lesson_duration_minutes: schoolConfig.lesson_duration_minutes || (schoolConfig.lesson_term === 'PARA' ? 80 : 45),
        break_duration_minutes: schoolConfig.break_duration_minutes ?? 10,
        first_lesson_start_time: schoolConfig.first_lesson_start_time || '08:30',
        big_break_after_lesson: schoolConfig.big_break_after_lesson ?? 0,
        big_break_duration_minutes: schoolConfig.big_break_duration_minutes ?? 20,
        shift2_start_time: schoolConfig.shift2_start_time || '13:30',
        shift2_big_break_after_lesson: schoolConfig.shift2_big_break_after_lesson ?? 0,
        shift2_big_break_duration_minutes: schoolConfig.shift2_big_break_duration_minutes ?? 20,
        sync_schedules: true,
      });
    }
  }, [schoolConfig]);

  const liveTerms = buildSchoolTerms(form);

  const applyPreset = (presetType) => {
    if (presetType === 'SINF_MODE') {
      setForm(prev => ({
        ...prev,
        institution_type: 'MAKTAB',
        group_term: 'SINF',
        lesson_term: 'DARS',
        student_term: 'OQUVCHI',
        lesson_duration_minutes: 45,
      }));
    } else if (presetType === 'GURUH_MODE') {
      setForm(prev => ({
        ...prev,
        institution_type: 'LITSEY_KOLLEJ',
        group_term: 'GURUH',
        lesson_term: 'PARA',
        student_term: 'OQUVCHI',
        lesson_duration_minutes: 80,
      }));
    } else if (presetType === 'TALABA_MODE') {
      setForm(prev => ({
        ...prev,
        institution_type: 'TEXNIKUM_OTM',
        group_term: 'GURUH',
        lesson_term: 'PARA',
        student_term: 'TALABA',
        lesson_duration_minutes: 80,
      }));
    }
  };

  const isLocationSaved = Boolean(
    form.latitude && 
    schoolConfig?.latitude && 
    Math.abs(Number(form.latitude) - Number(schoolConfig.latitude)) < 0.00001 &&
    Math.abs(Number(form.longitude) - Number(schoolConfig.longitude)) < 0.00001
  );

  const handleConfirmLocation = async () => {
    if (form.latitude == null || form.longitude == null || isNaN(form.latitude) || isNaN(form.longitude)) {
      alert("⚠️ Iltimos, avval xaritani bosib yoki qidiruv orqali maktab binosi nuqtasini belgilang!");
      return;
    }
    setSaving(true);
    setSaveBanner(null);
    const result = await onSaveConfig(form);
    setSaving(false);
    if (result?.ok) {
      setSaveBanner({
        type: 'success',
        text: `✅ Maktab joylashuvi muvaffaqiyatli tasdiqlandi va bazada saqlandi! (${Number(form.latitude).toFixed(5)}, ${Number(form.longitude).toFixed(5)}). Barcha ogohlantirishlar olib tashlandi.`
      });
    } else {
      setSaveBanner({
        type: 'error',
        text: result?.error || "Joylashuvni saqlashda xatolik yuz berdi."
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.school_name.trim()) {
      alert("Iltimos, maktabning to'liq rasmiy nomini kiriting!");
      return;
    }
    if (form.latitude == null || form.longitude == null || isNaN(form.latitude) || isNaN(form.longitude)) {
      alert("⚠️ DIQQAT: Maktab / Kollejning xaritadagi geometkasi (lokatsiyasi) belgilanmagan!\n\nUni to'ldirish majburiy. Iltimos, xaritani bosib yoki qidiruv orqali muassasa joylashuvini belgilang.");
      return;
    }
    setSaving(true);
    setSaveBanner(null);
    const result = await onSaveConfig(form);
    setSaving(false);
    if (result?.ok) {
      setSaveBanner({
        type: 'success',
        text: "✅ Maktab sozlamalari va xaritadagi geometkasi muvaffaqiyatli saqlandi! Web dashbordlar va Mobil ilovalarda barcha parametrlar yangilandi."
      });
    } else {
      setSaveBanner({
        type: 'error',
        text: result?.error || "Sozlamalarni saqlashda xatolik yuz berdi."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 60%, #6C5CE7 100%)',
        borderRadius: 28,
        padding: '28px 32px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: '0 20px 45px rgba(67, 56, 202, 0.22)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.14)', fontSize: 11, fontWeight: 800, marginBottom: 10 }}>
            <Sliders size={13} /> MAKTAB DARAJASIDAGI YAGONA KONFIGURATSIYA MARKAZI (MAKTAB #{schoolId})
          </div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>
            {form.school_name || `Maktab #${schoolId}`} — Tizim Sozlamalari (Nastroyka)
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.82)', maxWidth: 740, lineHeight: 1.55 }}>
            Ushbu bo'limda kiritilgan maktabning to'liq rasmiy nomi va tizim atamalari (<b>Sinf</b> yoki <b>Guruh</b>, <b>Dars</b> yoki <b>Para</b>, <b>O'quvchi</b> yoki <b>Talaba</b>) saqlangan zahoti <b>Maktab Dashbordi</b>, <b>O'qituvchi Web Kabineti</b>, <b>Super Admin</b> hamda <b>Mobil Ilova (O'quvchi va O'qituvchi panellari)</b>da avtomatik o'zgaradi.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 14px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', fontWeight: 800, fontSize: 12 }}>
              📚 {liveTerms.groupSingular} / {liveTerms.groupPlural}
            </span>
            <span style={{ padding: '6px 14px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', fontWeight: 800, fontSize: 12 }}>
              ⏰ {liveTerms.lessonSingular} / {liveTerms.lessonPlural}
            </span>
            <span style={{ padding: '6px 14px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', fontWeight: 800, fontSize: 12 }}>
              🎓 {liveTerms.studentSingular} / {liveTerms.studentPlural}
            </span>
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '13px 24px',
              borderRadius: 16,
              border: 'none',
              background: '#10B981',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 13.5,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.35)'
            }}>
            <CheckCircle2 size={18} />
            {saving ? "Saqlanmoqda..." : "Barcha O'zgarishlarni Saqlash"}
          </button>
        </div>
      </div>

      {saveBanner && (
        <div style={{
          padding: '16px 22px',
          borderRadius: 18,
          backgroundColor: saveBanner.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1.5px solid ${saveBanner.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: saveBanner.type === 'success' ? '#065F46' : '#991B1B',
          fontWeight: 800,
          fontSize: 13.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{saveBanner.text}</span>
          <button type="button" onClick={() => setSaveBanner(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* LEFT COLUMN: 1) Maktab Pasporti & 2) Operatsion Qoidalar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card 1: Maktab Rasmiy Ma'lumotlari */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 26, padding: 28, border: `1px solid ${THEME.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={19} color={THEME.primary} /> 1. Maktabning To'liq Rasmiy Nomi va Pasporti
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: THEME.textMuted }}>
                  Maktab nomi o'zgartirilganda barcha {liveTerms.studentPlural.toLowerCase()}, o'qituvchilar va {liveTerms.groupPlural.toLowerCase()} yozuvlarida ham avtomatik yangilanadi
                </p>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 8, backgroundColor: '#EEF2FF', color: '#4338CA', fontSize: 11, fontWeight: 800 }}>
                ID #{schoolId}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: THEME.textDark }}>
                  Muassasaning To'liq Rasmiy Nomi *
                </label>
                <input
                  required
                  value={form.school_name}
                  onChange={e => setForm({ ...form, school_name: e.target.value })}
                  placeholder="Masalan: 1-sonli Ixtisoslashtirilgan Maktab-Kollej"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 14,
                    border: '1.5px solid #CBD5E1',
                    marginTop: 6,
                    fontSize: 14,
                    fontWeight: 800,
                    color: THEME.textDark,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Muassasa Turi</label>
                  <select
                    value={form.institution_type}
                    onChange={e => setForm({ ...form, institution_type: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, fontWeight: 700, backgroundColor: '#FFF' }}>
                    <option value="MAKTAB">Umumta'lim / Ixtisoslashtirilgan Maktab</option>
                    <option value="LITSEY_KOLLEJ">Akademik Litsey / Kasb-hunar Kolleji</option>
                    <option value="PREZIDENT_IT">Prezident / IT Maktabi</option>
                    <option value="TEXNIKUM_OTM">Texnikum / O'quv Markazi / OTM</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Joriy O'quv Yili *</label>
                  <input
                    required
                    value={form.academic_year}
                    onChange={e => setForm({ ...form, academic_year: e.target.value })}
                    placeholder="2026-2027"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Direktor / Rahbar F.I.Sh.</label>
                  <input
                    value={form.director_name}
                    onChange={e => setForm({ ...form, director_name: e.target.value })}
                    placeholder="Masalan: Rahimov Jamshid"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Aloqa Telefon Raqami</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+998 90 100-11-22"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Hudud / Tuman</label>
                  <input
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    placeholder="Toshkent sh., Yunusobod tumani"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Aniq Manzil</label>
                  <input
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Amir Temur shoh ko'chasi, 45-uy"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid #CBD5E1', marginTop: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Maktab Geometkasi va Xaritadagi GPS Joylashuvi (To'ldirish Majburiy) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 26,
            padding: 28,
            border: `1.5px solid ${isLocationSaved ? '#A7F3D0' : (form.latitude ? '#C7D2FE' : '#FCA5A5')}`,
            boxShadow: isLocationSaved ? '0 10px 30px rgba(16, 185, 129, 0.08)' : '0 10px 30px rgba(239, 68, 68, 0.12)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={20} color={isLocationSaved ? '#10B981' : '#EF4444'} /> 2. Maktab Geometkasi va GPS Joylashuvi (Xarita)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: THEME.textMuted, lineHeight: 1.45 }}>
                  Xaritadan maktab binosi koordinatalarini belgilang va tasdiqlang. Joylashuv tasdiqlangach, dashborddagi barcha ogohlantirishlar yo'qoladi.
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {isLocationSaved ? (
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: 12,
                    backgroundColor: '#ECFDF5',
                    border: '1.5px solid #10B981',
                    color: '#065F46',
                    fontSize: 12,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <CheckCircle2 size={15} color="#10B981" /> ✓ BAZADA TASDIQLANGAN
                  </span>
                ) : form.latitude ? (
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: 12,
                    backgroundColor: '#EFF6FF',
                    border: '1.5px solid #3B82F6',
                    color: '#1E40AF',
                    fontSize: 12,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <Sparkles size={15} color="#3B82F6" /> YANGI NUQTA (TASDIQLASH KERAK)
                  </span>
                ) : (
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: 12,
                    backgroundColor: '#FEF2F2',
                    border: '1.5px solid #EF4444',
                    color: '#991B1B',
                    fontSize: 12,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <AlertTriangle size={15} color="#DC2626" /> TO'LDIRISH MAJBURIY *
                  </span>
                )}
              </div>
            </div>

            <SchoolMapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              radiusMeters={form.radius_meters || 150}
              schoolName={form.school_name}
              address={form.address}
              required={true}
              isConfirmed={isLocationSaved}
              isSaving={saving}
              onConfirmLocation={handleConfirmLocation}
              onChangeLocation={({ latitude, longitude, address: newAddress, radiusMeters }) => {
                setForm(prev => ({
                  ...prev,
                  latitude,
                  longitude,
                  radius_meters: radiusMeters,
                  address: prev.address || newAddress,
                  location_address: newAddress || prev.location_address,
                }));
              }}
            />
          </div>

          {/* Card 3: Davomat, QR va Baholash Parametrlari */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 26, padding: 28, border: `1px solid ${THEME.border}` }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 900, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
              <QrCode size={19} color={THEME.primary} /> 3. Mobil QR Davomat va Baholash Qoidalari
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 12, color: THEME.textMuted }}>
              Mobil ilovada QR-kod yangilanish tezligi va {liveTerms.lessonSingular.toLowerCase()}ga kechikish me'yorlari
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 16, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, display: 'block' }}>
                  QR YANGILANISH VAQTI
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={form.qr_refresh_seconds}
                    onChange={e => setForm({ ...form, qr_refresh_seconds: Number(e.target.value) || 15 })}
                    style={{ width: 70, padding: '8px 10px', borderRadius: 10, border: '1px solid #CBD5E1', fontWeight: 800, fontSize: 14 }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>soniya</span>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 16, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, display: 'block' }}>
                  KECHIKISH ME'YORI
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={form.late_threshold_minutes}
                    onChange={e => setForm({ ...form, late_threshold_minutes: Number(e.target.value) || 10 })}
                    style={{ width: 70, padding: '8px 10px', borderRadius: 10, border: '1px solid #CBD5E1', fontWeight: 800, fontSize: 14 }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>daqiqa</span>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 16, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, display: 'block' }}>
                  BAHOLASH TIZIMI
                </label>
                <select
                  value={form.grading_scale}
                  onChange={e => setForm({ ...form, grading_scale: e.target.value })}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #CBD5E1', marginTop: 8, fontWeight: 800, fontSize: 12.5, backgroundColor: '#FFF' }}>
                  <option value="5-BALLIK">5 ballik tizim (2–5)</option>
                  <option value="100-FOIZLIK">100 ballik reyting</option>
                </select>
              </div>
            </div>

            {schoolConfig?.updated_at && (
              <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 12, backgroundColor: '#F8FAFC', fontSize: 11.5, color: THEME.textMuted, display: 'flex', justifyContent: 'space-between' }}>
                <span>Oxirgi marta tahrirlangan: <b>{schoolConfig.updated_by || actorLabel}</b></span>
                <span>Vaqt: <b>{schoolConfig.updated_at}</b></span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: 4) Tizim Atamalari (Sinf vs Guruh, Dars vs Para, O'quvchi vs Talaba) + Live Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 26, padding: 28, border: `1px solid ${THEME.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={19} color={THEME.primary} /> 4. Tizim Atamalari Konfiguratsiyasi (Sinf yoki Guruh)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: THEME.textMuted }}>
                  Muassasangizda <b>"Sinf"</b> ishlatiladimi yoki <b>"Guruh"</b>? Tanlangan rejim Web va Mobil ilovalarda barcha yozuvlarni o'zgartiradi.
                </p>
              </div>
            </div>

            {/* Tezkor Shablonlar (Presets) */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                ⚡ Tezkor Shablon Tanlash:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => applyPreset('SINF_MODE')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: form.group_term === 'SINF' && form.lesson_term === 'DARS' ? `2px solid ${THEME.primary}` : '1px solid #E2E8F0',
                    backgroundColor: form.group_term === 'SINF' && form.lesson_term === 'DARS' ? THEME.primaryLight : '#F8FAFC',
                    color: THEME.textDark,
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}>
                  🏫 Maktab Rejimi
                  <div style={{ fontSize: 10, color: THEME.textMuted, fontWeight: 600, marginTop: 2 }}>Sinf • Dars • O'quvchi</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('GURUH_MODE')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: form.group_term === 'GURUH' && form.student_term === 'OQUVCHI' ? `2px solid ${THEME.primary}` : '1px solid #E2E8F0',
                    backgroundColor: form.group_term === 'GURUH' && form.student_term === 'OQUVCHI' ? THEME.primaryLight : '#F8FAFC',
                    color: THEME.textDark,
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}>
                  🎓 Litsey / Kollej
                  <div style={{ fontSize: 10, color: THEME.textMuted, fontWeight: 600, marginTop: 2 }}>Guruh • Para • O'quvchi</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('TALABA_MODE')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: form.group_term === 'GURUH' && form.student_term === 'TALABA' ? `2px solid ${THEME.primary}` : '1px solid #E2E8F0',
                    backgroundColor: form.group_term === 'GURUH' && form.student_term === 'TALABA' ? THEME.primaryLight : '#F8FAFC',
                    color: THEME.textDark,
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}>
                  🏛️ Texnikum / Markaz
                  <div style={{ fontSize: 10, color: THEME.textMuted, fontWeight: 600, marginTop: 2 }}>Guruh • Para • Talaba</div>
                </button>
              </div>
            </div>

            {/* 3.1 Bo'linma atamasi: SINF vs GURUH */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: THEME.textDark, display: 'block', marginBottom: 8 }}>
                A) O'quv bo'linmasi atamasi (Sinf yoki Guruh):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  {
                    key: 'SINF',
                    title: 'Sinf / Sinflar',
                    sub: '11-A sinf, Sinf rahbari, Mening sinfim',
                    badge: 'Maktab standarti'
                  },
                  {
                    key: 'GURUH',
                    title: 'Guruh / Guruhlar',
                    sub: '11-A guruh, Guruh rahbari, Mening guruhim',
                    badge: 'Kollej / Litsey / Markaz'
                  }
                ].map(opt => {
                  const active = form.group_term === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => setForm({ ...form, group_term: opt.key })}
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        border: active ? `2px solid ${THEME.primary}` : '1.5px solid #E2E8F0',
                        backgroundColor: active ? '#F5F3FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: 15, color: active ? THEME.primary : THEME.textDark }}>
                          {opt.title}
                        </span>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%',
                          backgroundColor: active ? THEME.primary : '#E2E8F0',
                          color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {active && <Check size={12} />}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 6 }}>{opt.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3.2 Mashg'ulot atamasi: DARS vs PARA */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: THEME.textDark, display: 'block', marginBottom: 8 }}>
                B) O'quv mashg'uloti atamasi (Dars yoki Para):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'DARS', title: 'Dars / Darslar', sub: '1-dars, Dars jadvali, Dars davomati' },
                  { key: 'PARA', title: 'Para / Paralar', sub: '1-para, Paralar jadvali, Para davomati' }
                ].map(opt => {
                  const active = form.lesson_term === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => setForm({ ...form, lesson_term: opt.key })}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        border: active ? `2px solid ${THEME.primary}` : '1.5px solid #E2E8F0',
                        backgroundColor: active ? '#F5F3FF' : '#FFFFFF',
                        cursor: 'pointer'
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: 14, color: active ? THEME.primary : THEME.textDark }}>{opt.title}</span>
                        {active && <CheckCircle2 size={16} color={THEME.primary} />}
                      </div>
                      <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{opt.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3.3 Ta'lim oluvchi atamasi: O'QUVCHI vs TALABA */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: THEME.textDark, display: 'block', marginBottom: 8 }}>
                C) Ta'lim oluvchi atamasi (O'quvchi yoki Talaba):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'OQUVCHI', title: "O'quvchi / O'quvchilar", sub: "Maktab va litsey o'quvchilari uchun" },
                  { key: 'TALABA', title: 'Talaba / Talabalar', sub: 'Kollej, texnikum va kurs talabalari uchun' }
                ].map(opt => {
                  const active = form.student_term === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => setForm({ ...form, student_term: opt.key })}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        border: active ? `2px solid ${THEME.primary}` : '1.5px solid #E2E8F0',
                        backgroundColor: active ? '#F5F3FF' : '#FFFFFF',
                        cursor: 'pointer'
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: 14, color: active ? THEME.primary : THEME.textDark }}>{opt.title}</span>
                        {active && <CheckCircle2 size={16} color={THEME.primary} />}
                      </div>
                      <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{opt.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* D) Dars Davomiyligi (Daqiqalarda) */}
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1.5px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 900, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color={THEME.primary} />
                  D) Standart {liveTerms.lessonSingular} Davomiyligi (Daqiqada) *
                </label>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 800 }}>
                  Joriy me'yor: {form.lesson_duration_minutes} daqiqa
                </span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 11.5, color: THEME.textMuted }}>
                Ushbu parametr maktabdagi barcha darslarning standart davomiyligini belgilaydi va darslar jadvaliga to'g'ridan-to'g'ri ta'sir qiladi.
              </p>

              {/* Tezkor Tugmalar (45m, 60m, 80m, 90m) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { val: 45, label: "45 daqiqa", sub: "Maktab standarti" },
                  { val: 60, label: "60 daqiqa", sub: "Akademik (1 soat)" },
                  { val: 80, label: "80 daqiqa", sub: "Kollej (Para)" },
                  { val: 90, label: "90 daqiqa", sub: "OTM (To'liq para)" },
                ].map(item => {
                  const isCur = Number(form.lesson_duration_minutes) === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setForm({ ...form, lesson_duration_minutes: item.val })}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 14,
                        border: isCur ? `2px solid ${THEME.primary}` : '1.5px solid #E2E8F0',
                        backgroundColor: isCur ? '#F5F3FF' : '#F8FAFC',
                        color: isCur ? THEME.primary : THEME.textDark,
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}>
                      <div>{item.label}</div>
                      <div style={{ fontSize: 9.5, color: THEME.textMuted, marginTop: 2, fontWeight: 600 }}>{item.sub}</div>
                    </button>
                  );
                })}
              </div>

              {/* Qo'lda ixtiyoriy daqiqa kiritish */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: THEME.textDark, whiteSpace: 'nowrap' }}>
                  ✏️ Qo'lda ixtiyoriy daqiqa kiritish:
                </span>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={form.lesson_duration_minutes}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10);
                    setForm({ ...form, lesson_duration_minutes: isNaN(v) ? '' : v });
                  }}
                  placeholder="45"
                  style={{
                    width: 80,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #CBD5E1',
                    fontWeight: 900,
                    fontSize: 14,
                    color: THEME.primary,
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: 12, color: THEME.textMuted }}>daqiqa (masalan: 30, 40, 50, 75 daqiqa)</span>
              </div>
            </div>

            {/* E) Qo'ng'iroqlar Jadvali & Oraliq Tanaffus (1-smena va 2-smena) */}
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1.5px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 900, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔔 E) Qo'ng'iroqlar Jadvali & Smenalar Konfiguratsiyasi (1-smena & 2-smena):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted }}>ODATIY TANAFFUS (IKKALA SMENAGA):</span>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={form.break_duration_minutes}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10);
                      setForm({ ...form, break_duration_minutes: isNaN(v) ? 0 : v });
                    }}
                    style={{
                      width: 50,
                      padding: '4px 8px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontWeight: 800,
                      fontSize: 12.5,
                      backgroundColor: '#FFF',
                      textAlign: 'center'
                    }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textDark }}>daqiqa</span>
                </div>
              </div>

              {/* SMENALAR BO'YICHA SOZLAMALAR (1-SMENA VA 2-SMENA KARTALARI) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                
                {/* 1-SMENA (ERTALABKI) */}
                <div style={{ padding: 16, borderRadius: 18, backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🌅 1-Smena (Ertalabki darslar)
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: 6 }}>
                      Ertalabki sinflar uchun
                    </span>
                  </div>

                  {/* 1-smena dars boshlanish vaqti */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, display: 'block', marginBottom: 5 }}>
                      1-DARS BOSHLANISH VAQTI:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="time"
                        value={form.first_lesson_start_time || '08:30'}
                        onChange={e => setForm({ ...form, first_lesson_start_time: e.target.value })}
                        style={{
                          padding: '7px 10px',
                          borderRadius: 10,
                          border: '1px solid #CBD5E1',
                          fontWeight: 800,
                          fontSize: 13,
                          backgroundColor: '#FFF'
                        }}
                      />
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['08:00', '08:30', '09:00'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm({ ...form, first_lesson_start_time: t })}
                            style={{
                              padding: '4px 6px',
                              borderRadius: 6,
                              border: form.first_lesson_start_time === t ? `1.5px solid ${THEME.primary}` : '1px solid #CBD5E1',
                              backgroundColor: form.first_lesson_start_time === t ? THEME.primaryLight : '#FFF',
                              fontSize: 10,
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 1-smena katta tanaffus */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, display: 'block', marginBottom: 5 }}>
                      KATTA TANAFFUS (1-SMENA):
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        value={form.big_break_after_lesson || 0}
                        onChange={e => setForm({ ...form, big_break_after_lesson: Number(e.target.value) })}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 11.5, fontWeight: 700, backgroundColor: '#FFF' }}>
                        <option value={0}>Yo'q (Standart tanaffus)</option>
                        <option value={2}>2-darsdan keyin</option>
                        <option value={3}>3-darsdan keyin (Tushlik)</option>
                        <option value={4}>4-darsdan keyin</option>
                      </select>
                      {Number(form.big_break_after_lesson) > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            type="number"
                            min={10}
                            max={90}
                            value={form.big_break_duration_minutes}
                            onChange={e => setForm({ ...form, big_break_duration_minutes: Number(e.target.value) || 20 })}
                            style={{ width: 50, padding: '6px 8px', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 800, fontSize: 11.5, textAlign: 'center' }}
                          />
                          <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textDark }}>daq</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1-smena jonli jadval prevyusi */}
                  <div style={{ padding: 10, borderRadius: 12, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#1E40AF', marginBottom: 6 }}>
                      📋 1-Smena dars vaqtlari:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                      {generateLessonSlots(form, 6, 1).map(slot => (
                        <div key={slot.order} style={{ padding: '4px 6px', borderRadius: 8, backgroundColor: '#FFF', border: '1px solid #BFDBFE', fontSize: 10.5, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 800, color: '#1E3A8A' }}>{slot.order}-dars:</span>
                          <span style={{ fontWeight: 900, color: THEME.primary }}>{slot.start}–{slot.end}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2-SMENA (ABEDDAN KEYINGI) */}
                <div style={{ padding: 16, borderRadius: 18, backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🌇 2-Smena (Abeddan keyingi darslar)
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: 6 }}>
                      2-smena sinflari uchun
                    </span>
                  </div>

                  {/* 2-smena dars boshlanish vaqti */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, display: 'block', marginBottom: 5 }}>
                      2-SMENA BOSHLANISH VAQTI:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="time"
                        value={form.shift2_start_time || '13:30'}
                        onChange={e => setForm({ ...form, shift2_start_time: e.target.value })}
                        style={{
                          padding: '7px 10px',
                          borderRadius: 10,
                          border: '1px solid #CBD5E1',
                          fontWeight: 800,
                          fontSize: 13,
                          backgroundColor: '#FFF'
                        }}
                      />
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['13:00', '13:30', '14:00'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm({ ...form, shift2_start_time: t })}
                            style={{
                              padding: '4px 6px',
                              borderRadius: 6,
                              border: form.shift2_start_time === t ? `1.5px solid ${THEME.orange}` : '1px solid #CBD5E1',
                              backgroundColor: form.shift2_start_time === t ? '#FFF7ED' : '#FFF',
                              color: form.shift2_start_time === t ? THEME.orange : THEME.textDark,
                              fontSize: 10,
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2-smena katta tanaffus */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, display: 'block', marginBottom: 5 }}>
                      KATTA TANAFFUS (2-SMENA):
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        value={form.shift2_big_break_after_lesson || 0}
                        onChange={e => setForm({ ...form, shift2_big_break_after_lesson: Number(e.target.value) })}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 11.5, fontWeight: 700, backgroundColor: '#FFF' }}>
                        <option value={0}>Yo'q (Standart tanaffus)</option>
                        <option value={2}>2-darsdan keyin</option>
                        <option value={3}>3-darsdan keyin</option>
                        <option value={4}>4-darsdan keyin</option>
                      </select>
                      {Number(form.shift2_big_break_after_lesson) > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            type="number"
                            min={10}
                            max={90}
                            value={form.shift2_big_break_duration_minutes}
                            onChange={e => setForm({ ...form, shift2_big_break_duration_minutes: Number(e.target.value) || 20 })}
                            style={{ width: 50, padding: '6px 8px', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 800, fontSize: 11.5, textAlign: 'center' }}
                          />
                          <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textDark }}>daq</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2-smena jonli jadval prevyusi */}
                  <div style={{ padding: 10, borderRadius: 12, backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E', marginBottom: 6 }}>
                      📋 2-Smena dars vaqtlari:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                      {generateLessonSlots(form, 6, 2).map(slot => (
                        <div key={slot.order} style={{ padding: '4px 6px', borderRadius: 8, backgroundColor: '#FFF', border: '1px solid #FDE68A', fontSize: 10.5, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 800, color: '#92400E' }}>{slot.order}-dars:</span>
                          <span style={{ fontWeight: 900, color: THEME.orange }}>{slot.start}–{slot.end}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Sinxronlash Chekboksi */}
              <div style={{ marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: '#F0FDF4', border: '1.5px solid #86EFAC', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input
                  type="checkbox"
                  id="sync_schedules_cb"
                  checked={Boolean(form.sync_schedules)}
                  onChange={e => setForm({ ...form, sync_schedules: e.target.checked })}
                  style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: THEME.green }}
                />
                <label htmlFor="sync_schedules_cb" style={{ fontSize: 12, fontWeight: 800, color: '#065F46', cursor: 'pointer', lineHeight: 1.45 }}>
                  🔄 Mavjud barcha sinflarning haftalik dars jadvallari va bugungi darslar vaqtini yangi me'yor bo'yicha avtomatik yangilash (Tavsiya etiladi)
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: '#047857', marginTop: 2 }}>
                    Saqlash tugmasi bosilganda barcha 1-{liveTerms.lessonSingularLower}, 2-{liveTerms.lessonSingularLower}... vaqtlari avtomatik ravishda yangi hisoblangan slotlarga sinxronlashtiriladi.
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW CARD: Web + Mobile App */}
          <div style={{ backgroundColor: '#0F172A', borderRadius: 26, padding: 24, color: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Smartphone size={15} /> JONLI KO'RINISH PREVYU (WEB DASHBORD VA MOBIL ILOVA)
              </div>
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontWeight: 800 }}>
                Real-Time Sync
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 800, marginBottom: 6 }}>📱 MOBIL: {liveTerms.studentSingular.toUpperCase()} PANELI</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#FFF' }}>{form.school_name || `Maktab #${schoolId}`}</div>
                <div style={{ fontSize: 11.5, color: '#CBD5E1', marginTop: 6 }}>
                  • <b>{liveTerms.groupSingular}:</b> {liveTerms.formatGroup('11-A')}
                </div>
                <div style={{ fontSize: 11.5, color: '#CBD5E1', marginTop: 3 }}>
                  • <b>Bugungi {liveTerms.lessonPlural.toLowerCase()}:</b> 1-{liveTerms.lessonSingular.toLowerCase()}, 2-{liveTerms.lessonSingular.toLowerCase()}
                </div>
                <div style={{ fontSize: 11.5, color: '#38BDF8', marginTop: 3 }}>
                  • <b>Dars vaqti:</b> {form.lesson_duration_minutes || 45} daqiqa ({form.first_lesson_start_time || '08:30'} dan)
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 800, marginBottom: 6 }}>📱 MOBIL: O'QITUVCHI PANELI</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#FFF' }}>Mening {liveTerms.groupPlural.toLowerCase()}im</div>
                <div style={{ fontSize: 11.5, color: '#CBD5E1', marginTop: 6 }}>
                  • <b>Jurnal:</b> {liveTerms.formatGroup('11-A')} ({liveTerms.studentPlural})
                </div>
                <div style={{ fontSize: 11.5, color: '#38BDF8', marginTop: 3 }}>
                  • <b>Dars vaqti:</b> {form.lesson_duration_minutes || 45} daqiqa / dars
                </div>
                <div style={{ fontSize: 11.5, color: '#CBD5E1', marginTop: 3 }}>
                  • <b>Mas'ul:</b> {liveTerms.groupLeader}
                </div>
              </div>
            </div>

            {/* Geometka Jonli Holati */}
            <div style={{
              marginTop: 14,
              padding: '12px 16px',
              borderRadius: 14,
              backgroundColor: form.latitude ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.22)',
              border: `1.5px solid ${form.latitude ? '#10B981' : '#EF4444'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={15} color={form.latitude ? '#34D399' : '#F87171'} />
                <span style={{ fontSize: 12, fontWeight: 800, color: form.latitude ? '#34D399' : '#FCA5A5' }}>
                  {form.latitude
                    ? `Geometka: ${Number(form.latitude).toFixed(5)}, ${Number(form.longitude).toFixed(5)}`
                    : "⚠️ Geometka belgilanmagan!"}
                </span>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: 6,
                backgroundColor: form.latitude ? '#10B981' : '#EF4444',
                color: '#FFFFFF'
              }}>
                {form.latitude ? `FAOL (${form.radius_meters || 150}m)` : "TO'LDIRISH MAJBURIY"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

// =========================================================================
// 9. O'QITUVCHI DASHBORDI (TEACHER VIEW)
// =========================================================================
function TeacherDashboardView({ currentUser, handleLogout }) {
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [schoolConfig, setSchoolConfig] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const schoolId = String(currentUser?.schoolId || '1');

  useEffect(() => {
    fetch(`/api/school-config/?school_id=${encodeURIComponent(schoolId)}`)
      .then(r => r.json())
      .then(cfg => {
        if (cfg && cfg.school_id) setSchoolConfig(cfg);
      })
      .catch(() => {});
    fetch(`/api/students/?school_id=${encodeURIComponent(schoolId)}`)
      .then(r => r.json())
      .then(d => setStudents(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch(`/api/classes/?school_id=${encodeURIComponent(schoolId)}`)
      .then(r => r.json())
      .then(c => {
        if (Array.isArray(c) && c.length > 0) {
          const sorted = [...c].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true }));
          setClassesList(sorted);
          setSelectedGroup(sorted[0].name);
        }
      })
      .catch(() => {});
  }, [schoolId]);

  const terms = buildSchoolTerms(schoolConfig);
  const displaySchoolName = schoolConfig?.school_name || currentUser?.schoolName || `Maktab #${schoolId}`;
  const groupStudents = students.filter(s => s.class_name === selectedGroup);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: THEME.bgSoft, overflow: 'hidden' }}>
      {/* Teacher Sidebar */}
      <aside style={{ width: 280, backgroundColor: '#FFFFFF', borderRight: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', padding: '24px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30, paddingLeft: 6 }}>
          <img 
            src="/idrok_icon.png" 
            alt="Idrok Edu" 
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 14, 
              objectFit: 'contain', 
              boxShadow: '0 8px 18px rgba(108, 92, 231, 0.25)', 
              flexShrink: 0 
            }} 
          />
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: THEME.textDark }}>Idrok Edu • Ustoz</div>
            <div style={{ fontSize: 11, color: THEME.textMuted }}>{displaySchoolName}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, textTransform: 'uppercase', padding: '0 10px 8px' }}>
          Maktab {terms.groupPlural} Ro'yxati
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
          {classesList.map(cls => {
            const count = students.filter(s => s.class_name === cls.name).length;
            return (
              <NavButton
                key={cls.id}
                active={selectedGroup === cls.name}
                onClick={() => setSelectedGroup(cls.name)}
                icon={<FolderOpen size={18} />}
                label={terms.formatGroup(cls.name)}
                badge={`${count} ta`}
              />
            );
          })}
        </div>

        {/* Info box about mobile scanner */}
        <div style={{ padding: 16, backgroundColor: THEME.primaryLight, borderRadius: 20, marginBottom: 16, fontSize: 12 }}>
          <div style={{ fontWeight: 800, color: THEME.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Smartphone size={16} /> Mobil Davomat
          </div>
          <div style={{ color: THEME.textDark, marginTop: 4, lineHeight: 1.4 }}>
            Jonli {terms.lessonSingular.toLowerCase()} davomatini olish uchun smartfoningizdagi <b>Idrok Mobile</b> ilovasi orqali QR skanerdan foydalaning.
          </div>
        </div>

        <div style={{ paddingTop: 16, borderTop: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: THEME.textMuted }}>{currentUser.subject}</div>
            <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 8, backgroundColor: THEME.primaryLight, color: THEME.primary, fontSize: 11, fontWeight: 800 }}>
              <Key size={11} /> 5 xonali ID: <span style={{ fontFamily: 'monospace' }}>{currentUser.teacherId || currentUser.username}</span>
            </div>
          </div>
          <button onClick={handleLogout} title="Chiqish" style={{ background: '#F8F9FE', border: 'none', color: '#EF4444', padding: 8, borderRadius: 10, cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Teacher Main */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: THEME.textDark, margin: 0 }}>
              {terms.formatGroup(selectedGroup || terms.groupSingular)} — {terms.studentPlural} va Jurnali
            </h1>
            <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
              {displaySchoolName} • {terms.studentPlural} ro'yxati va {terms.lessonSingular.toLowerCase()} davomati
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: 26, borderRadius: 26, border: `1px solid ${THEME.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted }}>
                <th style={{ padding: '12px 14px' }}>Foto</th>
                <th style={{ padding: '12px 14px' }}>{terms.studentSingular} F.I.Sh.</th>
                <th style={{ padding: '12px 14px' }}>Kirish ID</th>
                <th style={{ padding: '12px 14px' }}>Yaratilganlik Tarixi</th>
                <th style={{ padding: '12px 14px' }}>Bugungi {terms.lessonSingular} Qatnashuvi</th>
                <th style={{ padding: '12px 14px' }}>O'zlashtirish Bahosi</th>
              </tr>
            </thead>
            <tbody>
              {groupStudents.map(st => (
                <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div
                      onClick={() => {
                        if (st.photo_3x4) {
                          setPreviewImage({
                            url: normalizeMediaUrl(st.photo_3x4),
                            title: `${st.last_name} ${st.first_name}`,
                            subtitle: `${terms.studentSingular} • ${terms.formatGroupBadge(st.class_name)}`,
                            badge: terms.studentSingular,
                            idNumber: st.student_id,
                            schoolName: displaySchoolName,
                          });
                        }
                      }}
                      title={st.photo_3x4 ? "Rasmni kattalashtirib ko'rish (bosing)" : ""}
                      style={{
                        width: 38,
                        height: 48,
                        borderRadius: 8,
                        overflow: 'hidden',
                        cursor: st.photo_3x4 ? 'zoom-in' : 'default',
                        position: 'relative',
                        border: `1px solid ${THEME.border}`,
                        backgroundColor: THEME.primaryLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.18s ease',
                      }}
                      onMouseEnter={(e) => { if (st.photo_3x4) e.currentTarget.style.transform = 'scale(1.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                      {st.photo_3x4 ? (
                        <>
                          <img src={normalizeMediaUrl(st.photo_3x4)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#FFF', borderRadius: 3, padding: 1, display: 'flex' }}>
                            <ZoomIn size={9} />
                          </div>
                        </>
                      ) : (
                        <div style={{ color: THEME.primary, fontSize: 10, fontWeight: 800 }}>Foto</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 800 }}>{st.last_name} {st.first_name}</td>
                  <td style={{ padding: '14px' }}><code>{st.student_id}</code></td>
                  <td style={{ padding: '14px', fontSize: 12, color: THEME.textMuted }}>{st.created_by} ({st.date_joined})</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: 8, backgroundColor: '#ECFDF5', color: THEME.green, fontWeight: 700, fontSize: 11 }}>
                      Qatnashdi (08:32) ✅
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 900, color: THEME.primary }}>
                    5 (A'lo) ⭐
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Kattalashtirilgan Rasm Modali */}
      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}

// =========================================================================
// YORDAMCHI KOMPONENTLAR (UI BUTTONS, MODALS, CARDS)
// =========================================================================
function NavButton({ active, onClick, icon, label, badge, badgeColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: 16,
        border: 'none',
        background: active ? THEME.primaryLight : 'transparent',
        color: active ? THEME.primary : THEME.textDark,
        fontWeight: active ? 800 : 600,
        fontSize: 13.5,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span style={{ 
          padding: '2px 8px', 
          borderRadius: 8, 
          backgroundColor: badgeColor || (active ? THEME.primary : '#F1F5F9'), 
          color: badgeColor ? '#FFFFFF' : (active ? '#FFFFFF' : THEME.textMuted), 
          fontSize: 11, 
          fontWeight: 800,
          boxShadow: badgeColor ? '0 2px 8px rgba(239, 68, 68, 0.35)' : 'none'
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function KpiCard({ title, value, sub, color }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 22, border: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: color }}>{value}</div>
      <div style={{ fontSize: 11, color: THEME.textMuted }}>{sub}</div>
    </div>
  );
}

function AddStudentModal({ newStudent, setNewStudent, classesList, terms = buildSchoolTerms(), onClose, onSubmit }) {
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewStudent({
        ...newStudent,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      });
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>Yangi {terms.studentSingular} Qo'shish</div>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>Ushbu maktab bazasiga yangi {terms.studentSingular.toLowerCase()} biriktirish</div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Familiyasi *</label>
            <input 
              required
              placeholder="Masalan: Karimova"
              value={newStudent.lastName}
              onChange={e => setNewStudent({ ...newStudent, lastName: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Ismi *</label>
            <input 
              required
              placeholder="Masalan: Madina"
              value={newStudent.firstName}
              onChange={e => setNewStudent({ ...newStudent, firstName: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>{terms.groupSingular} *</label>
            <select
              value={newStudent.classId}
              onChange={e => setNewStudent({ ...newStudent, classId: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13, backgroundColor: '#FFF' }}>
              <option value="">{terms.groupSingular} biriktirilmagan</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{terms.formatGroup(c.name)}</option>
              ))}
            </select>
          </div>

          <div style={{ backgroundColor: THEME.primaryLight, padding: 12, borderRadius: 14, fontSize: 12, color: THEME.primary }}>
            <b>🔢 Kirish ID va Tarix:</b> Tizim 5 xonali unikal ID yaratadi va yaratuvchi shaxs hamda maktabni tarixga muhrlaydi.
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Parol</label>
            <input 
              placeholder="Bo'sh qolsa, avto yaratiladi"
              value={newStudent.password}
              onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>3x4 Foto (Face ID uchun zarur)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
              <div style={{ width: 56, height: 72, borderRadius: 10, border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {newStudent.photoPreview ? (
                  <img src={newStudent.photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 10, color: THEME.textMuted }}>3x4</span>
                )}
              </div>
              <input type="file" accept="image/*" id="modal-photo" onChange={handlePhoto} style={{ display: 'none' }} />
              <label htmlFor="modal-photo" style={{ padding: '8px 14px', backgroundColor: '#F1F5F9', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Surat tanlash 📷
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: 14, background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 10 }}>
            Saqlash va {terms.studentSingular}ni Yaratish
          </button>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 10. O'QUVCHI TAHRIRLASH MODALI (EDIT CRUD COMPONENT)
// =========================================================================
function EditStudentModal({ student, classesList, terms = buildSchoolTerms(), onClose, onSave }) {
  const [firstName, setFirstName] = useState(student.first_name || '');
  const [lastName, setLastName] = useState(student.last_name || '');
  const [classId, setClassId] = useState(student.class_id || (classesList.find(c => c.name === student.class_name)?.id || ''));
  const [password, setPassword] = useState(student.initial_password || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(student.photo_3x4 || null);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert("Iltimos, ism va familiyani kiriting!");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('first_name', firstName.trim());
    fd.append('last_name', lastName.trim());
    if (classId) fd.append('class_id', classId);
    if (password) fd.append('password', password.trim());
    if (photoFile) fd.append('photo_3x4', photoFile);

    try {
      await onSave(student.id, fd);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>{terms.studentSingular} Ma'lumotlarini Tahrirlash</div>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>ID: <b>{student.student_id}</b> {terms.studentSingular.toLowerCase()} ma'lumotlarini o'zgartirish</div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Familiyasi *</label>
            <input 
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Ismi *</label>
            <input 
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>{terms.groupSingular} *</label>
            <select
              value={classId}
              onChange={e => setClassId(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13, backgroundColor: '#FFF' }}>
              <option value="">{terms.groupSingular}siz</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{terms.formatGroup(c.name)}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Mobil Ilova Paroli</label>
            <input 
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>3x4 Foto (Face ID va Profil uchun)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
              <div style={{ width: 56, height: 72, borderRadius: 10, border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                {photoPreview ? (
                  <img src={normalizeMediaUrl(photoPreview)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 10, color: THEME.textMuted }}>3x4</span>
                )}
              </div>
              <div>
                <input type="file" accept="image/*" id="edit-modal-photo" onChange={handlePhotoChange} style={{ display: 'none' }} />
                <label htmlFor="edit-modal-photo" style={{ padding: '8px 14px', backgroundColor: '#F1F5F9', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-block' }}>
                  Yangi Surat Tanlash 📷
                </label>
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                  {photoFile ? photoFile.name : "Eski rasm saqlanadi"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ flex: 1, padding: 13, background: '#F1F5F9', color: THEME.textDark, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              Bekor qilish
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ flex: 1.5, padding: 13, background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 11. YANGI GURUH / SINF YARATISH MODALI
// =========================================================================
function AddGroupModal({ newGroup, setNewGroup, teachersList = [], terms = buildSchoolTerms(), onClose, onSubmit, onOpenAddTeacher }) {
  const [manualMode, setManualMode] = useState(false);

  const matchedTeacher = (teachersList || []).find(t => t.name === newGroup.teacher);

  const handleTeacherSelect = (teacherName) => {
    if (!teacherName) {
      setNewGroup(prev => ({ ...prev, teacher: '' }));
      return;
    }
    const found = (teachersList || []).find(t => t.name === teacherName);
    setNewGroup(prev => ({
      ...prev,
      teacher: teacherName,
      room: prev.room || found?.rooms || '',
    }));
  };

  const handleClearTeacher = () => {
    setNewGroup(prev => ({ ...prev, teacher: '' }));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 470, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>Yangi {terms.groupSingular} Yaratish</div>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>Maktab bazasiga yangi {terms.groupSingular.toLowerCase()} qo'shish</div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>{terms.groupSingular} nomi *</label>
            <input
              required
              placeholder="Masalan: 11-B yoki 8-A"
              value={newGroup.name}
              onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>O'quv yili *</label>
            <input
              required
              placeholder="Masalan: 2026-2027"
              value={newGroup.academicYear}
              onChange={e => setNewGroup({ ...newGroup, academicYear: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          {/* O'qish smenasi (1-smena vs 2-smena) */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
              ⏰ O'qish smenasi (Dars vaqti tartibi) *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setNewGroup({ ...newGroup, shift: 1 })}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: (newGroup.shift || 1) === 1 ? `2px solid ${THEME.primary}` : '1.5px solid #CBD5E1',
                  backgroundColor: (newGroup.shift || 1) === 1 ? THEME.primaryLight : '#FFF',
                  color: (newGroup.shift || 1) === 1 ? THEME.primary : THEME.textDark,
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}>
                🌅 1-smena (Ertalabki)
              </button>
              <button
                type="button"
                onClick={() => setNewGroup({ ...newGroup, shift: 2 })}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: (newGroup.shift || 1) === 2 ? `2px solid ${THEME.orange}` : '1.5px solid #CBD5E1',
                  backgroundColor: (newGroup.shift || 1) === 2 ? '#FFF7ED' : '#FFF',
                  color: (newGroup.shift || 1) === 2 ? THEME.orange : THEME.textDark,
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}>
                🌇 2-smena (Abeddan keyin)
              </button>
            </div>
          </div>

          {/* O'qituvchini mavjud o'qituvchilar bazasidan tanlash */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                👨‍🏫 {terms.groupLeader} (O'qituvchi)
              </label>
              {teachersList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setManualMode(!manualMode)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: THEME.primary,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}>
                  {manualMode ? "👨‍🏫 Mavjud bazadan tanlash" : "✍️ Qo'lda yozish"}
                </button>
              )}
            </div>

            {!manualMode && teachersList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  value={newGroup.teacher}
                  onChange={e => handleTeacherSelect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 14,
                    border: `1.5px solid ${newGroup.teacher ? THEME.primary : '#CBD5E1'}`,
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                    fontSize: 13,
                    outline: 'none',
                    fontWeight: newGroup.teacher ? 700 : 500,
                    color: newGroup.teacher ? THEME.textDark : '#64748B',
                    cursor: 'pointer',
                  }}>
                  <option value="">-- O'qituvchini tanlang ({teachersList.length} nafar mavjud) --</option>
                  {teachersList.map(t => (
                    <option key={t.id} value={t.name}>
                      👨‍🏫 {t.name} (ID: {t.teacher_id || t.username}) — {t.subject || "Fan o'qituvchisi"}{t.rooms ? ` (${t.rooms})` : ''}
                    </option>
                  ))}
                </select>

                {matchedTeacher && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 14,
                    backgroundColor: THEME.primaryLight,
                    border: `1px solid ${THEME.primary}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: THEME.gradient,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 13,
                        flexShrink: 0,
                      }}>
                        {matchedTeacher.name[0] || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark }}>
                          {matchedTeacher.name}
                        </div>
                        <div style={{ fontSize: 11, color: THEME.primary, fontWeight: 700 }}>
                          {matchedTeacher.subject} {matchedTeacher.phone ? `• ${matchedTeacher.phone}` : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearTeacher}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: '4px 8px',
                        fontSize: 11,
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}>
                      ✕ Bekor qilish
                    </button>
                  </div>
                )}

                {onOpenAddTeacher && (
                  <div style={{ fontSize: 11, color: THEME.textMuted, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={onOpenAddTeacher}
                      style={{ background: 'transparent', border: 'none', color: THEME.primary, cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>
                      + Ro'yxatda yo'q yangi o'qituvchini qo'shish
                    </button>
                  </div>
                )}
              </div>
            ) : !manualMode && teachersList.length === 0 ? (
              <div style={{
                padding: '12px 14px',
                borderRadius: 14,
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                fontSize: 12,
                color: '#92400E',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div>⚠️ Maktab bazasida hali o'qituvchilar mavjud emas.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {onOpenAddTeacher && (
                    <button
                      type="button"
                      onClick={onOpenAddTeacher}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: 'none',
                        background: THEME.gradient,
                        color: '#FFF',
                        fontWeight: 800,
                        fontSize: 11.5,
                        cursor: 'pointer',
                      }}>
                      + Yangi O'qituvchi Qo'shish
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setManualMode(true)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 10,
                      border: '1px solid #D97706',
                      backgroundColor: '#FFFFFF',
                      color: '#92400E',
                      fontWeight: 700,
                      fontSize: 11.5,
                      cursor: 'pointer',
                    }}>
                    Qo'lda kiritish
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  placeholder="Masalan: Sardorbek Alimov"
                  value={newGroup.teacher}
                  onChange={e => setNewGroup({ ...newGroup, teacher: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, boxSizing: 'border-box', fontSize: 13 }}
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Biriktirilgan xona / Auditoriya (Ixtiyoriy)</label>
            <input
              placeholder="Masalan: 308-xona"
              value={newGroup.room}
              onChange={e => setNewGroup({ ...newGroup, room: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: 13, background: '#F1F5F9', color: THEME.textDark, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              Bekor qilish
            </button>
            <button
              type="submit"
              style={{ flex: 1.5, padding: 13, background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              {terms.groupSingular}ni Yaratish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 11.B GURUH / SINF TAHRIRLASH MODALI (EDIT GROUP/CLASS CRUD)
// =========================================================================
function EditGroupModal({ group, teachersList = [], terms = buildSchoolTerms(), onClose, onSave, onOpenAddTeacher }) {
  const [name, setName] = useState(group?.name || '');
  const [academicYear, setAcademicYear] = useState(group?.academic_year || '2026-2027');
  const [shift, setShift] = useState(group?.shift || 1);
  const [teacher, setTeacher] = useState(group?.advisor_teacher || '');
  const [room, setRoom] = useState(group?.room_number || '');
  const [submitting, setSubmitting] = useState(false);
  const [manualMode, setManualMode] = useState(() => {
    if (!group?.advisor_teacher) return false;
    return !teachersList.some(t => t.name.toLowerCase() === (group.advisor_teacher || '').toLowerCase());
  });

  const matchedTeacher = (teachersList || []).find(t => t.name.toLowerCase() === (teacher || '').toLowerCase());

  const handleTeacherSelect = (teacherName) => {
    if (!teacherName) {
      setTeacher('');
      return;
    }
    const found = (teachersList || []).find(t => t.name === teacherName);
    setTeacher(teacherName);
    if (!room && found?.rooms) {
      setRoom(found.rooms);
    }
  };

  const handleClearTeacher = () => {
    setTeacher('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      alert(`Iltimos, ${terms.groupSingularLower} nomini kiriting!`);
      return;
    }
    setSubmitting(true);
    try {
      await onSave(group.id, {
        name: cleanName,
        academic_year: academicYear.trim() || '2026-2027',
        advisor_teacher: teacher.trim(),
        room_number: room.trim(),
        shift: Number(shift) || 1,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 125, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 470, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>{terms.groupSingular}ni Tahrirlash (O'zgartirish)</div>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>"{group?.name}" {terms.groupGenitiveLower} parametrlarini o'zgartirish</div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>{terms.groupSingular} nomi *</label>
            <input
              required
              placeholder="Masalan: 11-B yoki 8-A"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13, fontWeight: 800 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>O'quv yili *</label>
            <input
              required
              placeholder="Masalan: 2026-2027"
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          {/* O'qish smenasi (1-smena vs 2-smena) */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
              ⏰ O'qish smenasi (Dars vaqti tartibi) *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setShift(1)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: (shift || 1) === 1 ? `2px solid ${THEME.primary}` : '1.5px solid #CBD5E1',
                  backgroundColor: (shift || 1) === 1 ? THEME.primaryLight : '#FFF',
                  color: (shift || 1) === 1 ? THEME.primary : THEME.textDark,
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}>
                🌅 1-smena (Ertalabki)
              </button>
              <button
                type="button"
                onClick={() => setShift(2)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: (shift || 1) === 2 ? `2px solid ${THEME.orange}` : '1.5px solid #CBD5E1',
                  backgroundColor: (shift || 1) === 2 ? '#FFF7ED' : '#FFF',
                  color: (shift || 1) === 2 ? THEME.orange : THEME.textDark,
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}>
                🌇 2-smena (Abeddan keyin)
              </button>
            </div>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
              {(shift || 1) === 1 ? "Ertalabki smena jadvali asosida dars vaqtlari avtomatik hisoblanadi." : "Abeddan keyingi smena (13:30) jadvali asosida dars vaqtlari avtomatik hisoblanadi."}
            </div>
          </div>

          {/* O'qituvchini mavjud o'qituvchilar bazasidan tanlash */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                👨‍🏫 {terms.groupLeader} (O'qituvchi)
              </label>
              {teachersList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setManualMode(!manualMode)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: THEME.primary,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}>
                  {manualMode ? "👨‍🏫 Mavjud bazadan tanlash" : "✍️ Qo'lda yozish"}
                </button>
              )}
            </div>

            {!manualMode && teachersList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  value={matchedTeacher ? matchedTeacher.name : teacher}
                  onChange={e => handleTeacherSelect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 14,
                    border: `1.5px solid ${teacher ? THEME.primary : '#CBD5E1'}`,
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                    fontSize: 13,
                    outline: 'none',
                    fontWeight: teacher ? 700 : 500,
                    color: teacher ? THEME.textDark : '#64748B',
                    cursor: 'pointer',
                  }}>
                  <option value="">-- O'qituvchini tanlang ({teachersList.length} nafar mavjud) --</option>
                  {teachersList.map(t => (
                    <option key={t.id} value={t.name}>
                      👨‍🏫 {t.name} (ID: {t.teacher_id || t.username}) — {t.subject || "Fan o'qituvchisi"}{t.rooms ? ` (${t.rooms})` : ''}
                    </option>
                  ))}
                </select>

                {matchedTeacher && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 14,
                    backgroundColor: THEME.primaryLight,
                    border: `1px solid ${THEME.primary}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: THEME.gradient,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 13,
                        flexShrink: 0,
                      }}>
                        {matchedTeacher.name[0] || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark }}>
                          {matchedTeacher.name}
                        </div>
                        <div style={{ fontSize: 11, color: THEME.primary, fontWeight: 700 }}>
                          {matchedTeacher.subject} {matchedTeacher.phone ? `• ${matchedTeacher.phone}` : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearTeacher}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: '4px 8px',
                        fontSize: 11,
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}>
                      ✕ Bekor qilish
                    </button>
                  </div>
                )}

                {onOpenAddTeacher && (
                  <div style={{ fontSize: 11, color: THEME.textMuted, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={onOpenAddTeacher}
                      style={{ background: 'transparent', border: 'none', color: THEME.primary, cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>
                      + Ro'yxatda yo'q yangi o'qituvchini qo'shish
                    </button>
                  </div>
                )}
              </div>
            ) : !manualMode && teachersList.length === 0 ? (
              <div style={{
                padding: '12px 14px',
                borderRadius: 14,
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                fontSize: 12,
                color: '#92400E',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div>⚠️ Maktab bazasida hali o'qituvchilar mavjud emas.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {onOpenAddTeacher && (
                    <button
                      type="button"
                      onClick={onOpenAddTeacher}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: 'none',
                        background: THEME.gradient,
                        color: '#FFF',
                        fontWeight: 800,
                        fontSize: 11.5,
                        cursor: 'pointer',
                      }}>
                      + Yangi O'qituvchi Qo'shish
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setManualMode(true)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 10,
                      border: '1px solid #D97706',
                      backgroundColor: '#FFFFFF',
                      color: '#92400E',
                      fontWeight: 700,
                      fontSize: 11.5,
                      cursor: 'pointer',
                    }}>
                    Qo'lda kiritish
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  placeholder="Masalan: Sardorbek Alimov"
                  value={teacher}
                  onChange={e => setTeacher(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, boxSizing: 'border-box', fontSize: 13 }}
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Biriktirilgan xona / Auditoriya</label>
            <input
              placeholder="Masalan: 308-xona"
              value={room}
              onChange={e => setRoom(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: 13, background: '#F1F5F9', color: THEME.textDark, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ flex: 1.5, padding: 13, background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 12. YANGI O'QITUVCHI QO'SHISH MODALI
// =========================================================================
function AddTeacherModal({ newTeacher, setNewTeacher, classesList = [], terms = buildSchoolTerms(), onClose, onSubmit }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>Yangi O'qituvchi Qo'shish</div>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>Maktab o'qituvchilar tarkibiga yangi ustoz qo'shish</div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>O'qituvchi F.I.Sh. *</label>
            <input
              required
              placeholder="Masalan: Rustamov Sherzod"
              value={newTeacher.name}
              onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Fan yo'nalishi *</label>
            <input
              required
              placeholder="Masalan: Kimyo & Biologiya"
              value={newTeacher.subject}
              onChange={e => setNewTeacher({ ...newTeacher, subject: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Biriktirilgan {terms.groupSingular.toLowerCase()}</label>
            <input
              list="teacher-group-options"
              placeholder={`Masalan: 11-A ${terms.groupLeader.toLowerCase()}`}
              value={newTeacher.group}
              onChange={e => setNewTeacher({ ...newTeacher, group: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
            <datalist id="teacher-group-options">
              {classesList.map(c => (
                <option key={c.id} value={`${c.name} ${terms.groupLeader.toLowerCase()}`} />
              ))}
            </datalist>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Auditoriya / Xona</label>
              <input
                placeholder="Masalan: 305-xona"
                value={newTeacher.rooms}
                onChange={e => setNewTeacher({ ...newTeacher, rooms: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Telefon raqami</label>
              <input
                placeholder="+998 90 123-45-67"
                value={newTeacher.phone}
                onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Maxfiy Parol</label>
              <span style={{ fontSize: 11, color: THEME.primary, fontWeight: 700 }}>Ixtiyoriy (Standart: teacher123)</span>
            </div>
            <input
              type="text"
              placeholder="Bo'sh qoldirilsa: teacher123"
              value={newTeacher.password || ''}
              onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Key size={12} color={THEME.primary} />
              <span>5 xonali unikal Kirish ID tizim tomonidan avtomatik belgilanadi.</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>3x4 Foto (Ixtiyoriy — Face ID va profil uchun)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
              <div style={{ width: 56, height: 72, borderRadius: 10, border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', backgroundColor: '#F8FAFC' }}>
                {newTeacher.photoPreview ? (
                  <img src={newTeacher.photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 10, color: THEME.textMuted, textAlign: 'center', padding: 4 }}>Foto yo'q</span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="teacher-photo-input"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewTeacher({
                        ...newTeacher,
                        photo: file,
                        photoPreview: URL.createObjectURL(file)
                      });
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="teacher-photo-input"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: `1px solid ${THEME.border}`, backgroundColor: '#F8FAFC', fontSize: 12, fontWeight: 700, color: THEME.textDark, cursor: 'pointer' }}>
                  <FolderOpen size={14} color={THEME.primary} />
                  3x4 Rasmni tanlash
                </label>
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                  JPG, PNG formatida (pasport yoki rasmiy 3x4 rasm)
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: 13, background: '#F1F5F9', color: THEME.textDark, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              Bekor qilish
            </button>
            <button
              type="submit"
              style={{ flex: 1.5, padding: 13, background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              Saqlash va Qo'shish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

