# sNAKr API

FastAPI backend for shared household inventory intelligence.

## Quick Links

- **Interactive API Docs:** http://localhost:8000/docs (Swagger UI)
- **Alternative Docs:** http://localhost:8000/redoc (ReDoc)
- **OpenAPI Spec:** http://localhost:8000/openapi.json
- **Full API Documentation:** [../docs/api.md](../docs/api.md)

## Project Structure

```
api/
├── app/                    # Main application package
│   ├── core/              # Core configuration and utilities
│   │   ├── config.py      # Application settings
│   │   ├── errors.py      # Custom exceptions and error handlers
│   │   └── logging.py     # Logging configuration
│   ├── middleware/        # FastAPI middleware
│   │   ├── auth.py        # JWT authentication
│   │   ├── rate_limit.py  # Rate limiting
│   │   └── request_id.py  # Request ID tracking
│   ├── models/            # Pydantic models for request/response
│   │   ├── common.py      # Shared models and enums
│   │   ├── household.py   # Household models
│   │   ├── item.py        # Item and inventory models
│   │   ├── event.py       # Event log models
│   │   ├── receipt.py     # Receipt processing models
│   │   └── restock.py     # Restock and prediction models
│   ├── routes/            # API route handlers
│   │   ├── api_v1/       # API v1 endpoints
│   │   │   ├── events.py
│   │   │   ├── households.py
│   │   │   ├── items.py
│   │   │   ├── receipts.py
│   │   │   └── restock.py
│   │   └── health.py     # Health check endpoints
│   ├── services/          # Business logic services
│   │   └── supabase_client.py  # Supabase client wrapper
│   └── main.py           # Application factory
├── scripts/               # Utility scripts
│   ├── verify_openapi.py      # Verify OpenAPI configuration
│   ├── verify_structure.py    # Verify project structure
│   └── validate_rate_limit.py # Validate rate limiting
├── tasks/                 # Celery tasks (future)
├── tests/                 # Test suite
├── alembic/              # Database migrations
├── main.py               # Application entry point
├── requirements.txt      # Python dependencies
└── pyproject.toml        # Python project configuration
```

## Setup

### Prerequisites

- Python 3.11+ (recommended: Python 3.11 or 3.12 for best package compatibility)
- **OR** Conda/Miniconda (recommended for users without native Python)
- PostgreSQL (via Supabase)
- Redis (for rate limiting, optional)

**Note**: Python 3.14+ may have compatibility issues with some dependencies that require compilation (numpy, pydantic-core, etc.). If you encounter installation issues, use the Conda method below or Python 3.11/3.12.

### Installation

#### Option 1: Using Conda (Recommended)

If you don't have Python installed natively or encounter dependency issues:

1. Create and activate conda environment:
```bash
# Create environment with Python 3.11
conda create -n snakr python=3.11 -y

# Activate environment
conda activate snakr
```

2. Install dependencies:
```bash
# Navigate to api directory
cd api

# Install dependencies using conda's pip
pip install -r requirements.txt
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials

**Note:** Always activate the conda environment before running any commands:
```bash
conda activate snakr
```

#### Option 2: Using Native Python

If you have Python 3.11+ installed natively:

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials

### Running the API

**Important:** Make sure your environment is activated first:
- Conda: `conda activate snakr`
- Venv: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)

Development mode with hot reload:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:8000/docs - Interactive API explorer
- **ReDoc:** http://localhost:8000/redoc - Clean documentation
- **OpenAPI JSON:** http://localhost:8000/openapi.json - Machine-readable spec
- **Full Guide:** [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) - Comprehensive documentation

## API Overview

### Authentication

All endpoints (except `/health`, `/`, `/rate-limit-status`) require Supabase JWT authentication:

```bash
curl -X GET 'http://localhost:8000/api/v1/households' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Rate Limiting

- **Limit:** 100 requests per minute per user/IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Status:** Check with `GET /rate-limit-status`

### Multi-Tenant Isolation

All data is automatically filtered by household membership using Row Level Security (RLS). Users can only access data for households they belong to.

