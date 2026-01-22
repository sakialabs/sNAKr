"""
FastAPI application factory and configuration
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.errors import (
    SNAKrException,
    snakr_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from app.middleware.rate_limit import limiter, rate_limit_exceeded_handler
from app.middleware.request_id import RequestIDMiddleware
from app.routes.health import router as health_router
from app.routes.api_v1 import api_router


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    
    # Setup logging
    setup_logging()
    
    # OpenAPI metadata
    description = """
## sNAKr API - Shared Household Inventory Intelligence

sNAKr helps households track shared inventory, ingest receipts, and generate smart restock lists.

### Key Features

* **Household Management** - Create households, invite members, manage roles
* **Inventory Tracking** - Track items with fuzzy states (Plenty, OK, Low, Almost out, Out)
* **Receipt Ingestion** - Upload receipts, extract items with OCR, map to inventory
* **Smart Predictions** - Rules-based predictions with confidence scores and explainable reason codes
* **Restock Lists** - Automatically generated lists grouped by urgency
* **Event Log** - Immutable audit trail of all inventory changes

### Authentication

All endpoints (except `/health` and `/`) require authentication via Supabase JWT tokens.

Include the token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

### Rate Limiting

API endpoints are rate-limited to 100 requests per minute per user/IP.
Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

### Error Handling

All errors follow a consistent format:
```json
{
  "error": "Error message",
  "detail": {"additional": "context"},
  "path": "/api/v1/endpoint"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Multi-Tenant Isolation

All data is isolated by household using Row Level Security (RLS) policies.
Users can only access data for households they belong to.

### Nimbly Integration

sNAKr prepares Restock Intents for handoff to Nimbly (optimization layer).
- sNAKr declares need with confidence scores and reason codes
- Nimbly evaluates timing and options
- User always has final approval
- No automatic purchases or forced automation

### API Versioning

Current version: **v1**

All endpoints are prefixed with `/api/v1/`
"""
    
    # OpenAPI tags metadata
    tags_metadata = [
        {
            "name": "health",
            "description": "Health check and system status endpoints",
        },
        {
            "name": "households",
            "description": "Household creation, member management, and invitations. "
                          "Households are the primary multi-tenant boundary.",
        },
        {
            "name": "items",
            "description": "Item catalog and inventory state management. "
                          "Items represent products tracked by the household. "
                          "Includes quick actions (Used, Restocked, Ran out).",
        },
        {
            "name": "events",
            "description": "Immutable event log for audit trail and ML training. "
                          "All inventory changes create events.",
        },
        {
            "name": "receipts",
            "description": "Receipt upload, OCR processing, item mapping, and confirmation. "
                          "Receipts are parsed asynchronously and require user review before applying to inventory.",
        },
        {
            "name": "restock",
            "description": "Restock list generation, dismissal, export, and Nimbly integration. "
                          "Lists are grouped by urgency (Need now, Need soon, Nice to top up).",
        },
    ]
    
    # Create FastAPI app
    app = FastAPI(
        title=settings.API_TITLE,
        description=description,
        version=settings.API_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        openapi_tags=tags_metadata,
        contact={
            "name": "sNAKr Team",
            "email": "support@snakr.app",
        },
        license_info={
            "name": "Proprietary",
        },
        servers=[
            {
                "url": "http://localhost:8000",
                "description": "Development server"
            },
            {
                "url": "https://api.snakr.app",
                "description": "Production server"
            }
        ]
    )
    
    # Add rate limiting state
    app.state.limiter = limiter
    
    # Add config to app state for error handlers
    app.state.config = settings
    
    # Add Request ID middleware (must be first to track all requests)
    app.add_middleware(RequestIDMiddleware)
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
    )
    
    # Register exception handlers
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    app.add_exception_handler(SNAKrException, snakr_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    # Register routers
    app.include_router(health_router)
    app.include_router(api_router)
    
    return app


# Create app instance
app = create_app()
