# hayoon monorepo

하윤 한글 학습앱의 통합 저장소입니다.

## 디렉터리 구조
```text
hayoon/
  front/                  # React + Vite
  back/                   # Spring Boot API
  docker-compose.yml      # 통합 실행
  .env.example
  README.md
  AGENTS.md
```

## 통합 실행
```bash
cp .env.example .env
docker compose up -d --build
```

접속:
- Frontend: `http://localhost:8081`
- Backend health: `http://localhost:8080/api/v1/health`

중지:
```bash
docker compose down
```

## 개별 개발
### Frontend
```bash
cd front
npm ci
npm run dev
```

### Backend
```bash
cd back
./gradlew bootRun
```

## 검증 명령
```bash
cd back && ./gradlew clean test
cd front && npm run build
```
