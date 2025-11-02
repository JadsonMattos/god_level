"""
DeliveryAddress model.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class DeliveryAddress(BaseModel):
    """DeliveryAddress model."""

    __tablename__ = "delivery_addresses"

    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    delivery_sale_id = Column(Integer, ForeignKey("delivery_sales.id"))
    street = Column(String(200))
    number = Column(String(20))
    complement = Column(String(200))
    formatted_address = Column(String(500))
    neighborhood = Column(String(100))
    city = Column(String(100))
    state = Column(String(50))
    country = Column(String(100))
    postal_code = Column(String(20))
    reference = Column(String(300))
    latitude = Column(Float)
    longitude = Column(Float)

    # Relationships
    delivery_sale = relationship("DeliverySale", back_populates="addresses")
