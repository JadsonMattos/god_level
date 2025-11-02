"""
Brand model.
"""

from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class Brand(BaseModel):
    """Brand model."""

    __tablename__ = "brands"

    name = Column(String(255), nullable=False)

    # Relationships
    sub_brands = relationship("SubBrand", back_populates="brand")
    stores = relationship("Store", back_populates="brand")
    channels = relationship("Channel", back_populates="brand")
