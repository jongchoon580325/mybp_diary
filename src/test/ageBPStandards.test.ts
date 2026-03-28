import { describe, it, expect } from 'vitest';
import { getStandard, judgeByRules } from '../constants/ageBPStandards';

describe('ageBPStandards — getStandard', () => {
  it('20대 기준값이 올바르게 반환된다', () => {
    const std = getStandard('20대');
    expect(std.sys_normal).toBe(120);
    expect(std.dia_normal).toBe(80);
    expect(std.sys_caution).toBe(125);
  });

  it('70대+ 완화 기준이 올바르게 반환된다', () => {
    const std = getStandard('70대+');
    expect(std.sys_normal).toBe(140);
    expect(std.sys_caution).toBe(150);
  });
});

describe('judgeByRules — PRD §4.5 하네스 매트릭스', () => {
  // 케이스 #1: 20대 정상
  it('#1 20대 118/76 → 정상', () => {
    expect(judgeByRules('20대', 118, 76)).toBe('정상');
  });

  // 케이스 #2: 20대 주의
  it('#2 20대 122/81 → 주의', () => {
    expect(judgeByRules('20대', 122, 81)).toBe('주의');
  });

  // 케이스 #3: 20대 고혈압 의심
  it('#3 20대 130/86 → 고혈압 의심', () => {
    expect(judgeByRules('20대', 130, 86)).toBe('고혈압 의심');
  });

  // 케이스 #4: 50대 정상
  it('#4 50대 128/82 → 정상', () => {
    expect(judgeByRules('50대', 128, 82)).toBe('정상');
  });

  // 케이스 #6: 50대 고혈압 의심
  it('#6 50대 142/90 → 고혈압 의심', () => {
    expect(judgeByRules('50대', 142, 90)).toBe('고혈압 의심');
  });

  // 케이스 #7: 70대+ 정상 (완화 기준)
  it('#7 70대+ 138/83 → 정상 (완화 기준)', () => {
    expect(judgeByRules('70대+', 138, 83)).toBe('정상');
  });

  // 케이스 #9: 70대+ 고혈압 의심
  it('#9 70대+ 152/92 → 고혈압 의심', () => {
    expect(judgeByRules('70대+', 152, 92)).toBe('고혈압 의심');
  });

  // 케이스 #12: 핵심 — 동일 수치 연령 보정
  // PRD §2.1 기준표 기준: 20대 고혈압의심 ≥125/84, 60대 정상 <135/85
  // → 138/84는 20대 기준 고혈압의심, 60대 기준 주의 (sys 135~144 구간)
  it('#12 20대 138/84 → 고혈압 의심 / 60대 138/84 → 주의 (연령 보정 확인)', () => {
    expect(judgeByRules('20대', 138, 84)).toBe('고혈압 의심');
    expect(judgeByRules('60대', 138, 84)).toBe('주의');
  });
});
