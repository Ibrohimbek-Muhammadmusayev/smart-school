import React from 'react';
import { 
  Wrench, AlertTriangle, RefreshCw, ShieldAlert, 
  Phone, Mail, Clock, LogOut, CheckCircle2,
  Shield, Server, Building2, CreditCard
} from 'lucide-react';

const THEME = {
  primary: '#6C5CE7',
  primaryDark: '#5845D8',
  primaryLight: '#F1F0FF',
  gradient: 'linear-gradient(135deg, #7C69EF 0%, #5845D8 100%)',
  orange: '#FF9F43',
  red: '#E11D48',
  redSoft: '#FFF1F2',
  textDark: '#1E2038',
  textMuted: '#8A90A2',
};

/**
 * 1. Global Texnik Profilaktika Rejimi (Maintenance Mode) Ekrani
 * Super Admindan tashqari barcha foydalanuvchilar (maktab dashborti, o'qituvchilar, mobil ilovalar)
 * ushbu ekranga yo'naltiriladi.
 */
export function MaintenanceScreen({ config, onRefresh, checking, onLogout }) {
  const title = config?.maintenance_title || "Tizimda profilaktika ishlari olib borilmoqda";
  const message = config?.maintenance_message || "Tizim serverlarida rejali modernizatsiya va texnik sozlash ishlari amalga oshirilmoqda. Tez orada barcha xizmatlar to'liq tiklanadi.";
  const estimatedEnd = config?.estimated_end_time || "Tez orada";
  const phone = config?.support_phone || "+998 71 200-00-00";
  const email = config?.support_email || "support@smart-school.uz";

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #EDE9FE 0%, #F8F9FE 60%, #EEF2F6 100%)',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: 580,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: '40px 36px',
        boxShadow: '0 25px 60px rgba(108, 92, 231, 0.12), 0 8px 24px rgba(15, 23, 42, 0.06)',
        border: '1px solid rgba(108, 92, 231, 0.15)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Yuqori dekorativ chiziq */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #F59E0B, #E11D48, #6C5CE7)'
        }} />

        {/* Pulsatsiyalanuvchi Wrench / Server ikonkasi */}
        <div style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          backgroundColor: '#FFF7ED',
          border: '3px solid #FED7AA',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          position: 'relative'
        }}>
          <Wrench size={42} color="#EA580C" strokeWidth={2.2} />
          <div style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            backgroundColor: '#EA580C',
            borderRadius: '50%',
            padding: 5,
            border: '2px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={14} color="#FFFFFF" />
          </div>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 20,
          backgroundColor: '#FEF3C7',
          color: '#B45309',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 16
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#D97706', display: 'inline-block' }} />
          Texnik Profilaktika Rejimi
        </div>

        {/* Sarlavha */}
        <h1 style={{
          margin: '0 0 12px 0',
          fontSize: 24,
          fontWeight: 800,
          color: THEME.textDark,
          lineHeight: 1.3
        }}>
          {title}
        </h1>

        {/* Xabar matni */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: 14,
          lineHeight: 1.6,
          color: '#4B5563',
          padding: '0 12px'
        }}>
          {message}
        </p>

        {/* Ma'lumot bloklari */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 26,
          textAlign: 'left'
        }}>
          <div style={{
            padding: '14px 16px',
            borderRadius: 18,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Clock size={13} color="#F59E0B" /> Taxminiy tugash vaqti:
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textDark }}>
              {estimatedEnd}
            </div>
          </div>

          <div style={{
            padding: '14px 16px',
            borderRadius: 18,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Phone size={13} color="#6C5CE7" /> Yordam xizmati:
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: THEME.textDark }}>
              {phone}
            </div>
          </div>
        </div>

        {/* Tugmalar */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onRefresh}
            disabled={checking}
            style={{
              flex: 1,
              padding: '13px 20px',
              borderRadius: 16,
              background: THEME.gradient,
              border: 'none',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 800,
              cursor: checking ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 20px rgba(108, 92, 231, 0.28)',
              transition: 'all 0.2s ease',
              opacity: checking ? 0.7 : 1
            }}
          >
            <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Tekshirilmoqda...' : 'Holatni Qayta Tekshirish'}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                padding: '13px 18px',
                borderRadius: 16,
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#475569',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <LogOut size={16} /> Chiqish
            </button>
          )}
        </div>

        {/* Pastki xavfsizlik eslatmasi */}
        <div style={{ marginTop: 20, fontSize: 11, color: '#94A3B8' }}>
          Idrok Core • Barcha ma'lumotlar xavfsiz holatda qulflangan
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Maktab Admini (Direktor) uchun To'xtatilgan / Bloklangan / Qarzdorlik Ekrani
 * Maktab Adminiga ANIQ SABAB, Qarzdorlik summasi va to'lov yo'riqnomasi ko'rinadi.
 */
