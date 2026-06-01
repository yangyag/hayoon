# hayoon 프론트엔드 문서 (frontend.md)

어린이용 한글 학습 SPA. React 18 + React Router v6 + Vite 기반의 단일 페이지 애플리케이션입니다. 백엔드에서 글자 목록과 단어를 받아오고, 브라우저 음성 합성(TTS)으로 단어/글자를 읽어주며, 학습 진행도를 `localStorage`에 저장합니다.

## 1. 기술 스택 및 빌드 (`front/package.json`, `front/vite.config.js`)

- `name`: `hayoon-frontend`, `type`: `module`, `version`: `0.1.0`
- 의존성
  - `react` `^18.3.1`, `react-dom` `^18.3.1`
  - `react-router-dom` `^6.30.1`
- 개발 의존성
  - `vite` `^5.4.19`, `@vitejs/plugin-react` `^4.4.1`
- npm 스크립트
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`
- Vite 설정 (`vite.config.js`)
  - `plugins: [react()]`
  - 개발 서버 포트 `5173`
  - 프록시: `"/api"` → `http://localhost:8080` (로컬 개발 시 백엔드로 API 프록시)

## 2. 진입점 (`front/src/main.jsx`)

- `ReactDOM.createRoot(document.getElementById("root"))`로 마운트
- `<React.StrictMode>` 안에 `<BrowserRouter>`로 `<App />`을 감싼다 (HTML5 history 기반 라우팅)
- 전역 스타일 `./styles.css` import

## 3. 라우팅 (`front/src/App.jsx`)

`<Routes>`로 다음 경로를 정의하고, 전체를 `div.app-shell`로 감싼다.

| 경로 | 컴포넌트 | 설명 |
| --- | --- | --- |
| `/` | `WelcomePage` | 시작(환영) 화면 |
| `/library` | `LibraryPage` | 책장 화면 |
| `/letters` | `LettersPage` | 글자 선택 화면 |
| `/learn/:letterKey` | `LearnPage` | 글자별 단어 학습 화면 (URL 파라미터 `letterKey`) |
| `*` | `<Navigate to="/" replace />` | 매칭되지 않는 경로는 홈으로 리다이렉트 |

화면 이동 흐름: `/` → `/library` → `/letters` → `/learn/:letterKey`

## 4. 페이지별 기능

### 4.1 WelcomePage (`front/src/pages/WelcomePage.jsx`)

- 환영 문구("하윤이 환영해~")와 배경 장식 bg-orb 3개(orb-a, orb-b, orb-c) 표시
- "시작하기" 버튼 클릭 시 `navigate("/library")`

### 4.2 LibraryPage (`front/src/pages/LibraryPage.jsx`)

- 상단 내비게이션에 "홈" 버튼(`navigate("/")`)
- "가나다 한글" 책 카드(`book-card`) 클릭 시 `navigate("/letters")`
- 현재 책은 하나만 하드코딩되어 있음("가나다 한글")

### 4.3 LettersPage (`front/src/pages/LettersPage.jsx`)

글자 선택 그리드. 백엔드의 활성화 여부를 반영한다.

- 초기 상태: `LETTERS`(카탈로그 14개)를 전부 `enabled: false`로 세팅
- 마운트 시 `useEffect`에서 `getLetters()` 호출하여 목록 갱신
  - 로딩 중 `loading` true → "글자를 불러오는 중..." 표시
  - 실패 시 `error`에 "글자 목록을 불러오지 못했어요." 설정하고 모든 글자를 `enabled: false`로 복원
  - `active` 플래그로 언마운트 후 setState 방지(cleanup에서 `active = false`)
- 글자 버튼 클릭(`handleLetterClick`)
  - `letter.enabled === true`면 `` navigate(`/learn/${letter.key}`) ``로 이동
  - 비활성(잠금)이면 `showSoonMessage()`로 "곧 열려요" 안내를 1400ms 동안 표시(`noticeTimeoutRef`로 타이머 관리, cleanup 시 `clearTimeout`)
