import type { MealTag } from '../types';

const MEAL_TAGS: MealTag[] = ['공복', '식전', '식후 1h', '식후 2h', '취침 전'];

interface Props {
  value:    MealTag;
  onChange: (tag: MealTag) => void;
}

export default function MealTagGroup({ value, onChange }: Props) {
  return (
    <div>
      <p style={{
        margin: '0 0 10px 0',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
      }}>
        측정 시점
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {MEAL_TAGS.map((tag) => {
          const isActive = value === tag;
          return (
            <button
              key={tag}
              onClick={() => onChange(tag)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${isActive ? 'var(--color-primary-700)' : 'var(--color-border)'}`,
                background: isActive ? 'var(--color-primary-700)' : 'var(--color-surface)',
                color: isActive ? '#fff' : 'var(--color-text-primary)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
