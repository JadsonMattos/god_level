"""
Base model for SQLAlchemy.
"""

from sqlalchemy import Column, Integer, DateTime, func
from app.db.session import Base


class BaseModel(Base):
    """Base model with common fields."""

    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(
        DateTime,
        server_default=func.now()
    )
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )
