"""
Configuration settings for the application.
"""

import os
import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://challenge:challenge_2024@postgres:5432/challenge_db"
    )

    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))
    API_RELOAD: bool = os.getenv("API_RELOAD", "false").lower() == "true"

    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        secrets.token_urlsafe(32)  # Generate secure key if not set
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )
    RATE_LIMIT_ENABLED: bool = (
        os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    )

    # CORS
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3001,http://localhost:5173"
    )

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379")

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Testing
    TESTING: bool = os.getenv("TESTING", "false").lower() == "true"

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
