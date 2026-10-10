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
  
  // Real backend o'quvchilar va sinflar ro'yxati
  const [realStudents, setRealStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submittingStudent, setSubmittingStudent] = useState(false);

  // Yangi o'quvchi formasi (Ism, Familiya, Guruh/Sinf, Parol, 3x4 Rasm) - Pasport SHART EMAS
  const [newStudent, setNewStudent] = useState({ 
    firstName: '', 
    lastName: '', 
    classId: '', 
    password: '',
    photo: null, 
    photoPreview: null 
  });

  // Backenddan o'quvchilar va sinflarni yuklash
  const fetchStudentsAndClasses = async () => {
    setLoadingStudents(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/students/'),
        fetch('http://127.0.0.1:8000/api/classes/')
      ]);
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setRealStudents(studentsData);
      }
      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClassesList(classesData);
        if (classesData.length > 0 && !newStudent.classId) {
          setNewStudent(prev => ({ ...prev, classId: classesData[0].id }));
        }
      }
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  React.useEffect(() => {
    fetchStudentsAndClasses();
  }, []);

  if (!school) return <div style={{ padding: 40 }}>Maktab topilmadi!</div>;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewStudent({
        ...newStudent,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      });
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.firstName.trim() || !newStudent.lastName.trim()) {
      alert("Iltimos, o'quvchining ismi va familiyasini kiriting!");
      return;
    }

    setSubmittingStudent(true);
    try {
      const formData = new FormData();
      formData.append('first_name', newStudent.firstName.trim());
      formData.append('last_name', newStudent.lastName.trim());
      if (newStudent.classId) {
        formData.append('class_id', newStudent.classId);
      }
      if (newStudent.password && newStudent.password.trim()) {
        formData.append('password', newStudent.password.trim());
      }
      if (newStudent.photo) {
        formData.append('photo_3x4', newStudent.photo);
      }

      const res = await fetch('http://127.0.0.1:8000/api/students/', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "O'quvchini saqlashda xatolik yuz berdi");
      }

      const created = await res.json();
      setRealStudents([created, ...realStudents]);
      setShowAddStudentModal(false);
      setNewStudent({
        firstName: '',
        lastName: '',
        classId: classesList.length > 0 ? classesList[0].id : '',
        password: '',
        photo: null,
        photoPreview: null
      });
      alert(`✅ Yangi o'quvchi muvaffaqiyatli qo'shildi!\nKirish ID (5 xonali): ${created.student_id}\nParoli: ${created.initial_password}`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setSubmittingStudent(false);
    }
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
          <SuperNavButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={19} />} label="O'quvchilar" badge={`${realStudents.length}`} />
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
              {activeTab === 'students' && "O'quvchilar Bazasi"}
              {activeTab === 'passwords' && "Xavfsizlik, Rollar va Parollarni Tiklash"}
              {activeTab === 'telegram' && "Telegram Bot Integratsiyasi & Ota-onalar Xabarnomasi"}
            </h1>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
              {school.name} • Real vaqt rejimidagi avtomatlashtirilgan davomat statistikasi
            </p>
          </div>
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
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>O'quvchilar Ro'yxati</h3>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  Bazada jami {realStudents.length} nafar o'quvchi mavjud (Pasportsiz ro'yxatga olish tizimi)
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: '1px solid #CBD5E1', borderRadius: 12, width: 260, backgroundColor: '#F8FAFC' }}>
                  <Search size={16} color="#64748B" />
                  <input 
                    placeholder="Ism yoki familiya bo'yicha qidirish..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13 }} 
                  />
                </div>
                <button 
                  onClick={fetchStudentsAndClasses}
                  title="Yangilash"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid #CBD5E1', borderRadius: 12, background: '#FFFFFF', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <RefreshCw size={14} className={loadingStudents ? "animate-spin" : ""} /> Yangilash
                </button>
                <button 
                  onClick={() => {
                    if (classesList.length > 0 && !newStudent.classId) {
                      setNewStudent(prev => ({ ...prev, classId: classesList[0].id }));
                    }
                    setShowAddStudentModal(true);
                  }} 
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', backgroundColor: '#FF5722', color: 'white', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 87, 34, 0.25)' }}>
                  <Plus size={16} /> Yangi O'quvchi Qo'shish
                </button>
              </div>
            </div>

            {loadingStudents ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Yuklanmoqda...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                    <th style={{ padding: '12px 14px' }}>3x4 Foto</th>
                    <th style={{ padding: '12px 14px' }}>Familiya & Ism</th>
                    <th style={{ padding: '12px 14px' }}>Guruh / Sinf</th>
                    <th style={{ padding: '12px 14px' }}>Kirish ID (5 xonali)</th>
                    <th style={{ padding: '12px 14px' }}>Parol</th>
                    <th style={{ padding: '12px 14px' }}>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {realStudents
                    .filter(st => (st.full_name || `${st.last_name} ${st.first_name}`).toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(st => (
                      <tr key={st.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px' }}>
                          {st.photo_3x4 ? (
                            <img 
                              src={st.photo_3x4} 
                              alt={st.full_name} 
                              style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} 
                            />
                          ) : (
                            <div style={{ width: 44, height: 56, backgroundColor: '#E2E8F0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 10, fontWeight: 700, textAlign: 'center', padding: 2 }}>
                              Foto Yo'q
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px', fontWeight: 800, color: '#0F172A', fontSize: 14 }}>
                          {st.last_name} {st.first_name}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ padding: '5px 12px', backgroundColor: '#EFF6FF', color: '#1D4ED8', borderRadius: 8, fontWeight: 800, fontSize: 12 }}>
                            {st.class_name || 'Guruhsiz'}
                          </span>
                        </td>
                        <td style={{ padding: '14px', color: '#475569', fontFamily: 'monospace', fontWeight: 700 }}>
                          <code>{st.student_id || `STU-${st.id}`}</code>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ padding: '4px 10px', backgroundColor: '#F1F5F9', borderRadius: 8, fontWeight: 700, fontFamily: 'monospace' }}>
                            {st.initial_password || 'pass123'}
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: 8, fontWeight: 700, fontSize: 11 }}>
                            Faol ✅
                          </span>
                        </td>
                      </tr>
                    ))}
                  {realStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                        Hozircha o'quvchilar mavjud emas. "Yangi O'quvchi Qo'shish" tugmasini bosing.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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
      {/* O'quvchi Qo'shish Modal (Ism, Familiya, Guruh/Sinf Select, 3x4 Rasm yuklash - Pasport shart emas) */}
      {showAddStudentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ backgroundColor: 'white', borderRadius: 24, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #F1F5F9', paddingBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#0F172A' }}>Yangi O'quvchi Qo'shish</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Guruhni tanlang va 3x4 rasmini yuklang</div>
              </div>
              <button 
                onClick={() => setShowAddStudentModal(false)} 
                style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Familiya */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Familiyasi <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  required 
                  placeholder="Masalan: Karimova" 
                  value={newStudent.lastName} 
                  onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} 
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, boxSizing: 'border-box' }} 
                />
              </div>

              {/* Ismi */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Ismi <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  required 
                  placeholder="Masalan: Madina" 
                  value={newStudent.firstName} 
                  onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} 
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, boxSizing: 'border-box' }} 
                />
              </div>

              {/* Guruhi (Sinf) Select */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Guruhi / Sinfi <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select 
                  required
                  value={newStudent.classId} 
                  onChange={e => setNewStudent({...newStudent, classId: e.target.value})}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, boxSizing: 'border-box', backgroundColor: '#FFF', fontWeight: 600 }}>
                  {classesList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.academic_year || 'Sinf'})
                    </option>
                  ))}
                  {classesList.length === 0 && (
                    <option value="">Guruhlar yuklanmoqda...</option>
                  )}
                </select>
              </div>

              {/* Kirish ID (5 xonali avtomatik unikal) va Parol */}
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: 12, borderRadius: 12, fontSize: 12, color: '#166534' }}>
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🔢 Kirish ID:</span> <span style={{ backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 900 }}>Tizim avtomatik 5 xonali unikal ID beradi</span>
                </div>
                <div style={{ fontSize: 11, marginTop: 4, color: '#15803D' }}>
                  O'quvchi mobil ilovaga kirishda mana shu 5 xonali ID raqamidan foydalanadi.
                </div>
              </div>

              {/* Parol kiritish */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                    O'quvchi Paroli
                  </label>
                  <span style={{ fontSize: 11, color: '#64748B' }}>Bo'sh qolsa, avto yaratiladi</span>
                </div>
                <input 
                  type="text"
                  placeholder="Masalan: 123456 yoki o'z xohishingizcha" 
                  value={newStudent.password} 
                  onChange={e => setNewStudent({...newStudent, password: e.target.value})} 
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, boxSizing: 'border-box' }} 
                />
              </div>

              {/* 3x4 Rasm yuklash */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  3x4 Rasmi <span style={{ color: '#64748B', fontWeight: 500 }}>(Tavsiya etiladi)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ 
                    width: 72, 
                    height: 96, 
                    borderRadius: 12, 
                    border: '2px dashed #CBD5E1', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden', 
                    backgroundColor: '#F8FAFC',
                    flexShrink: 0
                  }}>
                    {newStudent.photoPreview ? (
                      <img src={newStudent.photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', padding: 4 }}>3x4 rasm</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="student-photo-upload"
                      onChange={handlePhotoChange} 
                      style={{ display: 'none' }} 
                    />
                    <label 
                      htmlFor="student-photo-upload" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 6, 
                        padding: '9px 16px', 
                        borderRadius: 10, 
                        backgroundColor: '#F1F5F9', 
                        border: '1px solid #CBD5E1', 
                        fontSize: 13, 
                        fontWeight: 700, 
                        color: '#334155', 
                        cursor: 'pointer' 
                      }}>
                      <Plus size={15} /> Rasm tanlash
                    </label>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                      JPG, PNG formatdagi 3x4 portret rasm
                    </div>
                  </div>
                </div>
              </div>

              {/* Saqlash tugmasi */}
              <button 
                type="submit" 
                disabled={submittingStudent}
                style={{ 
                  padding: '14px 0', 
                  backgroundColor: submittingStudent ? '#94A3B8' : '#FF5722', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 14, 
                  fontWeight: 800, 
                  fontSize: 15,
                  marginTop: 10, 
                  cursor: submittingStudent ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 87, 34, 0.3)'
                }}>
                {submittingStudent ? "Saqlanmoqda..." : "O'quvchini Saqlash"}
              </button>
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

