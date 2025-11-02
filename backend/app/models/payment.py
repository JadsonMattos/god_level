"""
Payment model.
"""

from sqlalchemy import Column, Integer, Boolean, String, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class Payment(BaseModel):
    """Payment model."""

    __tablename__ = "payments"

    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    payment_type_id = Column(Integer, ForeignKey("payment_types.id"))
    value = Column(Numeric(10, 2), nullable=False)
    is_online = Column(Boolean, default=False)
    description = Column(String(100))
    currency = Column(String(10), default="BRL")

    # Relationships
    sale = relationship("Sale", back_populates="payments")
    payment_type = relationship("PaymentType", back_populates="payments")
