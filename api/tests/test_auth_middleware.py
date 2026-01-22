"""
Tests for JWT authentication middleware
"""
import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
import jwt
from uuid import uuid4

from app.middleware.auth import (
    JWTMiddleware,
    get_current_user,
    get_current_user_id,
    verify_household_access,
    get_optional_user
)
from app.core.errors import AuthenticationError, AuthorizationError
from fastapi.security import HTTPAuthorizationCredentials


class TestJWTMiddleware:
    """Test JWT middleware"""
    
    @patch('app.middleware.auth.settings')
    def test_verify_token_success(self, mock_settings):
        """Test successful token verification"""
        mock_settings.SUPABASE_JWT_SECRET = "test-secret"
        
        user_id = str(uuid4())
        payload = {
            "sub": user_id,
            "email": "test@example.com",
            "role": "authenticated",
            "aud": "authenticated",
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        
        token = jwt.encode(payload, "test-secret", algorithm="HS256")
        
        result = JWTMiddleware.verify_token(token)
        assert result["sub"] == user_id
        assert result["email"] == "test@example.com"
    
    @patch('app.middleware.auth.settings')
    def test_verify_token_expired(self, mock_settings):
        """Test expired token"""
        mock_settings.SUPABASE_JWT_SECRET = "test-secret"
        
        payload = {
            "sub": str(uuid4()),
            "aud": "authenticated",
            "exp": datetime.utcnow() - timedelta(hours=1)  # Expired
        }
        
        token = jwt.encode(payload, "test-secret", algorithm="HS256")
        
        with pytest.raises(AuthenticationError, match="Token has expired"):
            JWTMiddleware.verify_token(token)
    
    @patch('app.middleware.auth.settings')
    def test_verify_token_invalid(self, mock_settings):
        """Test invalid token"""
        mock_settings.SUPABASE_JWT_SECRET = "test-secret"
        
        with pytest.raises(AuthenticationError, match="Invalid authentication token"):
            JWTMiddleware.verify_token("invalid-token")
    
    @patch('app.middleware.auth.settings')
    def test_verify_token_wrong_secret(self, mock_settings):
        """Test token with wrong secret"""
        mock_settings.SUPABASE_JWT_SECRET = "test-secret"
        
        payload = {
            "sub": str(uuid4()),
            "aud": "authenticated",
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        
        token = jwt.encode(payload, "wrong-secret", algorithm="HS256")
        
        with pytest.raises(AuthenticationError):
            JWTMiddleware.verify_token(token)
    
    def test_get_user_id(self):
        """Test extracting user ID from payload"""
        user_id = str(uuid4())
        payload = {"sub": user_id, "email": "test@example.com"}
        
        result = JWTMiddleware.get_user_id(payload)
        assert result == user_id
    
    def test_get_user_id_missing(self):
        """Test error when user ID missing"""
        payload = {"email": "test@example.com"}
        
        with pytest.raises(AuthenticationError, match="User ID not found"):
            JWTMiddleware.get_user_id(payload)
    
    def test_get_user_email(self):
        """Test extracting user email from payload"""
        payload = {"sub": str(uuid4()), "email": "test@example.com"}
        
        result = JWTMiddleware.get_user_email(payload)
        assert result == "test@example.com"
    
    def test_get_user_email_missing(self):
        """Test email returns None when missing"""
        payload = {"sub": str(uuid4())}
        
        result = JWTMiddleware.get_user_email(payload)
        assert result is None
    
    def test_get_user_role(self):
        """Test extracting user role from payload"""
        payload = {"sub": str(uuid4()), "role": "authenticated"}
        
        result = JWTMiddleware.get_user_role(payload)
        assert result == "authenticated"


class TestAuthDependencies:
    """Test authentication dependencies"""
    
    @pytest.mark.asyncio
    @patch('app.middleware.auth.JWTMiddleware.verify_token')
    async def test_get_current_user(self, mock_verify):
        """Test get_current_user dependency"""
        user_id = str(uuid4())
        payload = {"sub": user_id, "email": "test@example.com"}
        mock_verify.return_value = payload
        
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="test-token"
        )
        
        result = await get_current_user(credentials)
        assert result == payload
        mock_verify.assert_called_once_with("test-token")
    
    @pytest.mark.asyncio
    async def test_get_current_user_no_credentials(self):
        """Test get_current_user without credentials"""
        with pytest.raises(AuthenticationError, match="No authentication credentials"):
            await get_current_user(None)
    
    @pytest.mark.asyncio
    @patch('app.middleware.auth.JWTMiddleware.verify_token')
    @patch('app.middleware.auth.JWTMiddleware.get_user_id')
    async def test_get_current_user_id(self, mock_get_user_id, mock_verify):
        """Test get_current_user_id dependency"""
        user_id = str(uuid4())
        payload = {"sub": user_id}
        mock_verify.return_value = payload
        mock_get_user_id.return_value = user_id
        
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="test-token"
        )
        
        result = await get_current_user_id(credentials)
        assert result == user_id
    
    @pytest.mark.asyncio
    @patch('app.middleware.auth.DatabaseHelper.verify_user_household_access')
    @patch('app.middleware.auth.JWTMiddleware.verify_token')
    @patch('app.middleware.auth.JWTMiddleware.get_user_id')
    async def test_verify_household_access_success(
        self,
        mock_get_user_id,
        mock_verify,
        mock_verify_access
    ):
        """Test successful household access verification"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        payload = {"sub": user_id}
        
        mock_verify.return_value = payload
        mock_get_user_id.return_value = user_id
        mock_verify_access.return_value = True
        
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="test-token"
        )
        
        result = await verify_household_access(household_id, credentials)
        assert result is True
        mock_verify_access.assert_called_once_with(user_id, household_id)
    
    @pytest.mark.asyncio
    @patch('app.middleware.auth.DatabaseHelper.verify_user_household_access')
    @patch('app.middleware.auth.JWTMiddleware.verify_token')
    @patch('app.middleware.auth.JWTMiddleware.get_user_id')
    async def test_verify_household_access_denied(
        self,
        mock_get_user_id,
        mock_verify,
        mock_verify_access
    ):
        """Test denied household access"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        payload = {"sub": user_id}
        
        mock_verify.return_value = payload
        mock_get_user_id.return_value = user_id
        mock_verify_access.return_value = False
        
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="test-token"
        )
        
        with pytest.raises(AuthorizationError, match="don't have access"):
            await verify_household_access(household_id, credentials)
    
    @pytest.mark.asyncio
    @patch('app.middleware.auth.JWTMiddleware.verify_token')
    async def test_get_optional_user_authenticated(self, mock_verify):
        """Test get_optional_user with valid token"""
        user_id = str(uuid4())
        payload = {"sub": user_id}
        mock_verify.return_value = payload
        
        request = Mock()
        request.headers.get.return_value = "Bearer test-token"
        
        result = await get_optional_user(request)
        assert result == payload
    
    @pytest.mark.asyncio
    async def test_get_optional_user_no_auth(self):
        """Test get_optional_user without auth header"""
        request = Mock()
        request.headers.get.return_value = None
        
        result = await get_optional_user(request)
        assert result is None
    
    @pytest.mark.asyncio
    @patch('app.middleware.auth.JWTMiddleware.verify_token')
    async def test_get_optional_user_invalid_token(self, mock_verify):
        """Test get_optional_user with invalid token"""
        mock_verify.side_effect = AuthenticationError("Invalid token")
        
        request = Mock()
        request.headers.get.return_value = "Bearer invalid-token"
        
        result = await get_optional_user(request)
        assert result is None
