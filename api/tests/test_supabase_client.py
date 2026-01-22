"""
Tests for Supabase client service
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from uuid import uuid4

from app.services.supabase_client import (
    SupabaseService,
    DatabaseHelper,
    get_supabase,
    get_db_helper
)
from app.core.errors import NotFoundError


class TestSupabaseService:
    """Test Supabase service"""
    
    def setup_method(self):
        """Reset client before each test"""
        SupabaseService.reset_client()
    
    @patch('app.services.supabase_client.create_client')
    @patch('app.services.supabase_client.settings')
    def test_get_client_creates_singleton(self, mock_settings, mock_create_client):
        """Test client is created as singleton"""
        mock_settings.SUPABASE_URL = "https://test.supabase.co"
        mock_settings.SUPABASE_KEY = "test-key"
        mock_client = Mock()
        mock_create_client.return_value = mock_client
        
        # First call creates client
        client1 = SupabaseService.get_client()
        assert client1 == mock_client
        assert mock_create_client.call_count == 1
        
        # Second call returns same client
        client2 = SupabaseService.get_client()
        assert client2 == mock_client
        assert mock_create_client.call_count == 1  # Not called again
    
    @patch('app.services.supabase_client.settings')
    def test_get_client_raises_without_credentials(self, mock_settings):
        """Test client raises error without credentials"""
        mock_settings.SUPABASE_URL = ""
        mock_settings.SUPABASE_KEY = ""
        
        with pytest.raises(ValueError, match="SUPABASE_URL and SUPABASE_KEY must be set"):
            SupabaseService.get_client()
    
    @patch('app.services.supabase_client.create_client')
    @patch('app.services.supabase_client.settings')
    def test_reset_client(self, mock_settings, mock_create_client):
        """Test client can be reset"""
        mock_settings.SUPABASE_URL = "https://test.supabase.co"
        mock_settings.SUPABASE_KEY = "test-key"
        mock_client = Mock()
        mock_create_client.return_value = mock_client
        
        # Create client
        SupabaseService.get_client()
        assert SupabaseService._client is not None
        
        # Reset client
        SupabaseService.reset_client()
        assert SupabaseService._client is None
    
    @patch('app.services.supabase_client.create_client')
    @patch('app.services.supabase_client.settings')
    def test_get_supabase_convenience_function(self, mock_settings, mock_create_client):
        """Test convenience function returns client"""
        mock_settings.SUPABASE_URL = "https://test.supabase.co"
        mock_settings.SUPABASE_KEY = "test-key"
        mock_client = Mock()
        mock_create_client.return_value = mock_client
        
        client = get_supabase()
        assert client == mock_client


class TestDatabaseHelper:
    """Test database helper methods"""
    
    @pytest.mark.asyncio
    @patch('app.services.supabase_client.SupabaseService.get_client')
    async def test_verify_user_household_access_success(self, mock_get_client):
        """Test successful household access verification"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        
        # Mock Supabase response
        mock_client = Mock()
        mock_table = Mock()
        mock_select = Mock()
        mock_eq1 = Mock()
        mock_eq2 = Mock()
        mock_execute = Mock()
        
        mock_execute.data = [{"id": str(uuid4())}]
        mock_eq2.execute.return_value = mock_execute
        mock_eq1.eq.return_value = mock_eq2
        mock_select.eq.return_value = mock_eq1
        mock_table.select.return_value = mock_select
        mock_client.table.return_value = mock_table
        mock_get_client.return_value = mock_client
        
        result = await DatabaseHelper.verify_user_household_access(user_id, household_id)
        assert result is True
    
    @pytest.mark.asyncio
    @patch('app.services.supabase_client.SupabaseService.get_client')
    async def test_verify_user_household_access_failure(self, mock_get_client):
        """Test failed household access verification"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        
        # Mock Supabase response with no data
        mock_client = Mock()
        mock_table = Mock()
        mock_select = Mock()
        mock_eq1 = Mock()
        mock_eq2 = Mock()
        mock_execute = Mock()
        
        mock_execute.data = []
        mock_eq2.execute.return_value = mock_execute
        mock_eq1.eq.return_value = mock_eq2
        mock_select.eq.return_value = mock_eq1
        mock_table.select.return_value = mock_select
        mock_client.table.return_value = mock_table
        mock_get_client.return_value = mock_client
        
        result = await DatabaseHelper.verify_user_household_access(user_id, household_id)
        assert result is False
    
    @pytest.mark.asyncio
    @patch('app.services.supabase_client.SupabaseService.get_client')
    async def test_get_user_households(self, mock_get_client):
        """Test fetching user households"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        
        # Mock Supabase response
        mock_client = Mock()
        mock_table = Mock()
        mock_select = Mock()
        mock_eq = Mock()
        mock_execute = Mock()
        
        mock_execute.data = [
            {
                "household_id": household_id,
                "role": "admin",
                "households": {"id": household_id, "name": "Test Household"}
            }
        ]
        mock_eq.execute.return_value = mock_execute
        mock_select.eq.return_value = mock_eq
        mock_table.select.return_value = mock_select
        mock_client.table.return_value = mock_table
        mock_get_client.return_value = mock_client
        
        result = await DatabaseHelper.get_user_households(user_id)
        assert len(result) == 1
        assert result[0]["household_id"] == household_id
        assert result[0]["role"] == "admin"
    
    @pytest.mark.asyncio
    @patch('app.services.supabase_client.SupabaseService.get_client')
    async def test_insert_with_rls(self, mock_get_client):
        """Test insert with RLS"""
        # Mock Supabase response
        mock_client = Mock()
        mock_table = Mock()
        mock_insert = Mock()
        mock_execute = Mock()
        
        inserted_data = {"id": str(uuid4()), "name": "Test"}
        mock_execute.data = [inserted_data]
        mock_insert.execute.return_value = mock_execute
        mock_table.insert.return_value = mock_insert
        mock_client.table.return_value = mock_table
        mock_get_client.return_value = mock_client
        
        result = await DatabaseHelper.insert_with_rls("test_table", {"name": "Test"})
        assert result == inserted_data
    
    @pytest.mark.asyncio
    @patch('app.services.supabase_client.SupabaseService.get_client')
    async def test_insert_with_rls_failure(self, mock_get_client):
        """Test insert with RLS failure"""
        # Mock Supabase response with no data
        mock_client = Mock()
        mock_table = Mock()
        mock_insert = Mock()
        mock_execute = Mock()
        
        mock_execute.data = []
        mock_insert.execute.return_value = mock_execute
        mock_table.insert.return_value = mock_insert
        mock_client.table.return_value = mock_table
        mock_get_client.return_value = mock_client
        
        with pytest.raises(NotFoundError):
            await DatabaseHelper.insert_with_rls("test_table", {"name": "Test"})
    
    @pytest.mark.asyncio
    @patch('app.services.supabase_client.SupabaseService.get_client')
    async def test_update_with_rls(self, mock_get_client):
        """Test update with RLS"""
        record_id = str(uuid4())
        
        # Mock Supabase response
        mock_client = Mock()
        mock_table = Mock()
        mock_update = Mock()
        mock_eq = Mock()
        mock_execute = Mock()
        
        updated_data = {"id": record_id, "name": "Updated"}
        mock_execute.data = [updated_data]
        mock_eq.execute.return_value = mock_execute
        mock_update.eq.return_value = mock_eq
        mock_table.update.return_value = mock_update
        mock_client.table.return_value = mock_table
        mock_get_client.return_value = mock_client
        
        result = await DatabaseHelper.update_with_rls("test_table", record_id, {"name": "Updated"})
        assert result == updated_data
    
    def test_get_db_helper_convenience_function(self):
        """Test convenience function returns helper"""
        helper = get_db_helper()
        assert isinstance(helper, DatabaseHelper)
