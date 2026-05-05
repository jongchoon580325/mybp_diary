# BS Manager — 혈당 기능 구현 TODO

> **작성일:** 2026년 3월 30일
> **기반 문서:** 혈당관리_이식_계획서.md
> **범례:** `[ ]` 미완료 · `[x]` 완료 · `[~]` 진행 중 · `[-]` 보류

---

## Phase 1 — 타입 & 데이터 레이어

> 목표: 화면 없이 데이터 읽기/쓰기가 작동하는 상태

### 1-1. 타입 정의
- [ ] `src/types/index.ts` — `MealTag`, `DiabetesType`, `GlucoseStatus` 타입 추가
- [ ] `src/types/index.ts` — `GlucoseRecord` 인터페이스 추가
- [ ] `src/types/index.ts` — `GlucoseTarget` 인터페이스 추가
- [ ] `src/types/index.ts` — `GlucoseValidationError` 인터페이스 추가

### 1-2. IndexedDB 스키마 확장
- [ ] `src/services/db.ts` — DB 버전 1 → 2 업그레이드
- [ ] `src/services/db.ts` — `glucose` 스토어 추가 (`record_id` keyPath)
- [ ] `src/services/db.ts` — 인덱스 추가: `by-date`, `by-meal-tag`, `by-status`
- [ ] 기존 혈압 데이터 유지 확인 (oldVersion < 2 조건 검증)

### 1-3. Repository 인터페이스 & 구현
- [ ] `src/firebase/IGlucoseRepository.ts` — 인터페이스 작성 (IBpRepository 패턴 복제)
- [ ] `src/firebase/glucoseRepository.ts` — `createFirestoreGlucoseRepository(uid)` 구현
  - [ ] `saveRecord()` — Firestore `users/{uid}/glucose` 저장
  - [ ] `getAllRecords()` — `created_at_ts` 역순 정렬
  - [ ] `getRecordsByRange()` — Timestamp 범위 쿼리
  - [ ] `updateRecord()` — note 필드만 수정
  - [ ] `deleteRecord()` — 단건 삭제
  - [ ] `clearAllRecords()` — 배치 삭제 (499건 단위)
  - [ ] `getRecentRecords(n)` — 최근 N건
- [ ] `src/firebase/glucoseRepository.ts` — `createIndexedDBGlucoseRepository()` 구현 (오프라인 폴백)

### 1-4. 훅
- [ ] `src/hooks/useGlucoseDB.ts` — `useGlucoseDB()` 훅 작성 (useDB.ts 패턴 복제)
  - Google 로그인 → Firestore
  - 게스트 → IndexedDB

### 1-5. 유효성 검사 & 판정 로직
- [ ] `src/services/glucoseValidation.ts` — `validateGlucose(level)` 작성
  - 유효 범위: 20 ~ 600 mg/dL
- [ ] `src/services/glucoseValidation.ts` — `classifyGlucose(level, tag, target)` 작성
  - 공복: < 70 저혈당 / < 100 정상 / 100~125 주의 / ≥ 126 고혈당
  - 식후 2h: < 70 저혈당 / < 140 정상 / 140~199 주의 / ≥ 200 고혈당
  - 식전/식후 1h/취침 전: 목표 범위(target) 기반 판정

### 1-6. 혈당 기준 상수
- [ ] `src/constants/glucoseStandards.ts` — 식사 태그별 기준값 정의
  - ADA 2025 기준 참조

### 1-7. Firebase Firestore 보안 규칙
- [ ] Firebase 콘솔 → Firestore → 규칙에 glucose 컬렉션 추가
  ```
  match /users/{uid}/glucose/{recordId} {
    allow read, write: if request.auth != null && request.auth.uid == uid;
  }
  ```

---

## Phase 2 — 핵심 입력 화면

> 목표: 혈당 수치 입력 → 저장 → 결과 모달 표시까지 작동

### 2-1. 디자인 토큰
- [ ] `src/styles/tokens.css` — 혈당 Primary 색상 추가 (Teal Blue 계열)
  - `--color-glucose-900` ~ `--color-glucose-50`
