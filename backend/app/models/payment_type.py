"""
PaymentType model.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class PaymentType(BaseModel):
    """PaymentType model."""

    __tablename__ = "payment_types"

    brand_id = Column(Integer, ForeignKey("brands.id"))
    description = Column(String(100), nullable=False)

    # Relationships
    payments = relationship("Payment", back_populates="payment_type")
