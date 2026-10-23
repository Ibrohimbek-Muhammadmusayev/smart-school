import React, { useState, useEffect } from 'react';
import {
  Shield, Building, UserPlus, Search, Filter, CheckCircle2,
  AlertTriangle, Key, Edit, Trash2, Eye, Phone, RefreshCw,
  Lock, Check, X, ShieldCheck, Briefcase, Brain, Users,
  Copy, ExternalLink, HelpCircle
} from 'lucide-react';

const THEME = {
  primary: '#6C5CE7',
  primaryDark: '#5845D8',
  primaryLight: '#F1F0FF',
  gradient: 'linear-gradient(135deg, #7C69EF 0%, #5845D8 100%)',
  bgSoft: '#F8F9FE',
  cardBg: '#FFFFFF',
  textDark: '#1E2038',
  textMuted: '#8A90A2',
  border: '#E2E8F0',
  red: '#EF4444',
  redLight: '#FEF2F2',
  green: '#10AC84',
  greenLight: '#E6F8F3',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  yellow: '#F59E0B',
  yellowLight: '#FFFBEB',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
};

const SCHOOL_ROLE_CONFIGS = {
  INSPECTOR: {
    label: "Profilaktika Inspektori (IIB / Uchastkavoy)",
    shortLabel: "IIB Inspektori",
    desc: "Voyaga yetmaganlar profilaktikasi noziri. Dars qoldiruvchi va xavf guruhidagi o'quvchilar bilan profilaktik tadbirlar olib boradi.",
    badgeBg: '#DBEAFE',
    badgeColor: '#1E40AF',
    icon: <Shield size={16} color="#1E40AF" />,
  },
  MAHALLA: {
    label: "Mahalla Fuqarolar Yig'ini (MFY / Yetakchi)",
    shortLabel: "Mahalla MFY",
    desc: "Maktab hududiga biriktirilgan mahalla raisi yoki yoshlar yetakchisi. Xonadonlarga tashrif va oilalar bilan ishlash mas'uli.",
    badgeBg: '#D1FAE5',
    badgeColor: '#065F46',
    icon: <Building size={16} color="#065F46" />,
  },
  PSYCHOLOGIST: {
    label: "Maktab Psixologi / Ijtimoiy Pedagog",
    shortLabel: "Maktab Psixologi",
    desc: "O'quvchilarning psixologik holati, xulq-atvori va ruhiy ko'makka muhtoj o'quvchilar bilan individual suhbatlar o'tkazadi.",
    badgeBg: '#F3E8FF',
    badgeColor: '#7E22CE',
    icon: <Brain size={16} color="#7E22CE" />,
  },
  GUARD: {
    label: "Maktab Hududiga Kirishni Tasdiqlovchi Xodim (Darvoza / Qorovul)",
    shortLabel: "Kirish Nazoratchisi",
    desc: "Maktab darvozasida Face ID yoki dinamik QR kod orqali o'quvchilar kirishini tasdiqlovchi mas'ul xodim.",
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    icon: <ShieldCheck size={16} color="#B45309" />,
  },
};

