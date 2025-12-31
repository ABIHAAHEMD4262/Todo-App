"""
JWT Authentication - Todo App Phase II
Referencing: @specs/features/authentication.md, @backend/CLAUDE.md
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlmodel import Session, select
from app.database import get_session
from app.models import User
import jwt
import os

security = HTTPBearer()

# Get shared secret from environment (same as frontend)
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")

if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is not set")

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Verify JWT token and return current user.

    This dependency should be used on all protected endpoints.

    Usage:
        @app.get("/protected")
        async def protected(user: User = Depends(get_current_user)):
            return {"user_id": user.id}

    Raises:
        HTTPException 401: Invalid or expired token
        HTTPException 401: User not found

    Returns:
        User: The authenticated user
    """
    token = credentials.credentials

    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        # Extract user ID from 'sub' claim
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Get user from database
    user = session.exec(
        select(User).where(User.id == user_id)
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user

def verify_user_access(user_id: str, current_user: User) -> None:
    """
    Verify that the current user has access to the resource.

    Usage:
        @app.get("/api/{user_id}/tasks")
        async def get_tasks(
            user_id: str,
            current_user: User = Depends(get_current_user)
        ):
            verify_user_access(user_id, current_user)
            # ... rest of endpoint logic

    Raises:
        HTTPException 403: User doesn't have access

    Args:
        user_id: The user ID from the URL
        current_user: The authenticated user from JWT
    """
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
