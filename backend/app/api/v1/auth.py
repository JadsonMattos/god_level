"""
Authentication endpoints.
"""

from datetime import timedelta
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

from app.auth.security import create_access_token
from app.auth import get_current_user
from app.auth.mock_user import authenticate_user
from app.config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    """Login request schema."""
    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str
    token_type: str = "bearer"
    username: str
    user_id: int


@router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Authenticate user and return JWT token.

    Mock users:
    - admin / admin123
    - maria / maria123

    Args:
        login_data: Login credentials

    Returns:
        JWT access token

    Raises:
        HTTPException: If credentials are invalid
    """
    user = authenticate_user(login_data.username, login_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    access_token_expires = timedelta(minutes=expire_minutes)
    access_token = create_access_token(
        data={"sub": user["username"], "user_id": user["user_id"]},
        expires_delta=access_token_expires,
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        username=user["username"],
        user_id=user["user_id"],
    )


@router.get("/auth/me")
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current user information.

    Args:
        current_user: Current authenticated user from token

    Returns:
        Current user information
    """
    return current_user
