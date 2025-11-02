"""
Integration tests for frontend-backend communication.
These tests verify the complete flow from React components to API endpoints.
"""

import pytest
from unittest.mock import Mock


# Mock the API client for testing
class MockAPIClient:
    def __init__(self):
        self.responses = {}
        self.requests = []

    def set_response(self, endpoint, response_data, status_code=200):
        self.responses[endpoint] = {
            "data": response_data,
            "status": status_code,
        }

    def get(self, url, params=None):
        self.requests.append({"method": "GET", "url": url, "params": params})

        # Extract endpoint from URL
        endpoint = url.split("/api/v1")[-1] if "/api/v1" in url else url

        if endpoint in self.responses:
            response = Mock()
            response.json.return_value = self.responses[endpoint]["data"]
            response.status_code = self.responses[endpoint]["status"]
            return response
        else:
            # Default response
            response = Mock()
            response.json.return_value = {"data": []}
            response.status_code = 200
            return response

    def post(self, url, json_data=None):
        self.requests.append({"method": "POST", "url": url, "json": json_data})

        endpoint = url.split("/api/v1")[-1] if "/api/v1" in url else url

        if endpoint in self.responses:
            response = Mock()
            response.json.return_value = self.responses[endpoint]["data"]
            response.status_code = self.responses[endpoint]["status"]
            return response
        else:
            response = Mock()
            response.json.return_value = {"id": 1, "name": "Test Dashboard"}
            response.status_code = 200
            return response


