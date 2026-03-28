import type { Reading, ValidationError } from '../types';

// PRD §4.2 하네스 ① 입력 검증 기준표
const LIMITS = {
  sys: { min: 60,  max: 250 },
  dia: { min: 40,  max: 150 },
  pul: { min: 30,  max: 200 },
};

const DEVIATION_THRESHOLD = 20; // mmHg

/**
 * 단일 측정값 검증
 * @returns ValidationError[] (빈 배열이면 정상)
 */
export function validateReading(r: Partial<Reading>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (r.sys === undefined || isNaN(r.sys)) {
    errors.push({ field: 'sys', message: '수축기 혈압을 입력하세요.' });
  } else if (r.sys < LIMITS.sys.min || r.sys > LIMITS.sys.max) {
    errors.push({ field: 'sys', message: `수축기: ${LIMITS.sys.min}~${LIMITS.sys.max} mmHg 범위로 입력하세요.` });
  }

  if (r.dia === undefined || isNaN(r.dia)) {
    errors.push({ field: 'dia', message: '이완기 혈압을 입력하세요.' });
  } else if (r.dia < LIMITS.dia.min || r.dia > LIMITS.dia.max) {
    errors.push({ field: 'dia', message: `이완기: ${LIMITS.dia.min}~${LIMITS.dia.max} mmHg 범위로 입력하세요.` });
  }

  if (r.pul === undefined || isNaN(r.pul)) {
    errors.push({ field: 'pul', message: '맥박을 입력하세요.' });
  } else if (r.pul < LIMITS.pul.min || r.pul > LIMITS.pul.max) {
    errors.push({ field: 'pul', message: `맥박: ${LIMITS.pul.min}~${LIMITS.pul.max} bpm 범위로 입력하세요.` });
  }

  // SYS > DIA 논리 검증
  if (
    r.sys !== undefined && r.dia !== undefined &&
    !isNaN(r.sys) && !isNaN(r.dia) &&
    r.sys <= r.dia
  ) {
    errors.push({ field: 'dia', message: '수축기는 이완기보다 높아야 합니다.' });
  }

  return errors;
}

/**
 * 회차 간 편차 검증 (수축기 기준)
 * @returns true이면 편차 초과 (재측정 권고 필요)
 */
export function checkDeviation(readings: Reading[]): boolean {
  if (readings.length < 2) return false;
  const sysValues = readings.map((r) => r.sys);
  const max = Math.max(...sysValues);
  const min = Math.min(...sysValues);
  return max - min > DEVIATION_THRESHOLD;
}
