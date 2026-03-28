import type { AgeGroup, BPStandard, BpStatus } from '../types';

// PRD v1.1 §2.1 — 연령대별 혈압 판정 기준표
// 출처: AHA/ACC 2025 · ESH 2023 · ESC 2024 · 한국 질병관리청
export const AGE_BP_STANDARDS: Record<AgeGroup, BPStandard> = {
  '20대': { age_group: '20대', sys_normal: 120, dia_normal: 80, sys_caution: 125, dia_caution: 84, pul_min: 60, pul_max: 90, version: 'v1.1' },
  '30대': { age_group: '30대', sys_normal: 122, dia_normal: 80, sys_caution: 130, dia_caution: 85, pul_min: 60, pul_max: 90, version: 'v1.1' },
  '40대': { age_group: '40대', sys_normal: 125, dia_normal: 82, sys_caution: 135, dia_caution: 87, pul_min: 60, pul_max: 90, version: 'v1.1' },
  '50대': { age_group: '50대', sys_normal: 130, dia_normal: 84, sys_caution: 140, dia_caution: 89, pul_min: 60, pul_max: 90, version: 'v1.1' },
  '60대': { age_group: '60대', sys_normal: 135, dia_normal: 85, sys_caution: 145, dia_caution: 90, pul_min: 55, pul_max: 90, version: 'v1.1' },
  '70대+': { age_group: '70대+', sys_normal: 140, dia_normal: 85, sys_caution: 150, dia_caution: 90, pul_min: 55, pul_max: 90, version: 'v1.1' },
};

/** 연령대 기준값 조회 */
export function getStandard(ageGroup: AgeGroup): BPStandard {
  return AGE_BP_STANDARDS[ageGroup];
}

/**
 * 규칙 기반 혈압 판정 (AI 폴백용)
 * PRD §4.3 판정 기준 구현
 */
export function judgeByRules(ageGroup: AgeGroup, sys: number, dia: number): BpStatus {
  const std = getStandard(ageGroup);

  // 고혈압 의심: sys >= sys_caution OR dia >= dia_caution
  if (sys >= std.sys_caution || dia >= std.dia_caution) return '고혈압 의심';

  // 정상: sys < sys_normal AND dia < dia_normal
  if (sys < std.sys_normal && dia < std.dia_normal) return '정상';

  // 주의: 그 외
  return '주의';
}
