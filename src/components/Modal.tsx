import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../hooks/useModal';

export default function Modal() {
  const { isOpen, type, title, message, onConfirm, onCancel, closeModal } = useModal();
  const confirmRef = useRef<HTMLButtonElement>(null);

  // ESC 키 닫힘
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, closeModal]);

  // focus trap
  useEffect(() => {
    if (isOpen) confirmRef.current?.focus();
  }, [isOpen]);

  const isDanger = type === 'danger-confirm';
  const isAlert  = type === 'alert';
  const isDeviation = type === 'deviation-warning';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
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
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 48px)',
              maxWidth: '380px',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              zIndex: 201,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h3
              id="modal-title"
              style={{ margin: '0 0 10px 0', fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)' }}
            >
              {title}
            </h3>
            <p
              style={{
                margin: '0 0 20px 0', fontSize: '14px', lineHeight: 1.6,
                color: 'var(--color-text-secondary)', whiteSpace: 'pre-line',
              }}
            >
              {message}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {/* 취소 버튼 (alert 제외) */}
              {!isAlert && (
                <button
                  onClick={() => { onCancel?.(); closeModal(); }}
                  style={{
                    padding: '10px 20px', borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {isDeviation ? '재측정' : '취소'}
                </button>
              )}

              {/* 확인 버튼 */}
              <button
                ref={confirmRef}
                onClick={() => { onConfirm?.(); closeModal(); }}
                style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isDanger ? 'var(--color-status-danger)' : 'var(--color-primary-700)',
                  color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {isAlert ? '확인' : isDeviation ? '그대로 저장' : isDanger ? '삭제' : '확인'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
