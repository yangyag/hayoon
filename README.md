# Hayoon Hangul Kid

40개월 아이를 위한 한글 학습 웹앱 프로젝트입니다.

## 현재 구현 범위
- 환영 화면: `하윤이 환영해~`
- `시작하기` 버튼 클릭 시 책장 화면(`/library`) 이동
- 책장 화면에 `가나다 한글` 1권 placeholder 표시
- 백엔드 API:
- `GET /api/v1/cards`
- `GET /api/v1/cards/{id}`
- `GET /api/v1/health`

## 로컬 실행
```bash
./gradlew bootRun
```

접속:
- `http://localhost:8080/`

## Docker 실행
```bash
docker compose up -d --build
```

접속:
- `http://localhost:8080/`

중지:
```bash
docker compose down
```
