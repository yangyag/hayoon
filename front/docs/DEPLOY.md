# Deploy Guide

## Environment
- `VITE_API_BASE_URL`: 프론트가 호출할 백엔드 API 베이스 URL

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
  - `<git-sha>` (재현성/롤백용)

## 프론트 단독 Build & Push
```bash
cd front
docker build -t yangyag2/hayoon-frontend:latest .
docker tag yangyag2/hayoon-frontend:latest yangyag2/hayoon-frontend:<git-sha>
docker push yangyag2/hayoon-frontend:latest
docker push yangyag2/hayoon-frontend:<git-sha>
```

## 프론트 단독 Runtime
```bash
cd front
docker run --rm -p 8081:80 yangyag2/hayoon-frontend:latest
```
