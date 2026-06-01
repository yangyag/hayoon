# Hayoon (한글 키즈) 시스템 아키텍처 문서

## 1. 개요

`hayoon`은 유아용 한글 학습 웹 애플리케이션으로, 단일 git 저장소(monorepo)에 프론트엔드(`front/`)와 백엔드(`back/`)를 함께 두는 구조다. 저장소 루트에는 `front/`, `back/`, `docker-compose.yml`, `README.md`가 있다.

- 프론트엔드: React 18 + React Router + Vite (SPA)
- 백엔드: Spring Boot (REST API + 정적 리소스 서빙)
- 학습 데이터: 백엔드 코드에 하드코딩된 글자/단어 목록(`LetterService`), 정적 이미지(`static/assets/words/...`), 카드 JSON(`cards/cards.json`)

핵심 사용자 흐름은 "환영 → 책장 → 글자 선택 → 글자별 단어 학습 카드(이미지 + TTS 읽어주기)"이며, 학습 진행 상태는 브라우저 `localStorage`에 저장된다.

---

## 2. 프론트엔드 (`front/`)

### 2.1 구성과 진입점

- 진입점: `front/src/main.jsx` — `BrowserRouter`로 `App`을 감싸 `#root`에 렌더링하고 `styles.css`를 로드한다(`React.StrictMode` 사용).
- 라우팅: `front/src/App.jsx` — `react-router-dom`의 `Routes`로 페이지를 구성한다.

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | `WelcomePage` | 환영 화면, "시작하기" 버튼 |
| `/library` | `LibraryPage` | 책장 화면, 책 카드 클릭 |
| `/letters` | `LettersPage` | 글자(가~하) 선택 그리드 |
| `/learn/:letterKey` | `LearnPage` | 글자별 단어 학습 카드 |
| `*` | `Navigate to="/"` | 그 외 경로는 `/`로 리다이렉트 |

- 빌드/개발: `front/vite.config.js` — 개발 서버 포트 `5173`, `/api` 요청을 `http://localhost:8080`(백엔드)으로 프록시한다. 그 외 루트 파일: `index.html`, `Dockerfile`, `nginx.conf`, `package.json`, `dist/`(빌드 산출물), `docs/`.

> **Docker 네트워크 참고:** `docker-compose.yml`에는 별도 네트워크를 지정하지 않으므로, Docker Compose가 자동으로 기본 네트워크(예: `hayoon_default`)를 생성하여 `hayoon-back`과 `hayoon-front` 컨테이너를 같은 네트워크에 둔다. `hayoon-net`이라는 이름의 네트워크는 EC2에서 `docker run` 방식으로 수동 배포할 때만 별도로 생성하는 것으로, Docker Compose 배포와는 무관하다.

### 2.2 페이지 (`front/src/pages/`)

- `WelcomePage.jsx`: 정적 화면. "시작하기" 클릭 시 `navigate("/library")`.
- `LibraryPage.jsx`: 정적 화면. 책 카드 클릭 시 `navigate("/letters")`. 상단에 "홈" 버튼(→ `/`).
- `LettersPage.jsx`: 마운트 시 `getLetters()`(api.js)로 글자 목록을 불러온다. 초기 상태는 `letterCatalog`의 `LETTERS`를 모두 `enabled:false`로 두고, 로드 성공 시 API 결과로 대체한다. 글자 버튼 클릭 시 `enabled`면 `navigate(/learn/{key})`, 아니면 "곧 열려요" 안내(1.4초 후 자동 해제). 로딩/에러 상태 텍스트를 표시한다.
- `LearnPage.jsx`: 가장 로직이 많은 페이지.
  - `useParams()`로 `letterKey`를 받고, `findLetterLabel()`로 라벨(예: `ga`→`가`)을 구한다.
  - 마운트 시 `isTtsSupported()` 확인 후 `saveTtsSupport()`로 설정 저장, 언마운트 시 `stopSpeaking()`.
  - `letterKey` 변경 시 `readLetterProgress()`로 저장된 진행 상태를 읽고 `saveLastLetterKey()` 호출 후 `getLetterWords(letterKey)`로 단어 목록을 로드한다.
  - 단어 순서는 `shuffle()`로 섞으며(`createShuffledOrder`), 직전 마지막 단어가 첫 카드로 다시 나오지 않도록 조정한다. 한 사이클 소진 시 재셔플(`drawNextWord`).
  - 인트로 카드("오늘의 글자")에서 글자 버튼을 누르면 `speakWord(letterLabel)`로 글자 발음. "다음" 버튼으로 단어 카드로 진입/넘김.
  - 단어 카드: 이미지(`imageUrl`, 실패 시 "이미지 준비 중" placeholder), 단어 텍스트(첫 글자 강조), "읽어주기" 버튼(`speakWord(word)`), 진행 표시 `seenCount / words.length`.
  - 진행 상태(`lastWordId`, `seenCount`)는 카드 변경 시 `saveLetterProgress()`로 저장한다.

