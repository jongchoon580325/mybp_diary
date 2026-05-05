import { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlucoseDB } from '../hooks/useGlucoseDB';
import { useModal } from '../hooks/useModal';
import type { GlucoseRecord, GlucoseStatus, MealTag } from '../types';

// ── 상수 ─────────────────────────────────────────────────────────────────────

type StatusFilter = 'ALL' | GlucoseStatus;
type TagFilter    = 'ALL' | MealTag;

const STATUS_COLOR: Record<GlucoseStatus, string> = {
  '정상':  '#16a34a',
  '주의':  '#ca8a04',
  '고혈당': '#dc2626',
  '저혈당': '#7c3aed',
};

const STATUS_BG: Record<GlucoseStatus, string> = {
  '정상':  '#f0fdf4',
  '주의':  '#fefce8',
  '고혈당': '#fff1f2',
  '저혈당': '#f5f3ff',
};

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

function groupByMonth(records: GlucoseRecord[]): Map<string, GlucoseRecord[]> {
  const map = new Map<string, GlucoseRecord[]>();
  for (const r of records) {
    const key = new Date(r.measured_at).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long',
    });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function GlucoseRecordScreen() {
  const db = useGlucoseDB();
  const { showToast } = useModal();

  const [records,      setRecords]      = useState<GlucoseRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [tagFilter,    setTagFilter]    = useState<TagFilter>('ALL');

  const loadRecords = useCallback(async () => {
    const data = await db.getAllRecords();
    setRecords(data);
  }, [db]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const filtered = records.filter((r) => {
    if (statusFilter !== 'ALL' && r.status   !== statusFilter) return false;
    if (tagFilter    !== 'ALL' && r.meal_tag !== tagFilter)    return false;
    return true;
  });

  const grouped = groupByMonth(filtered);

  // ── 단건 삭제 ──────────────────────────────────────────────────────────────
  const handleDeleteRecord = async (id: string) => {
    await db.deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r.record_id !== id));
    showToast('기록이 삭제되었습니다.', 'success');
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── 툴바 ── */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        {/* 상태 필터 + 아이콘 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {(['ALL', '정상', '주의', '고혈당', '저혈당'] as StatusFilter[]).map((key) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '4px 9px', borderRadius: 'var(--radius-full)',
                  fontSize: '11px', fontWeight: statusFilter === key ? 700 : 500,
                  cursor: 'pointer',
                  background: statusFilter === key
                    ? (key === 'ALL' ? 'var(--color-primary-700)' : STATUS_BG[key as GlucoseStatus])
                    : 'var(--color-neutral-100)',
                  color: statusFilter === key
                    ? (key === 'ALL' ? '#fff' : STATUS_COLOR[key as GlucoseStatus])
                    : 'var(--color-text-secondary)',
                  border: statusFilter === key && key !== 'ALL'
                    ? `1px solid ${STATUS_COLOR[key as GlucoseStatus]}44`
                    : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {key === 'ALL' ? '전체' : key}
              </button>
            ))}
          </div>
        </div>

        {/* 식사 태그 필터 */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {(['ALL', '공복', '식전', '식후 1h', '식후 2h', '취침 전'] as TagFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setTagFilter(key)}
              style={{
                padding: '3px 8px', borderRadius: 'var(--radius-full)',
                fontSize: '11px', fontWeight: tagFilter === key ? 700 : 400,
                cursor: 'pointer',
                background: tagFilter === key ? 'var(--color-primary-50)' : 'transparent',
                color: tagFilter === key ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                border: tagFilter === key ? '1px solid var(--color-primary-300)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {key === 'ALL' ? '모든 시점' : key}
            </button>
          ))}
        </div>
      </div>

      {/* 건수 요약 */}
      <div style={{ padding: '7px 16px', fontSize: '12px', color: 'var(--color-text-muted)', background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-border)' }}>
        총 <strong style={{ color: 'var(--color-text-primary)' }}>{filtered.length}</strong>건
      </div>

      {/* 기록 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💉</div>
            <p style={{ margin: 0 }}>혈당 기록이 없습니다.</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([month, monthRecords]) => (
            <div key={month}>
              <div style={{ padding: '16px 0 6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.5px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                {month} · {monthRecords.length}건
              </div>
              <AnimatePresence>
                {monthRecords.map((r) => {
                  const color   = STATUS_COLOR[r.status];
                  const bg      = STATUS_BG[r.status];
                  const dayStr  = new Date(r.measured_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' });
                  const timeStr = new Date(r.measured_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <motion.div
                      key={r.record_id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                      style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)', gap: '12px' }}
                    >
                      {/* 상태 도트 */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: bg, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                      </div>

                      {/* 날짜 + 시점 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {dayStr} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '12px' }}>{timeStr}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {r.meal_tag}{r.note && <span style={{ marginLeft: '4px' }}>· 📝</span>}
                        </div>
                      </div>

                      {/* 수치 */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'DM Mono, monospace', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                          {r.glucose_level}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>mg/dL</div>
                      </div>

                      {/* 상태 배지 + 삭제 버튼 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color, background: bg, border: `1px solid ${color}33`, borderRadius: 'var(--radius-full)', padding: '2px 7px', whiteSpace: 'nowrap' }}>
                          {r.status}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRecord(r.record_id); }}
                          style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
