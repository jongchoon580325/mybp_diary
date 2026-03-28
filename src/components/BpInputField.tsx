import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BpInputFieldProps {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  onComplete?: () => void;   // 3자리 완성 시 다음 필드로 포커스
  error?: string;
  min: number;
  max: number;
  placeholder?: string;
}

const BpInputField = forwardRef<HTMLInputElement, BpInputFieldProps>(
  ({ label, unit, value, onChange, onComplete, error, min, max, placeholder }, ref) => {
    const [focused, setFocused] = useState(false);

    const state: 'error' | 'filled' | 'focused' | 'empty' =
      error    ? 'error'   :
      value    ? 'filled'  :
      focused  ? 'focused' : 'empty';

    const borderColor =
      state === 'error'   ? 'var(--color-status-danger)'  :
      state === 'filled'  ? 'var(--color-primary-400)'    :
      state === 'focused' ? 'var(--color-primary-600)'    :
                            'var(--color-border)';

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 3); // 3자리 제한
      onChange(digits);
      if (digits.length === 3) {
        onComplete?.(); // 3자리 완성 → 다음 필드 포커스
      }
    }

    return (
      <div style={{ flex: 1, minWidth: '80px' }}>
        {/* 라벨 + 단위 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            {label}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'DM Mono, monospace' }}>
            {unit}
          </span>
        </div>

        <input
          ref={ref}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={3}
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder ?? String(Math.round((min + max) / 2))}
          style={{
            width: '100%',
            padding: '14px 12px',
            fontSize: '22px',
            fontWeight: 700,
            fontFamily: 'DM Mono, monospace',
            textAlign: 'center',
            background: state === 'filled' ? 'var(--color-primary-50)' : 'var(--color-surface)',
            border: `2px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            color: 'var(--color-text-primary)',
            transition: 'border-color 0.15s, background 0.15s',
            letterSpacing: '1px',
            boxSizing: 'border-box',
          }}
        />

        {/* 에러 메시지 */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                margin: '4px 0 0 0', fontSize: '11px',
                color: 'var(--color-status-danger)', lineHeight: 1.4,
              }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

BpInputField.displayName = 'BpInputField';
export default BpInputField;
