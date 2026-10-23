import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, QrCode, Search, CheckCircle2, AlertTriangle, RefreshCw,
  LogOut, ArrowLeft, UserCheck, ShieldCheck, Clock, Users,
  Sparkles, X, Phone, Check, Eye
} from 'lucide-react';

const THEME = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#EEF2FF',
  gradient: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
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

export default function CheckpointCabinet({
  currentUser,
  onLogout = () => {},
  onBack = null,
  systemConfig = null,
}) {
  const schoolId = String(currentUser?.schoolId || currentUser?.school_id || '1');
  const schoolName = currentUser?.schoolName || currentUser?.school_name || "1-sonli Maktab";
  const guardName = currentUser?.full_name || currentUser?.name || "Maktab Qorovuli";

  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'search' | 'logs'
  const [stats, setStats] = useState({
    total_students: 0,
    entered_count: 0,
    attendance_rate: 0,
    qr_count: 0,
    face_count: 0,
    recent_logs: []
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Tab 1: QR Verification State
  const [qrInput, setQrInput] = useState('');
  const [verifyingQr, setVerifyingQr] = useState(false);
  const [lastVerifiedStudent, setLastVerifiedStudent] = useState(null);
  const [qrError, setQrError] = useState('');

  // Tab 2: Search & Live Face Biometric Verification State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [faceResult, setFaceResult] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Today Stats
  const fetchTodayStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/checkpoint/today-stats/?school_id=${encodeURIComponent(schoolId)}`);
      if (res.ok) {
        const json = await res.json();
        setStats(json);
      }
    } catch (e) {
      console.warn("Failed to fetch checkpoint stats:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchTodayStats();
    const timer = setInterval(fetchTodayStats, 10000);
    return () => clearInterval(timer);
  }, [schoolId]);

  // Handle QR Submit
  const handleVerifyQr = async (e) => {
    if (e) e.preventDefault();
    const token = qrInput.trim();
    if (!token) return;

    setVerifyingQr(true);
    setQrError('');
    setLastVerifiedStudent(null);

    try {
      const res = await fetch('/api/checkpoint/verify-qr/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_token: token,
          school_id: schoolId,
          guard_name: guardName,
          direction: 'IN',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setLastVerifiedStudent(json.student);
        setQrInput('');
        fetchTodayStats();
      } else {
        setQrError(json.detail || "QR kod muddati tugagan yoki topilmadi.");
      }
    } catch (err) {
      setQrError("Server bilan aloqa uzildi.");
    } finally {
      setVerifyingQr(false);
    }
  };

  // Student Search
  const handleSearchStudents = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/checkpoint/search-students/?school_id=${encodeURIComponent(schoolId)}&q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        setSearchResults(json.results || []);
      }
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Camera Management
  const startCamera = async () => {
    try {
      setCameraActive(true);
      setCapturedPhoto(null);
      setFaceResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraActive(false);
      alert("Kameraga ulanish imkoni bo'lmadi. Qurilmangiz kameraga ruxsat berganligini tekshiring yoki fotosurat yuklash opsiyasidan foydalaning.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedPhoto(event.target.result);
      setFaceResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Verify Face Biometric
  const handleVerifyFace = async () => {
    if (!selectedStudent || !capturedPhoto) return;
    setVerifyingFace(true);
    setFaceResult(null);

    try {
      const res = await fetch('/api/checkpoint/verify-face/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: schoolId,
          student_id: selectedStudent.id,
          face_image: capturedPhoto,
          guard_name: guardName,
          direction: 'IN',
        }),
      });

      const json = await res.json();
      setFaceResult(json);
      if (json.success && json.match) {
        fetchTodayStats();
      }
    } catch (err) {
      setFaceResult({
        success: false,
        match: false,
        message: "Server bilan solishtirishda xatolik yuz berdi."
      });
    } finally {
      setVerifyingFace(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: THEME.bgSoft,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 1. Header Bar */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: `1px solid ${THEME.border}`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <button
              onClick={() => {
                stopCamera();
                onBack();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
                backgroundColor: '#F8FAFC',
                color: THEME.textDark,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer'
              }}>
              <ArrowLeft size={16} />
              Orqaga
            </button>
          )}

          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: THEME.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}>
            <ShieldCheck size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: THEME.textDark }}>
                {schoolName} — Kirish Nazoratchisi Terminali
              </h1>
              <span style={{
                fontSize: 10.5,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 12,
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                border: '1px solid #86EFAC'
              }}>
                ● KIOSK FAOL
              </span>
            </div>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
              Nazoratchi: <b>{guardName}</b> • Maktab darvozasi / turniket
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            backgroundColor: '#F1F5F9',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 800,
            color: THEME.textDark,
            fontFamily: 'monospace'
          }}>
            <Clock size={15} color={THEME.primary} />
            {currentTime || '08:00:00'}
          </div>

          <button
            onClick={() => {
              stopCamera();
              onLogout();
            }}
            title="Tizimdan chiqish"
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              border: '1px solid #FECACA',
              backgroundColor: '#FEF2F2',
              color: THEME.red,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
            <LogOut size={15} />
            Chiqish
          </button>
        </div>
      </header>

      {/* 2. Today Stats Bar */}
      <div style={{
        padding: '16px 20px 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 600 }}>Bugun Kirganlar</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: THEME.textDark, marginTop: 2 }}>
              {stats.entered_count} <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 500 }}>/ {stats.total_students}</span>
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: THEME.primaryLight, color: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 600 }}>Davomat Ko'rsatkichi</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: THEME.green, marginTop: 2 }}>
              {stats.attendance_rate}%
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={18} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 600 }}>Face ID orqali</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#7C3AED', marginTop: 2 }}>
              {stats.face_count} ta
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={18} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: `1px solid ${THEME.border}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 600 }}>Dinamik QR orqali</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0284C7', marginTop: 2 }}>
              {stats.qr_count} ta
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={18} />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          display: 'flex',
          gap: 8,
          borderBottom: `2px solid ${THEME.border}`,
          paddingBottom: 2
        }}>
          <button
            onClick={() => {
              setActiveTab('qr');
              stopCamera();
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              backgroundColor: activeTab === 'qr' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'qr' ? THEME.primary : THEME.textMuted,
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: activeTab === 'qr' ? `3px solid ${THEME.primary}` : '3px solid transparent'
            }}>
            <QrCode size={16} />
            1. Dinamik QR Kod Skanerlash (Tezkor)
          </button>

          <button
            onClick={() => {
              setActiveTab('search');
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              backgroundColor: activeTab === 'search' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'search' ? THEME.primary : THEME.textMuted,
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: activeTab === 'search' ? `3px solid ${THEME.primary}` : '3px solid transparent'
            }}>
            <Camera size={16} />
            2. Telefonsiz O'quvchi (Qidiruv & Yuzni Solishtirish)
          </button>

          <button
            onClick={() => {
              setActiveTab('logs');
              stopCamera();
              fetchTodayStats();
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              backgroundColor: activeTab === 'logs' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'logs' ? THEME.primary : THEME.textMuted,
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: activeTab === 'logs' ? `3px solid ${THEME.primary}` : '3px solid transparent'
            }}>
            <Clock size={16} />
            3. Bugungi Kirishlar Jurnali ({stats.recent_logs?.length || 0})
          </button>
        </div>
      </div>

      {/* 4. Tab Contents */}
      <main style={{ padding: '20px', flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto' }}>
        
        {/* TAB 1: QR VERIFICATION */}
        {activeTab === 'qr' && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: `1px solid ${THEME.border}`,
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: THEME.primaryLight,
                color: THEME.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <QrCode size={32} />
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: THEME.textDark, margin: '0 0 6px' }}>
                O'quvchi Dinamik QR Kodini Skanerlang
              </h2>
              <p style={{ fontSize: 13, color: THEME.textMuted, margin: '0 0 24px' }}>
                O'quvchi telefonidagi mobil ilovadan 25-soniyalik dinamik QR kodni skanerga tuting yoki kodni kiriting
              </p>

              <form onSubmit={handleVerifyQr} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <input
                  type="text"
                  autoFocus
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="QR Token yoki O'quvchi ID raqami..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `2px solid ${THEME.primary}`,
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
                <button
                  type="submit"
                  disabled={verifyingQr || !qrInput.trim()}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: THEME.gradient,
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                    opacity: (verifyingQr || !qrInput.trim()) ? 0.6 : 1
                  }}>
                  {verifyingQr ? "Tekshirilmoqda..." : "Kiritishni Tasdiqlash"}
                </button>
              </form>

              {qrError && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  backgroundColor: THEME.redLight,
                  border: '1px solid #FECACA',
                  color: THEME.red,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                  textAlign: 'left'
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>{qrError}</div>
                </div>
              )}

              {lastVerifiedStudent && (
                <div style={{
                  padding: '20px',
                  borderRadius: 12,
                  backgroundColor: '#ECFDF5',
                  border: '2px solid #86EFAC',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{
                    width: 70,
                    height: 70,
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: '#E2E8F0',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {lastVerifiedStudent.photo_url ? (
                      <img
                        src={lastVerifiedStudent.photo_url}
                        alt="3x4"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Users size={30} color={THEME.textMuted} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6, backgroundColor: '#10B981', color: '#FFFFFF' }}>
                        KIRISH TASDIQLANDI ✅
                      </span>
                      <span style={{ fontSize: 12, color: THEME.textMuted }}>{lastVerifiedStudent.time}</span>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: THEME.textDark, marginTop: 4 }}>
                      {lastVerifiedStudent.full_name}
                    </div>
                    <div style={{ fontSize: 13, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                      Sinf: <b>{lastVerifiedStudent.class_name || "Sinf biriktirilmagan"}</b> • ID: #{lastVerifiedStudent.student_id}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#065F46', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={13} />
                      Ota-onasiga Telegram orqali bildirishnoma yetkazildi!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SEARCH & LIVE FACE VERIFICATION */}
        {activeTab === 'search' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 1.2fr' : '1fr', gap: 20 }}>
            {/* Left: Search Box & Results */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              border: `1px solid ${THEME.border}`,
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={18} color={THEME.primary} />
                O'quvchini Qidirish (Telefonsiz holat)
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: THEME.textMuted }}>
                O'quvchi ismi, familiyasi yoki ID raqamini kiriting
              </p>

              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={16} color={THEME.textMuted} style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchStudents(e.target.value)}
                  placeholder="F.I.SH yoki ID kodini yozing..."
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 8,
                    border: `1.5px solid ${THEME.border}`,
                    fontSize: 13.5,
                    outline: 'none'
                  }}
                />
              </div>

              {searching ? (
                <div style={{ padding: 24, textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
                  <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  Baza qidirilmoqda...
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: THEME.textMuted }}>
                  <Users size={32} color={THEME.border} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {searchQuery ? "Mos o'quvchi topilmadi" : "O'quvchini topish uchun ismini kiriting"}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                  {searchResults.map(s => {
                    const isSelected = selectedStudent?.id === s.id;
                    const alreadyEntered = s.today_entry?.entered;

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedStudent(s);
                          setCapturedPhoto(null);
                          setFaceResult(null);
                          stopCamera();
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: isSelected ? `2px solid ${THEME.primary}` : `1px solid ${THEME.border}`,
                          backgroundColor: isSelected ? THEME.primaryLight : '#FAFAFA',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          transition: 'all 0.15s ease'
                        }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          overflow: 'hidden',
                          backgroundColor: '#E2E8F0',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {s.photo_url ? (
                            <img src={s.photo_url} alt="3x4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Users size={20} color={THEME.textMuted} />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.full_name}
                          </div>
                          <div style={{ fontSize: 11.5, color: THEME.textMuted }}>
                            Sinf: <b>{s.class_name || "—"}</b> • ID: #{s.student_id}
                          </div>
                        </div>

                        <div>
                          {alreadyEntered ? (
                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 800 }}>
                              KIRGAN ({s.today_entry.time})
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 800 }}>
                              KIRMAGAN
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Selected Student & Camera Biometric Match */}
            {selectedStudent && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: `1px solid ${THEME.border}`,
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: THEME.textDark, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Camera size={18} color={THEME.primary} />
                    Yuzni Rasmga Olish va Solishtirish
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      stopCamera();
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Comparison Preview (DB vs Camera) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Database Reference Photo */}
                  <div style={{
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, marginBottom: 8, textTransform: 'uppercase' }}>
                      Bazada bor 3x4 rasm
                    </div>
                    <div style={{
                      width: 110,
                      height: 135,
                      borderRadius: 8,
                      overflow: 'hidden',
                      margin: '0 auto',
                      backgroundColor: '#E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      {selectedStudent.photo_url ? (
                        <img src={selectedStudent.photo_url} alt="Baza 3x4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ padding: 10, fontSize: 11, color: THEME.red, fontWeight: 700 }}>
                          Rasm mavjud emas!
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark, marginTop: 8 }}>
                      {selectedStudent.full_name}
                    </div>
                  </div>

                  {/* Live Camera / Captured Photo */}
                  <div style={{
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: THEME.textMuted, marginBottom: 8, textTransform: 'uppercase' }}>
                      Jonli kamera surati
                    </div>

                    <div style={{
                      width: 110,
                      height: 135,
                      borderRadius: 8,
                      overflow: 'hidden',
                      margin: '0 auto',
                      backgroundColor: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {cameraActive ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : capturedPhoto ? (
                        <img src={capturedPhoto} alt="Jonli rasm" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Camera size={30} color="#64748B" />
                      )}
                    </div>

                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 6 }}>
                      {cameraActive ? (
                        <button
                          onClick={captureSnapshot}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}>
                          📸 Rasm Olish
                        </button>
                      ) : (
                        <button
                          onClick={startCamera}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: 'none',
                            backgroundColor: THEME.primary,
                            color: '#FFFFFF',
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}>
                          {capturedPhoto ? "Qayta Olish" : "Kamerani Yoqish"}
                        </button>
                      )}

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: `1px solid ${THEME.border}`,
                          backgroundColor: '#FFFFFF',
                          color: THEME.textDark,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}>
                        Fayl
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Biometric Verification Result Alert */}
                {faceResult && (
                  <div style={{
                    padding: '14px',
                    borderRadius: 10,
                    backgroundColor: faceResult.match ? '#ECFDF5' : '#FEF2F2',
                    border: `1.5px solid ${faceResult.match ? '#86EFAC' : '#FECACA'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10
                  }}>
                    {faceResult.match ? (
                      <CheckCircle2 size={20} color="#15803D" style={{ flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <AlertTriangle size={20} color="#B91C1C" style={{ flexShrink: 0, marginTop: 2 }} />
                    )}
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: faceResult.match ? '#15803D' : '#B91C1C' }}>
                        {faceResult.message}
                      </div>
                      {faceResult.confidence && (
                        <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 3 }}>
                          AI Biometrik o'xshashlik darajasi: <b>{faceResult.confidence}%</b>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Confirm Entry Action Button */}
                <button
                  onClick={handleVerifyFace}
                  disabled={!capturedPhoto || verifyingFace || !selectedStudent?.photo_url}
                  style={{
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    background: THEME.gradient,
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                    opacity: (!capturedPhoto || verifyingFace || !selectedStudent?.photo_url) ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}>
                  {verifyingFace ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Yuz solishtirilmoqda va tasdiqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Yuzni Solishtirish va Kirishni Tasdiqlash
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TODAY'S ENTRY LOGS */}
        {activeTab === 'logs' && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: `1px solid ${THEME.border}`,
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: THEME.textDark }}>
                  Bugungi Maktabga Kirishlar Jurnali
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: THEME.textMuted }}>
                  Bugun maktab hududiga kirishi tasdiqlangan o'quvchilar ro'yxati (Oxirgi 20 ta)
                </p>
              </div>
              <button
                onClick={fetchTodayStats}
                disabled={loadingStats}
                style={{
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: `1px solid ${THEME.border}`,
                  backgroundColor: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                <RefreshCw size={13} className={loadingStats ? "animate-spin" : ""} />
                Yangilash
              </button>
            </div>

            {(!stats.recent_logs || stats.recent_logs.length === 0) ? (
              <div style={{ padding: 48, textAlign: 'center', color: THEME.textMuted }}>
                <Clock size={36} color={THEME.border} style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: THEME.textDark }}>Bugun hali kirishlar qayd etilmadi</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>QR kod skanerlanganda yoki yuz tasdiqlanganda ushbu ro'yxatda paydo bo'ladi.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: `1px solid ${THEME.border}` }}>
                      <th style={{ padding: '10px 14px', color: THEME.textMuted, fontWeight: 700 }}>VAQTI</th>
                      <th style={{ padding: '10px 14px', color: THEME.textMuted, fontWeight: 700 }}>O'QUVCHI (F.I.SH)</th>
                      <th style={{ padding: '10px 14px', color: THEME.textMuted, fontWeight: 700 }}>SINF</th>
                      <th style={{ padding: '10px 14px', color: THEME.textMuted, fontWeight: 700 }}>TASDIQLASH USULI</th>
                      <th style={{ padding: '10px 14px', color: THEME.textMuted, fontWeight: 700 }}>HOLATI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_logs.map(log => (
                      <tr key={log.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '12px 14px', fontWeight: 800, fontFamily: 'monospace', color: THEME.primaryDark }}>
                          {log.time}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 800, color: THEME.textDark }}>
                            {log.student_name}
                          </div>
                          <div style={{ fontSize: 11, color: THEME.textMuted }}>
                            ID: #{log.student_id}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: THEME.textDark }}>
                          {log.class_name || "—"}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {log.event_type === 'FACE_RECOGNITION' ? (
                            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, backgroundColor: '#F3E8FF', color: '#7E22CE', fontWeight: 800 }}>
                              📷 Face ID ({log.confidence}%)
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 800 }}>
                              📱 Dinamik QR
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 800 }}>
                            ● Tasdiqlandi
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
