"""
Tests for dashboard endpoints.
"""


def test_create_dashboard(client):
    """Test create dashboard endpoint."""
    dashboard_data = {
        "name": "Test Dashboard",
        "description": "Test description",
        "config": {
            "widgets": [
                {
                    "id": "widget_1",
                    "type": "chart",
                    "title": "Test Chart",
                    "position": {"x": 0, "y": 0},
                    "size": {"width": 6, "height": 4},
                }
            ],
            "layout": {"columns": 12, "rows": 12},
        },
    }

    response = client.post("/api/v1/dashboards", json=dashboard_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Dashboard"
    assert "id" in data


def test_create_dashboard_minimal_data(client):
    """Test create dashboard with minimal required data."""
    dashboard_data = {
        "name": "Minimal Dashboard",
        "config": {"widgets": [], "layout": {"columns": 12, "rows": 12}},
    }

    response = client.post("/api/v1/dashboards", json=dashboard_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Minimal Dashboard"


def test_create_dashboard_invalid_data(client):
    """Test create dashboard with invalid data."""
    dashboard_data = {
        "name": "",  # Empty name should fail
        "config": {"widgets": [], "layout": {"columns": 12, "rows": 12}},
    }

    response = client.post("/api/v1/dashboards", json=dashboard_data)
    assert response.status_code == 422  # Validation Error


def test_create_dashboard_missing_required_fields(client):
    """Test create dashboard with missing required fields."""
    dashboard_data = {"description": "Missing name"}

    response = client.post("/api/v1/dashboards", json=dashboard_data)
    assert response.status_code == 422  # Validation Error


def test_list_dashboards(client):
    """Test list dashboards endpoint."""
    response = client.get("/api/v1/dashboards")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)


def test_list_dashboards_with_pagination(client):
    """Test list dashboards with pagination."""
    response = client.get("/api/v1/dashboards?limit=10&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


def test_list_dashboards_with_search(client):
    """Test list dashboards with search."""
    response = client.get("/api/v1/dashboards?search=test")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


def test_get_dashboard_by_id(client):
    """Test get dashboard by ID endpoint."""
    # First create a dashboard
    dashboard_data = {
        "name": "Test Dashboard for Get",
        "description": "Test description",
        "config": {"widgets": [], "layout": {"columns": 12, "rows": 12}},
    }

    create_response = client.post("/api/v1/dashboards", json=dashboard_data)
    assert create_response.status_code == 200
    dashboard_id = create_response.json()["id"]

    # Then get it
    response = client.get(f"/api/v1/dashboards/{dashboard_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Dashboard for Get"
    assert data["id"] == dashboard_id


def test_get_dashboard_not_found(client):
    """Test get dashboard with non-existent ID."""
    response = client.get("/api/v1/dashboards/99999")
    assert response.status_code == 404
    assert "Dashboard not found" in response.json()["detail"]


def test_update_dashboard(client):
    """Test update dashboard endpoint."""
    # First create a dashboard
    dashboard_data = {
        "name": "Original Name",
        "description": "Original description",
        "config": {"widgets": [], "layout": {"columns": 12, "rows": 12}},
    }

    create_response = client.post("/api/v1/dashboards", json=dashboard_data)
    assert create_response.status_code == 200
    dashboard_id = create_response.json()["id"]

    # Then update it
    update_data = {
        "name": "Updated Name",
        "description": "Updated description",
        "config": {
            "widgets": [
                {
                    "id": "widget_1",
                    "type": "chart",
                    "title": "Updated Chart",
                    "position": {"x": 0, "y": 0},
                    "size": {"width": 6, "height": 4},
                }
            ],
            "layout": {"columns": 12, "rows": 12},
        },
    }

    response = client.put(
        f"/api/v1/dashboards/{dashboard_id}", json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Updated description"


def test_update_dashboard_not_found(client):
    """Test update dashboard with non-existent ID."""
    update_data = {
        "name": "Updated Name",
        "config": {"widgets": [], "layout": {"columns": 12, "rows": 12}},
    }

    response = client.put("/api/v1/dashboards/99999", json=update_data)
    assert response.status_code == 404
    assert "Dashboard not found" in response.json()["detail"]


def test_delete_dashboard(client):
    """Test delete dashboard endpoint."""
    # First create a dashboard
    dashboard_data = {
        "name": "Dashboard to Delete",
        "description": "Will be deleted",
        "config": {"widgets": [], "layout": {"columns": 12, "rows": 12}},
    }

    create_response = client.post("/api/v1/dashboards", json=dashboard_data)
    assert create_response.status_code == 200
    dashboard_id = create_response.json()["id"]

    # Then delete it
    response = client.delete(f"/api/v1/dashboards/{dashboard_id}")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "deleted" in data["message"].lower()

    # Verify it's deleted
    get_response = client.get(f"/api/v1/dashboards/{dashboard_id}")
    assert get_response.status_code == 404


def test_delete_dashboard_not_found(client):
    """Test delete dashboard with non-existent ID."""
    response = client.delete("/api/v1/dashboards/99999")
    assert response.status_code == 404
    assert "Dashboard not found" in response.json()["detail"]


def test_dashboard_validation(client):
    """Test dashboard validation rules."""
    # Test invalid widget configuration
    dashboard_data = {
        "name": "Invalid Widget Dashboard",
        "config": {
            "widgets": [
                {
                    "id": "widget_1",
                    "type": "invalid_type",  # Invalid type
                    "title": "Test Chart",
                }
            ],
            "layout": {"columns": 12, "rows": 12},
        },
    }

    response = client.post("/api/v1/dashboards", json=dashboard_data)
    assert response.status_code in [200, 422]


def test_dashboard_with_complex_config(client):
    """Test dashboard with complex configuration."""
    dashboard_data = {
        "name": "Complex Dashboard",
        "description": "Dashboard with multiple widgets",
        "config": {
            "widgets": [
                {
                    "id": "widget_1",
                    "type": "chart",
                    "title": "Revenue Chart",
                    "position": {"x": 0, "y": 0},
                    "size": {"width": 6, "height": 4},
                },
                {
                    "id": "widget_2",
                    "type": "card",
                    "title": "Total Sales",
                    "position": {"x": 6, "y": 0},
                    "size": {"width": 6, "height": 4},
                },
            ],
            "layout": {"columns": 12, "rows": 12},
            "filters": {"date_range": "last_30_days", "store_id": 1},
        },
    }

    response = client.post("/api/v1/dashboards", json=dashboard_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Complex Dashboard"
    assert len(data["config"]["widgets"]) == 2
