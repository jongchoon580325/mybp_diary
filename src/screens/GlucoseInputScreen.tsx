import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import MealTagGroup from '../components/MealTagGroup';
import { useGlucoseInputStore } from '../store/glucoseInputStore';
import { useGlucoseDB } from '../hooks/useGlucoseDB';
import { useSettingsStore } from '../store/settingsStore';
import { validateGlucose, classifyGlucose } from '../services/glucoseValidation';
import type { GlucoseRecord, GlucoseStatus } from '../types';

function generateUUID(): string {
  return crypto.randomUUID();
}

function formatDate(d: Date): string {
  const date    = d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const weekday = d.toLocaleDateString('ko-KR', { weekday: 'short' });
  return `${date} (${weekday})`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_COLOR: Record<GlucoseStatus, string> = {
  '정상':  'var(--color-status-normal)',
  '주의':  'var(--color-status-caution)',
  '고혈당': 'var(--color-status-danger)',
  '저혈당': '#7c3aed',
};

const STATUS_ICON: Record<GlucoseStatus, string> = {
  '정상':  '✓',
  '주의':  '!',
  '고혈당': '!!',
  '저혈당': '⚠',
};

export default function GlucoseInputScreen() {
  const navigate = useNavigate();
  const { mealTag, glucoseLevel, note, setMealTag, setGlucoseLevel, setNote, resetDraft } =
    useGlucoseInputStore();
  const db = useGlucoseDB();
  const { glucoseTarget } = useSettingsStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const [error,         setError]         = useState('');
  const [isSaving,      setIsSaving]      = useState(false);
  const [savedStatus,   setSavedStatus]   = useState<GlucoseStatus | null>(null);
  const [now,           setNow]           = useState(new Date());
  const [recentRecords, setRecentRecords] = useState<GlucoseRecord[]>([]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    db.getRecentRecords(3).then(setRecentRecords);
  }, [db]);

  const level   = Number(glucoseLevel);
  const canSave = glucoseLevel !== '' && !isNaN(level) && level > 0;

  async function handleSave() {
    if (!canSave || isSaving) return;
    const err = validateGlucose(level);
    if (err) {
      setError(err.message);
      inputRef.current?.focus();
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const status = classifyGlucose(level, mealTag, glucoseTarget ?? undefined);
      const record: GlucoseRecord = {
        record_id:    generateUUID(),
        measured_at:  now.toISOString(),
        glucose_level: level,
        meal_tag:     mealTag,
        note:         note.trim() || undefined,
        status,
        created_at:   now.toISOString(),
      };
      await db.saveRecord(record);
      setSavedStatus(status);
      resetDraft();
      db.getRecentRecords(3).then(setRecentRecords);
    } catch (e) {
      console.error('[GlucoseInputScreen] 저장 오류:', e);
      setError('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* 날짜 바 */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {formatDate(now)}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'DM Mono, monospace' }}>
          {formatTime(now)}
        </span>
      </div>

      {/* 측정 시점 */}
      <div className="card" style={{ padding: '16px' }}>
        <MealTagGroup value={mealTag} onChange={(tag) => { setMealTag(tag); setSavedStatus(null); }} />
      </div>

      {/* 혈당 수치 입력 */}
      <div className="card" style={{ padding: '16px' }}>
        <label style={{
          display: 'block', fontSize: '12px', fontWeight: 600,
          color: 'var(--color-text-secondary)', marginBottom: '10px',
        }}>
          혈당 수치 (mg/dL)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={glucoseLevel}
            onChange={(e) => {
              setGlucoseLevel(e.target.value);
              setError('');
              setSavedStatus(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSave) handleSave();
            }}
            placeholder="예: 95"
            min={20}
            max={600}
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: '32px',
              fontWeight: 800,
              fontFamily: 'DM Mono, monospace',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${error ? 'var(--color-status-danger)' : 'var(--color-border)'}`,
              outline: 'none',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-alt)',
            }}
          />
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            mg/dL
          </span>
        </div>

        {error && (
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--color-status-danger)' }}>
            {error}
          </p>
        )}

        {savedStatus && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: STATUS_COLOR[savedStatus] + '18',
              border: `1.5px solid ${STATUS_COLOR[savedStatus]}44`,
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 800, color: STATUS_COLOR[savedStatus] }}>
              {STATUS_ICON[savedStatus]}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: STATUS_COLOR[savedStatus] }}>
              {savedStatus} — 저장 완료
            </span>
          </motion.div>
        )}
      </div>

      {/* 메모 */}
      <div className="card" style={{ padding: '16px' }}>
        <label style={{
          display: 'block', fontSize: '12px', fontWeight: 600,
          color: 'var(--color-text-secondary)', marginBottom: '8px',
        }}>
          메모 (선택)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          placeholder="특이사항을 입력하세요..."
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border)', outline: 'none',
            fontSize: '14px', color: 'var(--color-text-primary)', resize: 'none',
            background: 'var(--color-surface-alt)', boxSizing: 'border-box',
            fontFamily: 'Noto Sans KR, sans-serif',
          }}
        />
        <p style={{ margin: '4px 0 0 0', textAlign: 'right', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          {note.length}/200
        </p>
      </div>

      {/* 저장 버튼 */}
      <motion.button
        whileTap={canSave ? { scale: 0.97 } : {}}
        onClick={handleSave}
        disabled={!canSave || isSaving}
        style={{
          width: '100%', padding: '15px',
          borderRadius: 'var(--radius-lg)', border: 'none',
          background: canSave ? 'var(--color-primary-700)' : 'var(--color-neutral-200)',
          color: canSave ? '#fff' : 'var(--color-neutral-400)',
          fontSize: '16px', fontWeight: 700,
          cursor: canSave ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
        }}
      >
        {isSaving ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{
              width: '16px', height: '16px',
              border: '2px solid rgba(255,255,255,0.4)',
              borderTop: '2px solid #fff',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.8s linear infinite',
            }} />
            저장 중...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </span>
        ) : '혈당 기록 저장'}
      </motion.button>

      {/* 최근 기록 미니 리스트 */}
      {recentRecords.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              최근 혈당 3회
            </p>
            <button
              onClick={() => navigate('/glucose/records')}
              aria-label="혈당 기록 전체 보기"
              style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-primary-600)', fontSize: '12px', fontWeight: 600, padding: '2px 4px',
              }}
            >
              전체 보기
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentRecords.map((r) => (
              <div key={r.record_id} className="card" style={{
                padding: '11px 14px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {new Date(r.measured_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'DM Mono, monospace', color: 'var(--color-text-primary)' }}>
                  {r.glucose_level}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                  mg/dL
                </span>
                <span style={{ color: 'var(--color-border)', flexShrink: 0 }}>|</span>
                <span style={{
                  fontSize: '11px', padding: '2px 7px', borderRadius: 'var(--radius-full)',
                  background: 'var(--color-neutral-100)', color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {r.meal_tag}
                </span>
                <span style={{
                  marginLeft: 'auto', flexShrink: 0,
                  fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  background: STATUS_COLOR[r.status] + '22', color: STATUS_COLOR[r.status],
                }}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ margin: 0, textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
        이 결과는 참고용이며 의료 진단이 아닙니다.
      </p>
    </div>
  );
}
