# React → Vue 마이그레이션 설계서 (hayoon frontend)

> 대상: `front/` (React 18 + Vite 5) → **Vue 3.5 + Vite 5 유지**
> 백엔드(`back/`)·빌드/배포 인프라(Dockerfile·nginx)는 **변경 없음**
> 작성 기준: 2026-07-06 / 기술 스택은 구현자가 가장 자신 있는 조합으로 고정

---

## 0. 개요

### 0.1 목표
- 프론트엔드를 React 18 → Vue 3.5(Composition API + `<script setup>`)로 전환
- **기능적 동등성** 유지: 사용자 플로우·API 계약·localStorage 진행도·TTS 동작을 현행과 동일하게 보존
- 백엔드 API·CORS·정적 에셋 서빙·배포 파이프라인은 그대로 유지

### 0.2 범위
| 포함 | 제외(비목표) |
|---|---|
| `front/src` 전체(12개 파일, 1,350줄) Vue 전환 | 백엔드 어떠한 변경도 |
| `front/package.json`·`vite.config.js`·`index.html` | TypeScript 도입 (JS 유지) |
| 단순 페이지~LearnPage 상태머신 전환 | Pinia 등 상태관리 라이브러리 도입 |
| 빌드/배포 동등성 검증 | 디자인/CSS 변경 (styles.css 그대로) |
| 수동 QA + 권장 스모크 테스트 | SEO/SSR (현행 SPA 구조 유지) |

### 0.3 현행 분석 요약
- **재사용 가능(프레임워크 무관, 변경 0줄): ≈872줄 / 65%**
  `styles.css`(441), `utils/progressStorage.js`(216), `api.js`(114), `utils/tts.js`(73), `data/letterCatalog.js`(20), `utils/shuffle.js`(8)
- **재작성(React → Vue): ≈498줄 / 35%**
  `main.jsx`(13), `App.jsx`(21), `WelcomePage`(28), `LibraryPage`(33), `LettersPage`(108), `LearnPage`(275)
- **프론트엔드 자동화 테스트 없음** → 마이그레이션 검증은 수동 QA가 주축이며, 스모크 테스트 추가를 권장

### 0.4 기술 스택 (고정)
| 항목 | 버전 | 비고 |
|---|---|---|
| Vue | `^3.5` | Composition API + `<script setup>` |
| vue-router | `^4` | history 모드 |
| Vite | `^5.4.19` (현행 유지) | Dockerfile·nginx·env 그대로 |
| @vitejs/plugin-vue | `^5` (Vite 5 호환) | `@vitejs/plugin-react` 교체 |
| 상태관리 | 불필요 | 진행도는 localStorage → 유틸 직접 import |
| 테스트(권장) | Vitest + Vue Test Utils | Vite 5 호환 |

> 버전은 설치 시점 최신 호환 패치로 받되, 상기 메이저/마이너 범위를 유지한다.

---

## 1. 설계

### 1.1 대상 디렉터리 구조
```
front/src/
├── main.js                      # createApp 진입 (신규)
├── App.vue                      # <router-view/> 래퍼 (신규)
├── router/
│   └── index.js                 # createRouter (신규)
├── api.js                       # 그대로 복사
├── data/letterCatalog.js        # 그대로 복사
├── pages/
│   ├── WelcomePage.vue          # 변환
│   ├── LibraryPage.vue          # 변환
│   ├── LettersPage.vue          # 변환
│   └── LearnPage.vue            # 변환 (핵심)
├── utils/
│   ├── shuffle.js               # 그대로 복사
│   ├── tts.js                   # 그대로 복사
│   └── progressStorage.js       # 그대로 복사
└── styles.css                   # 그대로 복사
```
- `composables/` 도입은 **옵션**. 1차 마이그레이션에서는 위험 최소화를 위해 유틸을 직접 import한다(동등성 우선). 리팩터는 별도 이슈로 분리.

### 1.2 의존성 교체 (`package.json`)
```jsonc
{
  "name": "hayoon-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "vite": "^5.4.19"
  }
}
```
제거: `react`, `react-dom`, `react-router-dom`, `@vitejs/plugin-react`

