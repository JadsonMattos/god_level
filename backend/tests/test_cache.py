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
    assert "redis_connected" in data
    assert "cache_stats" in data


def test_clear_cache(client):
    """Test clear cache endpoint."""
    response = client.post("/api/v1/cache/clear")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "cleared" in data["message"].lower()


def test_invalidate_cache_pattern(client):
    """Test invalidate cache pattern endpoint."""
    response = client.post("/api/v1/cache/invalidate/test_pattern")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "invalidated" in data["message"].lower()


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
