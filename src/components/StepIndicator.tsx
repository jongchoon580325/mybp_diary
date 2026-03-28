const STEPS = ['1회', '2회', '3회', '평균'];

interface StepIndicatorProps {
  current: number; // 0~3 (3 = 평균 완료)
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
      {STEPS.map((label, idx) => {
        const isCompleted = idx < current;
        const isActive    = idx === current;

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? '1' : 'none' }}>
            {/* 원형 스텝 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  background: isCompleted
                    ? 'var(--color-primary-700)'
                    : isActive
                    ? 'transparent'
                    : 'var(--color-neutral-200)',
                  color: isCompleted ? '#fff' : isActive ? 'var(--color-primary-700)' : 'var(--color-neutral-400)',
                  border: isActive ? '2.5px solid var(--color-primary-700)' : 'none',
                  boxShadow: isActive ? '0 0 0 4px var(--color-primary-100)' : 'none',
                  animation: isActive ? 'pulse-step 1.5s ease-in-out infinite' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isCompleted ? '✓' : idx + 1 <= 3 ? idx + 1 : '∑'}
              </div>
              <span style={{
                fontSize: '10px', fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
              }}>
                {label}
              </span>
            </div>

            {/* 연결선 */}
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '3px', marginBottom: '14px', marginLeft: '2px', marginRight: '2px',
                background: isCompleted ? 'var(--color-primary-700)' : 'var(--color-neutral-200)',
                transition: 'background 0.3s ease',
                borderRadius: '2px',
              }} />
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes pulse-step {
          0%, 100% { box-shadow: 0 0 0 4px var(--color-primary-100); }
          50%       { box-shadow: 0 0 0 7px var(--color-primary-50); }
        }
      `}</style>
    </div>
  );
}
