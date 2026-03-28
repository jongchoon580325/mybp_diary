import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';
import { FileDown, ToggleLeft, ToggleRight } from 'lucide-react';
import BpLineChart from '../components/BpLineChart';
import StatSummaryCard from '../components/StatSummaryCard';
import { useDB } from '../hooks/useDB';
import { useModal } from '../hooks/useModal';
import { useSettingsStore } from '../store/settingsStore';
import type { MeasurementSession } from '../types';
import { generatePdfReport } from '../services/pdfReport';

// ── 기간 필터 정의 ────────────────────────────────────────────────────────────
type PeriodKey = '1W' | '2W' | '1M' | '3M' | 'ALL';

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: '1W',  label: '1주' },
  { key: '2W',  label: '2주' },
  { key: '1M',  label: '1개월' },
  { key: '3M',  label: '3개월' },
  { key: 'ALL', label: '전체' },
];

function getPeriodStart(key: PeriodKey): Date | null {
  if (key === 'ALL') return null;
  const now = new Date();
  const days = key === '1W' ? 7 : key === '2W' ? 14 : key === '1M' ? 30 : 90;
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function filterByPeriod(sessions: MeasurementSession[], key: PeriodKey): MeasurementSession[] {
  const start = getPeriodStart(key);
  if (!start) return sessions;
  return sessions.filter((s) => new Date(s.measured_at) >= start);
}

// ── 맥박 미니 차트 ──────────────────────────────────────────────────────────
function toPulseData(sessions: MeasurementSession[]) {
  return [...sessions].reverse().map((s) => ({
    date: new Date(s.measured_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    pul:  s.avg_pul,
  }));
}

function PulseTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '12px',
    }}>
      <p style={{ margin: '0 0 2px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</p>
      <p style={{ margin: 0, color: '#7c3aed' }}>맥박: <strong>{payload[0]?.value}</strong> bpm</p>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function ChartScreen() {
  const { ageGroup, userName }           = useSettingsStore();
  const { getAllSessions }               = useDB();
  const { showToast }                    = useModal();

  const [allSessions, setAllSessions]    = useState<MeasurementSession[]>([]);
  const [period,      setPeriod]         = useState<PeriodKey>('1M');
  const [showRef,     setShowRef]        = useState(true);
  const [pdfLoading,  setPdfLoading]     = useState(false);

  const filtered = filterByPeriod(allSessions, period);

  const loadSessions = useCallback(async () => {
    const data = await getAllSessions();
    data.sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime());
    setAllSessions(data);
  }, [getAllSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handlePdf = async () => {
    if (filtered.length === 0) {
      showToast('출력할 데이터가 없습니다.', 'warning');
      return;
    }
    setPdfLoading(true);
    try {
      await generatePdfReport({
        sessions: filtered,
        ageGroup,
        period,
        chartElementId: 'bp-line-chart',
        userName: userName || undefined,
      });
      showToast('PDF 저장이 완료되었습니다.', 'success');
    } catch (err) {
      console.error(err);
      showToast('PDF 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  const pulseData = toPulseData(filtered);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── 기간 필터 탭 ── */}
      <div style={{
        display: 'flex', gap: '6px',
        background: 'var(--color-neutral-100)',
        borderRadius: 'var(--radius-full)',
        padding: '4px',
      }}>
        {PERIOD_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            style={{
              flex: 1,
              padding: '7px 0',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: period === key ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              background: period === key ? 'var(--color-primary-700)' : 'transparent',
              color: period === key ? '#fff' : 'var(--color-text-secondary)',
              boxShadow: period === key ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 혈압 추이 차트 ── */}
      <section style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            혈압 추이
          </h2>
          <button
            onClick={() => setShowRef((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: 'var(--color-text-muted)', padding: '2px 4px',
            }}
          >
            {showRef
              ? <ToggleRight size={18} color="var(--color-primary-600)" />
              : <ToggleLeft  size={18} color="var(--color-text-muted)" />
            }
            기준선
          </button>
        </div>

        <BpLineChart
          sessions={filtered}
          ageGroup={ageGroup}
          showReference={showRef}
          chartId="bp-line-chart"
        />
      </section>

      {/* ── 맥박 미니 차트 ── */}
      {pulseData.length > 0 && (
        <section style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            맥박 추이
          </h2>
          <div style={{ width: '100%', height: '130px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pulseData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<PulseTooltip />} />
                <Line
                  type="monotone" dataKey="pul"
                  stroke="#7c3aed" strokeWidth={2}
                  dot={{ r: 2.5, fill: '#7c3aed', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ── 통계 요약 ── */}
      <section>
        <h2 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          통계 요약{' '}
          <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
            ({filtered.length}회 기준)
          </span>
        </h2>
        <StatSummaryCard sessions={filtered} />
      </section>

      {/* ── PDF 출력 버튼 ── */}
      <div style={{ paddingBottom: '8px' }}>
        <button
          onClick={handlePdf}
          disabled={pdfLoading}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px',
            background: pdfLoading ? 'var(--color-neutral-300)' : 'var(--color-primary-700)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px', fontWeight: 600,
            cursor: pdfLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {pdfLoading ? (
            <>
              <span style={{
                width: '16px', height: '16px',
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }} />
              PDF 생성 중...
            </>
          ) : (
            <>
              <FileDown size={18} />
              PDF 리포트 저장
            </>
          )}
        </button>
      </div>

    </div>
  );
}
