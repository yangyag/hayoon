# hayoon monorepo

하윤 한글 학습앱의 통합 저장소입니다.

## 디렉터리 구조
```text
hayoon/
  front/                  # Vue + Vite
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

## EC2 이미지 업데이트 절차 (`docker run`, `latest` 단일 운영)
Docker Hub `latest` 이미지가 갱신되면 아래 명령만 수행하면 됩니다.
퍼블릭 IP가 `43.202.113.123`인 경우 예시:

```bash
docker network create hayoon-net || true

docker pull yangyag2/hayoon-backend:latest
docker pull yangyag2/hayoon-frontend:latest

docker rm -f hayoon-front hayoon-back 2>/dev/null || true

docker run -d --name hayoon-back --restart unless-stopped \
  --network hayoon-net \
  -p 8080:8080 \
  -e APP_CORS_ALLOWED_ORIGINS="http://43.202.113.123:8081,http://localhost:8081" \
  yangyag2/hayoon-backend:latest

docker run -d --name hayoon-front --restart unless-stopped \
  --network hayoon-net \
  -p 8081:80 \
  yangyag2/hayoon-frontend:latest
```

필수 확인:
- `APP_CORS_ALLOWED_ORIGINS`의 `43.202.113.123`을 실제 EC2 퍼블릭 IP(또는 도메인)로 바꿔서 실행
- `hayoon-front`, `hayoon-back`이 같은 Docker 네트워크(`hayoon-net`)에 있어야 함
- AWS 보안그룹에서 `8081` 인바운드 오픈 (백엔드 외부 직접 접근 필요 없으면 `8080`은 닫아도 됨)

빠른 검증:
```bash
docker ps
curl http://localhost:8080/api/v1/health
```

접속:
- Frontend: `http://43.202.113.123:8081`
- Backend health: `http://43.202.113.123:8080/api/v1/health`

주의:
- 프론트 Nginx가 `/api/*`, `/assets/words/*`, `/images/cards/*`를 `hayoon-back:8080`으로 프록시합니다.
- 따라서 front/back 컨테이너는 반드시 같은 Docker 네트워크(`hayoon-net`)에 있어야 합니다.

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