### 1.3 빌드 설정 (`vite.config.js`)
```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:8080" }   // 현행과 동일
  }
});
```
- `VITE_API_BASE_URL` env도 그대로 동작(Vite 프리픽스는 프레임워크 무관)
- `vite build` 산출물 경로 `dist/` 동일 → **Dockerfile·nginx.conf 변경 없음**

### 1.4 라우팅 설계 (`router/index.js`)
```js
import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "../pages/WelcomePage.vue";
import LibraryPage from "../pages/LibraryPage.vue";
import LettersPage from "../pages/LettersPage.vue";
import LearnPage from "../pages/LearnPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: WelcomePage },
    { path: "/library", component: LibraryPage },
    { path: "/letters", component: LettersPage },
    { path: "/learn/:letterKey", component: LearnPage },
    { path: "/:pathMatch(.*)*", redirect: "/" }   // 현행 "*" → "/" 리다이렉트 동등
  ]
});
```
- `react-router-dom`의 `<Navigate to="/" replace/>` 와일드카드 → `redirect: "/"` 로 동등 처리
- nginx의 `try_files ... /index.html` SPA 폴백과 history 모드는 그대로 호환

### 1.5 진입점 (`main.js`)
```js
import { createApp } from "vue";
import { router } from "./router";
import App from "./App.vue";
import "./styles.css";

createApp(App).use(router).mount("#root");
```
- `index.html` 의 `<script src="/src/main.jsx">` → `/src/main.js` 로 1행 변경(나머지 동일)

### 1.6 컴포넌트 변환 매핑 (React → Vue)
| React | Vue `<script setup>` |
|---|---|
| `useState(x)` | `ref(x)` / `reactive({...})` |
| `useEffect(fn, [])` | `onMounted(fn)` + `onUnmounted(cleanup)` |
| `useEffect(fn, [dep])` | `watch(dep, fn)` / `watchEffect` |
| `useMemo(() => x, [d])` | `computed(() => x)` |
| `useCallback` | 일반 함수(또는 `shallowRef`) |
| `useNavigate()` | `useRouter()` → `router.push()` |
| `useParams()` | `useRoute().params` |
| `useRef(timeout)` | setup 내 `let` 변수 |
| `setCycle(prev => …)` | `cycle.value = …` 직접 갱신 |
| `{cond ? <X/> : null}` | `v-if` / `v-else` |
| `.map(k => <X key>)` | `v-for="x in list" :key="x.key"` |
| `className={\`a ${b}\`}` | `:class="['a', b ? 'on' : 'off']"` |
| `onClick` / `onError` | `@click` / `@error` |
| `disabled={x}` | `:disabled="x"` |
| `<>…</>` fragment | 다중 루트 허용(Vue 3) 또는 `<template>` |

### 1.7 상태·사이드이펙트 설계
- **컴포넌트 로컬 상태**: 전부 `ref()`로 직접 대응. 글로벌 스토어 불필요.
- **API 데이터**: `api.js`(그대로)를 페이지의 `onMounted`/`watch`에서 호출.
- **진행도·설정**: `progressStorage.js`(그대로) 직접 호출. 스키마 버전(`hangulKid.v1.*`) 유지 → 기존 사용자 localStorage 호환.
- **TTS**: `tts.js`(그대로). `onMounted`에서 `isTtsSupported()` 점검, `onUnmounted`에서 `stopSpeaking()`.

### 1.8 핵심: LearnPage 상태머신 매핑
유일한 실질 로직 컴포넌트. 외부 순수 함수(`createShuffledOrder`, `buildInitialCycle`, `EMPTY_CYCLE`)는 **그대로 재사용**하고 컴포넌트 내 로직만 매핑.

상태 대응:
```
words, loading, error, showIntro, imageFailed, cycle, ttsSupported, ttsNotice
→ ref(...) 8개 + letterLabel/currentWord 은 computed
```

