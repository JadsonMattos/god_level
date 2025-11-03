"""
Tests for sales endpoints.
"""


def test_get_sales(client):
    """Test sales endpoint."""
    response = client.get("/api/v1/sales")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data
    assert isinstance(data["data"], list)


def test_get_sales_with_pagination(client):
    """Test sales endpoint with pagination."""
    params = {"limit": 10, "offset": 0}
    response = client.get("/api/v1/sales", params=params)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data
    assert len(data["data"]) <= 10


def test_get_sales_with_filters(client):
    """Test sales endpoint with filters."""
    params = {
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "store_id": 1,
        "channel_id": 1,
        "limit": 5
    }
    response = client.get("/api/v1/sales", params=params)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data


def test_get_sales_with_status_filter(client):
    """Test sales endpoint with status filter."""
    params = {"sale_status": "COMPLETED", "limit": 5}
    response = client.get("/api/v1/sales", params=params)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data


def test_get_sales_with_customer_filter(client):
    """Test sales endpoint with customer filter."""
    params = {"customer_id": 1, "limit": 5}
    response = client.get("/api/v1/sales", params=params)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data


def test_get_sales_invalid_date_format(client):
    """Test sales endpoint with invalid date format."""
    params = {"start_date": "invalid-date"}
    response = client.get("/api/v1/sales", params=params)
    # Pydantic v2 returns 422 for validation errors
    assert response.status_code == 422
    data = response.json()
    # Error handler returns "details" (plural) with error details
    assert "details" in data or "error" in data


def test_get_sales_invalid_limit(client):
    """Test sales endpoint with invalid limit."""
    params = {"limit": -1}
    response = client.get("/api/v1/sales", params=params)
    assert response.status_code == 422  # Validation Error


def test_get_sales_invalid_offset(client):
    """Test sales endpoint with invalid offset."""
    params = {"offset": -1}
    response = client.get("/api/v1/sales", params=params)
    assert response.status_code == 422  # Validation Error
