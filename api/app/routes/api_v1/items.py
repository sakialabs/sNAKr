"""
Item and inventory management endpoints

This module provides endpoints for:
- Managing item catalog (CRUD operations)
- Tracking inventory states (Plenty, OK, Low, Almost out, Out)
- Quick actions (Used, Restocked, Ran out)
- Filtering and searching items
- Item detail views with history

Endpoints:
- POST /api/v1/items - Create a new item
- GET /api/v1/items - List household items with filters
- GET /api/v1/items/{id} - Get item details
- PATCH /api/v1/items/{id} - Update item
- DELETE /api/v1/items/{id} - Delete item
- GET /api/v1/items/search - Fuzzy search items by name

State Transitions:
- Used: Plenty → OK → Low → Almost out → Out
- Restocked: Out/Almost out → Plenty, Low → OK/Plenty
- Ran out: Any state → Out

Authentication: Required (Supabase JWT)
Rate Limit: 100 requests/minute per user
Multi-tenant: Filtered by household membership
"""
from fastapi import APIRouter, Depends, status, Path, Query
from typing import Dict, Any, Optional
import logging

from app.models import ItemCreate, ItemUpdate, Category, Location, State
from app.middleware.auth import get_current_user
from app.services.item_service import ItemService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/items", tags=["items"])


