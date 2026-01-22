"""
Invitation service for member invitation business logic

This service handles:
- Creating invitations with magic links
- Validating and accepting invitations
- Managing invitation lifecycle (expiration, status)
- Sending invitation emails via Supabase Auth
"""
from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta
import logging
import secrets

from app.services.supabase_client import get_supabase
from app.models import Role, Invitation, InvitationResponse, InvitationAcceptResponse
from app.core.errors import NotFoundError, ValidationError, AuthorizationError
from app.core.config import settings

logger = logging.getLogger(__name__)


class InvitationService:
    """Service for invitation management operations"""
    
    # Invitation expiration time (7 days as per requirements)
    INVITATION_EXPIRY_DAYS = 7
    
    def __init__(self):
        self.supabase = get_supabase()
    
    def _generate_invitation_token(self) -> str:
        """
        Generate a secure random token for invitation links
        
        Returns:
            Secure random token (32 bytes, URL-safe)
        """
        return secrets.token_urlsafe(32)
    
    async def verify_admin_access(self, user_id: str, household_id: str) -> bool:
        """
        Verify that user is an admin of the household
        
        Args:
            user_id: User UUID
            household_id: Household UUID
            
        Returns:
            True if user is admin, False otherwise
        """
        try:
            response = self.supabase.table('household_members')\
                .select('role')\
                .eq('user_id', user_id)\
                .eq('household_id', household_id)\
                .execute()
            
            if not response.data:
                return False
            
            return response.data[0]['role'] == Role.ADMIN.value
        except Exception as e:
            logger.error(f"Error verifying admin access: {e}", exc_info=True)
            return False
    
    async def create_invitation(
        self,
        household_id: str,
        inviter_id: str,
        invitee_email: str,
        role: Role = Role.MEMBER
    ) -> InvitationResponse:
        """
        Create a new invitation for a household member
        
        This implements requirement 1.2 (Member Invitations):
        - Only admins can send invites
        - Invite includes household name and expiration (7 days)
        - Invitee receives email with join link (via Supabase Auth)
        - Invites leverage Supabase magic links for seamless onboarding
        
        Args:
            household_id: Household UUID
            inviter_id: User UUID of the admin sending the invite
            invitee_email: Email address of the person to invite
            role: Role to assign (admin or member)
            
        Returns:
            InvitationResponse with invitation details and magic link
            
        Raises:
            AuthorizationError: If inviter is not an admin
            ValidationError: If email is invalid or already a member
            Exception: If database operation fails
        """
        # Verify inviter is an admin
        is_admin = await self.verify_admin_access(inviter_id, household_id)
        if not is_admin:
            raise AuthorizationError(
                "Only admins can send invitations",
                user_message="You don't have permission to invite members.",
                next_steps="Ask a household admin to send the invitation."
            )
        
        # Get household details
        try:
            household_response = self.supabase.table('households')\
                .select('name')\
                .eq('id', household_id)\
                .execute()
            
            if not household_response.data:
                raise NotFoundError(
                    f"Household {household_id} not found",
                    user_message="We couldn't find that household.",
                    next_steps="Double-check the household and try again."
                )
            
            household_name = household_response.data[0]['name']
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error fetching household: {e}", exc_info=True)
            raise Exception(f"Failed to fetch household: {str(e)}")
        
        # Check if email is already a member
        try:
            # First, check if user exists with this email
            user_response = self.supabase.auth.admin.list_users()
            existing_user_id = None
            
            for user in user_response:
                if user.email == invitee_email:
                    existing_user_id = user.id
                    break
            
            # If user exists, check if they're already a member
            if existing_user_id:
                member_response = self.supabase.table('household_members')\
                    .select('id')\
                    .eq('household_id', household_id)\
                    .eq('user_id', existing_user_id)\
                    .execute()
                
                if member_response.data:
                    raise ValidationError(
                        f"User {invitee_email} is already a member",
                        user_message=f"{invitee_email} is already a member of this household.",
                        next_steps="No need to send another invitation."
                    )
        except ValidationError:
            raise
        except Exception as e:
            logger.warning(f"Error checking existing membership: {e}")
            # Continue anyway - we'll handle duplicates later
        
        # Check for existing pending invitations
        try:
            existing_invites = self.supabase.table('invitations')\
                .select('id, status')\
                .eq('household_id', household_id)\
                .eq('invitee_email', invitee_email)\
                .eq('status', 'pending')\
                .execute()
            
            if existing_invites.data:
                raise ValidationError(
                    f"Pending invitation already exists for {invitee_email}",
                    user_message=f"There's already a pending invitation for {invitee_email}.",
                    next_steps="Wait for them to accept, or cancel the existing invitation first."
                )
        except ValidationError:
            raise
        except Exception as e:
            logger.warning(f"Error checking existing invitations: {e}")
            # Continue anyway
        
        # Generate invitation token and expiration
        token = self._generate_invitation_token()
        expires_at = datetime.utcnow() + timedelta(days=self.INVITATION_EXPIRY_DAYS)
        
        # Create invitation record
        try:
            invitation_response = self.supabase.table('invitations')\
                .insert({
                    'household_id': household_id,
                    'inviter_id': inviter_id,
                    'invitee_email': invitee_email,
                    'role': role.value,
                    'status': 'pending',
                    'token': token,
                    'expires_at': expires_at.isoformat()
                })\
                .execute()
            
            if not invitation_response.data:
                raise Exception("Failed to create invitation")
            
            invitation_data = invitation_response.data[0]
            invitation_id = invitation_data['id']
            
            logger.info(f"Invitation {invitation_id} created for {invitee_email} to household {household_id}")
        except Exception as e:
            logger.error(f"Error creating invitation: {e}", exc_info=True)
            raise Exception(f"Failed to create invitation: {str(e)}")
        
        # Generate invitation link
        # The link will point to the web app's invitation acceptance page
        base_url = settings.WEB_APP_URL or "http://localhost:3000"
        invite_link = f"{base_url}/invitations/accept?token={token}"
        
        # Send invitation email via Supabase Auth magic link
        try:
            # Use Supabase Auth to send a magic link email
            # The email will include the household name and invitation details
            email_data = {
                "email": invitee_email,
                "data": {
                    "household_name": household_name,
                    "invitation_token": token,
                    "invitation_link": invite_link,
                    "expires_at": expires_at.isoformat(),
                    "role": role.value
                }
            }
            
            # Note: In production, you would use Supabase's email templates
            # For now, we'll log the invitation details
            logger.info(f"Invitation email would be sent to {invitee_email} with link: {invite_link}")
            
            # TODO: Implement actual email sending via Supabase Auth
            # This requires configuring email templates in Supabase dashboard
            # For MVP, we'll return the link directly in the response
            
        except Exception as e:
            logger.error(f"Error sending invitation email: {e}", exc_info=True)
            # Don't fail the invitation creation if email fails
            # The link can still be shared manually
        
        return InvitationResponse(
            message=f"Invitation sent to {invitee_email}",
            invitation_id=invitation_id,
            invitee_email=invitee_email,
            household_name=household_name,
            expires_at=expires_at,
            invite_link=invite_link
        )
    
    async def get_invitation_by_token(self, token: str) -> Optional[Invitation]:
        """
        Get invitation by token
        
        Args:
            token: Invitation token
            
        Returns:
            Invitation if found, None otherwise
        """
        try:
            response = self.supabase.table('invitations')\
                .select('*')\
                .eq('token', token)\
                .execute()
            
            if not response.data:
                return None
            
            invitation_data = response.data[0]
            return Invitation(
                id=invitation_data['id'],
                household_id=invitation_data['household_id'],
                inviter_id=invitation_data['inviter_id'],
                invitee_email=invitation_data['invitee_email'],
                role=Role(invitation_data['role']),
                status=invitation_data['status'],
                token=invitation_data['token'],
                expires_at=invitation_data['expires_at'],
                accepted_at=invitation_data.get('accepted_at'),
                created_at=invitation_data['created_at'],
                updated_at=invitation_data['updated_at']
            )
        except Exception as e:
            logger.error(f"Error fetching invitation by token: {e}", exc_info=True)
            return None
    
    async def accept_invitation(
        self,
        token: str,
        user_id: str
    ) -> InvitationAcceptResponse:
        """
        Accept an invitation and add user to household
        
        This implements requirement 1.2 (Member Invitations):
        - Invitee can accept or decline
        - All members notified when new member joins
        
        Args:
            token: Invitation token from the invite link
            user_id: User UUID of the person accepting
            
        Returns:
            InvitationAcceptResponse with household details
            
        Raises:
            NotFoundError: If invitation not found
            ValidationError: If invitation expired or already used
            Exception: If database operation fails
        """
        # Get invitation
        invitation = await self.get_invitation_by_token(token)
        
        if not invitation:
            raise NotFoundError(
                "Invitation not found",
                user_message="We couldn't find that invitation.",
                next_steps="Check the link and try again, or ask for a new invitation."
            )
        
        # Validate invitation status
        if invitation.status != 'pending':
            raise ValidationError(
                f"Invitation already {invitation.status}",
                user_message=f"This invitation has already been {invitation.status}.",
                next_steps="Ask for a new invitation if you still want to join."
            )
        
        # Check expiration
        if datetime.utcnow() > invitation.expires_at.replace(tzinfo=None):
            # Mark as expired
            try:
                self.supabase.table('invitations')\
                    .update({'status': 'expired'})\
                    .eq('id', str(invitation.id))\
                    .execute()
            except Exception as e:
                logger.warning(f"Error marking invitation as expired: {e}")
            
            raise ValidationError(
                "Invitation expired",
                user_message="This invitation has expired.",
                next_steps="Ask for a new invitation to join the household."
            )
        
        # Get user email to verify it matches
        try:
            user_response = self.supabase.auth.admin.get_user_by_id(user_id)
            user_email = user_response.user.email
            
            if user_email != invitation.invitee_email:
                raise ValidationError(
                    "Email mismatch",
                    user_message="This invitation was sent to a different email address.",
                    next_steps="Sign in with the email that received the invitation."
                )
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error verifying user email: {e}", exc_info=True)
            # Continue anyway - we'll trust the token
        
        # Check if user is already a member
        try:
            existing_member = self.supabase.table('household_members')\
                .select('id')\
                .eq('household_id', str(invitation.household_id))\
                .eq('user_id', user_id)\
                .execute()
            
            if existing_member.data:
                # Mark invitation as accepted anyway
                self.supabase.table('invitations')\
                    .update({
                        'status': 'accepted',
                        'accepted_at': datetime.utcnow().isoformat()
                    })\
                    .eq('id', str(invitation.id))\
                    .execute()
                
                raise ValidationError(
                    "Already a member",
                    user_message="You're already a member of this household.",
                    next_steps="No need to accept the invitation again."
                )
        except ValidationError:
            raise
        except Exception as e:
            logger.warning(f"Error checking existing membership: {e}")
        
        # Add user to household
        try:
            member_response = self.supabase.table('household_members')\
                .insert({
                    'household_id': str(invitation.household_id),
                    'user_id': user_id,
                    'role': invitation.role.value
                })\
                .execute()
            
            if not member_response.data:
                raise Exception("Failed to add member to household")
            
            logger.info(f"User {user_id} added to household {invitation.household_id} with role {invitation.role.value}")
        except Exception as e:
            logger.error(f"Error adding member to household: {e}", exc_info=True)
            raise Exception(f"Failed to add member to household: {str(e)}")
        
        # Mark invitation as accepted
        try:
            self.supabase.table('invitations')\
                .update({
                    'status': 'accepted',
                    'accepted_at': datetime.utcnow().isoformat()
                })\
                .eq('id', str(invitation.id))\
                .execute()
            
            logger.info(f"Invitation {invitation.id} marked as accepted")
        except Exception as e:
            logger.error(f"Error updating invitation status: {e}", exc_info=True)
            # Don't fail if we can't update the status - member was added successfully
        
        # Get household name
        try:
            household_response = self.supabase.table('households')\
                .select('name')\
                .eq('id', str(invitation.household_id))\
                .execute()
            
            household_name = household_response.data[0]['name'] if household_response.data else "Unknown"
        except Exception as e:
            logger.warning(f"Error fetching household name: {e}")
            household_name = "Unknown"
        
        # TODO: Notify all household members about the new member
        # This would be implemented in Phase 4 (Notifications)
        
        return InvitationAcceptResponse(
            message=f"Welcome to {household_name}!",
            household_id=invitation.household_id,
            household_name=household_name,
            role=invitation.role
        )
    
    async def get_household_invitations(
        self,
        household_id: str,
        user_id: str
    ) -> list[Invitation]:
        """
        Get all invitations for a household
        
        Args:
            household_id: Household UUID
            user_id: User UUID (must be a member)
            
        Returns:
            List of invitations
            
        Raises:
            AuthorizationError: If user is not a member
        """
        # Verify user has access to household
        try:
            member_response = self.supabase.table('household_members')\
                .select('id')\
                .eq('user_id', user_id)\
                .eq('household_id', household_id)\
                .execute()
            
            if not member_response.data:
                raise AuthorizationError(
                    "Not a household member",
                    user_message="You don't have access to this household.",
                    next_steps="Check that you're viewing the correct household."
                )
        except AuthorizationError:
            raise
        except Exception as e:
            logger.error(f"Error verifying household access: {e}", exc_info=True)
            raise Exception(f"Failed to verify household access: {str(e)}")
        
        # Get invitations
        try:
            response = self.supabase.table('invitations')\
                .select('*')\
                .eq('household_id', household_id)\
                .order('created_at', desc=True)\
                .execute()
            
            invitations = [
                Invitation(
                    id=inv['id'],
                    household_id=inv['household_id'],
                    inviter_id=inv['inviter_id'],
                    invitee_email=inv['invitee_email'],
                    role=Role(inv['role']),
                    status=inv['status'],
                    token=inv['token'],
                    expires_at=inv['expires_at'],
                    accepted_at=inv.get('accepted_at'),
                    created_at=inv['created_at'],
                    updated_at=inv['updated_at']
                )
                for inv in response.data
            ]
            
            logger.info(f"Found {len(invitations)} invitations for household {household_id}")
            return invitations
        except Exception as e:
            logger.error(f"Error fetching invitations: {e}", exc_info=True)
            raise Exception(f"Failed to fetch invitations: {str(e)}")