export function SchoolSuspendedScreen({ school, onRefresh, onLogout }) {
  const isDebt = school?.paymentStatus === 'OVERDUE' || 
                 (school?.statusReason || '').toLowerCase().includes('qarzdor') || 
                 (school?.statusReason || '').toLowerCase().includes('to‘lov') || 
                 (school?.statusReason || '').toLowerCase().includes('to\'lov');
  
  const title = isDebt 
    ? "Maktab xizmatlari qarzdorlik sababli to'xtatilgan" 
    : (school?.status === 'SUSPENDED' ? "Maktab faoliyati vaqtincha to'xtatilgan (Pauza)" : "Maktab hisobi bloklangan");

  const message = school?.statusReason || (
    isDebt 
      ? "Hurmatli maktab ma'muriyati! Tizimdan foydalanish oylik obuna to'lovi muddati o'tganligi sababli maktabingiz xizmatlari vaqtincha cheklandi. Tizimni qayta faollashtirish uchun hisob-kitob bo'limi bilan bog'laning."
      : "Bosh Boshqarma (Super Admin) tomonidan maktab boshqaruv xizmatlari vaqtincha to'xtatildi."
  );

  const debtAmount = school?.debtAmount || "4 800 000 so‘m";
  const contactPhone = "+998 71 200-00-00";

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #FFE4E6 0%, #FFF1F2 50%, #F8FAFC 100%)',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: 600,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: '38px 34px',
        boxShadow: '0 25px 60px rgba(225, 29, 72, 0.12), 0 8px 24px rgba(15, 23, 42, 0.06)',
        border: '1px solid rgba(225, 29, 72, 0.18)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Qizil indikator */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: isDebt ? '#E11D48' : '#F59E0B'
        }} />

        {/* Icon */}
        <div style={{
          width: 84,
          height: 84,
          borderRadius: '50%',
          backgroundColor: isDebt ? '#FFF1F2' : '#FFFBEB',
          border: `3px solid ${isDebt ? '#FECDD3' : '#FDE68A'}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px auto'
        }}>
          {isDebt ? (
            <CreditCard size={40} color="#E11D48" strokeWidth={2.2} />
          ) : (
            <AlertTriangle size={40} color="#D97706" strokeWidth={2.2} />
          )}
        </div>

        {/* Maktab nomi badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 16,
          backgroundColor: '#F1F5F9',
          color: '#334155',
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 12
        }}>
          <Building2 size={13} color="#64748B" />
          {school?.name || "Maktab"}
        </div>

        <h1 style={{
          margin: '0 0 12px 0',
          fontSize: 22,
          fontWeight: 800,
          color: '#0F172A',
          lineHeight: 1.3
        }}>
          {title}
        </h1>

        <p style={{
          margin: '0 0 20px 0',
          fontSize: 14,
          lineHeight: 1.6,
          color: '#475569'
        }}>
          {message}
        </p>

        {/* Qarzdorlik tafsilotlari kartochkasi */}
        {isDebt && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 20,
            backgroundColor: '#FFF1F2',
            border: '1px solid #FECDD3',
            marginBottom: 24,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #FDA4AF', paddingBottom: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#9F1239' }}>To‘lanishi kerak bo‘lgan summa:</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#E11D48' }}>{debtAmount}</span>
            </div>
            <div style={{ fontSize: 12, color: '#881337', lineHeight: 1.5 }}>
              To‘lov amalga oshirilgach, to‘lov chekini hisob-kitob bo‘limiga yuboring yoki Bosh Boshqarmaga xabar bering. Tizim darhol qayta yoqiladi.
            </div>
          </div>
        )}

        {/* Bog'lanish bloklari */}
        <div style={{
          padding: '14px 18px',
          borderRadius: 18,
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          marginBottom: 24,
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted }}>Moliya va Texnik Boshqarma:</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textDark, marginTop: 2 }}>{contactPhone}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted }}>Buxgalteriya:</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6C5CE7', marginTop: 2 }}>buxgalter@smart-school.uz</div>
          </div>
        </div>

        {/* Tugmalar */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onRefresh}
            style={{
              flex: 1.2,
              padding: '13px 20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.28)'
            }}
          >
            <RefreshCw size={16} /> Qayta Tekshirish
          </button>

          <button
            onClick={onLogout}
            style={{
              flex: 1,
              padding: '13px 18px',
              borderRadius: 16,
              backgroundColor: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#475569',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <LogOut size={16} /> Tizimdan Chiqish
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. O'qituvchilar va O'quvchilar (Mobil / Veb) uchun To'xtatilganlik Ekrani
 * Ichki qarzdorlik sirlari o'qituvchi va o'quvchilarga ko'rsatilmaydi!
 * Ular uchun faqat rasmiy, madaniyatli "Vaqtincha to'xtatilgan" ogohlantirishi chiqadi.
 */
export function TeacherSuspendedScreen({ school, onLogout }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8F9FE',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: 500,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: '36px 30px',
        boxShadow: '0 20px 48px rgba(15, 23, 42, 0.08)',
        border: '1px solid #E2E8F0',
        textAlign: 'center'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#EFF6FF',
          border: '3px solid #BFDBFE',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <ShieldAlert size={34} color="#3B82F6" />
        </div>

        <h2 style={{ margin: '0 0 10px 0', fontSize: 20, fontWeight: 800, color: '#1E293B' }}>
          Xizmatlar Vaqtincha To‘xtatilgan
        </h2>

        <p style={{ margin: '0 0 24px 0', fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
          Hurmatli ustoz! Maktab tizimida profilaktika yoki rejali texnik sozlash ishlari sababli darslar va jurnallar bilan ishlash vaqtincha cheklangan. Iltimos, ma'lumot olish uchun maktab ma'muriyati bilan bog'laning.
        </p>

        <div style={{
          padding: '12px 16px',
          borderRadius: 16,
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          marginBottom: 20,
          fontSize: 13,
          fontWeight: 700,
          color: '#334155'
        }}>
          {school?.name || "1-sonli Maktab"}
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: 16,
            background: THEME.gradient,
            border: 'none',
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <LogOut size={16} /> Chiqish
        </button>
      </div>
    </div>
  );
}