### API Resources

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| **Households** | `/api/v1/households` | Create/manage households, invite members |
| **Items** | `/api/v1/items` | Item catalog, inventory states, quick actions |
| **Events** | `/api/v1/events` | Immutable event log for audit trail |
| **Receipts** | `/api/v1/receipts` | Upload receipts, OCR processing, item mapping |
| **Restock** | `/api/v1/restock` | Smart restock lists with predictions |

### Quick Start Example

```bash
# Check API health
curl http://localhost:8000/health

# Get API information
curl http://localhost:8000/

# List households (requires auth)
curl -X GET 'http://localhost:8000/api/v1/households' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

For detailed endpoint documentation, authentication flows, error handling, and examples, see [../docs/api.md](../docs/api.md).

## Utility Scripts

The `scripts/` folder contains utility scripts for verification and validation:

### Verify OpenAPI Configuration

```bash
conda activate snakr
python scripts/verify_openapi.py
```

Checks that OpenAPI documentation is properly configured and generates `openapi_schema.json`.

### Verify Project Structure

```bash
conda activate snakr
python scripts/verify_structure.py
```

Verifies that all required directories and files exist.

### Validate Rate Limiting

```bash
conda activate snakr
python scripts/validate_rate_limit.py
```

Validates that rate limiting middleware is properly configured.

## Development

### Environment Setup Reminder

Before running any development commands, activate your environment:

```bash
# If using conda
conda activate snakr

# If using venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### Code Style

This project uses:
- **black** for code formatting
- **isort** for import sorting
- **flake8** for linting
- **mypy** for type checking

Run formatters:
```bash
black .
isort .
```

Run linters:
```bash
flake8 .
mypy .
```

### Testing

Run tests:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app --cov-report=html
```

View coverage report:
```bash
# Open htmlcov/index.html in your browser
```

## Architecture

### Application Factory Pattern

The application uses the factory pattern (`app/main.py:create_app()`) for better testability and configuration management.

### Error Handling

Custom exceptions are defined in `app/core/errors.py`:
- `SNAKrException` - Base exception
- `AuthenticationError` - 401 errors
- `AuthorizationError` - 403 errors
- `NotFoundError` - 404 errors
- `ValidationError` - 422 errors
- `RateLimitError` - 429 errors

All errors return consistent JSON responses with:
```json
{
  "error": {
    "message": "Human-readable error message",
    "details": {},
    "path": "/api/v1/endpoint"
  }
}
```

### Logging

Structured JSON logging is configured in `app/core/logging.py`. All logs include:
- timestamp
- level
- logger name
- message
- module, function, line number
- extra context fields

### Configuration

Application settings are managed via Pydantic Settings in `app/core/config.py`. Configuration can be set via:
1. Environment variables
2. `.env` file
3. Default values

### Supabase Client

The Supabase client is available via `app/services/supabase_client.py`:

```python
from app.services import get_supabase

# Get Supabase client instance
supabase = get_supabase()

# Query data
response = supabase.table('households').select('*').execute()

# Insert data
supabase.table('items').insert({'name': 'Milk', 'household_id': '...'}).execute()
```

The client uses a singleton pattern to ensure only one instance is created.

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint with API information

### API v1
- `GET /api/v1` - API v1 root with endpoint listing

Future endpoints (to be implemented):
- `/api/v1/households` - Household management
- `/api/v1/items` - Item and inventory management
- `/api/v1/receipts` - Receipt upload and processing
- `/api/v1/restock` - Restock list
- `/api/v1/events` - Event log

## Next Steps

See `docs/tasks.md` for implementation tasks:
- Task 0.3.1: Set up FastAPI project structure ✓
- Task 0.3.2: Configure Pydantic models
- Task 0.3.3: Set up Supabase client ✓
- Task 0.3.4: Implement JWT verification middleware
- Task 0.3.5: Implement rate limiting middleware
- Task 0.3.6: Set up error handling and logging ✓
- Task 0.3.7: Create API documentation ✓
