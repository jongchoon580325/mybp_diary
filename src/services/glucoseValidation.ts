import type { MealTag, GlucoseStatus, GlucoseTarget, GlucoseValidationError } from '../types';
import { getGlucoseStandard, GLUCOSE_INPUT_MIN, GLUCOSE_INPUT_MAX } from '../constants/glucoseStandards';

// ── 입력값 검증 ───────────────────────────────────────────────────────────────

export function validateGlucose(level: number): GlucoseValidationError | null {
  if (!Number.isFinite(level) || level < GLUCOSE_INPUT_MIN || level > GLUCOSE_INPUT_MAX) {
    return {
      field: 'glucose_level',
      message: `혈당 수치는 ${GLUCOSE_INPUT_MIN}~${GLUCOSE_INPUT_MAX} mg/dL 범위여야 합니다.`,
    };
  }
  return null;
}

// ── 상태 분류 ─────────────────────────────────────────────────────────────────
//
//  target 이 주어지면 개인 목표 기준을 우선 적용한다.
//  그 외에는 ADA 2025 공식 기준(glucoseStandards)을 사용한다.
//
//  저혈당:  level < low_threshold (70 mg/dL, 모든 태그 공통)
//  정상:    low_threshold ≤ level ≤ normal_max
//  주의:    normal_max < level ≤ caution_max
//  고혈당:  level > caution_max

export function classifyGlucose(
  level: number,
  tag: MealTag,
  target?: GlucoseTarget,
): GlucoseStatus {
  const std = getGlucoseStandard(tag);

  const lowThreshold = std.low_threshold;  // 70 (공통)

  // target 이 있으면 target_min/target_max 를 정상 범위로 사용
  if (target) {
    if (level < target.target_min) return level < lowThreshold ? '저혈당' : '주의';
    if (level <= target.target_max) return '정상';
    return level >= std.caution_max + 1 ? '고혈당' : '주의';
  }

  // ADA 2025 기준
  if (level < lowThreshold)    return '저혈당';
  if (level <= std.normal_max) return '정상';
  if (level <= std.caution_max) return '주의';
  return '고혈당';
}
