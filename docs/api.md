# sNAKr API Documentation

Complete API reference for the sNAKr backend.

## Quick Access

- **Interactive Docs:** http://localhost:8000/docs (Swagger UI)
- **Alternative Docs:** http://localhost:8000/redoc (ReDoc)
- **OpenAPI Spec:** http://localhost:8000/openapi.json
- **API Setup:** [../api/README.md](../api/README.md)

## Overview

The sNAKr API provides endpoints for managing shared household inventory with receipt ingestion and smart restock predictions.

**Base URL:**
- Development: `http://localhost:8000`
- Production: `https://api.snakr.app`

**API Version:** v1

## Getting Started

### 1. Start the API Server

```bash
cd api
conda activate snakr  # or activate your venv
python main.py
```

### 2. Access Interactive Documentation

- Open http://localhost:8000/docs in your browser
- Click "Authorize" to add your JWT token
- Try out endpoints directly in the browser

### 3. Test the API

```bash
# Check API health
curl http://localhost:8000/health

# Get API information
curl http://localhost:8000/

# List households (requires auth)
curl -X GET 'http://localhost:8000/api/v1/households' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Authentication

All endpoints (except `/health`, `/`, `/rate-limit-status`) require Supabase JWT authentication.

### Getting a Token

1. Sign in via Supabase Auth using one of these methods:
   - Email/password authentication
   - OAuth providers (Google, GitHub, Apple, Facebook)
   - Magic link (passwordless email)

2. Receive JWT token from Supabase Auth response

3. Include token in the `Authorization` header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Token Expiration

- JWT tokens expire after 1 hour by default
- Use Supabase client libraries to handle automatic token refresh
- If a token expires, you'll receive a `401 Unauthorized` response

### Example

```bash
# Get token from Supabase
curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token in API request
curl -X GET 'http://localhost:8000/api/v1/households' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Rate Limiting

API endpoints are rate-limited to **100 requests per minute** per user/IP address.

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

### Rate Limit Exceeded

**Status Code:** `429 Too Many Requests`

**Response:**
```json
{
  "error": "Rate limit exceeded",
  "detail": {
    "limit": "100 per minute",
    "retry_after": 30
  },
  "path": "/api/v1/items"
}
```

### Check Rate Limit Status

```bash
curl -X GET 'http://localhost:8000/rate-limit-status'
```

## Error Handling

All errors follow a consistent format.

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "detail": {
    "field": "additional context",
    "code": "ERROR_CODE"
  },
  "path": "/api/v1/endpoint"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request data or validation error |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Insufficient permissions for this resource |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource conflict (e.g., duplicate) |
| `422` | Unprocessable Entity | Validation error with detailed field errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error (logged for investigation) |

## Multi-Tenant Isolation

sNAKr uses **Row Level Security (RLS)** to ensure data isolation between households.

### How It Works

1. **Household Membership:** Users belong to one or more households
2. **Automatic Filtering:** All queries automatically filter by household membership
3. **RLS Policies:** Database-level policies enforce access control
4. **No Cross-Household Access:** Attempting to access another household's data returns `403 Forbidden`

### Security Guarantees

- Users can only see data for households they belong to
- API validates household membership before every query
- Database RLS policies provide defense-in-depth
- No data leakage between households

## API Resources

### Households

Manage households, members, and invitations.

**Endpoints:**
- `POST /api/v1/households` - Create household
- `GET /api/v1/households` - List user's households
- `GET /api/v1/households/{id}` - Get household details
- `PATCH /api/v1/households/{id}` - Update household
- `DELETE /api/v1/households/{id}` - Delete household (admin only)
- `POST /api/v1/households/{id}/invite` - Invite member (admin only)
- `POST /api/v1/households/{id}/members/{user_id}/role` - Update member role (admin only)
- `DELETE /api/v1/households/{id}/members/{user_id}` - Remove member (admin only)

**Roles:**
- **Admin:** Full control (invite, remove members, delete household)
- **Member:** View and update inventory, upload receipts

### Items

Manage item catalog and inventory states.

