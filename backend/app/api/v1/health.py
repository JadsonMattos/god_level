"""
Health check endpoint.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        dict: Status of the API
    """
    return {
        "status": "ok",
        "message": "Analytics para Restaurantes API is running"
    }
