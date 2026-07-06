# 하윤(hayoon) 프로젝트 전체 개요

## 1. 프로젝트 목적
`hayoon`은 **하윤 한글 학습앱**의 통합 모노레포입니다. 아동을 대상으로 한글 글자(가, 나, 다 …)를 선택해 해당 글자로 시작하는 단어와 이미지를 보고, 브라우저 음성합성(TTS)으로 단어를 들으며 학습하는 웹 애플리케이션입니다. 프론트엔드(Vue 3.5 + Vite)와 백엔드(Spring Boot REST API)를 하나의 저장소에서 관리하며, Docker Compose 또는 `docker run`(EC2)으로 통합 배포합니다.

소스 패키지명은 `com.hayoon.hangulkid`이며, 백엔드 애플리케이션명은 `hangul-kid`입니다.

## 2. 기술 스택

### 프론트엔드 (`front/`)
- Vue 3.5 (Composition API + `<script setup>`)
- Vue Router 4 (SPA 라우팅)
- Vite 5.4 + `@vitejs/plugin-vue` (빌드/개발 서버)
- 빌드 산출물은 Nginx 1.27(alpine)로 정적 서빙
- 브라우저 Web Speech API(`SpeechSynthesisUtterance`) 기반 한국어 TTS, `localStorage` 기반 진행 상태 저장

### 백엔드 (`back/`)
- Spring Boot 3.5.11 (`spring-boot-starter-web`, `spring-boot-starter-validation`)
- Java toolchain 25, Gradle 빌드 (`build.gradle`, `gradlew`)
- 데이터는 DB 없이 코드/정적 리소스에 내장: 글자·단어 데이터는 `LetterService` 내 하드코딩, 카드 데이터는 `src/main/resources/cards/cards.json`, 이미지는 `src/main/resources/static/`에서 서빙

### 인프라
- 백엔드 빌드: `eclipse-temurin:25-jdk-jammy` → 런타임 `eclipse-temurin:25-jre-jammy`
- 프론트 빌드: `node:22-bookworm-slim` → 런타임 `nginx:1.27-alpine`
- Docker Hub 이미지: `yangyag2/hayoon-backend:latest`, `yangyag2/hayoon-frontend:latest`

## 3. 디렉터리 구조
```text
hayoon/
  front/                       # Vue + Vite 프론트엔드
    src/
      App.vue                  # <router-view/> 래퍼
      main.js
      router/index.js          # 라우트 정의 (vue-router)
      api.js                   # 백엔드 API 호출/정규화
      data/letterCatalog.js    # 글자 카탈로그(LETTERS)
      pages/
        WelcomePage.jsx
        LibraryPage.jsx
        LettersPage.jsx
        LearnPage.jsx          # /learn/:letterKey 학습 화면
      utils/
        tts.js                 # Web Speech API TTS
        progressStorage.js     # localStorage 진행/설정 저장
        shuffle.js
      styles.css
    index.html
    vite.config.js             # dev 포트 5173, /api → :8080 프록시
    nginx.conf                 # /api, /assets/words, /images/cards → hayoon-back:8080 프록시
    Dockerfile
  back/                        # Spring Boot API
    src/main/java/com/hayoon/hangulkid/
      HangulKidApplication.java
      card/                    # controller / dto / model / repository / service
      letter/                  # controller / dto / model / service
      common/
        web/                   # HealthController, WebConfig(CORS), GlobalExceptionHandler 등
        exception/CardNotFoundException.java
    src/main/resources/
      application.properties
      cards/cards.json
      static/assets/words/...   # 글자별 단어 이미지(png)
    build.gradle
    Dockerfile
  docker-compose.yml           # 통합 실행
  .env.example
  README.md
```

## 4. 주요 기능

### 프론트엔드 라우트 (`front/src/router/index.js`)
- `/` → `WelcomePage`
- `/library` → `LibraryPage`
- `/letters` → `LettersPage`
- `/learn/:letterKey` → `LearnPage`
- 그 외 경로는 `/`로 리다이렉트

### 클라이언트 동작
- `api.js`의 `getLetters()`가 `/api/v1/letters`를 호출하고, 로컬 `letterCatalog.js`의 `LETTERS`와 병합해 글자별 활성화 여부를 결정합니다. API에 없는 글자는 `enabled: false`로 표시됩니다.
- `getLetterWords(letterKey)`가 `/api/v1/letters/{key}/words`를 호출해 단어 목록과 이미지 URL을 가져옵니다. 상대 경로 이미지는 `VITE_API_BASE_URL` 기준으로 보정됩니다.
- TTS(`utils/tts.js`)는 `ko-KR` 음성을 우선 선택해 단어를 읽어줍니다.
- 진행 상태(`utils/progressStorage.js`)는 `localStorage` 키 `hangulKid.v1.progress`(마지막 글자, 글자별 마지막 단어/조회 횟수)와 `hangulKid.v1.settings`(TTS 지원 여부)에 저장됩니다.

