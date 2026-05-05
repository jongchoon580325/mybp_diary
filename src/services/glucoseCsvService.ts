import type { GlucoseRecord } from '../types';

const HEADERS = [
  'record_id', 'measured_at', 'glucose_level', 'meal_tag',
  'status', 'note', 'created_at',
];

function esc(v: string | number | undefined): string {
  if (v === undefined || v === null) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function downloadGlucoseCsv(records: GlucoseRecord[]): void {
  const rows = [
    HEADERS.join(','),
    ...records.map((r) =>
      [
        esc(r.record_id),
        esc(r.measured_at),
        esc(r.glucose_level),
        esc(r.meal_tag),
        esc(r.status),
        esc(r.note),
        esc(r.created_at),
      ].join(',')
    ),
  ];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `glucose_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function csvToGlucoseRecords(csv: string): GlucoseRecord[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV 파일이 비어 있습니다.');
  const header = lines[0].split(',');
  const get = (cols: string[], key: string) =>
    (cols[header.indexOf(key)] ?? '').replace(/^"|"$/g, '').trim();

  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    return {
      record_id:     get(cols, 'record_id'),
      measured_at:   get(cols, 'measured_at'),
      glucose_level: Number(get(cols, 'glucose_level')),
      meal_tag:      get(cols, 'meal_tag') as GlucoseRecord['meal_tag'],
      status:        get(cols, 'status')   as GlucoseRecord['status'],
      note:          get(cols, 'note') || undefined,
      created_at:    get(cols, 'created_at'),
    };
  });
}
