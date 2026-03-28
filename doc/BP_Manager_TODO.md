# BloodPressure Manager — TODO LIST

> **기준 문서**: 개발계획서 v1.0 / PRD v1.1  
> **작성일**: 2026-03-28  
> **저작권**: © 2026 BloodPressure Manager · Produced by 나  종  춘  
> **범례**: `[ ]` 미완료 &nbsp;|&nbsp; `[x]` 완료 &nbsp;|&nbsp; `[~]` 진행중 &nbsp;|&nbsp; `[!]` 블로킹 이슈

---

## Phase 1 — 프로젝트 기반 & 공통 레이아웃 (1~2주차)

### 📁 프로젝트 셋업
- [ ] Vite + React 18 + TypeScript 프로젝트 생성
- [ ] Tailwind CSS 설정 (`tailwind.config.js`, `postcss.config.js`)
- [ ] CSS Variables 토큰 파일 생성 (`src/styles/tokens.css`)
- [ ] Google Fonts 설정 (DM Mono, Noto Sans KR)
- [ ] 폴더 구조 생성 (`components/`, `screens/`, `hooks/`, `store/`, `services/`, `constants/`, `types/`)
- [ ] TypeScript 타입 정의 (`src/types/index.ts`)
  - [ ] `AgeGroup` 타입 (6구간 유니온)
  - [ ] `Reading` 인터페이스
  - [ ] `MeasurementSession` 인터페이스
  - [ ] `BPStandard` 인터페이스
  - [ ] `BpStatus` 타입 (`'정상' | '주의' | '고혈압 의심'`)
  - [ ] `ModalType` 타입
- [ ] `.env` 파일 템플릿 생성 (`.env.example`)
- [ ] ESLint + Prettier 설정
- [ ] Vitest 테스트 환경 설정

### 🎨 디자인 시스템
- [ ] 컬러 팔레트 CSS 변수 전체 정의
  - [ ] Primary (진한 녹색 계열, 900~50 단계)
  - [ ] Neutral (회색 계열)
  - [ ] Status 색상 (정상/주의/고혈압의심)
  - [ ] 배경, 카드, 서피스
  - [ ] 그림자, 보더 반경 변수
- [ ] Tailwind 커스텀 컬러 & 폰트 등록
- [ ] 글로벌 기본 스타일 (`global.css`)

### 🖼️ App Icon & Favicon
- [ ] SVG 아이콘 설계 (방패형 + 심박 파형)
  - [ ] `public/icon.svg` 생성
  - [ ] 방패형 배경 그라디언트 (진한 녹색)
  - [ ] 심박 파형 polyline 그리기
  - [ ] 소형 하트 장식 추가
- [ ] `icon-192.png` 생성 (SVG → PNG 변환)
- [ ] `icon-512.png` 생성
- [ ] `index.html` favicon 링크 추가
- [ ] Apple touch icon 설정

### 🏗️ 공통 레이아웃 컴포넌트
- [ ] `Header.tsx` 구현
  - [ ] 배경색: `var(--color-primary-900)` (진한 녹색)
  - [ ] 하단 Round Corner: `border-radius: 0 0 18px 18px`
  - [ ] SVG 로고 마크 (소형, 혈압 심볼)
  - [ ] 앱 타이틀 + 버전 텍스트
  - [ ] 알림 아이콘 버튼 (뱃지 포함)
  - [ ] 설정 아이콘 버튼
  - [ ] `sticky top-0 z-50` 포지셔닝
- [ ] `Footer.tsx` 구현
  - [ ] 배경색: `var(--color-primary-900)` (진한 녹색)
  - [ ] 상단 Round Corner: `border-radius: 18px 18px 0 0`
  - [ ] 저작권 텍스트 중앙 정렬: `© 2026 BloodPressure Manager · Produced by 나  종  춘`
  - [ ] 면책 참조 출처 텍스트 (AHA/ESH/ESC 참조)
  - [ ] `position: fixed bottom-[60px]` (BottomNav 위)
- [ ] `BottomNav.tsx` 구현
  - [ ] 3탭: 입력 / 차트 / 기록
  - [ ] 활성 탭 상단 인디케이터 라인
  - [ ] 탭 아이콘 (Lucide React)
  - [ ] 탭 라벨 텍스트
  - [ ] `position: fixed bottom-0`

### ⚙️ 설정 & 연령대
- [ ] `settingsStore.ts` (Zustand) 생성
  - [ ] `ageGroup` 상태
  - [ ] `setAgeGroup()` 액션
  - [ ] localStorage persist 미들웨어 연결