이펙트 대응:
| React effect | Vue 대응 |
|---|---|
| `[]` TTS 지원 점검 + 언마운트 `stopSpeaking` | `onMounted` + `onUnmounted` |
| `[letterKey]` 단어 로드 + `active` 취소 | `watch(letterKey, …, {immediate:true})` + 취소 플래그 |
| `[cycle.current?.id]` imageFailed 리셋 | `watch(() => cycle.value.current?.id, …)` |
| `[cycle…, error, letterKey, showIntro]` 진행도 저장(가드 포함) | `watch([…], …)` 동일 가드 |

`drawNextWord` (functional setState → 직접 갱신):
```js
function drawNextWord() {
  if (words.value.length === 0) return;
  const prev = cycle.value;
  let order = prev.order;
  let cursor = prev.cursor;
  if (order.length === 0 || cursor >= order.length) {
    order = createShuffledOrder(words.value, prev.lastWordId);
    cursor = 0;
  }
  const nextWord = order[cursor] ?? prev.current;
  cycle.value = {
    order,
    cursor: cursor + 1,
    current: nextWord,
    lastWordId: nextWord?.id ?? prev.lastWordId,
    seenCount: ((prev.seenCount % words.value.length) + 1)
  };
}
```
- Vue는 StrictMode 이중 호출이 없어 `active` 패턴이 단순해지나, `letterKey` 빠른 변경 시 레이스 가드는 유지(Phase 5 검증 항목).

### 1.9 빌드/배포 설계
- **Dockerfile**(front): `node:22` builder → `nginx:1.27-alpine` 구조 그대로, `dist/` 산출물 동일 → **수정 불필요**
- **nginx.conf**: `/api/`, `/assets/words/`, `/images/cards/` 역프록시 + SPA 폴백 → **수정 불필요**
- **docker-compose.yml**(루트): 변경 없음
- **EC2 운영 절차**(README): 이미지 빌드만 새로(동일 태그 `yangyag2/hayoon-frontend:latest`), `docker run` 명령 동일

---

## 2. Phase별 마이그레이션 계획

각 phase는 **독립 커밋 + 명확한 완료 기준(Exit Criteria)**을 갖는다.

### Phase 0 — 사전 준비
- 작업 브랜치 생성 (`feat/frontend-vue` 등)
- 현행 React 빌드 정상 동작 베이스라인 확보: `cd front && npm ci && npm run build` 녹색 확인
- 스크린샷/플로우 캡처(동등성 비교용): Welcome → Library → Letters → Learn(카드 1사이클 + TTS + 진행도 저장)
- **Exit**: 베이스라인 빌드 성공, 비교 자산 확보

### Phase 1 — 인프라 전환 (부팅까지)
- `package.json` 의존성 교체 후 `rm -rf node_modules package-lock.json && npm install`
- `vite.config.js` 플러그인 교체
- `index.html` 엔트리 `main.jsx` → `main.js`
- `main.js`, `App.vue`(빈 `<router-view/>`), `router/index.js`(임시 더미 컴포넌트) 생성
- **Exit**: `npm run dev` 부팅, `/` 에서 빈 페이지 정상 렌더, `/api` 프록시 동작 확인

### Phase 2 — 프레임워크 무관 자산 복사
- `styles.css`, `api.js`, `data/letterCatalog.js`, `utils/{shuffle,tts,progressStorage}.js` 그대로 복사
- `*.jsx` 잔여 파일 제거
- **Exit**: 임포트 경로 정상, 린트/빌드 에러 없음 (기능 미검증)

### Phase 3 — 단순 페이지 변환
- `WelcomePage.vue`, `LibraryPage.vue` 변환 (거의 마크업만, `useRouter().push`)
- 라우터에 실제 컴포넌트 연결
- **Exit**: `/` ↔ `/library` 네비게이션 동작, 디자인 육안 동등

### Phase 4 — LettersPage 변환
- `useState`×4 → `ref`, `useEffect` 로드(+에러/폴백) → `onMounted`, `useRef` 타임아웃 → setup 변수, `useNavigate` → `useRouter`
- 리스트 `v-for`, 동적 클래스 `:class`, `aria-disabled` 유지
- **Exit**: 글자 그리드 렌더, 활성/잠금 상태, "곧 열려요" 알림, `/learn/:key` 이동 동등

