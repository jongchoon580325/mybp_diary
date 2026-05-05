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

// ─── 시간대 / 팔 / 자세 / 기기 ───────────────────────────────────────────────
export type TimeSlot = '아침' | '저녁';
export type Arm = '왼쪽 팔' | '오른쪽 팔';
export type Posture = '앉은 자세' | '누운 자세';
export type Device = '혈압기' | 'Watch';

// ─── 측정 세션 (IndexedDB 저장 단위) ─────────────────────────────────────────
export interface MeasurementSession {
  session_id: string;        // UUID
  age_group: AgeGroup;
  measured_at: string;       // ISO 8601 DateTime
  time_slot: TimeSlot;
  arm: Arm;
  posture: Posture;
  device?: Device;           // 측정 기기 (구버전 호환을 위해 optional)
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

// ══════════════════════════════════════════════════════════════════════════════
// 혈당 (Blood Sugar) 도메인
// ══════════════════════════════════════════════════════════════════════════════

// ─── 식사 태그 ────────────────────────────────────────────────────────────────
export type MealTag = '공복' | '식전' | '식후 1h' | '식후 2h' | '취침 전';

// ─── 당뇨 유형 ────────────────────────────────────────────────────────────────
export type DiabetesType = '1형' | '2형' | '임신성' | '없음';

// ─── 혈당 판정 상태 ──────────────────────────────────────────────────────────
export type GlucoseStatus = '정상' | '주의' | '고혈당' | '저혈당';

// ─── 혈당 기록 (Firestore / IndexedDB 저장 단위) ─────────────────────────────
export interface GlucoseRecord {
  record_id: string;        // UUID
  measured_at: string;      // ISO 8601 DateTime
  glucose_level: number;    // 혈당 수치 (mg/dL)
  meal_tag: MealTag;        // 측정 시점 태그
  insulin?: number;         // 인슐린 투여량 (단위), 선택
  carbs?: number;           // 탄수화물 섭취량 (g), 선택
  exercise?: string;        // 운동 종류 및 시간, 선택
  note?: string;            // 메모, 선택
  status: GlucoseStatus;   // 판정 결과
  created_at: string;       // ISO 8601
}

// ─── 혈당 목표 범위 (사용자 설정) ────────────────────────────────────────────
export interface GlucoseTarget {
  target_min: number;      // 목표 최솟값 (mg/dL), 기본 70
  target_max: number;      // 목표 최댓값 (mg/dL), 기본 140
  diabetes_type: DiabetesType;
}

// ─── 혈당 검증 오류 ──────────────────────────────────────────────────────────
export interface GlucoseValidationError {
  field: 'glucose_level' | 'meal_tag';
  message: string;
}