### 2.3 API 계층 (`front/src/api.js`)

- `API_BASE_URL`은 `import.meta.env.VITE_API_BASE_URL`(없으면 빈 문자열, 즉 상대경로/프록시 사용).
- `fetchJson(url)`: `withApiBase()`로 베이스 URL을 합쳐 `fetch`, `Accept: application/json`. 비정상 응답 시 예외.
- `getLetters()`: `GET /api/v1/letters` 호출. 응답 배열을 `items`/`letters` 키 등에서 유연하게 추출(`readArray`), 각 항목의 `key/label/enabled`를 정규화(`normalizeEnabledFlag`로 `enabled/open/active/status` 다양한 형태 수용). 그 후 클라이언트 카탈로그 `LETTERS` 순서를 기준으로 병합하여, API에 없는 글자는 `enabled:false`로 둔다.
- `getLetterWords(letterKey)`: `GET /api/v1/letters/{key}/words` 호출. `key`는 `encodeURIComponent`. 응답에서 `word/label`, `imageUrl/imagePath/image`를 추출하고 `resolveImageUrl()`로 절대 URL화(상대 경로 `/...`면 API 베이스를 붙임).

### 2.4 데이터 카탈로그 (`front/src/data/letterCatalog.js`)

- `LETTERS`: `{ key, label }` 14개 배열 — `ga/na/da/ra/ma/ba/sa/a/ja/cha/ka/ta/pa/ha` (가~하). 프론트에서 표시 순서와 기본 라벨의 기준.
- `findLetterLabel(letterKey)`: key로 라벨 조회, 없으면 `"한글"`.

### 2.5 유틸리티 (`front/src/utils/`)

- `tts.js`: Web Speech API(`window.speechSynthesis`) 래퍼. `isTtsSupported()`, `stopSpeaking()`, `speakWord(word)`(언어 `ko-KR`, 한국어 음성 우선 선택 `pickVoice`).
- `shuffle.js`: `shuffle(items)` — Fisher–Yates 셔플(복사본 반환).
- `progressStorage.js`: `localStorage` 기반 영속화. 키 `hangulKid.v1.progress`(진행), `hangulKid.v1.settings`(설정), 스키마 버전 1. 진행 상태는 `{ version, lastLetterKey, byLetter:{ [key]: { lastWordId, seenCount } } }` 형태로 정규화/검증한다. 미래 버전·손상 데이터는 빈 기본값으로 폴백하며 스토리지 미지원/쿼터 오류를 안전하게 무시. 제공 함수: `readLetterProgress`, `saveLetterProgress`, `saveLastLetterKey`, `readSettingsState`, `saveTtsSupport` 등.

---

## 3. 백엔드 (`back/`)

Spring Boot 애플리케이션. 기본 패키지 `com.hayoon.hangulkid`, 진입점 `HangulKidApplication`(`@SpringBootApplication`). 설정 `application.properties`에 앱 이름 `hangul-kid`, CORS 허용 오리진 기본값 `http://localhost:5173,http://localhost:8081`.

패키지는 도메인별로 `card`, `letter`, `common` 세 갈래로 나뉜다. 계층 구성은 도메인마다 다르다: `card`는 `controller / service / repository / model / dto` 전 계층을 갖추고, `letter`는 별도 repository 없이 `controller / service / model / dto` 계층만 존재한다(`LetterService` 내 정적 목록으로 하드코딩).

