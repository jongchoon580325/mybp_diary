import { describe, it, expect } from 'vitest';

// ── 하네스 ②③ 검증 로직만 단위 테스트 (API 호출 없이) ─────────────────────

const VALID_STATUSES = ['정상', '주의', '고혈압 의심'];
const FORBIDDEN = ['고혈압입니다', '진단합니다', '확정', '확진'];

function validateAiOutput(obj: Record<string, unknown>) {
  if (!VALID_STATUSES.includes(obj.status as string)) throw new Error('status 오류');
  if (obj.age_adjusted !== true) throw new Error('age_adjusted 오류');
  if (typeof obj.message !== 'string' || obj.message.length > 20) throw new Error('message 오류');
  if (typeof obj.disclaimer !== 'string' || !obj.disclaimer.includes('참고용')) throw new Error('disclaimer 오류');
  const text = [obj.message, obj.advice, obj.disclaimer].join(' ');
  if (FORBIDDEN.some((w) => String(text).includes(w))) throw new Error('금칙어 감지');
  return true;
}

describe('하네스 ② — AI 출력 검증', () => {
  it('정상 응답 통과', () => {
    expect(validateAiOutput({
      status: '정상', age_adjusted: true,
      message: '정상 범위입니다',
      advice: '규칙적인 운동을 권장합니다.',
      disclaimer: '이 결과는 참고용이며 의료 진단이 아닙니다.',
    })).toBe(true);
  });

  it('status 허용값 외 → 오류', () => {
    expect(() => validateAiOutput({
      status: 'hypertension', age_adjusted: true,
      message: '테스트', advice: '조언', disclaimer: '참고용',
    })).toThrow('status 오류');
  });

  it('age_adjusted false → 오류', () => {
    expect(() => validateAiOutput({
      status: '정상', age_adjusted: false,
      message: '테스트', advice: '조언', disclaimer: '참고용',
    })).toThrow('age_adjusted 오류');
  });

  it('message 21자 → 오류', () => {
    expect(() => validateAiOutput({
      status: '정상', age_adjusted: true,
      message: '이것은스물한글자를초과하는긴메시지입니다확인',  // 22자
      advice: '조언', disclaimer: '참고용',
    })).toThrow('message 오류');
  });

  it('disclaimer "참고용" 미포함 → 오류', () => {
    expect(() => validateAiOutput({
      status: '주의', age_adjusted: true,
      message: '주의 필요',
      advice: '조언', disclaimer: '건강 관리 앱입니다.',
    })).toThrow('disclaimer 오류');
  });
});

describe('하네스 ③ — 금칙어 필터', () => {
  it('"고혈압입니다" → 금칙어 감지', () => {
    expect(() => validateAiOutput({
      status: '고혈압 의심', age_adjusted: true,
      message: '고혈압입니다',
      advice: '의사 상담', disclaimer: '이 결과는 참고용이며 의료 진단이 아닙니다.',
    })).toThrow('금칙어 감지');
  });

  it('"진단합니다" → 금칙어 감지', () => {
    expect(() => validateAiOutput({
      status: '고혈압 의심', age_adjusted: true,
      message: '상담 필요',
      advice: '고혈압으로 진단합니다.', disclaimer: '이 결과는 참고용이며 의료 진단이 아닙니다.',
    })).toThrow('금칙어 감지');
  });

  it('금칙어 없는 정상 응답 → 통과', () => {
    expect(validateAiOutput({
      status: '고혈압 의심', age_adjusted: true,
      message: '전문가 상담 권장',
      advice: '의료 전문가와 상담하세요.', disclaimer: '이 결과는 참고용이며 의료 진단이 아닙니다.',
    })).toBe(true);
  });
});
