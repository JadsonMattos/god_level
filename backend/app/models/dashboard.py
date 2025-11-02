"""
Dashboard model.
"""

from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean
from datetime import datetime, timezone
import secrets

from app.db.base import Base


class Dashboard(Base):
    """Dashboard model."""

    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Dashboard configuration (JSON)
    config = Column(JSON, nullable=False)

    # Owner
    user_id = Column(Integer, nullable=True)  # For future auth

    # Default dashboard flag
    is_default = Column(Boolean, default=False, nullable=False, index=True)

    # Sharing
    share_token = Column(String(64), nullable=True, unique=True, index=True)
    is_shared = Column(Boolean, default=False, nullable=False)

    # Metadata
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    def generate_share_token(self):
        """Generate a unique share token."""
        self.share_token = secrets.token_urlsafe(24)
        self.is_shared = True
        return self.share_token

    def __repr__(self):
        return f"<Dashboard {self.name}>"
