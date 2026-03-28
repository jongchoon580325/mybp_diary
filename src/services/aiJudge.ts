import Anthropic from '@anthropic-ai/sdk';
import type { AgeGroup, AiJudgeResult, BpStatus } from '../types';
import { getStandard, judgeByRules } from '../constants/ageBPStandards';

// ─── 하네스 ③ 금칙어 필터 ─────────────────────────────────────────────────────
const FORBIDDEN_PHRASES = [
  '고혈압입니다', '고혈압으로 진단', '진단합니다', '진단됩니다',
  '확정', '확진', '치료가 필요합니다', '반드시 치료', '즉시 치료',
  'diagnosed', 'you have hypertension',
];

function containsForbiddenPhrase(text: string): boolean {
  return FORBIDDEN_PHRASES.some((p) => text.includes(p));
}

// ─── 하네스 ② 출력 검증 ───────────────────────────────────────────────────────
const VALID_STATUSES: BpStatus[] = ['정상', '주의', '고혈압 의심'];

function validateAiOutput(raw: unknown): AiJudgeResult {
  if (typeof raw !== 'object' || raw === null) throw new Error('응답이 객체가 아닙니다.');

  const obj = raw as Record<string, unknown>;

  // status 허용값 확인
  if (!VALID_STATUSES.includes(obj.status as BpStatus)) {
    throw new Error(`status 허용값 오류: ${obj.status}`);
  }
  // age_adjusted: true 확인
  if (obj.age_adjusted !== true) {
    throw new Error('age_adjusted 필드가 true가 아닙니다.');
  }
  // message 20자 이하
  if (typeof obj.message !== 'string' || obj.message.length > 20) {
    throw new Error(`message 20자 초과 또는 누락: ${obj.message}`);
  }
  // disclaimer 존재 확인
  if (typeof obj.disclaimer !== 'string' || !obj.disclaimer.includes('참고용')) {
    throw new Error('disclaimer 필드 누락 또는 면책 문구 미포함.');
  }
  // 금칙어 검사 (하네스 ③)
  const fullText = [obj.message, obj.advice, obj.disclaimer].join(' ');
  if (containsForbiddenPhrase(String(fullText))) {
    throw new Error('금칙어(확정 진단 문구) 감지됨.');
  }

  return {
    status:       obj.status as BpStatus,
    age_adjusted: true,
    message:      obj.message as string,
    advice:       typeof obj.advice === 'string' ? obj.advice : '',
    disclaimer:   obj.disclaimer as string,
  };
}

// ─── 프롬프트 구성 ────────────────────────────────────────────────────────────
function buildPrompt(ageGroup: AgeGroup, sys: number, dia: number, pul: number, time: string): string {
  const std = getStandard(ageGroup);
  return `당신은 혈압 참고 정보를 제공하는 보조 시스템입니다. 아래 입력 데이터를 보고 JSON만 반환하세요.

입력:
{
  "age_group": "${ageGroup}",
  "sys": ${sys},
  "dia": ${dia},
  "pul": ${pul},
  "time": "${time}"
}

${ageGroup} 판정 기준:
- 정상: sys < ${std.sys_normal} AND dia < ${std.dia_normal}
- 주의: sys ${std.sys_normal}~${std.sys_caution - 1} / dia ${std.dia_normal}~${std.dia_caution - 1}
- 고혈압 의심: sys ≥ ${std.sys_caution} OR dia ≥ ${std.dia_caution}

규칙:
1. status는 반드시 "정상", "주의", "고혈압 의심" 중 하나
2. age_adjusted는 반드시 true
3. message는 20자 이내 한국어
4. advice는 생활습관 조언 1가지 (50자 이내)
5. disclaimer는 반드시 "이 결과는 참고용이며 의료 진단이 아닙니다." 문구 포함
6. 확정 진단 표현 절대 금지 ("진단합니다", "고혈압입니다" 등)

반드시 아래 JSON 형식만 반환:
{
  "status": "정상|주의|고혈압 의심",
  "age_adjusted": true,
  "message": "20자 이내",
  "advice": "생활습관 조언",
  "disclaimer": "이 결과는 참고용이며 의료 진단이 아닙니다."
}`;
}

// ─── 폴백: 규칙 기반 판정 ────────────────────────────────────────────────────
function fallbackJudge(ageGroup: AgeGroup, sys: number, dia: number): AiJudgeResult {
  const status = judgeByRules(ageGroup, sys, dia);
  const adviceMap: Record<BpStatus, string> = {
    '정상':      '현재 상태를 유지하며 규칙적인 운동을 권장합니다.',
    '주의':      '저염식 식단과 규칙적인 유산소 운동을 권장합니다.',
    '고혈압 의심': '의료 전문가 상담을 권장합니다.',
  };
  return {
    status,
    age_adjusted: true,
    message:     status === '정상' ? '정상 범위입니다' : status === '주의' ? '주의가 필요합니다' : '전문가 상담 권장',
    advice:      adviceMap[status],
    disclaimer:  '이 결과는 참고용이며 의료 진단이 아닙니다.',
  };
}

// ─── 메인 AI 판정 함수 ────────────────────────────────────────────────────────
export async function aiJudge(
  ageGroup: AgeGroup,
  sys: number,
  dia: number,
  pul: number,
  time: string
): Promise<AiJudgeResult & { usedFallback: boolean }> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  // API 키 미설정 시 즉시 폴백
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return { ...fallbackJudge(ageGroup, sys, dia), usedFallback: true };
  }

  try {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', // 빠른 응답을 위해 Haiku 사용
      max_tokens: 256,
      messages: [{ role: 'user', content: buildPrompt(ageGroup, sys, dia, pul, time) }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    // JSON 추출 (마크다운 코드블록 처리)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON을 찾을 수 없습니다.');

    const parsed = JSON.parse(jsonMatch[0]);
    const result = validateAiOutput(parsed); // 하네스 ②③ 검증

    return { ...result, usedFallback: false };
  } catch (err) {
    console.warn('[aiJudge] AI 판정 실패, 폴백 사용:', err);
    return { ...fallbackJudge(ageGroup, sys, dia), usedFallback: true };
  }
}
