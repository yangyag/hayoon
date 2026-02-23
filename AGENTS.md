# AGENTS.md

## 목적
- 이 저장소(`hayoon`)의 백엔드 작업 기준 문서다.
- 멀티 에이전트 협업 시 동일한 품질/속도로 작업을 이어가기 위한 규칙을 정의한다.

## 저장소 컨텍스트
- 역할: Spring Boot API 백엔드
- 백엔드: Spring Boot 3.5.11
- 자바 기준: Java 25 LTS (toolchain)
- 테스트 정책: 백엔드 API JUnit(`MockMvc`)만 유지
- 배포: Docker 단일 백엔드 컨테이너

## 연동 저장소
- 프론트엔드는 별도 저장소로 이관됨
- Repo: `git@github.com:yangyag/hayoon_front.git`

## 현재 기능 범위
- API:
- `GET /api/v1/health`
- `GET /api/v1/cards`
- `GET /api/v1/cards/{id}`
- `GET /api/v1/letters`
- `GET /api/v1/letters/{key}/words`
- 정적 자산:
- `/assets/words/**`
- CORS:
- `app.cors.allowed-origins` 기반 허용

## 시스템 아키텍처
```text
[Frontend Repo: hayoon_front]
  React SPA (Nginx)
        |
        v
[Backend Repo: hayoon]
  Spring Boot REST API
  + static word assets
```

## 런타임 컴포넌트
### Backend (Spring Boot)
- 위치: `src/main/java/com/hayoon/hangulkid`
- 주요 컨트롤러:
- `card/controller/CardController.java`
- `letter/controller/LetterController.java`
- `common/web/HealthController.java`
- 공통 에러 처리:
- `common/web/GlobalExceptionHandler.java`

### 데이터/자산
- 카드 데이터: `src/main/resources/cards/cards.json`
- 이미지 자산 루트: `src/main/resources/static/assets/words`
- 파일 규칙 기준: `docs/ASSET_FILE_REGISTRY.md`

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
- body: `items[] -> { key, label, enabled }`

### `GET /api/v1/letters/{key}/words`
- 200
- body: `{ key, label, items[] }`
- unknown key -> 404(`CARD_NOT_FOUND`)

## 빌드/배포
### 로컬
- 빌드: `./gradlew clean build`
- 실행: `./gradlew bootRun`

### Docker
- 빌드/실행: `docker compose up -d --build`
- 중지: `docker compose down`
- 포트: `8080`

### Docker Hub
- 레거시 단일 이미지: `yangyag2/hayoon-hangul-kid`
- 차기 권장(분리): backend 전용 이미지 `yangyag2/hayoon-backend`

## 테스트 아키텍처
- 원칙: 백엔드 API JUnit(`MockMvc`)만
- 위치:
- `src/test/java/com/hayoon/hangulkid/card/controller/CardControllerTest.java`
- `src/test/java/com/hayoon/hangulkid/letter/controller/LetterControllerTest.java`
- `src/test/java/com/hayoon/hangulkid/common/web/HealthControllerTest.java`

## 멀티 에이전트 구성
- `A0-Orchestrator`: 작업 분해/우선순위/문서 동기화
- `A1-Backend`: API/검증/예외 처리
- `A3-ContentAsset`: 자산 경로/누락 점검
- `A4-DevOps`: Gradle/Docker 파이프라인
- `A5-QA`: 백엔드 회귀 검증

## 병렬 작업 규칙
- 서로 다른 파일 세트를 우선 병렬화한다.
- 공용 계약(API/에러 포맷/자산 경로)은 먼저 고정한다.
- 충돌 가능 파일(`AGENTS.md`, `WORK_PLAN.md`, 빌드 파일)은 A0 승인 후 병합한다.

## 품질 게이트
- 코드 + 테스트 + 문서를 함께 갱신해야 완료로 본다.
- 사용자 노출 텍스트/경로/API는 문서와 일치해야 한다.
- 기능 변경 시 `WORK_PLAN.md` 진행 로그를 1줄 이상 갱신한다.
- 테스트 추가는 백엔드 API JUnit(`MockMvc`) 범위 유지.

## 금지/주의 사항
- 사용자 미승인 범위(DB 저장, 인증/권한 확장)를 임의로 추가하지 않는다.
- 자산 파일명/경로 규칙을 임의 변경하지 않는다.
- 기존 변경사항을 임의로 되돌리지 않는다.

## 참조 문서
- 메인 계획서: `WORK_PLAN.md`
- 화면/콘텐츠 기획: `docs/SCREEN_FLOW_AND_CONTENT_PLAN.md`
- 자산 레지스트리: `docs/ASSET_FILE_REGISTRY.md`
