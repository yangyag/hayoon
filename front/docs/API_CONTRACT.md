# API Contract (Frontend View)

기본 베이스 URL:
- `${VITE_API_BASE_URL}`

## Health
- `GET /api/v1/health`
- 200: `{ "status": "UP", "timestamp": "..." }`

## Letters
- `GET /api/v1/letters`
- 200: `{ "items": [{ "key", "label", "enabled" }] }`

## Letter Words
- `GET /api/v1/letters/{key}/words`
- 200: `{ "key", "label", "items": [{ "word", "imageUrl" }] }`
- 404: `{ "code": "CARD_NOT_FOUND", ... }`

## Cards
- `GET /api/v1/cards?level=&limit=`
- `GET /api/v1/cards/{id}`
