"""
Item model.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class Item(BaseModel):
    """Item model."""

    __tablename__ = "items"

    brand_id = Column(Integer, ForeignKey("brands.id"))
    sub_brand_id = Column(Integer, ForeignKey("sub_brands.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    name = Column(String(500), nullable=False)
    pos_uuid = Column(String(100))
    deleted_at = Column(DateTime)

    # Relationships
    product_sales = relationship("ItemProductSale", back_populates="item")
