"""
Custom exception classes and error handlers
"""
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class SNAKrException(Exception):
    """Base exception for sNAKr application"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None,
        next_steps: Optional[str] = None
    ):
        self.message = message  # Technical message for logging
        self.status_code = status_code
        self.details = details or {}
        self.user_message = user_message or message  # User-friendly message
        self.next_steps = next_steps  # What the user should do next
        super().__init__(self.message)


class AuthenticationError(SNAKrException):
    """Authentication failed"""
    
    def __init__(
        self, 
        message: str = "Authentication failed", 
        details: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None,
        next_steps: Optional[str] = None
    ):
        super().__init__(
            message, 
            status.HTTP_401_UNAUTHORIZED, 
            details,
            user_message or "We couldn't verify your identity.",
            next_steps or "Please sign in again."
        )


class AuthorizationError(SNAKrException):
    """User not authorized to access resource"""
    
    def __init__(
        self, 
        message: str = "Not authorized to access this resource", 
        details: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None,
        next_steps: Optional[str] = None
    ):
        super().__init__(
            message, 
            status.HTTP_403_FORBIDDEN, 
            details,
            user_message or "You don't have permission to access this.",
            next_steps or "Check with your household admin if you need access."
        )


class NotFoundError(SNAKrException):
    """Resource not found"""
    
    def __init__(
        self, 
        message: str = "Resource not found", 
        details: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None,
        next_steps: Optional[str] = None
    ):
        super().__init__(
            message, 
            status.HTTP_404_NOT_FOUND, 
            details,
            user_message or "We couldn't find what you're looking for.",
            next_steps or "Double-check the item or try refreshing the page."
        )


class ValidationError(SNAKrException):
    """Validation error"""
    
    def __init__(
        self, 
        message: str = "Validation error", 
        details: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None,
        next_steps: Optional[str] = None
    ):
        super().__init__(
            message, 
            status.HTTP_422_UNPROCESSABLE_ENTITY, 
            details,
            user_message or "Some information doesn't look quite right.",
            next_steps or "Check your input and try again."
        )


class RateLimitError(SNAKrException):
    """Rate limit exceeded"""
    
    def __init__(
        self, 
        message: str = "Rate limit exceeded", 
        details: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None,
        next_steps: Optional[str] = None
    ):
        super().__init__(
            message, 
            status.HTTP_429_TOO_MANY_REQUESTS, 
            details,
            user_message or "You're moving a bit too fast for us.",
            next_steps or "Take a quick break and try again in a moment."
        )


async def snakr_exception_handler(request: Request, exc: SNAKrException) -> JSONResponse:
    """Handle custom sNAKr exceptions"""
    # Import here to avoid circular dependency
    from app.middleware.request_id import get_request_id
    
    request_id = get_request_id()
    
    logger.error(
        f"SNAKrException: {exc.message}",
        extra={
            "request_id": request_id,
            "status_code": exc.status_code,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method
        },
        exc_info=True
    )
    
    error_response = {
        "error": {
            "message": exc.user_message,
            "next_steps": exc.next_steps,
            "request_id": request_id
        }
    }
    
    # Include technical details in development mode
    if hasattr(request.app.state, "config") and getattr(request.app.state.config, "ENVIRONMENT", "production") == "development":
        error_response["error"]["technical_details"] = {
            "message": exc.message,
            "details": exc.details
        }
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions"""
    from app.middleware.request_id import get_request_id
    
    request_id = get_request_id()
    
    logger.error(
        f"HTTPException: {exc.detail}",
        extra={
            "request_id": request_id,
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    # Map common HTTP status codes to user-friendly messages
    user_messages = {
        400: ("Something's not quite right with your request.", "Check your input and try again."),
        401: ("We couldn't verify your identity.", "Please sign in again."),
        403: ("You don't have permission to access this.", "Check with your household admin if you need access."),
        404: ("We couldn't find what you're looking for.", "Double-check the item or try refreshing the page."),
        429: ("You're moving a bit too fast for us.", "Take a quick break and try again in a moment."),
        500: ("Something went wrong on our end.", "Please try again in a moment."),
        503: ("We're temporarily unavailable.", "Please try again in a few minutes.")
    }
    
    user_message, next_steps = user_messages.get(
        exc.status_code, 
        ("An unexpected error occurred.", "Please try again.")
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": user_message,
                "next_steps": next_steps,
                "request_id": request_id
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic validation errors"""
    from app.middleware.request_id import get_request_id
    
    request_id = get_request_id()
    
    logger.error(
        f"ValidationError: {exc.errors()}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method,
            "validation_errors": exc.errors()
        }
    )
    
    # Format validation errors in a user-friendly way
    error_messages = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        msg = error["msg"]
        error_messages.append(f"{field}: {msg}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "message": "Some information doesn't look quite right.",
                "next_steps": "Check the following fields and try again: " + ", ".join(error_messages),
                "request_id": request_id
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions"""
    from app.middleware.request_id import get_request_id
    
    request_id = get_request_id()
    
    logger.exception(
        f"Unexpected error: {str(exc)}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "Something went wrong on our end.",
                "next_steps": "Please try again in a moment. If this keeps happening, let us know.",
                "request_id": request_id
            }
        }
    )

