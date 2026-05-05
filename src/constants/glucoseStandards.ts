import type { MealTag } from '../types';

// ── 식사 태그별 혈당 기준값 (ADA 2025 기준) ──────────────────────────────────
//
//   저혈당:  < 70  mg/dL  (모든 태그 공통)
//   정상:    태그별 상한 미만
//   주의:    정상 초과 ~ 고혈당 미만
//   고혈당:  태그별 임계값 이상

export interface GlucoseStandard {
  meal_tag:       MealTag;
  normal_max:     number;   // 정상 상한 (이하: 정상)
  caution_max:    number;   // 주의 상한 (이상: 고혈당)
  low_threshold:  number;   // 저혈당 기준 (미만: 저혈당)
  source:         string;
}

export const GLUCOSE_STANDARDS: Record<MealTag, GlucoseStandard> = {
  '공복': {
    meal_tag:      '공복',
    normal_max:    99,    // < 100: 정상
    caution_max:   125,   // 100~125: 주의 / ≥ 126: 고혈당
    low_threshold: 70,
    source:        'ADA 2025',
  },
  '식전': {
    meal_tag:      '식전',
    normal_max:    99,
    caution_max:   125,
    low_threshold: 70,
    source:        'ADA 2025',
  },
  '식후 1h': {
    meal_tag:      '식후 1h',
    normal_max:    179,   // < 180: 정상
    caution_max:   199,   // 180~199: 주의 / ≥ 200: 고혈당
    low_threshold: 70,
    source:        'ADA 2025',
  },
  '식후 2h': {
    meal_tag:      '식후 2h',
    normal_max:    139,   // < 140: 정상
    caution_max:   199,   // 140~199: 주의 / ≥ 200: 고혈당
    low_threshold: 70,
    source:        'ADA 2025',
  },
  '취침 전': {
    meal_tag:      '취침 전',
    normal_max:    120,   // < 120: 정상
    caution_max:   149,   // 120~149: 주의 / ≥ 150: 고혈당
    low_threshold: 70,
    source:        'ADA 2025',
  },
};

export function getGlucoseStandard(tag: MealTag): GlucoseStandard {
  return GLUCOSE_STANDARDS[tag];
}

// 유효 입력 범위
export const GLUCOSE_INPUT_MIN = 20;
export const GLUCOSE_INPUT_MAX = 600;