### 3.1 letter 패키지 (학습 글자/단어)

프론트의 주 학습 흐름을 담당. 데이터는 **`LetterService` 내 하드코딩된 정적 목록**이다(DB·외부 저장소 없음).

계층:
- Controller: `letter/controller/LetterController.java` — `@RequestMapping("/api/v1/letters")`
  - `GET /api/v1/letters` → `letterService.findLetters()`
  - `GET /api/v1/letters/{key}/words` → `letterService.findWordsByKey(key)`
- Service: `letter/service/LetterService.java`
  - `LETTERS` 상수: 14개 글자(`ga`~`ha`), 모두 `enabled=true`, 각 글자당 단어 5개와 정적 이미지 경로(`/assets/words/{key}/...png`) 포함.
  - `findLetters()`: 모든 글자를 `LetterDto`로 매핑해 `LetterListResponse(items)` 반환.
  - `findWordsByKey(key)`: key 일치 + `enabled`인 글자를 찾고, 없으면 `CardNotFoundException(key)`. 해당 글자의 단어들을 `LetterWordDto`로 매핑해 `LetterWordListResponse(key, label, items)` 반환.
- Model(record): `letter/model/Letter.java`(`key, label, enabled, List<LetterWord>`), `letter/model/LetterWord.java`(`word, imageUrl`).
- DTO(record): `letter/dto/LetterDto`(`key,label,enabled`, `from(Letter)`), `letter/dto/LetterListResponse`(`items`), `letter/dto/LetterWordDto`(`word,imageUrl`, `from(LetterWord)`), `letter/dto/LetterWordListResponse`(`key,label,items`).

### 3.2 card 패키지 (카드 API)

JSON 파일 기반의 별도 카드 도메인. (현재 프론트 코드에서 직접 호출하는 부분은 확인되지 않으며 독립적인 REST 기능으로 존재한다.)

계층:
- Controller: `card/controller/CardController.java` — `@RequestMapping("/api/v1/cards")`, `@Validated`
  - `GET /api/v1/cards?level={1-3}&limit={1-50, 기본 24}` → `cardService.findCards(level, limit)` (`level`은 선택, `@Min/@Max` 검증)
  - `GET /api/v1/cards/{id}` → `cardService.findCardById(id)`
- Service: `card/service/CardService.java`
  - `findCards`: 레벨 필터(`level==null`이면 전체) → `level` 후 `word`로 정렬 → `limit` 적용 → `CardListResponse(items, total)`. `total`은 limit 적용 전 필터 결과 개수.
  - `findCardById`: id 일치 카드, 없으면 `CardNotFoundException(id)`.
- Repository: `card/repository/CardRepository.java` — 생성자에서 `ObjectMapper`로 클래스패스 리소스 `cards/cards.json`을 읽어 `List<Card>`로 보관(불변 복사). 로드 실패 시 `IllegalStateException`.
- Model(record): `card/model/Card.java`(`id, word, imageUrl, level, List<String> tags`).
- DTO(record): `card/dto/CardDto`(동일 필드 + `from(Card)`), `card/dto/CardListResponse`(`items, total`).

### 3.3 common 패키지 (공통 웹/예외)

- `common/web/HealthController.java` — `@RequestMapping("/api/v1")`, `GET /api/v1/health` → `HealthResponse("UP", now)`.
- `common/web/HealthResponse.java`(record `status, timestamp`).
- `common/web/WebConfig.java` — `WebMvcConfigurer` 구현. `/api/**` 경로에 CORS 매핑, 허용 오리진은 `app.cors.allowed-origins` 프로퍼티(기본 `http://localhost:5173,http://localhost:8081`), 허용 메서드 `GET`, 모든 헤더 허용.
- `common/web/GlobalExceptionHandler.java` — `@RestControllerAdvice`. 예외→상태/코드 매핑:
  - `CardNotFoundException` → 404 `CARD_NOT_FOUND`
  - `ConstraintViolationException` / `MethodArgumentNotValidException` / `MethodArgumentTypeMismatchException` / `HttpMessageNotReadableException` → 400 `INVALID_REQUEST`
  - `NoResourceFoundException` → 404 `NOT_FOUND`
  - 그 외 `Exception` → 500 `INTERNAL_ERROR`
  - 공통 본문 `ErrorResponse(code, message, timestamp, path)`.
