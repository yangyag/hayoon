# hayoon (Backend)

하윤 한글 학습앱의 Spring Boot 백엔드 저장소입니다.

## Frontend Repository
- 프론트엔드는 별도 저장소로 이관되었습니다.
- Repo: `git@github.com:yangyag/hayoon_front.git`

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
./gradlew clean build
./gradlew bootRun
```

접속:
- Health: `http://localhost:8080/api/v1/health`

## Docker 실행 (Backend only)
```bash
docker compose up -d --build
```

접속:
- API: `http://localhost:8080/api/v1/health`

중지:
```bash
docker compose down
```

## CORS
- 기본 허용 Origin:
- `http://localhost:5173`
- `http://localhost:8081`
- 설정 키:
- `app.cors.allowed-origins`
