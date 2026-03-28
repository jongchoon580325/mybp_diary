import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, HeartPulse } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { getStandard } from '../constants/ageBPStandards';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { ageGroup } = useSettingsStore();
  const std = ageGroup ? getStandard(ageGroup) : null;

  const notices = [
    {
      icon: <HeartPulse size={16} color="#16a34a" />,
      iconBg: '#f0fdf4',
      title: '올바른 혈압 측정 방법',
      body: '측정 전 5분 이상 안정 후 측정하세요. 카페인·운동은 30분 전부터 삼가고, 등받이에 기댄 앉은 자세에서 팔을 심장 높이로 유지하세요.',
    },
    {
      icon: <Info size={16} color="#2563eb" />,
      iconBg: '#eff6ff',
      title: '연령대별 기준 안내',
      body: std
        ? `${ageGroup} 기준\n• 정상: 수축기 < ${std.sys_normal} / 이완기 < ${std.dia_normal} mmHg\n• 주의: 수축기 ${std.sys_normal}~${std.sys_caution - 1} mmHg\n• 고혈압 의심: 수축기 ≥ ${std.sys_caution} mmHg`
        : '연령대를 설정하면 맞춤 기준이 표시됩니다.',
    },
    {
      icon: <AlertTriangle size={16} color="#ca8a04" />,
      iconBg: '#fefce8',
      title: '면책 안내',
      body: '이 앱은 개인 건강 참고용이며 의료 진단이 아닙니다. 혈압 이상이 의심되면 의료 전문가와 반드시 상담하시기 바랍니다.',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(3px)',
              zIndex: 400,
            }}
          />

          {/* 드로어 패널 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: 'min(320px, 92vw)',
              background: 'var(--color-bg)',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
              zIndex: 401,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-primary-900)',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>알림 및 안내</span>
              <button
                onClick={onClose}
                aria-label="닫기"
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  borderRadius: 'var(--radius-md)', padding: '6px',
                  cursor: 'pointer', color: '#fff', display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 안내 카드 목록 */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notices.map((n, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: n.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {n.icon}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {n.title}
                    </span>
                  </div>
                  <p style={{
                    margin: 0, fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                  }}>
                    {n.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
