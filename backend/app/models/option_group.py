"""
OptionGroup model.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import BaseModel


class OptionGroup(BaseModel):
    """OptionGroup model."""

    __tablename__ = "option_groups"

    brand_id = Column(Integer, ForeignKey("brands.id"))
    sub_brand_id = Column(Integer, ForeignKey("sub_brands.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    name = Column(String(500), nullable=False)
    pos_uuid = Column(String(100))
