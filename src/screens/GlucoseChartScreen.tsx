import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { useGlucoseDB } from '../hooks/useGlucoseDB';
import { GLUCOSE_STANDARDS } from '../constants/glucoseStandards';
import type { GlucoseRecord, GlucoseStatus, MealTag } from '../types';

// ── 타입 & 상수 ───────────────────────────────────────────────────────────────

type PeriodKey = '1W' | '2W' | '1M' | '3M' | 'ALL';

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: '1W',  label: '1주' },
  { key: '2W',  label: '2주' },
  { key: '1M',  label: '1개월' },
  { key: '3M',  label: '3개월' },
  { key: 'ALL', label: '전체' },
];

const TAG_OPTIONS: { key: 'ALL' | MealTag; label: string }[] = [
  { key: 'ALL',     label: '전체' },
  { key: '공복',    label: '공복' },
  { key: '식전',    label: '식전' },
  { key: '식후 1h', label: '식후 1h' },
  { key: '식후 2h', label: '식후 2h' },
  { key: '취침 전', label: '취침 전' },
];

const STATUS_COLOR: Record<GlucoseStatus, string> = {
  '정상':  '#16a34a',
  '주의':  '#ca8a04',
  '고혈당': '#dc2626',
  '저혈당': '#7c3aed',
};

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

function getPeriodStart(key: PeriodKey): Date | null {
  if (key === 'ALL') return null;
  const days = key === '1W' ? 7 : key === '2W' ? 14 : key === '1M' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── 커스텀 툴팁 ───────────────────────────────────────────────────────────────

function GlucoseTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const record: GlucoseRecord = payload[0]?.payload?.record;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px', fontSize: '12px',
    }}>
      <p style={{ margin: '0 0 2px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</p>
      <p style={{ margin: '0 0 2px', color: 'var(--color-primary-700)' }}>
        혈당: <strong>{payload[0]?.value}</strong> mg/dL
      </p>
      {record && (
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          {record.meal_tag} ·{' '}
          <span style={{ color: STATUS_COLOR[record.status], fontWeight: 600 }}>{record.status}</span>
        </p>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function GlucoseChartScreen() {
  const db = useGlucoseDB();

  const [allRecords, setAllRecords] = useState<GlucoseRecord[]>([]);
  const [period,     setPeriod]     = useState<PeriodKey>('1M');
  const [tagFilter,  setTagFilter]  = useState<'ALL' | MealTag>('ALL');

  const loadRecords = useCallback(async () => {
    const data = await db.getAllRecords();
    // 오래된 순 정렬 (차트용)
    data.sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
    setAllRecords(data);
  }, [db]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  // ── 필터 적용 ──
  const periodStart = getPeriodStart(period);
  const filtered = allRecords.filter((r) => {
    if (periodStart && new Date(r.measured_at) < periodStart) return false;
    if (tagFilter !== 'ALL' && r.meal_tag !== tagFilter)       return false;
    return true;
  });

  const chartData = filtered.map((r) => ({
    date:   new Date(r.measured_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    level:  r.glucose_level,
    record: r,
  }));

  // ── 통계 ──
  const count = filtered.length;
  const avg   = count ? Math.round(filtered.reduce((s, r) => s + r.glucose_level, 0) / count) : null;
  const minV  = count ? Math.min(...filtered.map((r) => r.glucose_level)) : null;
  const maxV  = count ? Math.max(...filtered.map((r) => r.glucose_level)) : null;

  const statusCount = filtered.reduce<Partial<Record<GlucoseStatus, number>>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  // ADA 2025 기준선 (태그 선택 시)
  const std = tagFilter !== 'ALL' ? GLUCOSE_STANDARDS[tagFilter] : null;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* 기간 필터 */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {PERIOD_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              style={{
                padding: '5px 12px', borderRadius: 'var(--radius-full)',
                border: 'none', cursor: 'pointer', fontSize: '12px',
                fontWeight: period === key ? 700 : 400,
                background: period === key ? 'var(--color-primary-700)' : 'var(--color-neutral-100)',
                color: period === key ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 식사 태그 필터 */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          측정 시점 필터
        </p>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {TAG_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTagFilter(key)}
              style={{
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                fontSize: '12px', fontWeight: tagFilter === key ? 700 : 400,
                cursor: 'pointer',
                background: tagFilter === key ? 'var(--color-primary-50)' : 'transparent',
                color: tagFilter === key ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                border: tagFilter === key ? '1px solid var(--color-primary-300)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 통계 카드 */}
      {count > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { label: '평균', value: avg,   unit: 'mg/dL' },
            { label: '최저', value: minV,  unit: 'mg/dL' },
            { label: '최고', value: maxV,  unit: 'mg/dL' },
            { label: '건수', value: count, unit: '건' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="card" style={{ padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>{label}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'DM Mono, monospace', color: 'var(--color-text-primary)' }}>
                {value}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>{unit}</div>
            </div>
          ))}
        </div>
      )}

      {/* 판정 분포 */}
      {count > 0 && (
        <div className="card" style={{ padding: '12px 16px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            판정 분포
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {(['정상', '주의', '고혈당', '저혈당'] as GlucoseStatus[]).map((s) => {
              const n = statusCount[s] ?? 0;
              if (n === 0) return null;
              const pct = Math.round((n / count) * 100);
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLOR[s], flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: STATUS_COLOR[s], fontWeight: 600 }}>{s}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{n}건 ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 혈당 라인 차트 */}
      <div className="card" style={{ padding: '16px' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          혈당 추이
          {std && (
            <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
              ({tagFilter} ADA 기준선)
            </span>
          )}
        </p>

        {count === 0 ? (
          <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-border)" />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--color-border)" domain={['auto', 'auto']} />
              <Tooltip content={<GlucoseTooltip />} />

              {/* ADA 2025 기준선 (태그 선택 시) */}
              {std && (
                <>
                  <ReferenceLine
                    y={std.low_threshold}
                    stroke="#7c3aed" strokeDasharray="4 3" strokeWidth={1.2}
                    label={{ value: `저혈당 ${std.low_threshold}`, position: 'right', fontSize: 9, fill: '#7c3aed' }}
                  />
                  <ReferenceLine
                    y={std.normal_max + 1}
                    stroke="#16a34a" strokeDasharray="4 3" strokeWidth={1.2}
                    label={{ value: `정상한계 ${std.normal_max + 1}`, position: 'right', fontSize: 9, fill: '#16a34a' }}
                  />
                  <ReferenceLine
                    y={std.caution_max + 1}
                    stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1.2}
                    label={{ value: `고혈당 ${std.caution_max + 1}`, position: 'right', fontSize: 9, fill: '#dc2626' }}
                  />
                </>
              )}

              <Line
                type="monotone"
                dataKey="level"
                stroke="var(--color-primary-600)"
                strokeWidth={2}
                dot={(props: any) => {
                  const record: GlucoseRecord = props.payload?.record;
                  return (
                    <circle
                      key={props.key}
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={record ? STATUS_COLOR[record.status] : 'var(--color-primary-600)'}
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                  );
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p style={{ margin: 0, textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
        기준선은 ADA 2025 가이드라인 기반 참고값입니다.
      </p>
    </div>
  );
}
