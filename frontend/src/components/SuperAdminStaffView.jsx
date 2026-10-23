import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Building, UserPlus, Search, Filter, CheckCircle2,
  AlertTriangle, Key, Edit, Trash2, Eye, MapPin, Phone, RefreshCw,
  Lock, Check, X, ShieldCheck, DoorOpen, Briefcase, Sliders,
  HelpCircle, ChevronRight, Layers, FileSpreadsheet, Sparkles
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

const AVAILABLE_PERMISSIONS = [
  { id: 'overview', label: "Global Analitika", desc: "Maktablar umumiy statistikasi va jonli grafiklar", icon: "📊" },
  { id: 'schools', label: "Maktablar Boshqaruvi", desc: "Maktablar ro'yxati, direktorlar va rekvizitlar monitoringi", icon: "🏫" },
  { id: 'schools_edit', label: "Maktab rekvizitlarini tahrirlash", desc: "Maktab login/paroli, rekvizitlari va sozlamalarini o'zgartirish", icon: "✏️" },
  { id: 'map', label: "Maktablar Xaritasi (GIS)", desc: "Interaktiv xaritada maktablar va koordinatalar", icon: "🗺️" },
  { id: 'billing', label: "Obuna va Moliya", desc: "Tarif rejalari, to'lovlar, qarz va tushumlar hisoboti", icon: "💳" },
  { id: 'server', label: "Server va Texnik Analitika", desc: "CPU, RAM, disk va tarmoq yuklamasi monitoringi", icon: "🖥️" },
  { id: 'config', label: "Tizim Sozlamalari (Super Admin)", desc: "QR vaqt, SMS shlyuz, brending va tizim parametrlari", icon: "⚙️" },
  { id: 'support', label: "Texnik Yordam", desc: "Maktablardan kelgan yordam murojaatlari bilan ishlash", icon: "🎧" },
  { id: 'export_reports', label: "Hisobotlarni eksport qilish", desc: "Excel va PDF hisobotlarni yuklab olish huquqi", icon: "📥" },
];

const ROLE_CONFIGS = {
  SUB_ADMIN: {
    label: "Operator / Yordamchi Admin",
    shortLabel: "Sub-Admin",
    desc: "Bosh boshqarma operatori. Faqat Super Admin tomonidan ruxsat berilgan modullarga kiradi. Belgilanmagan bo'limlar yopiq.",
    badgeBg: '#F3E8FF',
    badgeColor: '#7E22CE',
    icon: <Sliders size={15} color="#7E22CE" />,
  },
  REGIONAL_ANALYST: {
    label: "Hududiy Analitik / Tuman Nazoratchisi",
    shortLabel: "Tuman Nazoratchi",
    desc: "Tuman yoki viloyat maktablari ko'rsatkichlari, ta'lim sifati va davomat reytingini tahlil qiluvchi mas'ul.",
    badgeBg: '#FEF3C7',
    badgeColor: '#92400E',
    icon: <Briefcase size={15} color="#92400E" />,
  },
  BILLING_OPERATOR: {
    label: "Moliya & To'lovlar Nazoratchisi",
    shortLabel: "Moliya Admin",
    desc: "Maktablar obuna to'lovlari, tarif rejalari, qarzdorliklar va billing hisobotlarini nazorat qiluvchi operator.",
    badgeBg: '#DCFCE7',
    badgeColor: '#166534',
    icon: <CheckCircle2 size={15} color="#166534" />,
  },
  TECH_SUPPORT: {
    label: "Texnik Qo'llab-quvvatlash Operatori",
    shortLabel: "Texnik Yordam",
    desc: "Maktablardan kelgan texnik murojaatlar, savollar va xatoliklarni bartaraf etish operatori.",
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
    icon: <HelpCircle size={15} color="#1D4ED8" />,
  },
};

