import React, { useState } from 'react';
import { 
  Building2, Shield, Users, CheckCircle2, AlertTriangle, 
  Search, Plus, RefreshCw, Key, Send, TrendingUp, 
  BarChart3, Activity, ChevronRight, Filter, Download, 
  ArrowUpRight, ArrowDownRight, School, Bell, Menu, X, 
  Power, Lock, Unlock, Eye, MapPin, Phone, Mail, Award,
  Sliders, Layers, Server, Database, LogOut, UserPlus, BookOpen,
  Calendar, CheckCircle, UserX, QrCode
} from 'lucide-react';
import SchoolMapPicker from './components/SchoolMapPicker';


export default function App() {
  // Foydalanuvchi sessiyasi: sessionStorage orqali tiklanadi (1 soatlik token muddati)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('smart_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        // 1 soat (3600000 ms) tekshiruvi
        if (parsed.expiresAt && now < parsed.expiresAt) {
          return parsed.user;
        } else {
          sessionStorage.removeItem('smart_auth_session');
        }
      }
    } catch (_) {}
    return null;
  });

  // Har daqiqada token muddati tugaganini tekshirib turish
  React.useEffect(() => {
    const timer = setInterval(() => {
      try {
        const saved = sessionStorage.getItem('smart_auth_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Date.now() >= parsed.expiresAt) {
            handleLogout();
            alert("Xavfsizlik: 1 soatlik sessiya muddati tugadi. Iltimos, qayta kiring.");
          }
        }
      } catch (_) {}
    }, 30000); // Har 30 soniyada tekshiradi
    return () => clearInterval(timer);
  }, []);

  const saveSession = (user) => {
    const oneHour = 60 * 60 * 1000; // 1 soat
    const sessionData = {
      token: "jwt_sec_" + Math.random().toString(36).substring(2) + Date.now(),
      user: user,
      loginAt: Date.now(),
      expiresAt: Date.now() + oneHour,
    };
    sessionStorage.setItem('smart_auth_session', JSON.stringify(sessionData));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('smart_auth_session');
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
  };

  // Global ma'lumotlar bazasi (SaaS State)
  const [schools, setSchools] = useState([
    {
      id: 1,
      name: "1-sonli Ixtisoslashtirilgan Maktab",
      region: "Toshkent sh., Yunusobod tumani",
      director: "Rahimov Jamshid",
      phone: "+998 71 234-56-78",
      studentsCount: 1420,
      teachersCount: 78,
      todayAttendance: 96.4,
      status: "ACTIVE",
      tariff: "Premium (Cheksiz QR & Telegram)",
      licenseExpire: "2027-09-01",
      qrScansToday: 1368,
      // Ushbu maktabning o'z o'quvchilari va darslari (Faqat shu maktab adminiga tegishli)
      students: [
        { id: 101, name: "Aliyev Vali", passport: "AA 1234567", initialPwd: "pass123", class: "9-A" },
        { id: 102, name: "Karimova Zilola", passport: "AA 7654321", initialPwd: "pass123", class: "9-A" },
        { id: 103, name: "Toshmatov Sardor", passport: "AB 9988776", initialPwd: "pass123", class: "9-A" }
      ],
      lessons: [
        { id: 201, subject: "Matematika", teacher: "Akmal Rahimov", room: "302-xona", time: "08:30 - 09:15", status: "ACTIVE", class: "9-A" },
        { id: 202, subject: "Fizika", teacher: "Akmal Rahimov", room: "204-xona", time: "09:25 - 10:10", status: "PENDING", class: "9-A" }
      ],
      admins: [
        { id: 1, username: "maktab1", name: "Rahimov Jamshid (Direktor)" }
      ]
    },
    {
      id: 2,
      name: "Al-Xorazmiy nomidagi IT Maktabi",
      region: "Toshkent sh., Chilonzor tumani",
      director: "Qodirov Sardor",
      phone: "+998 71 298-11-22",
      studentsCount: 980,
      teachersCount: 52,
      todayAttendance: 94.1,
      status: "ACTIVE",
      tariff: "Premium (Cheksiz QR & Telegram)",
      licenseExpire: "2027-05-15",
      qrScansToday: 922,
      students: [
        { id: 301, name: "Saidov Jasur", passport: "AA 3322114", initialPwd: "pass123", class: "10-B" },
        { id: 302, name: "Nazarova Madina", passport: "AB 4455667", initialPwd: "pass123", class: "10-B" }
      ],
      lessons: [
        { id: 401, subject: "Informatika & Python", teacher: "Bobur Mirzayev", room: "105-lab", time: "08:30 - 09:15", status: "ACTIVE", class: "10-B" }
      ],
      admins: [
        { id: 2, username: "maktab2", name: "Qodirov Sardor (Direktor)" }
      ]
    }
  ]);

  // Login formasi uchun state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError(null);
    const { username, password } = loginForm;

    // 1. Tizim Bosh Admini (SuperAdmin) tekshiruvi
    if (username === 'superadmin' && password === 'admin123') {
      saveSession({
        role: 'SUPER_ADMIN',
        username: 'superadmin',
        name: 'Tizim Bosh Administratori',
      });
      return;
    }

    // 2. Maktab Adminlari tekshiruvi (Multi-tenant izolyatsiya)
    if (username === 'maktab1' && password === 'school123') {
      const sch = schools.find(s => s.id === 1);
      saveSession({
        role: 'SCHOOL_ADMIN',
        username: 'maktab1',
        name: 'Rahimov Jamshid (Direktor)',
        schoolId: 1,
        schoolName: sch ? sch.name : '1-sonli Maktab'
      });
      return;
    }

    if (username === 'maktab2' && password === 'school123') {
      const sch = schools.find(s => s.id === 2);
      saveSession({
        role: 'SCHOOL_ADMIN',
        username: 'maktab2',
        name: 'Qodirov Sardor (Direktor)',
        schoolId: 2,
        schoolName: sch ? sch.name : 'Al-Xorazmiy IT Maktabi'
      });
      return;
    }

    setLoginError("Login yoki parol noto'g'ri! Sinov hisoblaridan foydalaning.");
  };


  // Agar login qilinmagan bo'lsa -> Markaziy Kirish Sahifasi
  if (!currentUser) {
    return (
      <LoginPage 
        loginForm={loginForm} 
        setLoginForm={setLoginForm} 
        handleLogin={handleLogin} 
        loginError={loginError} 
      />
    );
  }

  // 1-ROLE: TIZIM BOSH ADMINI (SUPER ADMIN)
  if (currentUser.role === 'SUPER_ADMIN') {
    return (
      <SuperAdminDashboard 
        currentUser={currentUser} 
        handleLogout={handleLogout} 
        schools={schools} 
        setSchools={setSchools} 
      />
    );
  }

  // 2-ROLE: MAKTAB ADMINI (Izolyatsiyalangan Maktab Paneli)
  if (currentUser.role === 'SCHOOL_ADMIN') {
    const userSchool = schools.find(s => s.id === currentUser.schoolId);
    return (
      <SchoolAdminDashboard 
        currentUser={currentUser} 
        handleLogout={handleLogout} 
        school={userSchool} 
        updateSchool={(updated) => {
          setSchools(schools.map(s => s.id === updated.id ? updated : s));
        }}
      />
    );
  }

  return null;
}

