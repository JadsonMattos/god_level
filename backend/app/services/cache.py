"""
Redis cache utilities.
"""

import json
import logging
from typing import Any, Optional
from functools import wraps

import redis
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Redis client
try:
    redis_client = redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_keepalive=True,
    )

    # Test connection
    redis_client.ping()
    logger.info(f"Redis connected: {settings.REDIS_URL}")
except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError) as e:
    logger.warning(f"Redis not available: {e}")
    redis_client = None


def cache_key(*args, **kwargs) -> str:
    """
    Generate cache key from function arguments.

    Args:
        *args: Positional arguments
        **kwargs: Keyword arguments

    Returns:
        Cache key string
    """
    # Convert all arguments to strings, keep line length within limits
    args_str = "_".join(str(arg) for arg in args if arg is not None)
    kwargs_items = sorted((k, v) for k, v in kwargs.items() if v is not None)
    kwargs_str = "_".join(f"{k}_{v}" for k, v in kwargs_items)

    if args_str and kwargs_str:
        key = f"{args_str}_{kwargs_str}"
    else:
        key = args_str or kwargs_str

    # Sanitize key
    key = key.replace(" ", "_").replace("/", "_")
    return key


def get_cache(key: str) -> Optional[Any]:
    """
    Get value from cache.

    Args:
        key: Cache key

    Returns:
        Cached value or None
    """
    if not redis_client:
        return None

    try:
        cached = redis_client.get(key)
        if cached:
            logger.debug(f"Cache HIT: {key}")
            return json.loads(cached)
        logger.debug(f"Cache MISS: {key}")
        return None
    except Exception as e:
        logger.error(f"Cache get error: {e}")
        return None


def set_cache(key: str, value: Any, ttl: int = 300) -> bool:
    """
    Set value in cache.

    Args:
        key: Cache key
        value: Value to cache
        ttl: Time to live in seconds (default: 5 minutes)

    Returns:
        True if successful, False otherwise
    """
    if not redis_client:
        return False

    try:
        serialized = json.dumps(value)
        redis_client.setex(key, ttl, serialized)
        logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
        return True
    except Exception as e:
        logger.error(f"Cache set error: {e}")
        return False


def invalidate_cache(pattern: str) -> int:
    """
    Invalidate cache keys matching pattern.

    Args:
        pattern: Redis key pattern (e.g., 'revenue_*')

    Returns:
        Number of keys deleted
    """
    if not redis_client:
        return 0

    try:
        keys = redis_client.keys(pattern)
        if keys:
            deleted = redis_client.delete(*keys)
            logger.debug(f"Cache INVALIDATE: {pattern} ({deleted} keys)")
            return deleted
        return 0
    except Exception as e:
        logger.error(f"Cache invalidate error: {e}")
        return 0


def cache_result(prefix: str, ttl: int = 300):
    """
    Decorator to cache function results.

    Args:
        prefix: Cache key prefix
        ttl: Time to live in seconds

    Returns:
        Decorated function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key_args = [prefix]

            # Add function arguments to key
            for arg in args[1:]:  # Skip self
                if arg is not None:
                    key_args.append(str(arg))

            for k, v in kwargs.items():
                if v is not None:
                    key_args.append(f"{k}_{v}")

            cache_key_str = "_".join(key_args)

            # Try to get from cache
            cached = get_cache(cache_key_str)
            if cached is not None:
                return cached

            # Call function
            result = func(*args, **kwargs)

            # Cache result
            set_cache(cache_key_str, result, ttl)

            return result

        return wrapper
    return decorator


def clear_all_cache() -> bool:
    """
    Clear all cache.

    Returns:
        True if successful
    """
    if not redis_client:
        return False

    try:
        redis_client.flushdb()
        logger.info("All cache cleared")
        return True
    except Exception as e:
        logger.error(f"Clear cache error: {e}")
        return False
