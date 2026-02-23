# Hayoon Hangul Kid

40개월 아이를 위한 한글 학습 웹앱 프로젝트입니다.

## 아키텍처
- `frontend/`: React + Vite (Nginx 정적 서빙)
- `backend`(root): Spring Boot API
- 분리 런타임: 프론트(`:8081`), 백엔드 API(`:8080`)

## 현재 구현 범위
- SPA 라우트: `/`, `/library`, `/letters`, `/learn/**`
- 학습 플로우: `가~하` 전체 글자 선택 및 학습 가능
- 학습 카드: 같은 순회 내 단어 중복 없이 랜덤 노출, 순회 종료 후 재셔플
- 학습 상태 저장(localStorage):
- `hangulKid.v1.progress`: 글자별 `lastWordId`, `seenCount`, 마지막 진입 글자
- `hangulKid.v1.settings`: TTS 지원 여부
- 읽어주기(TTS): 학습 카드에서 `읽어주기` 버튼으로 수동 재생
- 백엔드 API:
- `GET /api/v1/cards`
- `GET /api/v1/cards/{id}`
- `GET /api/v1/letters`
- `GET /api/v1/letters/{key}/words`
- `GET /api/v1/health`

## 요구 환경
- Java 25
- Node.js + npm (프론트 로컬 실행 시)
- Docker / Docker Compose (컨테이너 실행 시)

## 로컬 실행 (분리 개발)
백엔드:
```bash
./gradlew bootRun
```

프론트:
```bash
cd frontend
npm install
npm run dev
```

접속:
- 프론트: `http://localhost:5173`
- 백엔드 API: `http://localhost:8080/api/v1/health`

## Docker 실행 (분리 런타임)
```bash
docker compose up -d --build
```

구성:
- `backend` 컨테이너: Spring Boot API (`8080`)
- `frontend` 컨테이너: Nginx + React 정적 파일 (`8081`)

접속:
- 프론트: `http://localhost:8081/`
- 백엔드 API: `http://localhost:8080/api/v1/health`

중지:
```bash
docker compose down
```

## 환경 변수
- 프론트 빌드 시 API base URL:
- `VITE_API_BASE_URL` (기본값: `http://localhost:8080`)
- 예시: `frontend/.env.example`
