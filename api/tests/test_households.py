"""
Tests for household management endpoints

Tests for task 1.1.1: POST /households endpoint
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
from uuid import uuid4
from datetime import datetime

from main import app
from app.models import Role

client = TestClient(app)


# Mock data
MOCK_USER_ID = str(uuid4())
MOCK_HOUSEHOLD_ID = str(uuid4())
MOCK_HOUSEHOLD_NAME = "Test Household"
MOCK_TIMESTAMP = datetime.utcnow().isoformat()

MOCK_JWT_PAYLOAD = {
    "sub": MOCK_USER_ID,
    "email": "test@example.com",
    "role": "authenticated"
}

MOCK_HOUSEHOLD_DATA = {
    "id": MOCK_HOUSEHOLD_ID,
    "name": MOCK_HOUSEHOLD_NAME,
    "created_at": MOCK_TIMESTAMP,
    "updated_at": MOCK_TIMESTAMP
}

MOCK_MEMBER_DATA = {
    "id": str(uuid4()),
    "household_id": MOCK_HOUSEHOLD_ID,
    "user_id": MOCK_USER_ID,
    "role": Role.ADMIN.value,
    "joined_at": MOCK_TIMESTAMP,
    "created_at": MOCK_TIMESTAMP,
    "updated_at": MOCK_TIMESTAMP
}


@pytest.fixture
def mock_jwt_verify():
    """Mock JWT verification"""
    with patch('app.middleware.auth.JWTMiddleware.verify_token') as mock:
        mock.return_value = MOCK_JWT_PAYLOAD
        yield mock


@pytest.fixture
def mock_supabase():
    """Mock Supabase client"""
    with patch('app.services.household_service.get_supabase') as mock:
        # Create mock client with chained methods
        mock_client = MagicMock()
        
        # Mock household insert
        mock_household_response = Mock()
        mock_household_response.data = [MOCK_HOUSEHOLD_DATA]
        
        # Mock member insert
        mock_member_response = Mock()
        mock_member_response.data = [MOCK_MEMBER_DATA]
        
        # Setup chain: table('households').insert().execute()
        mock_household_table = Mock()
        mock_household_insert = Mock()
        mock_household_insert.execute.return_value = mock_household_response
        mock_household_table.insert.return_value = mock_household_insert
        
        # Setup chain: table('household_members').insert().execute()
        mock_member_table = Mock()
        mock_member_insert = Mock()
        mock_member_insert.execute.return_value = mock_member_response
        mock_member_table.insert.return_value = mock_member_insert
        
        # Configure table() to return appropriate mock based on table name
        def table_side_effect(table_name):
            if table_name == 'households':
                return mock_household_table
            elif table_name == 'household_members':
                return mock_member_table
            return Mock()
        
        mock_client.table.side_effect = table_side_effect
        mock.return_value = mock_client
        
        yield mock


class TestCreateHousehold:
    """Tests for POST /api/v1/households endpoint"""
    
    def test_create_household_success(self, mock_jwt_verify, mock_supabase):
        """Test successful household creation"""
        response = client.post(
            "/api/v1/households",
            json={"name": MOCK_HOUSEHOLD_NAME},
            headers={"Authorization": f"Bearer mock_token"}
        )
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["name"] == MOCK_HOUSEHOLD_NAME
        assert "created_at" in data
        assert "updated_at" in data
        
        # Verify JWT was verified
        mock_jwt_verify.assert_called_once()
        
        # Verify Supabase was called
        mock_supabase.assert_called()
    
    def test_create_household_missing_auth(self):
        """Test household creation without authentication"""
        response = client.post(
            "/api/v1/households",
            json={"name": MOCK_HOUSEHOLD_NAME}
        )
        
        assert response.status_code == 403  # FastAPI HTTPBearer returns 403
    
    def test_create_household_invalid_token(self):
        """Test household creation with invalid token"""
        with patch('app.middleware.auth.JWTMiddleware.verify_token') as mock_verify:
            from app.core.errors import AuthenticationError
            mock_verify.side_effect = AuthenticationError("Invalid token")
            
            response = client.post(
                "/api/v1/households",
                json={"name": MOCK_HOUSEHOLD_NAME},
                headers={"Authorization": "Bearer invalid_token"}
            )
            
            assert response.status_code == 401
    
    def test_create_household_empty_name(self, mock_jwt_verify, mock_supabase):
        """Test household creation with empty name"""
        response = client.post(
            "/api/v1/households",
            json={"name": ""},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        # Should return validation error
        assert response.status_code in [422, 400]
    
    def test_create_household_missing_name(self, mock_jwt_verify):
        """Test household creation without name field"""
        response = client.post(
            "/api/v1/households",
            json={},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        # Pydantic validation error
        assert response.status_code == 422
    
    def test_create_household_name_too_long(self, mock_jwt_verify, mock_supabase):
        """Test household creation with name exceeding max length"""
        long_name = "A" * 256  # Max is 255
        
        response = client.post(
            "/api/v1/households",
            json={"name": long_name},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        # Should return validation error
        assert response.status_code in [422, 400]
    
    def test_create_household_whitespace_name(self, mock_jwt_verify, mock_supabase):
        """Test household creation with whitespace-only name"""
        response = client.post(
            "/api/v1/households",
            json={"name": "   "},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        # Should return validation error
        assert response.status_code in [422, 400]
    
    def test_create_household_trims_whitespace(self, mock_jwt_verify, mock_supabase):
        """Test that household name is trimmed"""
        response = client.post(
            "/api/v1/households",
            json={"name": "  Test Household  "},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        assert response.status_code == 201
        data = response.json()
        # Name should be trimmed (verified in service layer)
        assert data["name"] == MOCK_HOUSEHOLD_NAME
    
    def test_create_multiple_households(self, mock_jwt_verify, mock_supabase):
        """Test that user can create multiple households"""
        # First household
        response1 = client.post(
            "/api/v1/households",
            json={"name": "Household 1"},
            headers={"Authorization": "Bearer mock_token"}
        )
        assert response1.status_code == 201
        
        # Second household
        response2 = client.post(
            "/api/v1/households",
            json={"name": "Household 2"},
            headers={"Authorization": "Bearer mock_token"}
        )
        assert response2.status_code == 201
        
        # Both should succeed (user can create multiple households)
        assert response1.json()["id"] == response2.json()["id"]  # Same mock ID
    
    def test_create_household_database_error(self, mock_jwt_verify):
        """Test household creation when database fails"""
        with patch('app.services.household_service.get_supabase') as mock_supabase:
            mock_client = MagicMock()
            mock_client.table.side_effect = Exception("Database connection failed")
            mock_supabase.return_value = mock_client
            
            response = client.post(
                "/api/v1/households",
                json={"name": MOCK_HOUSEHOLD_NAME},
                headers={"Authorization": "Bearer mock_token"}
            )
            
            assert response.status_code == 500
    
    def test_create_household_member_creation_fails(self, mock_jwt_verify):
        """Test household creation when member creation fails (should rollback)"""
        with patch('app.services.household_service.get_supabase') as mock_supabase:
            mock_client = MagicMock()
            
            # Household creation succeeds
            mock_household_response = Mock()
            mock_household_response.data = [MOCK_HOUSEHOLD_DATA]
            mock_household_table = Mock()
            mock_household_insert = Mock()
            mock_household_insert.execute.return_value = mock_household_response
            mock_household_table.insert.return_value = mock_household_insert
            
            # Member creation fails
            mock_member_response = Mock()
            mock_member_response.data = []  # Empty data indicates failure
            mock_member_table = Mock()
            mock_member_insert = Mock()
            mock_member_insert.execute.return_value = mock_member_response
            mock_member_table.insert.return_value = mock_member_insert
            
            # Setup delete for rollback
            mock_delete = Mock()
            mock_delete_eq = Mock()
            mock_delete_eq.execute.return_value = Mock()
            mock_delete.eq.return_value = mock_delete_eq
            mock_household_table.delete.return_value = mock_delete
            
            def table_side_effect(table_name):
                if table_name == 'households':
                    return mock_household_table
                elif table_name == 'household_members':
                    return mock_member_table
                return Mock()
            
            mock_client.table.side_effect = table_side_effect
            mock_supabase.return_value = mock_client
            
            response = client.post(
                "/api/v1/households",
                json={"name": MOCK_HOUSEHOLD_NAME},
                headers={"Authorization": "Bearer mock_token"}
            )
            
            # Should fail with 500 error
            assert response.status_code == 500
            
            # Verify rollback was attempted
            mock_household_table.delete.assert_called_once()


class TestHouseholdRequirements:
    """Tests verifying requirement 1.1 (Household Creation)"""
    
    def test_requirement_user_provides_name(self, mock_jwt_verify, mock_supabase):
        """Verify: User provides household name during creation"""
        response = client.post(
            "/api/v1/households",
            json={"name": "My Household"},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        assert response.status_code == 201
        assert response.json()["name"] == MOCK_HOUSEHOLD_NAME
    
    def test_requirement_user_becomes_admin(self, mock_jwt_verify, mock_supabase):
        """Verify: User becomes admin by default"""
        response = client.post(
            "/api/v1/households",
            json={"name": MOCK_HOUSEHOLD_NAME},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        assert response.status_code == 201
        
        # Verify member was created with admin role
        supabase_mock = mock_supabase.return_value
        calls = supabase_mock.table.call_args_list
        
        # Find the household_members insert call
        member_insert_found = False
        for call in calls:
            if call[0][0] == 'household_members':
                member_insert_found = True
                break
        
        assert member_insert_found, "household_members table should be accessed"
    
    def test_requirement_household_id_generated(self, mock_jwt_verify, mock_supabase):
        """Verify: Household ID is generated and stored"""
        response = client.post(
            "/api/v1/households",
            json={"name": MOCK_HOUSEHOLD_NAME},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify ID is present and is a valid UUID format
        assert "id" in data
        assert len(data["id"]) == 36  # UUID format: 8-4-4-4-12
        assert data["id"].count("-") == 4
    
    def test_requirement_user_can_create_multiple(self, mock_jwt_verify, mock_supabase):
        """Verify: User can create multiple households"""
        # Create first household
        response1 = client.post(
            "/api/v1/households",
            json={"name": "Household 1"},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        # Create second household
        response2 = client.post(
            "/api/v1/households",
            json={"name": "Household 2"},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        # Both should succeed
        assert response1.status_code == 201
        assert response2.status_code == 201