- [ ] `src/styles/tokens.css` — 혈당 상태 색상 추가
  - `--color-gl-normal`, `--color-gl-caution`, `--color-gl-high`, `--color-gl-low`
  - 저혈당: 보라(#8b5cf6) — 고혈당 빨강과 시각 구분

### 2-2. Zustand 스토어
- [ ] `src/store/glucoseInputStore.ts` — 입력 임시 상태 스토어 작성
  - 상태: `glucoseLevel`, `mealTag`, `insulin`, `carbs`, `exercise`, `note`
  - 액션: `set*`, `reset`
- [ ] `src/store/settingsStore.ts` — `glucoseTarget` 필드 추가
  - 기본값: `{ target_min: 70, target_max: 140, diabetes_type: '없음' }`

### 2-3. 컴포넌트
- [ ] `src/components/MealTagGroup.tsx` — 식사 태그 선택 (ToggleGroup 구조 복제)
  - 5개 옵션: 공복 / 식전 / 식후 1h / 식후 2h / 취침 전
- [ ] `src/components/GlucoseResultModal.tsx` — 저장 완료 결과 모달 (AiResultModal 구조 복제)
  - 혈당 상태별 아이콘/색상
  - 생활습관 조언 표시
  - rule-based 판정 (AI 미사용)

### 2-4. 화면
- [ ] `src/screens/GlucoseInputScreen.tsx` — 혈당 입력 화면
  - 날짜/시간 표시 (혈압 InputScreen 패턴)
  - 혈당 수치 입력 필드 (mg/dL, BpInputField 재사용)
  - MealTagGroup 연결
  - 선택 입력 섹션: 인슐린(단위), 탄수화물(g), 운동, 메모
  - 저장 버튼 → `validateGlucose()` → `classifyGlucose()` → `saveRecord()`
  - 저장 완료 → `GlucoseResultModal` 표시
  - 하단 최근 3건 요약

### 2-5. 라우팅 & 네비게이션
- [ ] `src/App.tsx` — `/gl`, `/gl/records`, `/gl/chart` 라우트 추가
- [ ] `src/App.tsx` — `activeDomain: 'bp' | 'glucose'` 상태 추가
- [ ] `src/components/Header.tsx` — 도메인 세그먼트 컨트롤 추가
  - `[ 혈압 | 혈당 ]` 토글 버튼
  - 혈당 선택 시 헤더 배경색 → Teal Blue(`--color-glucose-900`)
- [ ] `src/components/BottomNav.tsx` — 도메인별 탭 세트 전환
  - 혈압 탭: 입력(/) · 기록(/records) · 차트(/chart)
  - 혈당 탭: 입력(/gl) · 기록(/gl/records) · 차트(/gl/chart)

---

## Phase 3 — 기록 & 차트 화면

> 목표: 저장된 혈당 데이터 조회·시각화·내보내기

### 3-1. 컴포넌트
- [ ] `src/components/GlucoseLineChart.tsx` — 혈당 추이 LineChart (BpLineChart 구조 복제)
  - 단일 라인 (glucose_level)
  - `ReferenceArea`로 목표 범위(target_min ~ target_max) 표시
  - 식사 태그별 점 색상 구분 (CustomDot)
- [ ] `src/components/GlucoseStatCard.tsx` — 통계 카드 (StatSummaryCard 구조 복제)
  - 평균 / 최고 / 최저 / TIR(목표 범위 내 비율 %)
- [ ] `src/components/DiabetesTypeChip.tsx` — 당뇨 유형 선택 (AgeChipGroup 구조 복제)
  - 4개 옵션: 1형 / 2형 / 임신성 / 없음

### 3-2. 화면
- [ ] `src/screens/GlucoseRecordScreen.tsx` — 혈당 기록 목록 (RecordScreen 구조 복제)
  - 상태 필터: 전체 / 정상 / 주의 / 고혈당 / 저혈당
  - 월별 그룹핑
  - 기록 카드: 날짜, 수치(mg/dL), 식사 태그, 상태 배지
  - 메모 수정 / 단건 삭제 / 전체 초기화
  - SessionDetailModal 연결 (혈당 상세)
- [ ] `src/screens/GlucoseChartScreen.tsx` — 혈당 차트 (ChartScreen 구조 복제)
  - 기간 필터: 1W / 2W / 1M / 3M / 전체
  - GlucoseLineChart + GlucoseStatCard
  - 목표 범위 참조선 토글
  - PDF 리포트 생성 버튼

### 3-3. CSV 서비스
- [ ] `src/services/glucoseCsvService.ts` — `recordsToCsv()` 작성
  - 헤더: `record_id, measured_at, glucose_level, meal_tag, insulin, carbs, exercise, note, status`
  - UTF-8 BOM 포함
- [ ] `src/services/glucoseCsvService.ts` — `csvToRecords()` 작성
  - 중복 검사 (`record_id` 기준)
  - 필수 컬럼 누락 시 오류 처리

---

## Phase 4 — 설정 확장 & 마무리

> 목표: 설정 통합 완료, PDF 리포트, 최종 배포

### 4-1. SettingsDrawer 확장
- [ ] `src/components/SettingsDrawer.tsx` — 혈당 목표 설정 섹션 추가
  - 목표 최솟값 / 최댓값 입력 (기본 70 / 140 mg/dL)
  - DiabetesTypeChip 연결
  - 저장 → `settingsStore.setGlucoseTarget()`
- [ ] `src/components/SettingsDrawer.tsx` — 데이터 관리 섹션에 혈당 CSV 백업/복구 추가
- [ ] `src/components/SettingsDrawer.tsx` — 혈당 전체 초기화 버튼 추가 (danger-confirm)

### 4-2. PDF 리포트
- [ ] `src/services/glucosePdfReport.ts` — `generateGlucosePdfReport()` 작성 (pdfReport.ts 구조 복제)
  - 기간 요약: 평균 / 최고 / 최저 / TIR
  - 혈당 추이 차트 이미지 삽입 (html2canvas)
  - 상세 기록 테이블
  - 면책 조항

### 4-3. 빌드 & 검증
- [ ] `npm run build` — TypeScript 오류 없음 확인
- [ ] `npm test` — 기존 혈압 테스트 전체 통과 확인
- [ ] 혈당 주요 로직 단위 테스트 작성
  - [ ] `glucoseValidation.test.ts` — `validateGlucose()` + `classifyGlucose()`
  - [ ] `glucoseCsvService.test.ts` — CSV 파싱/직렬화

### 4-4. Firebase 최종 배포
- [ ] Firebase Hosting 배포: `firebase deploy --only hosting --project todaybp`
- [ ] 배포 후 Google 로그인 → 혈당 저장 → Firestore 콘솔 확인
- [ ] 게스트 → 혈당 저장 → IndexedDB 저장 확인

---

## 파일별 작업 체크리스트

### 신규 생성 (18개)

| 파일 | Phase | 상태 |
|------|-------|------|
| `src/constants/glucoseStandards.ts` | 1 | `[ ]` |
| `src/firebase/IGlucoseRepository.ts` | 1 | `[ ]` |
| `src/firebase/glucoseRepository.ts` | 1 | `[ ]` |
| `src/hooks/useGlucoseDB.ts` | 1 | `[ ]` |
| `src/services/glucoseValidation.ts` | 1 | `[ ]` |
| `src/store/glucoseInputStore.ts` | 2 | `[ ]` |
| `src/components/MealTagGroup.tsx` | 2 | `[ ]` |
| `src/components/GlucoseResultModal.tsx` | 2 | `[ ]` |
| `src/screens/GlucoseInputScreen.tsx` | 2 | `[ ]` |
| `src/components/GlucoseLineChart.tsx` | 3 | `[ ]` |
| `src/components/GlucoseStatCard.tsx` | 3 | `[ ]` |
| `src/components/DiabetesTypeChip.tsx` | 3 | `[ ]` |
| `src/screens/GlucoseRecordScreen.tsx` | 3 | `[ ]` |
| `src/screens/GlucoseChartScreen.tsx` | 3 | `[ ]` |
| `src/services/glucoseCsvService.ts` | 3 | `[ ]` |
| `src/services/glucosePdfReport.ts` | 4 | `[ ]` |
| `src/test/glucoseValidation.test.ts` | 4 | `[ ]` |
| `src/test/glucoseCsvService.test.ts` | 4 | `[ ]` |

### 수정 필요 (8개)

| 파일 | 변경 내용 | Phase | 상태 |
|------|---------|-------|------|
| `src/types/index.ts` | 혈당 타입 4종 추가 | 1 | `[ ]` |
| `src/services/db.ts` | glucose 스토어 추가 (DB v2) | 1 | `[ ]` |
| `src/store/settingsStore.ts` | glucoseTarget 필드 추가 | 2 | `[ ]` |
| `src/styles/tokens.css` | 혈당 색상 토큰 추가 | 2 | `[ ]` |
| `src/components/Header.tsx` | 도메인 세그먼트 컨트롤 | 2 | `[ ]` |
| `src/components/BottomNav.tsx` | 도메인별 탭 전환 | 2 | `[ ]` |
| `src/App.tsx` | 혈당 라우트 + 도메인 상태 | 2 | `[ ]` |
| `src/components/SettingsDrawer.tsx` | 혈당 설정 섹션 추가 | 4 | `[ ]` |

---

## 진행 현황

| Phase | 항목 수 | 완료 | 진행률 |
|-------|--------|------|--------|
| Phase 1 — 데이터 레이어 | 18 | 0 | 0% |
| Phase 2 — 입력 화면 | 15 | 0 | 0% |
| Phase 3 — 기록/차트 | 12 | 0 | 0% |
| Phase 4 — 마무리/배포 | 9 | 0 | 0% |
| **전체** | **54** | **0** | **0%** |

---

*완료 항목은 `[ ]` → `[x]` 로 변경. 구현 시작 전 Phase 1부터 순서대로 진행할 것.*
