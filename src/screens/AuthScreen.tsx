import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';

export default function AuthScreen() {
  const { signInWithGoogle, signInAsGuest } = useAuthContext();
  const [loading, setLoading] = useState<'google' | 'guest' | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null);
    setLoading('google');
    try {
      await signInWithGoogle();
    } catch (e: any) {
      // 팝업 닫기(popup-closed) 등 사용자 취소는 오류 표시 안 함
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        setError('Google 로그인에 실패했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading('guest');
    try {
      await signInAsGuest();
    } catch {
      setError('게스트 로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0',
        }}
      >
        {/* 로고 영역 */}
        <div style={{
          background: 'var(--color-primary-900)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <img src="/icon.svg" alt="BP Manager 로고" width={52} height={52} />
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.5px',
          marginBottom: '6px',
          textAlign: 'center',
        }}>
          BP Manager
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          marginBottom: '36px',
          textAlign: 'center',
        }}>
          연령대별 혈압 자가 관리 앱
        </p>

        {/* 로그인 카드 */}
        <div style={{
          width: '100%',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            marginBottom: '4px',
            textAlign: 'center',
          }}>
            시작하려면 로그인하세요
          </p>

          {/* Google 로그인 */}
          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '13px 16px',
              background: loading === 'google' ? '#e5e7eb' : '#ffffff',
              border: '1.5px solid #d1d5db',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 600,
              color: '#1f2937',
              cursor: loading !== null ? 'not-allowed' : 'pointer',
              opacity: loading !== null ? 0.7 : 1,
              transition: 'background 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {loading === 'google' ? (
              <Spinner />
            ) : (
              <GoogleIcon />
            )}
            {loading === 'google' ? '로그인 중...' : 'Google로 시작'}
          </button>

          {/* 구분선 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            color: 'var(--color-text-muted)', fontSize: '11px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            또는
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>

          {/* 게스트 로그인 */}
          <button
            onClick={handleGuest}
            disabled={loading !== null}
            style={{
              width: '100%',
              padding: '13px 16px',
              background: loading === 'guest' ? 'var(--color-primary-800)' : 'var(--color-primary-900)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: loading !== null ? 'not-allowed' : 'pointer',
              opacity: loading !== null ? 0.7 : 1,
              transition: 'background 0.15s',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading === 'guest' && <Spinner white />}
            {loading === 'guest' ? '로그인 중...' : '게스트로 시작'}
          </button>

          {/* 게스트 안내 */}
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            lineHeight: 1.6,
            marginTop: '2px',
          }}>
            게스트 모드는 이 기기에만 데이터가 저장됩니다.<br />
            Google 계정으로 연결하면 다기기 동기화가 가능합니다.
          </p>

          {/* 오류 메시지 */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '12px',
                color: 'var(--color-status-danger)',
                textAlign: 'center',
                marginTop: '4px',
              }}
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* 하단 면책 */}
        <p style={{
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          marginTop: '20px',
          lineHeight: 1.6,
        }}>
          ⚕ 이 앱은 건강 참고용이며 의료 진단이 아닙니다.
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function Spinner({ white }: { white?: boolean }) {
  return (
    <span style={{
      width: '16px', height: '16px',
      border: `2px solid ${white ? 'rgba(255,255,255,0.3)' : '#d1d5db'}`,
      borderTopColor: white ? '#ffffff' : '#374151',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}
