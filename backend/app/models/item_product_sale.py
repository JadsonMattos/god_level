"""
ItemProductSale model.
"""

from sqlalchemy import Column, Integer, Float, ForeignKey, String
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class ItemProductSale(BaseModel):
    """ItemProductSale model."""

    __tablename__ = "item_product_sales"

    product_sale_id = Column(
        Integer, ForeignKey("product_sales.id"), nullable=False
    )
    item_id = Column(
        Integer, ForeignKey("items.id"), nullable=False
    )
    option_group_id = Column(
        Integer, ForeignKey("option_groups.id")
    )
    quantity = Column(Float, nullable=False)
    additional_price = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    amount = Column(Float, default=1)
    observations = Column(String(300))
    # Relationships
    product_sale = relationship("ProductSale", back_populates="items")
    item = relationship("Item", back_populates="product_sales")
