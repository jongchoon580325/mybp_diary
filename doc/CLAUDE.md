# CLAUDE.md — 프로젝트 컨텍스트 문서

> Claude Code와 협업 시 참고하는 프로젝트 가이드 문서입니다.  
> 최종 업데이트: 2026-03-31

---

## 1. 프로젝트 개요

**앱 이름:** BP Manager (혈압·혈당 관리)

**목적:**  
나이(연령대)별 기준을 적용한 혈압·혈당 자가 관리 모바일 웹앱.  
측정 → 기록 → AI 분석 → PDF 리포트 생성까지의 전 과정을 자동화해, 환자와 의료진 양측에서 신뢰할 수 있는 건강 관리 플랫폼을 지향합니다.

**주요 기능:**

| 도메인 | 기능 |
|---|---|
| 혈압 | 3회 측정 후 자동 평균 계산, 연령대별 기준 판정, AI(Claude) 소견, 편차 경고, PDF 리포트, CSV 내보내기 |
| 혈당 | 식사 시점(공복·식전·식후·취침 전) 태그, ADA 2025 기준 분류, CSV 내보내기 |
| 인증 | 게스트(익명) + Google OAuth, 게스트→Google 계정 연결(UID 유지) |
| PWA | 홈 화면 설치, 서비스워커 오프라인 지원, 자동 업데이트 배너 |

**사용자 타겟:** 고혈압 자가 관리 환자, 진료 데이터 준비 사용자, 디지털 경험이 적은 고령층

---

## 2. 기술 스택

### 코어

| 항목 | 버전 | 역할 |
|---|---|---|
| React | 19.2.4 | UI 컴포넌트 |
| TypeScript | ~5.9.3 | 타입 안전성 |
| Vite | 8.0.1 | 빌드 도구(HMR) |

### 주요 라이브러리

| 라이브러리 | 버전 | 역할 |
|---|---|---|
| react-router-dom | 7.13.2 | SPA 라우팅 (lazy 코드 스플리팅) |
| framer-motion | 12.38.0 | 화면 전환 애니메이션 |
| recharts | 3.8.1 | 혈압·혈당 추이 차트 |
| lucide-react | 1.7.0 | 아이콘 |
| Tailwind CSS | 3.4.19 | 유틸리티 스타일링 |
| Zustand | 5.0.12 | 전역 상태 관리 |
| Firebase | 12.11.0 | Auth + Firestore + Hosting |
| idb | 8.0.3 | IndexedDB 래퍼 (오프라인 저장) |
| @anthropic-ai/sdk | 0.80.0 | Claude AI 소견 생성 |
| jspdf + html2canvas | 4.2.1 / 1.4.1 | PDF 리포트 생성 |
| vite-plugin-pwa | 1.0.2 | 서비스워커·앱 매니페스트 |
| Vitest | 4.1.2 | 단위 테스트 |
| @testing-library/react | 16.3.2 | 컴포넌트 테스트 |

### AI 모델

- **claude-haiku-4-5-20251001** — 속도 우선으로 채택; 소견 생성 + 검증 하네스 적용

---

## 3. 프로젝트 구조