- 버튼 클래스는 `enabled`/`locked`로 분기, `aria-disabled={!letter.enabled}`
- 상단에 "뒤로"(→ `/library`), "홈"(→ `/`) 버튼

### 4.4 LearnPage (`front/src/pages/LearnPage.jsx`)

핵심 학습 화면. URL의 `letterKey`로 해당 글자의 단어들을 불러와 셔플 순서로 한 장씩 보여준다.

- `useParams()`로 `letterKey` 취득, 기본값 `""`
- `findLetterLabel(letterKey)`로 표시용 라벨 계산(`useMemo`)
- 주요 상태: `words`, `loading`, `error`, `showIntro`, `imageFailed`, `cycle`, `ttsSupported`, `ttsNotice`

#### 사이클(cycle) 모델

`EMPTY_CYCLE = { order, cursor, current, lastWordId, seenCount }`

- `createShuffledOrder(sourceWords, lastWordId)`: `shuffle`로 섞은 뒤, 첫 단어가 직전 마지막 단어(`lastWordId`)와 같으면 두 번째 단어와 교환하여 연속 중복을 피함
- `buildInitialCycle(words, savedProgress)`: 저장된 `lastWordId`가 현재 단어 목록에 존재할 때만 이어서 사용하고, `seenCount`는 `0 ~ words.length` 범위로 클램프
- `drawNextWord()`(`useCallback`): `order`가 비었거나 `cursor`가 끝에 도달하면 새로 셔플하고 `cursor=0`. 다음 단어 선택 후 `cursor+1`, `seenCount`는 `(seenCount % words.length) + 1`로 순환 카운트

#### 라이프사이클 / 부수효과

- 마운트 시: `isTtsSupported()` 결과를 `ttsSupported` 상태와 `saveTtsSupport()`로 저장. 언마운트 시 `stopSpeaking()`
- `letterKey` 변경 시: `readLetterProgress(letterKey)`로 저장된 진행도 읽고 `saveLastLetterKey(letterKey)` 기록 후 `getLetterWords(letterKey)` 호출
  - 로딩 중 '학습 카드를 준비하는 중...' 메시지 표시
  - 성공: `setWords(items)` + `buildInitialCycle`로 사이클 초기화
  - 실패: `words=[]`, `error="단어를 불러오지 못했어요."`
- `cycle.current?.id` 변경 시 `imageFailed`를 `false`로 리셋
- 인트로가 아니고 현재 단어가 있고 에러가 없을 때 `saveLetterProgress(letterKey, { lastWordId, seenCount })`로 진행도 저장

#### 화면 구성

- 인트로 카드(`showIntro` true): "오늘의 글자" + 큰 글자 버튼. 버튼 클릭 시 `handleSpeakLetter()`로 글자 라벨을 TTS로 읽음
- 단어 카드(`showIntro` false):
  - 이미지(`currentWord.imageUrl`). 로드 실패 시 `onError`로 `imageFailed=true`가 되어 "이미지 준비 중" 플레이스홀더 표시
  - 단어 텍스트: `renderWord`가 첫 글자만 `<strong>`으로 강조
  - "읽어주기" 버튼(`handleSpeak`): `speakWord(현재 단어)` 실행. TTS 미지원 또는 단어 없음이면 `disabled`
  - 진행 표시 `{cycle.seenCount} / {words.length}`
- "다음" 버튼(`handleNext`): `stopSpeaking()` 후 인트로면 인트로를 닫고 첫 단어를 뽑고, 아니면 다음 단어를 뽑음. 로딩/에러/단어 0개면 `disabled`
- 단어가 0개면 "아직 단어가 없어요." 표시
- TTS 미지원 시 "이 브라우저는 읽어주기를 지원하지 않아요." 안내, 호출 실패 시 `ttsNotice`("읽어주기를 사용할 수 없어요.")
- 상단에 "뒤로"(→ `/letters`), "홈"(→ `/`) 버튼

## 5. 글자 카탈로그 (`front/src/data/letterCatalog.js`)