@router.post(
    "",
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new item",
    description="""
    Create a new item in the household catalog with initial inventory state.
    
    **Requirements (1.2.1):**
    - User provides item name, category, and location
    - Item is created with initial "OK" state
    - Inventory entry is automatically created
    - Item is scoped to the household
    
    **Authentication:** Required (Supabase JWT)
    
    **Rate Limit:** 100 requests/minute per user
    
    **Example Request:**
    ```json
    {
      "household_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Milk",
      "category": "dairy",
      "location": "fridge"
    }
    ```
    
    **Example Response:**
    ```json
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "household_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Milk",
      "category": "dairy",
      "location": "fridge",
      "created_at": "2024-01-22T12:00:00Z",
      "updated_at": "2024-01-22T12:00:00Z",
      "inventory": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "state": "ok",
        "confidence": 1.0,
        "last_updated": "2024-01-22T12:00:00Z"
      }
    }
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `403 Forbidden` - User is not a member of the household
    - `422 Unprocessable Entity` - Invalid item data
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def create_item(
    item_data: ItemCreate,
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Create a new item in the household catalog
    
    Args:
        item_data: Item creation data
        user: Current authenticated user from JWT token
        
    Returns:
        Created item with inventory
        
    Raises:
        AuthenticationError: If user is not authenticated
        AuthorizationError: If user is not a member
        ValidationError: If item data is invalid
    """
    user_id = user.get("sub")
    logger.info(f"Creating item '{item_data.name}' in household {item_data.household_id} by user {user_id}")
    
    item_service = ItemService()
    item = await item_service.create_item(
        household_id=item_data.household_id,
        user_id=user_id,
        name=item_data.name,
        category=item_data.category,
        location=item_data.location
    )
    
    logger.info(f"Item {item['id']} created successfully")
    return item


@router.get(
    "",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get household items",
    description="""
    Get all items for a household with optional filters and sorting.
    
    **Requirements (1.2.2):**
    - Returns items with current inventory state
    - Supports filtering by location, state, and category
    - Supports sorting by name, state, or last updated
    - Pagination support
    
    **Authentication:** Required (Supabase JWT)
    
    **Rate Limit:** 100 requests/minute per user
    
    **Query Parameters:**
    - `household_id` (required): Household UUID
    - `location`: Filter by location (fridge, pantry, freezer)
    - `state`: Filter by state (plenty, ok, low, almost_out, out)
    - `category`: Filter by category
    - `sort_by`: Sort field (name, state, last_updated)
    - `limit`: Max items to return (default: 100)
    - `offset`: Pagination offset (default: 0)
    
    **Example Response:**
    ```json
    {
      "items": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "household_id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Milk",
          "category": "dairy",
          "location": "fridge",
          "created_at": "2024-01-22T12:00:00Z",
          "updated_at": "2024-01-22T12:00:00Z",
          "inventory": {
            "id": "770e8400-e29b-41d4-a716-446655440002",
            "state": "low",
            "confidence": 0.85,
            "last_updated": "2024-01-22T14:30:00Z"
          }
        }
      ],
      "total": 1
    }
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `403 Forbidden` - User is not a member of the household
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def get_items(
    household_id: str = Query(..., description="Household UUID"),
    location: Optional[Location] = Query(None, description="Filter by location"),
    state: Optional[State] = Query(None, description="Filter by state"),
    category: Optional[Category] = Query(None, description="Filter by category"),
    sort_by: str = Query("name", description="Sort field (name, state, last_updated)"),
    limit: int = Query(100, ge=1, le=1000, description="Max items to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get all items for a household with filters
    
    Args:
        household_id: Household UUID
        location: Optional location filter
        state: Optional state filter
        category: Optional category filter
        sort_by: Sort field
        limit: Max items to return
        offset: Pagination offset
        user: Current authenticated user from JWT token
        
    Returns:
        Dictionary with items list and total count
        
    Raises:
        AuthenticationError: If user is not authenticated
        AuthorizationError: If user is not a member
    """
    user_id = user.get("sub")
    logger.info(f"Fetching items for household {household_id} by user {user_id}")
    
    item_service = ItemService()
    items = await item_service.get_household_items(
        household_id=household_id,
        user_id=user_id,
        location=location,
        state=state,
        category=category,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    
    logger.info(f"Retrieved {items['total']} items for household {household_id}")
    return items


@router.get(
    "/{item_id}",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get item details",
    description="""
    Get detailed information about a specific item including inventory state.
    
    **Authentication:** Required (Supabase JWT)
    
    **Rate Limit:** 100 requests/minute per user
    
    **Example Response:**
    ```json
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "household_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Milk",
      "category": "dairy",
      "location": "fridge",
      "created_at": "2024-01-22T12:00:00Z",
      "updated_at": "2024-01-22T12:00:00Z",
      "inventory": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "state": "low",
        "confidence": 0.85,
        "last_updated": "2024-01-22T14:30:00Z"
      }
    }
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `403 Forbidden` - User is not a member of the household
    - `404 Not Found` - Item not found
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def get_item(
    item_id: str = Path(..., description="Item UUID"),
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get item details by ID
    
    Args:
        item_id: Item UUID
        user: Current authenticated user from JWT token
        
    Returns:
        Item details with inventory
        
    Raises:
        AuthenticationError: If user is not authenticated
        AuthorizationError: If user is not a member
        NotFoundError: If item not found
    """
    user_id = user.get("sub")
    logger.info(f"Fetching item {item_id} by user {user_id}")
    
    item_service = ItemService()
    item = await item_service.get_item_by_id(item_id, user_id)
    
    logger.info(f"Retrieved item {item_id}")
    return item


@router.patch(
    "/{item_id}",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Update item",
    description="""
    Update an item's name, category, or location.
    
    **Authentication:** Required (Supabase JWT)
    
    **Rate Limit:** 100 requests/minute per user
    
    **Example Request:**
    ```json
    {
      "name": "Whole Milk",
      "location": "fridge"
    }
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `403 Forbidden` - User is not a member of the household
    - `404 Not Found` - Item not found
    - `422 Unprocessable Entity` - Invalid update data
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def update_item(
    item_id: str = Path(..., description="Item UUID"),
    item_data: ItemUpdate = ...,
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update an item's details
    
    Args:
        item_id: Item UUID
        item_data: Updated item data
        user: Current authenticated user from JWT token
        
    Returns:
        Updated item
        
    Raises:
        AuthenticationError: If user is not authenticated
        AuthorizationError: If user is not a member
        NotFoundError: If item not found
        ValidationError: If update data is invalid
    """
    user_id = user.get("sub")
    logger.info(f"Updating item {item_id} by user {user_id}")
    
    item_service = ItemService()
    item = await item_service.update_item(
        item_id=item_id,
        user_id=user_id,
        name=item_data.name,
        category=item_data.category,
        location=item_data.location
    )
    
    logger.info(f"Item {item_id} updated successfully")
    return item


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete item",
    description="""
    Delete an item from the household catalog.
    
    **Note:** This will also delete associated inventory and event records.
    
    **Authentication:** Required (Supabase JWT)
    
    **Rate Limit:** 100 requests/minute per user
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `403 Forbidden` - User is not a member of the household
    - `404 Not Found` - Item not found
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def delete_item(
    item_id: str = Path(..., description="Item UUID"),
    user: Dict[str, Any] = Depends(get_current_user)
) -> None:
    """
    Delete an item
    
    Args:
        item_id: Item UUID
        user: Current authenticated user from JWT token
        
    Raises:
        AuthenticationError: If user is not authenticated
        AuthorizationError: If user is not a member
        NotFoundError: If item not found
    """
    user_id = user.get("sub")
    logger.info(f"Deleting item {item_id} by user {user_id}")
    
    item_service = ItemService()
    await item_service.delete_item(item_id, user_id)
    
    logger.info(f"Item {item_id} deleted successfully")


@router.get(
    "/search",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Search items",
    description="""
    Fuzzy search items by name using trigram similarity.
    
    **Authentication:** Required (Supabase JWT)
    
    **Rate Limit:** 100 requests/minute per user
    
    **Query Parameters:**
    - `household_id` (required): Household UUID
    - `q` (required): Search query
    - `limit`: Max results to return (default: 10)
    
    **Example Response:**
    ```json
    {
      "items": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "name": "Milk",
          "category": "dairy",
          "location": "fridge",
          "similarity": 0.95
        }
      ],
      "total": 1
    }
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `403 Forbidden` - User is not a member of the household
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def search_items(
    household_id: str = Query(..., description="Household UUID"),
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=100, description="Max results to return"),
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Fuzzy search items by name
    
    Args:
        household_id: Household UUID
        q: Search query
        limit: Max results to return
        user: Current authenticated user from JWT token
        
    Returns:
        Dictionary with items list and total count
        
    Raises:
        AuthenticationError: If user is not authenticated
        AuthorizationError: If user is not a member
    """
    user_id = user.get("sub")
    logger.info(f"Searching items in household {household_id} with query '{q}' by user {user_id}")
    
    item_service = ItemService()
    items = await item_service.search_items(
        household_id=household_id,
        user_id=user_id,
        query=q,
        limit=limit
    )
    
    logger.info(f"Found {len(items)} items matching '{q}'")
    return {
        'items': items,
        'total': len(items)
    }

