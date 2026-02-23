# Backend (`back/`)

하윤 한글 학습앱 백엔드 모듈입니다. 이 디렉터리는 `hayoon` monorepo의 일부입니다.

## 역할
- REST API 제공
- 단어 이미지 정적 리소스 제공 (`/assets/words/**`)
- 백엔드 API 테스트(JUnit/MockMvc) 제공

## API
- `GET /api/v1/health`
- `GET /api/v1/cards`
- `GET /api/v1/cards/{id}`
- `GET /api/v1/letters`
- `GET /api/v1/letters/{key}/words`

## 요구 환경
- Java 25
- Docker / Docker Compose

## 로컬 실행
```bash
cd back
./gradlew clean build
./gradlew bootRun
```

접속:
- Health: `http://localhost:8080/api/v1/health`

## 통합 Docker 실행 (권장)
루트에서 front/back를 함께 기동:
```bash
docker compose up -d --build
```

## 백엔드 단독 Docker 실행
```bash
cd back
docker build -t yangyag2/hayoon-backend:local .
docker run --rm -p 8080:8080 yangyag2/hayoon-backend:local
```

## CORS
- 기본 허용 Origin:
  - `http://localhost:5173`
  - `http://localhost:8081`
- 설정 키: `app.cors.allowed-origins`
