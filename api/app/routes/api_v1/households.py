"""
Household management endpoints

This module provides endpoints for:
- Creating and managing households
- Inviting and managing household members
- Managing member roles (admin/member)
- Multi-tenant isolation via RLS policies

Endpoints:
- POST /api/v1/households - Create a new household
- GET /api/v1/households - List user's households
- GET /api/v1/households/{id} - Get household details
- PATCH /api/v1/households/{id} - Update household
- DELETE /api/v1/households/{id} - Delete household (admin only)
- POST /api/v1/households/{id}/invitations - Invite member (admin only)
- GET /api/v1/households/{id}/invitations - List household invitations
- POST /api/v1/households/{id}/members/{user_id}/role - Update member role (admin only)
- DELETE /api/v1/households/{id}/members/{user_id} - Remove member (admin only)

Authentication: Required (Supabase JWT)
Rate Limit: 100 requests/minute per user
"""
from fastapi import APIRouter, Depends, status, Path
from typing import Dict, Any
import logging

from app.models import (
    HouseholdCreate,
    Household,
    InvitationCreate,
    InvitationResponse,
    InvitationList
)
from app.middleware.auth import get_current_user
from app.middleware.rate_limit import limiter
from app.services.household_service import HouseholdService
from app.services.invitation_service import InvitationService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/households", tags=["households"])


