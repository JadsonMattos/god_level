"""
Customer model.
"""

from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class Customer(BaseModel):
    """Customer model."""

    __tablename__ = "customers"

    customer_name = Column(String(100))
    email = Column(String(100))
    phone_number = Column(String(50))
    cpf = Column(String(100))
    birth_date = Column(Date)
    gender = Column(String(10))
    store_id = Column(Integer, ForeignKey("stores.id"))
    sub_brand_id = Column(Integer)
    registration_origin = Column(String(20))
    agree_terms = Column(Boolean, default=False)
    receive_promotions_email = Column(Boolean, default=False)
    receive_promotions_sms = Column(Boolean, default=False)

    # Relationships
    sales = relationship("Sale", back_populates="customer")