- `common/web/ErrorResponse.java`(record `code, message, timestamp, path`).
- `common/exception/CardNotFoundException.java` — `RuntimeException`, 메시지 `"Card not found: {id}"`. (letter 도메인에서도 글자/단어 미존재 시 재사용.)

### 3.4 정적 리소스 (`back/src/main/resources/`)

- `static/assets/words/{글자}/*.png`: 학습 단어 이미지. 글자별 디렉터리(`ga, na, da, ra, ma, ba, sa, a, ja, cha, ka, ta, pa, ha`)에 단어당 PNG. `LetterService`의 `imageUrl`(`/assets/words/...`)이 이 정적 리소스로 서빙된다. 예: `static/assets/words/cha/cha-pyo.png`.
- `static/css/`: (현재 비어 있음.)
- `cards/cards.json`: `CardRepository`가 읽는 카드 데이터(24개 항목). 각 카드는 `id, word, imageUrl(/images/cards/*.svg), level, tags`. 참고로 카드 이미지가 가리키는 `/images/cards/*.svg` 경로의 정적 파일은 `static/` 트리에서 확인되지 않는다(존재 시 외부/다른 위치 서빙).
- `templates/`: (비어 있음 — 서버 사이드 템플릿 미사용, SPA + REST 구조.)

---

## 4. 데이터 흐름 (End-to-End)

1. 사용자가 SPA에서 `/letters` 진입 → `LettersPage`가 `getLetters()` 호출.
2. `getLetters()` → `GET /api/v1/letters` → `LetterController.getLetters()` → `LetterService.findLetters()` → `LetterListResponse(items)` 반환.
3. 프론트는 응답을 정규화 후 클라이언트 `LETTERS` 카탈로그와 병합하여 활성/비활성 글자 그리드를 그린다.
4. 활성 글자 클릭 → `/learn/{letterKey}` → `LearnPage`가 `getLetterWords(letterKey)` 호출.
5. `GET /api/v1/letters/{key}/words` → `LetterController.getWordsByLetter()` → `LetterService.findWordsByKey()`. 존재/활성 검증 실패 시 `CardNotFoundException` → `GlobalExceptionHandler`가 404 `CARD_NOT_FOUND` 반환.
6. 응답 단어의 `imageUrl`(`/assets/words/...png`)을 프론트가 절대 URL화하여 `<img>`로 표시. 이미지 자체는 백엔드 `static/assets/words/...`에서 서빙.
7. "읽어주기"/"오늘의 글자" 버튼은 서버를 거치지 않고 브라우저 Web Speech API(`tts.js`)로 음성 합성.
8. 학습 진행(`seenCount`, `lastWordId`, `lastLetterKey`)과 TTS 지원 여부는 `progressStorage.js`를 통해 브라우저 `localStorage`에 저장/복원.

카드 API(`/api/v1/cards`)는 위 학습 흐름과 별개로, `cards.json`을 데이터 소스로 하는 독립 조회 API다.

---

## 5. 계층 구조 요약

```
[브라우저 SPA]
 main.jsx → App(Routes) → pages → api.js(fetch)
                                  ↑ utils(tts/shuffle/progressStorage), data(letterCatalog)
        │ HTTP /api/v1/**  (개발 시 Vite 프록시 :5173 → :8080, CORS 허용)
        ▼
[Spring Boot :8080]
 controller → service → repository/정적목록 → model(record)
                              │
              ┌──────────────┼───────────────┐
        letter(하드코딩)   card(cards.json)   common(health/cors/예외)
                              │
        DTO(record) ←──── 변환(from) ──── model
        정적 리소스: static/assets/words/**, cards/cards.json
```

각 응답은 model record → DTO record로 변환(`from`)되어 클라이언트로 직렬화되며, 예외는 `GlobalExceptionHandler`에서 일관된 `ErrorResponse`로 변환된다.
