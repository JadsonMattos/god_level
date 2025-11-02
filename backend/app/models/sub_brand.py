"""
SubBrand model.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class SubBrand(BaseModel):
    """SubBrand model."""

    __tablename__ = "sub_brands"

    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)
    name = Column(String(255), nullable=False)

    # Relationships
    brand = relationship("Brand", back_populates="sub_brands")
    stores = relationship("Store", back_populates="sub_brand")
    sales = relationship("Sale", back_populates="sub_brand")
