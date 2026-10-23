import React, { useState, useEffect } from 'react';
import {
  Building2, Users, CheckCircle2, AlertTriangle, Search,
  RefreshCw, Check, X, Eye, Phone, Mail, MapPin, Send,
  Shield, Smartphone, Monitor, Layers, Clock, ArrowRight,
  Copy, ExternalLink, Calendar, Filter, Sparkles
} from 'lucide-react';

export default function SchoolApplicationsManager({ onSchoolCreated, onToast }) {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modallar
  const [selectedApp, setSelectedApp] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [credentialsModal, setCredentialsModal] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Rad etish modal
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let url = '/api/superadmin/school-applications/';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('q', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
        if (data.counts) setStats(data.counts);
        else if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Arizalarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  // 1. Arizani qabul qilish va Maktab Yaratish
  const handleApprove = async (app) => {
    if (!window.confirm(`Haqiqatan ham "${app.school_name}" arizasini qabul qilib, tizimda yangi maktab va direktor hisobini yaratmoqchimisiz?`)) {
      return;
    }

    setApprovingId(app.id);
    try {
      const res = await fetch(`/api/superadmin/school-applications/${app.id}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN'
        },
        body: JSON.stringify({ monthly_price: 1000000 })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (onToast) onToast(`${app.school_name} uchun maktab va direktor hisobi muvaffaqiyatli ochildi! 🎉`);
        setCredentialsModal(data.credentials);
        fetchApplications();
        if (onSchoolCreated && data.school) {
          onSchoolCreated(data.school);
        }
      } else {
        alert(data.detail || "Maktab yaratishda xatolik yuz berdi.");
      }
    } catch (err) {
      alert("Server bilan aloqa xatosi: " + err);
    } finally {
      setApprovingId(null);
    }
  };

  // 2. Arizani rad etish
  const handleRejectSubmit = async () => {
    if (!rejectModalApp) return;
    setRejecting(true);
    try {
      const res = await fetch(`/api/superadmin/school-applications/${rejectModalApp.id}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onToast) onToast(`Ariza #${rejectModalApp.id} rad etildi.`);
        setRejectModalApp(null);
        setRejectReason('');
        fetchApplications();
      } else {
        alert(data.detail || "Xatolik yuz berdi.");
      }
    } catch (err) {
      alert("Server bilan aloqa xatosi: " + err);
    } finally {
      setRejecting(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F8FAFC', minHeight: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Building2 size={22} color="#4F46E5" />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Maktab Qo'shish So'rovlari & Arizalar
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
                Landing sahifasidan kelgan arizalarni ko'rib chiqish va 1 ta bosishda maktab yaratish
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchApplications}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            borderRadius: 12, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF',
            color: '#1E293B', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin-animate' : ''} />
          Yangilash
        </button>
      </div>

      {/* 4 ta Statistika Kartasi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        
        <StatCard
          title="Jami Arizalar"
          count={stats.total}
          icon={<Layers size={20} color="#4F46E5" />}
          bg="#EEF2FF"
          active={statusFilter === ''}
          onClick={() => setStatusFilter('')}
        />

        <StatCard
          title="Kutilayotganlar (Yangi)"
          count={stats.pending}
          icon={<Clock size={20} color="#D97706" />}
          bg="#FFFBEB"
          borderColor="#FDE68A"
          active={statusFilter === 'PENDING'}
          onClick={() => setStatusFilter('PENDING')}
        />

        <StatCard
          title="Tasdiqlangan & Yaratilgan"
          count={stats.approved}
          icon={<CheckCircle2 size={20} color="#16A34A" />}
          bg="#F0FDF4"
          borderColor="#BBF7D0"
          active={statusFilter === 'APPROVED'}
          onClick={() => setStatusFilter('APPROVED')}
        />

        <StatCard
          title="Rad Etilganlar"
          count={stats.rejected}
          icon={<X size={20} color="#DC2626" />}
          bg="#FEF2F2"
          borderColor="#FECACA"
          active={statusFilter === 'REJECTED'}
          onClick={() => setStatusFilter('REJECTED')}
        />

      </div>

      {/* Filter va Qidiruv Bar */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: '16px 20px',
        border: '1px solid #E2E8F0', marginBottom: 20, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap'
      }}>
        
        {/* Filter Tugmalari */}
        <div style={{ display: 'flex', gap: 8 }}>
          <FilterBtn label="Barchasi" active={statusFilter === ''} onClick={() => setStatusFilter('')} />
          <FilterBtn label={`Kutilmoqda (${stats.pending})`} active={statusFilter === 'PENDING'} onClick={() => setStatusFilter('PENDING')} badgeColor="#D97706" />
          <FilterBtn label={`Tasdiqlangan (${stats.approved})`} active={statusFilter === 'APPROVED'} onClick={() => setStatusFilter('APPROVED')} badgeColor="#16A34A" />
          <FilterBtn label={`Rad etilgan (${stats.rejected})`} active={statusFilter === 'REJECTED'} onClick={() => setStatusFilter('REJECTED')} badgeColor="#DC2626" />
        </div>

        {/* Qidiruv Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 280px', maxWidth: 400 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Maktab, direktor yoki telefon bo'yicha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10,
                border: '1.5px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 16px', borderRadius: 10, border: 'none',
              backgroundColor: '#4F46E5', color: '#FFF', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}
          >
            Izlash
          </button>
        </form>

      </div>

      {/* Arizalar Ro'yxati */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <RefreshCw size={28} color="#4F46E5" className="spin-animate" style={{ margin: '0 auto 12px' }} />
          <div style={{ color: '#64748B', fontSize: 14 }}>Arizalar yuklanmoqda...</div>
        </div>
      ) : applications.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <Building2 size={44} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155', margin: '0 0 4px' }}>Arizalar mavjud emas</h3>
          <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>
            Hozircha tanlangan filtr bo'yicha hech qanday maktab arizasi tushmagan.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {applications.map(app => {
            const isPending = app.status === 'PENDING';
            const isApproved = app.status === 'APPROVED';
            const isRejected = app.status === 'REJECTED';

            return (
              <div
                key={app.id}
                style={{
                  backgroundColor: '#FFFFFF', borderRadius: 18, padding: '20px 24px',
                  border: isPending ? '1.5px solid #FCD34D' : '1px solid #E2E8F0',
                  boxShadow: isPending ? '0 4px 16px rgba(217, 119, 6, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex', flexDirection: 'column', gap: 14
                }}
              >
                
                {/* Karta yuqori qismi: Maktab nomi, turi, statusi */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                        {app.school_name}
                      </span>
                      <span style={{
                        backgroundColor: '#EEF2FF', color: '#4338CA', fontSize: 11, fontWeight: 700,
                        padding: '2px 10px', borderRadius: 20, border: '1px solid #C7D2FE'
                      }}>
                        {app.school_type_label}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>
                        #{app.id} • {app.date} {app.time}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#475569', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} color="#64748B" />
                        <span>{app.region}, {app.district}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={14} color="#64748B" />
                        <span>~{app.estimated_students} o'quvchi, ~{app.estimated_teachers} o'qituvchi</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} />
                        KUTILMOQDA
                      </span>
                    )}
                    {isApproved && (
                      <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} />
                        TASDIQLANDI (Maktab ID: {app.created_school_id})
                      </span>
                    )}
                    {isRejected && (
                      <span style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <X size={14} />
                        RAD ETILDI
                      </span>
                    )}
                  </div>

                </div>

                {/* O'rta qism: Mas'ul shaxs, telefon, turniket */}
                <div style={{
                  padding: '12px 16px', borderRadius: 12, backgroundColor: '#F8FAFC',
                  border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
                }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Mas'ul shaxs (Direktor)</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                        {app.contact_name} <span style={{ fontWeight: 500, color: '#64748B' }}>({app.contact_role})</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Telefon / Aloqa</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a href={`tel:${app.phone}`} style={{ fontSize: 13.5, fontWeight: 700, color: '#4F46E5', textDecoration: 'none' }}>
                          {app.phone}
                        </a>
                        {app.telegram_username && (
                          <span style={{ fontSize: 12, color: '#0284C7', fontWeight: 600 }}>
                            @{app.telegram_username.replace('@', '')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Turniket & Uskuna</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                        {app.turnstile_status_label}
                      </div>
                    </div>
                  </div>

                  {/* Tizim Ta'minoti */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', color: '#065F46', fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 8, border: '1px solid #A7F3D0' }}>
                    <CheckCircle2 size={13} color="#059669" />
                    <span>Barcha standart funksiyalar</span>
                  </div>

                </div>

                {/* Pastki qism: Amallar (Action buttons) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setSelectedApp(app)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                        borderRadius: 10, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF',
                        color: '#334155', fontSize: 12.5, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} />
                      Batafsil ko'rish
                    </button>

                    {isApproved && app.admin_credentials && (
                      <button
                        onClick={() => setCredentialsModal(app.admin_credentials)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                          borderRadius: 10, border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4',
                          color: '#166534', fontSize: 12.5, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        <Key size={14} color="#16A34A" />
                        Direktor Login & Paroli
                      </button>
                    )}
                  </div>

                  {/* Qabul qilish / Rad etish */}
                  {isPending && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => {
                          setRejectModalApp(app);
                          setRejectReason('');
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                          borderRadius: 10, border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2',
                          color: '#B91C1C', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        <X size={15} />
                        Rad etish
                      </button>

                      <button
                        onClick={() => handleApprove(app)}
                        disabled={approvingId === app.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px',
                          borderRadius: 10, border: 'none',
                          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                          color: '#FFFFFF', fontSize: 13, fontWeight: 800, cursor: approvingId === app.id ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                        }}
                      >
                        {approvingId === app.id ? (
                          <>
                            <RefreshCw size={15} className="spin-animate" />
                            <span>Maktab Yaratilmoqda...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Qabul Qilish va Maktab Yaratish</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ARIZA BATAFSIL MA'LUMOTLARI
      ========================================================================= */}
      {selectedApp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: 24, maxWidth: 640, width: '100%',
            maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Ariza Tafsilotlari #{selectedApp.id}
                </h3>
                <span style={{ fontSize: 12, color: '#64748B' }}>{selectedApp.created_at}</span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DetailRow label="Maktab Nomi" value={selectedApp.school_name} bold />
              <DetailRow label="Maktab Turi" value={selectedApp.school_type_label} />
              <DetailRow label="Hudud" value={`${selectedApp.region}, ${selectedApp.district}`} />
              <DetailRow label="Manzil" value={selectedApp.address || "Ko'rsatilmagan"} />
              <DetailRow label="Mas'ul Shaxs" value={`${selectedApp.contact_name} (${selectedApp.contact_role})`} bold />
              <DetailRow label="Telefon Raqami" value={selectedApp.phone} />
              <DetailRow label="Telegram" value={selectedApp.telegram_username ? `@${selectedApp.telegram_username}` : "Yo'q"} />
              <DetailRow label="O'quvchilar Soni" value={`~${selectedApp.estimated_students} nafar`} />
              <DetailRow label="O'qituvchilar Soni" value={`~${selectedApp.estimated_teachers} nafar`} />
              <DetailRow label="Turniket Holati" value={selectedApp.turnstile_status_label} />
              
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Tizim Ta'minoti:</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', color: '#065F46', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: '1px solid #A7F3D0' }}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span>Barcha funksiyalar (Face ID, Jurnal, Telegram bot, Mobil ilova, Aqlli doska) to'liq ulanadi</span>
                </div>
              </div>

              {selectedApp.notes && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Qo'shimcha Izoh:</div>
                  <div style={{ padding: 12, borderRadius: 10, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 13, color: '#334155' }}>
                    {selectedApp.notes}
                  </div>
                </div>
              )}

              {selectedApp.rejection_reason && (
                <div style={{ padding: 12, borderRadius: 10, backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 13 }}>
                  <strong>Rad etish sababi:</strong> {selectedApp.rejection_reason}
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #CBD5E1', backgroundColor: '#FFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Yopish
              </button>
              {selectedApp.status === 'PENDING' && (
                <button
                  onClick={() => {
                    const app = selectedApp;
                    setSelectedApp(null);
                    handleApprove(app);
                  }}
                  style={{
                    padding: '9px 20px', borderRadius: 10, border: 'none',
                    backgroundColor: '#16A34A', color: '#FFF', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  Qabul qilish va Maktab Yaratish
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: YARATILGAN MAKTAB DIREKTOR KREDENTSIALLARI
      ========================================================================= */}
      {credentialsModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: 24, maxWidth: 540, width: '100%',
            padding: 30, boxShadow: '0 25px 50px rgba(0,0,0,0.3)', textAlign: 'center'
          }}>
            
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Sparkles size={36} color="#16A34A" />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#166534', margin: '0 0 6px' }}>
              Yangi Maktab Muvaffaqiyatli Ochildi! 🎉
            </h3>
            <p style={{ color: '#475569', fontSize: 14, margin: '0 0 20px' }}>
              <strong>{credentialsModal.school_name}</strong> uchun maktab bazasi va administrator hisobi yaratildi.
            </p>

            {/* Login & Parol Kartasi */}
            <div style={{
              backgroundColor: '#F8FAFC', borderRadius: 16, padding: '18px 20px',
              border: '1.5px solid #E2E8F0', textAlign: 'left', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>MAKTAB ID SI</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{credentialsModal.school_id}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>DIREKTOR LOGIN (USERNAME)</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#4F46E5', fontFamily: 'monospace' }}>{credentialsModal.username}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(credentialsModal.username, 'login')}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Copy size={13} />
                  {copiedField === 'login' ? "Nusxalandi!" : "Nusxalash"}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>DIREKTOR DASTLABKI PAROLI</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#16A34A', fontFamily: 'monospace' }}>{credentialsModal.password}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(credentialsModal.password, 'pass')}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Copy size={13} />
                  {copiedField === 'pass' ? "Nusxalandi!" : "Nusxalash"}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>KIRISH HAVOLASI</div>
                  <div style={{ fontSize: 12.5, color: '#334155' }}>smart-school platformasi / Login sahifasi</div>
                </div>
              </div>

            </div>

            {/* Barcha matnni nusxalash */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  const fullText = `🏛 MAKTAB: ${credentialsModal.school_name}\n🔑 LOGIN: ${credentialsModal.username}\n🔒 PAROL: ${credentialsModal.password}\n🌐 Tizimga kirish: ${window.location.origin}/#/login`;
                  copyToClipboard(fullText, 'all');
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px',
                  borderRadius: 12, border: '1.5px solid #4F46E5', backgroundColor: '#EEF2FF',
                  color: '#4338CA', fontWeight: 800, fontSize: 13.5, cursor: 'pointer'
                }}
              >
                <Copy size={16} />
                {copiedField === 'all' ? "Barcha ma'lumotlar nusxalandi! ✅" : "Direktorga yuborish uchun nusxa olish"}
              </button>

              <button
                onClick={() => setCredentialsModal(null)}
                style={{
                  padding: '12px 24px', borderRadius: 12, border: 'none',
                  backgroundColor: '#4F46E5', color: '#FFF', fontWeight: 800, fontSize: 13.5, cursor: 'pointer'
                }}
              >
                Yopish
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: RAD ETISH MODALI
      ========================================================================= */}
      {rejectModalApp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: 20, maxWidth: 460, width: '100%',
            padding: 24, boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#991B1B', margin: '0 0 8px' }}>
              Arizani Rad Etish #{rejectModalApp.id}
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px' }}>
              <strong>{rejectModalApp.school_name}</strong> arizasini nima sababdan rad etayotganingizni yozing:
            </p>

            <textarea
              rows={3}
              placeholder="Masalan: Telefon raqam noto'g'ri ko'rsatilgan, bog'lanib bo'lmadi..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #CBD5E1', fontSize: 13, outline: 'none',
                boxSizing: 'border-box', resize: 'vertical', marginBottom: 16
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setRejectModalApp(null)}
                style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #CBD5E1', backgroundColor: '#FFF', fontWeight: 600, cursor: 'pointer' }}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejecting}
                style={{
                  padding: '8px 18px', borderRadius: 10, border: 'none',
                  backgroundColor: '#DC2626', color: '#FFF', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {rejecting ? "Rad etilmoqda..." : "Tasdiqlash & Rad etish"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, count, icon, bg, borderColor, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: '18px 20px',
        border: active ? '2px solid #4F46E5' : `1px solid ${borderColor || '#E2E8F0'}`,
        boxShadow: active ? '0 4px 14px rgba(79, 70, 229, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
        cursor: 'pointer', transition: 'all 0.15s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748B' }}>{title}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#0F172A' }}>
        {count}
      </div>
    </div>
  );
}

function FilterBtn({ label, active, onClick, badgeColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px', borderRadius: 10,
        border: active ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
        backgroundColor: active ? '#EEF2FF' : '#FFFFFF',
        color: active ? '#4338CA' : '#475569',
        fontSize: 12.5, fontWeight: active ? 800 : 600, cursor: 'pointer',
        transition: 'all 0.15s'
      }}
    >
      {label}
    </button>
  );
}

function DetailRow({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed #F1F5F9' }}>
      <span style={{ fontSize: 12.5, color: '#64748B' }}>{label}:</span>
      <span style={{ fontSize: 13.5, color: '#0F172A', fontWeight: bold ? 800 : 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
