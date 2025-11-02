"""
Sale model.
"""

from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.constants import CASCADE_ALL_DELETE_ORPHAN


class Sale(Base):
    """Sale model."""

    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime)

    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    sub_brand_id = Column(Integer, ForeignKey("sub_brands.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)

    cod_sale1 = Column(String(100))
    cod_sale2 = Column(String(100))
    customer_name = Column(String(100))
    sale_status_desc = Column(String(100), nullable=False)

    # Financial values
    total_amount_items = Column(Numeric(10, 2), nullable=False)
    total_discount = Column(Numeric(10, 2), default=0)
    total_increase = Column(Numeric(10, 2), default=0)
    delivery_fee = Column(Numeric(10, 2), default=0)
    service_tax_fee = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    value_paid = Column(Numeric(10, 2), default=0)

    # Operational metrics
    production_seconds = Column(Integer)
    delivery_seconds = Column(Integer)
    people_quantity = Column(Integer)

    # Metadata
    discount_reason = Column(String(300))
    increase_reason = Column(String(300))
    origin = Column(String(100), default="POS")

    # Relationships
    store = relationship("Store", back_populates="sales")
    sub_brand = relationship("SubBrand", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")
    channel = relationship("Channel", back_populates="sales")
    products = relationship(
        "ProductSale",
        back_populates="sale",
        cascade=CASCADE_ALL_DELETE_ORPHAN
    )
    payments = relationship(
        "Payment",
        back_populates="sale",
        cascade=CASCADE_ALL_DELETE_ORPHAN
    )
    delivery = relationship(
        "DeliverySale",
        back_populates="sale",
        uselist=False,
        cascade=CASCADE_ALL_DELETE_ORPHAN
    )
