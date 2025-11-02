"""
Category model.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, CHAR, DateTime
from app.db.base import BaseModel


class Category(BaseModel):
    """Category model."""

    __tablename__ = "categories"

    brand_id = Column(Integer, ForeignKey("brands.id"))
    sub_brand_id = Column(Integer, ForeignKey("sub_brands.id"))
    name = Column(String(200), nullable=False)
    type = Column(CHAR(1), default="P")
    pos_uuid = Column(String(100))
    deleted_at = Column(DateTime)