### 백엔드 REST API (베이스: `/api/v1`)
- `GET /api/v1/health` — 상태 체크. `{ "status": "UP", "timestamp": ... }` 반환 (`HealthController`)
- `GET /api/v1/letters` — 글자 목록 (`LetterController`)
- `GET /api/v1/letters/{key}/words` — 특정 글자의 단어 목록 (`LetterController`)
- `GET /api/v1/cards?level={1..3}&limit={1..50}` — 카드 목록. `limit` 기본값 24, `level`은 선택 (`CardController`)
- `GET /api/v1/cards/{id}` — 단일 카드 (`CardController`)

글자/단어 데이터는 `LetterService`에 내장(예: `가`→ 가방/가위/가면/가구/가지, 이미지 경로 `/assets/words/ga/...`), 카드 데이터는 `cards/cards.json`(예: `사과`, `공`, `바나나`)에 정의됩니다. 단어 이미지는 `static/assets/words/<글자>/*.png`, 카드 이미지는 `/images/cards/*`로 서빙됩니다.

### CORS (`common/web/WebConfig.java`)
- `/api/**` 매핑에 대해 `GET` 메서드만 허용
- 허용 출처는 `app.cors.allowed-origins`(기본 `http://localhost:5173,http://localhost:8081`)로 설정. 환경변수 `APP_CORS_ALLOWED_ORIGINS`로 주입

## 5. 실행 방법

### 통합 실행 (Docker Compose)
```bash
cp .env.example .env
docker compose up -d --build
```
접속:
- 프론트엔드: `http://localhost:8081`
- 백엔드 헬스체크: `http://localhost:8080/api/v1/health`

중지:
```bash
docker compose down
```

`docker-compose.yml` 서비스:
- `back`(컨테이너 `hayoon-back`): 포트 `8080:8080`, 환경변수 `APP_CORS_ALLOWED_ORIGINS`
- `front`(컨테이너 `hayoon-front`): 포트 `8081:80`, 빌드 인자 `VITE_API_BASE_URL`, `back`에 의존

### 환경 변수 (`.env.example`)
- `VITE_API_BASE_URL=` — 프론트 빌드 시 API 베이스 URL(미설정 시 상대 경로 사용, Nginx 프록시 경유)
- `APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081`

### 개별 개발
프론트엔드:
```bash
cd front
npm ci
npm run dev      # http://localhost:5173, /api 요청은 :8080으로 프록시
```
백엔드:
```bash
cd back
./gradlew bootRun   # http://localhost:8080
```

### 검증 명령
```bash
cd back && ./gradlew clean test
cd front && npm run build
```

## 6. 배포 (EC2, `docker run` 단일 운영)
Docker Hub `latest` 이미지를 사용해 `hayoon-net` 네트워크 상에 front/back 컨테이너를 띄웁니다(상세 명령은 루트 `README.md` 참조). 핵심 사항:
- `hayoon-front`와 `hayoon-back`은 반드시 같은 Docker 네트워크(`hayoon-net`)에 있어야 합니다. 프론트 Nginx가 `/api/*`, `/assets/words/*`, `/images/cards/*`를 `hayoon-back:8080`으로 프록시하기 때문입니다.
- 실행 시 `APP_CORS_ALLOWED_ORIGINS`에 실제 EC2 퍼블릭 IP/도메인을 포함시켜야 합니다.
- AWS 보안그룹에서 `8081` 인바운드를 열어야 합니다(외부에서 백엔드 직접 접근이 불필요하면 `8080`은 닫아도 됨).

## 7. 참고 파일 경로 (절대 경로)
- `/home/yangyag/hayoon/README.md`
- `/home/yangyag/hayoon/docker-compose.yml`
- `/home/yangyag/hayoon/.env.example`
- `/home/yangyag/hayoon/front/vite.config.js`
- `/home/yangyag/hayoon/front/nginx.conf`
- `/home/yangyag/hayoon/front/src/App.vue`
- `/home/yangyag/hayoon/front/src/router/index.js`
- `/home/yangyag/hayoon/front/src/api.js`
- `/home/yangyag/hayoon/back/build.gradle`
- `/home/yangyag/hayoon/back/src/main/resources/application.properties`
- `/home/yangyag/hayoon/back/src/main/java/com/hayoon/hangulkid/letter/controller/LetterController.java`
- `/home/yangyag/hayoon/back/src/main/java/com/hayoon/hangulkid/card/controller/CardController.java`
- `/home/yangyag/hayoon/back/src/main/java/com/hayoon/hangulkid/common/web/HealthController.java`
- `/home/yangyag/hayoon/back/src/main/java/com/hayoon/hangulkid/common/web/WebConfig.java`