- [ ] `AgeChipGroup.tsx` 컴포넌트
  - [ ] 6개 칩 렌더링 (20대~70대+)
  - [ ] 선택 상태 스타일 (진한 녹색 + 흰 텍스트)
  - [ ] 클릭 애니메이션 (scale 0.95 → 1)
  - [ ] 선택값 settingsStore에 저장
- [ ] `ageBPStandards.ts` 상수 파일
  - [ ] 6개 연령대 기준값 테이블 작성
  - [ ] `getStandard(ageGroup)` 유틸 함수

---

## Phase 2 — 입력 탭 & DB (3~4주차)

### 🗃️ IndexedDB 설정
- [ ] `idb` 라이브러리 설치
- [ ] `src/services/db.ts` DB 초기화 함수
  - [ ] `sessions` 오브젝트 스토어 생성
  - [ ] `by-date`, `by-age-group`, `by-status` 인덱스
  - [ ] `settings` 오브젝트 스토어
- [ ] `useDB.ts` 훅 구현
  - [ ] `saveSession()`
  - [ ] `getAllSessions()`
  - [ ] `getSessionsByRange(from, to)`
  - [ ] `updateSession(id, patch)`
  - [ ] `deleteSession(id)`
  - [ ] `clearAllSessions()`

### 💊 모달 시스템
- [ ] `useModal.ts` 훅 구현 (전역 모달 제어)
- [ ] `Modal.tsx` 기본 래퍼
  - [ ] backdrop: `blur(8px)` + 반투명 오버레이
  - [ ] Framer Motion 진입/퇴장 애니메이션
  - [ ] 외부 클릭 닫힘
  - [ ] ESC 키 닫힘
  - [ ] focus trap (접근성)
  - [ ] `role="dialog"` + `aria-modal`
- [ ] `ConfirmModal.tsx`
  - [ ] 제목, 메시지, 확인/취소 버튼
  - [ ] variant: `'default' | 'danger' | 'success'`
  - [ ] danger variant: 빨간 확인 버튼
- [ ] `AlertModal.tsx`
  - [ ] 제목, 메시지, 아이콘, 닫기 버튼
  - [ ] 자동 닫힘 옵션 (`autoClose: number ms`)
- [ ] `ToastNotification.tsx`
  - [ ] 상단 슬라이드 인/아웃 애니메이션
  - [ ] 3초 자동 소멸
  - [ ] 빨강/초록/노랑 variant
- [ ] **브라우저 기본 alert/confirm 전수 조사 후 모달로 교체**

### ✏️ 입력 탭 (InputScreen)
- [ ] `useMeasurement.ts` 훅
  - [ ] `readings` 배열 상태 (최대 3)
  - [ ] `step` 상태 (1~3 → 'avg')
  - [ ] `addReading(r: Reading)` 액션
  - [ ] `resetSession()` 액션
  - [ ] 평균 자동 계산 (`calcAverage()`)
- [ ] `sessionStore.ts` (Zustand) 생성
- [ ] `StepIndicator.tsx` 컴포넌트
  - [ ] 1→2→3→평균 단계 원형 표시
  - [ ] 완료: 진한 녹색 채움
  - [ ] 진행중: 맥동 애니메이션 (CSS keyframes)
  - [ ] 연결선 (완료 구간: 진한 녹색)
- [ ] `BpInputField.tsx` 컴포넌트
  - [ ] `inputMode="numeric"` 숫자 키패드
  - [ ] filled/empty/error 3가지 상태 스타일
  - [ ] 숫자 flip 애니메이션 (값 변경 시)
  - [ ] 하단 오류 메시지 표시
- [ ] `ToggleGroup.tsx` 컴포넌트 (아침/저녁, 좌/우팔, 앉은/누운)
- [ ] 메모 입력 필드 (textarea, 200자 제한, 카운터)
- [ ] 저장 버튼
  - [ ] 3회 미완료 시 비활성 + 해칭 스타일
  - [ ] 완료 시 활성화 애니메이션
- [ ] 날짜 바 (현재 날짜/시간대 자동 표시)
- [ ] 최근 측정 미니 리스트 (최근 3건)

### 🔒 하네스 ① 입력 검증
- [ ] `validateReading()` 함수 구현
  - [ ] SYS 범위 60~250
  - [ ] DIA 범위 40~150
  - [ ] PUL 범위 30~200
  - [ ] SYS > DIA 논리 검증
- [ ] 편차 검증 `checkDeviation()` 함수
  - [ ] 회차 간 ±20mmHg 초과 시 재측정 권고 모달 표시
- [ ] 연령대 미선택 시 저장 버튼 비활성화

---

## Phase 3 — AI 판정 & 저장 플로우 (5~6주차)

