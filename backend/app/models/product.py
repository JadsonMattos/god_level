"""
Product model.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class Product(BaseModel):
    """Product model."""

    __tablename__ = "products"

    brand_id = Column(Integer, ForeignKey("brands.id"))
    sub_brand_id = Column(Integer, ForeignKey("sub_brands.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    name = Column(String(500), nullable=False)
    pos_uuid = Column(String(100))
    deleted_at = Column(DateTime)
    cost = Column(Numeric(10, 2), default=0.00)

    # Relationships
    sales = relationship("ProductSale", back_populates="product")
