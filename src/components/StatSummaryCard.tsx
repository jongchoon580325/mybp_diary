import type { MeasurementSession } from '../types';

interface StatSummaryCardProps {
  sessions: MeasurementSession[];
}

interface StatItem {
  label: string;
  value: string | number;
  unit: string;
  color: string;
}

function calcStats(sessions: MeasurementSession[]) {
  if (sessions.length === 0) return null;

  const sysValues = sessions.map((s) => s.avg_sys);
  const diaValues = sessions.map((s) => s.avg_dia);

  const avgSys = Math.round(sysValues.reduce((a, b) => a + b, 0) / sysValues.length);
  const avgDia = Math.round(diaValues.reduce((a, b) => a + b, 0) / diaValues.length);
  const maxSys = Math.max(...sysValues);
  const count  = sessions.length;

  return { avgSys, avgDia, maxSys, count };
}

export default function StatSummaryCard({ sessions }: StatSummaryCardProps) {
  const stats = calcStats(sessions);

  if (!stats) {
    return (
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '13px',
      }}>
        통계 데이터가 없습니다
      </div>
    );
  }

  const items: StatItem[] = [
    { label: '평균 수축기',  value: stats.avgSys, unit: 'mmHg', color: '#1e5530' },
    { label: '평균 이완기',  value: stats.avgDia, unit: 'mmHg', color: '#3b82f6' },
    { label: '최고 수축기',  value: stats.maxSys, unit: 'mmHg', color: '#dc2626' },
    { label: '측정 횟수',    value: stats.count,  unit: '회',   color: 'var(--color-text-secondary)' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
    }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
          }}>
            {item.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{
              fontSize: '26px',
              fontWeight: 800,
              color: item.color,
              fontFamily: 'var(--font-mono)',
              lineHeight: 1,
            }}>
              {item.value}
            </span>
            <span style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
            }}>
              {item.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