### Phase 5 — LearnPage 변환 (핵심)
- 1.8절 매핑표에 따라 상태·이펙트·`drawNextWord` 포팅
- intro 카드 → 워드카드 전환, 이미지 로드 실패 폴백, TTS 버튼, 진행도 표시/저장
- **위험 항목 집중 검증**: `letterKey` 변경 레이스, `stopSpeaking` 언마운트 정리, 진행도 저장 가드
- **Exit**: Phase 0 캡처와 플로우 1:1 동등 (수동 QA 체크리스트 3절 통과)

### Phase 6 — 통합 정리
- React 의존성/파일 잔여 전수 제거 (`grep -ri react front/src` 결과 0)
- `npm run build` 프로덕션 빌드 녹색, 번들 사이즈 확인
- **Exit**: 클린 빌드, React 잔여 0, lint 통과

### Phase 7 — 검증/테스트 (3절 참조)
- 수동 QA 풀체크 + 엣지 케이스
- (권장) Vitest 스모크 테스트 추가
- **Exit**: 테스트 방안 전 항목 통과

### Phase 8 — 배포
- `docker compose up -d --build` 로컬 통합 검증
- 프론트 이미지 빌드/푸시(`yangyag2/hayoon-frontend:latest`)
- EC2 `docker pull` + `docker run` 갱신, 헬스체크·접속 확인
- **Exit**: 프로덕션 플로우 정상, 헬스체크 200

---

## 3. 테스트 방안

### 3.1 동등성 검증 전략
프론트 자동화 테스트가 없으므로, **React 베이스라인(Phase 0 캡처) 대비 수동 비교**가 1차 검증. 핵심(LearnPage)은 별도 집중 검증.

### 3.2 수동 QA 체크리스트
| # | 영역 | 항목 | 기대(현행 동등) |
|---|---|---|---|
| 1 | 라우팅 | `/`, `/library`, `/letters`, `/learn/ga` 진입 | 각 페이지 정상 렌더 |
| 2 | 라우팅 | 미정의 경로(`/xyz`) | `/` 리다이렉트 |
| 3 | 라우팅 | 새로고침 시 현재 경로 유지 | history 모드 정상 |
| 4 | Welcome | "시작하기" → `/library` | 이동 |
| 5 | Library | "가나다 한글" 카드 → `/letters` | 이동 |
| 6 | Letters | 글자 14개 그리드 표시 | 가~하 |
| 7 | Letters | 비활성 글자 클릭 | "곧 열려요" 1.4s 표시 |
| 8 | Letters | 활성 글자 클릭 | `/learn/:key` 이동 |
| 9 | Letters | API 실패 시 | 폴백 메시지 + 전체 잠금 |
| 10 | Learn | intro 카드 표시 + 글자 TTS | 발음 재생 |
| 11 | Learn | "다음" → 워드카드 | 이미지+단어 표시 |
| 12 | Learn | 단어 "읽어주기" | TTS 재생 |
| 13 | Learn | 이미지 로드 실패 | "이미지 준비 중" 폴백 |
| 14 | Learn | 진행도 `N / 전체` 증가 | seenCount 갱신 |
| 15 | Learn | 카드 1사이클 후 재셔플 | order 갱신, 직전 단어가 첫 번째면 스왑 |
| 16 | Learn | 뒤로/홈 이동 | `stopSpeaking` 정리(음성 중단) |
| 17 | Learn | 새로고침 후 진입 | localStorage 진행도 복원 |
| 18 | Learn | `letterKey` 빠른 변경 | 레이스 없이 최신 키 단어 표시 |
| 19 | TTS | TTS 미지원 브라우저 | 경고문 + 버튼 비활성 |
| 20 | 저장 | localStorage 스키마 | `hangulKid.v1.*` 호환(기존 데이터 유지) |
| 21 | 디자인 | 전 페이지 육안 비교 | styles.css 동등 |
| 22 | 빌드 | `npm run build` | 녹색, `dist/` 산출 |
| 23 | 통합 | `docker compose up` | front(8081)/back(8080) 정상 |
| 24 | 통합 | `/api/v1/letters` via nginx | 프록시 정상 |
| 25 | 통합 | `/assets/words/...png` | 백엔드 에셋 프록시 정상 |

