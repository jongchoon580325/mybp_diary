import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../hooks/useModal';

const VARIANT_STYLES = {
  success: { bg: 'var(--color-status-normal)',  icon: '✅' },
  error:   { bg: 'var(--color-status-danger)',   icon: '❌' },
  warning: { bg: 'var(--color-status-caution)',  icon: '⚠️' },
};

export default function ToastNotification() {
  const { toastVisible, toastMessage, toastVariant } = useModal();
  const style = VARIANT_STYLES[toastVariant];

  return (
    <AnimatePresence>
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          style={{
            position: 'fixed',
            top: 'calc(var(--header-h) + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '360px',
            width: 'calc(100% - 32px)',
            background: style.bg,
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 300,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <span style={{ fontSize: '18px' }}>{style.icon}</span>
          <span>{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
