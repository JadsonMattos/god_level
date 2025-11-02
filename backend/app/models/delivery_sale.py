"""
DeliverySale model.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel
from app.models.constants import CASCADE_ALL_DELETE_ORPHAN


class DeliverySale(BaseModel):
    """DeliverySale model."""

    __tablename__ = "delivery_sales"

    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    courier_id = Column(String(100))
    courier_name = Column(String(100))
    courier_phone = Column(String(100))
    courier_type = Column(String(100))
    delivered_by = Column(String(100))
    delivery_type = Column(String(100))
    status = Column(String(100))
    delivery_fee = Column(Float)
    courier_fee = Column(Float)
    timing = Column(String(100))
    mode = Column(String(100))
    delivery_time_minutes = Column(Integer)

    # Relationships
    sale = relationship("Sale", back_populates="delivery")
    addresses = relationship(
        "DeliveryAddress",
        back_populates="delivery_sale",
        cascade=CASCADE_ALL_DELETE_ORPHAN
    )