### 🤖 AI 판정 에이전트
- [ ] `aiJudge.ts` 서비스 구현
  - [ ] Anthropic Claude API 호출 함수
  - [ ] 연령대별 기준값 프롬프트 주입
  - [ ] JSON 응답 파싱
- [ ] 하네스 ② 출력 검증
  - [ ] `status` 허용값 확인
  - [ ] `age_adjusted: true` 확인
  - [ ] `message` 20자 이하 확인
  - [ ] `disclaimer` 필드 존재 확인
- [ ] 하네스 ③ 금칙어 필터
  - [ ] 확정 진단 문구 탐지 및 차단
- [ ] AI 응답 실패 시 폴백 로직 (규칙 기반 판정)
- [ ] 로딩 중 스켈레톤 UI 표시

### 💾 저장 완료 플로우
- [ ] 저장 버튼 클릭 → 로딩 상태
- [ ] AI 판정 완료 → `MeasurementSession` 객체 생성
- [ ] `saveSession()` DB 저장
- [ ] 성공 모달 표시 (판정 결과 + 조언)
- [ ] 성공 후 입력 폼 초기화
- [ ] 에러 발생 시 에러 모달 표시

### ✅ 하네스 회귀 테스트 (Phase 2~3 완료 후)
- [ ] 테스트 케이스 #1: 20대 정상
- [ ] 테스트 케이스 #2: 20대 주의
- [ ] 테스트 케이스 #3: 20대 고혈압 의심
- [ ] 테스트 케이스 #4: 50대 정상
- [ ] 테스트 케이스 #5: 50대 주의
- [ ] 테스트 케이스 #6: 50대 고혈압 의심
- [ ] 테스트 케이스 #7: 70대+ 정상 (완화 기준)
- [ ] 테스트 케이스 #8: 70대+ 주의
- [ ] 테스트 케이스 #9: 70대+ 고혈압 의심
- [ ] 테스트 케이스 #10: 입력값 범위 초과
- [ ] 테스트 케이스 #11: DIA > SYS 논리 오류
- [ ] 테스트 케이스 #12: 동일 수치 연령 보정 (138/84: 20대=주의 / 60대=정상)

---

## Phase 4 — 차트 탭 (7~8주차)

### 📈 차트 컴포넌트
- [ ] `BpLineChart.tsx` (Recharts 기반)
  - [ ] 수축기 꺾은선 (진한 녹색)
  - [ ] 이완기 꺾은선 (파란색)
  - [ ] 정상/주의/위험 구간 배경 색상
  - [ ] 연령대별 기준선 (참조선 `ReferenceLine`)
  - [ ] x축: 날짜, y축: mmHg
  - [ ] 커스텀 툴팁 (날짜, 수치, 판정)
  - [ ] 반응형 (`ResponsiveContainer`)
- [ ] `ReferenceLines.tsx` (연령대 기준선)
  - [ ] 정상 상한선 (녹색 점선)
  - [ ] 주의 상한선 (노란 점선)
  - [ ] 기준선 토글 버튼
- [ ] 맥박 소형 차트
- [ ] 기간 필터 탭 (1주 / 2주 / 1개월 / 3개월 / 전체)
  - [ ] 탭 전환 시 차트 데이터 애니메이션 갱신

### 📊 통계 요약 카드
- [ ] `StatSummaryCard.tsx`
  - [ ] 평균 수축기 / 평균 이완기 / 최고 수축기 / 측정 횟수
  - [ ] 2×2 그리드 레이아웃
  - [ ] 카드별 아이콘

### 📄 PDF 리포트
- [ ] `pdfReport.ts` 서비스 구현
  - [ ] 표지 (환자 연령대, 기간, 생성일)
  - [ ] 통계 요약 섹션
  - [ ] 차트 캡처 (`html2canvas`)
  - [ ] 데이터 테이블 (날짜별 측정값 + 판정)
  - [ ] 면책 조항 고정 출력
  - [ ] 저작권 footer: `© 2026 · Produced by 나  종  춘`
- [ ] 기간 지정 UI (시작일 ~ 종료일 달력 선택)
- [ ] 빠른 선택 버튼 (최근 1주 / 2주 / 1개월 / 3개월)
- [ ] PDF 생성 버튼 → 로딩 모달 → 완료 알림

---

## Phase 5 — 기록 탭 & 데이터 관리 (9~10주차)

### 📋 기록 탭 (RecordScreen)
- [ ] 기록 목록 구현 (날짜 역순)
  - [ ] 날짜 / 시간대 / 팔 정보
  - [ ] 평균 수치 (SYS/DIA/PUL)
  - [ ] 상태 배지 (StatusBadge)
  - [ ] 연령대 기준 표시
  - [ ] 상세 보기 버튼
