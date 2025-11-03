"""
Pytest configuration.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db.base import Base
from app.main import app

# Import all models to ensure tables are created
from app.models import (
    Brand,
    SubBrand,
    Store,
    Channel,
    Category,
    Product,
    Item,
    OptionGroup,
    Customer,
    Sale,
    ProductSale,
    ItemProductSale,
    Payment,
    PaymentType,
    DeliverySale,
    DeliveryAddress,
    Dashboard,
)


@pytest.fixture(scope="session")
def test_db_url():
    """Test database URL."""
    return "sqlite:///./test.db"


@pytest.fixture(scope="session")
def db_engine(test_db_url):
    """Create test database engine."""
    engine = create_engine(
        test_db_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create test database session."""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create test client with database session override."""
    def override_get_db():
        yield db_session

    from app.db.session import get_db
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
