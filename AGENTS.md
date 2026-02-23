# AGENTS.md

## 목적
- 이 저장소의 단일 기준 운영/기술 문서다.
- 멀티 에이전트 협업 규칙과 시스템 아키텍처를 함께 정의한다.
- 신규 작업자는 이 문서만으로 개발, 검증, 배포를 시작할 수 있어야 한다.

## 프로젝트 컨텍스트
- 프로젝트: 40개월 아동 대상 한글 학습 웹앱
- 핵심 UX: `하윤이 환영해~` 시작 화면 -> 책장 -> 글자 선택 -> 단어 학습
- 백엔드: Spring Boot 3.5.11
- 자바 기준: Java 25 LTS (toolchain)
- 프론트엔드: React + Vite
- 배포: Docker 멀티 스테이지 이미지 + docker compose
- 저장 방식(현재): 서버 영속 저장 없음, 학습 상태는 프론트 localStorage 사용
- 테스트 정책: 백엔드 API 호출 테스트만 JUnit(`MockMvc`)으로 작성

## 현재 기능 범위
- SPA 라우트: `/`, `/library`, `/letters`, `/learn/:letterKey`
- 글자 학습: `가~하` 전체 14글자 활성
- 글자별 단어: 각 5개(이미지 포함)
- 학습 진도 복원: 글자별 `lastWordId`, `seenCount`, 마지막 진입 글자 저장
- 학습 보조: 수동 `읽어주기` TTS 버튼 제공(미지원 브라우저 안내 포함)
- API:
- `GET /api/v1/health`
- `GET /api/v1/cards`
- `GET /api/v1/cards/{id}`
- `GET /api/v1/letters`
- `GET /api/v1/letters/{key}/words`

## 시스템 아키텍처 개요
```text
[Browser]
  React SPA (react-router)
    - Welcome / Library / Letters / Learn
    - /api/v1/* fetch
        |
        v
[Spring Boot]
  - REST API controllers
  - Global exception handling
  - Static resource serving (SPA bundle + assets)
        |
        v
[Container Runtime]
  - Single app container (:8080)
```

## 런타임 컴포넌트
### Frontend (React)
- 위치: `frontend/src`
- 주요 파일:
- `frontend/src/App.jsx`
- `frontend/src/pages/WelcomePage.jsx`
- `frontend/src/pages/LibraryPage.jsx`
- `frontend/src/pages/LettersPage.jsx`
- `frontend/src/pages/LearnPage.jsx`
- `frontend/src/api.js`
- 주요 역할:
- 라우팅 및 화면 상태 관리
- 글자/단어 API 호출
- 학습 카드 랜덤 비중복 순환 표시
- localStorage 진도 저장/복원
- Web Speech API 수동 읽어주기

### Backend (Spring Boot)
- 위치: `src/main/java/com/hayoon/hangulkid`
- 주요 컨트롤러:
- `card/controller/CardController.java`
- `letter/controller/LetterController.java`
- `common/web/HealthController.java`
- 공통 에러 처리:
- `common/web/GlobalExceptionHandler.java`
- 주요 역할:
- API 응답 제공
- 오류 응답 표준화
- SPA 정적 리소스 제공

### SPA 라우트 포워딩
- 파일: `src/main/java/com/hayoon/hangulkid/common/web/SpaForwardController.java`
- 포워딩 대상:
- `/`, `/library`, `/letters`, `/learn`, `/learn/**` -> `forward:/index.html`
- `/api/**`는 포워딩 대상 아님(백엔드 컨트롤러 처리)

## 요청/데이터 흐름
1. 사용자 진입: `/`
2. `시작하기` -> `/library`
3. `가나다 한글` 책 선택 -> `/letters`
4. 글자 선택 -> `/learn/:letterKey`
5. 프론트 API 호출:
- 글자 목록: `GET /api/v1/letters`
- 글자 단어: `GET /api/v1/letters/{key}/words`
6. 학습 화면:
- 인트로(큰 글자)
- `다음` 클릭 시 단어/이미지 랜덤 노출
- 5개 소진 전 중복 없음, 소진 후 재셔플

## 공개 API 계약
### `GET /api/v1/health`
- 200
- body: `{ "status": "UP", "timestamp": "..." }`

### `GET /api/v1/cards`
- query:
- `level` (optional, 1~3)
- `limit` (optional, default 24, 1~50)
- body: `{ items: CardDto[], total: number }`

### `GET /api/v1/cards/{id}`
- 200 또는 404(`CARD_NOT_FOUND`)

### `GET /api/v1/letters`
- 200
- body:
- `items[]` -> `{ key, label, enabled }`
- 현재 정책: 14개 전체 enabled=true

### `GET /api/v1/letters/{key}/words`
- 200
- body:
- `{ key, label, items[] }`
- `items[]` -> `{ word, imageUrl }`
- unknown key -> 404(`CARD_NOT_FOUND`)

## 도메인/콘텐츠 아키텍처
### 글자 key 매핑
- `ga, na, da, ra, ma, ba, sa, a, ja, cha, ka, ta, pa, ha`

### 자산 경로 규칙
- 루트: `src/main/resources/static/assets/words`
- 규칙: `/assets/words/{key}/{filename}.png`
- 기준 문서: `docs/ASSET_FILE_REGISTRY.md`

### 콘텐츠 소스 오브 트루스
- API 제공 단어/이미지 경로는 `docs/ASSET_FILE_REGISTRY.md`와 일치해야 한다.
- 문서와 코드 불일치 시 문서/코드/테스트를 같은 변경에서 동기화한다.

