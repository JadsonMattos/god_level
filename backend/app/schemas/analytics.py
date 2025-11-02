"""
Analytics schemas.
"""

from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.constants import (
    DESC_TOTAL_REVENUE,
    DESC_NUMBER_OF_SALES,
    DESC_AVG_TICKET_VALUE,
    DESC_TOTAL_QUANTITY_SOLD,
    DESC_AVG_PRICE,
)


class RevenueData(BaseModel):
    """Revenue data schema."""

    period: str
    revenue: float = Field(..., description=DESC_TOTAL_REVENUE)
    sales_count: int = Field(..., description=DESC_NUMBER_OF_SALES)
    avg_ticket: float = Field(..., description=DESC_AVG_TICKET_VALUE)

    model_config = {"from_attributes": True}


class ProductData(BaseModel):
    """Product analytics schema."""

    product_name: str
    total_quantity: float = Field(..., description=DESC_TOTAL_QUANTITY_SOLD)
    sales_count: int = Field(..., description=DESC_NUMBER_OF_SALES)
    total_revenue: float = Field(..., description=DESC_TOTAL_REVENUE)
    avg_price: float = Field(..., description=DESC_AVG_PRICE)

    model_config = {"from_attributes": True}


class ChannelData(BaseModel):
    """Channel performance schema."""

    channel_name: str
    channel_type: str = Field(
        ..., description="'P' for Presencial, 'D' for Delivery"
    )
    total_revenue: float = Field(..., description=DESC_TOTAL_REVENUE)
    sales_count: int = Field(..., description=DESC_NUMBER_OF_SALES)
    avg_ticket: float = Field(..., description=DESC_AVG_TICKET_VALUE)

    model_config = {"from_attributes": True}


class MetricsSummary(BaseModel):
    """Summary metrics schema."""

    total_revenue: float = Field(..., description=DESC_TOTAL_REVENUE)
    sales_count: int = Field(..., description="Total number of sales")
    avg_ticket: float = Field(..., description=DESC_AVG_TICKET_VALUE)
    first_sale: Optional[str] = Field(None, description="First sale date")
    last_sale: Optional[str] = Field(None, description="Last sale date")
