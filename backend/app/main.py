"""
Main FastAPI application.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.api.v1 import sales, health, analytics, cache, dashboard, stores, auth
from app.core.logging import get_logger
from app.core.error_handler import register_error_handlers

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler."""
    # Startup
    logger.info(
        "Application starting",
        extra={
            "extra_data": {
                "environment": settings.ENVIRONMENT,
                "version": "0.1.0",
            }
        },
    )

    # Warn if using default secret key in non-development
    default_key = "dev-secret-key-change-in-production"
    if (
        settings.ENVIRONMENT != "development"
        and settings.SECRET_KEY.startswith(default_key)
    ):
        logger.warning(
            "Using default SECRET_KEY in production",
            extra={
                "extra_data": {
                    "action": "change_secret_key",
                    "message": "Set SECRET_KEY env variable",
                }
            },
        )

    yield

    # Shutdown
    logger.info("Application shutting down")


app = FastAPI(
    title="Analytics para Restaurantes",
    description="API para analytics customizável de restaurantes",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Rate Limiting
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS - Configure properly for production
cors_origins = []

# Always include origins from environment variable
if settings.CORS_ORIGINS:
    for origin in settings.CORS_ORIGINS.split(","):
        origin = origin.strip()
        if origin and origin not in cors_origins:
            cors_origins.append(origin)

if settings.ENVIRONMENT == "development":
    # Allow common dev origins
    dev_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
    ]
    for origin in dev_origins:
        if origin not in cors_origins:
            cors_origins.append(origin)

# Always include Render frontend domains (for production/deployment)
# These should be allowed regardless of environment setting
render_origins = [
    "https://godlevel-frontend.onrender.com",
    "https://godlevel-frontend.render.com",
]
for origin in render_origins:
    if origin not in cors_origins:
        cors_origins.append(origin)

# Log configured origins (without sensitive info)
logger.info(
    f"CORS configured for {len(cors_origins)} origin(s)",
    extra={
        "extra_data": {
            "environment": settings.ENVIRONMENT,
            "origins_count": len(cors_origins),
        }
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# API prefix constant
API_PREFIX = "/api/v1"

# Register error handlers
register_error_handlers(app)

# Include routers
app.include_router(auth.router, prefix=API_PREFIX, tags=["authentication"])
app.include_router(health.router, prefix=API_PREFIX, tags=["health"])
app.include_router(sales.router, prefix=API_PREFIX, tags=["sales"])
app.include_router(analytics.router, prefix=API_PREFIX, tags=["analytics"])
app.include_router(cache.router, prefix=API_PREFIX, tags=["cache"])
app.include_router(dashboard.router, prefix=API_PREFIX, tags=["dashboards"])
app.include_router(stores.router, prefix=API_PREFIX, tags=["stores"])
