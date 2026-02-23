# Hayoon Hangul Kid

40개월 아이를 위한 한글 학습 웹앱 프로젝트입니다.

## 현재 구현 범위
- SPA 라우트: `/`, `/library`, `/letters`, `/learn/**` (React 진입점 `index.html`로 포워딩)
- 학습 플로우: `가~하` 전체 글자 선택 및 학습 가능
- 학습 카드: 같은 순회 내 단어 중복 없이 랜덤 노출, 순회 종료 후 재셔플
- 학습 상태 저장(localStorage):
- `hangulKid.v1.progress`: 글자별 `lastWordId`, `seenCount`, 마지막 진입 글자
- `hangulKid.v1.settings`: TTS 지원 여부
- 읽어주기(TTS): 학습 카드에서 `읽어주기` 버튼으로 수동 재생
- 백엔드 API:
- `GET /api/v1/cards`
- `GET /api/v1/cards/{id}`
- `GET /api/v1/letters`
- `GET /api/v1/letters/{key}/words`
- `GET /api/v1/health`

## 요구 환경
- Java 25
- Node.js + npm (로컬 통합 빌드 시)
- Docker / Docker Compose (컨테이너 실행 시)

## 로컬 실행 (프론트 통합 빌드)
```bash
./gradlew clean build
./gradlew bootRun
```

접속:
- `http://localhost:8080/`

사전 생성된 `frontend/dist`를 사용해 npm 단계를 건너뛰려면:
```bash
./gradlew bootJar -PskipFrontendNpm=true
```

## Docker 실행
```bash
docker compose up -d --build
```

Dockerfile은 Node(프론트 빌드) -> JDK(bootJar 빌드) -> JRE(런타임) 멀티 스테이지를 사용합니다.

접속:
- `http://localhost:8080/`

중지:
```bash
docker compose down
```

## Docker Hub 이미지 실행
Docker Hub에 배포된 이미지를 바로 실행할 수 있습니다.

- Repository: `yangyag2/hayoon-hangul-kid`
- 기본 태그: `latest`
- 고정 배포 태그(재현성): `55e8cea`

빠른 실행(`latest`):
```bash
docker pull yangyag2/hayoon-hangul-kid:latest
docker run --rm -d --name hangul-kid-hub -p 8080:8080 yangyag2/hayoon-hangul-kid:latest
curl -s http://localhost:8080/api/v1/health
docker stop hangul-kid-hub
```

고정 태그 실행(`55e8cea`):
```bash
docker pull yangyag2/hayoon-hangul-kid:55e8cea
docker run --rm -d --name hangul-kid-hub -p 8080:8080 yangyag2/hayoon-hangul-kid:55e8cea
curl -s http://localhost:8080/api/v1/health
docker stop hangul-kid-hub
```
