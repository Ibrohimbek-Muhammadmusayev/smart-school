import React, { useState, useEffect } from 'react';
import { 
  Building2, Shield, Users, CheckCircle2, AlertTriangle, 
  Search, Plus, RefreshCw, Key, Send, TrendingUp, 
  BarChart3, Activity, ChevronRight, Filter, Download, 
  ArrowUpRight, ArrowDownRight, School, Bell, Menu, X, 
  Power, Lock, Unlock, Eye, MapPin, Phone, Mail, Award,
  Sliders, Layers, Server, Database, LogOut, UserPlus, BookOpen,
  Calendar, CheckCircle, UserX, QrCode, GraduationCap, Clock,
  FolderOpen, EyeOff, Sparkles, Smartphone, ChevronDown, Check
} from 'lucide-react';

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

export default function App() {
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

  const handleLogout = () => {
    sessionStorage.removeItem('smart_auth_session');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={saveSession} />;
  }

  if (currentUser.role === 'TEACHER') {
    return <TeacherDashboardView currentUser={currentUser} handleLogout={handleLogout} />;
  }

  return <SchoolAdminDashboardView currentUser={currentUser} handleLogout={handleLogout} />;
}

// =========================================================================
// 1. UNIVERSAL LOGIN SAHIFASI (EASY LEARN PURPLE THEME)
// =========================================================================
function LoginPage({ onLoginSuccess }) {
  const [loginForm, setLoginForm] = useState({ username: 'maktab1', password: 'school123' });
  const [loginError, setLoginError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError(null);
    const { username, password } = loginForm;

    // Maktab Admini
    if (username === 'maktab1' && password === 'school123') {
      onLoginSuccess({
        role: 'SCHOOL_ADMIN',
        username: 'maktab1',
        name: 'Rahimov Jamshid (Direktor)',
        schoolName: '1-sonli Ixtisoslashtirilgan Maktab-Kollej',
      });
      return;
    }

    // O'qituvchi / Ustoz Dashbordi
    if (username === 'teacher' && password === 'teacher123') {
      onLoginSuccess({
        role: 'TEACHER',
        username: 'teacher',
        name: 'Akmal Rahimov (Matematika & IT)',
        assignedGroup: '9-A',
        subject: 'Oliy Matematika',
      });
      return;
    }

    setLoginError("Login yoki parol noto'g'ri! Sinov uchun: 'maktab1' / 'school123' yoki 'teacher' / 'teacher123'");
  };

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: THEME.bgSoft, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 36, boxShadow: '0 20px 40px -15px rgba(108, 92, 231, 0.15)', border: `1px solid ${THEME.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, borderRadius: 22, background: THEME.gradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 10px 24px rgba(108, 92, 231, 0.35)' }}>
            <School size={34} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: THEME.textDark, margin: 0 }}>Smart School</h2>
          <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: 6 }}>Ta'lim va Davomat Boshqaruv Markazi</p>
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
              placeholder="maktab1 yoki teacher"
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

        <div style={{ marginTop: 24, padding: 14, backgroundColor: THEME.primaryLight, borderRadius: 18, fontSize: 12, color: THEME.primary }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Tezkor Kirish Hisoblari:</div>
          <div>🏫 <b>Maktab Boshqaruvi:</b> <code>maktab1</code> / <code>school123</code></div>
          <div>👨‍🏫 <b>O'qituvchi Kabineti:</b> <code>teacher</code> / <code>teacher123</code></div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. MAKTAB ADMINI DASHBORDI (YANGI ARCHITEKTURA, BARCHA SAHIFALAR BILAN)
// =========================================================================
function SchoolAdminDashboardView({ currentUser, handleLogout }) {
  const [activeTab, setActiveTabState] = useState(() => {
    return sessionStorage.getItem('school_active_tab') || 'matrix';
  });

  const setActiveTab = (tab) => {
    sessionStorage.setItem('school_active_tab', tab);
    setActiveTabState(tab);
  };

  const [realStudents, setRealStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Yangi o'quvchi formasi
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    classId: '',
    password: '',
    photo: null,
    photoPreview: null
  });

  const fetchBackendData = async () => {
    setLoading(true);
    try {
      const [stuRes, clsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/students/'),
        fetch('http://127.0.0.1:8000/api/classes/')
      ]);
      if (stuRes.ok) {
        const d = await stuRes.json();
        setRealStudents(d);
      }
      if (clsRes.ok) {
        const c = await clsRes.json();
        setClassesList(c);
        if (c.length > 0 && !newStudent.classId) {
          setNewStudent(prev => ({ ...prev, classId: c[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // O'quvchi bosilganda Guruhlar sahifasiga o'tib, shu o'quvchini ko'rsatish
  const handleOpenStudentInGroup = (student) => {
    setSelectedStudentForModal(student);
    if (student.class_name && student.class_name !== 'Guruhsiz') {
      setSelectedGroupFilter(student.class_name);
    }
    setActiveTab('groups');
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

      const res = await fetch('http://127.0.0.1:8000/api/students/', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) throw new Error("Qo'shishda xatolik");
      const created = await res.json();
      setRealStudents([created, ...realStudents]);
      setShowAddStudentModal(false);
      alert(`✅ Yangi o'quvchi qo'shildi!\nKirish ID (5 xonali): ${created.student_id}\nParoli: ${created.initial_password}`);
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: THEME.bgSoft, overflow: 'hidden' }}>
      
      {/* SIDEBAR (EASY LEARN PURPLE THEME) */}
      <aside style={{ width: 280, backgroundColor: '#FFFFFF', borderRight: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', padding: '24px 18px', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30, paddingLeft: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 16, background: THEME.gradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(108, 92, 231, 0.3)' }}>
            <School size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: THEME.textDark }}>Smart School</div>
            <div style={{ fontSize: 11, color: THEME.textMuted }}>Maktab Boshqaruvi</div>
          </div>
        </div>

        {/* Navigation Menus */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NavButton active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')} icon={<Calendar size={18} />} label="Dars Matritsasi" badge="Jonli" />
          <NavButton active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} icon={<FolderOpen size={18} />} label="Guruhlar & Sinflar" badge={`${classesList.length} ta`} />
          <NavButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={18} />} label="O'quvchilar" badge={`${realStudents.length} ta`} />
          <NavButton active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} icon={<GraduationCap size={18} />} label="O'qituvchilar" />
          <NavButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<CheckCircle2 size={18} />} label="Davomat Auditi" />
        </div>

        {/* Bottom Profile */}
        <div style={{ paddingTop: 16, borderTop: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: THEME.primaryLight, color: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14 }}>
              DR
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: THEME.textDark }}>Maktab Direktori</div>
              <div style={{ fontSize: 11, color: THEME.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: THEME.green }}></span> Baza ulangan
              </div>
            </div>
          </div>
          <button onClick={handleLogout} title="Chiqish" style={{ background: '#F8F9FE', border: 'none', color: '#EF4444', padding: 9, borderRadius: 12, cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Top Bar */}
        <header style={{ padding: '20px 32px', backgroundColor: '#FFFFFF', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: THEME.textDark, margin: 0 }}>
              {activeTab === 'matrix' && "Dars Matritsasi & Davomat Jadvali"}
              {activeTab === 'groups' && "Maktab Guruhlari & Ularning O'quvchilari"}
              {activeTab === 'students' && "Barcha O'quvchilar Bazasi (Face ID & 5 Xonali ID)"}
              {activeTab === 'teachers' && "Maktab O'qituvchilari Ro'yxati"}
              {activeTab === 'attendance' && "Bino va Sinflar Bo'yicha Davomat Auditi"}
            </h1>
            <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
              1-sonli Ixtisoslashtirilgan Maktab-Kollej • Real vaqt monitoringi
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={fetchBackendData} 
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', backgroundColor: '#FFFFFF', border: `1px solid ${THEME.border}`, borderRadius: 14, fontWeight: 700, fontSize: 13, color: THEME.textDark, cursor: 'pointer' }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Yangilash
            </button>
            <button 
              onClick={() => setShowAddStudentModal(true)} 
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)' }}>
              <Plus size={16} /> Yangi O'quvchi Qo'shish
            </button>
          </div>
        </header>

        {/* Tab Contents */}
        <div style={{ padding: 32, flex: 1 }}>
          
          {/* TAB 1: DARS MATRITSASI */}
          {activeTab === 'matrix' && (
            <AttendanceMatrixSection realStudents={realStudents} onSelectStudent={handleOpenStudentInGroup} />
          )}

          {/* TAB 2: GURUHLAR VA ULARNING O'QUVCHILARI */}
          {activeTab === 'groups' && (
            <GroupsManagementSection 
              classesList={classesList} 
              realStudents={realStudents}
              selectedFilter={selectedGroupFilter}
              onFilterChange={setSelectedGroupFilter}
              selectedStudentModal={selectedStudentForModal}
              onCloseStudentModal={() => setSelectedStudentForModal(null)}
              onSelectStudent={setSelectedStudentForModal}
            />
          )}

          {/* TAB 3: O'QUVCHILAR RO'YXATI */}
          {activeTab === 'students' && (
            <StudentsListSection 
              realStudents={realStudents} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              onStudentClick={handleOpenStudentInGroup} 
            />
          )}

          {/* TAB 4: O'QITUVCHILAR */}
          {activeTab === 'teachers' && (
            <TeachersListSection />
          )}

          {/* TAB 5: DAVOMAT AUDITI */}
          {activeTab === 'attendance' && (
            <AttendanceAuditSection realStudents={realStudents} />
          )}

        </div>
      </main>

      {/* Yangi o'quvchi qo'shish modali */}
      {showAddStudentModal && (
        <AddStudentModal 
          newStudent={newStudent}
          setNewStudent={setNewStudent}
          classesList={classesList}
          onClose={() => setShowAddStudentModal(false)}
          onSubmit={handleAddStudent}
        />
      )}

      {/* O'quvchi Ma'lumotlari Modali (Guruhlar ichida bosilganda) */}
      {selectedStudentForModal && (
        <StudentDetailDrawer 
          student={selectedStudentForModal} 
          onClose={() => setSelectedStudentForModal(null)} 
        />
      )}
    </div>
  );
}

// =========================================================================
// 3. MATRITSA BO'YICHA DAVOMAT (DARS MATRITSASI)
// =========================================================================
function AttendanceMatrixSection({ realStudents, onSelectStudent }) {
  const days = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  const pairs = ["1-para (08:30)", "2-para (10:00)", "3-para (11:40)"];

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
      <div style={{ backgroundColor: '#FFFFFF', padding: 22, borderRadius: 24, border: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: THEME.textDark }}>Haftalik Dars Davomati Matritsasi</div>
          <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>Paralar va kunlar kesimidagi maktab o'quvchilari davomat paneli</div>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}` }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: THEME.textMuted, width: 220 }}>O'quvchi & Guruh</th>
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
            {realStudents.slice(0, 8).map((st, idx) => (
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
                      <div style={{ fontSize: 11, color: THEME.primary, fontWeight: 700 }}>{st.class_name || '9-A'} • ID: {st.student_id}</div>
                    </div>
                  </div>
                </td>

                {/* 6 Kun uchun 3 parali matritsa bloklari */}
                {days.map((d, dIdx) => {
                  const statusSample = (idx + dIdx) % 4;
                  return (
                    <td key={dIdx} style={{ padding: '10px 6px' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        {[1, 2, 3].map((pairNum) => {
                          const isAttend = (idx + pairNum) % 3 === 0 ? THEME.orange : (idx + pairNum) % 5 === 0 ? '#EF4444' : THEME.green;
                          return (
                            <div 
                              key={pairNum}
                              title={`${pairNum}-para`}
                              style={{ width: 18, height: 26, borderRadius: 6, backgroundColor: isAttend, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9.5, fontWeight: 'bold' }}>
                              {pairNum}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}

                <td style={{ padding: '14px 10px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 10, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 900, fontSize: 12 }}>
                    {90 + (idx % 8)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
// 4. GURUHLAR VA O'QUVCHILARINI KO'RISH SAHIFASI
// =========================================================================
function GroupsManagementSection({ classesList, realStudents, selectedFilter, onFilterChange, selectedStudentModal, onCloseStudentModal, onSelectStudent }) {
  const currentClass = selectedFilter === 'ALL' 
    ? (classesList[0] || { name: '9-A', id: 1 })
    : (classesList.find(c => c.name === selectedFilter) || classesList[0] || { name: selectedFilter });

  const filteredStudents = realStudents.filter(st => {
    if (selectedFilter === 'ALL') return true;
    return st.class_name === selectedFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Guruhlar Tanlagichi (Tabs/Cards) */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
        <button
          onClick={() => onFilterChange('ALL')}
          style={{
            padding: '12px 20px',
            borderRadius: 18,
            border: `1px solid ${selectedFilter === 'ALL' ? THEME.primary : THEME.border}`,
            background: selectedFilter === 'ALL' ? THEME.gradient : '#FFFFFF',
            color: selectedFilter === 'ALL' ? '#FFFFFF' : THEME.textDark,
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: selectedFilter === 'ALL' ? '0 8px 16px rgba(108, 92, 231, 0.25)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
          <FolderOpen size={16} /> Barcha Guruhlar ({realStudents.length})
        </button>

        {classesList.map(c => {
          const isSel = selectedFilter === c.name;
          const count = realStudents.filter(s => s.class_name === c.name).length;
          return (
            <button
              key={c.id}
              onClick={() => onFilterChange(c.name)}
              style={{
                padding: '12px 20px',
                borderRadius: 18,
                border: `1px solid ${isSel ? THEME.primary : THEME.border}`,
                background: isSel ? THEME.gradient : '#FFFFFF',
                color: isSel ? '#FFFFFF' : THEME.textDark,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: isSel ? '0 8px 16px rgba(108, 92, 231, 0.25)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
              <span>{c.name} sinf</span>
              <span style={{ padding: '2px 8px', borderRadius: 10, backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : THEME.primaryLight, color: isSel ? '#FFF' : THEME.primary, fontSize: 11 }}>
                {count} nafar
              </span>
            </button>
          );
        })}
      </div>

      {/* Guruh Tafsiloti va Unga Biriktirilgan O'quvchilar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: 26, borderRadius: 26, border: `1px solid ${THEME.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: THEME.textDark, margin: 0 }}>
              {selectedFilter === 'ALL' ? "Barcha O'quvchilar" : `${selectedFilter} Sinfi O'quvchilari Tarkibi`}
            </h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
              O'quvchi ustiga bosib uning 3x4 rasmi, 5 xonali Kirish IDsi, Face ID holati va davomatini ko'ring
            </p>
          </div>
          <span style={{ padding: '6px 14px', borderRadius: 12, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 800, fontSize: 12 }}>
            Jami: {filteredStudents.length} o'quvchi
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: THEME.textMuted }}>
            Ushbu guruhda hozircha o'quvchilar biriktirilmagan.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filteredStudents.map(st => (
              <div
                key={st.id}
                onClick={() => onSelectStudent(st)}
                style={{
                  padding: 16,
                  borderRadius: 20,
                  border: `1px solid ${THEME.border}`,
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = THEME.primary}
                onMouseLeave={e => e.currentTarget.style.borderColor = THEME.border}>
                
                {/* 3x4 Photo */}
                <div style={{ width: 48, height: 60, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F1F5F9', border: `1px solid ${THEME.border}`, flexShrink: 0 }}>
                  {st.photo_3x4 ? (
                    <img src={st.photo_3x4} alt={st.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.textMuted, fontSize: 10, fontWeight: 'bold' }}>
                      Foto
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: THEME.textDark, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {st.last_name} {st.first_name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ padding: '2px 7px', backgroundColor: THEME.primaryLight, color: THEME.primary, borderRadius: 6, fontWeight: 900, fontSize: 11, fontFamily: 'monospace' }}>
                      ID: {st.student_id}
                    </span>
                    <span style={{ fontSize: 11, color: THEME.green, fontWeight: 700 }}>
                      Face ID ✅
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                    Parol: <code>{st.initial_password}</code>
                  </div>
                </div>

                <ChevronRight size={18} color={THEME.textMuted} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 5. O'QUVCHI MA'LUMOTLARI DRAWER/MODAL (3x4 RASMI, DAVOMAT VA REKVIZITLARI)
// =========================================================================
function StudentDetailDrawer({ student, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: 20 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>O'quvchi Shaxsiy Kartasi</div>
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
              {student.class_name || '9-A sinf'} o'quvchisi
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span style={{ padding: '3px 8px', backgroundColor: '#ECFDF5', color: THEME.green, borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                Face ID faol ✅
              </span>
            </div>
          </div>
        </div>

        {/* Tafsilotlar jadvali */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <DetailRow label="Kirish ID (5 xonali)" value={student.student_id} isCode />
          <DetailRow label="Mobil Ilova Paroli" value={student.initial_password} isCode />
          <DetailRow label="Biriktirilgan Guruh" value={student.class_name || 'Guruhsiz'} />
          <DetailRow label="Bugungi Davomat Holati" value="Bino ichida (08:14 da qayd etilgan)" />
          <DetailRow label="Oylik Davomat Ko'rsatkichi" value="94.6% (Normada)" />
        </div>

        <button 
          onClick={onClose} 
          style={{ width: '100%', padding: 14, background: THEME.gradient, color: 'white', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
          Tushunarli / Yopish
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isCode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 14 }}>
      <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>{label}:</span>
      {isCode ? (
        <code style={{ fontSize: 13, fontWeight: 800, color: THEME.primary, backgroundColor: THEME.primaryLight, padding: '2px 8px', borderRadius: 6 }}>
          {value}
        </code>
      ) : (
        <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textDark }}>{value}</span>
      )}
    </div>
  );
}

// =========================================================================
// 6. O'QUVCHILAR RO'YXATI SAHIFASI
// =========================================================================
function StudentsListSection({ realStudents, searchTerm, setSearchTerm, onStudentClick }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: 26, borderRadius: 26, border: `1px solid ${THEME.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: THEME.textDark, margin: 0 }}>O'quvchilar Ro'yxati</h3>
          <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
            Bazada jami {realStudents.length} nafar o'quvchi ro'yxatga olingan
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: `1px solid ${THEME.border}`, borderRadius: 14, width: 280, backgroundColor: THEME.bgSoft }}>
          <Search size={16} color={THEME.textMuted} />
          <input 
            placeholder="Ism, familiya yoki 5 xonali ID..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13 }} 
          />
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted, textTransform: 'uppercase', fontSize: 11 }}>
            <th style={{ padding: '12px 14px' }}>3x4 Foto</th>
            <th style={{ padding: '12px 14px' }}>Familiya & Ism</th>
            <th style={{ padding: '12px 14px' }}>Guruh / Sinf</th>
            <th style={{ padding: '12px 14px' }}>Kirish ID (5 xonali)</th>
            <th style={{ padding: '12px 14px' }}>Parol</th>
            <th style={{ padding: '12px 14px' }}>Holat</th>
            <th style={{ padding: '12px 14px' }}>Amal</th>
          </tr>
        </thead>
        <tbody>
          {realStudents
            .filter(st => {
              const full = `${st.last_name} ${st.first_name} ${st.student_id}`.toLowerCase();
              return full.includes(searchTerm.toLowerCase());
            })
            .map(st => (
              <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                <td style={{ padding: '12px 14px' }}>
                  {st.photo_3x4 ? (
                    <img src={st.photo_3x4} alt={st.full_name} style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 8, border: `1px solid ${THEME.border}` }} />
                  ) : (
                    <div style={{ width: 40, height: 50, backgroundColor: '#E2E8F0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 10, fontWeight: 700 }}>
                      Foto
                    </div>
                  )}
                </td>
                <td style={{ padding: '14px', fontWeight: 800, color: THEME.textDark }}>
                  {st.last_name} {st.first_name}
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: THEME.primaryLight, color: THEME.primary, borderRadius: 8, fontWeight: 800, fontSize: 11.5 }}>
                    {st.class_name || 'Guruhsiz'}
                  </span>
                </td>
                <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 800, color: THEME.primary }}>
                  <code>{st.student_id}</code>
                </td>
                <td style={{ padding: '14px' }}>
                  <code style={{ padding: '3px 8px', backgroundColor: '#F1F5F9', borderRadius: 6, fontSize: 12 }}>{st.initial_password}</code>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{ padding: '4px 8px', backgroundColor: '#ECFDF5', color: THEME.green, borderRadius: 8, fontWeight: 700, fontSize: 11 }}>
                    Faol ✅
                  </span>
                </td>
                <td style={{ padding: '14px' }}>
                  <button 
                    onClick={() => onStudentClick(st)}
                    style={{ padding: '6px 12px', background: THEME.primaryLight, border: 'none', color: THEME.primary, borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: 12 }}>
                    Batafsil →
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// =========================================================================
// 7. O'QITUVCHILAR RO'YXATI SAHIFASI
// =========================================================================
function TeachersListSection() {
  const teachers = [
    { id: 1, name: "Akmal Rahimov", subject: "Oliy Matematika", phone: "+998 90 123-45-67", group: "9-A sinf rahbari", rooms: "302-auditoriya" },
    { id: 2, name: "Jasur Saidov", subject: "Fizika & Elektrodinamika", phone: "+998 91 234-56-78", group: "9-B sinf rahbari", rooms: "204-lab" },
    { id: 3, name: "Bobur Mirzayev", subject: "Informatika & Python", phone: "+998 93 345-67-89", group: "10-A sinf rahbari", rooms: "105-kompyuter zali" },
    { id: 4, name: "Nilufar Xoliqova", subject: "Ingliz tili (IELTS)", phone: "+998 97 456-78-90", group: "10-B sinf rahbari", rooms: "210-xona" },
  ];

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: 26, borderRadius: 26, border: `1px solid ${THEME.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: THEME.textDark, margin: 0 }}>O'qituvchilar Tarkibi</h3>
          <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
            Dars o'tuvchi va mobil kabinet orqali davomat oluvchi ustozlar
          </p>
        </div>
        <span style={{ padding: '6px 14px', borderRadius: 12, backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 800, fontSize: 12 }}>
          {teachers.length} nafar o'qituvchi
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {teachers.map(t => (
          <div key={t.id} style={{ padding: 20, borderRadius: 22, border: `1px solid ${THEME.border}`, backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: THEME.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16 }}>
                {t.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: THEME.textDark }}>{t.name}</div>
                <div style={{ fontSize: 12, color: THEME.primary, fontWeight: 700 }}>{t.subject}</div>
              </div>
            </div>

            <div style={{ padding: 12, backgroundColor: THEME.bgSoft, borderRadius: 14, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: THEME.textMuted }}>Biriktirilgan guruh:</span>
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
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: THEME.green, fontWeight: 700 }}>
              <Smartphone size={14} /> Mobil ilova orqali dars QR skanerlashga ulangan
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 8. DAVOMAT AUDITI SAHIFASI
// =========================================================================
function AttendanceAuditSection({ realStudents }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <KpiCard title="Bino Ichida" value="96.4%" sub="Turniketdan o'tganlar" color={THEME.green} />
        <KpiCard title="Bugungi Dars Qatnashuvi" value="94.2%" sub="Dars QR kod skanerlangan" color={THEME.primary} />
        <KpiCard title="Sababli Qoldirilgan" value="8 nafar" sub="Spravka arizasi tasdiqlangan" color={THEME.orange} />
        <KpiCard title="Sababsiz (NB)" value="4 nafar" sub="Ogohlantirish yuborildi" color="#EF4444" />
      </div>

      <div style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, border: `1px solid ${THEME.border}` }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>Turniket va Dars QR Davomat Loglari</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted }}>
              <th style={{ padding: '12px 14px' }}>O'quvchi</th>
              <th style={{ padding: '12px 14px' }}>Guruh</th>
              <th style={{ padding: '12px 14px' }}>Bino Kirishi</th>
              <th style={{ padding: '12px 14px' }}>Dars QR Skanerlash</th>
              <th style={{ padding: '12px 14px' }}>Ustoz</th>
              <th style={{ padding: '12px 14px' }}>Holat</th>
            </tr>
          </thead>
          <tbody>
            {realStudents.slice(0, 6).map((st, i) => (
              <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.bgSoft}` }}>
                <td style={{ padding: '14px', fontWeight: 800 }}>{st.last_name} {st.first_name}</td>
                <td style={{ padding: '14px' }}>{st.class_name || '9-A'}</td>
                <td style={{ padding: '14px', color: THEME.green, fontWeight: 700 }}>08:14:22 ✅</td>
                <td style={{ padding: '14px', color: THEME.primary, fontWeight: 700 }}>08:32:05 (Dinamik QR)</td>
                <td style={{ padding: '14px' }}>Akmal Rahimov</td>
                <td style={{ padding: '14px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 8, backgroundColor: '#ECFDF5', color: THEME.green, fontWeight: 700, fontSize: 11 }}>
                    Tasdiqlangan
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
// 9. O'QITUVCHI DASHBORDI (TEACHER VIEW)
// =========================================================================
function TeacherDashboardView({ currentUser, handleLogout }) {
  const [students, setStudents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('9-A');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/students/')
      .then(r => r.json())
      .then(d => setStudents(d))
      .catch(() => {});
  }, []);

  const groupStudents = students.filter(s => s.class_name === selectedGroup || !s.class_name);

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
            <div style={{ fontSize: 11, color: THEME.textMuted }}>O'qituvchi Boshqaruvi</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NavButton active={true} onClick={() => {}} icon={<FolderOpen size={18} />} label="Mening Guruhim" badge={selectedGroup} />
        </div>

        {/* Info box about mobile scanner */}
        <div style={{ padding: 16, backgroundColor: THEME.primaryLight, borderRadius: 20, marginBottom: 16, fontSize: 12 }}>
          <div style={{ fontWeight: 800, color: THEME.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Smartphone size={16} /> Mobil Davomat
          </div>
          <div style={{ color: THEME.textDark, marginTop: 4, lineHeight: 1.4 }}>
            Jonli dars davomatini olish uchun smartfoningizdagi <b>Smart School</b> mobil ilovasi orqali QR skanerdan foydalaning.
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
              {selectedGroup} Guruhi O'quvchilari va Jurnali
            </h1>
            <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
              O'quvchilar ro'yxati, baholar va davomat holatlari
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: 26, borderRadius: 26, border: `1px solid ${THEME.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${THEME.bgSoft}`, color: THEME.textMuted }}>
                <th style={{ padding: '12px 14px' }}>Foto</th>
                <th style={{ padding: '12px 14px' }}>F.I.Sh.</th>
                <th style={{ padding: '12px 14px' }}>Kirish ID</th>
                <th style={{ padding: '12px 14px' }}>Bugungi Dars Qatnashuvi</th>
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
function NavButton({ active, onClick, icon, label, badge }) {
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
          backgroundColor: active ? THEME.primary : '#F1F5F9', 
          color: active ? '#FFFFFF' : THEME.textMuted, 
          fontSize: 11, 
          fontWeight: 800 
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

function AddStudentModal({ newStudent, setNewStudent, classesList, onClose, onSubmit }) {
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
            <div style={{ fontWeight: 900, fontSize: 18, color: THEME.textDark }}>Yangi O'quvchi Qo'shish</div>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>Guruhni tanlang va 3x4 fotosuratni yuklang</div>
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
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>Guruh / Sinf *</label>
            <select
              value={newStudent.classId}
              onChange={e => setNewStudent({ ...newStudent, classId: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: `1px solid #CBD5E1`, marginTop: 6, boxSizing: 'border-box', fontSize: 13, backgroundColor: '#FFF' }}>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{c.name} sinf</option>
              ))}
            </select>
          </div>

          <div style={{ backgroundColor: THEME.primaryLight, padding: 12, borderRadius: 14, fontSize: 12, color: THEME.primary }}>
            <b>🔢 Kirish ID:</b> Tizim avtomatik 5 xonali unikal ID yaratadi.
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
            Saqlash va O'quvchini Yaratish
          </button>
        </form>
      </div>
    </div>
  );
}
