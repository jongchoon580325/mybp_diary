import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts';
import type { MeasurementSession, AgeGroup } from '../types';
import { getStandard } from '../constants/ageBPStandards';

interface ChartDataPoint {
  date: string;
  sys: number;
  dia: number;
  status: string;
}

interface BpLineChartProps {
  sessions: MeasurementSession[];
  ageGroup: AgeGroup | null;
  showReference: boolean;
  chartId?: string; // html2canvas 캡처용
}

function toChartData(sessions: MeasurementSession[]): ChartDataPoint[] {
  return [...sessions].reverse().map((s) => ({
    date: new Date(s.measured_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    sys:  s.avg_sys,
    dia:  s.avg_dia,
    status: s.ai_status,
  }));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const sys = payload.find((p: any) => p.dataKey === 'sys')?.value;
  const dia = payload.find((p: any) => p.dataKey === 'dia')?.value;
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      boxShadow: 'var(--shadow-md)', fontSize: '13px',
    }}>
      <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</p>
      <p style={{ margin: '0', color: '#1e5530' }}>수축기: <strong>{sys}</strong> mmHg</p>
      <p style={{ margin: '0', color: '#3b82f6' }}>이완기: <strong>{dia}</strong> mmHg</p>
    </div>
  );
}

export default function BpLineChart({ sessions, ageGroup, showReference, chartId }: BpLineChartProps) {
  const data = toChartData(sessions);
  const std  = ageGroup ? getStandard(ageGroup) : null;

  if (data.length === 0) {
    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
        측정 데이터가 없습니다
      </div>
    );
  }

  return (
    <div id={chartId} style={{ width: '100%', height: '260px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={false}
            unit=""
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '4px', paddingBottom: '4px' }}
            formatter={(v) => v === 'sys' ? '수축기' : '이완기'}
          />

          {/* 연령대 기준선 */}
          {showReference && std && (
            <>
              <ReferenceLine y={std.sys_normal}  stroke="#16a34a" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: '정상 상한', position: 'right', fontSize: 10, fill: '#16a34a' }} />
              <ReferenceLine y={std.sys_caution} stroke="#ca8a04" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: '주의 상한', position: 'right', fontSize: 10, fill: '#ca8a04' }} />
            </>
          )}

          <Line
            type="monotone" dataKey="sys" name="sys"
            stroke="#1e5530" strokeWidth={2.5}
            dot={{ r: 3, fill: '#1e5530', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            animationDuration={600}
          />
          <Line
            type="monotone" dataKey="dia" name="dia"
            stroke="#3b82f6" strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
