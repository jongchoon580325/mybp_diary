import { describe, it, expect } from 'vitest';
import { validateReading, checkDeviation } from '../services/validation';

describe('validateReading — 하네스 ① 입력 검증', () => {
  it('정상 입력은 에러 없음', () => {
    expect(validateReading({ sys: 120, dia: 80, pul: 72 })).toHaveLength(0);
  });

  // 케이스 #10: SYS 범위 초과
  it('#10 SYS=999 → 입력오류', () => {
    const errs = validateReading({ sys: 999, dia: 80, pul: 70 });
    expect(errs.some((e) => e.field === 'sys')).toBe(true);
  });

  // SYS 하한 초과
  it('SYS=59 → 입력오류', () => {
    const errs = validateReading({ sys: 59, dia: 40, pul: 60 });
    expect(errs.some((e) => e.field === 'sys')).toBe(true);
  });

  // 케이스 #11: DIA > SYS 논리 오류
  it('#11 DIA > SYS → 논리오류', () => {
    const errs = validateReading({ sys: 120, dia: 130, pul: 70 });
    expect(errs.some((e) => e.field === 'dia')).toBe(true);
  });

  // PUL 범위 초과
  it('PUL=201 → 입력오류', () => {
    const errs = validateReading({ sys: 120, dia: 80, pul: 201 });
    expect(errs.some((e) => e.field === 'pul')).toBe(true);
  });

  // 빈 값
  it('값 없으면 에러 반환', () => {
    expect(validateReading({})).not.toHaveLength(0);
  });
});

describe('checkDeviation — 편차 검증', () => {
  it('회차 간 편차 20 이하 → false', () => {
    expect(checkDeviation([
      { sys: 120, dia: 80, pul: 72 },
      { sys: 130, dia: 82, pul: 74 },
    ])).toBe(false);
  });

  it('회차 간 편차 21 → true (재측정 권고)', () => {
    expect(checkDeviation([
      { sys: 120, dia: 80, pul: 72 },
      { sys: 141, dia: 82, pul: 74 },
    ])).toBe(true);
  });

  it('1회차만 있으면 편차 없음 → false', () => {
    expect(checkDeviation([{ sys: 120, dia: 80, pul: 72 }])).toBe(false);
  });
});
