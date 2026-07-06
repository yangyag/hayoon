# 개발 가이드 (development.md)

`hayoon` 모노레포는 한글 학습 애플리케이션으로, 백엔드(`back/`)와 프론트엔드(`front/`)로 구성됩니다. 이 문서는 로컬 개발 환경 셋업과 빌드/테스트 명령을 정리합니다.

## 1. 저장소 구조

```
/home/yangyag/hayoon
├── back/      Spring Boot 백엔드 (Gradle, 루트 프로젝트명: hangul-kid)
├── front/     Vue + Vite 프론트엔드 (hayoon-frontend)
├── docker-compose.yml
└── .env.example
```

## 2. 사전 요구사항

### 백엔드 (`back/`)
- `back/build.gradle` 기준
  - Spring Boot `3.5.11`
  - `io.spring.dependency-management` `1.1.7`
  - Java 툴체인: `JavaLanguageVersion.of(25)` (Java 25)
  - 빌드 도구: Gradle (Wrapper 포함: `back/gradlew`, `back/gradlew.bat`)
- 주요 의존성
  - `org.springframework.boot:spring-boot-starter-web`
  - `org.springframework.boot:spring-boot-starter-validation`
  - `org.springframework.boot:spring-boot-starter-test` (test)
  - `org.junit.platform:junit-platform-launcher` (testRuntimeOnly)
- 테스트 플랫폼: JUnit Platform (`useJUnitPlatform()`)

### 프론트엔드 (`front/`)
- `front/package.json` 기준
  - `vue` `^3.5.0`
  - `vue-router` `^4.4.0`
  - 빌드 도구: `vite` `^5.4.19`, `@vitejs/plugin-vue` `^5.1.0`
  - `type: module` (ESM)
- Node.js 및 npm 필요

## 3. 환경 변수

루트 `.env.example`:
```
VITE_API_BASE_URL=
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081
```

프론트 `front/.env.example`:
```
VITE_API_BASE_URL=http://localhost:8080
```

백엔드 `back/src/main/resources/application.properties`:
```
spring.application.name=hangul-kid
app.cors.allowed-origins=http://localhost:5173,http://localhost:8081
```

- `app.cors.allowed-origins`: 백엔드가 허용하는 CORS Origin 목록. 기본값으로 프론트 개발 서버(`http://localhost:5173`)가 포함되어 있습니다.
- `VITE_API_BASE_URL`: 프론트가 호출할 백엔드 API 베이스 URL.

## 4. 로컬 개발 셋업

### 4-1. 백엔드 실행

작업 디렉터리: `/home/yangyag/hayoon/back`

```bash
# 애플리케이션 실행 (개발 서버, 기본 포트 8080)
./gradlew bootRun

# 빌드 산출물(jar) 생성
./gradlew build

# 빌드된 jar 직접 실행 (예시)
java -jar build/libs/hangul-kid-0.0.1-SNAPSHOT.jar
```

- 애플리케이션 진입점: `back/src/main/java/com/hayoon/hangulkid/HangulKidApplication.java`
- 정적 자원: `back/src/main/resources/static/assets/words/...` (예: `/assets/words/ga/ga-bang.png`)
- 카드 데이터: `back/src/main/resources/cards/cards.json`

### 4-2. 프론트엔드 실행

작업 디렉터리: `/home/yangyag/hayoon/front`

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (vite, 포트 5173)
npm run dev

# 프로덕션 빌드 (dist/ 생성)
npm run build

# 빌드 결과 미리보기
npm run preview
```

`front/vite.config.js`에서 개발 서버 포트와 API 프록시가 설정되어 있습니다.

```js
server: {
  port: 5173,
  proxy: {
    "/api": "http://localhost:8080"
  }
}
```

- 개발 시 `/api`로 시작하는 요청은 `http://localhost:8080`(백엔드)으로 프록시됩니다. 따라서 프론트 개발 서버와 백엔드를 함께 띄우면 추가 CORS 설정 없이 연동됩니다.

### 4-3. 권장 실행 순서
1. 백엔드: `back/`에서 `./gradlew bootRun` (8080)
2. 프론트: `front/`에서 `npm install` 후 `npm run dev` (5173)
3. 브라우저에서 `http://localhost:5173` 접속

## 5. API 엔드포인트 (참고)

백엔드 컨트롤러 기준 (모두 `/api/v1` 하위):

