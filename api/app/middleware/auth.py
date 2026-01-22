"""
JWT authentication middleware for Supabase
"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from jose import jwt
import logging

from app.core.config import settings
from app.core.errors import AuthenticationError, AuthorizationError

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer()


class JWTMiddleware:
    """JWT verification middleware for Supabase tokens"""
    
    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """
        Verify Supabase JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Dict containing decoded token payload
            
        Raises:
            AuthenticationError: If token is invalid or expired
        """
        if not settings.SUPABASE_JWT_SECRET:
            raise ValueError("SUPABASE_JWT_SECRET not configured")
        
        try:
            # Decode and verify JWT token
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
            
            logger.debug(f"Token verified for user: {payload.get('sub')}")
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            raise AuthenticationError("Token has expired")
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            raise AuthenticationError("Invalid authentication token")
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            raise AuthenticationError("Authentication failed")
    
    @staticmethod
    def get_user_id(payload: Dict[str, Any]) -> str:
        """
        Extract user ID from token payload
        
        Args:
            payload: Decoded JWT payload
            
        Returns:
            User ID (UUID string)
            
        Raises:
            AuthenticationError: If user ID not found in payload
        """
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationError("User ID not found in token")
        return user_id
    
    @staticmethod
    def get_user_email(payload: Dict[str, Any]) -> Optional[str]:
        """
        Extract user email from token payload
        
        Args:
            payload: Decoded JWT payload
            
        Returns:
            User email or None
        """
        return payload.get("email")
    
    @staticmethod
    def get_user_role(payload: Dict[str, Any]) -> Optional[str]:
        """
        Extract user role from token payload
        
        Args:
            payload: Decoded JWT payload
            
        Returns:
            User role or None
        """
        return payload.get("role")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = security
) -> Dict[str, Any]:
    """
    Dependency to get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials from request
        
    Returns:
        Dict containing user information from token
        
    Raises:
        AuthenticationError: If authentication fails
        
    Usage:
        @app.get("/protected")
        async def protected_route(user: Dict = Depends(get_current_user)):
            user_id = user["sub"]
            return {"user_id": user_id}
    """
    if not credentials:
        raise AuthenticationError("No authentication credentials provided")
    
    token = credentials.credentials
    payload = JWTMiddleware.verify_token(token)
    
    return payload


async def get_current_user_id(
    user: Dict[str, Any] = security
) -> str:
    """
    Dependency to get current user ID from JWT token
    
    Args:
        user: User payload from get_current_user dependency
        
    Returns:
        User ID (UUID string)
        
    Usage:
        @app.get("/protected")
        async def protected_route(user_id: str = Depends(get_current_user_id)):
            return {"user_id": user_id}
    """
    if isinstance(user, HTTPAuthorizationCredentials):
        # If called directly with credentials
        token = user.credentials
        payload = JWTMiddleware.verify_token(token)
        return JWTMiddleware.get_user_id(payload)
    else:
        # If called with user payload
        return JWTMiddleware.get_user_id(user)


async def verify_household_access(
    household_id: str,
    user: Dict[str, Any] = security
) -> bool:
    """
    Dependency to verify user has access to household
    
    Args:
        household_id: Household UUID
        user: User payload from get_current_user dependency
        
    Returns:
        True if user has access
        
    Raises:
        AuthorizationError: If user doesn't have access
        
    Usage:
        @app.get("/households/{household_id}")
        async def get_household(
            household_id: str,
            user: Dict = Depends(get_current_user),
            _: bool = Depends(lambda: verify_household_access(household_id, user))
        ):
            return {"household_id": household_id}
    """
    from app.services.supabase_client import DatabaseHelper
    
    if isinstance(user, HTTPAuthorizationCredentials):
        token = user.credentials
        payload = JWTMiddleware.verify_token(token)
        user_id = JWTMiddleware.get_user_id(payload)
    else:
        user_id = JWTMiddleware.get_user_id(user)
    
    has_access = await DatabaseHelper.verify_user_household_access(user_id, household_id)
    
    if not has_access:
        logger.warning(f"User {user_id} attempted to access household {household_id} without permission")
        raise AuthorizationError(f"You don't have access to household {household_id}")
    
    return True


# Optional: Extract token from request without raising error
async def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    """
    Get user from request if authenticated, otherwise return None
    
    Args:
        request: FastAPI request object
        
    Returns:
        User payload or None if not authenticated
        
    Usage:
        @app.get("/optional-auth")
        async def optional_route(user: Optional[Dict] = Depends(get_optional_user)):
            if user:
                return {"authenticated": True, "user_id": user["sub"]}
            return {"authenticated": False}
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.replace("Bearer ", "")
    
    try:
        payload = JWTMiddleware.verify_token(token)
        return payload
    except AuthenticationError:
        return None
