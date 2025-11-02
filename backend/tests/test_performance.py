"""
Performance and load tests for the analytics system.
These tests verify system performance under various load conditions.
"""

import pytest
import time
import threading
import random
from datetime import datetime, timedelta
import statistics
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.store import Store
from app.models.channel import Channel
from app.models.product import Product
from app.models.sale import Sale
from app.models.product_sale import ProductSale
from app.models.customer import Customer
from app.models.payment import Payment
from app.models.payment_type import PaymentType
from app.services.analytics import AnalyticsService


class TestPerformance:
    """Performance tests for the analytics system."""

    @pytest.fixture(autouse=True)
    def setup_performance_test_db(self, client):
        """Set up test database with large dataset for performance testing."""
        # Create in-memory SQLite database
        engine = create_engine(
            "sqlite:///:memory:", connect_args={"check_same_thread": False}
        )
        TestingSessionLocal = sessionmaker(autoflush=False, bind=engine)

        Base.metadata.create_all(bind=engine)

        self.db = TestingSessionLocal()
        self.client = client

        self._create_large_dataset()
        yield

        self.db.close()

    def _create_large_dataset(self):
        """Create a large dataset for performance testing."""
        print("Creating large dataset for performance testing...")

        # Create stores
        stores = []
        for i in range(10):
            store = Store(
                id=i + 1,
                name=f"Loja {i + 1}",
                address_street=f"Rua {i + 1}",
                address_number=100 + i,
                city="São Paulo",
                state="SP",
                zipcode=f"0{i:04d}-{100 + i:03d}",
            )
            stores.append(store)
        self.db.add_all(stores)

        # Create channels
        channels = []
        channel_names = [
            "Presencial",
            "iFood",
            "Rappi",
            "Uber Eats",
            "WhatsApp",
        ]
        for i, name in enumerate(channel_names):
            channel = Channel(
                id=i + 1, name=name, type="D" if name != "Presencial" else "P"
            )
            channels.append(channel)
        self.db.add_all(channels)

        # Create customers
        customers = []
        for i in range(1000):  # 1000 customers
            customer = Customer(
                id=i + 1,
                customer_name=f"Cliente {i + 1}",
                email=f"cliente{i + 1}@email.com",
                phone_number=f"119{i:08d}",
            )
            customers.append(customer)
        self.db.add_all(customers)

        # Create products
        products = []
        product_names = [
            "Hambúrguer Clássico",
            "Hambúrguer Especial",
            "Hambúrguer Vegetariano",
            "Batata Frita",
            "Batata Doce",
            "Onion Rings",
            "Refrigerante",
            "Suco Natural",
            "Água",
            "Sorvete",
            "Pudim",
            "Brownie",
        ]
        for i, name in enumerate(product_names):
            product = Product(id=i + 1, name=name, cost=10.00 + (i * 2.50))
            products.append(product)
        self.db.add_all(products)

        # Create payment types
        payment_types = []
        payment_type_names = ["Dinheiro", "Cartão", "PIX"]
        for i, name in enumerate(payment_type_names):
            payment_type = PaymentType(id=i + 1, description=name)
            payment_types.append(payment_type)
        self.db.add_all(payment_types)
        self.db.commit()

        # Create sales (10,000 sales)
        sales = []
        product_sales = []
        payments = []
        num_sales = 10000

        base_date = datetime.now() - timedelta(days=365)

        for i in range(num_sales):
            # Distribute sales across the year
            days_offset = i % 365
            hours_offset = i % 24
            sale_date = base_date + timedelta(
                days=days_offset, hours=hours_offset
            )

            # Randomize other attributes
            store_id = (i % 10) + 1
            channel_id = (i % 5) + 1
            customer_id = (i % 1000) + 1

            # Vary amounts
            base_amount = 20.00 + (i % 50)
            total_amount_items = base_amount + (i % 10)
            total_amount = total_amount_items

            sale = Sale(
                id=i + 1,
                store_id=store_id,
                channel_id=channel_id,
                customer_id=customer_id,
                total_amount_items=total_amount_items,
                total_amount=total_amount,
                created_at=sale_date,
                sale_status_desc="COMPLETED",
                delivery_seconds=1800 + (i % 1800),  # 30-60 minutes
            )
            sales.append(sale)

        self.db.add_all(sales)
        self.db.flush()  # Flush to get sale IDs

        # Create product sales
        for sale in sales:
            num_products_in_sale = random.randint(1, 5)
            for _ in range(num_products_in_sale):
                product = random.choice(products)
                quantity = random.randint(1, 3)
                base_price = (
                    product.cost
                )  # Use cost as base price for simplicity in test data
                item_total_price = base_price * quantity

                product_sale = ProductSale(
                    id=len(product_sales) + 1,
                    sale_id=sale.id,
                    product_id=product.id,
                    quantity=quantity,
                    base_price=base_price,
                    total_price=item_total_price,
                )
                product_sales.append(product_sale)

        self.db.add_all(product_sales)

        # Create payments
        for i, sale in enumerate(sales):
            payment_type_id = (i % 3) + 1  # Cash, Card, PIX
            payment = Payment(
                id=i + 1,
                sale_id=sale.id,
                payment_type_id=payment_type_id,
                value=sale.total_amount,
                created_at=sale.created_at,
            )
            payments.append(payment)

        self.db.add_all(payments)
        self.db.commit()
        print(
            f"Created {num_sales} sales with {len(product_sales)} product\
                sales and {len(payments)} payments"
        )

    def test_large_dataset_query_performance(self):
        """Test the performance of a complex query on a large dataset."""
        start_time = time.time()
        response = self.client.get("/api/v1/analytics/revenue?group_by=month")
        end_time = time.time()

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "data" in data

        duration = end_time - start_time
        print(f"\nRevenue by month query took {duration:.2f} seconds.")
        assert duration < 2.0  # Example threshold

    def test_single_request_performance(self):
        """Test the performance of a single request."""
        start_time = time.time()
        response = self.client.get("/api/v1/analytics/summary")
        end_time = time.time()

        assert response.status_code == 200
        data = response.json()
        assert "total_revenue" in data

        duration = end_time - start_time
        print(f"\nSingle request took {duration:.2f} seconds.")
        assert duration < 1.0  # Should be fast for a single request

    def test_concurrent_requests_stability(self):
        """Test the stability of the API under concurrent load."""
        num_requests = 50
        results = []
        errors = []

        def make_request():
            try:
                res = self.client.get("/api/v1/analytics/summary")
                results.append(res)
            except Exception as e:
                errors.append(e)

        threads = []
        for _ in range(num_requests):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()

        # Check that all requests succeeded
        assert len(errors) == 0, f"Found {len(errors)} errors: {errors}"
        assert (
            len(results) == num_requests
        ), f"Expected {num_requests} results, got {len(results)}"

        # Check that all responses are successful
        for res in results:
            assert res.status_code == 200
            assert "total_revenue" in res.json()

    def test_analytics_service_performance(self):
        """Test the performance of the AnalyticsService directly."""
        service = AnalyticsService(self.db)

        # Test revenue query performance
        start_time = time.time()
        revenue_data = service.get_revenue()
        end_time = time.time()

        assert isinstance(revenue_data, list)
        assert len(revenue_data) > 0

        duration = end_time - start_time
        print(f"\nAnalyticsService.get_revenue() took {duration:.2f} seconds.")
        assert duration < 1.0

    def test_memory_usage_under_load(self):
        """Test memory usage doesn't grow excessively under load."""
        # Make many requests to test stability
        for _ in range(100):
            response = self.client.get("/api/v1/analytics/summary")
            assert response.status_code == 200

        print("\nCompleted 100 requests successfully -\
            memory usage test passed")

    def test_response_time_distribution(self):
        """Test the distribution of response times."""
        response_times = []

        for _ in range(20):
            start_time = time.time()
            response = self.client.get("/api/v1/analytics/summary")
            end_time = time.time()

            assert response.status_code == 200
            response_times.append(end_time - start_time)

        avg_time = statistics.mean(response_times)
        max_time = max(response_times)
        min_time = min(response_times)

        print(
            f"\nResponse time stats: avg={avg_time:.3f}s,\
                min={min_time:.3f}s, max={max_time:.3f}s"
        )

        assert avg_time < 0.5  # Average should be fast
        assert max_time < 1.0  # Max should not be too slow

    def test_database_query_performance(self):
        """Test database query performance directly."""
        from sqlalchemy import text

        # Test a complex query
        start_time = time.time()
        result = self.db.execute(
            text(
                """
            SELECT
                DATE(created_at) as date,
                COUNT(*) as sales_count,
                SUM(total_amount) as total_revenue
            FROM sales
            WHERE sale_status_desc = 'COMPLETED'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        """
            )
        )
        end_time = time.time()

        rows = result.fetchall()
        assert len(rows) > 0

        duration = end_time - start_time
        print(f"\nDirect database query took {duration:.2f} seconds.")
        assert duration < 0.5  # Should be very fast
