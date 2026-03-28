import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import AgeChipGroup from '../components/AgeChipGroup';
import StepIndicator from '../components/StepIndicator';
import BpInputField from '../components/BpInputField';
import ToggleGroup from '../components/ToggleGroup';
import { useSettingsStore } from '../store/settingsStore';
import { useSessionStore, calcAverage } from '../store/sessionStore';
import { useModal } from '../hooks/useModal';
import { useDB } from '../hooks/useDB';
import { validateReading, checkDeviation } from '../services/validation';
import { judgeByRules } from '../constants/ageBPStandards';
import { aiJudge } from '../services/aiJudge';
import AiResultModal from '../components/AiResultModal';
import type { AiJudgeResult, MeasurementSession, Reading } from '../types';

const TIME_OPTIONS  = ['아침', '저녁']    as const;
const ARM_OPTIONS   = ['좌팔', '우팔']   as const;
const POSE_OPTIONS  = ['앉은 자세', '누운 자세'] as const;

function generateUUID(): string {
  return crypto.randomUUID();
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function InputScreen() {
  const navigate = useNavigate();
  const { ageGroup } = useSettingsStore();
  const {
    readings, timeSlot, arm, posture, memo,
    addReading, resetSession, setTimeSlot, setArm, setPosture, setMemo,
  } = useSessionStore();

  const { showDeviationWarning, showAlert } = useModal();
  const { saveSession, getRecentSessions } = useDB();

  // 필드 ref (자동 포커스용)
  const sysRef = useRef<HTMLInputElement>(null);
  const diaRef = useRef<HTMLInputElement>(null);
  const pulRef = useRef<HTMLInputElement>(null);

  // 현재 입력 필드 값
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [pul, setPul] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [aiResult, setAiResult] = useState<(AiJudgeResult & { usedFallback: boolean }) | null>(null);
  const [now, setNow] = useState(new Date());
  const [recentSessions, setRecentSessions] = useState<MeasurementSession[]>([]);

  // 시계 업데이트
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // 최근 측정 로드
  useEffect(() => {
    getRecentSessions(3).then(setRecentSessions);
  }, []);

  const step = readings.length; // 0~3
  const isComplete = step === 3;
  const avg = isComplete ? calcAverage(readings) : null;
  const canSave = isComplete && !!ageGroup;

  // 현재 회차 추가
  function handleAddReading() {
    const r: Partial<Reading> = {
      sys: Number(sys), dia: Number(dia), pul: Number(pul),
    };
    const errs = validateReading(r);
    if (errs.length > 0) {
      const map: Record<string, string> = {};
      errs.forEach((e) => { map[e.field] = e.message; });
      setErrors(map);
      return;
    }
    setErrors({});
    const reading: Reading = { sys: Number(sys), dia: Number(dia), pul: Number(pul) };
    const next = [...readings, reading];
    addReading(reading);
    setSys(''); setDia(''); setPul('');
    setTimeout(() => sysRef.current?.focus(), 50); // 다음 회차 SYS로 포커스

    // 편차 검증 (2~3회차 추가 시)
    if (next.length >= 2 && checkDeviation(next)) {
      showDeviationWarning(
        () => {},   // 그대로 저장 → 아무 동작 없이 계속
        () => {
          // 재측정: 마지막 회차만 제거
          useSessionStore.getState().removeLastReading();
        }
      );
    }
  }

  // 저장 (AI 판정 연동)
  async function handleSave() {
    if (!canSave || !ageGroup || !avg) return;
    setIsSaving(true);
    try {
      // 하네스 ② AI 판정 (실패 시 자동 폴백)
      const result = await aiJudge(ageGroup, avg.sys, avg.dia, avg.pul, timeSlot);

      const session: MeasurementSession = {
        session_id: generateUUID(),
        age_group: ageGroup,
        measured_at: now.toISOString(),
        time_slot: timeSlot,
        arm,
        posture,
        readings: readings as [Reading, Reading, Reading],
        avg_sys: avg.sys,
        avg_dia: avg.dia,
        avg_pul: avg.pul,
        ai_status: result.status,
        ai_message: result.message,
        ai_advice: result.advice,
        memo: memo.trim() || undefined,
      };
      await saveSession(session);

      // 저장 완료 후 AI 결과 모달 표시
      setAiResult(result);
      resetSession();
      setSys(''); setDia(''); setPul(''); setErrors({});
      getRecentSessions(3).then(setRecentSessions);
    } catch {
      showAlert('저장 오류', '저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  }

  const statusColor = (s: string) =>
    s === '정상' ? 'var(--color-status-normal)' :
    s === '주의' ? 'var(--color-status-caution)' :
    'var(--color-status-danger)';

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

      {/* 연령대 */}
      <div className="card" style={{ padding: '16px' }}>
        <AgeChipGroup />
      </div>

      {/* 측정 메타 (시간대/팔/자세) */}
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ToggleGroup label="시간대" options={TIME_OPTIONS}  value={timeSlot} onChange={setTimeSlot} />
        <ToggleGroup label="측정 팔"  options={ARM_OPTIONS}   value={arm}      onChange={setArm} />
        <ToggleGroup label="자세"    options={POSE_OPTIONS}  value={posture}  onChange={setPosture} />
      </div>

      {/* 스텝 인디케이터 */}
      <div className="card" style={{ padding: '16px' }}>
        <StepIndicator current={step} />
      </div>

      {/* 입력 폼 or 평균 미리보기 */}
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
            style={{ padding: '16px' }}
          >
            <p style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-700)' }}>
              {step + 1}회차 측정값 입력
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <BpInputField ref={sysRef} label="SYS" unit="mmHg" value={sys} onChange={setSys} onComplete={() => diaRef.current?.focus()} error={errors.sys} min={60} max={250} placeholder="120" />
              <BpInputField ref={diaRef} label="DIA" unit="mmHg" value={dia} onChange={setDia} onComplete={() => pulRef.current?.focus()} error={errors.dia} min={40} max={150} placeholder="80" />
              <BpInputField ref={pulRef} label="PUL" unit="bpm"  value={pul} onChange={setPul} error={errors.pul} min={30} max={200} placeholder="72" />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddReading}
              disabled={!sys || !dia || !pul}
              style={{
                width: '100%', marginTop: '14px', padding: '13px',
                borderRadius: 'var(--radius-md)', border: 'none',
                background: (!sys || !dia || !pul) ? 'var(--color-neutral-200)' : 'var(--color-primary-700)',
                color: (!sys || !dia || !pul) ? 'var(--color-neutral-400)' : '#fff',
                fontSize: '15px', fontWeight: 600, cursor: (!sys || !dia || !pul) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {step + 1}회차 추가
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="avg-preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ padding: '16px', border: '2px solid var(--color-primary-300)' }}
          >
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-700)' }}>
              3회 평균 (저장 단위)
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '12px' }}>
              {(['sys', 'dia', 'pul'] as const).map((k) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'DM Mono, monospace', color: 'var(--color-primary-800)' }}>
                    {avg![k]}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {k === 'pul' ? 'bpm' : 'mmHg'} {k.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            {ageGroup && avg && (
              <div style={{
                textAlign: 'center', padding: '6px 12px', borderRadius: 'var(--radius-full)',
                background: statusColor(judgeByRules(ageGroup, avg.sys, avg.dia)) + '22',
                color: statusColor(judgeByRules(ageGroup, avg.sys, avg.dia)),
                fontSize: '13px', fontWeight: 700, marginBottom: '4px',
              }}>
                {ageGroup} 기준: {judgeByRules(ageGroup, avg.sys, avg.dia)}
              </div>
            )}
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              이 결과는 참고용이며 의료 진단이 아닙니다.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메모 */}
      <div className="card" style={{ padding: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
          메모 (선택)
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
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
          {memo.length}/200
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
          background: canSave
            ? 'var(--color-primary-700)'
            : 'var(--color-neutral-200)',
          color: canSave ? '#fff' : 'var(--color-neutral-400)',
          fontSize: '16px', fontWeight: 700,
          cursor: canSave ? 'pointer' : 'not-allowed',
          backgroundImage: canSave ? 'none' : `repeating-linear-gradient(
            -45deg, transparent, transparent 4px,
            rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 8px
          )`,
          transition: 'all 0.15s',
        }}
      >
        {isSaving ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{
              width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
              borderTop: '2px solid #fff', borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.8s linear infinite',
            }} />
            AI 판정 중...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </span>
        ) : !ageGroup ? '연령대를 먼저 선택하세요' : !isComplete ? `${3 - step}회 더 측정 필요` : '측정값 저장'}
      </motion.button>

      {/* 최근 측정 미니 리스트 */}
      {recentSessions.length > 0 && (
        <div>
          {/* 헤더: 제목 + more 버튼 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              최근 측정 3회
            </p>
            <button
              onClick={() => navigate('/records')}
              aria-label="기록 전체 보기"
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
            {recentSessions.map((s) => (
              <div key={s.session_id} className="card" style={{
                padding: '11px 14px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                {/* 날짜 */}
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {new Date(s.measured_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>

                {/* 혈압 수치 */}
                <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'DM Mono, monospace', color: 'var(--color-text-primary)', letterSpacing: '0.5px', flexShrink: 0 }}>
                  {s.avg_sys}/{s.avg_dia}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                  {s.avg_pul}bpm
                </span>

                {/* 구분선 */}
                <span style={{ color: 'var(--color-border)', flexShrink: 0 }}>|</span>

                {/* 시간대 · 팔 · 자세 태그 */}
                {[s.time_slot, s.arm, s.posture].map((tag) => (
                  <span key={tag} style={{
                    fontSize: '11px', padding: '2px 7px', borderRadius: 'var(--radius-full)',
                    background: 'var(--color-neutral-100)', color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {tag}
                  </span>
                ))}

                {/* 상태배지 — 우측 끝 */}
                <span style={{
                  marginLeft: 'auto', flexShrink: 0,
                  fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  background: statusColor(s.ai_status) + '22', color: statusColor(s.ai_status),
                }}>
                  {s.ai_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 판정 결과 모달 */}
      <AiResultModal result={aiResult} onClose={() => setAiResult(null)} />
    </div>
  );
}
