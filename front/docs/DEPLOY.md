# Deploy Guide

## Environment
- 기본값은 빈 값이며, 프론트는 상대 경로(`/api/*`)를 사용합니다.

## Monorepo 실행 (권장)
루트에서 front/back를 함께 실행:
```bash
cp .env.example .env
docker compose up -d --build
```

## 프론트 단독 이미지 정책
- Repository: `yangyag2/hayoon-frontend`
- Tags:
  - `latest` (최신 안정본)

## 프론트 단독 Build & Push
```bash
cd front
docker build -t yangyag2/hayoon-frontend:latest .
docker push yangyag2/hayoon-frontend:latest
```

## 프론트 단독 Runtime
```bash
docker run --rm --name hayoon-front --network hayoon-net -p 8081:80 \
  yangyag2/hayoon-frontend:latest
```

## Runtime 주의사항
- Nginx가 아래 경로를 백엔드 컨테이너 `hayoon-back:8080`으로 프록시합니다.
  - `/api/*`
  - `/assets/words/*`
  - `/images/cards/*`
- 따라서 `hayoon-front`와 `hayoon-back`은 동일한 Docker 네트워크(예: `hayoon-net`)에 있어야 합니다.
