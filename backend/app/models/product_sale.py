"""
ProductSale model.
"""

from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel
from app.models.constants import CASCADE_ALL_DELETE_ORPHAN


class ProductSale(BaseModel):
    """ProductSale model."""

    __tablename__ = "product_sales"

    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    base_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    observations = Column(String(300))

    # Relationships
    sale = relationship("Sale", back_populates="products")
    product = relationship("Product", back_populates="sales")
    items = relationship(
        "ItemProductSale",
        back_populates="product_sale",
        cascade=CASCADE_ALL_DELETE_ORPHAN
    )
