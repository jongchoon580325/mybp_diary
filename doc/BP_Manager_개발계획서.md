# BloodPressure Manager — 개발 계획서

> **문서 버전**: v1.0  
> **작성일**: 2026-03-28  
> **기준 PRD**: BloodPressure Manager PRD v1.1  
> **저작권**: © 2026 BloodPressure Manager · Produced by 나  종  춘 · All rights reserved

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [디자인 시스템 — 컬러 스키마 & 타이포그래피](#3-디자인-시스템--컬러-스키마--타이포그래피)
4. [App Icon & Favicon (SVG)](#4-app-icon--favicon-svg)
5. [PWA 설정](#5-pwa-설정)
6. [프로젝트 폴더 구조](#6-프로젝트-폴더-구조)
7. [컴포넌트 목록 & 명세](#7-컴포넌트-목록--명세)
8. [화면별 레이아웃 명세](#8-화면별-레이아웃-명세)
   - 8-1. 공통 레이아웃 (Header / Footer / BottomNav)
   - 8-2. 입력 탭 (Input Screen)
   - 8-3. 차트 탭 (Chart Screen)
   - 8-4. 기록 탭 (Record Screen)
9. [로컬 DB 설계 (IndexedDB)](#9-로컬-db-설계-indexeddb)
10. [CSV 백업 / 복구 / 초기화 로직](#10-csv-백업--복구--초기화-로직)
11. [모달 시스템 (현대적 감각)](#11-모달-시스템-현대적-감각)
12. [AI 판정 에이전트 & 하네스](#12-ai-판정-에이전트--하네스)
13. [PDF 리포트 생성](#13-pdf-리포트-생성)
14. [개발 로드맵 & 마일스톤](#14-개발-로드맵--마일스톤)
15. [주니어 개발자 온보딩 가이드](#15-주니어-개발자-온보딩-가이드)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **앱 이름** | BloodPressure Manager (BP Manager) |
| **플랫폼** | 모바일 최적화 웹앱 (PWA) |
| **목적** | 혈압 3회 측정 → 평균 통합 저장, 연령대별 판정, 의사 제출용 PDF 생성 |
| **데이터 저장** | 기기 로컬 (IndexedDB) — 서버 전송 없음 |
| **지원 환경** | Chrome 90+, Safari 14+, Android/iOS 최신 브라우저 |
| **저작권** | © 2026 · Produced by 나  종  춘 |

### 핵심 기능 요약

- ✅ 연령대(6구간)별 차등 혈압 판정 기준
- ✅ 3회 측정 → 평균값 1회 데이터로 통합 저장
- ✅ Claude AI 판정 에이전트 (하네스 3중 검증)
- ✅ 혈압 추이 차트 (기간 필터)
- ✅ 의사 제출용 PDF 리포트 생성
- ✅ IndexedDB 로컬 저장 + CSV 백업/복구/초기화
- ✅ 현대적 감각의 모달 시스템
- ✅ PWA (오프라인 지원, 홈화면 추가)
- ✅ SVG App Icon & Favicon

---

## 2. 기술 스택

```
Frontend     : React 18 + TypeScript 5
Build        : Vite 5
Styling      : Tailwind CSS 3 + CSS Variables
Chart        : Recharts 2
PDF          : jsPDF 2 + html2canvas
DB           : IndexedDB (idb 라이브러리)
AI API       : Anthropic Claude API (claude-sonnet-4-5)
PWA          : vite-plugin-pwa (Workbox)
State        : Zustand (경량 전역 상태)
Router       : React Router v6
Animation    : Framer Motion (모달, 페이지 전환)
Icons        : Lucide React
Test         : Vitest + Testing Library
```

### 패키지 설치 명령

```bash
npm create vite@latest bp-manager -- --template react-ts
cd bp-manager

# 핵심 패키지
npm install zustand react-router-dom framer-motion
npm install recharts jspdf html2canvas
npm install idb lucide-react

# PWA
npm install -D vite-plugin-pwa

# 스타일
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 테스트
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

---

## 3. 디자인 시스템 — 컬러 스키마 & 타이포그래피

### 3-1. 컬러 팔레트

```css
/* src/styles/tokens.css */
:root {
  /* ── Primary: 진한 녹색 계열 (Header / Footer 배경) ── */
  --color-primary-900: #0f2d1a;   /* Header/Footer 배경 */
  --color-primary-800: #1a4228;
  --color-primary-700: #1e5c32;
  --color-primary-600: #236b3a;   /* 버튼 hover */
  --color-primary-500: #2d8b4e;   /* 기본 accent */
  --color-primary-400: #3dab64;
  --color-primary-300: #6dc98a;
  --color-primary-200: #a8e4bc;
  --color-primary-100: #d4f4e0;
  --color-primary-50:  #edfbf3;

  /* ── Neutral ── */
  --color-neutral-900: #111827;
  --color-neutral-800: #1f2937;
  --color-neutral-700: #374151;
  --color-neutral-600: #4b5563;
  --color-neutral-500: #6b7280;
  --color-neutral-400: #9ca3af;
  --color-neutral-300: #d1d5db;
  --color-neutral-200: #e5e7eb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-50:  #f9fafb;

  /* ── Status ── */
  --color-normal:      #16a34a;   /* 정상: 초록 */
  --color-normal-bg:   #f0fdf4;
  --color-caution:     #d97706;   /* 주의: 앰버 */
  --color-caution-bg:  #fffbeb;
  --color-danger:      #dc2626;   /* 고혈압 의심: 빨강 */
  --color-danger-bg:   #fef2f2;

  /* ── Background ── */
  --color-bg-page:     #f8faf9;
  --color-bg-card:     #ffffff;
  --color-bg-surface:  #f0f7f3;

  /* ── Border ── */
  --color-border:      #e2e8e5;
  --color-border-focus:#2d8b4e;

  /* ── Text on dark (Header/Footer) ── */
  --color-on-primary:  #ffffff;
  --color-on-primary-muted: rgba(255,255,255,0.65);

  /* ── Shadow ── */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-modal: 0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10);

  /* ── Border Radius ── */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-header: 0 0 18px 18px;   /* Header 하단 Round Corner */
  --radius-footer: 18px 18px 0 0;   /* Footer 상단 Round Corner */
}
```

### 3-2. Tailwind 커스텀 설정

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#edfbf3', 100: '#d4f4e0', 200: '#a8e4bc',
          300: '#6dc98a', 400: '#3dab64', 500: '#2d8b4e',
          600: '#236b3a', 700: '#1e5c32', 800: '#1a4228', 900: '#0f2d1a',
        },
        normal:  '#16a34a',
        caution: '#d97706',
        danger:  '#dc2626',
      },
      borderRadius: {
        header: '0 0 18px 18px',
        footer: '18px 18px 0 0',
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
};
```

### 3-3. 타이포그래피

| 용도 | 폰트 | 크기 | 굵기 |
|------|------|------|------|
| 앱 타이틀 | DM Mono | 14px | 500 |
| 섹션 레이블 | DM Mono | 10px | 400 |
| 혈압 수치 (대형) | DM Mono | 32–40px | 300 |
| 본문 | Noto Sans KR | 14px | 400 |
| 캡션 / 보조 | Noto Sans KR | 11px | 300 |
| 버튼 | Noto Sans KR | 13px | 500 |

```html
<!-- index.html head에 추가 -->
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Noto+Sans+KR:wght@300;400;500&display=swap" rel="stylesheet">
```

---

## 4. App Icon & Favicon (SVG)

혈압계의 심박 파형 + 방패형 외곽선으로 "혈압 측정 & 보호"를 상징합니다.

```svg
<!-- public/icon.svg  (512×512 기준, favicon에도 동일 사용) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#1e5c32"/>
      <stop offset="100%" stop-color="#0f2d1a"/>
    </linearGradient>
  </defs>

  <!-- 방패형 배경 -->
  <path d="M256 24 L460 100 L460 280 Q460 420 256 490 Q52 420 52 280 L52 100 Z"
        fill="url(#bg-grad)" />

  <!-- 심박 파형 (혈압 의미) -->
  <polyline
    points="90,256 155,256 185,190 215,320 245,200 275,290 305,240 340,256 420,256"
    fill="none" stroke="#ffffff" stroke-width="18"
    stroke-linecap="round" stroke-linejoin="round"/>

  <!-- 상단 소형 하트 -->
  <path d="M256 148 C240 130 212 130 212 155 C212 178 256 200 256 200
           C256 200 300 178 300 155 C300 130 272 130 256 148Z"
        fill="rgba(255,255,255,0.25)"/>
</svg>
```

### Favicon 설정

```html
<!-- index.html -->
<link rel="icon" type="image/svg+xml" href="/icon.svg">
<link rel="apple-touch-icon" href="/icon-192.png">
```

> **참고**: 배포 전 `icon.svg`를 기반으로 `icon-192.png`, `icon-512.png`를 생성합니다.  
> 방법: `npx sharp-cli -i public/icon.svg -o public/icon-192.png resize 192 192`

---

## 5. PWA 설정

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'BloodPressure Manager',
        short_name: 'BP Manager',
        description: '연령대별 혈압 관리 앱 · Produced by 나 종 춘',
        theme_color: '#0f2d1a',       // 진한 녹색
        background_color: '#f8faf9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' },
          },
          {
            urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
            handler: 'NetworkOnly',   // AI API는 캐시 금지
          },
        ],
      },
    }),
  ],
});
```

---

## 6. 프로젝트 폴더 구조

```
bp-manager/
├── public/
│   ├── icon.svg              # SVG 아이콘 (혈압 심볼)
│   ├── icon-192.png
│   ├── icon-512.png
│   └── manifest.json         # (vite-plugin-pwa 자동 생성)
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── styles/
│   │   ├── tokens.css        # CSS 변수 (컬러, 반경, 그림자)
│   │   └── global.css
│   │
│   ├── components/           # 재사용 UI 컴포넌트
│   │   ├── layout/
│   │   │   ├── Header.tsx        # 진한 녹색, Round Corner 하단
│   │   │   ├── Footer.tsx        # 진한 녹색, Round Corner 상단, 저작권
│   │   │   └── BottomNav.tsx     # 입력/차트/기록 탭
│   │   │
│   │   ├── modal/
│   │   │   ├── Modal.tsx         # 기본 모달 래퍼 (Framer Motion)
│   │   │   ├── ConfirmModal.tsx  # 확인/취소
│   │   │   ├── AlertModal.tsx    # 단순 알림
│   │   │   └── ToastNotification.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── StatusBadge.tsx   # 정상/주의/고혈압의심
│   │   │   ├── ToggleGroup.tsx   # 아침/저녁, 좌팔/우팔 등
│   │   │   ├── StepIndicator.tsx # 1→2→3→평균 진행 표시
│   │   │   ├── AgeChipGroup.tsx  # 연령대 선택
│   │   │   ├── BpInputField.tsx  # SYS/DIA/PUL 입력 박스
│   │   │   ├── Skeleton.tsx      # 로딩 스켈레톤
│   │   │   └── Card.tsx
│   │   │
│   │   └── chart/
│   │       ├── BpLineChart.tsx   # 혈압 추이 꺾은선 차트
│   │       ├── StatSummaryCard.tsx
│   │       └── ReferenceLines.tsx # 연령대별 기준선
│   │
│   ├── screens/              # 화면 단위 컴포넌트
│   │   ├── InputScreen.tsx   # 입력 탭
│   │   ├── ChartScreen.tsx   # 차트 탭
│   │   └── RecordScreen.tsx  # 기록 탭
│   │
│   ├── hooks/
│   │   ├── useMeasurement.ts  # 3회 측정 상태 관리
│   │   ├── useAgeBPStandard.ts # 연령대별 기준값
│   │   ├── useDB.ts           # IndexedDB CRUD
│   │   └── useModal.ts        # 모달 제어
│   │
│   ├── store/
│   │   ├── sessionStore.ts    # 현재 측정 세션 (Zustand)
│   │   ├── settingsStore.ts   # 앱 설정 (연령대, 프로필)
│   │   └── recordStore.ts     # 기록 목록 캐시
│   │
│   ├── services/
│   │   ├── db.ts              # IndexedDB 초기화 (idb)
│   │   ├── aiJudge.ts         # Claude API 호출 + 하네스
│   │   ├── csvExport.ts       # CSV 내보내기
│   │   ├── csvImport.ts       # CSV 복구
│   │   └── pdfReport.ts       # PDF 생성
│   │
│   ├── constants/
│   │   ├── ageBPStandards.ts  # 연령대별 혈압 기준값 테이블
│   │   └── appConfig.ts
│   │
│   └── types/
│       └── index.ts           # TypeScript 타입 정의
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 7. 컴포넌트 목록 & 명세

### 7-1. Header

```tsx
// src/components/layout/Header.tsx
/**
 * 스펙:
 * - 배경: var(--color-primary-900) = #0f2d1a (진한 녹색)
 * - 하단 Round Corner: border-radius 0 0 18px 18px
 * - 좌측: SVG 로고 마크 + 앱 타이틀 + 버전
 * - 우측: 알림 아이콘(뱃지) + 설정 아이콘
 * - position: sticky top-0, z-index: 50
 * - 높이: 56px
 */
```

| Prop | 타입 | 설명 |
|------|------|------|
| `onNotificationClick` | `() => void` | 알림 버튼 클릭 |
| `onSettingsClick` | `() => void` | 설정 버튼 클릭 |
| `hasNotification` | `boolean` | 알림 뱃지 표시 여부 |

---

### 7-2. Footer

```tsx
// src/components/layout/Footer.tsx
/**
 * 스펙:
 * - 배경: var(--color-primary-900) = #0f2d1a (진한 녹색)
 * - 상단 Round Corner: border-radius 18px 18px 0 0
 * - 텍스트 중앙 정렬
 * - 저작권: © 2026 BloodPressure Manager · Produced by 나  종  춘
 * - 면책: 판정 기준 참조 출처 명시
 * - 높이: 52px
 */
```

---

### 7-3. Modal 시스템 (현대적 감각)

> **원칙**: 브라우저 기본 `alert()`, `confirm()`, `prompt()` 사용 금지.  
> 모든 알림/확인은 Framer Motion 기반 모달로 처리.

```tsx
// src/components/modal/Modal.tsx
/**
 * 현대적 감각의 모달 특징:
 * - backdrop: blur(8px) + rgba(0,0,0,0.45) 반투명
 * - 카드: white, border-radius 20px, shadow-modal
 * - 진입 애니메이션: y: 40→0, opacity: 0→1, scale: 0.95→1 (0.28s spring)
 * - 퇴장 애니메이션: y: 0→20, opacity: 1→0 (0.18s)
 * - 외부 클릭 닫힘 지원
 * - ESC 키 닫힘 지원
 * - 접근성: role="dialog", aria-modal, focus trap
 */

// 사용 예시
const { openModal, closeModal } = useModal();

// 확인 모달
openModal('confirm', {
  title: '측정 초기화',
  message: '현재 진행 중인 3회 측정을 초기화할까요?',
  confirmLabel: '초기화',
  cancelLabel: '취소',
  variant: 'danger',   // 'default' | 'danger' | 'success'
  onConfirm: () => resetSession(),
});

// 알림 모달
openModal('alert', {
  title: '저장 완료',
  message: '혈압 측정이 저장되었습니다. 정상 범위입니다.',
  variant: 'success',
  icon: '✅',
});

// 토스트 (상단 슬라이드)
openModal('toast', {
  message: '입력값 범위 초과 (SYS: 60~250)',
  variant: 'danger',
  duration: 3000,
});
```

---

### 7-4. BpInputField

```tsx
// src/components/ui/BpInputField.tsx
interface BpInputFieldProps {
  label: string;          // 'SYS 수축기' | 'DIA 이완기' | 'PUL 맥박'
  unit: string;           // 'mmHg' | 'bpm'
  value: number | null;
  status: 'empty' | 'filled' | 'error';
  errorMessage?: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
}
// - Interactive: 클릭 시 숫자 키패드(inputMode="numeric") 포커스
// - filled 상태: 진한 녹색 border
// - error 상태: 빨간 border + 하단 오류 메시지
// - 애니메이션: 값 변경 시 숫자 flip 효과 (Framer Motion)
```

---

### 7-5. StepIndicator

```tsx
// 3회 측정 진행 상태 표시
// step: 1 | 2 | 3 | 'avg' | 'done'
// - done(완료): 진한 녹색 채움 원
// - current(진행중): 진한 녹색 테두리 + 맥동 애니메이션
// - pending(대기): 회색 테두리
```

---

### 7-6. AgeChipGroup

```tsx
// 연령대 6구간 토글 칩
// selected 상태: 진한 녹색 배경 + 흰 텍스트
// 미선택 시 저장 버튼 disabled + 경고 표시
// 최초 1회 선택 → settingsStore에 저장 (매번 입력 불필요)
```

---

## 8. 화면별 레이아웃 명세

### 8-1. 공통 레이아웃

```
┌─────────────────────────────────────┐
│  HEADER (56px)                       │
│  진한 녹색 배경 / 하단 Round Corner   │
│  [🩺 BP Manager v1.1]  [🔔] [⚙️]    │
└──────────────┬──────────────────────┘
               │ (Round Corner 하단)
               ▼
┌─────────────────────────────────────┐
│                                     │
│  MAIN CONTENT (스크롤 가능)          │
│  padding: 16px                      │
│  background: #f8faf9                │
│                                     │
└─────────────────────────────────────┘
               ▼
┌──────────────┴──────────────────────┐
│  (Round Corner 상단)                 │
│  FOOTER (52px)                       │
│  진한 녹색 배경 / 상단 Round Corner   │
│  © 2026 · Produced by 나  종  춘     │
│  (중앙 정렬)                         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  BOTTOM NAV (60px)                  │
│  [✏️ 입력] [📈 차트] [📋 기록]      │
└─────────────────────────────────────┘
```

---

### 8-2. 입력 탭 (InputScreen)

```
┌─────────────────────────────────────┐
│ 날짜 바                              │
│ 2026.03.28 토  ·  아침  │ ● 측정 대기│
├─────────────────────────────────────┤
│ 연령대 선택 (필수) ─────────────────  │
│ [20대][30대][40대][50대][●60대][70대+]│
├─────────────────────────────────────┤
│ 측정 회차 진행 표시                   │
│  ①완료 ——— ②진행중 ——— ③대기 ——— 평균│
├─────────────────────────────────────┤
│ 혈압 입력 카드 (white, 그림자)        │
│  [SYS 128] [DIA ---] [PUL ---]      │
│  ─────────────────────────────────  │
│  시간대: [●아침][저녁]               │
│  측정 팔: [●좌팔][우팔]             │
│  측정 자세: [●앉은 자세][누운 자세]  │
│  ─────────────────────────────────  │
│  📝 메모 (선택) ─────────── 0/200   │
│  ─────────────────────────────────  │
│  [🔒 3회 측정 완료 후 저장 가능]     │  ← 비활성
├─────────────────────────────────────┤
│ ── 최근 측정 ────────────────────── │
│  03.27 금  134/85·72  [정상] 60대  │
│  03.26 목  141/88·78  [주의] 60대  │
│  03.25 수  148/93·84  [⚠고혈압의심]│
├─────────────────────────────────────┤
│ ⚕ 면책 배너                         │
│  이 결과는 참고용이며 의료 진단이    │
│  아닙니다. 담당 의사와 상담하세요.   │
└─────────────────────────────────────┘
```

**Interactive 요소:**
- 연령대 칩 클릭 → 선택/해제 애니메이션 (scale 0.95 → 1)
- BpInputField 클릭 → 포커스 + border 색상 전환
- 3회 완료 시 → 저장 버튼 활성화 애니메이션 (진한 녹색으로 전환)
- 저장 완료 → 성공 모달 → 결과 카드 슬라이드 인

---

### 8-3. 차트 탭 (ChartScreen)

```
┌─────────────────────────────────────┐
│ 기간 필터 탭                         │
│ [1주][2주][●1개월][3개월][전체]      │
├─────────────────────────────────────┤
│ 통계 요약 카드 (2×2 그리드)          │
│  평균 수축기  평균 이완기             │
│    128       82                     │
│  최고 수축기  측정 횟수              │
│    148       24회                   │
├─────────────────────────────────────┤
│ 혈압 추이 차트 (Recharts)            │
│  ┌────────────────────────────────┐ │
│  │ 수축기 ─── 이완기 ···          │ │
│  │ ──────── 기준선 (연령대)       │ │
│  │          (녹색: 정상 범위)     │ │
│  └────────────────────────────────┘ │
│  x축: 날짜  y축: mmHg              │
├─────────────────────────────────────┤
│ 맥박 추이 차트 (소형)                │
├─────────────────────────────────────┤
│ PDF 리포트 출력                      │
│  기간: [2026.03.01] ~ [2026.03.28]  │
│  [📄 PDF 생성 및 저장]              │
└─────────────────────────────────────┘
```

**Interactive 요소:**
- 기간 필터 탭 전환 → 차트 데이터 애니메이션 갱신
- 차트 포인트 터치/클릭 → 툴팁 (날짜, 수치, 판정 표시)
- 연령대별 기준선 토글 버튼
- PDF 생성 버튼 → 로딩 모달 → 완료 알림 모달

---

### 8-4. 기록 탭 (RecordScreen)

```
┌─────────────────────────────────────┐
│ 검색 & 필터 바                       │
│  🔍 날짜 검색  │ 판정: [전체▼]       │
├─────────────────────────────────────┤
│ 기록 목록 (날짜 역순)                │
│ ┌──────────────────────────────┐   │
│ │ 03.28 토 · 아침 · 좌팔       │   │
│ │ 126 / 80  ·  73 bpm          │   │
│ │ [정상] 60대 기준  ↗ 상세보기  │   │
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 03.27 금 · 아침 · 좌팔       │   │
│ │ 134 / 85  ·  72 bpm          │   │
│ │ [정상] 60대 기준  ↗ 상세보기  │   │
│ └──────────────────────────────┘   │
│  ... (무한 스크롤)                  │
├─────────────────────────────────────┤
│ 데이터 관리                          │
│  [📤 CSV 내보내기]  [📥 CSV 복구]  │
│  [🗑️ 전체 초기화]                  │
└─────────────────────────────────────┘
```

**상세 보기 모달:**
```
┌─────────────────────────────────────┐
│ 03.28 (토)  아침  좌팔  앉은 자세   │
├─────────────────────────────────────┤
│  1회차: 128 / 82 · 74              │
│  2회차: 124 / 79 · 72              │
│  3회차: 126 / 80 · 73              │
│  ─────────────────────────────────  │
│  평균:  126 / 80 · 73  [정상]      │
│  적용 기준: 60대 (< 135/85)         │
├─────────────────────────────────────┤
│  AI 조언: 혈압이 안정적입니다. 현재  │
│  생활 습관을 유지하세요.             │
├─────────────────────────────────────┤
│  메모: 오늘 아침 약 복용 완료        │
├─────────────────────────────────────┤
│          [✏️ 수정] [🗑️ 삭제]       │
└─────────────────────────────────────┘
```

---

## 9. 로컬 DB 설계 (IndexedDB)

### DB 스키마

```ts
// src/services/db.ts
import { openDB, DBSchema } from 'idb';

interface BpDB extends DBSchema {
  sessions: {
    key: string;        // session_id (UUID)
    value: MeasurementSession;
    indexes: {
      'by-date':      Date;
      'by-age-group': AgeGroup;
      'by-status':    BpStatus;
    };
  };
  settings: {
    key: string;        // 설정 키
    value: unknown;
  };
}

export const initDB = () =>
  openDB<BpDB>('bp-manager-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('sessions', { keyPath: 'session_id' });
      store.createIndex('by-date',      'measured_at');
      store.createIndex('by-age-group', 'age_group');
      store.createIndex('by-status',    'ai_status');
      db.createObjectStore('settings');
    },
  });
```

### CRUD 함수

```ts
// useDB.ts 내 주요 함수

// 저장
async saveSession(session: MeasurementSession): Promise<void>

// 전체 조회 (날짜 역순)
async getAllSessions(): Promise<MeasurementSession[]>

// 기간 조회
async getSessionsByRange(from: Date, to: Date): Promise<MeasurementSession[]>

// 수정
async updateSession(id: string, patch: Partial<MeasurementSession>): Promise<void>

// 삭제 (단건)
async deleteSession(id: string): Promise<void>

// 전체 초기화
async clearAllSessions(): Promise<void>
```

---

## 10. CSV 백업 / 복구 / 초기화 로직

### CSV 내보내기

```ts
// src/services/csvExport.ts
export function exportToCSV(sessions: MeasurementSession[]): void {
  const headers = [
    'session_id','measured_at','age_group','time_slot','arm','posture',
    'r1_sys','r1_dia','r1_pul',
    'r2_sys','r2_dia','r2_pul',
    'r3_sys','r3_dia','r3_pul',
    'avg_sys','avg_dia','avg_pul',
    'ai_status','memo'
  ];

  const rows = sessions.map(s => [
    s.session_id,
    s.measured_at.toISOString(),
    s.age_group,
    s.time_slot, s.arm, s.posture,
    s.readings[0].sys, s.readings[0].dia, s.readings[0].pul,
    s.readings[1].sys, s.readings[1].dia, s.readings[1].pul,
    s.readings[2].sys, s.readings[2].dia, s.readings[2].pul,
    s.avg_sys, s.avg_dia, s.avg_pul,
    s.ai_status,
    s.memo ?? ''
  ]);

  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `bp-backup-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### CSV 복구

```ts
// src/services/csvImport.ts
export async function importFromCSV(file: File): Promise<MeasurementSession[]> {
  const text = await file.text();
  const lines = text.trim().split('\n').slice(1);  // 헤더 제거

  return lines.map(line => {
    const cols = line.split(',').map(c => c.replace(/^"|"$/g,'').replace(/""/g,'"'));
    // cols 순서에 맞게 MeasurementSession 객체 재구성
    // 하네스: 필수 필드 누락/범위 초과 시 해당 행 skip + 경고 모달
    return parseCsvRow(cols);
  }).filter(Boolean) as MeasurementSession[];
}
```

### 전체 초기화

```ts
// 2단계 확인 모달 적용 (실수 방지)
// 1단계: "모든 기록이 삭제됩니다. 계속할까요?"
// 2단계: "되돌릴 수 없습니다. 정말 삭제합니까?" (빨간 버튼)
// 초기화 전 자동 CSV 백업 제안
```

---

## 11. 모달 시스템 (현대적 감각)

### 모달 애니메이션 스펙

```ts
// Framer Motion variants
const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 28 }
  },
  exit:    { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.18 } },
};
```

### 모달 스타일 토큰

```css
.modal-backdrop {
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
}
.modal-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: var(--shadow-modal);
  max-width: 340px;
  width: calc(100% - 48px);
  padding: 28px 24px 20px;
}
.modal-title     { font-size: 16px; font-weight: 500; color: var(--color-neutral-900); }
.modal-message   { font-size: 14px; color: var(--color-neutral-600); line-height: 1.6; }
.modal-btn-primary { background: var(--color-primary-900); color: white; border-radius: 10px; height: 44px; }
.modal-btn-danger  { background: #dc2626; color: white; }
.modal-btn-cancel  { background: var(--color-neutral-100); color: var(--color-neutral-700); }
```

---

## 12. AI 판정 에이전트 & 하네스

### 연령대별 기준값 테이블

```ts
// src/constants/ageBPStandards.ts
export const AGE_BP_STANDARDS: Record<AgeGroup, BPStandard> = {
  '20대': { normalSys: 120, normalDia: 80, cautionSys: 125, cautionDia: 84, version: 'v1.1' },
  '30대': { normalSys: 122, normalDia: 80, cautionSys: 130, cautionDia: 85, version: 'v1.1' },
  '40대': { normalSys: 125, normalDia: 82, cautionSys: 135, cautionDia: 87, version: 'v1.1' },
  '50대': { normalSys: 130, normalDia: 84, cautionSys: 140, cautionDia: 89, version: 'v1.1' },
  '60대': { normalSys: 135, normalDia: 85, cautionSys: 145, cautionDia: 90, version: 'v1.1' },
  '70대+':{ normalSys: 140, normalDia: 85, cautionSys: 150, cautionDia: 90, version: 'v1.1' },
};
```

### 3중 하네스 검증 흐름

```
입력값  →  [하네스①-A] 연령대 선택 여부
        →  [하네스①-B] 수치 범위 (SYS 60~250, DIA 40~150, PUL 30~200)
        →  [하네스①-C] SYS > DIA 논리 검증
        →  [하네스①-D] 회차 간 편차 ±20mmHg 경고
        →  AI 에이전트 호출 (age_group + avg 전송)
        →  [하네스②]   출력 status 허용값 확인
        →  [하네스③]   age_adjusted, disclaimer 필드 존재 확인
        →  저장
```

---

## 13. PDF 리포트 생성

```ts
// src/services/pdfReport.ts
// 구성: 표지 → 통계 요약 → 혈압 추이 차트(html2canvas) → 데이터 테이블 → 면책 조항
// 기간: 사용자가 기록 탭에서 선택한 임의 기간
// 하단 고정 문구: "본 리포트는 참고용이며 의료 진단이 아닙니다."
// 저작권: "© 2026 BloodPressure Manager · Produced by 나  종  춘"
```

---

## 14. 개발 로드맵 & 마일스톤

| Phase | 기간 | 작업 범위 |
|-------|------|-----------|
| **Phase 1** | 1~2주차 | 프로젝트 셋업, SVG 아이콘, 공통 레이아웃(Header/Footer), BottomNav, 디자인 토큰, 연령대 UI, 설정 저장 |
| **Phase 2** | 3~4주차 | 입력 탭 전체 구현, 3회 측정 상태관리, 하네스 ①, IndexedDB CRUD, 모달 시스템 |
| **Phase 3** | 5~6주차 | AI 판정 에이전트 + 하네스 ②③, 저장 완료 플로우, 최근 기록 미니 목록 |
| **Phase 4** | 7~8주차 | 차트 탭 (Recharts), 기간 필터, 통계 요약, 기준선 오버레이 |
| **Phase 5** | 9~10주차 | 기록 탭, 상세 모달, CSV 백업/복구/초기화, PDF 리포트 생성 |
| **Phase 6** | 11~12주차 | PWA 설정, 오프라인 지원, 전체 하네스 회귀 테스트(12건), UX 고령자 검증, 배포 |

---

## 15. 주니어 개발자 온보딩 가이드

### 개발 시작 순서

```
① 저장소 클론 후 npm install
② .env 파일 생성 (VITE_ANTHROPIC_API_KEY=your_key)
③ npm run dev → http://localhost:5173 확인
④ src/styles/tokens.css 에서 컬러 변수 숙지
⑤ src/constants/ageBPStandards.ts 에서 판정 기준 이해
⑥ src/types/index.ts 에서 MeasurementSession 타입 이해
⑦ Phase 1 이슈부터 순서대로 작업
```

### 코드 작성 규칙

| 항목 | 규칙 |
|------|------|
| 컴포넌트 | PascalCase, 파일 1개 = 컴포넌트 1개 |
| 훅 | `use` 접두어, 비즈니스 로직 분리 |
| 상수 | UPPER_SNAKE_CASE |
| CSS | Tailwind 클래스 우선, 커스텀 필요 시 CSS Variable 사용 |
| 모달 | 브라우저 기본 alert/confirm 절대 금지 → useModal 사용 |
| 에러 처리 | try/catch 필수, 에러 모달로 사용자에게 표시 |
| 타입 | `any` 사용 금지, 모든 타입 `src/types/index.ts`에 정의 |

### 자주 쓰는 패턴

```tsx
// 모달 사용
const { openModal } = useModal();
openModal('confirm', { title: '...', onConfirm: () => ... });

// DB 저장
const { saveSession } = useDB();
await saveSession(session);

// 연령대 기준값 조회
const standard = AGE_BP_STANDARDS[ageGroup];
const isNormal = avg_sys < standard.normalSys && avg_dia < standard.normalDia;
```

---

> **문서 끝**  
> 업데이트 이력: v1.0 최초 작성 (2026-03-28)  
> 다음 버전 예정: 기능 추가 시 버전 업  
> © 2026 BloodPressure Manager · Produced by 나  종  춘
