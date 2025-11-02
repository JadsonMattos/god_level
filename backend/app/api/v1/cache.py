"""
Cache endpoints.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict

from app.services.cache import (
    redis_client,
    invalidate_cache,
    clear_all_cache
)

router = APIRouter()


@router.get("/cache/status")
async def cache_status() -> Dict:
    """
    Get cache status.

    Returns:
        Dict with cache status
    """
    is_connected = redis_client is not None

    if is_connected:
        try:
            info = redis_client.info()
            pool_kwargs = redis_client.connection_pool.connection_kwargs
            return {
                "status": "connected",
                "host": pool_kwargs.get("host"),
                "port": pool_kwargs.get("port"),
                "memory_used": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "keys_count": redis_client.dbsize(),
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

    return {
        "status": "disconnected",
        "message": "Redis not available"
    }


@router.post("/cache/clear")
async def clear_cache() -> Dict:
    """
    Clear all cache.

    Returns:
        Dict with result
    """
    try:
        success = clear_all_cache()
        msg = (
            "Cache cleared successfully"
            if success else "Failed to clear cache"
        )
        return {
            "success": success,
            "message": msg
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cache/invalidate/{pattern}")
async def invalidate_cache_by_pattern(pattern: str) -> Dict:
    """
    Invalidate cache keys matching pattern.

    Args:
        pattern: Redis key pattern (e.g., 'revenue_*')

    Returns:
        Dict with number of keys deleted
    """
    try:
        deleted = invalidate_cache(pattern)
        msg = f"Deleted {deleted} keys matching pattern {pattern}"
        return {
            "pattern": pattern,
            "deleted_keys": deleted,
            "message": msg
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