- [ ] 검색 & 필터 바
  - [ ] 날짜 검색
  - [ ] 판정 필터 드롭다운 (전체/정상/주의/고혈압의심)
- [ ] 무한 스크롤 (20건씩 로드)
- [ ] 상세 보기 모달
  - [ ] 3회 개별 측정값 표시
  - [ ] 평균값 + 판정 + 적용 기준
  - [ ] AI 조언 텍스트
  - [ ] 메모 표시
  - [ ] 수정 버튼 (메모만 수정 가능)
  - [ ] 삭제 버튼 → 확인 모달

### 🗂️ CSV 백업 / 복구 / 초기화
- [ ] `csvExport.ts` 구현
  - [ ] 모든 세션 → CSV 변환
  - [ ] BOM(UTF-8) 포함으로 한글 깨짐 방지
  - [ ] 파일명: `bp-backup-YYYY-MM-DD.csv`
  - [ ] 브라우저 다운로드 트리거
- [ ] `csvImport.ts` 구현
  - [ ] 파일 선택 (input type="file", .csv)
  - [ ] 파싱 + 하네스 검증
  - [ ] 유효하지 않은 행 skip + 경고 모달
  - [ ] 복구 완료 모달 (복구 건수 표시)
- [ ] 전체 초기화 구현
  - [ ] 1단계 확인 모달: "모든 기록이 삭제됩니다"
  - [ ] 2단계 재확인 모달: "되돌릴 수 없습니다. 정말 삭제합니까?" (빨간 버튼)
  - [ ] 초기화 전 자동 CSV 백업 제안 모달
  - [ ] `clearAllSessions()` 실행

---

## Phase 6 — PWA & 최종 점검 (11~12주차)

### 📱 PWA 구현
- [ ] `vite-plugin-pwa` 설정 완료
  - [ ] `manifest.json` 내용 검증
    - [ ] `theme_color: '#0f2d1a'` (진한 녹색)
    - [ ] `short_name: 'BP Manager'`
    - [ ] `description: '... Produced by 나 종 춘'`
    - [ ] icons 배열 (192, 512)
  - [ ] Workbox 캐싱 전략 설정
  - [ ] 오프라인 폴백 페이지
- [ ] 홈화면 추가 배너 구현 (`beforeinstallprompt` 이벤트)
- [ ] 오프라인 상태 감지 → 토스트 알림
- [ ] 앱 업데이트 감지 → 업데이트 안내 모달

### 🎨 인터랙티브 요소 최종 점검
- [ ] 모든 버튼 hover/active 상태 확인
- [ ] 탭 전환 페이지 전환 애니메이션 (Framer Motion)
- [ ] 측정 완료 시 confetti 또는 성공 애니메이션
- [ ] 차트 데이터 로드 애니메이션
- [ ] 스크롤 위치 기억 (탭 전환 후 복귀)
- [ ] Pull-to-refresh (모바일)

### ♿ 접근성
- [ ] 모든 인터랙티브 요소 키보드 접근 가능
- [ ] ARIA 레이블 전수 점검
- [ ] 색상 대비비 4.5:1 이상 확인
- [ ] 화면 확대 200% 레이아웃 깨짐 여부 확인
- [ ] 고령자 UX 검증 (최소 폰트 16px, 터치 영역 44px)

### 🧪 테스트
- [ ] 하네스 회귀 테스트 12건 전체 통과 확인
- [ ] CSV 내보내기 → 초기화 → 복구 시나리오 테스트
- [ ] PDF 생성 Chrome/Safari 크로스 브라우저 테스트
- [ ] PWA 설치 → 오프라인 동작 테스트
- [ ] 연령대 보정 판정 케이스 수동 검증

### 🚀 배포 준비
- [ ] `npm run build` 에러 없음 확인
- [ ] bundle 크기 최적화 (code splitting)
- [ ] 이미지 최적화
- [ ] `https` 환경 배포 (PWA는 HTTPS 필수)
- [ ] Lighthouse 점수 확인 (Performance 90+, PWA 100)

---

## 지속 관리 항목

### 🔄 가이드라인 업데이트 대응
- [ ] AHA/ACC 가이드라인 변경 시 `ageBPStandards.ts` 업데이트
- [ ] 버전 필드 갱신 (`version: 'v1.2'` 등)
- [ ] 변경 이력 주석 추가

### 📝 문서 유지
- [ ] 컴포넌트별 JSDoc 주석 작성
- [ ] `README.md` 실행 방법 기술
- [ ] CHANGELOG.md 유지

---

> **총 TODO 항목 수**: 약 130개  
> **예상 완료 기간**: 12주 (Phase 1~6)  
> © 2026 BloodPressure Manager · Produced by 나  종  춘