- `LETTERS`: 가~하 14개 항목. 각 항목 `{ key, label }`
  - `ga/가`, `na/나`, `da/다`, `ra/라`, `ma/마`, `ba/바`, `sa/사`, `a/아`, `ja/자`, `cha/차`, `ka/카`, `ta/타`, `pa/파`, `ha/하`
- `findLetterLabel(letterKey)`: 매칭 라벨 반환, 없으면 `"한글"`
- 역할: 프론트의 글자 화이트리스트이자 표시 순서의 기준. API 응답은 이 목록을 기준으로 병합/필터됨(아래 6장 참고)

## 6. API 연동 (`front/src/api.js`)

- `API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "")` — 환경변수 `VITE_API_BASE_URL`로 베이스 URL 설정, 끝의 슬래시 제거. 미설정 시 빈 문자열(상대경로 사용 → Vite 프록시/같은 호스트)
- `withApiBase(path)`: 베이스가 있고 `path`가 http/https로 시작하지 않으면 앞에 베이스 붙임
- `fetchJson(url)`: `fetch(withApiBase(url), { headers: { Accept: "application/json" } })`. `response.ok`가 아니면 `Request failed: <status>` 에러 throw, 아니면 `response.json()`
- `readArray(payload, candidates)`: payload가 배열이면 그대로, 아니면 후보 키들 중 첫 배열을 반환(없으면 `[]`)
- `normalizeEnabledFlag(item)`: `enabled`/`open`/`active`(boolean) 또는 `status`(문자열 `enabled`/`open`/`active`)로 활성 여부 판정. 모두 없으면 기본 `true`
- `resolveImageUrl(imageUrl)`: 절대 URL이면 그대로, `/`로 시작하면 `withApiBase`로 절대화, 그 외엔 trim() 처리된 값 반환(빈 값은 `""`)

### 엔드포인트

#### `getLetters()` — `GET /api/v1/letters`

- 응답 배열을 `["items", "letters"]` 키로 추출
- 각 항목을 `{ key, label, enabled }`로 정규화. `key`는 `key | id | letterKey`, `label`은 `label | letter | character`에서 취함. key가 빈 항목은 제외
- 정규화 결과를 `key` 기준 Map으로 만든 뒤, **`LETTERS` 순서를 기준으로 병합**:
  - API에 없는 글자는 `enabled: false`
  - 있는 글자는 `label`은 API 우선(없으면 카탈로그), `enabled`는 API 값
- 즉 화면에 노출되는 글자 집합/순서는 항상 카탈로그 14개로 고정되고, 활성 여부만 백엔드가 제어

#### `getLetterWords(letterKey)` — `GET /api/v1/letters/{letterKey}/words`

- `letterKey`는 `encodeURIComponent`로 인코딩
- 응답 배열을 `readArray(payload, ["items", "words"])`로 추출
- 각 항목을 `{ id, word, imageUrl }`로 정규화
  - `id`: `id` 없으면 `${letterKey}-${index}`
  - `word`: `word | label`
  - `imageUrl`: `imageUrl | imagePath | image`를 `resolveImageUrl`로 정규화
- `word`가 빈 항목은 제외

## 7. TTS (음성 합성) (`front/src/utils/tts.js`)

브라우저 Web Speech API(`window.speechSynthesis`) 사용. 언어는 `ko-KR`.

- `getSynthesis()`: `window.speechSynthesis` 반환(없으면 null, SSR 가드 포함)
- `isTtsSupported()`: `window`, `SpeechSynthesisUtterance`, `speechSynthesis`가 모두 있어야 true
- `pickVoice(voices)`: `lang`이 `ko-KR`인 음성 우선, 없으면 `ko`로 시작하는 음성, 없으면 null
- `stopSpeaking()`: `synthesis.cancel()`
- `speakWord(word)`:
  - 미지원이거나 빈 문자열이면 `false` 반환
  - `SpeechSynthesisUtterance` 생성, `lang = ko-KR`, 한국어 음성이 있으면 지정
  - 기존 발화 `cancel()` 후 `speak()`, 성공 시 `true`