```
src/
├── App.tsx                    # 라우팅, Auth 가드, 전역 UI (PWA 배너, 토스트)
├── main.tsx                   # React 진입점
│
├── types/
│   └── index.ts               # 전체 공용 타입 (MeasurementSession, GlucoseRecord, BpStatus 등)
│
├── contexts/
│   └── AuthContext.tsx         # Firebase 인증 상태 Provider
│
├── firebase/
│   ├── config.ts              # Firebase 초기화, Firestore 영구 캐시 설정
│   ├── useAuth.ts             # Google OAuth / 익명 / 계정 연결 훅
│   ├── repository.ts          # IBpRepository Firestore 구현체
│   ├── glucoseRepository.ts   # IGlucoseRepository Firestore + IndexedDB 구현체
│   ├── IBpRepository.ts       # 혈압 저장소 인터페이스
│   └── IGlucoseRepository.ts  # 혈당 저장소 인터페이스
│
├── hooks/
│   ├── useDB.ts               # 인증 상태 → Firestore or IndexedDB 저장소 반환
│   ├── useGlucoseDB.ts        # 혈당 저장소 동일 패턴
│   └── useModal.ts            # 전역 모달·토스트 Zustand 스토어
│
├── store/
│   ├── sessionStore.ts        # 혈압 입력 임시 상태 (readings, timeSlot, arm, posture, memo)
│   ├── settingsStore.ts       # 영구 사용자 설정 (연령대, 이름, 혈당 목표) — localStorage persist
│   └── glucoseInputStore.ts   # 혈당 입력 임시 상태 (mealTag, glucoseLevel, note)
│
├── screens/
│   ├── AuthScreen.tsx         # 로그인 / 게스트 진입
│   ├── InputScreen.tsx        # 혈압 3회 입력 + AI 소견
│   ├── RecordScreen.tsx       # 혈압 기록 목록 + 필터/정렬
│   ├── ChartScreen.tsx        # 혈압 추이 차트
│   ├── GlucoseInputScreen.tsx # 혈당 단회 입력
│   ├── GlucoseRecordScreen.tsx# 혈당 기록 목록
│   └── GlucoseChartScreen.tsx # 혈당 추이 차트
│
├── components/
│   ├── Header.tsx             # 상단 고정 헤더
│   ├── BottomNav.tsx          # 하단 도메인 전환 탭 내비게이션
│   ├── BpInputField.tsx       # 혈압 수치 입력 필드 (수축기/이완기/맥박)
│   ├── AgeChipGroup.tsx       # 연령대 선택 칩 (20대~70대+)
│   ├── MealTagGroup.tsx       # 식사 시점 선택 (5종)
│   ├── Modal.tsx              # 전역 모달 디스패처
│   ├── AiResultModal.tsx      # AI 소견 결과 표시
│   ├── SessionDetailModal.tsx # 세션 상세 + 편집/삭제
│   ├── SettingsDrawer.tsx     # 사용자 설정 서랍 (연령대, 데이터 내보내기 등)
│   ├── PwaUpdateBanner.tsx    # 새 버전 업데이트 안내 배너
│   └── ToastNotification.tsx  # 자동 소멸 토스트 (success/error/warning)
│
├── services/
│   ├── validation.ts          # validateReading(), checkDeviation() — 혈압 입력 검증
│   ├── aiJudge.ts             # Claude API 호출 + 출력 검증 하네스 + 룰 기반 폴백
│   ├── glucoseValidation.ts   # validateGlucose(), classifyGlucose() — ADA 2025 기준
│   ├── db.ts                  # IndexedDB 스키마 (bp-manager-db v2)
│   ├── csvService.ts          # 혈압 CSV 내보내기
│   ├── glucoseCsvService.ts   # 혈당 CSV 내보내기
│   ├── combinedCsvService.ts  # 혈압+혈당 통합 CSV 내보내기
│   └── pdfReport.ts           # jspdf + html2canvas PDF 생성
│
├── constants/
│   ├── ageBPStandards.ts      # 연령대별 혈압 기준값 + judgeByRules()
│   └── glucoseStandards.ts    # ADA 2025 혈당 기준값 (식사 시점별)
│
├── styles/
│   ├── tokens.css             # CSS 커스텀 속성 (색상, 그림자, 반경, 전환)
│   └── index.css              # 전역 리셋, 타이포그래피, 애니메이션
│
└── test/
    ├── setup.ts
    ├── validation.test.ts
    ├── ageBPStandards.test.ts
    ├── aiJudge.test.ts
    ├── sessionStore.test.ts
    └── csvService.test.ts
```

**라우팅 구조:**

```
/                    → InputScreen (혈압 입력)
/chart               → ChartScreen (혈압 추이)
/records             → RecordScreen (혈압 기록)
/glucose             → GlucoseInputScreen (혈당 입력)
/glucose/records     → GlucoseRecordScreen (혈당 기록)
/glucose/chart       → GlucoseChartScreen (혈당 추이)
```

---

## 4. 코드 규칙

### 네이밍

| 대상 | 규칙 | 예시 |
|---|---|---|
| 변수·함수 | camelCase | `addReading`, `sessionStore`, `aiResult` |
| 상수 | UPPER_SNAKE_CASE | `TIME_OPTIONS`, `DEVIATION_THRESHOLD` |
| 컴포넌트·타입·인터페이스 | PascalCase | `InputScreen`, `MeasurementSession`, `BpStatus` |
| 컴포넌트 파일 | PascalCase.tsx | `BpInputField.tsx`, `Modal.tsx` |
| 서비스·유틸 파일 | camelCase.ts | `aiJudge.ts`, `glucoseValidation.ts` |
| 스토어 파일 | camelCase + Store | `sessionStore.ts`, `settingsStore.ts` |

### 한국어 사용 원칙

도메인 식별자와 UI 문자열은 의도적으로 한국어 사용:

```ts
type AgeGroup = '20대' | '30대' | '40대' | '50대' | '60대' | '70대+'
type TimeSlot = '아침' | '저녁'
type MealTag = '공복' | '식전' | '식후 1h' | '식후 2h' | '취침 전'
type BpStatus = '정상' | '주의' | '고혈압 의심'
```

### 스타일링

- **CSS 토큰** (`tokens.css`): 모든 색상·그림자·반경을 CSS 변수로 관리
  - 패턴: `--color-{category}-{shade}`, `--shadow-{size}`, `--radius-{size}`
  - 상태 색상: `--color-status-normal` (녹색), `--color-status-caution` (노랑), `--color-status-danger` (빨강)
- **인라인 style={}**: 컴포넌트 로컬 스타일에 사용
- **Tailwind CSS**: 빠른 레이아웃·간격 유틸리티에 사용
- **모바일 우선 레이아웃**: 최대 너비 480px, 고정 헤더(56px)·하단 탭(92px) 기준 설계

