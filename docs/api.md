# Hayoon API 명세 문서

본 문서는 `back` 모듈(Spring Boot 백엔드)이 제공하는 REST API의 전체 명세를 정리한 것입니다. 모든 내용은 다음 소스 파일을 직접 분석해 작성했습니다.

- `back/src/main/java/com/hayoon/hangulkid/common/web/HealthController.java`
- `back/src/main/java/com/hayoon/hangulkid/card/controller/CardController.java`
- `back/src/main/java/com/hayoon/hangulkid/letter/controller/LetterController.java`
- 각 DTO, `GlobalExceptionHandler`, `ErrorResponse`, `WebConfig`

## 기본 정보

| 항목 | 값 |
| --- | --- |
| 기본 베이스 URL | `${VITE_API_BASE_URL}` (프론트), 백엔드 기본 런타임 `http://localhost:8080` |
| 공통 경로 프리픽스 | `/api/v1` |
| 응답 형식 | JSON |

도커 환경에서의 API 접근 경로:

| 환경 | 베이스 URL |
| --- | --- |
| 프론트 컨테이너 내부 | `http://back:8080` |
| 호스트 직접 테스트 | `http://localhost:8080` |

`front/docs/API_CONTRACT.md` 의 프론트엔드 관점 계약과 일치하며, 본 문서는 백엔드 구현 기준의 상세 명세입니다.

## CORS 설정

`WebConfig.java` 기준입니다.

| 항목 | 값 |
| --- | --- |
| 적용 경로 | `/api/**` |
| 허용 Origin | 프로퍼티 `app.cors.allowed-origins` (기본값: `http://localhost:5173`, `http://localhost:8081`) |
| 허용 메서드 | `GET` |
| 허용 헤더 | `*` (전체) |

## 엔드포인트 요약

| 메서드 | 경로 | 설명 | 컨트롤러 |
| --- | --- | --- | --- |
| GET | `/api/v1/health` | 헬스 체크 | `HealthController` |
| GET | `/api/v1/cards` | 카드 목록 조회 | `CardController` |
| GET | `/api/v1/cards/{id}` | 카드 단건 조회 | `CardController` |
| GET | `/api/v1/letters` | 글자 목록 조회 | `LetterController` |
| GET | `/api/v1/letters/{key}/words` | 글자별 단어 목록 조회 | `LetterController` |

---

## 1. Health

### GET /api/v1/health

서버 상태를 반환합니다. 요청 파라미터 없음.

응답 본문 (`HealthResponse`):

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `status` | string | 상태 값. 항상 `"UP"` |
| `timestamp` | string (ISO-8601 Instant) | 응답 생성 시각 |

예시 (200):

```json
{
  "status": "UP",
  "timestamp": "2026-06-01T00:00:00Z"
}
```

---

## 2. Cards

### GET /api/v1/cards

카드 목록을 조회합니다. 클래스에 `@Validated`가 적용되어 쿼리 파라미터 검증이 동작합니다.

요청 쿼리 파라미터:

| 이름 | 타입 | 필수 | 기본값 | 제약 | 설명 |
| --- | --- | --- | --- | --- | --- |
| `level` | Integer | 아니오 | 없음 | `@Min(1)` `@Max(3)` (1~3) | 카드 난이도 레벨 필터 |
| `limit` | Integer | 아니오 | `24` | `@Min(1)` `@Max(50)` (1~50) | 반환 개수 제한 |

응답 본문 (`CardListResponse`):

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `items` | array of `CardDto` | 카드 목록 |
| `total` | int | level 필터 적용 후 limit 이전의 전체 결과 개수 |

`CardDto` 구조:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | string | 카드 ID |
| `word` | string | 단어 |
| `imageUrl` | string | 이미지 URL |
| `level` | int | 레벨 |
| `tags` | array of string | 태그 목록 |

예시 (200):

```json
{
  "items": [
    {
      "id": "card-1",
      "word": "사과",
      "imageUrl": "https://...",
      "level": 1,
      "tags": ["과일"]
    }
  ],
  "total": 1
}
```

### GET /api/v1/cards/{id}

단일 카드를 조회합니다.

요청 경로 변수:

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | string | 예 | 조회할 카드 ID |

응답 본문: `CardDto` (위 표와 동일).

존재하지 않는 ID인 경우 `CardNotFoundException` 발생 → 404 `CARD_NOT_FOUND` (아래 에러 응답 참고).

---

## 3. Letters

### GET /api/v1/letters

글자 목록을 조회합니다. 요청 파라미터 없음.

응답 본문 (`LetterListResponse`):

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `items` | array of `LetterDto` | 글자 목록 |

`LetterDto` 구조:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `key` | string | 글자 키 |
| `label` | string | 표시 라벨 |
| `enabled` | boolean | 활성화 여부 |

예시 (200):

```json
{
  "items": [
    { "key": "ga", "label": "가", "enabled": true }
  ]
}
```

### GET /api/v1/letters/{key}/words

특정 글자에 해당하는 단어 목록을 조회합니다.

요청 경로 변수:

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `key` | string | 예 | 글자 키 |

응답 본문 (`LetterWordListResponse`):

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `key` | string | 글자 키 |
| `label` | string | 표시 라벨 |
| `items` | array of `LetterWordDto` | 단어 목록 |

`LetterWordDto` 구조:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `word` | string | 단어 |
| `imageUrl` | string | 이미지 URL |

존재하지 않거나 비활성화된 key 요청 시 404 `CARD_NOT_FOUND` 반환.

예시 (200):

```json
{
  "key": "ga",
  "label": "가",
  "items": [
    { "word": "가방", "imageUrl": "https://..." }
  ]
}
```

---

## 에러 응답

모든 예외는 `GlobalExceptionHandler`(`@RestControllerAdvice`)에서 공통 `ErrorResponse` 형식으로 변환됩니다.

`ErrorResponse` 구조:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `code` | string | 에러 코드 |
| `message` | string | 예외 메시지 |
| `timestamp` | string (ISO-8601 Instant) | 발생 시각 |
| `path` | string | 요청 URI (`request.getRequestURI()`) |

### 에러 코드 매핑

| HTTP 상태 | code | 트리거 예외 | 설명 |
| --- | --- | --- | --- |
| 404 Not Found | `CARD_NOT_FOUND` | `CardNotFoundException` | 카드(또는 글자 단어) 미존재. 메시지: `"Card not found: {id_or_key}"` (카드 ID 조회 시 카드 ID, 글자 key 조회 시 글자 key가 포함됨) |
| 400 Bad Request | `INVALID_REQUEST` | `ConstraintViolationException`, `MethodArgumentNotValidException`, `MethodArgumentTypeMismatchException`, `HttpMessageNotReadableException` | 파라미터 검증 실패 / 타입 불일치 / 본문 파싱 실패 (예: `level`, `limit` 범위 초과) |
| 404 Not Found | `NOT_FOUND` | `NoResourceFoundException` | 매핑되지 않은 리소스 경로 |
| 500 Internal Server Error | `INTERNAL_ERROR` | 그 외 모든 `Exception` | 예기치 못한 서버 오류 |

에러 응답 예시 (404, 카드 ID 조회):

```json
{
  "code": "CARD_NOT_FOUND",
  "message": "Card not found: card-999",
  "timestamp": "2026-06-01T00:00:00Z",
  "path": "/api/v1/cards/card-999"
}
```

에러 응답 예시 (400, `level=5` 같은 범위 초과):

```json
{
  "code": "INVALID_REQUEST",
  "message": "...",
  "timestamp": "2026-06-01T00:00:00Z",
  "path": "/api/v1/cards"
}
```
