import { describe, it, expect } from 'vitest';
import { sessionsToCsv, csvToSessions } from '../services/csvService';
import type { MeasurementSession } from '../types';

// ── 테스트용 세션 픽스처 ──────────────────────────────────────────────────────
const SAMPLE_SESSION: MeasurementSession = {
  session_id:  'test-uuid-001',
  age_group:   '50대',
  measured_at: '2026-03-28T07:30:00.000Z',
  time_slot:   '아침',
  arm:         '좌팔',
  posture:     '앉은 자세',
  readings: [
    { sys: 120, dia: 80, pul: 72 },
    { sys: 124, dia: 82, pul: 70 },
    { sys: 122, dia: 81, pul: 71 },
  ],
  avg_sys: 122,
  avg_dia: 81,
  avg_pul: 71,
  ai_status: '정상',
  memo: '',
};

const MEMO_SESSION: MeasurementSession = {
  ...SAMPLE_SESSION,
  session_id: 'test-uuid-002',
  memo: '식후 30분 측정, 오늘 컨디션 양호',
};

const COMMA_MEMO_SESSION: MeasurementSession = {
  ...SAMPLE_SESSION,
  session_id: 'test-uuid-003',
  memo: '메모에 쉼표, 따옴표"포함',
};

// ── sessionsToCsv ─────────────────────────────────────────────────────────────
describe('sessionsToCsv', () => {
  it('헤더 포함 CSV 생성', () => {
    const csv = sessionsToCsv([SAMPLE_SESSION]);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('session_id');
    expect(lines[0]).toContain('avg_sys');
    expect(lines[0]).toContain('ai_status');
  });

  it('세션 데이터 행 수 일치', () => {
    const csv = sessionsToCsv([SAMPLE_SESSION, MEMO_SESSION]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // 헤더 + 2행
  });

  it('수치값이 CSV에 포함됨', () => {
    const csv = sessionsToCsv([SAMPLE_SESSION]);
    expect(csv).toContain('122'); // avg_sys
    expect(csv).toContain('81');  // avg_dia
    expect(csv).toContain('정상');
  });

  it('쉼표/쌍따옴표 포함 메모 → 이스케이프 처리', () => {
    const csv = sessionsToCsv([COMMA_MEMO_SESSION]);
    // 쌍따옴표로 감싸진 셀 포함 확인
    expect(csv).toContain('"');
  });

  it('세션 없으면 헤더만 반환', () => {
    const csv = sessionsToCsv([]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('session_id');
  });
});

// ── csvToSessions ─────────────────────────────────────────────────────────────
describe('csvToSessions', () => {
  it('왕복 변환 (내보내기 → 가져오기) session_id 일치', () => {
    const csv      = sessionsToCsv([SAMPLE_SESSION]);
    const restored = csvToSessions(csv);
    expect(restored).toHaveLength(1);
    expect(restored[0].session_id).toBe('test-uuid-001');
  });

  it('왕복 변환 — avg_sys/dia/pul 복원', () => {
    const csv      = sessionsToCsv([SAMPLE_SESSION]);
    const restored = csvToSessions(csv);
    expect(restored[0].avg_sys).toBe(122);
    expect(restored[0].avg_dia).toBe(81);
    expect(restored[0].avg_pul).toBe(71);
  });

  it('왕복 변환 — ai_status 복원', () => {
    const csv      = sessionsToCsv([SAMPLE_SESSION]);
    const restored = csvToSessions(csv);
    expect(restored[0].ai_status).toBe('정상');
  });

  it('메모 왕복 변환', () => {
    const csv      = sessionsToCsv([MEMO_SESSION]);
    const restored = csvToSessions(csv);
    expect(restored[0].memo).toBe('식후 30분 측정, 오늘 컨디션 양호');
  });

  it('쉼표/따옴표 포함 메모 왕복 변환', () => {
    const csv      = sessionsToCsv([COMMA_MEMO_SESSION]);
    const restored = csvToSessions(csv);
    expect(restored[0].memo).toBe('메모에 쉼표, 따옴표"포함');
  });

  it('필수 헤더 누락 → 오류', () => {
    const badCsv = 'session_id,measured_at\nid1,2026-01-01T00:00:00Z';
    expect(() => csvToSessions(badCsv)).toThrow('필수 헤더 누락');
  });

  it('avg_sys=0 인 행은 필터링됨', () => {
    // 헤더 기준 avg_sys 컬럼 직접 조작
    const csv   = sessionsToCsv([SAMPLE_SESSION]);
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const avgSysIdx = headers.indexOf('avg_sys');
    const cells = lines[1].split(',');
    cells[avgSysIdx] = '0';
    const badCsv = [lines[0], cells.join(',')].join('\n');
    const restored = csvToSessions(badCsv);
    expect(restored).toHaveLength(0);
  });

  it('빈 CSV → 오류', () => {
    expect(() => csvToSessions('')).toThrow();
  });

  it('여러 세션 왕복', () => {
    const csv      = sessionsToCsv([SAMPLE_SESSION, MEMO_SESSION]);
    const restored = csvToSessions(csv);
    expect(restored).toHaveLength(2);
  });
});
