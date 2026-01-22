"""
Invitation management endpoints

This module provides endpoints for:
- Creating invitations (admin only)
- Accepting invitations
- Viewing household invitations
- Managing invitation lifecycle

Endpoints:
- POST /api/v1/households/{household_id}/invitations - Create invitation (admin only)
- GET /api/v1/households/{household_id}/invitations - List household invitations
- POST /api/v1/invitations/accept - Accept invitation
- GET /api/v1/invitations/{token} - Get invitation details by token

Authentication: Required (Supabase JWT) except for GET /{token}
Rate Limit: 100 requests/minute per user
"""
from fastapi import APIRouter, Depends, status, Path, Query
from typing import Dict, Any
import logging

from app.models import (
    InvitationCreate,
    InvitationAccept,
    InvitationResponse,
    InvitationAcceptResponse,
    Invitation,
    InvitationList
)
from app.middleware.auth import get_current_user
from app.services.invitation_service import InvitationService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/invitations", tags=["invitations"])


@router.post(
    "/accept",
    response_model=InvitationAcceptResponse,
    status_code=status.HTTP_200_OK,
    summary="Accept an invitation",
    description="""
    Accept an invitation and join a household.
    
    **Requirements (1.2):**
    - Invitee can accept or decline
    - All members notified when new member joins
    
    **Authentication:** Required (Supabase JWT)
    
    **Rate Limit:** 100 requests/minute per user
    
    **Example Request:**
    ```json
    {
      "token": "abc123..."
    }
    ```
    
    **Example Response:**
    ```json
    {
      "message": "Welcome to Smith Family!",
      "household_id": "660e8400-e29b-41d4-a716-446655440001",
      "household_name": "Smith Family",
      "role": "member"
    }
    ```
    
    **Errors:**
    - `401 Unauthorized` - Missing or invalid authentication token
    - `404 Not Found` - Invitation not found
    - `422 Unprocessable Entity` - Invitation expired, already used, or email mismatch
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def accept_invitation(
    invitation_data: InvitationAccept,
    user: Dict[str, Any] = Depends(get_current_user)
) -> InvitationAcceptResponse:
    """
    Accept an invitation and join a household
    
    Args:
        invitation_data: Invitation acceptance data (token)
        user: Current authenticated user from JWT token
        
    Returns:
        InvitationAcceptResponse with household details
        
    Raises:
        AuthenticationError: If user is not authenticated
        NotFoundError: If invitation not found
        ValidationError: If invitation expired or already used
    """
    user_id = user.get("sub")
    logger.info(f"User {user_id} accepting invitation with token {invitation_data.token[:10]}...")
    
    invitation_service = InvitationService()
    response = await invitation_service.accept_invitation(
        token=invitation_data.token,
        user_id=user_id
    )
    
    logger.info(f"User {user_id} successfully joined household {response.household_id}")
    return response


@router.get(
    "/{token}",
    response_model=Invitation,
    status_code=status.HTTP_200_OK,
    summary="Get invitation details by token",
    description="""
    Get invitation details by token (for preview before accepting).
    
    **Authentication:** Not required (public endpoint for invitation preview)
    
    **Rate Limit:** 100 requests/minute per IP
    
    **Example Response:**
    ```json
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
    ```
    
    **Errors:**
    - `404 Not Found` - Invitation not found
    - `429 Too Many Requests` - Rate limit exceeded
    - `500 Internal Server Error` - Database or server error
    """,
)
async def get_invitation_by_token(
    token: str = Path(..., description="Invitation token")
) -> Invitation:
    """
    Get invitation details by token
    
    Args:
        token: Invitation token
        
    Returns:
        Invitation details
        
    Raises:
        NotFoundError: If invitation not found
    """
    logger.info(f"Fetching invitation with token {token[:10]}...")
    
    invitation_service = InvitationService()
    invitation = await invitation_service.get_invitation_by_token(token)
    
    if not invitation:
        from app.core.errors import NotFoundError
        raise NotFoundError(
            "Invitation not found",
            user_message="We couldn't find that invitation.",
            next_steps="Check the link and try again, or ask for a new invitation."
        )
    
    logger.info(f"Found invitation {invitation.id}")
    return invitation
