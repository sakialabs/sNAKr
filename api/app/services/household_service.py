"""
Household service for business logic

This service handles household creation, member management, and role updates.
It ensures proper multi-tenant isolation and enforces business rules.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
import logging

from app.services.supabase_client import get_supabase
from app.models import Household, Role
from app.core.errors import NotFoundError, ValidationError, AuthorizationError

logger = logging.getLogger(__name__)


class HouseholdService:
    """Service for household management operations"""
    
    def __init__(self):
        self.supabase = get_supabase()
    
    async def create_household(
        self,
        name: str,
        user_id: str
    ) -> Household:
        """
        Create a new household with the user as admin
        
        This implements requirement 1.1 (Household Creation):
        - User provides household name during creation
        - User becomes admin by default
        - Household ID is generated and stored
        - User can create multiple households
        
        Args:
            name: Household name
            user_id: User UUID who is creating the household
            
        Returns:
            Created household
            
        Raises:
            ValidationError: If name is invalid
            Exception: If database operation fails
        """
        # Validate name
        if not name or not name.strip():
            raise ValidationError(
                "Household name cannot be empty",
                user_message="Please provide a name for your household.",
                next_steps="Enter a household name and try again."
            )
        
        if len(name) > 255:
            raise ValidationError(
                "Household name too long",
                user_message="Household name is too long.",
                next_steps="Please use a shorter name (max 255 characters)."
            )
        
        try:
            # Create household
            household_response = self.supabase.table('households')\
                .insert({'name': name.strip()})\
                .execute()
            
            if not household_response.data:
                raise Exception("Failed to create household")
            
            household_data = household_response.data[0]
            household_id = household_data['id']
            
            logger.info(f"Household {household_id} created with name '{name}'")
            
            # Add user as admin member
            member_response = self.supabase.table('household_members')\
                .insert({
                    'household_id': household_id,
                    'user_id': user_id,
                    'role': Role.ADMIN.value
                })\
                .execute()
            
            if not member_response.data:
                # Rollback: delete the household if member creation fails
                logger.error(f"Failed to add user {user_id} as admin to household {household_id}")
                self.supabase.table('households').delete().eq('id', household_id).execute()
                raise Exception("Failed to add user as household admin")
            
            logger.info(f"User {user_id} added as admin to household {household_id}")
            
            # Return household model
            return Household(
                id=household_data['id'],
                name=household_data['name'],
                created_at=household_data['created_at'],
                updated_at=household_data['updated_at']
            )
            
        except ValidationError:
            # Re-raise validation errors
            raise
        except Exception as e:
            logger.error(f"Error creating household: {e}", exc_info=True)
            raise Exception(f"Failed to create household: {str(e)}")

    
    async def get_user_households(self, user_id: str) -> list[Household]:
        """
        Get all households that a user belongs to
        
        This implements requirement 1.4 (Multi-Tenant Isolation):
        - Users only see households they belong to
        - RLS policies enforce household boundaries
        
        Args:
            user_id: User UUID
            
        Returns:
            List of households the user is a member of
            
        Raises:
            Exception: If database operation fails
        """
        try:
            # Get household IDs where user is a member
            members_response = self.supabase.table('household_members')\
                .select('household_id')\
                .eq('user_id', user_id)\
                .execute()
            
            if not members_response.data:
                logger.info(f"User {user_id} has no households")
                return []
            
            household_ids = [m['household_id'] for m in members_response.data]
            
            # Get household details
            households_response = self.supabase.table('households')\
                .select('*')\
                .in_('id', household_ids)\
                .execute()
            
            if not households_response.data:
                return []
            
            households = [
                Household(
                    id=h['id'],
                    name=h['name'],
                    created_at=h['created_at'],
                    updated_at=h['updated_at']
                )
                for h in households_response.data
            ]
            
            logger.info(f"Found {len(households)} households for user {user_id}")
            return households
            
        except Exception as e:
            logger.error(f"Error fetching households for user {user_id}: {e}", exc_info=True)
            raise Exception(f"Failed to fetch households: {str(e)}")
