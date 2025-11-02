"""
Tests for health endpoints.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_health_message():
    """Test health check message."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Analytics para Restaurantes API" in data["message"]
