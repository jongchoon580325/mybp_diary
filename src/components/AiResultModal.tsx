import { motion, AnimatePresence } from 'framer-motion';
import type { AiJudgeResult } from '../types';

interface AiResultModalProps {
  result: (AiJudgeResult & { usedFallback: boolean }) | null;
  onClose: () => void;
}

const STATUS_CONFIG = {
  '정상':      { icon: '✅', color: 'var(--color-status-normal)',  bg: 'var(--color-status-normal-bg)' },
  '주의':      { icon: '⚠️', color: 'var(--color-status-caution)', bg: 'var(--color-status-caution-bg)' },
  '고혈압 의심': { icon: '🔴', color: 'var(--color-status-danger)',  bg: 'var(--color-status-danger-bg)' },
};

export default function AiResultModal({ result, onClose }: AiResultModalProps) {
  if (!result) return null;
  const cfg = STATUS_CONFIG[result.status];

  return (
    <AnimatePresence>
      {result && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              zIndex: 200,
            }}
          />

          {/* 모달 패널 */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="AI 판정 결과"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 40px)',
              maxWidth: '380px',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              zIndex: 201,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* 상단 상태 배너 */}
            <div style={{
              background: cfg.bg,
              padding: '20px 20px 16px',
              textAlign: 'center',
              borderBottom: `2px solid ${cfg.color}22`,
            }}>
              <div style={{ fontSize: '36px', marginBottom: '6px' }}>{cfg.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: cfg.color }}>
                {result.status}
              </div>
              <div style={{ fontSize: '13px', color: cfg.color, marginTop: '4px', fontWeight: 500 }}>
                {result.message}
              </div>
              {result.usedFallback && (
                <div style={{
                  marginTop: '8px', fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  background: 'rgba(0,0,0,0.06)',
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 10px', display: 'inline-block',
                }}>
                  규칙 기반 판정 (AI 미연동)
                </div>
              )}
            </div>

            {/* 조언 */}
            <div style={{ padding: '16px 20px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                생활습관 조언
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                {result.advice}
              </p>
            </div>

            {/* 면책 조항 */}
            <div style={{
              margin: '0 20px 16px',
              padding: '10px 12px',
              background: 'var(--color-neutral-100)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                ⚕️ {result.disclaimer}
              </p>
            </div>

            {/* 확인 버튼 */}
            <div style={{ padding: '0 20px 20px' }}>
              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '13px',
                  background: 'var(--color-primary-700)',
                  color: '#fff', border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                확인
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
