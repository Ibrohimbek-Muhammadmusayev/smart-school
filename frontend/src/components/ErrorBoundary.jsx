import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Rendering Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
    try {
      localStorage.setItem('__last_react_error', JSON.stringify({
        message: error?.message || String(error),
        stack: error?.stack,
        componentStack: errorInfo?.componentStack
      }));
    } catch (_) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          padding: 24,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: 620,
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0',
            textAlign: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              marginBottom: 16
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', margin: '0 0 8px 0' }}>
              Sahifani yuklashda xatolik yuz berdi
            </h2>
            <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 18px 0', lineHeight: 1.5 }}>
              Ushbu bo‘lim ma'lumotlarini yuklashda vaqtinchalik xatolik paydo bo‘ldi. Qaytadan yuklashingiz yoki bosh sahifaga qaytishingiz mumkin:
            </p>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #FECDD3',
              borderRadius: 8,
              padding: 12,
              textAlign: 'left',
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#B91C1C',
              maxHeight: 160,
              overflowY: 'auto',
              marginBottom: 20,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#6C5CE7',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer'
                }}>
                Sahifani Qayta Yuklash
              </button>
              <button
                onClick={() => {
                  try {
                    sessionStorage.removeItem('smart_super_admin_impersonated_school');
                    const schoolIdKeys = Object.keys(sessionStorage).filter(k => k.startsWith('school_active_tab_'));
                    schoolIdKeys.forEach(k => sessionStorage.removeItem(k));
                  } catch (_) {}
                  window.location.reload();
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer'
                }}>
                Bosh Boshqarmaga Qaytish
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