@router.post(
    "",
    response_model=Household,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new household",
    description="""
    Create a new household with the authenticated user as the admin.
    
    **Requirements (1.1):**
    - User provides household name during creation
    - User becomes admin by default
    - Household ID is generated and stored
    - User can create multiple households
    
    **Authentication:** Required (Supabase JWT)
    
    **Rate Limit:** 100 requests/minute per user
    
    **Example Request:**
    ```json
    {
      "name": "Smith Family"
    }
    ```
    
    **Example Response:**
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smith Family",
      "created_at": "2024-01-21T12:00:00Z",
      "updated_at": "2024-01-21T12:00:00Z"
    }
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `422 Unprocessable Entity` - Invalid household name (empty or too long)
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def create_household(
    household_data: HouseholdCreate,
    user: Dict[str, Any] = Depends(get_current_user)
) -> Household:
    """
    Create a new household
    
    Args:
        household_data: Household creation data (name)
        user: Current authenticated user from JWT token
        
    Returns:
        Created household with ID and timestamps
        
    Raises:
        AuthenticationError: If user is not authenticated
        ValidationError: If household name is invalid
    """
    user_id = user.get("sub")
    logger.info(f"Creating household '{household_data.name}' for user {user_id}")
    
    household_service = HouseholdService()
    household = await household_service.create_household(
        name=household_data.name,
        user_id=user_id
    )
    
    logger.info(f"Household {household.id} created successfully")
    return household


@router.get(
    "",
    response_model=list[Household],
    status_code=status.HTTP_200_OK,
    summary="Get user's households",
    description="""
    Get all households that the authenticated user belongs to.
    
    **Requirements (1.4):**
    - Users only see households they belong to
    - RLS policies enforce household boundaries
    - Multi-tenant isolation
    
    **Authentication:** Required (Supabase JWT)
    
    **Rate Limit:** 100 requests/minute per user
    
    **Example Response:**
    ```json
    [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Smith Family",
        "created_at": "2024-01-21T12:00:00Z",
        "updated_at": "2024-01-21T12:00:00Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Work Team",
        "created_at": "2024-01-22T10:00:00Z",
        "updated_at": "2024-01-22T10:00:00Z"
      }
    ]
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def get_households(
    user: Dict[str, Any] = Depends(get_current_user)
) -> list[Household]:
    """
    Get all households for the authenticated user
    
    Args:
        user: Current authenticated user from JWT token
        
    Returns:
        List of households the user belongs to
        
    Raises:
        AuthenticationError: If user is not authenticated
    """
    user_id = user.get("sub")
    logger.info(f"Fetching households for user {user_id}")
    
    household_service = HouseholdService()
    households = await household_service.get_user_households(user_id)
    
    logger.info(f"Found {len(households)} households for user {user_id}")
    return households


@router.post(
    "/{household_id}/invitations",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a member invitation",
    description="""
    Create a new invitation for a household member (admin only).
    
    **Requirements (1.2):**
    - Only admins can send invites
    - Invite includes household name and expiration (7 days)
    - Invitee receives email with join link (via Supabase Auth)
    - Invites leverage Supabase magic links for seamless onboarding
    
    **Authentication:** Required (Supabase JWT)
    
    **Authorization:** Admin role required
    
    **Rate Limit:** 100 requests/minute per user
    
    **Example Request:**
    ```json
    {
      "email": "friend@example.com",
      "role": "member"
    }
    ```
    
    **Example Response:**
    ```json
    {
      "message": "Invitation sent to friend@example.com",
      "invitation_id": "550e8400-e29b-41d4-a716-446655440000",
      "invitee_email": "friend@example.com",
      "household_name": "Smith Family",
      "expires_at": "2024-01-28T12:00:00Z",
      "invite_link": "http://localhost:3000/invitations/accept?token=abc123..."
    }
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `403 Forbidden` - User is not an admin of the household
    - `404 Not Found` - Household not found
    - `422 Unprocessable Entity` - Invalid email or user already a member
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def create_invitation(
    household_id: str = Path(..., description="Household UUID"),
    invitation_data: InvitationCreate = ...,
    user: Dict[str, Any] = Depends(get_current_user)
) -> InvitationResponse:
    """
    Create a new invitation for a household member
    
    Args:
        household_id: Household UUID
        invitation_data: Invitation creation data (email, role)
        user: Current authenticated user from JWT token
        
    Returns:
        InvitationResponse with invitation details and magic link
        
    Raises:
        AuthenticationError: If user is not authenticated
        AuthorizationError: If user is not an admin
        ValidationError: If email is invalid or already a member
    """
    user_id = user.get("sub")
    logger.info(f"Creating invitation for {invitation_data.email} to household {household_id} by user {user_id}")
    
    invitation_service = InvitationService()
    response = await invitation_service.create_invitation(
        household_id=household_id,
        inviter_id=user_id,
        invitee_email=invitation_data.email,
        role=invitation_data.role
    )
    
    logger.info(f"Invitation {response.invitation_id} created successfully")
    return response


@router.get(
    "/{household_id}/invitations",
    response_model=InvitationList,
    status_code=status.HTTP_200_OK,
    summary="Get household invitations",
    description="""
    Get all invitations for a household (members can view).
    
    **Authentication:** Required (Supabase JWT)
    
    **Authorization:** Must be a member of the household
    
    **Rate Limit:** 100 requests/minute per user
    
    **Example Response:**
    ```json
    {
      "invitations": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "household_id": "660e8400-e29b-41d4-a716-446655440001",
          "inviter_id": "770e8400-e29b-41d4-a716-446655440002",
          "invitee_email": "friend@example.com",
          "role": "member",
          "status": "pending",
          "token": "abc123...",
          "expires_at": "2024-01-28T12:00:00Z",
          "accepted_at": null,
          "created_at": "2024-01-21T12:00:00Z",
          "updated_at": "2024-01-21T12:00:00Z"
        }
      ],
      "total": 1
    }
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `403 Forbidden` - User is not a member of the household
    - `404 Not Found` - Household not found
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def get_household_invitations(
    household_id: str = Path(..., description="Household UUID"),
    user: Dict[str, Any] = Depends(get_current_user)
) -> InvitationList:
    """
    Get all invitations for a household
    
    Args:
        household_id: Household UUID
        user: Current authenticated user from JWT token
        
    Returns:
        InvitationList with all invitations
        
    Raises:
        AuthenticationError: If user is not authenticated
        AuthorizationError: If user is not a member
    """
    user_id = user.get("sub")
    logger.info(f"Fetching invitations for household {household_id} by user {user_id}")
    
    invitation_service = InvitationService()
    invitations = await invitation_service.get_household_invitations(
        household_id=household_id,
        user_id=user_id
    )
    
    logger.info(f"Found {len(invitations)} invitations for household {household_id}")
    return InvitationList(invitations=invitations, total=len(invitations))
