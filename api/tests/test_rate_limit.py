"""
Tests for rate limiting middleware
"""
import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from unittest.mock import Mock, patch

from app.middleware.rate_limit import (
    get_user_identifier,
    limiter,
    get_rate_limit_status,
    rate_limit_exceeded_handler
)
from app.core.config import settings


@pytest.fixture
def mock_request():
    """Create a mock request object"""
    request = Mock(spec=Request)
    request.state = Mock()
    request.client = Mock()
    request.client.host = "127.0.0.1"
    return request


@pytest.fixture
def test_app():
    """Create a test FastAPI app with rate limiting"""
    app = FastAPI()
    app.state.limiter = limiter
    
    @app.get("/test")
    @limiter.limit("5/minute")
    async def test_endpoint(request: Request):
        return {"message": "success"}
    
    @app.get("/test-authenticated")
    @limiter.limit("10/minute")
    async def test_authenticated_endpoint(request: Request):
        # Simulate authenticated user
        request.state.user_id = "test-user-123"
        return {"message": "authenticated success"}
    
    # Add rate limit exceeded handler
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    
    return app


class TestGetUserIdentifier:
    """Tests for get_user_identifier function"""
    
    def test_authenticated_user(self, mock_request):
        """Test identifier for authenticated user"""
        mock_request.state.user_id = "user-123"
        
        identifier = get_user_identifier(mock_request)
        
        assert identifier == "user:user-123"
    
    def test_unauthenticated_user(self, mock_request):
        """Test identifier for unauthenticated user (IP-based)"""
        mock_request.state.user_id = None
        
        identifier = get_user_identifier(mock_request)
        
        assert identifier.startswith("ip:")
        assert "127.0.0.1" in identifier
    
    def test_no_user_id_attribute(self, mock_request):
        """Test when user_id attribute doesn't exist"""
        delattr(mock_request.state, "user_id")
        
        identifier = get_user_identifier(mock_request)
        
        assert identifier.startswith("ip:")


class TestGetRateLimitStatus:
    """Tests for get_rate_limit_status function"""
    
    def test_rate_limit_status(self, mock_request):
        """Test getting rate limit status"""
        mock_request.state.user_id = "user-123"
        
        status = get_rate_limit_status(mock_request)
        
        assert "identifier" in status
        assert "limit" in status
        assert "window" in status
        assert "enabled" in status
        assert status["identifier"] == "user:user-123"
        assert status["limit"] == settings.RATE_LIMIT_PER_MINUTE
        assert status["window"] == "1 minute"


class TestRateLimitExceededHandler:
    """Tests for rate_limit_exceeded_handler"""
    
    @pytest.mark.asyncio
    async def test_handler_response(self, mock_request):
        """Test rate limit exceeded handler returns proper response"""
        from slowapi import Limiter
        from slowapi.util import get_remote_address
        from fastapi.responses import JSONResponse
        
        mock_request.state.user_id = "user-123"
        
        # Create a mock limit object
        mock_limit = Mock()
        mock_limit.error_message = None
        
        exc = RateLimitExceeded(mock_limit)
        
        response = await rate_limit_exceeded_handler(mock_request, exc)
        
        assert isinstance(response, JSONResponse)
        assert response.status_code == 429
        
        # Parse the response body
        import json
        body = json.loads(response.body.decode())
        
        assert "error" in body
        assert body["error"] == "rate_limit_exceeded"
        assert "message" in body
        assert "detail" in body
        assert "retry_after" in body
        assert "60 seconds" in body["retry_after"]


class TestRateLimitIntegration:
    """Integration tests for rate limiting"""
    
    def test_rate_limit_not_exceeded(self, test_app):
        """Test that requests within limit succeed"""
        client = TestClient(test_app)
        
        # Make 3 requests (limit is 5/minute)
        for i in range(3):
            response = client.get("/test")
            assert response.status_code == 200
            assert response.json() == {"message": "success"}
    
    def test_rate_limit_exceeded(self, test_app):
        """Test that requests exceeding limit are blocked"""
        client = TestClient(test_app)
        
        # Make 6 requests (limit is 5/minute)
        responses = []
        for i in range(6):
            response = client.get("/test")
            responses.append(response)
        
        # First 5 should succeed
        for i in range(5):
            assert responses[i].status_code == 200
        
        # 6th should be rate limited
        assert responses[5].status_code == 429
        response_data = responses[5].json()
        assert response_data["error"] == "rate_limit_exceeded"
    
    def test_rate_limit_per_user(self, test_app):
        """Test that rate limits are per user/IP"""
        client = TestClient(test_app)
        
        # This test verifies the concept, but in practice
        # TestClient uses the same IP for all requests
        # In production, different users/IPs have separate limits
        
        response = client.get("/test")
        assert response.status_code == 200


class TestRateLimitConfiguration:
    """Tests for rate limit configuration"""
    
    def test_rate_limit_enabled_setting(self):
        """Test that rate limit can be enabled/disabled"""
        assert isinstance(settings.RATE_LIMIT_ENABLED, bool)
    
    def test_rate_limit_per_minute_setting(self):
        """Test rate limit per minute configuration"""
        assert settings.RATE_LIMIT_PER_MINUTE > 0
        assert settings.RATE_LIMIT_PER_MINUTE == 100  # As per requirements
    
    def test_limiter_configuration(self):
        """Test limiter is properly configured"""
        assert limiter is not None
        assert limiter._key_func == get_user_identifier


class TestRateLimitWithAuthentication:
    """Tests for rate limiting with authenticated users"""
    
    def test_different_users_separate_limits(self):
        """Test that different users have separate rate limits"""
        # This is a conceptual test - in practice, different users
        # would have different JWT tokens and thus different identifiers
        
        request1 = Mock(spec=Request)
        request1.state = Mock()
        request1.state.user_id = "user-1"
        request1.client = Mock()
        request1.client.host = "127.0.0.1"
        
        request2 = Mock(spec=Request)
        request2.state = Mock()
        request2.state.user_id = "user-2"
        request2.client = Mock()
        request2.client.host = "127.0.0.1"
        
        identifier1 = get_user_identifier(request1)
        identifier2 = get_user_identifier(request2)
        
        assert identifier1 != identifier2
        assert identifier1 == "user:user-1"
        assert identifier2 == "user:user-2"


class TestRateLimitEdgeCases:
    """Tests for edge cases in rate limiting"""
    
    def test_missing_client_info(self):
        """Test handling of missing client information"""
        request = Mock(spec=Request)
        request.state = Mock()
        request.state.user_id = None
        request.client = None
        
        # Should not raise an error, should use fallback
        try:
            identifier = get_user_identifier(request)
            # If it doesn't raise, that's good
            assert identifier is not None
        except Exception:
            # If it raises, we need to handle this case better
            pytest.fail("Should handle missing client info gracefully")
    
    def test_empty_user_id(self, mock_request):
        """Test handling of empty user ID"""
        mock_request.state.user_id = ""
        
        identifier = get_user_identifier(mock_request)
        
        # Empty string is falsy, should fall back to IP
        assert identifier.startswith("ip:")
    
    def test_none_user_id(self, mock_request):
        """Test handling of None user ID"""
        mock_request.state.user_id = None
        
        identifier = get_user_identifier(mock_request)
        
        assert identifier.startswith("ip:")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