### 3.3 엣지 케이스 집중 검증
- **localStorage 부재**(시크릿 모드/할당량 초과): 폭주 없이 in-memory 기본값 동작 (`progressStorage.js` 방어 로직 그대로)
- **TTS 미지원/voices 지연 로드**: `isTtsSupported()` false 경로, voices 비동기 로드 시 폴백
- **빈 단어 목록**: "아직 단어가 없어요." + "다음" 비활성
- **이미지 404**: `@error` → placeholder
- **`letterKey` 레이스**: A 진입 중 B로 변경 시 B 단어만 렌더(`active` 가드)

### 3.4 권장 자동화 (별도 이슈, 마이그레이션 블로커 아님)
- Vitest + Vue Test Utils 도입
- 최소 스모크:
  - `LettersPage` 마운트 → `getLetters` mock → 14개 렌더
  - `LearnPage` 마운트 → `getLetterWords` mock → intro 표시 → "다음" 클릭 → 카드 1개 표시 → seenCount=1
  - `progressStorage` 단위: 저장/복원/스키마 호환
- 도입 시 **3.2 항목 6/11/14/17 등을 자동화 회귀로 흡수** 가능

### 3.5 성능/회귀 점검
- 번들 사이즈: React(react+react-dom+router) vs Vue(vue+vue-router) 비교, 유의미 증가 없음 확인
- 초기 로드/라우트 전환 체감 응답성 동등

---

## 4. 리스크 및 완화
| 리스크 | 영향 | 완화 |
|---|---|---|
| LearnPage 상태머신 변환 오류 | 진행도/셔플 회귀 | 1.8 매핑표 + 3.2 #14~18 집중 QA, 외부 순수함수 재사용으로 로직 축소 |
| `letterKey` 레이스 | 잘못된 단어 표시 | `active` 취소 플래그 유지, #18 검증 |
| TTS 생명주기 누수 | 음성 중복 재생 | `onUnmounted`에서 `stopSpeaking` 필수, #16 검증 |
| localStorage 스키마 불일치 | 기존 진행도 손실 | `progressStorage.js` 변경 없음, #20 검증 |
| 자동화 테스트 부재 | 회귀 그물 없음 | 수동 QA + 스모크 테스트 권장(3.4) |
| 버전 호환(plugin-vue/Vite 5) | 빌드 실패 | Phase 1에서 부팅 검증, 불일치 시 패치 범위 조정 |

---

## 5. 롤백 방안
- 마이그레이션은 **별도 브랜치**에서 진행 → 미검증 상태 병합 금지
- 프로덕션 배포 후 이상 시: 이전 프론트 이미지 태그로 `docker run` 복구 (`latest` 롤백용 태그 사전 보관 권장)
- 백엔드는 변경사항 0이므로 롤백 영향 없음

---

## 6. 수용 기준 (Definition of Done)
- [ ] 3.2 수동 QA 25/25 통과
- [ ] 3.3 엣지 케이스 전 항목 통과
- [ ] `npm run build` 녹색, React 잔여 0 (`grep -ri react front/src` 결과 없음)
- [ ] `docker compose up --build` 통합 동작
- [ ] 백엔드/배포 스크립트 변경 0
- [ ] (권장) 스모크 테스트 추가 및 통과
- [ ] 프로덕션 배포 후 헬스체크/플로우 정상

---

## 7. 작업량 가늠 (1인 기준)
| Phase | 예상 |
|---|---|
| 0 사전 준비 | 0.5h |
| 1 인프라 전환 | 0.5h |
| 2 자산 복사 | 0.5h |
| 3 단순 페이지 | 0.5일 |
| 4 LettersPage | 0.5일 |
| 5 LearnPage + QA | 1~2일 |
| 6 통합 정리 | 0.5일 |
| 7 검증/테스트 | 0.5~1일 |
| 8 배포 | 0.5일 |
| **합계** | **약 2~4일** |

> 재사용 비율이 높고 백엔드/인프라 영향이 없어 일정 예측성이 높음. LearnPage(QA 포함)가 전체 공수의 과반.