| 메서드 | 경로 | 설명 | 정의 위치 |
|--------|------|------|-----------|
| GET | `/api/v1/health` | 헬스 체크 (`status`, `timestamp`) | `common/web/HealthController.java` |
| GET | `/api/v1/cards` | 카드 목록. 쿼리 파라미터 `level`(1~3), `limit`(1~50, 기본 24) | `card/controller/CardController.java` |
| GET | `/api/v1/cards/{id}` | 단일 카드 조회 | `card/controller/CardController.java` |
| GET | `/api/v1/letters` | 글자(자모) 목록 (14개) | `letter/controller/LetterController.java` |
| GET | `/api/v1/letters/{key}/words` | 특정 글자의 단어 목록 | `letter/controller/LetterController.java` |

- `level`은 `@Min(1) @Max(3)`, `limit`은 `@Min(1) @Max(50)`(기본값 `24`) 검증을 사용합니다. 범위 위반 시 `400 Bad Request`와 함께 코드 `INVALID_REQUEST`를 반환합니다.
- 존재하지 않는 카드/글자 키는 `404 Not Found`와 코드 `CARD_NOT_FOUND`를 반환합니다.
- 글자 키 목록: `ga, na, da, ra, ma, ba, sa, a, ja, cha, ka, ta, pa, ha` (각각 `가, 나, 다, ...`에 대응).

## 6. 테스트

### 6-1. 백엔드 테스트

테스트 코드 위치: `back/src/test/java/com/hayoon/hangulkid/`

- `card/controller/CardControllerTest.java`
- `letter/controller/LetterControllerTest.java`
- `common/web/HealthControllerTest.java`

모두 `@SpringBootTest` + `@AutoConfigureMockMvc` 기반의 컨트롤러 통합 테스트이며, `MockMvc`로 엔드포인트 응답을 검증합니다.

실행 명령 (작업 디렉터리 `/home/yangyag/hayoon/back`):

```bash
# 전체 테스트
./gradlew test

# 특정 테스트 클래스만 실행
./gradlew test --tests "com.hayoon.hangulkid.card.controller.CardControllerTest"

# 빌드 시 테스트 포함
./gradlew build
```

테스트가 검증하는 주요 동작 (코드 기준):
- `GET /api/v1/cards`는 기본적으로 24개 카드(`items.length()==24`, `total==24`)를 반환.
- `GET /api/v1/cards?level=1&limit=5`는 5개 반환, `total==8`, 첫 항목 `level==1`.
- `GET /api/v1/cards/card-apple`는 `word=="사과"`, `level==1`.
- 없는 카드 `GET /api/v1/cards/unknown-card`는 404 + `code=="CARD_NOT_FOUND"`.
- `level=9` 또는 `limit`이 `0`/`51`이면 400 + `code=="INVALID_REQUEST"` (`@ParameterizedTest` 사용).
- `GET /api/v1/letters`는 14개 글자, 각 항목 `key`/`label`/`enabled==true` 검증.
- `GET /api/v1/letters/{key}/words`는 각 글자당 5개 단어, `imageUrl`이 `/assets/words/{key}/`로 시작.
- `GET /api/v1/letters/unknown/words`는 404 + `code=="CARD_NOT_FOUND"`.
- `GET /api/v1/health`는 `status=="UP"`, `timestamp` 존재.

### 6-2. 프론트엔드 테스트

`front/package.json`의 `scripts`에는 별도의 테스트 스크립트가 정의되어 있지 않습니다. 현재 정의된 스크립트는 `dev`, `build`, `preview`뿐입니다.

## 7. 프론트엔드 소스 구성 (참고)

`front/src/`:
- `main.js`, `App.vue`, `router/index.js` — 앱 진입점/라우팅
- `api.js` — 백엔드 API 호출
- `pages/` — `WelcomePage.vue`, `LibraryPage.vue`, `LettersPage.vue`, `LearnPage.vue`
- `data/letterCatalog.js` — 글자 카탈로그 데이터
- `utils/` — `tts.js`(음성 합성), `shuffle.js`, `progressStorage.js`
- `styles.css`

## 8. 컨테이너 / 배포 (참고)

- 루트 `docker-compose.yml`, `back/Dockerfile`, `front/Dockerfile`, `front/nginx.conf`가 존재합니다. 컨테이너 기반 실행/배포 시 이 파일들을 사용합니다. (상세 배포 절차는 별도 문서/구성 참고)
