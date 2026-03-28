import { motion } from 'framer-motion';

interface ToggleGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}

export default function ToggleGroup<T extends string>({
  label, options, value, onChange,
}: ToggleGroupProps<T>) {
  return (
    <div>
      <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
      <div
        role="group"
        style={{
          display: 'flex',
          background: 'var(--color-neutral-100)',
          borderRadius: 'var(--radius-md)',
          padding: '3px',
          gap: '2px',
        }}
      >
        {options.map((opt) => {
          const isActive = opt === value;
          return (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(opt)}
              aria-pressed={isActive}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 'calc(var(--radius-md) - 3px)',
                border: 'none',
                background: isActive ? 'var(--color-primary-700)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
