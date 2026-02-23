# Monorepo 전환 작업 계획서

## 목표
- 저장소를 단일 Git + `front/`, `back/` 구조로 전환한다.
- 기존 기능/런타임 동작은 유지한다.

## 진행 현황
### Phase 1. 구조 전환
- [x] `hayoon_front` -> `front` 리네임
- [x] `hayoon_back` -> `back` 리네임
- [x] 중첩 `.git` 제거(백업 이동)

### Phase 2. 루트 정비
- [x] 루트 Git 복원(`yangyag/hayoon`)
- [x] 루트 `docker-compose.yml` 경로를 `front/back` 기준으로 변경
- [x] 루트 문서(`README.md`, `AGENTS.md`, `WORK_PLAN.md`) 재구성
- [x] 루트 `.gitignore`를 monorepo 기준으로 정리

### Phase 3. 검증
- [x] `cd back && ./gradlew clean test`
- [x] `cd front && npm ci && npm run build`
- [x] 루트 `docker compose up -d --build` 스모크 확인

## 메모
- 기존 분리 저장소 전환 중 생성된 임시 백업은 `/tmp/hayoon_monorepo_*`에 보관됨.