**Endpoints:**
- `POST /api/v1/items` - Create item
- `GET /api/v1/items` - List items with filters
- `GET /api/v1/items/{id}` - Get item details
- `PATCH /api/v1/items/{id}` - Update item
- `DELETE /api/v1/items/{id}` - Delete item
- `POST /api/v1/items/{id}/used` - Mark as used
- `POST /api/v1/items/{id}/restocked` - Mark as restocked
- `POST /api/v1/items/{id}/ran-out` - Mark as ran out
- `GET /api/v1/items/search` - Fuzzy search items

**Inventory States:**
- `plenty` - Well stocked
- `ok` - Normal level
- `low` - Running low
- `almost_out` - Almost empty
- `out` - Out of stock

**State Transitions:**
- **Used:** Plenty → OK → Low → Almost out → Out
- **Restocked:** Out/Almost out → Plenty, Low → OK/Plenty
- **Ran out:** Any state → Out

### Events

View immutable event log for audit trail and ML training.

**Endpoints:**
- `GET /api/v1/events` - List events with pagination
- `GET /api/v1/events/{id}` - Get event details
- `GET /api/v1/items/{item_id}/events` - Get events for item
- `GET /api/v1/events/export` - Export events as JSON

**Event Types:**
- `inventory.used` - Item marked as used
- `inventory.restocked` - Item restocked
- `inventory.ran_out` - Item marked as out
- `receipt.ingested` - Receipt uploaded and parsed
- `receipt.confirmed` - Receipt items confirmed
- `prediction.generated` - Prediction created/updated
- `iot.event` - IoT device event (future)

### Receipts

Upload and process receipts with OCR and item mapping.

**Endpoints:**
- `POST /api/v1/receipts` - Upload receipt file
- `GET /api/v1/receipts` - List receipts with status
- `GET /api/v1/receipts/{id}` - Get receipt with parsed items
- `POST /api/v1/receipts/{id}/confirm` - Confirm and apply to inventory
- `DELETE /api/v1/receipts/{id}` - Delete receipt
- `GET /api/v1/receipts/{id}/status` - Check processing status

**Receipt Processing Pipeline:**
1. **Upload:** Store file in Supabase Storage (encrypted)
2. **OCR:** Extract text asynchronously (Tesseract)
3. **Parse:** Extract line items, store, date, total
4. **Normalize:** Clean names, normalize units/quantities
5. **Map:** Match to household items with confidence scores
6. **Review:** User confirms/edits mappings
7. **Confirm:** Apply to inventory, create events

**Receipt Status:**
- `uploaded` - File uploaded, waiting for processing
- `processing` - OCR in progress
- `parsed` - Items extracted, ready for review
- `confirmed` - User confirmed, applied to inventory
- `failed` - Processing failed (see error_message)

**File Requirements:**
- **Formats:** JPEG, PNG, PDF
- **Max Size:** 10MB
- **Encryption:** At rest and in transit (TLS 1.3)
- **Retention:** 90 days default (user-configurable)

### Restock

Generate and manage restock lists with smart predictions.

**Endpoints:**
- `GET /api/v1/restock` - Get restock list grouped by urgency
- `POST /api/v1/restock/{item_id}/dismiss` - Dismiss item temporarily
- `GET /api/v1/restock/export` - Export list (text or JSON)
- `POST /api/v1/restock/intent` - Generate Restock Intent for Nimbly
- `POST /api/v1/restock/intent/{id}/handoff` - Initiate Nimbly handoff
- `POST /api/v1/restock/intent/{id}/response` - Receive Action Options from Nimbly

**Urgency Levels:**
1. **Need now:** Items in Out or Almost out state
2. **Need soon:** Items in Low state or predicted Low within 3 days
3. **Nice to top up:** Items in OK state with consistent usage patterns

**Prediction Logic (Rules-based MVP):**
- Moving average usage rate per item
- Time since last restock
- Simple thresholds for state transitions
- Confidence scores (0.7-0.95 for rules)
- Explainable reason codes

