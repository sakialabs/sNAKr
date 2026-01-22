"""
Supabase client service for database and storage operations
"""
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
import logging

from app.core.config import settings
from app.core.errors import AuthenticationError, NotFoundError

logger = logging.getLogger(__name__)


class SupabaseService:
    """Supabase client wrapper for database and storage operations"""
    
    _client: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """
        Get or create Supabase client instance (singleton pattern)
        
        Returns:
            Client: Supabase client instance
            
        Raises:
            ValueError: If SUPABASE_URL or SUPABASE_KEY not set
        """
        if cls._client is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_KEY must be set in environment variables"
                )
            
            cls._client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
            logger.info("Supabase client initialized")
        
        return cls._client
    
    @classmethod
    def reset_client(cls) -> None:
        """Reset the client instance (useful for testing)"""
        cls._client = None
        logger.info("Supabase client reset")


class DatabaseHelper:
    """Helper methods for common database operations"""
    
    @staticmethod
    def get_supabase() -> Client:
        """Get Supabase client instance"""
        return SupabaseService.get_client()
    
    @staticmethod
    async def verify_user_household_access(
        user_id: str,
        household_id: str
    ) -> bool:
        """
        Verify user has access to household
        
        Args:
            user_id: User UUID
            household_id: Household UUID
            
        Returns:
            bool: True if user has access, False otherwise
        """
        supabase = SupabaseService.get_client()
        
        try:
            response = supabase.table('household_members')\
                .select('id')\
                .eq('user_id', user_id)\
                .eq('household_id', household_id)\
                .execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error verifying household access: {e}")
            return False
    
    @staticmethod
    async def get_user_households(user_id: str) -> List[Dict[str, Any]]:
        """
        Get all households for a user
        
        Args:
            user_id: User UUID
            
        Returns:
            List of household dictionaries
        """
        supabase = SupabaseService.get_client()
        
        try:
            response = supabase.table('household_members')\
                .select('household_id, role, households(*)')\
                .eq('user_id', user_id)\
                .execute()
            
            return response.data
        except Exception as e:
            logger.error(f"Error fetching user households: {e}")
            return []
    
    @staticmethod
    async def insert_with_rls(
        table: str,
        data: Dict[str, Any],
        user_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Insert data with RLS enforcement
        
        Args:
            table: Table name
            data: Data to insert
            user_token: Optional JWT token for RLS context
            
        Returns:
            Inserted record
            
        Raises:
            NotFoundError: If insert fails
        """
        supabase = SupabaseService.get_client()
        
        try:
            # If user token provided, create client with user context
            if user_token:
                client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY,
                    options={"headers": {"Authorization": f"Bearer {user_token}"}}
                )
                response = client.table(table).insert(data).execute()
            else:
                response = supabase.table(table).insert(data).execute()
            
            if not response.data:
                raise NotFoundError(f"Failed to insert into {table}")
            
            return response.data[0]
        except Exception as e:
            logger.error(f"Error inserting into {table}: {e}")
            raise
    
    @staticmethod
    async def update_with_rls(
        table: str,
        record_id: str,
        data: Dict[str, Any],
        user_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update data with RLS enforcement
        
        Args:
            table: Table name
            record_id: Record UUID
            data: Data to update
            user_token: Optional JWT token for RLS context
            
        Returns:
            Updated record
            
        Raises:
            NotFoundError: If update fails or record not found
        """
        supabase = SupabaseService.get_client()
        
        try:
            if user_token:
                client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_KEY,
                    options={"headers": {"Authorization": f"Bearer {user_token}"}}
                )
                response = client.table(table).update(data).eq('id', record_id).execute()
            else:
                response = supabase.table(table).update(data).eq('id', record_id).execute()
            
            if not response.data:
                raise NotFoundError(f"Record not found in {table}")
            
            return response.data[0]
        except Exception as e:
            logger.error(f"Error updating {table}: {e}")
            raise


# Convenience function to get client
def get_supabase() -> Client:
    """
    Get Supabase client instance
    
    Returns:
        Client: Supabase client instance
    """
    return SupabaseService.get_client()


# Convenience function to get database helper
def get_db_helper() -> DatabaseHelper:
    """
    Get database helper instance
    
    Returns:
        DatabaseHelper: Database helper instance
    """
    return DatabaseHelper()

