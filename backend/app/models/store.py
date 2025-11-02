"""
Store model.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    Numeric,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class Store(BaseModel):
    """Store model."""

    __tablename__ = "stores"

    brand_id = Column(Integer, ForeignKey("brands.id"))
    sub_brand_id = Column(Integer, ForeignKey("sub_brands.id"))
    name = Column(String(255), nullable=False)
    city = Column(String(100))
    state = Column(String(2))
    district = Column(String(100))
    address_street = Column(String(200))
    address_number = Column(Integer)
    zipcode = Column(String(10))
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))
    is_active = Column(Boolean, default=True)
    is_own = Column(Boolean, default=False)
    is_holding = Column(Boolean, default=False)
    creation_date = Column(Date)

    # Relationships
    brand = relationship("Brand", back_populates="stores")
    sub_brand = relationship("SubBrand", back_populates="stores")
    sales = relationship("Sale", back_populates="store")