**Reason Codes:**
- `recent_usage_events` - Multiple recent uses
- `receipt_confirmed_X_days_ago` - Recent restock
- `consistent_weekly_pattern` - Predictable usage
- `low_confidence` - Insufficient data

## Nimbly Integration

sNAKr prepares Restock Intents for handoff to Nimbly (optimization layer).

### Integration Philosophy

- **sNAKr declares need:** Detects what's needed, explains why, estimates urgency
- **Nimbly evaluates options:** Analyzes when/where to act, timing and deals
- **User decides:** Always has final approval, no forced automation

### Restock Intent Format

Follows the sNAKr-Nimbly Integration Specification v1 (see `contract.md`).

**Intent Structure:**
```json
{
  "intent_id": "uuid",
  "version": "v1",
  "household_id": "uuid",
  "generated_at": "2024-01-15T10:30:00Z",
  "overall_urgency": "medium",
  "items": [
    {
      "canonical_name": "Milk 2%",
      "category": "dairy",
      "current_state": "low",
      "confidence": 0.85,
      "reason_codes": ["recent_usage_events", "receipt_confirmed_3_days_ago"],
      "suggested_quantity": 1,
      "quantity_confidence": 0.7
    }
  ],
  "constraints": {
    "partial_fulfillment_allowed": true,
    "local_first_preference": "neutral",
    "budget_sensitivity": "medium"
  }
}
```

### Integration Guarantees

- Every item includes confidence score (0-1)
- Every item includes explainable reason codes
- Quantities are suggestions, not requirements
- Intent never implies obligation to buy
- User must explicitly approve handoff
- No automatic purchases or forced automation

## Pagination

List endpoints support pagination using `limit` and `offset` parameters.

### Parameters

- `limit` - Number of items per page (default: 20-50 depending on endpoint)
- `offset` - Number of items to skip (default: 0)

### Example

```bash
# Get first page (items 0-19)
GET /api/v1/items?limit=20&offset=0

# Get second page (items 20-39)
GET /api/v1/items?limit=20&offset=20
```

## Filtering and Sorting

Many list endpoints support filtering and sorting.

### Items Filtering

```bash
# Filter by location
GET /api/v1/items?location=fridge

# Filter by state
GET /api/v1/items?state=low

# Combine filters
GET /api/v1/items?location=fridge&state=low

# Sort by name
GET /api/v1/items?sort=name
```

### Events Filtering

```bash
# Filter by event type
GET /api/v1/events?event_type=inventory.used

# Filter by date range
GET /api/v1/events?start_date=2024-01-01&end_date=2024-01-31
```

## Idempotency

Receipt upload and confirmation endpoints support idempotency to prevent duplicate operations.

### Idempotency-Key Header

Include an `Idempotency-Key` header with a unique identifier (UUID recommended):

```bash
curl -X POST 'http://localhost:8000/api/v1/receipts' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000' \
  -F 'file=@receipt.jpg'
```

### Behavior

- First request with a key: Processes normally, returns `201 Created`
- Duplicate request with same key: Returns cached response, returns `200 OK`
- Keys expire after 24 hours

## OpenAPI Specification

The API follows OpenAPI 3.0 specification. The schema is automatically generated from:

- Route definitions in `app/routes/`
- Pydantic models in `app/models/`
- Docstrings and metadata in `app/main.py`

### Accessing the Schema

- **JSON format:** http://localhost:8000/openapi.json
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Verifying the Schema

Run the verification script:

```bash
cd api
conda activate snakr
python scripts/verify_openapi.py
```

## SDK and Client Libraries

### Using Supabase Client

Use Supabase client libraries for authentication and the Fetch API for sNAKr endpoints:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign in
const { data: { session } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Use token for API calls
const response = await fetch('http://localhost:8000/api/v1/households', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
})
```

## Support

- **Interactive Docs:** http://localhost:8000/docs
- **Email:** support@snakr.app
- **GitHub Issues:** [github.com/snakr/api/issues](https://github.com/snakr/api/issues)

---

Built with 💖 for everyday people tryna stay stocked and not get rocked.
