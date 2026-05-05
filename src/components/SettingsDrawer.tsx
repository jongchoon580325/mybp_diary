import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, Trash2, Info, ChevronRight, UserRound, Check, LogOut } from 'lucide-react';
import { useDB } from '../hooks/useDB';
import { useGlucoseDB } from '../hooks/useGlucoseDB';
import { useModal } from '../hooks/useModal';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthContext } from '../contexts/AuthContext';
import { downloadCombinedCsv, parseCombinedCsv } from '../services/combinedCsvService';
import AgeChipGroup from './AgeChipGroup';
import type { DiabetesType } from '../types';

const DIABETES_TYPES: DiabetesType[] = ['없음', '1형', '2형', '임신성'];

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const APP_VERSION = 'v1.1';

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { getAllSessions, saveSession, clearAllSessions } = useDB();
  const glucoseDb = useGlucoseDB();
  const { showDangerConfirm, showToast, showSuccess } = useModal();
  const {
    ageGroup, userName, setUserName,
    diabetesType, setDiabetesType,
    glucoseTarget, setGlucoseTarget,
    resetSettings,
  } = useSettingsStore();

  const [targetMin, setTargetMin] = useState(String(glucoseTarget?.target_min ?? 70));
  const [targetMax, setTargetMax] = useState(String(glucoseTarget?.target_max ?? 140));
  const [targetSaved, setTargetSaved] = useState(false);

  const handleSaveGlucoseTarget = () => {
    const min = Number(targetMin);
    const max = Number(targetMax);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max || min < 20 || max > 600) {
      showToast('유효하지 않은 범위입니다. (최솟값 < 최댓값, 20~600)', 'error');
      return;
    }
    setGlucoseTarget({ target_min: min, target_max: max, diabetes_type: diabetesType });
    setTargetSaved(true);
    showToast('혈당 목표 범위가 저장되었습니다.', 'success');
    setTimeout(() => setTargetSaved(false), 2000);
  };
  const { user, signOut } = useAuthContext();

  // ── 로그아웃 ──
  const handleSignOut = () => {
    showDangerConfirm(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      async () => {
        await signOut();
        onClose();
      }
    );
  };

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [importing,   setImporting]   = useState(false);
  const [nameInput,   setNameInput]   = useState(userName);
  const [nameSaved,   setNameSaved]   = useState(false);

  // ── 이름 저장 ──
  const handleSaveName = () => {
    setUserName(nameInput.trim());
    setNameSaved(true);
    showToast('이름이 저장되었습니다.', 'success');
    setTimeout(() => setNameSaved(false), 2000);
  };

  // ── CSV 백업 ──
  const handleBackup = async () => {
    const [sessions, glucoseRecords] = await Promise.all([
      getAllSessions(),
      glucoseDb.getAllRecords(),
    ]);
    if (sessions.length === 0 && glucoseRecords.length === 0) {
      showToast('백업할 데이터가 없습니다.', 'warning');
      return;
    }
    downloadCombinedCsv(sessions, glucoseRecords, userName);
    showToast(`혈압 ${sessions.length}건 + 혈당 ${glucoseRecords.length}건 백업 완료`, 'success');
  };

  // ── CSV 복구 ──
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const { sessions: importedSessions, glucoseRecords: importedGlucose } = parseCombinedCsv(text);

      const [existingSessions, existingGlucose] = await Promise.all([
        getAllSessions(),
        glucoseDb.getAllRecords(),
      ]);

      let addedBp = 0;
      for (const s of importedSessions) {
        if (!existingSessions.some((x) => x.session_id === s.session_id)) {
          await saveSession(s);
          addedBp++;
        }
      }

      let addedGlucose = 0;
      for (const r of importedGlucose) {
        if (!existingGlucose.some((x) => x.record_id === r.record_id)) {
          await glucoseDb.saveRecord(r);
          addedGlucose++;
        }
      }

      const totalAdded = addedBp + addedGlucose;
      const totalDup   = (importedSessions.length - addedBp) + (importedGlucose.length - addedGlucose);
      showSuccess(
        'CSV 복구 완료',
        `혈압 ${addedBp}건 + 혈당 ${addedGlucose}건 복구되었습니다.\n(중복 ${totalDup}건 제외, 총 ${totalAdded}건)`
      );
    } catch (err: any) {
      showToast(`복구 오류: ${err.message}`, 'error');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── 전체 초기화 ──
  const handleReset = () => {
    showDangerConfirm(
      '전체 데이터 초기화',
      '혈압 · 혈당 모든 측정 기록이 영구 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.',
      async () => {
        await Promise.all([
          clearAllSessions(),
          glucoseDb.clearAllRecords(),
        ]);
        resetSettings();
        showToast('앱 내 모든 데이터가 초기화되었습니다.', 'success');
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(3px)',
              zIndex: 400,
            }}
          />

          {/* 드로어 패널 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: 'min(340px, 92vw)',
              background: 'var(--color-bg)',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
              zIndex: 401,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-primary-900)',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>설정</span>
              <button
                onClick={onClose}
                aria-label="닫기"
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  borderRadius: 'var(--radius-md)', padding: '6px',
                  cursor: 'pointer', color: '#fff', display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>

              {/* ── 사용자 이름 ── */}
              <section>
                <SectionTitle>사용자 정보</SectionTitle>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <UserRound size={16} color="#16a34a" />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {userName ? userName : '이름을 등록하세요'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => { setNameInput(e.target.value); setNameSaved(false); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      maxLength={20}
                      placeholder="이름 입력 (최대 20자)"
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        border: '1.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        color: 'var(--color-text-primary)',
                        background: 'var(--color-bg)',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={!nameInput.trim()}
                      style={{
                        padding: '9px 14px',
                        background: nameSaved ? '#16a34a' : 'var(--color-primary-700)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        color: '#fff',
                        fontSize: '13px', fontWeight: 600,
                        cursor: nameInput.trim() ? 'pointer' : 'not-allowed',
                        opacity: nameInput.trim() ? 1 : 0.5,
                        display: 'flex', alignItems: 'center', gap: '4px',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      {nameSaved ? <Check size={15} /> : '저장'}
                    </button>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    PDF 리포트 상단에 이름이 표시됩니다.
                  </p>
                </div>
              </section>

              {/* ── 연령대 설정 ── */}
              <section>
                <SectionTitle>연령대 설정</SectionTitle>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                }}>
                  <AgeChipGroup label="" />
                  {ageGroup && (
                    <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      현재: <strong style={{ color: 'var(--color-primary-700)' }}>{ageGroup}</strong> 기준 혈압 판정 적용
                    </p>
                  )}
                </div>
              </section>

              {/* ── 혈당 설정 ── */}
              <section>
                <SectionTitle>혈당 설정</SectionTitle>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                }}>
                  {/* 당뇨 유형 */}
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      당뇨 유형
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {DIABETES_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setDiabetesType(type);
                            if (glucoseTarget) setGlucoseTarget({ ...glucoseTarget, diabetes_type: type });
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            border: `1.5px solid ${diabetesType === type ? 'var(--color-primary-700)' : 'var(--color-border)'}`,
                            background: diabetesType === type ? 'var(--color-primary-700)' : 'var(--color-surface)',
                            color: diabetesType === type ? '#fff' : 'var(--color-text-primary)',
                            fontSize: '12px', fontWeight: diabetesType === type ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 개인 목표 범위 */}
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      개인 목표 혈당 범위 (mg/dL)
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={targetMin}
                        onChange={(e) => { setTargetMin(e.target.value); setTargetSaved(false); }}
                        placeholder="최솟값"
                        min={20} max={599}
                        style={{ flex: 1, padding: '8px 10px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--color-text-primary)', background: 'var(--color-bg)', outline: 'none', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>~</span>
                      <input
                        type="number"
                        value={targetMax}
                        onChange={(e) => { setTargetMax(e.target.value); setTargetSaved(false); }}
                        placeholder="최댓값"
                        min={21} max={600}
                        style={{ flex: 1, padding: '8px 10px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--color-text-primary)', background: 'var(--color-bg)', outline: 'none', textAlign: 'center' }}
                      />
                      <button
                        onClick={handleSaveGlucoseTarget}
                        style={{
                          padding: '8px 12px',
                          background: targetSaved ? '#16a34a' : 'var(--color-primary-700)',
                          border: 'none', borderRadius: 'var(--radius-md)',
                          color: '#fff', fontSize: '12px', fontWeight: 600,
                          cursor: 'pointer', flexShrink: 0,
                          display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'background 0.2s',
                        }}
                      >
                        {targetSaved ? <Check size={14} /> : '저장'}
                      </button>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      설정 시 ADA 기준 대신 개인 목표 범위로 판정됩니다.
                      {glucoseTarget && (
                        <span style={{ color: 'var(--color-primary-700)', marginLeft: '4px' }}>
                          (현재: {glucoseTarget.target_min}~{glucoseTarget.target_max})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </section>

              {/* ── 데이터 관리 ── */}
              <section>
                <SectionTitle>데이터 관리</SectionTitle>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}>
                  {/* CSV 백업 */}
                  <SettingsRow
                    icon={<Download size={16} color="#16a34a" />}
                    iconBg="#f0fdf4"
                    label="CSV 백업"
                    description="전체 기록을 CSV 파일로 저장"
                    onClick={handleBackup}
                  />

                  {/* CSV 복구 */}
                  <SettingsRow
                    icon={<Upload size={16} color="#2563eb" />}
                    iconBg="#eff6ff"
                    label="CSV 복구"
                    description="CSV 파일에서 기록 가져오기"
                    onClick={() => fileInputRef.current?.click()}
                    loading={importing}
                    border
                  />

                  {/* 전체 초기화 */}
                  <SettingsRow
                    icon={<Trash2 size={16} color="#dc2626" />}
                    iconBg="#fef2f2"
                    label="전체 초기화"
                    description="모든 측정 기록 영구 삭제"
                    onClick={handleReset}
                    danger
                    border
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleRestore}
                />
              </section>

              {/* ── 계정 ── */}
              <section>
                <SectionTitle>계정</SectionTitle>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}>
                  {/* 로그인 정보 */}
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <UserRound size={16} color="#16a34a" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {user?.isAnonymous ? '게스트' : (user?.displayName || user?.email || '로그인됨')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                        {user?.isAnonymous ? '기기에만 저장 · Google 연결 시 동기화' : 'Google 계정으로 로그인'}
                      </div>
                    </div>
                  </div>
                  {/* 로그아웃 버튼 */}
                  <SettingsRow
                    icon={<LogOut size={16} color="#dc2626" />}
                    iconBg="#fef2f2"
                    label="로그아웃"
                    description="계정에서 로그아웃합니다"
                    onClick={handleSignOut}
                    danger
                    border
                  />
                </div>
              </section>

              {/* ── 앱 정보 ── */}
              <section>
                <SectionTitle>앱 정보</SectionTitle>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Info size={16} color="#16a34a" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        BP Manager <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>{APP_VERSION}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        연령대별 혈압 자가 관리 앱
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '10px 16px',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.6,
                  }}>
                    ⚕ 기준: AHA / ESH / ESC 가이드라인 연령대별 조정값<br />
                    ⚠ 이 앱은 건강 참고용이며 의료 진단이 아닙니다.
                  </div>
                </div>
              </section>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: 700,
      color: 'var(--color-text-muted)',
      letterSpacing: '0.6px',
      textTransform: 'uppercase',
      marginBottom: '8px',
      paddingLeft: '2px',
    }}>
      {children}
    </div>
  );
}

interface SettingsRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
  onClick: () => void;
  loading?: boolean;
  danger?: boolean;
  border?: boolean;
}

function SettingsRow({ icon, iconBg, label, description, onClick, loading, danger, border }: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%', background: 'none', border: 'none',
        borderTop: border ? '1px solid var(--color-border)' : 'none',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px', fontWeight: 600,
          color: danger ? '#dc2626' : 'var(--color-text-primary)',
        }}>
          {loading ? '처리 중...' : label}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
          {description}
        </div>
      </div>
      <ChevronRight size={15} color="var(--color-text-muted)" />
    </button>
  );
}
