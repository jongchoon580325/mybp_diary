import { motion } from 'framer-motion';
import { AGE_GROUPS, type AgeGroup } from '../types';
import { useSettingsStore } from '../store/settingsStore';

interface AgeChipGroupProps {
  value?: AgeGroup | null;
  onChange?: (group: AgeGroup) => void;
  label?: string;
}

export default function AgeChipGroup({ value, onChange, label = '연령대 선택' }: AgeChipGroupProps) {
  const { ageGroup: stored, setAgeGroup } = useSettingsStore();
  const selected = value !== undefined ? value : stored;

  const handleSelect = (group: AgeGroup) => {
    setAgeGroup(group);
    onChange?.(group);
  };

  return (
    <div>
      {label && (
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.3px',
          }}
        >
          {label}
          <span style={{ color: 'var(--color-status-danger)', marginLeft: '2px' }}>*</span>
        </p>
      )}
      <div
        role="group"
        aria-label="연령대"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '6px',
        }}
      >
        {AGE_GROUPS.map((group) => {
          const isActive = selected === group;
          return (
            <motion.button
              key={group}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleSelect(group)}
              aria-pressed={isActive}
              style={{
                padding: '7px 4px',
                borderRadius: 'var(--radius-full)',
                border: isActive
                  ? '2px solid var(--color-primary-700)'
                  : '2px solid var(--color-border)',
                background: isActive ? 'var(--color-primary-700)' : 'var(--color-surface)',
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                minHeight: '36px',
                whiteSpace: 'nowrap',
              }}
            >
              {group}
            </motion.button>
          );
        })}
      </div>
      {!selected && (
        <p
          style={{
            margin: '6px 0 0 0',
            fontSize: '12px',
            color: 'var(--color-status-caution)',
          }}
        >
          연령대를 선택해야 저장할 수 있습니다.
        </p>
      )}
    </div>
  );
}
