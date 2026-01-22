"""
Health check endpoints
"""
from fastapi import APIRouter, status, Request, Depends
from datetime import datetime
from typing import Dict, Any

from app.middleware.rate_limit import limiter, get_rate_limit_status

router = APIRouter(tags=["health"])


@router.get("/health", status_code=status.HTTP_200_OK)
@limiter.limit("100/minute")  # Apply rate limiting
async def health_check(request: Request) -> Dict[str, Any]:
    """
    Health check endpoint for monitoring and Docker healthcheck
    
    This endpoint is used by:
    - Docker healthcheck to verify container health
    - Load balancers to check service availability
    - Monitoring systems to track uptime
    
    **Rate Limit:** 100 requests per minute per IP
    
    **Authentication:** Not required
    
    Returns:
        dict: Health status information including:
            - status: "healthy" if service is operational
            - service: Service name
            - version: Current API version
            - timestamp: Current UTC timestamp
    
    Example Response:
        ```json
        {
          "status": "healthy",
          "service": "snakr-api",
          "version": "0.1.0",
          "timestamp": "2024-01-15T10:30:00.000000"
        }
        ```
    """
    return {
        "status": "healthy",
        "service": "snakr-api",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/", status_code=status.HTTP_200_OK)
async def root() -> Dict[str, str]:
    """
    Root endpoint with API information and navigation links
    
    Provides quick links to API documentation and key endpoints.
    
    **Authentication:** Not required
    
    Returns:
        dict: Welcome message and navigation links
    
    Example Response:
        ```json
        {
          "message": "Welcome to sNAKr API",
          "docs": "/docs",
          "redoc": "/redoc",
          "health": "/health",
          "api_v1": "/api/v1"
        }
        ```
    """
    return {
        "message": "Welcome to sNAKr API",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "api_v1": "/api/v1"
    }


@router.get("/rate-limit-status", status_code=status.HTTP_200_OK)
async def rate_limit_status(request: Request) -> Dict[str, Any]:
    """
    Get current rate limit status for debugging
    
    Returns information about rate limiting configuration and current status.
    Useful for debugging rate limit issues.
    
    **Authentication:** Not required
    
    **Rate Limit:** 100 requests per minute per IP
    
    Returns:
        dict: Rate limit configuration and status including:
            - rate_limiting: Current rate limit status
            - message: Information about rate limiting
    
    Example Response:
        ```json
        {
          "rate_limiting": {
            "enabled": true,
            "limit": "100/minute",
            "remaining": 95,
            "reset": "2024-01-15T10:31:00"
          },
          "message": "Rate limiting is active for all API endpoints"
        }
        ```
    """
    status_info = get_rate_limit_status(request)
    
    return {
        "rate_limiting": status_info,
        "message": "Rate limiting is active for all API endpoints"
    }
