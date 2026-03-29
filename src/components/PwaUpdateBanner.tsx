import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

/**
 * PWA 업데이트 감지 배너
 * - Vercel에 새 버전이 배포된 후 앱 재방문 시 service worker가 업데이트를 감지
 * - 상단에 슬라이드-다운 배너를 표시
 * - "지금 업데이트" 클릭 시 새 SW를 활성화하고 페이지 새로고침
 */
export default function PwaUpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // 1시간마다 SW 업데이트 체크
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (needRefresh) setShowBanner(true);
  }, [needRefresh]);

  const handleUpdate = () => {
    setShowBanner(false);
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          key="pwa-banner"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            position: 'fixed',
            top: 'var(--header-h, 56px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            zIndex: 200,
            padding: '0 12px',
          }}
        >
          <div
            style={{
              background: 'var(--color-primary-800)',
              borderRadius: '0 0 14px 14px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 16px rgb(0 0 0 / 0.25)',
            }}
          >
            {/* 아이콘 */}
            <RefreshCw size={18} color="#a7f3d0" style={{ flexShrink: 0 }} />

            {/* 텍스트 */}
            <div style={{ flex: 1 }}>
              <p style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 700,
                color: '#ecfdf5',
                lineHeight: 1.3,
              }}>
                새 버전이 있습니다 🎉
              </p>
              <p style={{
                margin: '2px 0 0',
                fontSize: '11px',
                color: '#6ee7b7',
              }}>
                업데이트 후 최신 기능을 사용할 수 있습니다.
              </p>
            </div>

            {/* 업데이트 버튼 */}
            <button
              onClick={handleUpdate}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              지금 업데이트
            </button>

            {/* 닫기 */}
            <button
              onClick={handleDismiss}
              aria-label="닫기"
              style={{
                background: 'none',
                border: 'none',
                color: '#6ee7b7',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
