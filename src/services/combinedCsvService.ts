/**
 * 혈압 + 혈당 통합 CSV 서비스
 *
 * 파일 포맷 (type 컬럼으로 행 구분):
 *   type = "bp"      → 혈압 행: BP 컬럼 사용, 혈당 컬럼 공백
 *   type = "glucose" → 혈당 행: 혈당 컬럼 사용, BP 컬럼 공백
 */

import type {
  MeasurementSession,
  AgeGroup, BpStatus, TimeSlot, Arm, Posture, Device,
  GlucoseRecord, MealTag, GlucoseStatus,
} from '../types';

// ── 헤더 정의 ─────────────────────────────────────────────────────────────────
const HEADERS = [
  // 공통
  'type', 'id', 'measured_at',
  // 혈압 전용
  'age_group', 'time_slot', 'arm', 'posture', 'device',
  'sys1', 'dia1', 'pul1',
  'sys2', 'dia2', 'pul2',
  'sys3', 'dia3', 'pul3',
  'avg_sys', 'avg_dia', 'avg_pul', 'ai_status',
  // 혈당 전용
  'glucose_level', 'meal_tag', 'gl_status',
  // 공통 (끝)
  'memo', 'created_at',
] as const;

// ── 셀 이스케이프 ─────────────────────────────────────────────────────────────
function esc(v: string | number | undefined | null): string {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

// ── 내보내기 ──────────────────────────────────────────────────────────────────
export function downloadCombinedCsv(
  sessions:       MeasurementSession[],
  glucoseRecords: GlucoseRecord[],
  userName?:      string,
): void {
  const rows: string[] = [HEADERS.join(',')];

  // 혈압 행
  for (const s of sessions) {
    rows.push([
      'bp', s.session_id, s.measured_at,
      s.age_group, s.time_slot, s.arm, s.posture, s.device ?? '',
      s.readings[0].sys, s.readings[0].dia, s.readings[0].pul,
      s.readings[1].sys, s.readings[1].dia, s.readings[1].pul,
      s.readings[2].sys, s.readings[2].dia, s.readings[2].pul,
      s.avg_sys, s.avg_dia, s.avg_pul, s.ai_status,
      '', '', '',           // glucose 컬럼 공백
      s.memo ?? '', s.measured_at,
    ].map(esc).join(','));
  }

  // 혈당 행
  for (const r of glucoseRecords) {
    rows.push([
      'glucose', r.record_id, r.measured_at,
      '', '', '', '', '',   // BP 메타 공백 (age_group, time_slot, arm, posture, device)
      '', '', '',           // readings[0] 공백
      '', '', '',           // readings[1] 공백
      '', '', '',           // readings[2] 공백
      '', '', '', '',       // avg + ai_status 공백
      r.glucose_level, r.meal_tag, r.status,
      r.note ?? '', r.created_at,
    ].map(esc).join(','));
  }

  const dateStr    = new Date().toISOString().slice(0, 10);
  const nameSuffix = userName?.trim() ? `-${userName.trim()}` : '';
  const filename   = `${dateStr}-bppresure${nameSuffix}.csv`;

  const bom  = '\uFEFF';  // UTF-8 BOM (엑셀 한글 인식)
  const blob = new Blob([bom + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── 가져오기 ──────────────────────────────────────────────────────────────────
export interface ParsedCombinedCsv {
  sessions:       MeasurementSession[];
  glucoseRecords: GlucoseRecord[];
}

export function parseCombinedCsv(csvText: string): ParsedCombinedCsv {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV 데이터가 없습니다.');

  const headers = lines[0].replace(/\r/g, '').split(',');

  // 통합 포맷 여부 확인 (type 컬럼 존재)
  if (!headers.includes('type')) {
    throw new Error('통합 백업 파일이 아닙니다.\n(혈압/혈당 통합 백업 파일을 사용해 주세요.)');
  }

  const sessions:       MeasurementSession[] = [];
  const glucoseRecords: GlucoseRecord[]       = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].replace(/\r/g, '').trim();
    if (!line) continue;

    const cells = parseLine(line);
    const get   = (col: string) => cells[headers.indexOf(col)]?.replace(/^"|"$/g, '') ?? '';
    const getN  = (col: string) => Number(get(col)) || 0;

    const type = get('type');

    if (type === 'bp') {
      const s: MeasurementSession = {
        session_id:  get('id') || crypto.randomUUID(),
        age_group:   (get('age_group') || '50대') as AgeGroup,
        measured_at: get('measured_at') || new Date().toISOString(),
        time_slot:   (get('time_slot') || '아침') as TimeSlot,
        arm:         (get('arm') || '왼쪽 팔') as Arm,
        posture:     (get('posture') || '앉은 자세') as Posture,
        device:      (get('device') || undefined) as Device | undefined,
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
      if (s.avg_sys && s.avg_dia) sessions.push(s);

    } else if (type === 'glucose') {
      const r: GlucoseRecord = {
        record_id:     get('id') || crypto.randomUUID(),
        measured_at:   get('measured_at') || new Date().toISOString(),
        glucose_level: getN('glucose_level'),
        meal_tag:      (get('meal_tag') || '공복') as MealTag,
        status:        (get('gl_status') || '정상') as GlucoseStatus,
        note:          get('memo') || undefined,
        created_at:    get('created_at') || new Date().toISOString(),
      };
      if (r.glucose_level > 0) glucoseRecords.push(r);
    }
  }

  return { sessions, glucoseRecords };
}

// ── CSV 한 줄 파싱 (쌍따옴표 처리) ───────────────────────────────────────────
function parseLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '', inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { cur += ch; }
    } else {
      if (ch === '"')      { inQuote = true; }
      else if (ch === ',') { cells.push(cur); cur = ''; }
      else { cur += ch; }
    }
  }
  cells.push(cur);
  return cells;
}
