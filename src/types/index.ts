// ─── 연령대 ───────────────────────────────────────────────────────────────────
export type AgeGroup = '20대' | '30대' | '40대' | '50대' | '60대' | '70대+';

export const AGE_GROUPS: AgeGroup[] = ['20대', '30대', '40대', '50대', '60대', '70대+'];

// ─── 혈압 판정 상태 ───────────────────────────────────────────────────────────
export type BpStatus = '정상' | '주의' | '고혈압 의심';

// ─── 1회 측정값 ───────────────────────────────────────────────────────────────
export interface Reading {
  sys: number;
  dia: number;
  pul: number;
}

// ─── 시간대 / 팔 / 자세 ──────────────────────────────────────────────────────
export type TimeSlot = '아침' | '저녁';
export type Arm = '좌팔' | '우팔';
export type Posture = '앉은 자세' | '누운 자세';

// ─── 측정 세션 (IndexedDB 저장 단위) ─────────────────────────────────────────
export interface MeasurementSession {
  session_id: string;        // UUID
  age_group: AgeGroup;
  measured_at: string;       // ISO 8601 DateTime
  time_slot: TimeSlot;
  arm: Arm;
  posture: Posture;
  readings: [Reading, Reading, Reading]; // 3회 개별 측정값
  avg_sys: number;
  avg_dia: number;
  avg_pul: number;
  ai_status: BpStatus;
  ai_message?: string;
  ai_advice?: string;
  memo?: string;
}

// ─── 연령대별 기준값 ──────────────────────────────────────────────────────────
export interface BPStandard {
  age_group: AgeGroup;
  sys_normal: number;   // 정상 상한 수축기
  dia_normal: number;   // 정상 상한 이완기
  sys_caution: number;  // 주의 상한 수축기 (이상은 고혈압 의심)
  dia_caution: number;  // 주의 상한 이완기
  pul_min: number;      // 맥박 정상 최솟값
  pul_max: number;      // 맥박 정상 최댓값
  version: string;
}

// ─── 모달 종류 ───────────────────────────────────────────────────────────────
export type ModalType =
  | 'alert'
  | 'confirm'
  | 'danger-confirm'
  | 'success'
  | 'deviation-warning'
  | 'ai-result'
  | 'session-detail';

// ─── AI 판정 응답 ─────────────────────────────────────────────────────────────
export interface AiJudgeResult {
  status: BpStatus;
  age_adjusted: true;
  message: string;       // 20자 이내
  advice: string;
  disclaimer: string;
}

// ─── 입력 검증 오류 ───────────────────────────────────────────────────────────
export interface ValidationError {
  field: 'sys' | 'dia' | 'pul' | 'age_group';
  message: string;
}