export default function SchoolStaffManagement({
  schoolId = '1',
  schoolName = "1-sonli Maktab",
  currentUser,
  onPreviewCabinet,
  showToast = () => {},
}) {
  const [staffList, setStaffList] = useState([]);
  const [stats, setStats] = useState({ total: 0, inspectors: 0, mahalla: 0, psychologists: 0, guards: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState({});

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    password: '',
    phone: '',
    role: 'INSPECTOR',
    position_title: '',
    mahalla_name: '',
    notes: '',
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/school/staff/?school_id=${encodeURIComponent(schoolId)}`);
      if (res.ok) {
        const json = await res.json();
        setStaffList(json.staff || []);
        if (json.stats) setStats(json.stats);
      } else {
        showToast("Xodimlar ro'yxatini yuklashda xatolik yuz berdi.");
      }
    } catch (err) {
      console.warn("Failed to load school staff list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [schoolId]);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    const randNum = Math.floor(100 + Math.random() * 900);
    setForm({
      full_name: '',
      username: `inspektor_${schoolId}_${randNum}`,
      password: `maktab${randNum}`,
      phone: '+998 ',
      role: 'INSPECTOR',
      position_title: "Profilaktika Katta Inspektori (IIB)",
      mahalla_name: '',
      notes: "Voyaga yetmaganlar profilaktikasi va davomat nazorati mas'uli",
    });
    setModalOpen(true);
  };

  const handleOpenAddGuard = () => {
    setEditingStaff(null);
    const randNum = Math.floor(100 + Math.random() * 900);
    setForm({
      full_name: '',
      username: `kirish_${schoolId}_${randNum}`,
      password: `maktab${randNum}`,
      phone: '+998 ',
      role: 'GUARD',
      position_title: "Maktab hududiga kirish nazoratchisi",
      mahalla_name: "Maktab darvozasi / Turniket",
      notes: "Maktab hududiga kiruvchi o'quvchilar shaxsini Face ID yoki QR kod orqali tasdiqlash mas'uli",
    });
    setModalOpen(true);
  };

  const handleRoleChange = (newRole) => {
    const randNum = Math.floor(100 + Math.random() * 900);
    let defaultUsername = `staff_${schoolId}_${randNum}`;
    let defaultTitle = "Maktab Mas'uli";

    if (newRole === 'INSPECTOR') {
      defaultUsername = `iib_${schoolId}_${randNum}`;
      defaultTitle = "Profilaktika Inspektori (IIB)";
    } else if (newRole === 'MAHALLA') {
      defaultUsername = `mfy_${schoolId}_${randNum}`;
      defaultTitle = "Mahalla MFY Yetakchisi";
    } else if (newRole === 'PSYCHOLOGIST') {
      defaultUsername = `psixolog_${schoolId}_${randNum}`;
      defaultTitle = "Maktab Amaliyotchi Psixologi";
    } else if (newRole === 'GUARD') {
      defaultUsername = `kirish_${schoolId}_${randNum}`;
      defaultTitle = "Maktab hududiga kirish nazoratchisi";
    }

    setForm(prev => ({
      ...prev,
      role: newRole,
      username: prev.username || defaultUsername,
      position_title: defaultTitle,
    }));
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setForm({
      full_name: staff.full_name || '',
      username: staff.username || '',
      password: staff.initial_password || '',
      phone: staff.phone || '',
      role: staff.role || 'INSPECTOR',
      position_title: staff.position_title || '',
      mahalla_name: staff.mahalla_name || '',
      notes: staff.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      showToast("Xodimning F.I.O. kiritilishi shart!");
      return;
    }
    if (!form.username.trim()) {
      showToast("Tizim logini kiritilishi shart!");
      return;
    }

    setSubmitting(true);
    try {
      let url = '/api/school/staff/';
      let method = 'POST';
      let bodyData = {
        ...form,
        school_id: String(schoolId),
      };

      if (editingStaff) {
        url = `/api/school/staff/${editingStaff.id}/update/`;
        method = 'POST';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(editingStaff ? "Xodim ma'lumotlari yangilandi!" : "Yangi xodim muvaffaqiyatli biriktirildi!");
        setModalOpen(false);
        fetchStaff();
      } else {
        showToast(resData.detail || "Saqlashda xatolik yuz berdi.");
      }
    } catch (err) {
      showToast("Server bilan ulanishda xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staff) => {
    if (!window.confirm(`Haqiqatan ham "${staff.full_name}" xodimini maktab tizimidan o'chirmoqchimisiz?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/school/staff/${staff.id}/delete/`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Xodim tizimdan o'chirildi.");
        fetchStaff();
      } else {
        showToast(data.detail || "O'chirishda xatolik yuz berdi.");
      }
    } catch (_) {
      showToast("Server bilan aloqada xatolik.");
    }
  };

  const handleToggleActive = async (staff) => {
    try {
      const nextState = !staff.is_active;
      const res = await fetch(`/api/school/staff/${staff.id}/update/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      });
      if (res.ok) {
        showToast(nextState ? "Xodim hisobi faollashtirildi!" : "Xodim hisobi vaqtincha bloklandi.");
        fetchStaff();
      }
    } catch (_) {}
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyCredentials = (staff) => {
    const text = `Idrok Edu Maktab Mas'ul Kabineti:\nMaktab: ${schoolName}\nLavozim: ${staff.position_title || staff.role}\nF.I.O.: ${staff.full_name}\nLogin: ${staff.username}\nParol: ${staff.initial_password || '(belgilangan parol)'}\nSayt: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    showToast("Login va parol nusxalandi!");
  };

  // Filtered List
  const filteredStaff = staffList.filter(s => {
    if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (s.full_name || '').toLowerCase().includes(q);
      const matchUser = (s.username || '').toLowerCase().includes(q);
      const matchMahalla = (s.mahalla_name || '').toLowerCase().includes(q);
      const matchTitle = (s.position_title || '').toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchMahalla && !matchTitle) return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '24px 28px', backgroundColor: THEME.bgSoft, minHeight: '100%' }}>
      {/* 1. Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: THEME.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: THEME.textDark, margin: 0 }}>
                Profilaktika va Hududiy Mas'ullar xodimlar
              </h2>
              <p style={{ fontSize: 13, color: THEME.textMuted, margin: 0 }}>
                {schoolName} • Profilaktika inspektori (IIB), Mahalla MFY, Kirish nazoratchisi (Qorovul) va Psixolog
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={fetchStaff}
            disabled={loading}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
              backgroundColor: '#FFFFFF',
              color: THEME.textDark,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Yangilash
          </button>

          <button
            onClick={handleOpenAddGuard}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: '1px solid #FCD34D',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(180, 83, 9, 0.12)',
            }}>
            <ShieldCheck size={16} color="#92400E" />
            + Kirishni Tasdiqlovchi Xodim Qo'shish
          </button>

          <button
            onClick={handleOpenAdd}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              background: THEME.gradient,
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(108, 92, 231, 0.35)',
            }}>
            <UserPlus size={16} />
            Yangi Mas'ul Biriktirish
          </button>
        </div>
      </div>

      {/* 2. Top Informative Note */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563EB',
          flexShrink: 0,
        }}>
          <Shield size={18} />
        </div>
        <div style={{ fontSize: 12.5, color: THEME.textDark, lineHeight: 1.5, flex: 1 }}>
          <b>Maktab hududiy mas'ullari va xodimlari:</b> Ushbu ro'yxatda maktab hududiga kirishni tasdiqlovchi xodim (Darvoza qorovuli/nazoratchisi), profilaktika inspektori (uchastkavoy), mahalla yetakchisi va psixolog faoliyat yuritadi. Kirish nazoratchisi darvozada o'quvchilar shaxsini Face ID yoki QR kod orqali tasdiqlaydi.
        </div>
      </div>

      {/* 3. Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>Jami Mas'ullar</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.textDark, marginTop: 4 }}>
              {stats.total || staffList.length}
            </div>
            <div style={{ fontSize: 11, color: THEME.green, fontWeight: 600, marginTop: 2 }}>
              {stats.active || staffList.filter(s => s.is_active).length} tasi faol
            </div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#F1F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.primary }}>
            <Users size={22} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>IIB Profilaktika</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>
              {stats.inspectors || staffList.filter(s => s.role === 'INSPECTOR').length}
            </div>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
              Uchastkavoy nozirlari
            </div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF' }}>
            <Shield size={22} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>Mahalla MFY</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#065F46', marginTop: 4 }}>
              {stats.mahalla || staffList.filter(s => s.role === 'MAHALLA').length}
            </div>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
              MFY raisi va yetakchilar
            </div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065F46' }}>
            <Building size={22} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>Maktab Psixologi</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#7E22CE', marginTop: 4 }}>
              {stats.psychologists || staffList.filter(s => s.role === 'PSYCHOLOGIST').length}
            </div>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
              Psixolog & Ijtimoiy xodim
            </div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E22CE' }}>
            <Brain size={22} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>Kirish Nazoratchisi</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#B45309', marginTop: 4 }}>
              {stats.guards || staffList.filter(s => s.role === 'GUARD').length}
            </div>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
              Darvoza & Qorovul
            </div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        border: `1px solid ${THEME.border}`,
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{
            position: 'relative',
            flex: 1,
          }}>
            <Search size={16} color={THEME.textMuted} style={{ position: 'absolute', left: 12, top: 10 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="F.I.O, login, mahalla yoki lavozim bo'yicha qidirish..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted }}>Rol bo'yicha:</span>
          {['ALL', 'INSPECTOR', 'MAHALLA', 'PSYCHOLOGIST', 'GUARD'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                border: roleFilter === r ? `1px solid ${THEME.primary}` : `1px solid ${THEME.border}`,
                backgroundColor: roleFilter === r ? THEME.primaryLight : '#FFFFFF',
                color: roleFilter === r ? THEME.primaryDark : THEME.textDark,
                cursor: 'pointer',
              }}>
              {r === 'ALL' ? "Barchasi" : (SCHOOL_ROLE_CONFIGS[r]?.shortLabel || r)}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Staff Table / Cards */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        border: `1px solid ${THEME.border}`,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: THEME.textMuted }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            Yuklanmoqda...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: THEME.textMuted }}>
            <ShieldCheck size={36} color={THEME.border} style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: THEME.textDark, marginBottom: 4 }}>
              Hozircha xodimlar mavjud emas
            </div>
            <div style={{ fontSize: 13 }}>
              {searchQuery ? "Qidiruv bo'yicha hech kim topilmadi." : "«Yangi Mas'ul Biriktirish» tugmasini bosib, maktabingiz profilaktika inspektori yoki mahalla vakilini qo'shing."}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: `1px solid ${THEME.border}` }}>
                  <th style={{ padding: '12px 16px', color: THEME.textMuted, fontWeight: 700 }}>XODIM (F.I.O)</th>
                  <th style={{ padding: '12px 16px', color: THEME.textMuted, fontWeight: 700 }}>ROLI & LAVOZIMI</th>
                  <th style={{ padding: '12px 16px', color: THEME.textMuted, fontWeight: 700 }}>MAHALLA / BO'LINMA</th>
                  <th style={{ padding: '12px 16px', color: THEME.textMuted, fontWeight: 700 }}>TELEFON</th>
                  <th style={{ padding: '12px 16px', color: THEME.textMuted, fontWeight: 700 }}>LOGIN & PAROL</th>
                  <th style={{ padding: '12px 16px', color: THEME.textMuted, fontWeight: 700 }}>HOLATI</th>
                  <th style={{ padding: '12px 16px', color: THEME.textMuted, fontWeight: 700, textAlign: 'right' }}>AMALLAR</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(staff => {
                  const cfg = SCHOOL_ROLE_CONFIGS[staff.role] || SCHOOL_ROLE_CONFIGS.INSPECTOR;
                  const isPwdShown = Boolean(showPasswordMap[staff.id]);

                  return (
                    <tr key={staff.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      {/* Name */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: THEME.textDark, fontSize: 13.5 }}>
                          {staff.full_name}
                        </div>
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                          ID: #{staff.id} • {staff.created_at}
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 9px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                          backgroundColor: cfg.badgeBg,
                          color: cfg.badgeColor,
                          marginBottom: 4,
                        }}>
                          {cfg.icon}
                          {cfg.shortLabel}
                        </span>
                        <div style={{ fontSize: 11.5, color: THEME.textDark, fontWeight: 600 }}>
                          {staff.position_title || cfg.label}
                        </div>
                      </td>

                      {/* Mahalla */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 12.5, color: THEME.textDark }}>
                          {staff.mahalla_name || "Maktab hududi"}
                        </div>
                        <div style={{ fontSize: 11, color: THEME.textMuted }}>
                          {staff.district || "Tuman bo'yicha"}
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <a href={`tel:${staff.phone}`} style={{ color: THEME.primaryDark, textDecoration: 'none', fontWeight: 600, fontSize: 12.5 }}>
                          {staff.phone || "—"}
                        </a>
                      </td>

                      {/* Login & Password */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: THEME.textMuted }}>Login:</span>
                          <code style={{ fontSize: 11.5, fontWeight: 700, backgroundColor: '#F1F5F9', padding: '1px 5px', borderRadius: 4 }}>
                            {staff.username}
                          </code>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: THEME.textMuted }}>Parol:</span>
                          <span style={{ fontSize: 11.5, fontFamily: 'monospace', fontWeight: 600 }}>
                            {isPwdShown ? (staff.initial_password || "••••••••") : "••••••••"}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(staff.id)}
                            title="Parolni ko'rsatish"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: THEME.textMuted }}>
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => copyCredentials(staff)}
                            title="Login va paroldan nusxa olish"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: THEME.primary }}>
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>

                      {/* Active Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleToggleActive(staff)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: staff.is_active ? '#DCFCE7' : '#FEE2E2',
                            color: staff.is_active ? '#15803D' : '#B91C1C',
                          }}>
                          {staff.is_active ? "● Faol" : "○ Bloklangan"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {/* Preview Cabinet / Checkpoint Terminal */}
                          {typeof onPreviewCabinet === 'function' && (
                            <button
                              onClick={() => onPreviewCabinet(staff)}
                              title={staff.role === 'GUARD' ? "Kirish terminalini ochish (Face ID / QR Tekshirish)" : "Xodim kabinetini ko'rish (Test kirish)"}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 6,
                                border: staff.role === 'GUARD' ? '1px solid #F59E0B' : `1px solid ${THEME.primary}`,
                                backgroundColor: staff.role === 'GUARD' ? '#FEF3C7' : THEME.primaryLight,
                                color: staff.role === 'GUARD' ? '#92400E' : THEME.primaryDark,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}>
                              {staff.role === 'GUARD' ? <ShieldCheck size={13} color="#92400E" /> : <Eye size={13} />}
                              {staff.role === 'GUARD' ? "Kirish Terminali" : "Kabinet"}
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(staff)}
                            title="Tahrirlash"
                            style={{
                              padding: '6px',
                              borderRadius: 6,
                              border: `1px solid ${THEME.border}`,
                              backgroundColor: '#FFFFFF',
                              color: THEME.textDark,
                              cursor: 'pointer',
                            }}>
                            <Edit size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(staff)}
                            title="O'chirish"
                            style={{
                              padding: '6px',
                              borderRadius: 6,
                              border: `1px solid #FECACA`,
                              backgroundColor: '#FEF2F2',
                              color: THEME.red,
                              cursor: 'pointer',
                            }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Modal Dialog for Create/Edit */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: '100%',
            maxWidth: 540,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: `1px solid ${THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: THEME.gradient,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.textDark, margin: 0 }}>
                    {editingStaff ? "Xodim Ma'lumotlarini Tahrirlash" : "Maktabga Yangi Mas'ul Biriktirish"}
                  </h3>
                  <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0 }}>
                    {schoolName} uchun mas'ul xodim
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
              {/* Role Picker */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 6 }}>
                  Mas'ul Roli va Faoliyat Sohasi:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['INSPECTOR', 'MAHALLA', 'PSYCHOLOGIST', 'GUARD'].map(rKey => {
                    const rCfg = SCHOOL_ROLE_CONFIGS[rKey];
                    const isSelected = form.role === rKey;
                    return (
                      <div
                        key={rKey}
                        onClick={() => handleRoleChange(rKey)}
                        style={{
                          border: isSelected ? `2px solid ${THEME.primary}` : `1px solid ${THEME.border}`,
                          backgroundColor: isSelected ? THEME.primaryLight : '#FFFFFF',
                          borderRadius: 8,
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          backgroundColor: rCfg.badgeBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {rCfg.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                            {rCfg.shortLabel}
                          </div>
                          <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 1 }}>
                            {rKey === 'GUARD' ? "Face ID & QR Kirish" : rKey === 'INSPECTOR' ? "IIB Profilaktika" : rKey === 'MAHALLA' ? "MFY Yetakchisi" : "Psixologik ko'mak"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 5 }}>
                  F.I.O. (Ism, familiya va sharifi): *
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Masalan: Katta leytenant Mirzayev Bobur Komilovich"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 7,
                    border: `1px solid ${THEME.border}`,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Position Title & Mahalla Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 5 }}>
                    Rasmiy Lavozimi:
                  </label>
                  <input
                    type="text"
                    value={form.position_title}
                    onChange={(e) => setForm(prev => ({ ...prev, position_title: e.target.value }))}
                    placeholder="Masalan: Profilaktika Katta Inspektori"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 7,
                      border: `1px solid ${THEME.border}`,
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 5 }}>
                    Mahalla / Bo'linma Nomi:
                  </label>
                  <input
                    type="text"
                    value={form.mahalla_name}
                    onChange={(e) => setForm(prev => ({ ...prev, mahalla_name: e.target.value }))}
                    placeholder="Masalan: Do'stlik MFY"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 7,
                      border: `1px solid ${THEME.border}`,
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 5 }}>
                  Telefon Raqami:
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+998 90 123-45-67"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 7,
                    border: `1px solid ${THEME.border}`,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Username & Password */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                padding: '12px 14px',
                border: `1px solid ${THEME.border}`,
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Key size={14} color={THEME.primary} />
                  Tizimga Kirish Ma'lumotlari (Login & Parol)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: THEME.textMuted, marginBottom: 4 }}>
                      Login (username): *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: 6,
                        border: `1px solid ${THEME.border}`,
                        fontSize: 12.5,
                        fontFamily: 'monospace',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: THEME.textMuted, marginBottom: 4 }}>
                      Parol: *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.password}
                      onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: 6,
                        border: `1px solid ${THEME.border}`,
                        fontSize: 12.5,
                        fontFamily: 'monospace',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6 }}>
                  ℹ️ Ushbu login va parol orqali xodim Idrok Edu tizimiga kirib, faqat ushbu maktab davomatini ko'radi.
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 5 }}>
                  Qo'shimcha Izoh:
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Xizmat hududi yoki qo'shimcha topshiriqlar..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 7,
                    border: `1px solid ${THEME.border}`,
                    fontSize: 12.5,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 7,
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#FFFFFF',
                    color: THEME.textDark,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 7,
                    border: 'none',
                    background: THEME.gradient,
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
                  }}>
                  {submitting ? "Saqlanmoqda..." : (editingStaff ? "O'zgarishlarni Saqlash" : "Mas'ulni Biriktirish")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
