import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Check } from 'lucide-react';
import type { MeasurementSession } from '../types';

interface SessionDetailModalProps {
  session: MeasurementSession | null;
  onClose: () => void;
  onSaveMemo: (id: string, memo: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_COLOR: Record<string, string> = {
  '정상':      '#16a34a',
  '주의':      '#ca8a04',
  '고혈압 의심': '#dc2626',
};

const STATUS_BG: Record<string, string> = {
  '정상':      '#f0fdf4',
  '주의':      '#fefce8',
  '고혈압 의심': '#fef2f2',
};

export default function SessionDetailModal({
  session,
  onClose,
  onSaveMemo,
  onDelete,
}: SessionDetailModalProps) {
  const [editingMemo, setEditingMemo] = useState(false);
  const [memoValue,   setMemoValue]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);

  if (!session) return null;

  const color  = STATUS_COLOR[session.ai_status] ?? '#555';
  const bgColor = STATUS_BG[session.ai_status] ?? '#f9f9f9';

  const dateStr = new Date(session.measured_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
  const timeStr = new Date(session.measured_at).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  });

  const handleEditMemo = () => {
    setMemoValue(session.memo ?? '');
    setEditingMemo(true);
  };

  const handleSaveMemo = async () => {
    setSaving(true);
    await onSaveMemo(session.session_id, memoValue.trim());
    setSaving(false);
    setEditingMemo(false);
  };

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    await onDelete(session.session_id);
    setDeleting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {session && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              zIndex: 300,
            }}
          />

          {/* 모달 패널 */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="측정 기록 상세"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              maxHeight: '88vh',
              overflowY: 'auto',
              background: 'var(--color-surface)',
              borderRadius: '20px 20px 0 0',
              zIndex: 301,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* 드래그 핸들 */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--color-border)' }} />
            </div>

            {/* 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 20px 12px',
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{dateStr}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {timeStr} · {session.time_slot} · {session.arm} · {session.posture}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 상태 배너 */}
            <div style={{
              margin: '0 16px 16px',
              background: bgColor,
              border: `1px solid ${color}33`,
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>
                  AI 판정
                </span>
                <span style={{ fontSize: '17px', fontWeight: 800, color }}>
                  {session.ai_status}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {session.avg_sys}<span style={{ fontSize: '16px', fontWeight: 600 }}>/</span>{session.avg_dia}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  맥박 {session.avg_pul} bpm
                </div>
              </div>
            </div>

            {/* 3회 측정값 테이블 */}
            <div style={{ margin: '0 16px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                3회 측정값
              </div>
              <div style={{
                background: 'var(--color-neutral-100)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
              }}>
                {/* 테이블 헤더 */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr',
                  padding: '8px 14px',
                  background: 'var(--color-neutral-200)',
                  fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)',
                }}>
                  <span>회차</span>
                  <span style={{ textAlign: 'center' }}>수축기</span>
                  <span style={{ textAlign: 'center' }}>이완기</span>
                  <span style={{ textAlign: 'center' }}>맥박</span>
                </div>
                {session.readings.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr',
                      padding: '10px 14px',
                      borderTop: '1px solid var(--color-border)',
                      fontSize: '14px',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{i + 1}회</span>
                    <span style={{ textAlign: 'center', fontWeight: 700, color: '#1e5530', fontFamily: 'var(--font-mono)' }}>{r.sys}</span>
                    <span style={{ textAlign: 'center', fontWeight: 700, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>{r.dia}</span>
                    <span style={{ textAlign: 'center', fontWeight: 600, color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>{r.pul}</span>
                  </div>
                ))}
                {/* 평균 행 */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr',
                  padding: '10px 14px',
                  borderTop: `2px solid ${color}44`,
                  background: bgColor,
                  fontSize: '14px',
                }}>
                  <span style={{ color, fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center' }}>평균</span>
                  <span style={{ textAlign: 'center', fontWeight: 800, color: '#1e5530', fontFamily: 'var(--font-mono)' }}>{session.avg_sys}</span>
                  <span style={{ textAlign: 'center', fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>{session.avg_dia}</span>
                  <span style={{ textAlign: 'center', fontWeight: 700, color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>{session.avg_pul}</span>
                </div>
              </div>
            </div>

            {/* 메모 */}
            <div style={{ margin: '0 16px 16px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  메모
                </span>
                {!editingMemo && (
                  <button
                    onClick={handleEditMemo}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '3px',
                      fontSize: '12px', color: 'var(--color-primary-600)', padding: '2px 4px',
                    }}
                  >
                    <Pencil size={12} /> 편집
                  </button>
                )}
              </div>

              {editingMemo ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    autoFocus
                    value={memoValue}
                    onChange={(e) => setMemoValue(e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="메모를 입력하세요 (200자 이내)"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 12px',
                      border: '1.5px solid var(--color-primary-400)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      resize: 'none',
                      outline: 'none',
                      fontFamily: 'inherit',
                      lineHeight: 1.5,
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setEditingMemo(false)}
                      style={{
                        flex: 1, padding: '10px',
                        background: 'var(--color-neutral-200)',
                        border: 'none', borderRadius: 'var(--radius-md)',
                        fontSize: '14px', fontWeight: 600,
                        color: 'var(--color-text-secondary)', cursor: 'pointer',
                      }}
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveMemo}
                      disabled={saving}
                      style={{
                        flex: 2, padding: '10px',
                        background: 'var(--color-primary-700)',
                        border: 'none', borderRadius: 'var(--radius-md)',
                        fontSize: '14px', fontWeight: 600,
                        color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}
                    >
                      <Check size={15} /> {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: 'var(--color-neutral-100)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  color: session.memo ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  lineHeight: 1.5,
                  minHeight: '44px',
                }}>
                  {session.memo || '메모 없음'}
                </div>
              )}
            </div>

            {/* 삭제 버튼 */}
            <div style={{ margin: '0 16px 32px' }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  width: '100%', padding: '12px',
                  background: confirmDel ? '#dc2626' : 'var(--color-neutral-100)',
                  border: `1px solid ${confirmDel ? '#dc2626' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px', fontWeight: 600,
                  color: confirmDel ? '#fff' : '#dc2626',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {deleting ? '삭제 중...' : confirmDel ? '정말 삭제할까요? (한 번 더 탭)' : '이 기록 삭제'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
