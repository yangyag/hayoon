# 한글 학습 웹앱 상세 작업 계획서

## 1. 목표
- 40개월 아이 대상의 한글 학습 웹앱 MVP를 구축한다.
- 어떤 디바이스(모바일/태블릿/PC)에서도 접속 가능해야 한다.
- 백엔드는 Spring Boot, 프론트는 React 기반으로 구현한다.
- 사용자 데이터는 브라우저 로컬 저장(localStorage)만 사용한다.
- Docker 이미지로 빌드 및 실행 가능해야 한다.
- 첫 진입 화면은 `하윤이 환영해~` 메시지와 `시작하기` 버튼을 중심으로 구성한다.
- 책장 화면에는 초기 책 1권(`가나다 한글`)만 배치하고 이후 확장 가능하게 설계한다.

## 2. 확정 스택/버전
- Spring Boot: 3.5.11 (stable 라인)
- Java: 25 LTS (프로젝트 기준)
- Build Tool: Gradle Wrapper
- Frontend: React + Vite
- Runtime: 단일 Spring Boot 서버가 정적 프론트 파일을 서빙
- 테스트 정책: 백엔드(Spring Boot) API 호출 테스트만 JUnit으로 작성 (`MockMvc`)

## 3. 현재 상태 스냅샷 (2026-02-23)
- 초기 Spring Boot 프로젝트 생성 완료
- Java Toolchain 25 설정 완료 (`build.gradle`)
- API 구현 완료: `/api/v1/cards`, `/api/v1/cards/{id}`, `/api/v1/letters`, `/api/v1/letters/{key}/words`, `/api/v1/health`
- 백엔드 API 테스트 완료 (`MockMvc` 기반)
- React 화면 구현 완료: 환영 -> 책장 -> 글자선택 -> 학습(인트로/단어카드)
- localStorage 진도 저장 완료 (`hangulKid.v1.progress`, `hangulKid.v1.settings`)
- 수동 TTS(`읽어주기`) 완료 + 미지원 브라우저 안내 처리
- 프론트/백엔드 분리 런타임으로 전환:
- 백엔드 API 전용(Spring Boot), 프론트 정적서빙(Nginx)
- Docker compose 2서비스(`backend:8080`, `frontend:8081`) 구성 완료

미완료 항목:
- 즐겨찾기 기능(선택 범위, 차기 단계)
- 자산 누락 자동 검증 리포트

## 4. 작업 범위 (MVP)
### 포함
- 환영 화면(문구/시작 버튼) + 책장 화면 + 책 1권 인터랙션
- 그림-단어 카드 학습 화면
- 카드/글자 학습 API
- 진도/마지막 위치 로컬 저장
- 브라우저 TTS (ko-KR 우선)
- 반응형 UI (모바일/태블릿 우선)
- Docker 이미지 빌드/실행

### 제외
- 로그인/회원가입
- 서버 DB 저장
- 다중 프로필
- 오프라인(PWA) 완전 지원
- 즐겨찾기(현재 스프린트 범위 제외)

## 5. 아키텍처 개요
- Backend (`Spring Boot`, API 전용)
- `/api/v1/cards`, `/api/v1/letters`, `/api/v1/health` 제공
- 정적 카드 데이터(JSON) + 단어 이미지(`/assets/words/**`) 제공
- Frontend (`React + Vite`, Nginx 정적 서빙)
- 환영/책장/글자선택/학습 화면 제공
- localStorage를 상태 저장소로 사용
- 배포 형태
- 프론트/백엔드 각각 독립 컨테이너
- 기본 포트: frontend `8081`, backend `8080`

## 6. 단계별 실행 계획
### Phase 0. 기준선 고정
- [ ] 현재 변경 상태를 커밋 단위로 정리 (기능별 커밋 전략 수립)
- [x] README에 실행 조건(Java 25, Node, Docker) 반영

완료 기준 (DoD)
- 누구나 저장소를 받았을 때 필수 환경을 이해할 수 있다.

### Phase 1. 백엔드 API 안정화
- [x] `GET /api/v1/cards?level=&limit=` 검증/응답 포맷 고정
- [x] `GET /api/v1/cards/{id}` 404 처리 확정
- [x] 글로벌 에러 응답 포맷 통일
- [x] API 테스트 보강(정상/예외/경계값, JUnit + MockMvc)

완료 기준 (DoD)
- 백엔드 API 테스트 통과
- 주요 에러 시나리오에 대해 4xx/5xx 응답이 의도대로 동작

### Phase 2. 프론트엔드 구현
- [x] React(Vite) 앱 생성
- [x] 화면: 환영, 책장, 글자선택, 학습(글자소개/단어카드)
- [x] API 연동 레이어 구성
- [x] 모바일 터치 UI(버튼 44px 이상) 적용

완료 기준 (DoD)
- 첫 화면에서 3탭 이내 학습 시작 가능
- 카드 이동 기본 흐름 정상
- 환영 화면에서 시작하기 클릭 후 `가나다 한글` 책으로 진입 가능

### Phase 3. 학습 상태 저장(localStorage)
- [x] 저장 스키마 정의 (`hangulKid.v1.progress`, `hangulKid.v1.settings`)
- [x] 글자별 완료수/마지막 카드/마지막 글자 저장
- [x] 앱 재실행 시 복원 로직 구현
- [x] 버전 필드 기반 마이그레이션 기본 처리

완료 기준 (DoD)
- 새로고침 후 학습 상태 유지
- 잘못된/오래된 데이터에도 앱이 안전하게 동작

