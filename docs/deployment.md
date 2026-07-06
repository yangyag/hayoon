# 배포 / 운영 문서 (deployment.md)

하윤 한글 학습앱(`hayoon` 모노레포)의 빌드/배포 절차, 환경변수, Docker 이미지, 포트, CORS 설정을 정리한 문서입니다. 본 문서는 다음 파일의 실제 내용에 근거합니다.

- `/home/yangyag/hayoon/docker-compose.yml`
- `/home/yangyag/hayoon/.env.example`
- `/home/yangyag/hayoon/README.md`
- `/home/yangyag/hayoon/front/docs/DEPLOY.md`
- `/home/yangyag/hayoon/back/Dockerfile`, `/home/yangyag/hayoon/front/Dockerfile`
- `/home/yangyag/hayoon/front/nginx.conf`
- `/home/yangyag/hayoon/back/src/main/java/com/hayoon/hangulkid/common/web/WebConfig.java`

---

## 1. 구성 개요

| 컴포넌트 | 기술 | 컨테이너명 | 내부 포트 | 호스트 매핑 포트 |
| --- | --- | --- | --- | --- |
| Frontend | Vue 3.5 + Vite, Nginx 1.27-alpine 정적 서빙 | `hayoon-front` | `80` | `8081` |
| Backend | Spring Boot API (Java/Temurin 25) | `hayoon-back` | `8080` | `8080` |

프론트 Nginx가 일부 경로를 백엔드 컨테이너로 리버스 프록시하므로, **두 컨테이너는 반드시 동일한 Docker 네트워크에 있어야** 합니다. 로컬 `docker compose` 실행 시에는 Docker Compose가 자동으로 기본 네트워크를 생성하여 두 컨테이너를 연결합니다. EC2에서 `docker run`으로 직접 실행할 경우에는 `hayoon-net`을 수동으로 생성해야 합니다.

---

## 2. Docker Hub 이미지

| 용도 | Repository | Tag |
| --- | --- | --- |
| Backend | `yangyag2/hayoon-backend` | `latest` |
| Frontend | `yangyag2/hayoon-frontend` | `latest` |

`latest` 단일 태그로 운영합니다 (`front/docs/DEPLOY.md` 기준 최신 안정본).

---

## 3. 빌드 (Dockerfile)

### Backend (`back/Dockerfile`)
- 멀티스테이지 빌드.
  - 빌드 스테이지: `eclipse-temurin:25-jdk-jammy`, `./gradlew clean bootJar --no-daemon`로 jar 생성.
  - 런타임 스테이지: `eclipse-temurin:25-jre-jammy`, `build/libs/*.jar`를 `app.jar`로 복사.
- `EXPOSE 8080`
- 실행: `ENTRYPOINT ["java", "-jar", "/app/app.jar"]`

### Frontend (`front/Dockerfile`)
- 멀티스테이지 빌드.
  - 빌드 스테이지: `node:22-bookworm-slim`, `npm ci` 후 `npm run build`.
  - 빌드 인자 `VITE_API_BASE_URL`(기본값 빈 값)을 환경변수로 주입하여 빌드.
  - 런타임 스테이지: `nginx:1.27-alpine`, `nginx.conf`를 `/etc/nginx/conf.d/default.conf`로, 빌드 산출물 `dist`를 `/usr/share/nginx/html`로 복사.
- `EXPOSE 80`
- 실행: `CMD ["nginx", "-g", "daemon off;"]`

### 프론트 단독 Build & Push (`front/docs/DEPLOY.md`)
```bash
cd front
docker build -t yangyag2/hayoon-frontend:latest .
docker push yangyag2/hayoon-frontend:latest
```

---

## 4. 환경변수

### 루트 `.env.example`
```env
VITE_API_BASE_URL=
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081
```

| 변수 | 사용처 | 기본값 / 설명 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 프론트 빌드 타임 인자 | 기본 빈 값. 비어 있으면 프론트는 상대 경로(`/api/*`)를 사용. compose에서 build arg로 전달(`${VITE_API_BASE_URL:-}`) |
| `APP_CORS_ALLOWED_ORIGINS` | 백엔드 런타임 환경변수 | 기본 `http://localhost:5173,http://localhost:8081`. compose에서 `${APP_CORS_ALLOWED_ORIGINS:-http://localhost:5173,http://localhost:8081}`로 주입 |

