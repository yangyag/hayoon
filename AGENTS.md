# AGENTS.md

## 목적
- 단일 monorepo(`hayoon`) 기준 협업/운영 규칙을 정의한다.
- 프론트와 백엔드는 폴더 단위로 분리하고, Git은 루트 하나로 관리한다.

## 아키텍처
```text
[Browser]
  -> front (React + Vite + Nginx)
      -> /api/v1/*
  -> back (Spring Boot)
```

## 디렉터리 규칙
- `front/`: 프론트엔드 코드와 빌드 설정
- `back/`: 백엔드 API 코드, 테스트, 정적 자산
- 루트: 통합 실행(`docker-compose.yml`)과 공통 문서

## 멀티 에이전트 역할
- `A0-Orchestrator`: 작업 분해/충돌 조정/통합 검증
- `A1-Backend`: API/DTO/예외/MockMvc 테스트
- `A2-Frontend`: UI/라우팅/API 연동/TTS
- `A4-DevOps`: Docker/compose/빌드 파이프라인
- `A5-QA`: 회귀 및 수용 기준 검증

## 품질 게이트
- 기능 변경 시 코드 + 테스트 + 문서를 함께 갱신한다.
- 백엔드 테스트는 `back`에서 JUnit(MockMvc) 기준을 유지한다.
- 최소 검증:
  - `cd back && ./gradlew clean test`
  - `cd front && npm run build`
  - 루트에서 `docker compose up -d --build` 후 스모크 확인
