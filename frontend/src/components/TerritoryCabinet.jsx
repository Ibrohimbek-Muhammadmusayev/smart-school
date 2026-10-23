import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Phone, MapPin, School, AlertTriangle, CheckCircle,
  Clock, Search, Filter, Printer, Download, Plus, ArrowLeft, RefreshCw,
  LogOut, FileText, ChevronRight, UserCheck, MessageSquare, AlertCircle,
  Send, Eye, CheckSquare, Calendar, Building, Sparkles
} from 'lucide-react';

const THEME = {
  primary: '#4F46E5', // Indigo for law & community governance
  primaryDark: '#4338CA',
  primaryLight: '#EEF2FF',
  gradient: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
  iibGradient: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
  mfyGradient: 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
  xtbGradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
  bgSoft: '#F8FAFC',
  cardBg: '#FFFFFF',
  textDark: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  red: '#EF4444',
  redLight: '#FEF2F2',
  yellow: '#F59E0B',
  yellowLight: '#FFFBEB',
  green: '#10B981',
  greenLight: '#ECFDF5',
};

export default function TerritoryCabinet({
  currentUser,
  onLogout,
  onReturnToSuperAdmin,
  systemConfig,
}) {
  const [activeTab, setActiveTab] = useState('absentees');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modal: Profilaktika chorasini qayd etish
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState(null);
  const [actionType, setActionType] = useState('PARENT_CALL');
  const [actionDescription, setActionDescription] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Modal: Rasmiy Ogohlantirish Xati (Chop etish / Print preview)
  const [printDocStudent, setPrintDocStudent] = useState(null);

  const isInspector = currentUser?.role === 'INSPECTOR';
  const isMahalla = currentUser?.role === 'MAHALLA';
  const isDistrict = currentUser?.role === 'DISTRICT_ADMIN';

  const roleTitle = isInspector
    ? "Profilaktika Inspektori (IIB) Kabineti"
    : isMahalla
    ? "Mahalla Fuqarolar Yig'ini (MFY) Kabineti"
    : "Tuman XTB (RayONO) Nazoratchi Kabineti";

  const headerGradient = isInspector
    ? THEME.iibGradient
    : isMahalla
    ? THEME.mfyGradient
    : THEME.xtbGradient;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      const qParams = new URLSearchParams();
      if (currentUser?.username) qParams.append('username', currentUser.username);
      if (currentUser?.role) qParams.append('role', currentUser.role);
      if (currentUser?.district) qParams.append('district', currentUser.district);

      const res = await fetch(`/api/territory/dashboard/?${qParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        console.warn("Territory dashboard API returned status:", res.status);
      }
    } catch (err) {
      console.error("Failed to load territory dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  // Profilaktika chorasini saqlash
  const handleSaveAction = async (e) => {
    e.preventDefault();
    if (!targetStudent) return;
    setSubmittingAction(true);
    try {
      const payload = {
        student_id: targetStudent.id,
        student_name: targetStudent.full_name,
        school_id: targetStudent.school_id,
        school_name: targetStudent.school_name,
        class_name: targetStudent.class_name,
        action_type: actionType,
        description: actionDescription || "O'quvchining davomati bo'yicha profilaktik suhbat va o'rganish o'tkazildi.",
        officer_name: currentUser?.name || "Mas'ul xodim",
      };

      const res = await fetch('/api/territory/action/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("✅ Profilaktika chorasi muvaffaqiyatli saqlandi!");
        setActionModalOpen(false);
        setActionDescription('');
        setTargetStudent(null);
        loadDashboardData(); // Ro'yxatni yangilash
      } else {
        showToast("❌ Saqlashda xatolik yuz berdi");
      }
    } catch (err) {
      showToast("❌ Server bilan bog'lanishda xatolik");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Chop etish (Print)
  const handleTriggerPrint = () => {
    window.print();
  };

  const territoryInfo = data?.territory_info || {};
  const kpi = data?.kpi || {};
  const schools = data?.schools || [];
  const chronicAbsentees = data?.chronic_absentees || [];
  const turnstileEvents = data?.turnstile_events || [];
  const preventionActions = data?.prevention_actions || [];

  // Filtrlangan o'quvchilar
  const filteredStudents = chronicAbsentees.filter((st) => {
    const matchSearch =
      st.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.parent_phone && st.parent_phone.includes(searchQuery));

    const matchRisk =
      riskFilter === 'ALL' || st.risk_level === riskFilter;

    const matchSchool =
      schoolFilter === 'ALL' || String(st.school_id) === String(schoolFilter);

    return matchSearch && matchRisk && matchSchool;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: THEME.bgSoft, color: THEME.textDark, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          backgroundColor: '#1E293B',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {toastMessage}
        </div>
      )}

      {/* Super Admin Preview Banner */}
      {onReturnToSuperAdmin && (
        <div style={{
          backgroundColor: '#4338CA',
          color: '#FFFFFF',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>
              SUPER ADMIN PREVYU
            </span>
            <span>Siz ayni vaqtda <b>"{currentUser?.name}"</b> xodimining shaxsiy ishchi kabinetini ko'zdan kechirmoqdasiz.</span>
          </div>
          <button
            onClick={onReturnToSuperAdmin}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#4338CA',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft size={14} /> Super Admin Paneliga Qaytish
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <header style={{
        background: headerGradient,
        color: '#FFFFFF',
        padding: '24px 32px',
        boxShadow: '0 4px 20px -5px rgba(0,0,0,0.25)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              {isInspector ? <Shield size={30} color="#FFFFFF" /> : isMahalla ? <Building size={30} color="#FFFFFF" /> : <School size={30} color="#FFFFFF" />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}>
                  {isInspector ? "IIV Huquqbuzarliklar Profilaktikasi" : isMahalla ? "Mahalla Fuqarolar Yig'ini" : "Xalq Ta'limi Bo'limi"}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                  • {systemConfig?.project_name || "Idrok Edu"}
                </span>
              </div>

              <h1 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 2px 0', letterSpacing: '-0.3px' }}>
                {roleTitle}
              </h1>

              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span><b>Mas'ul:</b> {currentUser?.name || territoryInfo.officer_name} ({currentUser?.position_title || territoryInfo.position_title})</span>
                <span>•</span>
                <span><b>Hudud:</b> {currentUser?.district || territoryInfo.district} {currentUser?.mahalla_name ? `(${currentUser.mahalla_name})` : ''}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '9px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(6px)',
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin-anim' : ''} /> Yangilash
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.25)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <LogOut size={14} /> Chiqish
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>

        {/* STATS OVERVIEW CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
          
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: '18px 20px', border: `1px solid ${THEME.border}`, boxShadow: THEME.softShadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}>Biriktirilgan Maktablar</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <School size={18} color={THEME.primary} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: THEME.textDark, marginTop: 8 }}>
              {schools.length} ta
            </div>
            <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 4 }}>
              {currentUser?.district || "Chilonzor tumani"} hududida
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: '18px 20px', border: `1px solid ${THEME.border}`, boxShadow: THEME.softShadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}>Qamrab Olingan O'quvchilar</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color={THEME.green} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: THEME.green, marginTop: 8 }}>
              {kpi.total_students || 0} nafar
            </div>
            <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 4 }}>
              Bugun davomat: <b>{kpi.today_attendance_rate || 94.2}%</b>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: '18px 20px', border: `1px solid ${THEME.border}`, boxShadow: THEME.softShadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}>Surunkali Dars Qoldiruvchilar</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: THEME.redLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} color={THEME.red} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: THEME.red, marginTop: 8 }}>
              {kpi.chronic_absentees_count || 0} nafar
            </div>
            <div style={{ fontSize: 11.5, color: THEME.red, fontWeight: 600, marginTop: 4 }}>
              3+ kun sababsiz kelmaganlar (Xavf guruhi)
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: '18px 20px', border: `1px solid ${THEME.border}`, boxShadow: THEME.softShadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}>Chora Ko'rilgan Holatlar</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="#2563EB" />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#2563EB', marginTop: 8 }}>
              {preventionActions.length} ta
            </div>
            <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 4 }}>
              Dalolatnoma va suhbatlar
            </div>
          </div>

        </div>

        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', gap: 8, borderBottom: `2px solid ${THEME.border}`, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
          <button
            onClick={() => setActiveTab('absentees')}
            style={{
              padding: '12px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              color: activeTab === 'absentees' ? THEME.primary : THEME.textMuted,
              borderBottom: activeTab === 'absentees' ? `3px solid ${THEME.primary}` : '3px solid transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: -4,
            }}
          >
            <AlertTriangle size={16} color={activeTab === 'absentees' ? THEME.red : THEME.textMuted} />
            Xavf Guruhi & Sababsiz Kelmaganlar
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: 10,
              backgroundColor: activeTab === 'absentees' ? THEME.red : '#E2E8F0',
              color: activeTab === 'absentees' ? '#FFFFFF' : THEME.textDark,
            }}>
              {chronicAbsentees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('turnstile')}
            style={{
              padding: '12px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              color: activeTab === 'turnstile' ? THEME.primary : THEME.textMuted,
              borderBottom: activeTab === 'turnstile' ? `3px solid ${THEME.primary}` : '3px solid transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: -4,
            }}
          >
            <Clock size={16} />
            Bugungi Jonli Turniket Oqimi
            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 10, backgroundColor: '#E2E8F0', color: THEME.textDark }}>
              {turnstileEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schools')}
            style={{
              padding: '12px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              color: activeTab === 'schools' ? THEME.primary : THEME.textMuted,
              borderBottom: activeTab === 'schools' ? `3px solid ${THEME.primary}` : '3px solid transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: -4,
            }}
          >
            <School size={16} />
            Biriktirilgan Maktablar Pasporti ({schools.length})
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            style={{
              padding: '12px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              color: activeTab === 'actions' ? THEME.primary : THEME.textMuted,
              borderBottom: activeTab === 'actions' ? `3px solid ${THEME.primary}` : '3px solid transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: -4,
            }}
          >
            <FileText size={16} />
            Profilaktika Daftari ({preventionActions.length})
          </button>
        </div>

        {/* TAB 1: XAVF GURUHI & SURUNKALI DARS QOLDIRUVCHILAR */}
        {activeTab === 'absentees' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: `1px solid ${THEME.border}`, padding: 20, boxShadow: THEME.softShadow }}>
            
            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
                <div style={{
                  position: 'relative',
                  flex: 1,
                  maxWidth: 380,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Search size={16} color={THEME.textMuted} style={{ position: 'absolute', left: 12 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ism, sinf, maktab yoki telefon raqami..."
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 8,
                      border: `1px solid ${THEME.border}`,
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, fontSize: 13 }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 8,
                    border: `1px solid ${THEME.border}`,
                    fontSize: 13,
                    backgroundColor: '#FFFFFF',
                    color: THEME.textDark,
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">Barcha Xavf Darajalari</option>
                  <option value="HIGH">🔴 Surunkali Qoldiruvchilar (3+ kun)</option>
                  <option value="MEDIUM">🟡 Ogohlantirish Guruhi (1-2 kun)</option>
                </select>

                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 8,
                    border: `1px solid ${THEME.border}`,
                    fontSize: 13,
                    backgroundColor: '#FFFFFF',
                    color: THEME.textDark,
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">Barcha Biriktirilgan Maktablar</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleTriggerPrint}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 8,
                    border: `1px solid ${THEME.border}`,
                    backgroundColor: '#FFFFFF',
                    color: THEME.textDark,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Printer size={15} /> Hisobotni Chop Etish
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: `2px solid ${THEME.border}` }}>
                    <th style={{ padding: '12px 14px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>O'QUVCHI MA'LUMOTI</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>MAKTAB VA SINF</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>QOLDIRILGAN KUNLAR</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>OXIRGI TURNIKET</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>OTA-ONA & ALOQA</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5 }}>PROFILAKTIKA HOLATI</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, color: THEME.textMuted, fontSize: 11.5, textAlign: 'right' }}>AMALLAR</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: THEME.textMuted }}>
                        <CheckCircle size={36} color={THEME.green} style={{ display: 'block', margin: '0 auto 8px auto' }} />
                        Tanlangan mezon bo'yicha sababsiz dars qoldiruvchi o'quvchilar aniqlanmadi.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        
                        {/* Student Name */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: st.risk_level === 'HIGH' ? THEME.redLight : '#EFF6FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              color: st.risk_level === 'HIGH' ? THEME.red : '#2563EB',
                              fontSize: 13,
                              flexShrink: 0,
                              overflow: 'hidden',
                            }}>
                              {st.photo_3x4 ? (
                                <img src={st.photo_3x4} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                st.full_name.charAt(0)
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: THEME.textDark }}>{st.full_name}</div>
                              <div style={{ fontSize: 11, color: THEME.textMuted }}>Kod: {st.student_code}</div>
                            </div>
                          </div>
                        </td>

                        {/* School and Class */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600 }}>{st.class_name} sinf</div>
                          <div style={{ fontSize: 11.5, color: THEME.textMuted }}>{st.school_name}</div>
                        </td>

                        {/* Absent Days */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: 6,
                              backgroundColor: st.risk_level === 'HIGH' ? THEME.redLight : THEME.yellowLight,
                              color: st.risk_level === 'HIGH' ? THEME.red : '#B45309',
                              fontWeight: 800,
                              fontSize: 12,
                            }}>
                              {st.absent_count} kun sababsiz
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                            Ketma-ket: {st.consecutive_absent_days} kun
                          </div>
                        </td>

                        {/* Last Seen */}
                        <td style={{ padding: '12px 14px', fontSize: 12 }}>
                          <div style={{ color: THEME.textDark, fontWeight: 500 }}>{st.last_seen}</div>
                          <div style={{ fontSize: 11, color: THEME.textMuted }}>MinMoe Turniket</div>
                        </td>

                        {/* Parent and Contact */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={13} color={THEME.primary} />
                            <a href={`tel:${st.parent_phone}`} style={{ color: THEME.primary, fontWeight: 700, textDecoration: 'none' }}>
                              {st.parent_phone}
                            </a>
                          </div>
                          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                            {st.mahalla_name}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 14px' }}>
                          {st.actions_count > 0 ? (
                            <div>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: 4,
                                backgroundColor: '#ECFDF5',
                                color: '#059669',
                                fontSize: 11,
                                fontWeight: 700,
                              }}>
                                ✓ Chora ko'rilgan ({st.actions_count})
                              </span>
                              {st.last_action && (
                                <div style={{ fontSize: 10.5, color: THEME.textMuted, marginTop: 2 }}>
                                  {st.last_action.action_type_display}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: THEME.redLight,
                              color: THEME.red,
                              fontSize: 11,
                              fontWeight: 700,
                            }}>
                              Chora ko'rilmagan
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              onClick={() => {
                                setTargetStudent(st);
                                setActionModalOpen(true);
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: THEME.primary,
                                color: '#FFFFFF',
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                              title="Profilaktika chorasi qayd etish"
                            >
                              <Plus size={13} /> Chora Kiritish
                            </button>

                            <button
                              onClick={() => setPrintDocStudent(st)}
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
                              title="Rasmiy ogohlantirish xati chiqarish"
                            >
                              <FileText size={13} /> Ogohlantirish
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: BUGUNGI JONLI TURNIKET VA DAVOMAT OQIMI */}
        {activeTab === 'turnstile' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: `1px solid ${THEME.border}`, padding: 20, boxShadow: THEME.softShadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Bugungi Jonli Turniket Oqimi (Live Telemetry)</h3>
                <p style={{ fontSize: 12, color: THEME.textMuted, margin: '4px 0 0 0' }}>
                  Biriktirilgan maktablardagi turniket va Face ID qurilmalaridan kelayotgan real vaqtdagi signallar
                </p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4, backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                ● JONLI TRANSRETSIYA FAOL
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: `2px solid ${THEME.border}` }}>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>VAQTI</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>O'QUVCHI / XODIM</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>MAKTAB & SINF</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>YO'NALISH</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>QURILMA & USUL</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>HOLATI</th>
                  </tr>
                </thead>
                <tbody>
                  {turnstileEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 30, textAlign: 'center', color: THEME.textMuted }}>
                        Hozircha turniket hodisalari mavjud emas.
                      </td>
                    </tr>
                  ) : (
                    turnstileEvents.map((ev) => (
                      <tr key={ev.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{ev.time || ev.timestamp}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: THEME.textDark }}>
                          {ev.student_name || "O'quvchi"}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span>{ev.class_name || '9-A'}</span>
                          <span style={{ fontSize: 11, color: THEME.textMuted, marginLeft: 6 }}>({ev.school_id}-maktab)</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            backgroundColor: ev.direction === 'IN' ? '#ECFDF5' : '#EFF6FF',
                            color: ev.direction === 'IN' ? '#059669' : '#2563EB',
                            fontWeight: 800,
                            fontSize: 11,
                          }}>
                            {ev.direction === 'IN' ? 'KIRISH' : 'CHIQISH'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: THEME.textMuted }}>
                          {ev.device_name} ({ev.confidence}% aniqlik)
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ color: '#059669', fontWeight: 700, fontSize: 11.5 }}>✓ Tasdiqlandi</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BIRIKTIRILGAN MAKTABLAR PASPORTI */}
        {activeTab === 'schools' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {schools.map((sc) => (
              <div key={sc.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: `1px solid ${THEME.border}`, padding: 20, boxShadow: THEME.softShadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.textDark, margin: 0 }}>{sc.name}</h3>
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {sc.district}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    fontSize: 11,
                    fontWeight: 800,
                  }}>
                    ONLINE
                  </span>
                </div>

                <div style={{ borderTop: `1px solid ${THEME.border}`, borderBottom: `1px solid ${THEME.border}`, padding: '12px 0', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: THEME.textMuted }}>Direktor:</span>
                    <span style={{ fontWeight: 700 }}>{sc.director}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: THEME.textMuted }}>Telefon:</span>
                    <a href={`tel:${sc.phone}`} style={{ color: THEME.primary, fontWeight: 700, textDecoration: 'none' }}>
                      {sc.phone}
                    </a>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: THEME.textMuted }}>O'quvchilar soni:</span>
                    <span style={{ fontWeight: 800, color: THEME.green }}>{sc.students_count} nafar</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={`tel:${sc.phone}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px 12px',
                      borderRadius: 6,
                      backgroundColor: THEME.primaryLight,
                      color: THEME.primary,
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Phone size={13} /> Qo'ng'iroq Qilish
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: PROFILAKTIKA CHORALARI DAFTARI */}
        {activeTab === 'actions' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: `1px solid ${THEME.border}`, padding: 20, boxShadow: THEME.softShadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Profilaktika Choralari va Dalolatnomalar Daftari</h3>
                <p style={{ fontSize: 12, color: THEME.textMuted, margin: '4px 0 0 0' }}>
                  Uchastkovoy va Mahalla xodimi tomonidan voyaga yetmaganlar davomati bo'yicha ko'rilgan barcha amallar ro'yxati
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: `2px solid ${THEME.border}` }}>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>SANA VA VAQT</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>O'QUVCHI ISMI</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>MAKTAB VA SINF</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>CHORA TURI</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>NATIJA VA MAZMUNI</th>
                    <th style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5 }}>MAS'UL XODIM</th>
                  </tr>
                </thead>
                <tbody>
                  {preventionActions.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 30, textAlign: 'center', color: THEME.textMuted }}>
                        Hozircha dalolatnoma va choralar qayd etilmagan.
                      </td>
                    </tr>
                  ) : (
                    preventionActions.map((act) => (
                      <tr key={act.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{act.created_at}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: THEME.textDark }}>{act.student_name}</td>
                        <td style={{ padding: '10px 12px' }}>{act.class_name} ({act.school_name || `${act.school_id}-maktab`})</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            backgroundColor: THEME.primaryLight,
                            color: THEME.primary,
                            fontWeight: 700,
                            fontSize: 11.5,
                          }}>
                            {act.action_type_display}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: THEME.textDark, maxWidth: 320 }}>
                          {act.description}
                        </td>
                        <td style={{ padding: '10px 12px', color: THEME.textMuted, fontSize: 12 }}>
                          {act.officer_name}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: PROFILAKTIKA CHORASINI QAYD ETISH */}
      {actionModalOpen && targetStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 20,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 520,
            padding: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Profilaktika Chorasini Qayd Etish</h3>
                <p style={{ fontSize: 12, color: THEME.textMuted, margin: '4px 0 0 0' }}>
                  {targetStudent.full_name} ({targetStudent.class_name} sinf)
                </p>
              </div>
              <button
                onClick={() => setActionModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: THEME.textMuted }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAction}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 6 }}>
                  Ko'rilgan Chora Turi:
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${THEME.border}`,
                    fontSize: 13,
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="PARENT_CALL">Ota-onasi bilan telefon suhbati o'tkazildi</option>
                  <option value="HOME_VISIT">Xonadonga tashrif buyurildi va oilaviy sharoit o'rganildi</option>
                  <option value="PROTOCOL">Profilaktika dalolatnomasi rasmiylashtirildi</option>
                  <option value="WARNING_LETTER">Ota-onaga rasmiy ogohlantirish xati berildi (MJtK 47-modda)</option>
                  <option value="EXCUSED_ILLNESS">Sababli: Tibbiy ma'lumotnoma (kasallik) taqdim etildi</option>
                  <option value="OTHER">Boshqa chora-tadbir</option>
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: THEME.textDark, marginBottom: 6 }}>
                  Suhbat va o'rganish xulosasi (Dalolatnoma matni):
                </label>
                <textarea
                  rows={4}
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  placeholder="O'quvchi nega dars qoldirgani, ota-onasining javobi va kelgusida darsga qatnashishi bo'yicha olingan kafolat..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${THEME.border}`,
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  style={{
                    padding: '9px 16px',
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
                  disabled={submittingAction}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: THEME.primary,
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submittingAction ? "Saqlanmoqda..." : "Daftarga Qayd Etish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RASMIY OGOHLANTIRISH XATI (PRINTABLE PROTOCOL) */}
      {printDocStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 20,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 680,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 32,
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: THEME.primary, textTransform: 'uppercase' }}>
                RASMIY HUJJAT PREVYUSI
              </span>
              <button
                onClick={() => setPrintDocStudent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: THEME.textMuted }}
              >
                ✕
              </button>
            </div>

            {/* Official Notice Paper */}
            <div id="printable-notice-form" style={{
              border: '2px solid #0F172A',
              padding: '24px 28px',
              backgroundColor: '#FAFAFA',
              fontFamily: 'serif',
              lineHeight: 1.6,
              color: '#000000',
            }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                  {currentUser?.district || "Chilonzor tumani"} Ichki Ishlar Organlari Faoliyatini Muvofiqlashtirish Boshqarmasi
                </h3>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                  OGOHLANTIRISH XATI
                </h4>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                  № IIB-2026/____ • Sana: {new Date().toLocaleDateString('uz-UZ')}
                </div>
              </div>

              <p style={{ fontSize: 13, textIndent: 30, textAlign: 'justify' }}>
                Ushbu bilan Sizga shuni ma'lum qilamizki, farzandingiz <b>{printDocStudent.full_name}</b> ({printDocStudent.school_name}, {printDocStudent.class_name} sinf o'quvchisi) joriy o'quv yilida <b>{printDocStudent.absent_count} kun</b> davomida ta'lim muassasasidagi dars mashg'ulotlariga uzrli sabablarsiz qatnashmaganligi aniqlandi.
              </p>

              <p style={{ fontSize: 13, textIndent: 30, textAlign: 'justify' }}>
                O'zbekiston Respublikasi "Ta'lim to'g'risida"gi Qonuni hamda Ma'muriy javobgarlik to'g'risidagi Kodeksining <b>47-moddasiga</b> asosan, ota-onalar yoki ularning o'rnini bosuvchi shaxslar tomonidan voyaga yetmagan bolalarni tarbiyalash va ularga ta'lim berish borasidagi majburiyatlarni bajarmaslik qonuniy javobgarlikka sabab bo'ladi.
              </p>

              <p style={{ fontSize: 13, textIndent: 30, textAlign: 'justify' }}>
                Sizdan farzandingizning muntazam va o'z vaqtida darslarga qatnashishini zudlik bilan ta'minlashingiz so'raladi.
              </p>

              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 12.5 }}>
                <div>
                  <b>Profilaktika Inspektori:</b><br />
                  {currentUser?.name || "Katta leytenant Mirzayev B."}<br />
                  <i>Tel: {currentUser?.phone || "+998 90 911-02-02"}</i>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b>Imzo:</b> ______________<br />
                  <b>M.O'.</b>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setPrintDocStudent(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: `1px solid ${THEME.border}`,
                  backgroundColor: '#FFFFFF',
                  color: THEME.textDark,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Yopish
              </button>
              <button
                onClick={handleTriggerPrint}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: THEME.primary,
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Printer size={15} /> Chop Etish (Print)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
