# Frontend (`front/`)

하윤 한글 학습앱 프론트엔드 모듈입니다. 이 디렉터리는 `hayoon` monorepo의 일부입니다.

## 기술 스택
- React 18
- Vite 5
- Nginx (정적 서빙)

## 로컬 개발
```bash
cd front
npm ci
npm run dev
```

기본 접속:
- `http://localhost:5173`

## API 연동
- 환경 변수: `VITE_API_BASE_URL`
- 기본값: `http://localhost:8080`
- 예시 파일: `front/.env.example`
- monorepo 백엔드 위치: `back/`

## 프로덕션 빌드
```bash
cd front
npm run build
```

## Docker 실행 (프론트 단독)
```bash
cd front
docker build -t yangyag2/hayoon-frontend:local .
docker run --rm -p 8081:80 yangyag2/hayoon-frontend:local
```

접속:
- `http://localhost:8081`

## 통합 실행 (권장)
루트에서 프론트/백엔드를 함께 실행합니다.
```bash
cd ..
docker compose up -d --build
```

## 연동 API
- `GET /api/v1/health`
- `GET /api/v1/letters`
- `GET /api/v1/letters/{key}/words`
- `GET /api/v1/cards`
- `GET /api/v1/cards/{id}`
