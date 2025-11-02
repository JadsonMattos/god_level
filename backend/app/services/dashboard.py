"""
Dashboard service.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.dashboard import Dashboard as DashboardModel
from app.schemas.dashboard import DashboardCreate, DashboardUpdate


class DashboardService:
    """Service for dashboard operations."""

    def __init__(self, db: Session):
        """
        Initialize dashboard service.

        Args:
            db: Database session
        """
        self.db = db

    def create_dashboard(
        self, dashboard: DashboardCreate, user_id: Optional[int] = None
    ) -> DashboardModel:
        """
        Create a new dashboard.

        Args:
            dashboard: Dashboard data
            user_id: User ID (for future auth)

        Returns:
            Created dashboard
        """
        # If this dashboard is being set as default, unset all other defaults
        if dashboard.is_default:
            self.db.query(DashboardModel).filter(
                DashboardModel.is_default.is_(True)
            ).update({DashboardModel.is_default: False})

        # Ensure config is a dict (handle both model_dump() and dict)
        config_dict = (
            dashboard.config.model_dump()
            if hasattr(dashboard.config, "model_dump")
            else dashboard.config
        )

        # Ensure widgets is a list
        if (
            isinstance(config_dict, dict)
            and "widgets" in config_dict
            and not isinstance(config_dict["widgets"], list)
        ):
            config_dict["widgets"] = []

        db_dashboard = DashboardModel(
            name=dashboard.name,
            description=dashboard.description,
            config=config_dict,
            is_default=dashboard.is_default or False,
            user_id=user_id,
        )

        try:
            self.db.add(db_dashboard)
            self.db.commit()
            self.db.refresh(db_dashboard)
        except Exception:
            # Rollback on error
            self.db.rollback()
            raise

        return db_dashboard

    def get_dashboard(self, dashboard_id: int) -> Optional[DashboardModel]:
        """
        Get dashboard by ID.

        Args:
            dashboard_id: Dashboard ID

        Returns:
            Dashboard or None
        """
        return (
            self.db.query(DashboardModel)
            .filter(DashboardModel.id == dashboard_id)
            .first()
        )

    def list_dashboards(
        self, user_id: Optional[int] = None, limit: int = 20, offset: int = 0
    ) -> tuple[List[DashboardModel], int]:
        """
        List dashboards.

        Args:
            user_id: Filter by user ID
            limit: Limit results
            offset: Offset for pagination

        Returns:
            Tuple of (dashboards, total count)
        """
        query = self.db.query(DashboardModel)

        if user_id is not None:
            query = query.filter(DashboardModel.user_id == user_id)

        total = query.count()
        dashboards = (
            query.order_by(desc(DashboardModel.created_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

        return dashboards, total

    def update_dashboard(
        self, dashboard_id: int, dashboard: DashboardUpdate
    ) -> Optional[DashboardModel]:
        """
        Update dashboard.

        Args:
            dashboard_id: Dashboard ID
            dashboard: Update data

        Returns:
            Updated dashboard or None
        """
        db_dashboard = self.get_dashboard(dashboard_id)
        if not db_dashboard:
            return None

        if dashboard.name is not None:
            db_dashboard.name = dashboard.name

        if dashboard.description is not None:
            db_dashboard.description = dashboard.description

        if dashboard.config is not None:
            db_dashboard.config = dashboard.config.dict()

        # If setting as default, unset all other defaults
        if dashboard.is_default is not None:
            if dashboard.is_default:
                self.db.query(DashboardModel).filter(
                    DashboardModel.is_default.is_(True),
                    DashboardModel.id != dashboard_id,
                ).update({DashboardModel.is_default: False})
            db_dashboard.is_default = dashboard.is_default

        self.db.commit()
        self.db.refresh(db_dashboard)

        return db_dashboard

    def get_default_dashboard(self) -> Optional[DashboardModel]:
        """
        Get default dashboard.

        Returns:
            Default dashboard or None
        """
        return (
            self.db.query(DashboardModel)
            .filter(DashboardModel.is_default.is_(True))
            .first()
        )

    def delete_dashboard(self, dashboard_id: int) -> bool:
        """
        Delete dashboard.

        Args:
            dashboard_id: Dashboard ID

        Returns:
            True if deleted, False otherwise
        """
        db_dashboard = self.get_dashboard(dashboard_id)
        if not db_dashboard:
            return False

        self.db.delete(db_dashboard)
        self.db.commit()

        return True

    def get_dashboard_by_token(
        self, share_token: str
    ) -> Optional[DashboardModel]:
        """
        Get dashboard by share token.

        Args:
            share_token: Share token

        Returns:
            Dashboard or None
        """
        return (
            self.db.query(DashboardModel)
            .filter(
                DashboardModel.share_token == share_token,
                DashboardModel.is_shared.is_(True),
            )
            .first()
        )

    def enable_sharing(self, dashboard_id: int) -> Optional[DashboardModel]:
        """
        Enable sharing for a dashboard and generate share token.

        Args:
            dashboard_id: Dashboard ID

        Returns:
            Dashboard with share token or None
        """
        db_dashboard = self.get_dashboard(dashboard_id)
        if not db_dashboard:
            return None

        if not db_dashboard.share_token:
            db_dashboard.generate_share_token()
        else:
            db_dashboard.is_shared = True

        self.db.commit()
        self.db.refresh(db_dashboard)

        return db_dashboard

    def disable_sharing(self, dashboard_id: int) -> Optional[DashboardModel]:
        """
        Disable sharing for a dashboard.

        Args:
            dashboard_id: Dashboard ID

        Returns:
            Dashboard or None
        """
        db_dashboard = self.get_dashboard(dashboard_id)
        if not db_dashboard:
            return None

        db_dashboard.is_shared = False
        # Keep token but mark as not shared (allows re-enabling)

        self.db.commit()
        self.db.refresh(db_dashboard)

        return db_dashboard
