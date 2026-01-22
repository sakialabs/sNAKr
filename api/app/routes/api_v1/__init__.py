"""
API v1 routes
"""
from fastapi import APIRouter

from .households import router as households_router
from .invitations import router as invitations_router
from .items import router as items_router
from .events import router as events_router
from .receipts import router as receipts_router
from .restock import router as restock_router

# Create API v1 router
api_router = APIRouter(prefix="/api/v1")

# Include sub-routers
api_router.include_router(households_router)
api_router.include_router(invitations_router)
api_router.include_router(items_router)
api_router.include_router(events_router)
api_router.include_router(receipts_router)
api_router.include_router(restock_router)


@api_router.get("/")
async def api_v1_root():
    """
    API v1 root endpoint with available resource links
    
    Provides an overview of all available API v1 endpoints grouped by resource type.
    
    **Authentication:** Not required
    
    Returns:
        dict: API version information and endpoint links
    
    Example Response:
        ```json
        {
          "message": "sNAKr API v1",
          "version": "0.1.0",
          "endpoints": {
            "households": "/api/v1/households",
            "items": "/api/v1/items",
            "receipts": "/api/v1/receipts",
            "restock": "/api/v1/restock",
            "events": "/api/v1/events"
          }
        }
        ```
    
    **Resource Descriptions:**
    
    - **households**: Manage households, members, and invitations
    - **items**: Manage item catalog and inventory states
    - **receipts**: Upload and process receipts with OCR
    - **restock**: Generate and manage restock lists
    - **events**: View immutable event log
    """
    return {
        "message": "sNAKr API v1",
        "version": "0.1.0",
        "endpoints": {
            "households": "/api/v1/households",
            "invitations": "/api/v1/invitations",
            "items": "/api/v1/items",
            "receipts": "/api/v1/receipts",
            "restock": "/api/v1/restock",
            "events": "/api/v1/events"
        }
    }
