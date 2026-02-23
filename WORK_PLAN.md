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
- 카드 API/헬스 API/예외처리/기초 테스트 코드 추가됨
- 카드 샘플 데이터(`src/main/resources/cards/cards.json`) 추가됨

미완료 항목:
- React 앱 생성 및 연동
- localStorage 진도 저장 기능
- 브라우저 TTS 기능
- Dockerfile / docker-compose
- 통합 빌드 검증

## 4. 작업 범위 (MVP)
### 포함
- 환영 화면(문구/시작 버튼) + 책장 화면 + 책 1권 인터랙션
- 그림-단어 카드 학습 화면
- 카드 목록/단건 API
- 진도/즐겨찾기/마지막 위치 로컬 저장
- 브라우저 TTS (ko-KR 우선)
- 반응형 UI (모바일/태블릿 우선)
- Docker 이미지 빌드/실행

### 제외
- 로그인/회원가입
- 서버 DB 저장
- 다중 프로필
- 오프라인(PWA) 완전 지원

## 5. 아키텍처 개요
- Backend (`Spring Boot`)
- `/api/v1/cards`, `/api/v1/health` 제공
- 정적 카드 데이터(JSON) 로드
- Frontend (`React`)
- 카드 학습/즐겨찾기/홈 화면 제공
- localStorage를 상태 저장소로 사용
- 배포 형태
- React 빌드 결과물을 Spring 정적 리소스에 포함
- 컨테이너 1개로 실행

## 6. 단계별 실행 계획
### Phase 0. 기준선 고정
- [ ] 현재 변경 상태를 커밋 단위로 정리 (기능별 커밋 전략 수립)
- [ ] README에 실행 조건(Java 25, Node, Docker) 반영

완료 기준 (DoD)
- 누구나 저장소를 받았을 때 필수 환경을 이해할 수 있다.

### Phase 1. 백엔드 API 안정화
- [ ] `GET /api/v1/cards?level=&limit=` 검증/응답 포맷 고정
- [ ] `GET /api/v1/cards/{id}` 404 처리 확정
- [ ] 글로벌 에러 응답 포맷 통일
- [ ] API 테스트 보강(정상/예외/경계값, JUnit + MockMvc)

완료 기준 (DoD)
- 백엔드 API 테스트 통과
- 주요 에러 시나리오에 대해 4xx/5xx 응답이 의도대로 동작

### Phase 2. 프론트엔드 구현
- [ ] React(Vite) 앱 생성
- [ ] 화면: 환영, 책장, 글자선택, 학습(글자소개/단어카드), 즐겨찾기
- [ ] API 연동 레이어 구성
- [ ] 모바일 터치 UI(버튼 44px 이상) 적용

완료 기준 (DoD)
- 첫 화면에서 3탭 이내 학습 시작 가능
- 카드 이동/즐겨찾기 기본 흐름 정상
- 환영 화면에서 시작하기 클릭 후 `가나다 한글` 책으로 진입 가능

### Phase 3. 학습 상태 저장(localStorage)
- [ ] 저장 스키마 정의 (`hangulKid.v1.progress`, `hangulKid.v1.settings`)
- [ ] 완료 카드/즐겨찾기/마지막 카드 저장
- [ ] 앱 재실행 시 복원 로직 구현
- [ ] 버전 필드 기반 마이그레이션 기본 처리

완료 기준 (DoD)
- 새로고침 후 학습 상태 유지
- 잘못된/오래된 데이터에도 앱이 안전하게 동작

### Phase 4. 브라우저 TTS
- [ ] Web Speech API 연동
- [ ] 한국어 음성(ko-KR) 우선 선택
- [ ] 미지원 브라우저 fallback 메시지 제공

완료 기준 (DoD)
- 지원 브라우저에서 단어 읽기 가능
- 미지원 환경에서 사용자 안내 노출

### Phase 5. 통합 빌드 파이프라인
- [ ] Gradle에서 프론트 빌드 태스크 연동
- [ ] 프론트 산출물을 Spring `static`으로 포함
- [ ] `./gradlew clean build`로 단일 산출물 생성

완료 기준 (DoD)
- 로컬에서 단일 명령으로 백엔드+프론트 통합 빌드 성공

### Phase 6. Docker 이미지화
- [ ] `Dockerfile` 작성 (멀티 스테이지 권장)
- [ ] `docker-compose.yml` 작성 (앱 단일 서비스)
- [ ] 이미지 빌드/실행 검증
- [ ] 컨테이너 헬스체크(`/api/v1/health`) 반영

권장 Docker 전략
- Stage 1: Node 기반 프론트 빌드
- Stage 2: JDK 25 기반 Gradle 빌드
- Stage 3: JRE 25 슬림 런타임으로 실행

완료 기준 (DoD)
- `docker build` 성공
- `docker compose up -d` 후 앱 접속 및 API health 정상

### Phase 7. 마무리/문서화
- [ ] 실행 가이드(로컬/도커) 문서화
- [ ] API/데이터 스키마 문서화
- [ ] 백엔드 API JUnit 테스트 결과와 남은 과제 정리

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

## 8. 리스크 및 대응
- Java 25 미설치 환경 리스크
- 대응: Docker 빌드를 기본 실행 경로로 제공
- 브라우저별 TTS 음질 차이
- 대응: 음성 선택 우선순위 + 실패 메시지 처리
- 프론트-백 통합 빌드 복잡도
- 대응: Gradle 태스크 의존성 명시, CI에서 빌드 검증

## 9. 최종 검증 체크리스트
- [ ] `./gradlew clean test` 통과
- [ ] `./gradlew clean build` 통과
- [ ] `docker build -t hangul-kid:latest .` 통과
- [ ] `docker compose up -d` 후 웹 접속 가능
- [ ] 카드 학습/즐겨찾기/새로고침 복원 정상
- [ ] `/api/v1/health` 응답 정상
- [ ] 테스트 코드는 백엔드 API(JUnit/MockMvc) 범위만 유지

## 10. 상세 기획 문서 링크
- 멀티 에이전트 운영 규칙: `AGENTS.md`
- 화면/콘텐츠 상세: `docs/SCREEN_FLOW_AND_CONTENT_PLAN.md`
- 이미지 파일 경로/파일명 레지스트리: `docs/ASSET_FILE_REGISTRY.md`
