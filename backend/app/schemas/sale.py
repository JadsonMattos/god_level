"""
Sale schemas.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SaleResponse(BaseModel):
    """Sale response schema."""

    id: int
    store_id: int
    customer_id: Optional[int]
    channel_id: int
    created_at: datetime
    total_amount: float = Field(..., description="Total amount of the sale")
    status: str = Field(..., description="Sale status")

    model_config = {"from_attributes": True}