export default function SuperAdminStaffView({
  currentUser,
  schoolsList = [],
  onPreviewCabinet,
  showToast = () => {},
}) {
  const [staffList, setStaffList] = useState([]);
  const [stats, setStats] = useState({ total: 0, sub_admins: 0, inspectors: 0, mahalla: 0, district_admins: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    password: '',
    phone: '',
    role: 'SUB_ADMIN',
    position_title: '',
    district: 'Chilonzor tumani',
    mahalla_name: '',
    assigned_school_ids: ['1'],
    permissions: ['overview', 'schools', 'map', 'support'],
    is_active: true,
    notes: '',
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/staff/');
      if (res.ok) {
        const json = await res.json();
        setStaffList(json.staff || []);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.warn("Failed to load staff list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setForm({
      full_name: '',
      username: '',
      password: 'staff' + Math.floor(100 + Math.random() * 900),
      phone: '+998 90 ',
      role: 'SUB_ADMIN',
      position_title: 'Tizim operatori',
      district: 'Chilonzor tumani',
      mahalla_name: '',
      assigned_school_ids: schoolsList.length > 0 ? [String(schoolsList[0].id)] : ['1'],
      permissions: ['overview', 'schools', 'map', 'support'],
      is_active: true,
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setForm({
      full_name: staff.full_name || '',
      username: staff.username || '',
      password: staff.initial_password || '',
      phone: staff.phone || '',
      role: staff.role || 'SUB_ADMIN',
      position_title: staff.position_title || '',
      district: staff.district || 'Chilonzor tumani',
      mahalla_name: staff.mahalla_name || '',
      assigned_school_ids: staff.assigned_school_ids ? staff.assigned_school_ids.map(String) : [],
      permissions: staff.permissions || [],
      is_active: staff.is_active !== false,
      notes: staff.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingStaff
        ? `/api/superadmin/staff/${editingStaff.id}/update/`
        : '/api/superadmin/staff/create/';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const resData = await res.json();
      if (res.ok) {
        showToast(editingStaff ? "Xodim ma'lumotlari yangilandi!" : "Yangi xodim muvaffaqiyatli qo'shildi!");
        setModalOpen(false);
        fetchStaff();
      } else {
        showToast(resData.detail || "Saqlashda xatolik yuz berdi!");
      }
    } catch (err) {
      showToast("Server bilan bog'lanishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff) => {
    try {
      const res = await fetch(`/api/superadmin/staff/${staff.id}/update/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !staff.is_active }),
      });
      if (res.ok) {
        showToast(`"${staff.full_name}" holati o'zgartirildi`);
        fetchStaff();
      }
    } catch (_) {
      showToast("Xatolik yuz berdi");
    }
  };

  const handleDeleteStaff = async (staff) => {
    if (!window.confirm(`Haqiqatan ham "${staff.full_name}" xodimini o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/superadmin/staff/${staff.id}/delete/`, { method: 'POST' });
      if (res.ok) {
        showToast(`"${staff.full_name}" tizimdan o'chirildi`);
        fetchStaff();
      }
    } catch (_) {
      showToast("O'chirishda xatolik");
    }
  };

  // Filtrlash
  const filteredStaff = staffList.filter((s) => {
    const matchSearch =
      (s.full_name && s.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.username && s.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.phone && s.phone.includes(searchQuery)) ||
      (s.position_title && s.position_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.mahalla_name && s.mahalla_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchRole = roleFilter === 'ALL' || s.role === roleFilter;
    const matchDistrict = districtFilter === 'ALL' || s.district === districtFilter;

    return matchSearch && matchRole && matchDistrict;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Super Admin va Maktab Admin Mas'ullari Ajratilishi Banneri */}
      <div style={{
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.05)',
      }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          backgroundColor: '#DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1D4ED8',
          flexShrink: 0,
        }}>
          <Shield size={20} />
        </div>
        <div style={{ flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 1.5 }}>
          <b>Bosh Boshqarma (Super Admin) Xodimlari & Kirish Huquqlari:</b> Ushbu sahifada faqat Super Admin paneliga (Global Analitika, Maktablar, Moliya, Server va h.k.) kirish huquqiga ega bo'lgan platforma operatorlari va sub-adminlari boshqariladi.
          <span style={{ display: 'block', marginTop: 3, color: '#2563EB', fontSize: 12 }}>
            ℹ️ <b>Eslatma:</b> Maktablarga biriktirilgan Profilaktika inspektori (IIB/uchastkavoy), Mahalla raisi (MFY) va maktab psixologi o'sha maktab ma'muri (Maktab Admini) tomonidan o'z maktabining <b>«Profilaktika & Mas'ullar»</b> bo'limida yaratiladi.
          </span>
        </div>
      </div>

      {/* 1. TOP KPI SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: '16px 18px', border: `1px solid ${THEME.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textMuted }}>Jami Xodimlar</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={17} color={THEME.primary} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.textDark, marginTop: 6 }}>
            {stats.total || staffList.length} nafar
          </div>
          <div style={{ fontSize: 11, color: THEME.green, fontWeight: 600, marginTop: 3 }}>
            ✓ {stats.active || staffList.length} nafari faol holatda
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: '16px 18px', border: `1px solid ${THEME.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textMuted }}>Sub-Admin / Operatorlar</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={17} color="#7E22CE" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#7E22CE', marginTop: 6 }}>
            {stats.sub_admins || staffList.filter(s => s.role === 'SUB_ADMIN').length} nafar
          </div>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>
            Cheklangan ruxsatlar bilan
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: '16px 18px', border: `1px solid ${THEME.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textMuted }}>Hududiy Analitiklar</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={17} color="#92400E" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#92400E', marginTop: 6 }}>
            {stats.regional_analysts || staffList.filter(s => s.role === 'REGIONAL_ANALYST' || s.role === 'DISTRICT_ADMIN').length} nafar
          </div>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>
            Tuman & Viloyat monitoringi
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: '16px 18px', border: `1px solid ${THEME.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textMuted }}>Moliya & Texnik Yordam</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={17} color="#166534" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#166534', marginTop: 6 }}>
            {(stats.billing_operators || 0) + (stats.tech_support || 0)} nafar
          </div>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>
            Billing va Texnik operatorlar
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: '16px 18px', border: `1px solid ${THEME.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textMuted }}>Tuman XTB Nazorati</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={17} color="#92400E" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#92400E', marginTop: 6 }}>
            {stats.district_admins || staffList.filter(s => s.role === 'DISTRICT_ADMIN').length} nafar
          </div>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>
            RayONO tahlilchilari
          </div>
        </div>

      </div>

      {/* 2. TOOLBAR (SEARCH, ROLE PILLS, DISTRICT, ADD BUTTON) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: '16px 20px',
        border: `1px solid ${THEME.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1, minWidth: 300 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 360, minWidth: 200 }}>
            <Search size={15} color={THEME.textMuted} style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ism, login, lavozim, mahalla yoki telefon..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
                fontSize: 12.5,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 10, top: 9, background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted }}
              >
                ✕
              </button>
            )}
          </div>

          {/* District selector */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
              fontSize: 12.5,
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              color: THEME.textDark,
            }}
          >
            <option value="ALL">Barcha Tumanlar</option>
            <option value="Chilonzor tumani">Chilonzor tumani</option>
            <option value="Yunusobod tumani">Yunusobod tumani</option>
            <option value="Mirzo Ulug'bek tumani">Mirzo Ulug'bek tumani</option>
            <option value="Yashnobod tumani">Yashnobod tumani</option>
            <option value="Barcha tumanlar">Barcha tumanlar (Shahar)</option>
          </select>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchStaff}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
              backgroundColor: '#FFFFFF',
              color: THEME.textDark,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
            title="Ro'yxatni yangilash"
          >
            <RefreshCw size={14} className={loading ? 'spin-anim' : ''} /> Yangilash
          </button>

          <button
            onClick={openAddModal}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              background: THEME.gradient,
              color: '#FFFFFF',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
            }}
          >
            <UserPlus size={15} /> Yangi Xodim Qo'shish
          </button>
        </div>

      </div>

      {/* ROLE FILTER PILLS */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: `Barchasi (${staffList.length})` },
          { id: 'SUB_ADMIN', label: `Sub-Adminlar (${staffList.filter(s => s.role === 'SUB_ADMIN').length})` },
          { id: 'INSPECTOR', label: `IIB Inspektorlari (${staffList.filter(s => s.role === 'INSPECTOR').length})` },
          { id: 'MAHALLA', label: `Mahalla MFY (${staffList.filter(s => s.role === 'MAHALLA').length})` },
          { id: 'DISTRICT_ADMIN', label: `Tuman XTB (${staffList.filter(s => s.role === 'DISTRICT_ADMIN').length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setRoleFilter(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: roleFilter === tab.id ? `1px solid ${THEME.primary}` : `1px solid ${THEME.border}`,
              backgroundColor: roleFilter === tab.id ? THEME.primary : '#FFFFFF',
              color: roleFilter === tab.id ? '#FFFFFF' : THEME.textDark,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. STAFF TABLE */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        border: `1px solid ${THEME.border}`,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: `2px solid ${THEME.border}` }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>XODIM PROFILI</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>TIZIMDAGI ROLI</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>HUDUD VA MAKTABLAR</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>RUXSATLAR & HUQUQLAR</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>HOLATI</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5, textAlign: 'right' }}>BOSHQARUV</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: THEME.textMuted }}>
                    <Users size={36} color={THEME.textMuted} style={{ display: 'block', margin: '0 auto 8px auto', opacity: 0.5 }} />
                    Hech qanday xodim topilmadi. "Yangi Xodim Qo'shish" tugmasi orqali yangi hisob yarating.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((st) => {
                  const roleConfig = ROLE_CONFIGS[st.role] || ROLE_CONFIGS.SUB_ADMIN;
                  const assignedSchools = schoolsList.filter(s => (st.assigned_school_ids || []).map(String).includes(String(s.id)));

                  return (
                    <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.border}`, transition: 'background-color 0.1s ease' }}>
                      
                      {/* Profile Column */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor: roleConfig.badgeBg,
                            color: roleConfig.badgeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 14,
                            flexShrink: 0,
                          }}>
                            {st.full_name ? st.full_name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {st.full_name}
                            </div>
                            <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 1 }}>
                              {st.position_title || roleConfig.label}
                            </div>
                            <div style={{ fontSize: 11, color: THEME.primary, fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>👤 login: <b>{st.username}</b></span>
                              <span>•</span>
                              <span>🔑 <b>{st.initial_password || '••••••••'}</b></span>
                              {st.phone && (
                                <>
                                  <span>•</span>
                                  <span>📞 {st.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          backgroundColor: roleConfig.badgeBg,
                          color: roleConfig.badgeColor,
                          fontSize: 11.5,
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                          {roleConfig.icon}
                          {roleConfig.shortLabel}
                        </span>
                      </td>

                      {/* Territory & Schools */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 12.5, color: THEME.textDark }}>
                          <MapPin size={13} color={THEME.primary} />
                          {st.district || "Chilonzor tumani"}
                        </div>
                        {st.mahalla_name && (
                          <div style={{ fontSize: 11.5, color: '#065F46', fontWeight: 600, marginTop: 2 }}>
                            Mahalla: {st.mahalla_name}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>
                          Biriktirilgan maktablar: <b>{assignedSchools.length > 0 ? `${assignedSchools.length} ta` : "Barcha maktablar"}</b>
                          {assignedSchools.length > 0 && (
                            <span style={{ color: THEME.primary, marginLeft: 4 }}>
                              ({assignedSchools.map(s => s.name.split(' ')[0]).join(', ')})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Permissions Chips */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 280 }}>
                          {(st.permissions && st.permissions.length > 0 ? st.permissions : ['overview', 'schools']).map((permId) => {
                            const pObj = AVAILABLE_PERMISSIONS.find(p => p.id === permId);
                            return (
                              <span
                                key={permId}
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  backgroundColor: '#F1F5F9',
                                  color: '#334155',
                                  border: '1px solid #E2E8F0',
                                }}
                                title={pObj?.desc || permId}
                              >
                                {pObj ? pObj.label : permId}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleToggleStatus(st)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: st.is_active ? THEME.greenLight : THEME.redLight,
                            color: st.is_active ? THEME.green : THEME.red,
                            fontSize: 11,
                            fontWeight: 800,
                          }}>
                            {st.is_active ? '● FAOL' : 'BLOKLANGAN'}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          
                          {/* Ghost Login / Cabinet Preview */}
                          {onPreviewCabinet && (
                            <button
                              onClick={() => onPreviewCabinet(st)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: THEME.primaryLight,
                                color: THEME.primary,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                              title="Xodimning shaxsiy kabinetiga kirib ko'rish"
                            >
                              <DoorOpen size={13} /> Kabineti
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(st)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: `1px solid ${THEME.border}`,
                              backgroundColor: '#FFFFFF',
                              color: THEME.textDark,
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Xodim ma'lumotlari va ruxsatlarini tahrirlash"
                          >
                            <Edit size={13} /> Tahrirlash
                          </button>

                          <button
                            onClick={() => handleDeleteStaff(st)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: `1px solid ${THEME.border}`,
                              backgroundColor: '#FFFFFF',
                              color: THEME.red,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            title="O'chirish"
                          >
                            <Trash2 size={13} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. YANGI XODIM QO'SHISH / TAHRIRLASH MODALI */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 16,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 720,
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: 26,
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: THEME.textDark, margin: 0 }}>
                  {editingStaff ? "Xodim Ma'lumotlarini Tahrirlash" : "Yangi Xodim Qo'shish & Ruxsatlar Biriktirish"}
                </h3>
                <p style={{ fontSize: 12, color: THEME.textMuted, margin: '4px 0 0 0' }}>
                  Xodim roli, hududi, maktablari va ko'ra oladigan modullarini belgilang
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: THEME.textMuted }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* QADAM 1: ROLNI TANLASH */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 8 }}>
                  1. Tizimdagi Rolni Tanlang:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                  {Object.entries(ROLE_CONFIGS).map(([rKey, rCfg]) => {
                    const isSelected = form.role === rKey;
                    return (
                      <div
                        key={rKey}
                        onClick={() => setForm({ ...form, role: rKey })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          border: isSelected ? `2px solid ${THEME.primary}` : `1px solid ${THEME.border}`,
                          backgroundColor: isSelected ? THEME.primaryLight : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          backgroundColor: isSelected ? THEME.primary : rCfg.badgeBg,
                          color: isSelected ? '#FFFFFF' : rCfg.badgeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                        }}>
                          {rCfg.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? THEME.primaryDark : THEME.textDark }}>
                            {rCfg.label}
                          </div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2, lineHeight: 1.4 }}>
                            {rCfg.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QADAM 2: ASOSIY REKVIZITLAR */}
              <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 8 }}>
                  2. Asosiy Shaxsiy Rekvizitlar va Kirish Ma'lumotlari:
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginBottom: 4 }}>
                      To'liq Ism-Sharif:
                    </label>
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Masalan: Mirzayev Bobur Komilovich"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginBottom: 4 }}>
                      Lavozim / Unvon:
                    </label>
                    <input
                      type="text"
                      value={form.position_title}
                      onChange={(e) => setForm({ ...form, position_title: e.target.value })}
                      placeholder="Katta leytenant / MFY raisi / Operator"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginBottom: 4 }}>
                      Telefon Raqami:
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+998 90 123-45-67"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginBottom: 4 }}>
                      Tizimga Kirish Logini (Username):
                    </label>
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="inspektor_chilonzor"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginBottom: 4 }}>
                      Kirish Paroli:
                    </label>
                    <input
                      type="text"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="iib123"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* QADAM 3: HUDUD VA MAKTABLARNI BIRIKTIRISH */}
              <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 8 }}>
                  3. Hududiy Mas'uliyat va Biriktirilgan Maktablar:
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginBottom: 4 }}>Tuman:</label>
                    <select
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 13, backgroundColor: '#FFFFFF' }}
                    >
                      <option value="Chilonzor tumani">Chilonzor tumani</option>
                      <option value="Yunusobod tumani">Yunusobod tumani</option>
                      <option value="Mirzo Ulug'bek tumani">Mirzo Ulug'bek tumani</option>
                      <option value="Yashnobod tumani">Yashnobod tumani</option>
                      <option value="Barcha tumanlar">Barcha tumanlar (Shahar miqyosida)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginBottom: 4 }}>
                      Mahalla Nomi (IIB va Mahalla uchun):
                    </label>
                    <input
                      type="text"
                      value={form.mahalla_name}
                      onChange={(e) => setForm({ ...form, mahalla_name: e.target.value })}
                      placeholder="Masalan: Do'stlik MFY"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${THEME.border}`, fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginBottom: 6 }}>
                    Ushbu xodimga ko'rinadigan Maktablar (Biriktirilgan maktablar):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, maxHeight: 150, overflowY: 'auto', padding: 10, border: `1px solid ${THEME.border}`, borderRadius: 8, backgroundColor: '#F8FAFC' }}>
                    {schoolsList.map((sc) => {
                      const isChecked = form.assigned_school_ids.includes(String(sc.id));
                      return (
                        <label
                          key={sc.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '4px 6px',
                            borderRadius: 4,
                            backgroundColor: isChecked ? '#EFF6FF' : 'transparent',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const sId = String(sc.id);
                              if (e.target.checked) {
                                setForm({ ...form, assigned_school_ids: [...form.assigned_school_ids, sId] });
                              } else {
                                setForm({ ...form, assigned_school_ids: form.assigned_school_ids.filter(id => id !== sId) });
                              }
                            }}
                          />
                          <span>{sc.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* QADAM 4: HUQUQLAR VA RUXSATLAR MATRISASI */}
              <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                    4. Huquqlar va Ruxsatlar Matrisasi (Faqat ruxsat berilgan modullar ko'rinadi):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        permissions: form.permissions.length === AVAILABLE_PERMISSIONS.length
                          ? ['overview', 'schools']
                          : AVAILABLE_PERMISSIONS.map(p => p.id),
                      });
                    }}
                    style={{ background: 'none', border: 'none', color: THEME.primary, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {form.permissions.length === AVAILABLE_PERMISSIONS.length ? "Minimal qilish" : "Barchasini belgilash"}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = form.permissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => {
                          if (isChecked) {
                            setForm({ ...form, permissions: form.permissions.filter(p => p !== perm.id) });
                          } else {
                            setForm({ ...form, permissions: [...form.permissions, perm.id] });
                          }
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 6,
                          border: isChecked ? `1.5px solid ${THEME.primary}` : `1px solid ${THEME.border}`,
                          backgroundColor: isChecked ? THEME.primaryLight : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          style={{ cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>
                            {perm.icon} {perm.label}
                          </div>
                          <div style={{ fontSize: 10.5, color: THEME.textMuted }}>
                            {perm.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: `1px solid ${THEME.border}`, paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#FFFFFF',
                    color: THEME.textDark,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Bekor Qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 22px',
                    borderRadius: 8,
                    border: 'none',
                    background: THEME.gradient,
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
                  }}
                >
                  {submitting ? "Saqlanmoqda..." : (editingStaff ? "O'zgarishlarni Saqlash" : "Xodimni Yaratish")}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
