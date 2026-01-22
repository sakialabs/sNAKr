"""
Rate limiting middleware for API endpoints

Implements rate limiting per user (100 requests/minute) as specified in requirements.
Uses slowapi library for rate limiting with in-memory storage (development) 
and Redis support (production).
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_user_identifier(request: Request) -> str:
    """
    Get unique identifier for rate limiting
    
    Priority:
    1. User ID from JWT token (if authenticated)
    2. IP address (if not authenticated)
    
    Args:
        request: FastAPI request object
        
    Returns:
        Unique identifier string for rate limiting
    """
    # Try to get user ID from request state (set by auth middleware)
    user_id = getattr(request.state, "user_id", None)
    
    if user_id:
        logger.debug(f"Rate limiting by user_id: {user_id}")
        return f"user:{user_id}"
    
    # Fallback to IP address for unauthenticated requests
    ip_address = get_remote_address(request)
    logger.debug(f"Rate limiting by IP: {ip_address}")
    return f"ip:{ip_address}"


# Create limiter instance
# Default: 100 requests per minute per user (as per requirements)
limiter = Limiter(
    key_func=get_user_identifier,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
    enabled=settings.RATE_LIMIT_ENABLED,
    storage_uri="memory://"  # Use in-memory storage for development
    # For production with Redis: storage_uri="redis://localhost:6379"
)


def get_rate_limit_status(request: Request) -> dict:
    """
    Get current rate limit status for debugging
    
    Args:
        request: FastAPI request object
        
    Returns:
        Dict with rate limit information
    """
    identifier = get_user_identifier(request)
    
    return {
        "identifier": identifier,
        "limit": settings.RATE_LIMIT_PER_MINUTE,
        "window": "1 minute",
        "enabled": settings.RATE_LIMIT_ENABLED
    }


# Custom rate limit exceeded handler
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """
    Custom handler for rate limit exceeded errors
    
    Args:
        request: FastAPI request object
        exc: RateLimitExceeded exception
        
    Returns:
        JSON response with error details
    """
    from fastapi.responses import JSONResponse
    
    identifier = get_user_identifier(request)
    logger.warning(f"Rate limit exceeded for {identifier}")
    
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please try again later.",
            "detail": f"Rate limit: {settings.RATE_LIMIT_PER_MINUTE} requests per minute",
            "retry_after": "60 seconds"
        }
    )
