"""
Authentication API Routes - Todo App Phase II
Referencing: @specs/features/authentication.md, @specs/api/rest-endpoints.md
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import User
from pydantic import BaseModel
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional
import bcrypt

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/auth/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    session: Session = Depends(get_session)
):
    """Login endpoint that validates credentials and returns JWT token."""
    # Get user by email
    user = session.exec(
        select(User).where(User.email == login_data.email)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password (assuming it's bcrypt hashed)
    if not bcrypt.checkpw(login_data.password.encode('utf-8'), user.password_hash.encode('utf-8')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT token
    SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
    if not SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error"
        )

    # Create token payload
    payload = {
        "sub": user.id,  # User ID as subject
        "email": user.email,
        "name": user.name,
        "exp": datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
        "iat": datetime.utcnow()  # Issued at
    }

    # Generate JWT token
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return LoginResponse(
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user.created_at
        ),
        access_token=token
    )

@router.post("/auth/register", response_model=LoginResponse)
async def register(
    register_data: RegisterRequest,
    session: Session = Depends(get_session)
):
    """Register endpoint that creates a new user and returns JWT token."""
    # Check if user already exists
    existing_user = session.exec(
        select(User).where(User.email == register_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Hash the password
    password_hash = bcrypt.hashpw(register_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Create new user
    import secrets
    user_id = secrets.token_urlsafe(16)  # Generate a random user ID

    user = User(
        id=user_id,
        email=register_data.email,
        name=register_data.name,
        password_hash=password_hash
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    # Generate JWT token
    SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
    if not SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error"
        )

    # Create token payload
    payload = {
        "sub": user.id,  # User ID as subject
        "email": user.email,
        "name": user.name,
        "exp": datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
        "iat": datetime.utcnow()  # Issued at
    }

    # Generate JWT token
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return LoginResponse(
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user.created_at
        ),
        access_token=token
    )