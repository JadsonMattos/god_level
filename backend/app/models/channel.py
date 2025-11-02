"""
Channel model.
"""

from sqlalchemy import Column, Integer, String, CHAR, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class Channel(BaseModel):
    """Channel model."""

    __tablename__ = "channels"

    brand_id = Column(Integer, ForeignKey("brands.id"))
    name = Column(String(100), nullable=False)
    description = Column(String(255))
    type = Column(CHAR(1))

    # Relationships
    brand = relationship("Brand", back_populates="channels")
    sales = relationship("Sale", back_populates="channel")