// =========================================================================
// 1. UNIVERSAL LOGIN SAHIFASI (Avtomatik Rolga Yo'naltiradi)
// =========================================================================
function LoginPage({ loginForm, setLoginForm, handleLogin, loginError }) {
  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 36, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFF0EB', color: '#FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: 0 }}>SmartSchool Platformasi</h2>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>Boshqaruv markaziga kirish (Role Based Access)</p>
        </div>

        {loginError && (
          <div style={{ padding: 12, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, color: '#DC2626', fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} /> {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Foydalanuvchi Logini</label>
            <input 
              required
              placeholder="superadmin yoki maktab1"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value.trim() })}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #CBD5E1', marginTop: 6, boxSizing: 'border-box', fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Maxfiy Parol</label>
            <input 
              required
              type="password"
              placeholder="••••••••"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #CBD5E1', marginTop: 6, boxSizing: 'border-box', fontSize: 14 }}
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '14px 0', backgroundColor: '#FF5722', color: '#FFF', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
            Kabinetga Kirish ➔
          </button>
        </form>

        {/* Sinov Hisoblari Qulaylik Uchun */}
        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0', fontSize: 12 }}>
          <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>🔑 Sinov Kirish Hisoblari:</div>
          <div style={{ color: '#475569', marginBottom: 4 }}>
            <b>1. Tizim Bosh Admini (SuperAdmin):</b><br/>
            Login: <code>superadmin</code> | Parol: <code>admin123</code>
          </div>
          <div style={{ color: '#475569', marginTop: 6 }}>
            <b>2. Maktab Admini (1-sonli Maktab):</b><br/>
            Login: <code>maktab1</code> | Parol: <code>school123</code>
          </div>
          <div style={{ color: '#475569', marginTop: 4 }}>
            <b>3. Maktab Admini (IT Maktab):</b><br/>
            Login: <code>maktab2</code> | Parol: <code>school123</code>
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 2. TIZIM BOSH ADMINI (SUPERADMIN) DASHBOARDI
// =========================================================================
function SuperAdminDashboard({ currentUser, handleLogout, schools, setSchools }) {
  // SuperAdmin faol sahifasi (sessionStorage'da saqlanadi)
  const [activeTab, setActiveTabState] = useState(() => {
    return sessionStorage.getItem('super_admin_active_tab') || 'schools';
  });

  const setActiveTab = (tab) => {
    sessionStorage.setItem('super_admin_active_tab', tab);
    setActiveTabState(tab);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '', region: 'Toshkent sh.', director: '', phone: '', adminUsername: '', adminPassword: 'school123'
  });
  const [mapPosition, setMapPosition] = useState([41.2995, 69.2401]); // Toshkent
  const [mapAddress, setMapAddress] = useState('');

  const toggleSchoolStatus = (id) => {
    setSchools(schools.map(s => s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' } : s));
  };

  const handleAddSchool = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      name: newSchool.name,
      region: mapAddress ? mapAddress.split(',').slice(0, 3).join(', ') : newSchool.region,
      locationCoordinates: mapPosition,
      director: newSchool.director,
      phone: newSchool.phone,
      studentsCount: 0,
      teachersCount: 0,
      todayAttendance: 0,
      status: "ACTIVE",
      tariff: "Premium (Cheksiz QR)",
      licenseExpire: "2027-10-01",
      qrScansToday: 0,
      students: [],
      lessons: [],
      admins: [{ id: Date.now(), username: newSchool.adminUsername, name: newSchool.director }]
    };
    setSchools([created, ...schools]);
    setShowAddModal(false);
  };

  const totalSchools = schools.length;
  const totalStudents = schools.reduce((acc, s) => acc + s.studentsCount, 0);

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* SuperAdmin Sidebar (Sticky) */}
      <aside style={{ width: 270, minWidth: 270, height: '100vh', position: 'sticky', top: 0, backgroundColor: '#0F172A', color: '#FFF', display: 'flex', flexDirection: 'column', padding: '20px 16px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottom: '1px solid #1E293B' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>SmartSchool OS</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Bosh Administrator (SuperAdmin)</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SuperNavButton active={activeTab === 'schools'} onClick={() => setActiveTab('schools')} icon={<Building2 size={19} />} label="Maktablar Tarmog'i" badge={`${totalSchools}`} />
          <SuperNavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UserPlus size={19} />} label="Maktab Adminlarini Tayinlash" />
          <SuperNavButton active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} icon={<BarChart3 size={19} />} label="Umumiy Respublika Davomati" />
          <SuperNavButton active={activeTab === 'servers'} onClick={() => setActiveTab('servers')} icon={<Server size={19} />} label="Server & QR Gateway" badge="Online" />
        </div>

        {/* Profil va Chiqish */}
        <div style={{ paddingTop: 16, borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>SuperAdmin</div>
            <div style={{ fontSize: 11, color: '#10B981' }}>Barcha muassasalarga ruxsat</div>
          </div>
          <button onClick={handleLogout} title="Chiqish" style={{ background: '#334155', border: 'none', color: '#FFF', padding: 8, borderRadius: 10, cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* SuperAdmin Main Content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
              {activeTab === 'schools' && "Respublika Maktablari Boshqaruvi"}
              {activeTab === 'users' && "Maktab Boshqaruvchilari (Adminlar) Ro'yxati"}
              {activeTab === 'monitoring' && "Umumiy Respublika Davomat Ko'rsatkichlari"}
              {activeTab === 'servers' && "Server va QR Gateway Trafigi"}
            </h1>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
              Maktablarning ichki o'quvchilari va baholariga aralashmasdan markaziy nazorat va litsenziyalash paneli
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', backgroundColor: '#FF5722', color: 'white', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={16} /> Yangi Maktab Qo'shish
          </button>
        </div>

        {/* Schools List View */}
        {activeTab === 'schools' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B' }}>
                  <th style={{ padding: '12px 14px' }}>Maktab Nomi</th>
                  <th style={{ padding: '12px 14px' }}>Hudud</th>
                  <th style={{ padding: '12px 14px' }}>Direktor</th>
                  <th style={{ padding: '12px 14px' }}>O'quvchilar</th>
                  <th style={{ padding: '12px 14px' }}>Bugungi Davomat</th>
                  <th style={{ padding: '12px 14px' }}>Tizim Holati</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Boshqarish</th>
                </tr>
              </thead>
              <tbody>
                {schools.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 14px', fontWeight: 800 }}>{s.name}</td>
                    <td style={{ padding: '16px 14px', color: '#64748B' }}>{s.region}</td>
                    <td style={{ padding: '16px 14px' }}>{s.director}</td>
                    <td style={{ padding: '16px 14px', fontWeight: 700 }}>{s.students.length} ta ro'yxatda</td>
                    <td style={{ padding: '16px 14px', fontWeight: 800, color: '#10B981' }}>{s.todayAttendance}%</td>
                    <td style={{ padding: '16px 14px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 8, fontWeight: 800, fontSize: 11, backgroundColor: s.status === 'ACTIVE' ? '#ECFDF5' : '#FEF2F2', color: s.status === 'ACTIVE' ? '#059669' : '#DC2626' }}>
                        {s.status === 'ACTIVE' ? "FAOL" : "TO'XTATILGAN"}
                      </span>
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                      <button onClick={() => toggleSchoolStatus(s.id)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, backgroundColor: s.status === 'ACTIVE' ? '#FEF2F2' : '#ECFDF5', color: s.status === 'ACTIVE' ? '#DC2626' : '#059669' }}>
                        {s.status === 'ACTIVE' ? "To'xtatish" : "Yoqish"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Maktab Adminlarini Boshqarish Tab */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Muassasalar Adminlari (Hisob ma'lumotlari)</h3>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Har bir maktab admini faqat o'z muassasasi doirasida o'quvchi va o'qituvchilarni boshqara oladi.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {schools.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 14 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Admin: {s.director} | Login: <code>maktab{s.id}</code></div>
                  </div>
                  <span style={{ padding: '4px 10px', backgroundColor: '#EFF6FF', color: '#1D4ED8', borderRadius: 8, fontWeight: 700, fontSize: 12 }}>
                    Vakolat: O'z maktabi admini
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Yangi Maktab Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ backgroundColor: 'white', borderRadius: 24, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Yangi Maktab Qo'shish</div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSchool} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Maktab Nomi</label>
                <input required placeholder="Masalan: 31-sonli Umumta'lim Maktabi" value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #CBD5E1', boxSizing: 'border-box', marginTop: 4 }} />
              </div>

              {/* Interaktiv Xarita Qidiruv va Tanlovchi */}
              <SchoolMapPicker 
                position={mapPosition} 
                setPosition={setMapPosition} 
                address={mapAddress} 
                setAddress={setMapAddress} 
              />

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Direktor F.I.SH</label>
                <input required placeholder="Masalan: Qosimov Anvar" value={newSchool.director} onChange={e => setNewSchool({...newSchool, director: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #CBD5E1', boxSizing: 'border-box', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Admin Logini (Kirish uchun)</label>
                <input required placeholder="Masalan: maktab3" value={newSchool.adminUsername} onChange={e => setNewSchool({...newSchool, adminUsername: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #CBD5E1', boxSizing: 'border-box', marginTop: 4 }} />
              </div>
              <button type="submit" style={{ padding: 13, backgroundColor: '#FF5722', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, marginTop: 8, cursor: 'pointer' }}>Maktabni Tasdiqlash & Joylashuvni Saqlash</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// 3. MAKTAB ADMINI (SCHOOL ADMIN) DASHBOARDI (TO'LIQ IZOLYATSIYA)
// =========================================================================
function SchoolAdminDashboard({ currentUser, handleLogout, school, updateSchool }) {
  // Maktab Admini faol sahifasi (sessionStorage'da saqlanadi)
  const [activeTab, setActiveTabState] = useState(() => {
    return sessionStorage.getItem('school_admin_active_tab') || 'overview';
  });

  const setActiveTab = (tab) => {
    sessionStorage.setItem('school_admin_active_tab', tab);
    setActiveTabState(tab);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', passport: '', class: '9-A', phone: '+998901234567' });

  if (!school) return <div style={{ padding: 40 }}>Maktab topilmadi!</div>;

  const handleAddStudent = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      name: `${newStudent.lastName} ${newStudent.firstName}`,
      passport: newStudent.passport.toUpperCase(),
      initialPwd: "Pass" + Math.floor(1000 + Math.random() * 9000),
      class: newStudent.class,
      phone: newStudent.phone
    };
    updateSchool({
      ...school,
      students: [created, ...school.students]
    });
    setShowAddStudentModal(false);
    setNewStudent({ firstName: '', lastName: '', passport: '', class: '9-A', phone: '+998901234567' });
  };

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 1. DARK SLATE RESPONSIVE SIDEBAR (Sticky 100vh) */}
      <aside style={{ width: 260, minWidth: 260, height: '100vh', position: 'sticky', top: 0, backgroundColor: '#0F172A', color: '#FFF', display: 'flex', flexDirection: 'column', padding: '20px 16px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 20, borderBottom: '1px solid #1E293B' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <School size={22} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{school.name}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Maktab Boshqaruv Markazi</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SuperNavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={19} />} label="Umumiy Statistika" />
          <SuperNavButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<CheckCircle2 size={19} />} label="Jonli Davomat" badge="Jonli" />
          <SuperNavButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={19} />} label="O'quvchilar & Sinflar" badge={`${school.students.length}`} />
          <SuperNavButton active={activeTab === 'passwords'} onClick={() => setActiveTab('passwords')} icon={<Key size={19} />} label="Ruxsatlar & Parollar" />
          <SuperNavButton active={activeTab === 'telegram'} onClick={() => setActiveTab('telegram')} icon={<Send size={19} />} label="Telegram Bot" />
        </div>

        {/* User Mini Profile (Doimiy Ko'rinadigan Pastki Blok) */}
        <div style={{ paddingTop: 16, borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              MD
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Maktab Direktori</div>
              <div style={{ fontSize: 10, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }}></span> Baza ulangan
              </div>
            </div>
          </div>
          <button onClick={handleLogout} title="Chiqish" style={{ background: '#1E293B', border: 'none', color: '#FFF', padding: 8, borderRadius: 10, cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
              {activeTab === 'overview' && "Maktab Davomat & LMS Boshqaruv Monitoringi"}
              {activeTab === 'attendance' && "Jonli Sinf Davomati va Darslar Xaritasi"}
              {activeTab === 'students' && "O'quvchilar Bazasi va Yangi Qabul"}
              {activeTab === 'passwords' && "Xavfsizlik, Rollar va Parollarni Tiklash"}
              {activeTab === 'telegram' && "Telegram Bot Integratsiyasi & Ota-onalar Xabarnomasi"}
            </h1>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
              {school.name} • Real vaqt rejimidagi avtomatlashtirilgan davomat statistikasi
            </p>
          </div>

          <button onClick={() => setShowAddStudentModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', backgroundColor: '#FF5722', color: 'white', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={16} /> Yangi O'quvchi Qo'shish
          </button>
        </div>

        {/* TAB 1: OVERVIEW (Haftalik grafik, progress barlar, KPI lar) */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
              <SuperKpiCard title="Maktab O'quvchilari" value={`${school.studentsCount || school.students.length} nafar`} sub="Jami ro'yxatdagilar" icon={<Users size={22} color="#3B82F6" />} bg="#EFF6FF" />
              <SuperKpiCard title="Bugungi Davomat" value={`${school.todayAttendance}%`} sub="O'rtacha qatnashish" icon={<CheckCircle2 size={22} color="#10B981" />} bg="#ECFDF5" />
              <SuperKpiCard title="Faol Dars Xonalari" value={`${school.lessons.length} ta`} sub="Bugun rejalashtirilgan" icon={<BookOpen size={22} color="#8B5CF6" />} bg="#F5F3FF" />
              <SuperKpiCard title="Telegram Xabarnomalar" value="100% Yetkazildi" sub="Ota-onalarga avtomatik" icon={<Send size={22} color="#FF5722" />} bg="#FFF0EB" />
            </div>

            {/* Haftalik Dinamika & Sinflar Jonli Progress */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              {/* Haftalik Davomat Dinamikasi Grafigi */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Haftalik Davomat Dinamikasi (%)</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Dushanba - Shanba oralig'idagi maktab ko'rsatkichi</div>
                  </div>
                  <span style={{ padding: '4px 10px', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                    O'rtacha: 94.8%
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, paddingTop: 20, paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                  {[
                    { day: 'Dush', pct: 93 },
                    { day: 'Sesh', pct: 96 },
                    { day: 'Chor', pct: 92 },
                    { day: 'Pay', pct: 97 },
                    { day: 'Jum', pct: 95 },
                    { day: 'Shan', pct: 90 },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>{item.pct}%</div>
                      <div style={{ width: 36, height: `${item.pct * 1.5}px`, backgroundColor: item.pct > 94 ? '#FF5722' : '#CBD5E1', borderRadius: '8px 8px 0 0' }}></div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{item.day}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#FF5722' }}></span> Asosiy faol kunlar
                  </div>
                  <div>🟢 Eng yuqori davomat: Payshanba (97%)</div>
                </div>
              </div>

              {/* Sinflar Bo'yicha Jonli Holat */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Sinflar Bo'yicha Jonli Holat</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Ayni paytdagi darslar va skaner faolligi</div>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10B981', fontWeight: 700 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }}></span> Faol
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                      <span>9-A sinf (Matematika) • 302-xona</span>
                      <span style={{ color: '#FF5722' }}>96%</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 10, margin: '6px 0', overflow: 'hidden' }}>
                      <div style={{ width: '96%', height: '100%', backgroundColor: '#FF5722' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B' }}>
                      <span>Keldi: 29</span><span>Jami: 30</span>
                    </div>
                  </div>

                  <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                      <span>10-B sinf (Informatika) • 105-lab</span>
                      <span style={{ color: '#FF5722' }}>92%</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 10, margin: '6px 0', overflow: 'hidden' }}>
                      <div style={{ width: '92%', height: '100%', backgroundColor: '#FF5722' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B' }}>
                      <span>Keldi: 24</span><span>Jami: 26</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Oxirgi Davomat va QR Skaner Hodisalari Jadvali */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>Oxirgi Davomat va QR Skaner Hodisalari</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Dinamik QR-kod orqali tasdiqlangan so'nggi o'quvchilar</div>
                </div>
                <button onClick={() => setActiveTab('attendance')} style={{ padding: '6px 12px', background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  Barchasini ko'rish →
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B' }}>
                    <th style={{ padding: '10px 14px' }}>O'quvchi</th>
                    <th style={{ padding: '10px 14px' }}>Hujjat / Pasport</th>
                    <th style={{ padding: '10px 14px' }}>Sinf / Fan</th>
                    <th style={{ padding: '10px 14px' }}>Vaqti</th>
                    <th style={{ padding: '10px 14px' }}>Metod</th>
                    <th style={{ padding: '10px 14px' }}>Telegram Holati</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>Aliyev Vali</td>
                    <td style={{ padding: '12px 14px' }}><code>AA 1234567</code></td>
                    <td style={{ padding: '12px 14px' }}>9-A • Matematika</td>
                    <td style={{ padding: '12px 14px', color: '#64748B' }}>08:31:14</td>
                    <td style={{ padding: '12px 14px' }}><span style={{ padding: '3px 8px', backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: 6, fontWeight: 700, fontSize: 11 }}>Dinamik QR (20s)</span></td>
                    <td style={{ padding: '12px 14px', color: '#10B981', fontWeight: 700 }}>Yetkazildi ✅</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>Karimova Zilola</td>
                    <td style={{ padding: '12px 14px' }}><code>AA 7654321</code></td>
                    <td style={{ padding: '12px 14px' }}>9-A • Matematika</td>
                    <td style={{ padding: '12px 14px', color: '#64748B' }}>08:32:05</td>
                    <td style={{ padding: '12px 14px' }}><span style={{ padding: '3px 8px', backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: 6, fontWeight: 700, fontSize: 11 }}>Dinamik QR (20s)</span></td>
                    <td style={{ padding: '12px 14px', color: '#10B981', fontWeight: 700 }}>Yetkazildi ✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: JONLI DAVOMAT & DARSLAR */}
        {activeTab === 'attendance' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Maktabning Bugungi Darslar Jadvali</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B' }}>
                  <th style={{ padding: '12px 14px' }}>Fan</th>
                  <th style={{ padding: '12px 14px' }}>Sinf</th>
                  <th style={{ padding: '12px 14px' }}>Ustoz</th>
                  <th style={{ padding: '12px 14px' }}>Xona</th>
                  <th style={{ padding: '12px 14px' }}>Vaqti</th>
                  <th style={{ padding: '12px 14px' }}>Holat</th>
                </tr>
              </thead>
              <tbody>
                {school.lessons.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '14px', fontWeight: 700 }}>{l.subject}</td>
                    <td style={{ padding: '14px' }}>{l.class}</td>
                    <td style={{ padding: '14px' }}>{l.teacher}</td>
                    <td style={{ padding: '14px' }}>{l.room}</td>
                    <td style={{ padding: '14px' }}>{l.time}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: 11, backgroundColor: l.status === 'ACTIVE' ? '#ECFDF5' : '#F1F5F9', color: l.status === 'ACTIVE' ? '#10B981' : '#64748B' }}>
                        {l.status === 'ACTIVE' ? "Boshlangan" : "Kutilmoqda"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: O'QUVCHILAR BAZASI */}
        {activeTab === 'students' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>{school.name} O'quvchilari</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 10, width: 240 }}>
                <Search size={15} color="#94A3B8" />
                <input placeholder="Qidirish (Ism/Pasport)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: 12 }} />
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B' }}>
                  <th style={{ padding: '12px 14px' }}>Ism-Familiya</th>
                  <th style={{ padding: '12px 14px' }}>Sinf</th>
                  <th style={{ padding: '12px 14px' }}>Pasport Seriya</th>
                  <th style={{ padding: '12px 14px' }}>Boshlang'ich Parol</th>
                  <th style={{ padding: '12px 14px' }}>Biometrik Holat</th>
                </tr>
              </thead>
              <tbody>
                {school.students
                  .filter(st => st.name.toLowerCase().includes(searchTerm.toLowerCase()) || st.passport.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(st => (
                    <tr key={st.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '14px', fontWeight: 700 }}>{st.name}</td>
                      <td style={{ padding: '14px' }}><span style={{ padding: '3px 8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', borderRadius: 6, fontWeight: 700 }}>{st.class}</span></td>
                      <td style={{ padding: '14px' }}><code>{st.passport}</code></td>
                      <td style={{ padding: '14px' }}><span style={{ padding: '4px 10px', backgroundColor: '#F1F5F9', borderRadius: 8, fontWeight: 700 }}>{st.initialPwd}</span></td>
                      <td style={{ padding: '14px', color: '#10B981', fontWeight: 700 }}>Face ID Faol ✅</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: RUXSATLAR & PAROLLAR */}
        {activeTab === 'passwords' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>O'quvchilar Parolini Boshqarish (Admin-Ustoz)</h3>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>
              Sinf rahbarlari va ustozlarga parolni unutgan o'quvchilarga yangi vaqtinchalik parol berish vakolati.
            </p>
            <div style={{ padding: 18, backgroundColor: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Akmal Rahimov (Matematika & Fizika ustozi)</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Vakolat: O'quvchilar parolini yangilash huquqi berilgan</div>
              </div>
              <span style={{ padding: '4px 10px', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: 8, fontWeight: 800, fontSize: 12 }}>
                Faol Vakolat ✅
              </span>
            </div>
          </div>
        )}

        {/* TAB 5: TELEGRAM BOT */}
        {activeTab === 'telegram' && (
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>Ota-onalar Telegram Xabarnoma Monitoringi</h3>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>
              Maktab o'quvchilari davomatdan o'tgan zahoti va baho qo'yilganda yuboriladigan xabarlar
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ padding: 18, backgroundColor: '#F0FDF4', borderRadius: 14, border: '1px solid #BBF7D0' }}>
                <div style={{ fontWeight: 800, color: '#166534', marginBottom: 6 }}>✅ 4.1 Davomat Tasdiqlandi</div>
                <div style={{ backgroundColor: 'white', padding: 12, borderRadius: 10, fontSize: 12, lineHeight: 1.5 }}>
                  Farzandingiz <b>Aliyev Vali</b> 08:31 da Matematika darsiga yetib keldi va davomatdan o'tdi.
                </div>
              </div>
              <div style={{ padding: 18, backgroundColor: '#EFF6FF', borderRadius: 14, border: '1px solid #BFDBFE' }}>
                <div style={{ fontWeight: 800, color: '#1E40AF', marginBottom: 6 }}>📊 4.2 Baho Qo'yildi</div>
                <div style={{ backgroundColor: 'white', padding: 12, borderRadius: 10, fontSize: 12, lineHeight: 1.5 }}>
                  Farzandingiz <b>Aliyev Vali</b> Matematika fanidan bugun <b>5 (a'lo)</b> baho oldi.
                </div>
              </div>
            </div>
          </div>
        )}

      </main>


      {/* O'quvchi Qo'shish Modal */}
      {showAddStudentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ backgroundColor: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Yangi O'quvchi Qo'shish</div>
              <button onClick={() => setShowAddStudentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required placeholder="Familiya" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }} />
              <input required placeholder="Ism" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }} />
              <input required placeholder="Pasport / Metrika (AA 1234567)" value={newStudent.passport} onChange={e => setNewStudent({...newStudent, passport: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #CBD5E1' }} />
              <button type="submit" style={{ padding: 12, backgroundColor: '#6366F1', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, marginTop: 10, cursor: 'pointer' }}>O'quvchini Saqlash</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Naviqatsiya tugmalari
function SuperNavButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: 12,
        border: 'none',
        backgroundColor: active ? '#FF5722' : 'transparent',
        color: active ? '#FFFFFF' : '#94A3B8',
        fontWeight: active ? 800 : 500,
        fontSize: 13,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon}
        <span>{label}</span>
      </div>
      {badge && <span style={{ fontSize: 10, padding: '2px 6px', backgroundColor: active ? '#00000033' : '#10B981', color: 'white', borderRadius: 6, fontWeight: 800 }}>{badge}</span>}
    </button>
  );
}

function SchoolStatCard({ title, value, sub }) {
  return (
    <div style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 18, border: '1px solid #E2E8F0' }}>
      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#94A3B8' }}>{sub}</div>
    </div>
  );
}

function SuperKpiCard({ title, value, sub, icon, bg }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{title}</span>
        <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
}