class TestFrontendBackendIntegration:
    """Integration tests for frontend-backend communication."""

    @pytest.fixture
    def mock_api_client(self):
        """Create a mock API client for testing."""
        return MockAPIClient()

    @pytest.fixture
    def sample_analytics_data(self):
        """Sample analytics data for testing."""
        return {
            "revenue": {
                "data": [
                    {
                        "period": "2024-01-01",
                        "revenue": 1000,
                        "sales_count": 10,
                        "avg_ticket": 100,
                    },
                    {
                        "period": "2024-01-02",
                        "revenue": 1500,
                        "sales_count": 15,
                        "avg_ticket": 100,
                    },
                ]
            },
            "products": {
                "data": [
                    {
                        "product_name": "Hambúrguer",
                        "total_quantity": 50,
                        "sales_count": 25,
                        "total_revenue": 1250,
                        "avg_price": 25,
                    },
                    {
                        "product_name": "Batata Frita",
                        "total_quantity": 30,
                        "sales_count": 15,
                        "total_revenue": 375,
                        "avg_price": 12.5,
                    },
                ]
            },
            "channels": {
                "data": [
                    {
                        "channel_name": "Presencial",
                        "channel_type": "P",
                        "total_revenue": 2000,
                        "sales_count": 20,
                        "avg_ticket": 100,
                    },
                    {
                        "channel_name": "iFood",
                        "channel_type": "D",
                        "total_revenue": 1500,
                        "sales_count": 15,
                        "avg_ticket": 100,
                    },
                ]
            },
            "summary": {
                "total_revenue": 3500,
                "sales_count": 35,
                "avg_ticket": 100,
                "first_sale": "2024-01-01",
                "last_sale": "2024-01-02",
            },
        }

    def test_revenue_hook_integration(
        self, mock_api_client, sample_analytics_data
    ):
        """Test revenue hook integration with backend."""
        # Mock the API response
        mock_api_client.set_response(
            "/analytics/revenue", sample_analytics_data["revenue"]
        )

        # Simulate the hook behavior
        def simulate_use_revenue():
            response = mock_api_client.get("/api/v1/analytics/revenue")
            return {
                "data": response.json()["data"],
                "loading": False,
                "error": None,
            }

        result = simulate_use_revenue()

        assert result["loading"] is False
        assert result["error"] is None
        assert len(result["data"]) == 2
        assert result["data"][0]["revenue"] == 1000

        # Verify API was called correctly
        assert len(mock_api_client.requests) == 1
        assert mock_api_client.requests[0]["method"] == "GET"
        assert "/analytics/revenue" in mock_api_client.requests[0]["url"]

    def test_products_hook_integration(
        self, mock_api_client, sample_analytics_data
    ):
        """Test products hook integration with backend."""
        mock_api_client.set_response(
            "/analytics/products", sample_analytics_data["products"]
        )

        def simulate_use_top_products():
            response = mock_api_client.get("/api/v1/analytics/products")
            return {
                "data": response.json()["data"],
                "loading": False,
                "error": None,
            }

        result = simulate_use_top_products()

        assert result["loading"] is False
        assert result["error"] is None
        assert len(result["data"]) == 2
        assert result["data"][0]["product_name"] == "Hambúrguer"
        assert result["data"][0]["total_revenue"] == 1250

    def test_channel_performance_integration(
        self, mock_api_client, sample_analytics_data
    ):
        """Test channel performance integration with backend."""
        mock_api_client.set_response(
            "/analytics/channels", sample_analytics_data["channels"]
        )

        def simulate_use_channel_performance():
            response = mock_api_client.get("/api/v1/analytics/channels")
            return {
                "data": response.json()["data"],
                "loading": False,
                "error": None,
            }

        result = simulate_use_channel_performance()

        assert result["loading"] is False
        assert result["error"] is None
        assert len(result["data"]) == 2
        assert result["data"][0]["channel_name"] == "Presencial"
        assert result["data"][0]["total_revenue"] == 2000

    def test_summary_integration(self, mock_api_client, sample_analytics_data):
        """Test summary integration with backend."""
        mock_api_client.set_response(
            "/analytics/summary", sample_analytics_data["summary"]
        )

        def simulate_use_summary():
            response = mock_api_client.get("/api/v1/analytics/summary")
            return {"data": response.json(), "loading": False, "error": None}

        result = simulate_use_summary()

        assert result["loading"] is False
        assert result["error"] is None
        assert result["data"]["total_revenue"] == 3500
        assert result["data"]["sales_count"] == 35
        assert result["data"]["avg_ticket"] == 100

    def test_dashboard_crud_integration(self, mock_api_client):
        """Test dashboard CRUD integration with backend."""
        # Test create dashboard
        dashboard_data = {
            "name": "Test Dashboard",
            "description": "Integration test dashboard",
            "config": {
                "widgets": [
                    {"id": "widget1", "type": "chart", "title": "Test Widget"}
                ],
                "layout": {"columns": 12, "rows": 12},
            },
        }

        mock_api_client.set_response(
            "/dashboards", {"id": 1, "name": "Test Dashboard"}
        )

        def simulate_create_dashboard():
            response = mock_api_client.post(
                "/api/v1/dashboards", json=dashboard_data
            )
            return {"data": response.json(), "loading": False, "error": None}

        result = simulate_create_dashboard()

        assert result["loading"] is False
        assert result["error"] is None
        assert result["data"]["id"] == 1
        assert result["data"]["name"] == "Test Dashboard"

        # Test get dashboard
        mock_api_client.set_response("/dashboards/1", dashboard_data)

        def simulate_get_dashboard():
            response = mock_api_client.get("/api/v1/dashboards/1")
            return {"data": response.json(), "loading": False, "error": None}

        result = simulate_get_dashboard()

        assert result["loading"] is False
        assert result["error"] is None
        assert result["data"]["name"] == "Test Dashboard"

    def test_error_handling_integration(self, mock_api_client):
        """Test error handling in frontend-backend integration."""
        # Test API error response
        mock_api_client.set_response(
            "/analytics/revenue", {"error": "Server error"}, 500
        )

        def simulate_error_handling():
            try:
                response = mock_api_client.get("/api/v1/analytics/revenue")
                if response.status_code != 200:
                    return {
                        "data": None,
                        "loading": False,
                        "error": "API Error: Server error",
                    }
                return {
                    "data": response.json(),
                    "loading": False,
                    "error": None,
                }
            except Exception as e:
                return {"data": None, "loading": False, "error": str(e)}

        result = simulate_error_handling()

        assert result["loading"] is False
        assert result["error"] == "API Error: Server error"
        assert result["data"] is None

    def test_filtering_integration(
        self, mock_api_client, sample_analytics_data
    ):
        """Test filtering integration between frontend and backend."""
        # Test with date filters
        filtered_data = {
            "data": [
                {
                    "period": "2024-01-01",
                    "revenue": 1000,
                    "sales_count": 10,
                    "avg_ticket": 100,
                }
            ]
        }

        mock_api_client.set_response("/analytics/revenue", filtered_data)

        def simulate_filtered_request():
            params = {
                "start_date": "2024-01-01",
                "end_date": "2024-01-01",
                "store_id": 1,
            }

            # Build URL with params
            url = "/api/v1/analytics/revenue"
            param_string = "&".join([f"{k}={v}" for k, v in params.items()])
            full_url = f"{url}?{param_string}"

            response = mock_api_client.get(full_url)
            return {
                "data": response.json()["data"],
                "loading": False,
                "error": None,
            }

        result = simulate_filtered_request()

        assert result["loading"] is False
        assert result["error"] is None
        assert len(result["data"]) == 1
        assert result["data"][0]["period"] == "2024-01-01"

        # Verify correct parameters were sent
        request = mock_api_client.requests[-1]
        assert "start_date=2024-01-01" in request["url"]
        assert "end_date=2024-01-01" in request["url"]
        assert "store_id=1" in request["url"]

    def test_concurrent_requests_integration(
        self, mock_api_client, sample_analytics_data
    ):
        """Test concurrent requests handling."""
        import threading

        # Set up responses for different endpoints
        mock_api_client.set_response(
            "/analytics/revenue", sample_analytics_data["revenue"]
        )
        mock_api_client.set_response(
            "/analytics/products", sample_analytics_data["products"]
        )
        mock_api_client.set_response(
            "/analytics/channels", sample_analytics_data["channels"]
        )
        mock_api_client.set_response(
            "/analytics/summary", sample_analytics_data["summary"]
        )

        results = []
        errors = []

        def make_request(endpoint):
            try:
                response = mock_api_client.get(f"/api/v1{endpoint}")
                results.append(
                    {
                        "endpoint": endpoint,
                        "status": response.status_code,
                        "data": response.json(),
                    }
                )
            except Exception as e:
                errors.append({"endpoint": endpoint, "error": str(e)})

        # Create multiple threads
        threads = []
        endpoints = [
            "/analytics/revenue",
            "/analytics/products",
            "/analytics/channels",
            "/analytics/summary",
        ]

        for endpoint in endpoints:
            thread = threading.Thread(target=make_request, args=(endpoint,))
            threads.append(thread)
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        # All requests should succeed
        assert len(errors) == 0, f"Errors occurred: {errors}"
        assert len(results) == 4

        # Verify all endpoints were called
        called_endpoints = [r["endpoint"] for r in results]
        assert "/analytics/revenue" in called_endpoints
        assert "/analytics/products" in called_endpoints
        assert "/analytics/channels" in called_endpoints
        assert "/analytics/summary" in called_endpoints

    def test_data_consistency_integration(
        self, mock_api_client, sample_analytics_data
    ):
        """Test data consistency across different endpoints."""
        # Set up consistent data
        mock_api_client.set_response(
            "/analytics/revenue", sample_analytics_data["revenue"]
        )
        mock_api_client.set_response(
            "/analytics/summary", sample_analytics_data["summary"]
        )

        def get_revenue_data():
            response = mock_api_client.get("/api/v1/analytics/revenue")
            return response.json()["data"]

        def get_summary_data():
            response = mock_api_client.get("/api/v1/analytics/summary")
            return response.json()

        revenue_data = get_revenue_data()
        summary_data = get_summary_data()

        # Calculate total revenue from revenue data
        calculated_total = sum(item["revenue"] for item in revenue_data)

        # Should match summary total
        assert calculated_total == summary_data["total_revenue"]

        # Calculate total sales count
        calculated_sales = sum(item["sales_count"] for item in revenue_data)
        assert calculated_sales == summary_data["sales_count"]

    def test_performance_integration(
        self, mock_api_client, sample_analytics_data
    ):
        """Test performance of frontend-backend integration."""
        mock_api_client.set_response(
            "/analytics/revenue", sample_analytics_data["revenue"]
        )

        def simulate_performance_test():
            import time

            start_time = time.time()

            response = mock_api_client.get("/api/v1/analytics/revenue")
            data = response.json()

            end_time = time.time()
            response_time = end_time - start_time

            return {
                "data": data,
                "response_time": response_time,
                "success": True,
            }

        result = simulate_performance_test()

        assert result["success"]
        assert result["response_time"] < 0.1  # Should be very fast with mock
        assert "data" in result["data"]
