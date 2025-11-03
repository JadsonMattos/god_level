"""
Tests for Pydantic schemas.
"""

import pytest
from datetime import datetime
from pydantic import ValidationError

from app.schemas.analytics import (
    RevenueData,
    ProductData,
    ChannelData,
    MetricsSummary,
)
from app.schemas.sale import SaleResponse


class TestRevenueData:
    """Tests for RevenueData schema."""

    def test_create_revenue_data(self):
        """Test creating RevenueData with valid data."""
        data = RevenueData(
            period="2024-01-01",
            revenue=1000.50,
            sales_count=10,
            avg_ticket=100.05,
        )
        assert data.period == "2024-01-01"
        assert data.revenue == 1000.50
        assert data.sales_count == 10
        assert data.avg_ticket == 100.05

    def test_revenue_data_from_attributes(self):
        """Test creating RevenueData from attributes (ORM mode)."""
        class MockRow:
            period = "2024-01-01"
            revenue = 1000.50
            sales_count = 10
            avg_ticket = 100.05

        data = RevenueData.model_validate(MockRow())
        assert data.period == "2024-01-01"
        assert data.revenue == 1000.50

    def test_revenue_data_validation_error(self):
        """Test RevenueData validation with missing required fields."""
        with pytest.raises(ValidationError):
            RevenueData(period="2024-01-01")
            # Missing revenue, sales_count, avg_ticket

    def test_revenue_data_float_conversion(self):
        """Test RevenueData accepts int and converts to float."""
        data = RevenueData(
            period="2024-01-01",
            revenue=1000,  # int
            sales_count=10,
            avg_ticket=100,  # int
        )
        assert isinstance(data.revenue, float)
        assert isinstance(data.avg_ticket, float)


class TestProductData:
    """Tests for ProductData schema."""

    def test_create_product_data(self):
        """Test creating ProductData with valid data."""
        data = ProductData(
            product_name="Hambúrguer",
            total_quantity=50.5,
            sales_count=25,
            total_revenue=1250.75,
            avg_price=25.015,
        )
        assert data.product_name == "Hambúrguer"
        assert data.total_quantity == 50.5
        assert data.sales_count == 25
        assert data.total_revenue == 1250.75
        assert data.avg_price == 25.015

    def test_product_data_from_attributes(self):
        """Test creating ProductData from attributes."""
        class MockRow:
            product_name = "Hambúrguer"
            total_quantity = 50.5
            sales_count = 25
            total_revenue = 1250.75
            avg_price = 25.015

        data = ProductData.model_validate(MockRow())
        assert data.product_name == "Hambúrguer"
        assert data.total_quantity == 50.5

    def test_product_data_validation_error(self):
        """Test ProductData validation with missing fields."""
        with pytest.raises(ValidationError):
            ProductData(product_name="Hambúrguer")
            # Missing required fields


class TestChannelData:
    """Tests for ChannelData schema."""

    def test_create_channel_data(self):
        """Test creating ChannelData with valid data."""
        data = ChannelData(
            channel_name="Presencial",
            channel_type="P",
            total_revenue=2000.0,
            sales_count=20,
            avg_ticket=100.0,
        )
        assert data.channel_name == "Presencial"
        assert data.channel_type == "P"
        assert data.total_revenue == 2000.0

    def test_channel_data_delivery(self):
        """Test creating ChannelData for delivery channel."""
        data = ChannelData(
            channel_name="iFood",
            channel_type="D",
            total_revenue=1500.0,
            sales_count=15,
            avg_ticket=100.0,
        )
        assert data.channel_type == "D"

    def test_channel_data_from_attributes(self):
        """Test creating ChannelData from attributes."""
        class MockRow:
            channel_name = "Presencial"
            channel_type = "P"
            total_revenue = 2000.0
            sales_count = 20
            avg_ticket = 100.0

        data = ChannelData.model_validate(MockRow())
        assert data.channel_name == "Presencial"


class TestMetricsSummary:
    """Tests for MetricsSummary schema."""

    def test_create_metrics_summary(self):
        """Test creating MetricsSummary with all fields."""
        data = MetricsSummary(
            total_revenue=3500.0,
            sales_count=35,
            avg_ticket=100.0,
            first_sale="2024-01-01",
            last_sale="2024-01-31",
        )
        assert data.total_revenue == 3500.0
        assert data.sales_count == 35
        assert data.first_sale == "2024-01-01"
        assert data.last_sale == "2024-01-31"

    def test_metrics_summary_optional_fields(self):
        """Test creating MetricsSummary without optional fields."""
        data = MetricsSummary(
            total_revenue=3500.0,
            sales_count=35,
            avg_ticket=100.0,
        )
        assert data.first_sale is None
        assert data.last_sale is None

    def test_metrics_summary_validation_error(self):
        """Test MetricsSummary validation with missing required fields."""
        with pytest.raises(ValidationError):
            MetricsSummary(total_revenue=3500.0)
            # Missing sales_count and avg_ticket


class TestSaleResponse:
    """Tests for SaleResponse schema."""

    def test_create_sale_response(self):
        """Test creating SaleResponse with all fields."""
        sale_date = datetime(2024, 1, 15, 10, 30, 0)
        data = SaleResponse(
            id=1,
            store_id=1,
            customer_id=1,
            channel_id=1,
            created_at=sale_date,
            total_amount=100.50,
            status="COMPLETED",
        )
        assert data.id == 1
        assert data.store_id == 1
        assert data.customer_id == 1
        assert data.created_at == sale_date
        assert data.total_amount == 100.50
        assert data.status == "COMPLETED"

    def test_sale_response_optional_customer(self):
        """Test SaleResponse with optional customer_id."""
        sale_date = datetime(2024, 1, 15, 10, 30, 0)
        data = SaleResponse(
            id=1,
            store_id=1,
            customer_id=None,
            channel_id=1,
            created_at=sale_date,
            total_amount=100.50,
            status="COMPLETED",
        )
        assert data.customer_id is None

    def test_sale_response_from_attributes(self):
        """Test creating SaleResponse from ORM attributes."""
        class MockSale:
            id = 1
            store_id = 1
            customer_id = 1
            channel_id = 1
            created_at = datetime(2024, 1, 15, 10, 30, 0)
            total_amount = 100.50
            sale_status_desc = "COMPLETED"

        # Map sale_status_desc to status
        mock_sale = MockSale()
        data = SaleResponse(
            id=mock_sale.id,
            store_id=mock_sale.store_id,
            customer_id=mock_sale.customer_id,
            channel_id=mock_sale.channel_id,
            created_at=mock_sale.created_at,
            total_amount=mock_sale.total_amount,
            status=mock_sale.sale_status_desc,
        )
        assert data.id == 1
        assert data.status == "COMPLETED"

    def test_sale_response_validation_error(self):
        """Test SaleResponse validation with missing required fields."""
        with pytest.raises(ValidationError):
            SaleResponse(id=1)
            # Missing required fields

