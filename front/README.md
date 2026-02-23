# hayoon_front

하윤 한글 학습앱 프론트엔드 저장소입니다.

## 기술 스택
- React 18
- Vite 5
- Nginx (정적 서빙)

## 로컬 개발
```bash
npm install
npm run dev
```

기본 접속:
- http://localhost:5173

## API 연동
- 환경 변수: `VITE_API_BASE_URL`
- 기본값: `http://localhost:8080`
- 예시 파일: `.env.example`

## 프로덕션 빌드
```bash
npm run build
```

## Docker 실행
```bash
docker build -t yangyag2/hayoon-frontend:local .
docker run --rm -p 8081:80 yangyag2/hayoon-frontend:local
```

접속:
- http://localhost:8081

## 관련 백엔드 API
백엔드 저장소(`hayoon`, 추후 `hayoon_back`)가 아래 API를 제공합니다.
- `GET /api/v1/health`
- `GET /api/v1/letters`
- `GET /api/v1/letters/{key}/words`
- `GET /api/v1/cards`
- `GET /api/v1/cards/{id}`