### Phase 4. 브라우저 TTS
- [x] Web Speech API 연동
- [x] 한국어 음성(ko-KR) 우선 선택
- [x] 미지원 브라우저 fallback 메시지 제공

완료 기준 (DoD)
- 지원 브라우저에서 단어 읽기 가능(수동 버튼)
- 미지원 환경에서 사용자 안내 노출

### Phase 5. 통합 빌드 파이프라인
- [x] Gradle에서 프론트 빌드 태스크 연동
- [x] 프론트 산출물을 Spring `static`으로 포함
- [x] `./gradlew clean build`로 단일 산출물 생성

완료 기준 (DoD)
- 로컬에서 단일 명령으로 백엔드+프론트 통합 빌드 성공

### Phase 6. Docker 이미지화
- [x] `Dockerfile` 작성 (멀티 스테이지 권장)
- [x] `docker-compose.yml` 작성 (frontend/backend 2서비스)
- [x] backend/frontend 이미지 빌드/실행 검증
- [x] 컨테이너 헬스체크(`/api/v1/health`) 반영
- [ ] 분리 이미지 Docker Hub 업로드(`hayoon-frontend`, `hayoon-backend`)

권장 Docker 전략
- Stage 1: Node 기반 프론트 빌드
- Stage 2: JDK 25 기반 Gradle 빌드
- Stage 3: JRE 25 슬림 런타임으로 실행

완료 기준 (DoD)
- backend 이미지 빌드 성공
- frontend 이미지 빌드 성공
- `docker compose up -d` 후 frontend 접속/backend API health 정상

### Phase 7. 마무리/문서화
- [x] 실행 가이드(로컬/도커) 문서화
- [x] API/데이터 스키마 문서화
- [x] 백엔드 API JUnit 테스트 결과와 남은 과제 정리

완료 기준 (DoD)
- 다음 작업자가 문서만 보고 동일 환경 재현 가능

## 7. 진행률 추적 규칙
- 상태값
- `TODO`: 아직 시작 전
- `DOING`: 진행 중
- `DONE`: 완료
- `BLOCKED`: 외부 이슈로 중단

### 진행 로그
| 날짜 | 단계 | 상태 | 작업 내용 | 비고 |
|---|---|---|---|---|
| 2026-02-23 | Phase 0~1 일부 | DOING | Spring Boot 초기 생성, 카드 API/테스트 초안 작성 | 구현 중 중단 요청으로 보류 |
| 2026-02-23 | Phase 2 일부 | DONE | 환영 화면(`/`) 구현, 시작 버튼 및 책장 placeholder(`/library`) 연결 | Docker 실행 단계 진행 예정 |
| 2026-02-23 | Phase 5~6 일부 | DONE | Gradle 프론트 통합 빌드 태스크, SPA 라우트 포워딩, Docker 멀티 스테이지(Node->JDK->JRE) 적용 | `frontend/` 앱 소스 필요 |
| 2026-02-23 | Phase 1~2 일부 | DONE | 학습 글자 범위를 `가~하`로 활성화하고 카드 API 확장을 완료해 전체 글자 학습 흐름 연동 | 문서 동기화 완료 |
| 2026-02-23 | Phase 2 개선 | DONE | 글자 학습 진입 시 인트로 글자(예: `가`, `나`) 표시 크기를 확대해 가독성 강화 | 아동용 UI 가이드 반영 |
| 2026-02-23 | Phase 3~4 | DONE | localStorage 진도 저장/복원(`hangulKid.v1.progress`, `hangulKid.v1.settings`) 및 수동 TTS(`읽어주기`) 적용 | 학습 카드에서 복원/재생 확인 |
| 2026-02-23 | Phase 6~7 | DONE | Docker 이미지 빌드 및 compose 기동 후 health 체크 검증, README/AGENTS/WORK_PLAN 동기화 | `GET /api/v1/health` 200 확인 |
| 2026-02-23 | Phase 6 배포 | DONE | Docker Hub `yangyag2/hayoon-hangul-kid`로 `latest`, `55e8cea` 태그 push 완료 | 단일 이미지 레거시 경로 |
| 2026-02-23 | Phase 6 분리 | DONE | 단일 컨테이너 구조를 frontend(Nginx)+backend(API) 2서비스 런타임으로 전환 | SPA 포워딩/프론트 통합 빌드 제거 |

## 8. 리스크 및 대응
- Java 25 미설치 환경 리스크
- 대응: Docker 빌드를 기본 실행 경로로 제공
- 브라우저별 TTS 음질 차이
- 대응: 음성 선택 우선순위 + 실패 메시지 처리
- 프론트-백 통합 빌드 복잡도
- 대응: Gradle 태스크 의존성 명시, CI에서 빌드 검증

## 9. 최종 검증 체크리스트
- [x] `./gradlew clean test` 통과
- [x] `./gradlew clean build` 통과
- [x] `docker build -t hangul-backend:latest .` 통과
- [x] `docker build -t hangul-frontend:latest ./frontend` 통과
- [x] `docker compose up -d` 후 frontend(`8081`) 접속 가능
- [x] `docker compose up -d` 후 backend(`/api/v1/health`) 정상
- [x] 카드 학습/새로고침 진도 복원 정상
- [x] `/api/v1/health` 응답 정상
- [x] 테스트 코드는 백엔드 API(JUnit/MockMvc) 범위만 유지

## 10. 상세 기획 문서 링크
- 멀티 에이전트 운영 규칙: `AGENTS.md`
- 화면/콘텐츠 상세: `docs/SCREEN_FLOW_AND_CONTENT_PLAN.md`
- 이미지 파일 경로/파일명 레지스트리: `docs/ASSET_FILE_REGISTRY.md`
