"""
Item and inventory management endpoints

This module will provide endpoints for:
- Managing item catalog (CRUD operations)
- Tracking inventory states (Plenty, OK, Low, Almost out, Out)
- Quick actions (Used, Restocked, Ran out)
- Filtering and searching items
- Item detail views with history

Planned Endpoints:
- POST /api/v1/items - Create a new item
- GET /api/v1/items - List household items with filters
- GET /api/v1/items/{id} - Get item details
- PATCH /api/v1/items/{id} - Update item
- DELETE /api/v1/items/{id} - Delete item
- POST /api/v1/items/{id}/used - Mark item as used (state transition)
- POST /api/v1/items/{id}/restocked - Mark item as restocked
- POST /api/v1/items/{id}/ran-out - Mark item as ran out
- GET /api/v1/items/search - Fuzzy search items by name

State Transitions:
- Used: Plenty → OK → Low → Almost out → Out
- Restocked: Out/Almost out → Plenty, Low → OK/Plenty
- Ran out: Any state → Out

Authentication: Required (Supabase JWT)
Rate Limit: 100 requests/minute per user
Multi-tenant: Filtered by household membership
"""
from fastapi import APIRouter

router = APIRouter(prefix="/items", tags=["items"])

# Endpoints will be implemented in tasks 1.2 and 1.3