## 빌드/배포 아키텍처
### Gradle 통합 빌드
- 파일: `build.gradle`
- 파이프라인:
- `npmInstall` -> `npmBuild` -> `prepareFrontendResources` -> `processResources`
- 프론트 빌드 산출물(`frontend/dist`)을 Spring `static`으로 포함
- 옵션:
- `-PskipFrontendNpm=true` 사용 시 npm 단계 스킵(사전 생성 dist 필요)

### Docker 멀티 스테이지
- 파일: `Dockerfile`
- Stage 1: `node:22-bookworm-slim` (frontend build)
- Stage 2: `eclipse-temurin:25-jdk-jammy` (bootJar build)
- Stage 3: `eclipse-temurin:25-jre-jammy` (runtime)
- 런타임 포트: `8080`

### 실행 명령
- 로컬 빌드: `./gradlew clean build`
- 로컬 실행: `./gradlew bootRun`
- 도커 실행: `docker compose up -d --build`
- 도커 중지: `docker compose down`

## 테스트 아키텍처
- 원칙: 백엔드 API JUnit(`MockMvc`)만 테스트 코드로 관리
- 위치:
- `src/test/java/com/hayoon/hangulkid/card/controller/CardControllerTest.java`
- `src/test/java/com/hayoon/hangulkid/letter/controller/LetterControllerTest.java`
- `src/test/java/com/hayoon/hangulkid/common/web/HealthControllerTest.java`
- 필수 검증:
- `./gradlew clean test`
- `./gradlew clean build`
- 도커 스모크: health/API 라우트 확인

## 멀티 에이전트 구성
- `A0-Orchestrator` (총괄/통합)
- `A1-Backend` (Spring API, 모델, 예외, 테스트)
- `A2-Frontend` (화면/상태관리/TTS/UI)
- `A3-ContentAsset` (단어셋/파일경로/placeholder 정책)
- `A4-DevOps` (Gradle 통합 빌드, Dockerfile, compose)
- `A5-QA` (백엔드 API 검증, 회귀 체크, DoD 판정)

## 역할별 책임
### A0-Orchestrator
- 작업 분해, 우선순위 결정, 병렬 가능 작업 지정
- API 계약/자산 규칙/빌드 규칙 충돌 조정
- `WORK_PLAN.md` 진행 상태 업데이트

### A1-Backend
- `/api/v1/cards`, `/api/v1/health`, `/api/v1/letters` 유지/확장
- 입력 검증, 에러 포맷, DTO 계약 안정성 유지
- 백엔드 API 테스트(`MockMvc`) 유지

### A2-Frontend
- 화면 흐름 유지: 환영 -> 책장 -> 글자선택 -> 학습
- API 계약 준수 렌더링
- localStorage 상태 저장/복원 유지
- 수동 TTS 버튼/지원성 fallback 유지
- 아동용 UI 가이드 준수(큰 버튼/큰 텍스트/단순 인터랙션)

### A3-ContentAsset
- `docs/ASSET_FILE_REGISTRY.md` 유지
- 파일명/경로 규칙 검증
- 누락 자산 리포트 생성

### A4-DevOps
- Gradle 프론트 통합 빌드 안정화
- Docker 멀티 스테이지 빌드/실행 안정화
- 실행/배포 명령 문서화

### A5-QA
- 백엔드 API 체크리스트 기반 검증
- 회귀 결과 기록
- 릴리스 전 수용 기준 충족 여부 판정

## 표준 작업 흐름
1. A0가 작은 단위로 작업 분해
2. A1/A2/A3/A4가 병렬 수행
3. A5가 통합 검증
4. A0가 문서/로그 동기화 후 완료 처리

## 병렬 작업 규칙
- 서로 다른 파일 세트 우선 병렬화
- 공용 계약(API/자산/빌드)은 먼저 고정 후 구현
- 충돌 가능 파일(`AGENTS.md`, `WORK_PLAN.md`, 공용 타입/빌드 스크립트)은 A0 승인 후 병합
- 한 작업 단위는 기능+테스트+문서를 같이 제출

## 인수인계(Handoff) 템플릿
- `Task`: 무엇을 완료했는지
- `Files`: 수정 파일 목록
- `Behavior`: 사용자 관점 변화
- `Tests`: 실행한 테스트/결과
- `Open`: 남은 이슈/리스크

## 현재 우선순위
1. 단어/이미지 운영 안정화(자산 검증 자동화)
2. 즐겨찾기 기능 범위 확정 및 구현
3. 통합 빌드/도커 파이프라인 회귀 자동화
4. 백엔드 API 회귀 테스트 체계 강화

## 품질 게이트
- 코드 + 테스트 + 문서 동시 갱신
- 사용자 표시 텍스트/경로/버튼명은 기획 문서와 일치
- 기능 변경 시 `WORK_PLAN.md` 진행 로그 1줄 이상 갱신
- 테스트 추가는 백엔드 API JUnit(`MockMvc`) 범위 유지

## 금지/주의 사항
- 사용자 미승인 범위(로그인, 서버 DB 저장, 다중 프로필) 임의 확장 금지
- 자산 파일명 규칙 임의 변경 금지
- 버전/빌드/런타임 등 호환성 영향 변경은 A0 승인 후 진행
- 기존 변경사항을 임의로 되돌리지 말 것

## 참조 문서
- 메인 계획서: `WORK_PLAN.md`
- 화면/콘텐츠 기획: `docs/SCREEN_FLOW_AND_CONTENT_PLAN.md`
- 자산 레지스트리: `docs/ASSET_FILE_REGISTRY.md`