- LearnPage는 이 반환값으로 실패 시 안내문(`ttsNotice`)을 표시

## 8. 진행도/설정 저장 (`front/src/utils/progressStorage.js`)

`localStorage` 기반. 키와 스키마 버전이 고정되어 있다.

- 저장 키
  - 진행도: `hangulKid.v1.progress` (localStorage 키: `"hangulKid.v1.progress"`)
  - 설정: `hangulKid.v1.settings` (localStorage 키: `"hangulKid.v1.settings"`)
  - `SCHEMA_VERSION = 1`
- 가드/방어 로직
  - `isStorageAvailable()`로 `window.localStorage` 존재 확인
  - 읽기/쓰기/JSON 파싱 모두 try/catch로 감싸 quota·프라이버시 모드 실패 시 무시(읽을 때는 기본값 반환)
  - 저장 데이터의 `version`이 현재 스키마보다 크면(미래 버전) 빈 기본값으로 리셋
  - `seenCount`는 `toNonNegativeInteger`로 0 이상 정수 보정, `lastWordId`는 비어 있으면 `null`

### 진행도 스키마

```
{ version: 1, lastLetterKey: "", byLetter: { [letterKey]: { lastWordId, seenCount } } }
```

- `readProgressState()` / `writeProgressState(progress)`: 전체 상태 읽기/쓰기(정규화 포함)
- `readLetterProgress(letterKey)`: 특정 글자의 `{ lastWordId, seenCount }` 반환(없으면 빈 엔트리)
- `saveLetterProgress(letterKey, entry)`: 해당 글자 엔트리 갱신 + `lastLetterKey`도 갱신
- `saveLastLetterKey(letterKey)`: 마지막 글자만 갱신(동일하면 쓰기 생략)

### 설정 스키마

```
{ version: 1, ttsSupported: null | boolean }
```

- `readSettingsState()` / `writeSettingsState(settings)`: 전체 설정 읽기/쓰기(정규화 포함)
- `saveTtsSupport(ttsSupported)`: `ttsSupported`를 boolean으로 저장(LearnPage 마운트 시 호출)

## 9. 셔플 유틸 (`front/src/utils/shuffle.js`)

- `shuffle(items)`: 원본을 복사 후 Fisher–Yates로 인플레이스 셔플하여 새 배열 반환(원본 불변)
- LearnPage의 단어 출제 순서 생성에 사용

## 10. 데이터 흐름 요약

1. `/letters` 진입 → `getLetters()`로 백엔드 활성 글자 조회 → 카탈로그 14개에 병합해 활성/잠금 그리드 렌더
2. 활성 글자 클릭 → `/learn/:letterKey` 이동
3. LearnPage 진입 → 저장된 진행도(`readLetterProgress`) 로드 + `getLetterWords(letterKey)`로 단어 조회
4. "다음"마다 셔플 순서로 단어 출제(직전 단어 연속 회피), 진행도(`lastWordId`, `seenCount`)를 `localStorage`에 저장
5. "읽어주기"/글자 버튼으로 `ko-KR` TTS 발화

## 11. 관련 파일 경로

- `/home/yangyag/hayoon/front/src/main.jsx`
- `/home/yangyag/hayoon/front/src/App.jsx`
- `/home/yangyag/hayoon/front/src/api.js`
- `/home/yangyag/hayoon/front/src/pages/WelcomePage.jsx`
- `/home/yangyag/hayoon/front/src/pages/LibraryPage.jsx`
- `/home/yangyag/hayoon/front/src/pages/LettersPage.jsx`
- `/home/yangyag/hayoon/front/src/pages/LearnPage.jsx`
- `/home/yangyag/hayoon/front/src/data/letterCatalog.js`
- `/home/yangyag/hayoon/front/src/utils/tts.js`
- `/home/yangyag/hayoon/front/src/utils/progressStorage.js`
- `/home/yangyag/hayoon/front/src/utils/shuffle.js`
- `/home/yangyag/hayoon/front/package.json`
- `/home/yangyag/hayoon/front/vite.config.js`