참고: `front/.env.example`은 로컬 개발용으로 `VITE_API_BASE_URL=http://localhost:8080`을 가지며, 루트 통합 실행값(빈 값, 상대 경로)과 다릅니다.

백엔드 기본값은 `back/src/main/resources/application.properties`의 `app.cors.allowed-origins=http://localhost:5173,http://localhost:8081`에도 정의되어 있습니다.

---

## 5. CORS 설정

`back/src/main/java/com/hayoon/hangulkid/common/web/WebConfig.java`:
- 매핑 경로: `/api/**`
- 허용 Origin: `app.cors.allowed-origins` 프로퍼티(= 환경변수 `APP_CORS_ALLOWED_ORIGINS`) 값 목록. 미설정 시 `http://localhost:5173,http://localhost:8081`.
- 허용 메서드: `GET` (만)
- 허용 헤더: `*`

EC2 운영 시 `APP_CORS_ALLOWED_ORIGINS`에 실제 퍼블릭 IP/도메인 기반의 프론트 Origin을 포함해야 합니다.

---

## 6. Nginx 프록시 (`front/nginx.conf`)

Nginx(포트 80)는 다음 경로를 백엔드 컨테이너 `http://hayoon-back:8080`으로 프록시합니다.
- `/api/`
- `/assets/words/`
- `/images/cards/`

그 외 경로는 SPA 라우팅을 위해 `try_files $uri $uri/ /index.html` 처리. `proxy_pass` 대상이 `hayoon-back`이므로 동일 Docker 네트워크 연결이 필수입니다.

---

## 7. 로컬 통합 실행 (docker compose)

`README.md` / 루트 `docker-compose.yml` 기준:
```bash
cp .env.example .env
docker compose up -d --build
```

`docker-compose.yml` 핵심:
- `back`: `./back` 빌드, `APP_CORS_ALLOWED_ORIGINS` 환경변수 주입, 포트 `8080:8080`, `restart: unless-stopped`
- `front`: `./front` 빌드(build arg `VITE_API_BASE_URL`), 포트 `8081:80`, `depends_on: back`, `restart: unless-stopped`
- 네트워크: Docker Compose가 자동으로 기본 네트워크를 생성하여 `back`과 `front` 컨테이너를 연결합니다. `hayoon-net`을 별도로 생성할 필요 없습니다.

접속:
- Frontend: `http://localhost:8081`
- Backend health: `http://localhost:8080/api/v1/health`

중지:
```bash
docker compose down
```

> 참고: `back/docker-compose.yml`은 백엔드 단독 실행용으로 컨테이너명이 `hangul-backend`(통합용 `hayoon-back`과 다름)이며 포트 `8080:8080`만 노출합니다.

---

## 8. EC2 배포/이미지 업데이트 절차 (`docker run`, `latest` 단일 운영)

`README.md` 기준. 예시 퍼블릭 IP `43.202.113.123`:
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

필수 확인 사항:
- `APP_CORS_ALLOWED_ORIGINS`의 `43.202.113.123`을 실제 EC2 퍼블릭 IP(또는 도메인)로 변경.
- `hayoon-front`, `hayoon-back`이 같은 Docker 네트워크(`hayoon-net`)에 있어야 함. EC2 `docker run` 방식에서는 `hayoon-net`을 위와 같이 수동으로 생성해야 합니다.
- AWS 보안그룹에서 `8081` 인바운드 오픈. 백엔드 외부 직접 접근이 불필요하면 `8080`은 닫아도 됨(프론트 Nginx가 내부 네트워크로 프록시하므로).

빠른 검증:
```bash
docker ps
curl http://localhost:8080/api/v1/health  # 8080을 보안그룹에서 닫은 경우 EC2 내부에서 localhost로만 접근 가능
```

접속:
- Frontend: `http://43.202.113.123:8081`
- Backend health: `http://43.202.113.123:8080/api/v1/health`

### 프론트 단독 Runtime (`front/docs/DEPLOY.md`)
```bash
docker run --rm --name hayoon-front --network hayoon-net -p 8081:80 \
  yangyag2/hayoon-frontend:latest
```

---

## 9. 검증 명령 (`README.md`)
```bash
cd back && ./gradlew clean test
cd front && npm run build  # 프론트엔드는 별도 테스트 스크립트가 없으므로 빌드 성공으로 검증
```

개별 개발 실행:
- Frontend: `cd front && npm ci && npm run dev`
- Backend: `cd back && ./gradlew bootRun`
