# 한글 학습 백엔드 작업 계획서

## 1. 목표
- 이 저장소를 하윤 프로젝트의 **백엔드 API 전용 저장소**로 운영한다.
- 프론트엔드 저장소(`hayoon_front`)와 독립적으로 빌드/배포/검증 가능해야 한다.
- API 안정성과 테스트 품질(JUnit/MockMvc)을 유지한다.

## 2. 현재 상태 스냅샷 (2026-02-23)
- 프론트/백엔드 분리 완료
- 프론트 저장소 이관 완료:
- `git@github.com:yangyag/hayoon_front.git`
- 백엔드 통합 빌드에서 프론트 의존 제거 완료
- SPA 포워딩 제거 완료(`SpaForwardController` 삭제)
- Docker compose 백엔드 단일 서비스로 전환 완료

## 3. 범위
### 포함
- `/api/v1/*` API 유지/확장
- 백엔드 테스트(JUnit/MockMvc)
- 카드 데이터/이미지 정적 경로 유지
- Docker 백엔드 이미지 빌드/실행

### 제외
- 프론트 UI 개발
- 프론트 배포 파이프라인
- 인증/사용자 DB 설계

## 4. 아키텍처
- Runtime:
- `hayoon` repo: Spring Boot API (`:8080`)
- `hayoon_front` repo: React SPA (별도 배포)
- 연동 방식:
- 프론트가 백엔드 `/api/v1/*` 호출
- CORS는 `app.cors.allowed-origins`로 제어

## 5. 단계별 계획
### Phase A. API 안정화
- [x] 카드/글자/헬스 API 제공
- [x] 글로벌 예외 포맷 유지
- [x] 루트(`/`) 요청 404 정리(API 전용화)

### Phase B. 테스트/품질
- [x] `./gradlew clean test` 통과
- [x] `./gradlew clean build` 통과
- [ ] 컨트롤러 경계값 테스트 추가 보강(차기)

### Phase C. 배포/운영
- [x] `Dockerfile` 백엔드 전용 유지
- [x] `docker-compose.yml` 백엔드 단일 서비스화
- [ ] backend 전용 Docker Hub 리포지토리(`yangyag2/hayoon-backend`) 운영 전환

## 6. 진행 로그
| 날짜 | 단계 | 상태 | 작업 내용 | 비고 |
|---|---|---|---|---|
| 2026-02-23 | 분리 전환 | DONE | 프론트 통합 빌드 제거, SPA 포워딩 제거, API 전용 런타임 정리 | backend-only 구조 확정 |
| 2026-02-23 | 분리 이관 | DONE | 프론트 코드를 `hayoon_front` 신규 저장소로 스냅샷 이관 | `main` push 완료 |
| 2026-02-23 | 문서 정리 | DONE | `README.md`, `AGENTS.md`, `WORK_PLAN.md` 백엔드 전용 기준으로 재작성 | 운영 기준선 업데이트 |

## 7. 최종 체크리스트
- [x] 백엔드 로컬 실행 가능 (`./gradlew bootRun`)
- [x] 백엔드 테스트 통과 (`./gradlew clean test`)
- [x] 백엔드 빌드 통과 (`./gradlew clean build`)
- [x] Docker compose 실행 가능 (`docker compose up -d --build`)
- [x] `/api/v1/health` 응답 정상
- [x] 프론트 저장소 분리 완료

## 8. 참조
- 운영 규칙: `AGENTS.md`
- 화면/콘텐츠 기획(원문): `docs/SCREEN_FLOW_AND_CONTENT_PLAN.md`
- 이미지 레지스트리: `docs/ASSET_FILE_REGISTRY.md`
