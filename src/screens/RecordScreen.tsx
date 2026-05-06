import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SessionDetailModal from '../components/SessionDetailModal';
import { useDB } from '../hooks/useDB';
import { useModal } from '../hooks/useModal';
import { useSettingsStore } from '../store/settingsStore';
import { getStandard } from '../constants/ageBPStandards';
import type { MeasurementSession, BpStatus } from '../types';

// ── 상태 필터 옵션 ────────────────────────────────────────────────────────────
type StatusFilter = 'ALL' | BpStatus;

const STATUS_FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL',      label: '전체' },
  { key: '정상',     label: '정상' },
  { key: '주의',     label: '주의' },
  { key: '고혈압 의심', label: '고혈압' },
];

const STATUS_COLOR: Record<string, string> = {
  '정상':      '#16a34a',
  '주의':      '#ca8a04',
  '고혈압 의심': '#dc2626',
};

const STATUS_BG: Record<string, string> = {
  '정상':      '#f0fdf4',
  '주의':      '#fefce8',
  '고혈압 의심': '#fff1f2',
};

// ── 날짜 그룹 헬퍼 ────────────────────────────────────────────────────────────
function groupByMonth(sessions: MeasurementSession[]): Map<string, MeasurementSession[]> {
  const map = new Map<string, MeasurementSession[]>();
  for (const s of sessions) {
    const key = new Date(s.measured_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function RecordScreen() {
  const { getAllSessions, updateSession, deleteSession } = useDB();
  const { showToast } = useModal();
  const { ageGroup } = useSettingsStore();

  const [sessions,       setSessions]       = useState<MeasurementSession[]>([]);
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>('ALL');
  const [selectedSession, setSelectedSession] = useState<MeasurementSession | null>(null);

  // 현재 연령대 기준값
  const std = ageGroup ? getStandard(ageGroup) : null;

  // ── 데이터 로드 ──
  const loadSessions = useCallback(async () => {
    const data = await getAllSessions();
    setSessions(data); // getAllSessions already returns newest-first
  }, [getAllSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ── 필터 적용 ──
  const filtered = statusFilter === 'ALL'
    ? sessions
    : sessions.filter((s) => s.ai_status === statusFilter);

  const grouped = groupByMonth(filtered);

  // ── 메모 저장 ──
  const handleSaveMemo = async (id: string, memo: string) => {
    await updateSession(id, { memo });
    setSessions((prev) =>
      prev.map((s) => s.session_id === id ? { ...s, memo } : s)
    );
    if (selectedSession?.session_id === id) {
      setSelectedSession((prev) => prev ? { ...prev, memo } : null);
    }
    showToast('메모가 저장되었습니다.', 'success');
  };

  // ── 단건 삭제 ──
  const handleDeleteSession = async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.session_id !== id));
    showToast('기록이 삭제되었습니다.', 'success');
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── 툴바 ── */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '8px',
        background: 'var(--color-surface)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        {/* 상태 필터 */}
        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
          {STATUS_FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: statusFilter === key ? 700 : 500,
                cursor: 'pointer',
                background: statusFilter === key
                  ? (key === 'ALL' ? 'var(--color-primary-700)' : STATUS_BG[key] ?? 'var(--color-primary-700)')
                  : 'var(--color-neutral-100)',
                color: statusFilter === key
                  ? (key === 'ALL' ? '#fff' : STATUS_COLOR[key] ?? '#fff')
                  : 'var(--color-text-secondary)',
                border: statusFilter === key && key !== 'ALL'
                  ? `1px solid ${STATUS_COLOR[key]}44`
                  : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 아이콘 버튼들 */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {std ? (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '1.5px',
              fontSize: '11px', letterSpacing: '0.3px',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a' }}>
                <CheckCircle2 size={14} />
                정상 : ≤{std.sys_normal}/{std.dia_normal}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ca8a04' }}>
                <AlertTriangle size={14} />
                주의 : {std.sys_normal + 1}/{std.dia_normal + 1}~{std.sys_caution - 1}/{std.dia_caution - 1}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#dc2626' }}>
                <XCircle size={14} />
                경고 : ≥{std.sys_caution}/{std.dia_caution}
              </span>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '1.5px',
              fontSize: '11px', letterSpacing: '0.3px',
              color: 'var(--color-text-muted)',
            }}>
              <span>연령대를 설정해 주세요.</span>
            </div>
          )}
        </div>
      </div>


      {/* ── 건수 요약 ── */}
      <div style={{
        padding: '8px 16px',
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        background: 'var(--color-neutral-50)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        총 <strong style={{ color: 'var(--color-text-primary)' }}>{filtered.length}</strong>건
        {statusFilter !== 'ALL' && (
          <span> ({statusFilter})</span>
        )}
      </div>

      {/* ── 기록 목록 ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            color: 'var(--color-text-muted)', fontSize: '14px',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
            <p style={{ margin: 0 }}>
              {statusFilter === 'ALL' ? '측정 기록이 없습니다.' : `${statusFilter} 기록이 없습니다.`}
            </p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([month, monthSessions]) => (
            <div key={month}>
              {/* 월별 헤더 */}
              <div style={{
                padding: '16px 0 6px',
                fontSize: '12px', fontWeight: 700,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.5px',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '4px',
              }}>
                {month} · {monthSessions.length}건
              </div>

              {/* 세션 카드 목록 */}
              <AnimatePresence>
                {monthSessions.map((s) => {
                  const color  = STATUS_COLOR[s.ai_status] ?? '#555';
                  const bg     = STATUS_BG[s.ai_status] ?? '#f9f9f9';
                  const dayStr = new Date(s.measured_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });
                  const timeStr = new Date(s.measured_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <motion.div
                      key={s.session_id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                      onClick={() => setSelectedSession(s)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        gap: '12px',
                      }}
                    >
                      {/* 상태 도트 */}
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: bg,
                        border: `1.5px solid ${color}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                      </div>

                      {/* 날짜 + 메타 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {dayStr} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '12px' }}>{timeStr}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {s.time_slot} · {s.arm} · {s.posture}
                          {s.memo && <span style={{ marginLeft: '4px' }}>· 📝</span>}
                        </div>
                      </div>

                      {/* 혈압 수치 */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontSize: '16px', fontWeight: 800,
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-mono)',
                          lineHeight: 1,
                        }}>
                          <span style={{ color: '#1e5530' }}>{s.avg_sys}</span>
                          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/</span>
                          <span style={{ color: '#3b82f6' }}>{s.avg_dia}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#7c3aed', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                          ♥ {s.avg_pul}
                        </div>
                      </div>

                      {/* 상태 배지 + 화살표 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700,
                          color, background: bg,
                          border: `1px solid ${color}33`,
                          borderRadius: 'var(--radius-full)',
                          padding: '2px 7px',
                          whiteSpace: 'nowrap',
                        }}>
                          {s.ai_status}
                        </span>
                        <ChevronRight size={14} color="var(--color-text-muted)" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* ── 세션 상세 모달 ── */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onSaveMemo={handleSaveMemo}
        onDelete={handleDeleteSession}
      />
    </div>
  );
}
