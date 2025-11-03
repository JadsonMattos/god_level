"""
Tests for cache utility functions (not endpoints).
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import json

from app.services.cache import (
    cache_key,
    get_cache,
    set_cache,
    invalidate_cache,
    clear_all_cache,
    cache_result,
    redis_client,
)


class TestCacheKey:
    """Tests for cache_key function."""

    def test_cache_key_with_args(self):
        """Test cache key generation with positional arguments."""
        key = cache_key("prefix", "arg1", "arg2")
        assert isinstance(key, str)
        assert "prefix" in key
        assert "arg1" in key
        assert "arg2" in key

    def test_cache_key_with_kwargs(self):
        """Test cache key generation with keyword arguments."""
        key = cache_key(prefix="test", store_id=1, channel_id=2)
        assert isinstance(key, str)
        assert "prefix" in key or "test" in key
        assert "1" in key
        assert "2" in key

    def test_cache_key_with_args_and_kwargs(self):
        """Test cache key generation with both args and kwargs."""
        key = cache_key("prefix", "arg1", store_id=1, channel_id=2)
        assert isinstance(key, str)
        assert len(key) > 0

    def test_cache_key_with_none(self):
        """Test cache key generation with None values (should be filtered)."""
        key = cache_key("prefix", None, "arg1", None, store_id=1, channel_id=None)
        assert "None" not in key
        assert "arg1" in key
        assert "1" in key

    def test_cache_key_sanitization(self):
        """Test cache key sanitization (spaces and slashes)."""
        key = cache_key("prefix/with path", "arg with spaces")
        assert "/" not in key
        assert " " not in key
        assert "_" in key


class TestCacheFunctions:
    """Tests for cache utility functions."""

    @pytest.fixture
    def mock_redis_client(self):
        """Create a mock Redis client."""
        mock_client = MagicMock()
        mock_client.get.return_value = None
        mock_client.setex.return_value = True
        mock_client.keys.return_value = []
        mock_client.delete.return_value = 0
        mock_client.flushdb.return_value = True
        mock_client.ping.return_value = True
        return mock_client

    def test_get_cache_when_redis_unavailable(self):
        """Test get_cache when Redis is not available."""
        with patch("app.services.cache.redis_client", None):
            result = get_cache("test_key")
            assert result is None

    def test_get_cache_miss(self, mock_redis_client):
        """Test get_cache when key doesn't exist (cache miss)."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            mock_redis_client.get.return_value = None
            result = get_cache("test_key")
            assert result is None

    def test_get_cache_hit(self, mock_redis_client):
        """Test get_cache when key exists (cache hit)."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            cached_value = {"data": [1, 2, 3]}
            mock_redis_client.get.return_value = json.dumps(cached_value)
            
            result = get_cache("test_key")
            assert result == cached_value
            mock_redis_client.get.assert_called_once_with("test_key")

    def test_get_cache_error(self, mock_redis_client):
        """Test get_cache when Redis raises an error."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            mock_redis_client.get.side_effect = Exception("Redis error")
            result = get_cache("test_key")
            assert result is None

    def test_set_cache_when_redis_unavailable(self):
        """Test set_cache when Redis is not available."""
        with patch("app.services.cache.redis_client", None):
            result = set_cache("test_key", {"data": "test"}, ttl=300)
            assert result is False

    def test_set_cache_success(self, mock_redis_client):
        """Test set_cache with successful operation."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            value = {"data": "test"}
            result = set_cache("test_key", value, ttl=300)
            assert result is True
            mock_redis_client.setex.assert_called_once()
            call_args = mock_redis_client.setex.call_args
            assert call_args[0][0] == "test_key"
            assert call_args[0][1] == 300
            assert json.loads(call_args[0][2]) == value

    def test_set_cache_error(self, mock_redis_client):
        """Test set_cache when Redis raises an error."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            mock_redis_client.setex.side_effect = Exception("Redis error")
            result = set_cache("test_key", {"data": "test"}, ttl=300)
            assert result is False

    def test_invalidate_cache_when_redis_unavailable(self):
        """Test invalidate_cache when Redis is not available."""
        with patch("app.services.cache.redis_client", None):
            result = invalidate_cache("pattern_*")
            assert result == 0

    def test_invalidate_cache_no_keys(self, mock_redis_client):
        """Test invalidate_cache when no keys match pattern."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            mock_redis_client.keys.return_value = []
            result = invalidate_cache("pattern_*")
            assert result == 0

    def test_invalidate_cache_success(self, mock_redis_client):
        """Test invalidate_cache with matching keys."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            mock_redis_client.keys.return_value = ["key1", "key2", "key3"]
            mock_redis_client.delete.return_value = 3
            result = invalidate_cache("pattern_*")
            assert result == 3
            mock_redis_client.delete.assert_called_once_with("key1", "key2", "key3")

    def test_invalidate_cache_error(self, mock_redis_client):
        """Test invalidate_cache when Redis raises an error."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            mock_redis_client.keys.side_effect = Exception("Redis error")
            result = invalidate_cache("pattern_*")
            assert result == 0

    def test_clear_all_cache_when_redis_unavailable(self):
        """Test clear_all_cache when Redis is not available."""
        with patch("app.services.cache.redis_client", None):
            result = clear_all_cache()
            assert result is False

    def test_clear_all_cache_success(self, mock_redis_client):
        """Test clear_all_cache with successful operation."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            result = clear_all_cache()
            assert result is True
            mock_redis_client.flushdb.assert_called_once()

    def test_clear_all_cache_error(self, mock_redis_client):
        """Test clear_all_cache when Redis raises an error."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            mock_redis_client.flushdb.side_effect = Exception("Redis error")
            result = clear_all_cache()
            assert result is False


class TestCacheResultDecorator:
    """Tests for cache_result decorator."""

    @pytest.fixture
    def mock_redis_client(self):
        """Create a mock Redis client for decorator tests."""
        mock_client = MagicMock()
        mock_client.get.return_value = None
        mock_client.setex.return_value = True
        return mock_client

    def test_cache_result_decorator_cache_hit(self, mock_redis_client):
        """Test cache_result decorator returns cached value."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            # Set up cached value
            cached_data = {"cached": True, "data": [1, 2, 3]}
            mock_redis_client.get.return_value = json.dumps(cached_data)

            @cache_result(prefix="test", ttl=300)
            def test_function(self, param1, param2=None):
                return {"new": True, "data": [4, 5, 6]}

            class TestClass:
                pass

            instance = TestClass()
            result = test_function(instance, "arg1", param2="arg2")
            
            # Should return cached value
            assert result == cached_data
            # Function should not be called (but we can't verify that easily)

    def test_cache_result_decorator_cache_miss(self, mock_redis_client):
        """Test cache_result decorator calls function on cache miss."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            mock_redis_client.get.return_value = None  # Cache miss

            @cache_result(prefix="test", ttl=300)
            def test_function(self, param1, param2=None):
                return {"computed": True, "data": [1, 2, 3]}

            class TestClass:
                pass

            instance = TestClass()
            result = test_function(instance, "arg1", param2="arg2")
            
            # Should return computed value
            assert result == {"computed": True, "data": [1, 2, 3]}
            # Should cache the result
            assert mock_redis_client.setex.called

    def test_cache_result_decorator_with_none_args(self, mock_redis_client):
        """Test cache_result decorator filters None arguments."""
        with patch("app.services.cache.redis_client", mock_redis_client):
            mock_redis_client.get.return_value = None

            @cache_result(prefix="test", ttl=300)
            def test_function(self, param1=None, param2=None):
                return {"result": True}

            class TestClass:
                pass

            instance = TestClass()
            result = test_function(instance, param1="value", param2=None)
            
            assert result == {"result": True}
            # Verify cache key doesn't contain None
            cache_call = mock_redis_client.setex.call_args
            cache_key = cache_call[0][0]
            assert "None" not in cache_key

    def test_cache_result_decorator_no_redis(self):
        """Test cache_result decorator when Redis is unavailable."""
        with patch("app.services.cache.redis_client", None):
            call_count = 0

            @cache_result(prefix="test", ttl=300)
            def test_function(self):
                nonlocal call_count
                call_count += 1
                return {"call_count": call_count}

            class TestClass:
                pass

            instance = TestClass()
            result1 = test_function(instance)
            result2 = test_function(instance)  # Should call again (no cache)
            
            assert result1["call_count"] == 1
            assert result2["call_count"] == 2  # Called again because no cache

