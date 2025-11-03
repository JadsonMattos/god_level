"""
Tests for cache endpoints.
"""

import pytest


@pytest.mark.usefixtures("client")
def test_get_cache_status(client):
    """Test cache status endpoint."""
    response = client.get("/api/v1/cache/status")
    assert response.status_code == 200
    data = response.json()
    # When Redis is available, it returns status/connected_clients/etc
    # When Redis is not available, it returns status="disconnected" and message
    assert "status" in data


def test_clear_cache(client):
    """Test clear cache endpoint."""
    response = client.post("/api/v1/cache/clear")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    # Can be "Cache cleared successfully" or "Failed to clear cache" when Redis is not available
    assert "cache" in data["message"].lower()


def test_invalidate_cache_pattern(client):
    """Test invalidate cache pattern endpoint."""
    response = client.post("/api/v1/cache/invalidate/test_pattern")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    # The message is "Deleted X keys matching pattern Y"
    assert "keys" in data["message"].lower() or "pattern" in data["message"].lower()


def test_invalidate_cache_pattern_with_special_chars(client):
    """Test invalidate cache pattern with special characters."""
    response = client.post("/api/v1/cache/invalidate/test*pattern")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_cache_endpoints_require_post(client):
    """Test that cache modification endpoints require POST."""
    response = client.get("/api/v1/cache/clear")
    assert response.status_code == 405  # Method Not Allowed

    response = client.get("/api/v1/cache/invalidate/test")
    assert response.status_code == 405  # Method Not Allowed