### 컴포넌트 작성 패턴

```tsx
// 1. Props 인터페이스 상단 선언
interface ComponentProps { ... }

// 2. 훅 최상단 배치
export default function ComponentName({ prop }: ComponentProps) {
  const { user } = useAuthContext();
  const store = useSessionStore();
  // ...

  // 3. JSX 반환
  return ( ... );
}
```

### 서비스·유틸 패턴

- 클래스 없이 함수 단위 export
- 에러: 유효하지 않은 입력 → null 반환 또는 throw; union return type으로 선택적 처리

```ts
export function validateReading(r: Partial<Reading>): ValidationError[] { ... }
export function checkDeviation(readings: Reading[]): boolean { ... }
```

### Zustand 스토어 패턴

- 상태 + 액션을 단일 `create()` 호출 안에 정의
- 영구 설정은 `persist()` 미들웨어로 localStorage 자동 동기화
- 비즈니스 로직은 services에 위임, 스토어는 UI 상태만 관리

### 테스트 규칙

- 테스트 파일 위치: `src/test/*.test.ts`
- 외부 의존성(Firebase, Anthropic SDK)은 mock 처리
- 구조: `describe` → `beforeEach` → `it` 블록

---

## 5. 주의사항

### 의료·법적 제약 (절대 위반 금지)

- 앱은 **참고용 판정만** 제공; 진단·처방·확진 표현 절대 금지
- AI 출력에서 금지 문구 필터링 적용:
  ```
  '고혈압입니다', '고혈압으로 진단', '진단합니다', '확정', '치료가 필요합니다' 등
  ```
- 모든 AI 출력에 면책 문구 필수 포함: `"이 결과는 참고용이며 의료 진단이 아닙니다."`
- AI 소견 필드: `status`는 `'정상' | '주의' | '고혈압 의심'` 중 하나만 허용, `age_adjusted: true` 필수

### 환경 변수 설정 필요

`.env.local` 파일에 아래 변수 설정 필요 (`.env.example` 참고):

```
VITE_ANTHROPIC_API_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

- `VITE_ANTHROPIC_API_KEY` 미설정 시 → 룰 기반 폴백(`judgeByRules()`)으로 자동 전환

### Firebase / Firestore

- Firebase 프로젝트 ID: `todaybp`
- Firestore 문서 구조:
  ```
  users/{uid}/
    sessions/{session_id}    → MeasurementSession
    glucose/{record_id}      → GlucoseRecord
  ```
- iOS PWA에서 BroadcastChannel 오류 방지: `persistentSingleTabManager()` 사용
- `ignoreUndefinedProperties: true` 설정으로 부분 업데이트 안전 처리

### IndexedDB 스키마

- DB명: `bp-manager-db`, 버전 2 (v1: sessions, v2: + glucose)
- **버전 마이그레이션**: `oldVersion < 2` 조건으로 glucose 스토어 자동 생성
- 인덱스: `by-date`, `by-age-group`, `by-status` (혈압); `by-date`, `by-meal-tag`, `by-status` (혈당)

### AI 안전 하네스 (3단계)

1. **입력 검증** (`services/validation.ts`): 수축기 60–250, 이완기 40–150, 맥박 30–200, 수축기 > 이완기
2. **편차 경고**: 3회 측정 중 수축기 최대–최소 > 20 mmHg 시 경고 표시
3. **출력 검증** (`services/aiJudge.ts`): status 유효성, `age_adjusted: true`, `message` ≤ 20자, 금지 문구 없음
4. **폴백**: API 실패 또는 키 미설정 → `judgeByRules()` (오프라인 룰 기반 판정)

### PWA / 서비스워커

- `autoUpdate` 전략: 배포 즉시 새 SW 활성화 (`skipWaiting + clientsClaim`)
- SW 파일(`/sw.js`)에 반드시 `Cache-Control: no-cache` 설정 (firebase.json headers 확인)
- 정적 에셋은 `max-age=31536000, immutable` (1년 브라우저 캐시)

### 빌드 & 배포

- 빌드 명령: `tsc -b && vite build` (TypeScript 검사 선행)
- 배포: Firebase Hosting (`firebase deploy`)
- SPA 라우팅: `firebase.json` rewrite — 모든 경로 → `index.html`
- 출력 디렉토리: `dist/`

### 자주 실수하는 점

- 연령대 미선택 상태에서 저장 버튼 노출하지 않도록 주의 (저장 버튼 조건부 렌더링)
- `MeasurementSession` 저장 시 `created_at`은 Firestore `Timestamp` 타입 — JS `Date`와 혼용 주의
- `useDB()` / `useGlucoseDB()` 훅은 인증 상태 변화 시 저장소 구현체가 바뀜 — 캐싱 주의
- 혈당 기준은 식사 시점(MealTag)마다 다름 — `glucoseStandards.ts`의 태그별 분기 확인
- PDF 생성은 html2canvas → jspdf 순서 (비동기); 차트가 DOM에 렌더된 후 캡처해야 함
