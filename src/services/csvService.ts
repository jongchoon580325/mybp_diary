import type { MeasurementSession, AgeGroup, BpStatus, TimeSlot, Arm, Posture } from '../types';

// ── CSV 헤더 정의 ─────────────────────────────────────────────────────────────
const HEADERS = [
  'session_id', 'age_group', 'measured_at',
  'time_slot', 'arm', 'posture',
  'sys1', 'dia1', 'pul1',
  'sys2', 'dia2', 'pul2',
  'sys3', 'dia3', 'pul3',
  'avg_sys', 'avg_dia', 'avg_pul',
  'ai_status', 'memo',
];

// ── 문자열 CSV 셀 이스케이프 ──────────────────────────────────────────────────
function escape(val: string | number | undefined): string {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ── 세션 배열 → CSV 문자열 ────────────────────────────────────────────────────
export function sessionsToCsv(sessions: MeasurementSession[]): string {
  const lines: string[] = [HEADERS.join(',')];

  for (const s of sessions) {
    const row = [
      s.session_id,
      s.age_group,
      s.measured_at,
      s.time_slot,
      s.arm,
      s.posture,
      s.readings[0].sys, s.readings[0].dia, s.readings[0].pul,
      s.readings[1].sys, s.readings[1].dia, s.readings[1].pul,
      s.readings[2].sys, s.readings[2].dia, s.readings[2].pul,
      s.avg_sys, s.avg_dia, s.avg_pul,
      s.ai_status,
      s.memo ?? '',
    ].map(escape);
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

// ── CSV 다운로드 트리거 ────────────────────────────────────────────────────────
export function downloadCsv(sessions: MeasurementSession[]): void {
  const csv      = sessionsToCsv(sessions);
  const bom      = '\uFEFF'; // UTF-8 BOM (엑셀 한글 인식)
  const blob     = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url      = URL.createObjectURL(blob);
  const link     = document.createElement('a');
  const filename = `bp-records-${new Date().toISOString().slice(0, 10)}.csv`;

  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ── CSV 문자열 → 세션 배열 (임포트용) ────────────────────────────────────────
export function csvToSessions(csvText: string): MeasurementSession[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV 데이터가 없습니다.');

  const headerLine = lines[0].replace(/\r/g, '');
  const headers    = headerLine.split(',');

  // 헤더 검증
  const required = ['session_id', 'measured_at', 'avg_sys', 'avg_dia', 'avg_pul', 'ai_status'];
  for (const h of required) {
    if (!headers.includes(h)) throw new Error(`필수 헤더 누락: ${h}`);
  }

  const sessions: MeasurementSession[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].replace(/\r/g, '').trim();
    if (!line) continue;

    const cells = parseCsvLine(line);
    const get   = (col: string) => cells[headers.indexOf(col)] ?? '';
    const getN  = (col: string) => Number(get(col)) || 0;

    const session: MeasurementSession = {
      session_id: get('session_id') || crypto.randomUUID(),
      age_group:  (get('age_group') || '50대') as AgeGroup,
      measured_at: get('measured_at') || new Date().toISOString(),
      time_slot:  (get('time_slot') || '아침') as TimeSlot,
      arm:        (get('arm') || '좌팔') as Arm,
      posture:    (get('posture') || '앉은 자세') as Posture,
      readings: [
        { sys: getN('sys1') || getN('avg_sys'), dia: getN('dia1') || getN('avg_dia'), pul: getN('pul1') || getN('avg_pul') },
        { sys: getN('sys2') || getN('avg_sys'), dia: getN('dia2') || getN('avg_dia'), pul: getN('pul2') || getN('avg_pul') },
        { sys: getN('sys3') || getN('avg_sys'), dia: getN('dia3') || getN('avg_dia'), pul: getN('pul3') || getN('avg_pul') },
      ],
      avg_sys:   getN('avg_sys'),
      avg_dia:   getN('avg_dia'),
      avg_pul:   getN('avg_pul'),
      ai_status: (get('ai_status') || '정상') as BpStatus,
      memo:      get('memo') || undefined,
    };

    if (!session.avg_sys || !session.avg_dia) continue; // 유효성 최소 검사
    sessions.push(session);
  }

  return sessions;
}

// ── CSV 한 줄 파싱 (쌍따옴표 이스케이프 처리) ────────────────────────────────
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"')                    { inQuote = false; }
      else                                    { cur += ch; }
    } else {
      if (ch === '"')      { inQuote = true; }
      else if (ch === ',') { cells.push(cur); cur = ''; }
      else                 { cur += ch; }
    }
  }
  cells.push(cur);
  return cells;
}
