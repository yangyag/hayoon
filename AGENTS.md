# AGENTS.md

## 목적
- monorepo(`hayoon`) 운영 기준 문서다.
- `front/`, `back/` 하위 프로젝트를 한 저장소에서 일관되게 관리한다.

## 저장소 컨텍스트
- Frontend: React + Vite
- Backend: Spring Boot 3.5.11, Java 25 LTS
- 배포: Docker 이미지 2개(front/back) + 루트 `docker-compose.yml`
- 테스트 원칙: 백엔드 API JUnit(`MockMvc`) 중심

## 시스템 아키텍처
```text
[Browser]
  -> Frontend (front, Nginx, :8081)
      -> /api/v1/*
         -> Backend (back, Spring Boot, :8080)
```

## 디렉터리 규칙
- `front/`: UI, 라우팅, 상태관리, 프론트 Docker 빌드
- `back/`: API, 도메인, 테스트, 정적 자산, 백엔드 Docker 빌드
- 루트: 통합 실행/문서(`docker-compose.yml`, `.env.example`, `README.md`)

## 멀티 에이전트 역할
- `A0-Orchestrator`: 작업 분해, 우선순위, 통합 문서/결과 정리
- `A1-Backend`: API/검증/예외 처리, JUnit(MockMvc)
- `A2-Frontend`: 화면/상태/API 연동/TTS
- `A3-ContentAsset`: 단어/이미지 경로 정책 및 레지스트리 동기화
- `A4-DevOps`: compose, Dockerfile, 실행/배포 체인
- `A5-QA`: 회귀 체크, 수용 기준 판정

## 병렬 작업 규칙
- `front/`와 `back/`는 파일 충돌이 없으면 병렬 작업한다.
- 공용 계약(API 경로/응답/자산 규칙)은 먼저 고정한다.
- 루트 공용 파일(`docker-compose.yml`, `AGENTS.md`)은 통합 리뷰 후 반영한다.

## 품질 게이트
- 코드 + 테스트 + 문서를 같은 변경 단위로 갱신한다.
- 백엔드 기능 변경 시 `back` 테스트를 반드시 통과시킨다.
- 최소 검증:
  - `cd back && ./gradlew clean test`
  - `cd front && npm run build`
  - 루트 `docker compose up -d --build` + health 체크

## 참조 문서
- 화면/콘텐츠/자산 기준: `back/docs/SCREEN_FLOW_AND_CONTENT_PLAN.md`, `back/docs/ASSET_FILE_REGISTRY.md`
