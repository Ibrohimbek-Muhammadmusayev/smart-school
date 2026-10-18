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
  Edit, Trash2
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
    fetch('http://127.0.0.1:8000/api/school-config/?all_schools=1')
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
  const [impersonatedSchool, setImpersonatedSchool] = useState(null);

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
    sessionStorage.removeItem('smart_auth_session');
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

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError(null);
    const { username, password } = loginForm;

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

    // 3. O'qituvchi / Ustoz Dashbordi
    if (username === 'teacher' && password === 'teacher123') {
      onLoginSuccess({
        role: 'TEACHER',
        schoolId: '1',
        schoolName: "1-sonli Ixtisoslashtirilgan Maktab-Kollej",
        username: 'teacher',
        name: 'Akmal Rahimov (Matematika & IT)',
        assignedGroup: '9-A',
        subject: 'Oliy Matematika',
      });
      return;
    }

    setLoginError("Login yoki parol noto'g'ri! Quyidagi hisoblardan birini tanlang:");
  };

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: THEME.bgSoft, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 460, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 36, boxShadow: '0 20px 40px -15px rgba(108, 92, 231, 0.15)', border: `1px solid ${THEME.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, borderRadius: 22, background: THEME.gradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 10px 24px rgba(108, 92, 231, 0.35)' }}>
            <School size={34} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: THEME.textDark, margin: 0 }}>Smart School</h2>
          <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: 6 }}>Yagona Ta'lim va Davomat Boshqaruv Markazi</p>
        </div>

        {loginError && (
          <div style={{ padding: 12, backgroundColor: '#FFF0F0', border: '1px solid #FFD0D0', borderRadius: 14, color: '#D63031', fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} /> {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Foydalanuvchi Logini</label>
            <input 
              required
              placeholder="admin, maktab1, maktab2 yoki teacher"
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
            style={{ width: '100%', padding: 15, background: THEME.gradient, color: 'white', borderRadius: 18, border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginTop: 10, boxShadow: '0 10px 20px rgba(108, 92, 231, 0.3)' }}>
            Tizimga Kirish  ➔
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 14, backgroundColor: THEME.primaryLight, borderRadius: 18, fontSize: 12, color: THEME.primary, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 800, marginBottom: 2 }}>Tezkor Kirish (Bosib tanlang):</div>
          <button
            type="button"
            onClick={() => setLoginForm({ username: 'admin', password: 'admin123' })}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 12, border: `1px solid ${loginForm.username === 'admin' ? THEME.primary : 'transparent'}`, backgroundColor: '#FFFFFF', color: THEME.textDark, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
            <span>🛡️ <b>Super Admin (Barcha Maktablar):</b></span>
            <code>admin / admin123</code>
          </button>
          <button
            type="button"
            onClick={() => setLoginForm({ username: 'maktab1', password: 'school123' })}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 12, border: `1px solid ${loginForm.username === 'maktab1' ? THEME.primary : 'transparent'}`, backgroundColor: '#FFFFFF', color: THEME.textDark, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
            <span>🏫 <b>1-Maktab Direktori:</b></span>
            <code>maktab1 / school123</code>
          </button>
          <button
            type="button"
            onClick={() => setLoginForm({ username: 'maktab2', password: 'school123' })}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 12, border: `1px solid ${loginForm.username === 'maktab2' ? THEME.primary : 'transparent'}`, backgroundColor: '#FFFFFF', color: THEME.textDark, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
            <span>🏫 <b>24-Prezident Maktabi Direktori:</b></span>
            <code>maktab2 / school123</code>
          </button>
          <button
            type="button"
            onClick={() => setLoginForm({ username: 'teacher', password: 'teacher123' })}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 12, border: `1px solid ${loginForm.username === 'teacher' ? THEME.primary : 'transparent'}`, backgroundColor: '#FFFFFF', color: THEME.textDark, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
            <span>👨‍🏫 <b>O'qituvchi Kabineti:</b></span>
            <code>teacher / teacher123</code>
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
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

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
    room: ''
  });

  // Yangi o'qituvchi formasi
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    subject: '',
    phone: '+998 ',
    group: '',
    rooms: ''
  });

  const fetchBackendData = async () => {
    setLoading(true);
    try {
      const q = `school_id=${encodeURIComponent(schoolId)}`;
      const [cfgRes, stuRes, clsRes, tchRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/school-config/?${q}`),
        fetch(`http://127.0.0.1:8000/api/students/?${q}`),
        fetch(`http://127.0.0.1:8000/api/classes/?${q}`),
        fetch(`http://127.0.0.1:8000/api/teachers/?${q}`),
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, [schoolId]);

  const handleSaveSchoolConfig = async (payload) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/school-config/', {
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
      const res = await fetch('http://127.0.0.1:8000/api/classes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          academic_year: newGroup.academicYear.trim() || schoolConfig?.academic_year || '2026-2027',
          school_id: schoolId,
          school_name: schoolName,
          advisor_teacher: newGroup.teacher.trim() || `Maktab ${terms.advisorLabel}`,
          room_number: newGroup.room.trim() || "Asosiy o'quv binosi",
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
      setNewGroup({ name: '', academicYear: schoolConfig?.academic_year || '2026-2027', teacher: '', room: '' });
      alert(`✅ "${created.name}" ${terms.groupGenitiveLower} "${schoolName}" bazasida muvaffaqiyatli yaratildi!`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  // Guruh / Sinf ma'lumotlarini o'zgartirish (Edit Group CRUD)
  const handleUpdateGroup = async (groupId, updatedFields) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/classes/${groupId}/?school_id=${encodeURIComponent(schoolId)}`, {
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
      const res = await fetch(`http://127.0.0.1:8000/api/classes/${id}/?school_id=${encodeURIComponent(schoolId)}`, {
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
      const res = await fetch('http://127.0.0.1:8000/api/teachers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeacher.name.trim(),
          subject: newTeacher.subject.trim(),
          phone: newTeacher.phone.trim() || "+998 90 000-00-00",
          group: newTeacher.group.trim() || "Fan o'qituvchisi",
          rooms: newTeacher.rooms.trim() || "Asosiy bino",
          school_id: schoolId,
          school_name: schoolName,
          created_by: actorLabel,
          created_by_role: actorRole,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || "O'qituvchi qo'shishda xatolik");
      }
      const createdTeacher = await res.json();
      setTeachersList([createdTeacher, ...teachersList]);
      appendGlobalAudit('CREATE_TEACHER', createdTeacher.name, `${schoolName} bazasiga ustoz "${createdTeacher.name}" (${createdTeacher.subject}) qo'shildi`);
      setShowAddTeacherModal(false);
      setNewTeacher({ name: '', subject: '', phone: '+998 ', group: '', rooms: '' });
      alert(`✅ Ustoz "${createdTeacher.name}" faqat "${schoolName}" bazasiga muvaffaqiyatli qo'shildi!`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleDeleteTeacher = async (teacherId, teacherName) => {
    if (!window.confirm(`Rostdan ham "${teacherName}" o'qituvchisini "${schoolName}" ro'yxatidan o'chirmoqchimisiz?`)) {
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/teachers/${teacherId}/?school_id=${encodeURIComponent(schoolId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("O'qituvchini o'chirishda xatolik");
      setTeachersList(teachersList.filter(t => t.id !== teacherId));
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

      const res = await fetch('http://127.0.0.1:8000/api/students/', {
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
      const res = await fetch(`http://127.0.0.1:8000/api/students/${studentId}/?school_id=${encodeURIComponent(schoolId)}`, {
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
      const res = await fetch(`http://127.0.0.1:8000/api/students/${studentId}/?school_id=${encodeURIComponent(schoolId)}`, {
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
          <div style={{ width: 44, height: 44, borderRadius: 16, background: THEME.gradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(108, 92, 231, 0.3)', flexShrink: 0 }}>
            <School size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div title={schoolName} style={{ fontWeight: 900, fontSize: 14.5, color: THEME.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {schoolName}
            </div>
            <div style={{ fontSize: 11, color: THEME.primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>Maktab #{schoolId}</span>
              <span>•</span>
              <span>{terms.groupPlural} rejimi</span>
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NavButton active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')} icon={<Calendar size={18} />} label={`${terms.lessonSingular} Matritsasi`} badge="Jonli" />
          <NavButton active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} icon={<FolderOpen size={18} />} label={`${terms.groupPlural} Boshqaruvi`} badge={`${classesList.length} ta`} />
          <NavButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={18} />} label={terms.studentPlural} badge={`${realStudents.length} ta`} />
          <NavButton active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} icon={<GraduationCap size={18} />} label="O'qituvchilar" badge={`${teachersList.length} ta`} />
          <NavButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<CheckCircle2 size={18} />} label="Davomat Auditi" />
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
                {activeTab === 'groups' && `Maktab ${terms.groupPlural}i & Ularning ${terms.studentPlural}i`}
                {activeTab === 'students' && `Maktab ${terms.studentPlural} Bazasi & Yaratilganlik Tarixi`}
                {activeTab === 'teachers' && "Maktab O'qituvchilari Ro'yxati"}
                {activeTab === 'attendance' && `Bino va ${terms.groupPlural} Bo'yicha Davomat Auditi`}
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

          {/* TAB 2: GURUHLAR VA ULARNING O'QUVCHILARI */}
          {activeTab === 'groups' && (
            <GroupsManagementSection 
              classesList={classesList} 
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
            />
          )}

          {/* TAB 4: O'QITUVCHILAR */}
          {activeTab === 'teachers' && (
            <TeachersListSection 
              teachers={teachersList}
              schoolName={schoolName}
              terms={terms}
              onAddTeacher={() => setShowAddTeacherModal(true)}
              onDeleteTeacher={handleDeleteTeacher}
            />
          )}

          {/* TAB 5: DAVOMAT AUDITI */}
          {activeTab === 'attendance' && (
            <AttendanceAuditSection realStudents={realStudents} schoolName={schoolName} terms={terms} />
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

      {/* Yangi Guruh / Sinf yaratish modali */}
      {showAddGroupModal && (
        <AddGroupModal
          newGroup={newGroup}
          setNewGroup={setNewGroup}
          terms={terms}
          onClose={() => setShowAddGroupModal(false)}
          onSubmit={handleAddGroup}
        />
      )}

      {/* Guruh / Sinf tahrirlash modali (Edit Group CRUD) */}
      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          terms={terms}
          onClose={() => setEditingGroup(null)}
          onSave={handleUpdateGroup}
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
  onAddStudentToClass,
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
              </div>
              <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 5, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span>👨‍🏫 {terms.advisorLabel}: <b style={{ color: THEME.textDark }}>{activeAdvisor.teacher}</b></span>
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
                    onClick={() => onSelectStudent(st)}
                    style={{
                      width: 52,
                      height: 68,
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: '#F1F5F9',
                      border: `1px solid ${THEME.border}`,
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}>
                    {st.photo_3x4 ? (
                      <img src={st.photo_3x4} alt={st.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                      {st.photo_3x4 ? (
                        <img
                          src={st.photo_3x4}
                          alt={st.full_name}
                          style={{ width: 38, height: 48, objectFit: 'cover', borderRadius: 8, border: `1px solid ${THEME.border}` }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 38,
                            height: 48,
                            backgroundColor: THEME.primaryLight,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: THEME.primary,
                            fontSize: 11,
                            fontWeight: 800,
                          }}>
                          {(st.last_name?.[0] || '') + (st.first_name?.[0] || '')}
                        </div>
                      )}
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
// 5. O'QUVCHI MA'LUMOTLARI DRAWER/MODAL (3x4 RASMI, TARIXI VA REKVIZITLARI)
// =========================================================================
function StudentDetailDrawer({ student, terms = buildSchoolTerms({}), onClose, onEdit, onDelete }) {
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
          <div style={{ width: 68, height: 86, borderRadius: 14, overflow: 'hidden', backgroundColor: '#FFF', border: `2px solid ${THEME.primary}`, boxShadow: '0 6px 14px rgba(108, 92, 231, 0.15)' }}>
            {student.photo_3x4 ? (
              <img src={student.photo_3x4} alt={student.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
// 6. O'QUVCHILAR RO'YXATI VA YARATILGANLIK TARIXI SAHIFASI
// =========================================================================
function StudentsListSection({ realStudents, schoolName, terms = buildSchoolTerms({}), searchTerm, setSearchTerm, onStudentClick, onEditStudent, onDeleteStudent, onAddStudent }) {
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
                      {st.photo_3x4 ? (
                        <img src={st.photo_3x4} alt={st.full_name} style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 8, border: `1px solid ${THEME.border}` }} />
                      ) : (
                        <div style={{ width: 40, height: 50, backgroundColor: THEME.primaryLight, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.primary, fontSize: 11, fontWeight: 800 }}>
                          {(st.last_name?.[0] || '') + (st.first_name?.[0] || '')}
                        </div>
                      )}
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
// 7. O'QITUVCHILAR RO'YXATI SAHIFASI
// =========================================================================
function TeachersListSection({ teachers = [], schoolName, terms = buildSchoolTerms({}), onAddTeacher, onDeleteTeacher }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: 26, borderRadius: 26, border: `1px solid ${THEME.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: THEME.textDark, margin: 0 }}>{schoolName} — O'qituvchilar Tarkibi</h3>
          <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
            Faqat ushbu maktabga biriktirilgan va mobil kabinet orqali davomat oluvchi ustozlar
          </p>
        </div>
        <span style={{ padding: '6px 14px', borderRadius: 12, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 800, fontSize: 12 }}>
          {teachers.length} nafar o'qituvchi
        </span>
      </div>

      {teachers.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: THEME.textMuted }}>
          <GraduationCap size={42} color={THEME.primary} style={{ opacity: 0.35, marginBottom: 10 }} />
          <div style={{ fontWeight: 800, fontSize: 16, color: THEME.textDark }}>
            Ushbu maktabda hozircha o'qituvchilar ro'yxatga olinmagan
          </div>
          <div style={{ fontSize: 12.5, marginTop: 6, marginBottom: 16 }}>
            Maktab o'qituvchilarini qo'shish uchun yuqoridagi yoki quyidagi tugmani bosing.
          </div>
          {onAddTeacher && (
            <button
              onClick={onAddTeacher}
              style={{ padding: '10px 20px', borderRadius: 14, border: 'none', background: THEME.gradient, color: '#FFF', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              + O'qituvchi Qo'shish
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {teachers.map(t => (
            <div key={t.id} style={{ padding: 20, borderRadius: 22, border: `1px solid ${THEME.border}`, backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: THEME.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16, flexShrink: 0 }}>
                    {t.name ? t.name[0] : 'U'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: THEME.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: THEME.primary, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</div>
                  </div>
                </div>
                {onDeleteTeacher && (
                  <button
                    onClick={() => onDeleteTeacher(t.id, t.name)}
                    title="O'qituvchini o'chirish"
                    style={{ padding: 8, borderRadius: 10, border: 'none', backgroundColor: '#FEE2E2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div style={{ padding: 12, backgroundColor: THEME.bgSoft, borderRadius: 14, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted }}>Maktab bazasi:</span>
                  <span style={{ fontWeight: 700, color: THEME.primary }}>{t.school_name || schoolName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted }}>Biriktirilgan {terms.groupSingularLower}:</span>
                  <span style={{ fontWeight: 700, color: THEME.textDark }}>{t.group}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted }}>Auditoriya:</span>
                  <span style={{ fontWeight: 700, color: THEME.textDark }}>{t.rooms}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: THEME.textMuted }}>Aloqa:</span>
                  <span style={{ fontWeight: 700, color: THEME.textDark }}>{t.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px dashed ${THEME.border}`, paddingTop: 6, marginTop: 2 }}>
                  <span style={{ color: THEME.textMuted }}>Kim qo'shgan:</span>
                  <span style={{ fontWeight: 700, color: THEME.textDark, fontSize: 11 }}>{t.created_by || "Maktab Direktori"}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, color: THEME.green, fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Smartphone size={14} /> Mobil QR skanerga ulangan
                </span>
                <span style={{ fontSize: 10.5, color: THEME.textMuted }}>{t.created_at || ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 8. DAVOMAT AUDITI SAHIFASI
// =========================================================================
function AttendanceAuditSection({ realStudents, schoolName, terms = buildSchoolTerms({}) }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <KpiCard title="Bino Ichida" value={realStudents.length ? "96.4%" : "0%"} sub="Turniketdan o'tganlar" color={THEME.green} />
        <KpiCard title={`Bugungi ${terms.lessonSingular} Qatnashuvi`} value={realStudents.length ? "94.2%" : "0%"} sub={`${terms.lessonSingular} QR kod skanerlangan`} color={THEME.primary} />
        <KpiCard title={`Jami ${terms.studentPlural}`} value={`${realStudents.length} nafar`} sub={schoolName} color={THEME.orange} />
        <KpiCard title="Izolyatsiya Holati" value="100% Faol" sub="Faqat shu maktab bazasi" color="#10B981" />
      </div>

      <div style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, border: `1px solid ${THEME.border}` }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>Turniket va {terms.lessonSingular} QR Davomat Loglari ({schoolName})</h3>
        {realStudents.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
            Ushbu maktabda hozircha {terms.studentPluralLower} mavjud emas.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted }}>
                <th style={{ padding: '12px 14px' }}>{terms.studentSingular}</th>
                <th style={{ padding: '12px 14px' }}>{terms.groupSingular}</th>
                <th style={{ padding: '12px 14px' }}>Bino Kirishi</th>
                <th style={{ padding: '12px 14px' }}>{terms.lessonSingular} QR Skanerlash</th>
                <th style={{ padding: '12px 14px' }}>Kim Yaratgan</th>
                <th style={{ padding: '12px 14px' }}>Holat</th>
              </tr>
            </thead>
            <tbody>
              {realStudents.slice(0, 8).map((st) => (
                <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                  <td style={{ padding: '14px', fontWeight: 800 }}>{st.last_name} {st.first_name}</td>
                  <td style={{ padding: '14px' }}>{terms.formatGroupBadge(st.class_name)}</td>
                  <td style={{ padding: '14px', color: THEME.green, fontWeight: 700 }}>08:14:22 ✅</td>
                  <td style={{ padding: '14px', color: THEME.primary, fontWeight: 700 }}>08:32:05 (Dinamik QR)</td>
                  <td style={{ padding: '14px', fontSize: 12, color: THEME.textMuted }}>{st.created_by || "Maktab Direktori"}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 8, backgroundColor: '#ECFDF5', color: THEME.green, fontWeight: 700, fontSize: 11 }}>
                      Tasdiqlangan
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
      }));
    } else if (presetType === 'GURUH_MODE') {
      setForm(prev => ({
        ...prev,
        institution_type: 'LITSEY_KOLLEJ',
        group_term: 'GURUH',
        lesson_term: 'PARA',
        student_term: 'OQUVCHI',
      }));
    } else if (presetType === 'TALABA_MODE') {
      setForm(prev => ({
        ...prev,
        institution_type: 'TEXNIKUM_OTM',
        group_term: 'GURUH',
        lesson_term: 'PARA',
        student_term: 'TALABA',
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
              </div>

              <div style={{ padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 800, marginBottom: 6 }}>📱 MOBIL: O'QITUVCHI PANELI</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#FFF' }}>Mening {liveTerms.groupPlural.toLowerCase()}im</div>
                <div style={{ fontSize: 11.5, color: '#CBD5E1', marginTop: 6 }}>
                  • <b>Jurnal:</b> {liveTerms.formatGroup('11-A')} ({liveTerms.studentPlural})
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
  const schoolId = String(currentUser?.schoolId || '1');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/school-config/?school_id=${encodeURIComponent(schoolId)}`)
      .then(r => r.json())
      .then(cfg => {
        if (cfg && cfg.school_id) setSchoolConfig(cfg);
      })
      .catch(() => {});
    fetch(`http://127.0.0.1:8000/api/students/?school_id=${encodeURIComponent(schoolId)}`)
      .then(r => r.json())
      .then(d => setStudents(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch(`http://127.0.0.1:8000/api/classes/?school_id=${encodeURIComponent(schoolId)}`)
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
          <div style={{ width: 44, height: 44, borderRadius: 16, background: THEME.gradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: THEME.textDark }}>Ustoz Kabineti</div>
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
            Jonli {terms.lessonSingular.toLowerCase()} davomatini olish uchun smartfoningizdagi <b>Smart School</b> mobil ilovasi orqali QR skanerdan foydalaning.
          </div>
        </div>

        <div style={{ paddingTop: 16, borderTop: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: THEME.textMuted }}>{currentUser.subject}</div>
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
                    {st.photo_3x4 ? (
                      <img src={st.photo_3x4} alt="" style={{ width: 36, height: 46, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 36, height: 46, borderRadius: 8, background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>Foto</div>
                    )}
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
                  <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
function AddGroupModal({ newGroup, setNewGroup, terms = buildSchoolTerms(), onClose, onSubmit }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 450, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
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

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>{terms.groupLeader} (Ixtiyoriy)</label>
            <input
              placeholder="Masalan: Sardorbek Alimov"
              value={newGroup.teacher}
              onChange={e => setNewGroup({ ...newGroup, teacher: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
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
function EditGroupModal({ group, terms = buildSchoolTerms(), onClose, onSave }) {
  const [name, setName] = useState(group?.name || '');
  const [academicYear, setAcademicYear] = useState(group?.academic_year || '2026-2027');
  const [teacher, setTeacher] = useState(group?.advisor_teacher || '');
  const [room, setRoom] = useState(group?.room_number || '');
  const [submitting, setSubmitting] = useState(false);

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
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 125, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
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

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>{terms.groupLeader} (F.I.Sh.)</label>
            <input
              placeholder="Masalan: Sardorbek Alimov"
              value={teacher}
              onChange={e => setTeacher(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13 }}
            />
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

