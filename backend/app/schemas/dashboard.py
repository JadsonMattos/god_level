"""
Dashboard schemas.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class DashboardConfig(BaseModel):
    """Dashboard configuration."""

    widgets: list[Dict[str, Any]] = Field(default_factory=list)
    layout: dict[str, Any] = Field(default_factory=dict)
    filters: dict[str, Any] = Field(default_factory=dict)


class DashboardBase(BaseModel):
    """Base dashboard schema."""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    config: DashboardConfig
    is_default: Optional[bool] = Field(
        False,
        description="Set as default dashboard"
    )


class DashboardCreate(DashboardBase):
    """Create dashboard schema."""

    pass


class DashboardUpdate(BaseModel):
    """Update dashboard schema."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    config: Optional[DashboardConfig] = None
    is_default: Optional[bool] = Field(
        None,
        description="Set as default dashboard"
    )


class DashboardResponse(DashboardBase):
    """Dashboard response schema."""

    id: int
    user_id: Optional[int]
    is_default: bool
    share_token: Optional[str] = None
    is_shared: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DashboardListResponse(BaseModel):
    """Dashboard list response."""

    items: list[DashboardResponse]
    total: int
