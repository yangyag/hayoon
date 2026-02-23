# hayoon monorepo

하윤 한글 학습앱의 단일 저장소(monorepo)입니다.

## 구조
```text
hayoon/
  front/   # React + Vite
  back/    # Spring Boot API
```

## 실행
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
```bash
cd front && npm ci && npm run dev
cd back && ./gradlew bootRun
```
