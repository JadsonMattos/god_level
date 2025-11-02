"""
Dashboard endpoints.
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.schemas.dashboard import (
    DashboardCreate,
    DashboardUpdate,
    DashboardResponse,
    DashboardListResponse,
)
from app.services.dashboard import DashboardService
from app.db.session import get_db
from app.core.logging import get_logger
from app.core.exceptions import NotFoundError, DatabaseError, ValidationError

logger = get_logger(__name__)

router = APIRouter()


def get_dashboard_service(db: Session = Depends(get_db)) -> DashboardService:
    """
    Get dashboard service.

    Args:
        db: Database session

    Returns:
        Dashboard service instance
    """
    return DashboardService(db)


@router.post("/dashboards", response_model=DashboardResponse)
async def create_dashboard(
    dashboard: DashboardCreate,
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    Create a new dashboard.

    Args:
        dashboard: Dashboard data
        service: Dashboard service

    Returns:
        Created dashboard
    """
    try:
        logger.info(
            "Creating dashboard",
            extra={"extra_data": {"name": dashboard.name}},
        )
        result = service.create_dashboard(dashboard)
        logger.info(
            "Dashboard created successfully",
            extra={"extra_data": {"dashboard_id": result.id}},
        )
        return result
    except SQLAlchemyError as e:
        error_msg = str(e).lower()

        # Check for common database issues
        if 'does not exist' in error_msg or 'no such table' in error_msg:
            logger.error(
                f"Database table does not exist: {str(e)}",
                exc_info=True
            )
            raise DatabaseError(
                (
                    "A tabela de dashboards não existe. "
                    "Execute as migrações do banco de dados."
                ),
                operation="create_dashboard"
            )
        elif 'connection' in error_msg or 'unable to connect' in error_msg:
            logger.error(
                f"Database connection error: {str(e)}",
                exc_info=True
            )
            raise DatabaseError(
                "Erro de conexão com o banco de dados. "
                "Verifique se o banco está rodando.",
                operation="create_dashboard"
            )

        logger.error(
            f"Database error creating dashboard: {str(e)}",
            exc_info=True
        )
        raise DatabaseError(
            f"Erro ao criar dashboard: {str(e)}",
            operation="create_dashboard"
        )
    except ValidationError:
        # Re-raise validation errors as-is
        raise
    except Exception as e:
        logger.critical(
            f"Unexpected error creating dashboard: {str(e)}",
            exc_info=True
        )
        raise
        raise


@router.get("/dashboards/default", response_model=Optional[DashboardResponse])
async def get_default_dashboard(
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    Get default dashboard.

    Args:
        service: Dashboard service

    Returns:
        Default dashboard or null if none set
    """
    try:
        logger.debug("Fetching default dashboard")
        dashboard = service.get_default_dashboard()
        if not dashboard:
            logger.debug("No default dashboard found - returning null")
            return None
        logger.info(
            "Default dashboard found",
            extra={"extra_data": {"dashboard_id": dashboard.id}},
        )
        return dashboard
    except SQLAlchemyError as e:
        # Handle database errors gracefully, returning None for known issues.
        error_msg = str(e).lower()
        if (
            "does not exist" in error_msg
            or "connection" in error_msg
            or "no such table" in error_msg
        ):
            logger.warning(
                "Database table may not exist or connection issue: %s", str(e)
            )
            return None
        logger.error(
            "Database error fetching default dashboard: %s", str(e),
            exc_info=True
        )
        raise DatabaseError(
            "Erro ao buscar dashboard padrão",
            operation="get_default_dashboard"
        )
    except Exception as e:
        logger.critical(
            "Unexpected error: %s", str(e),
            exc_info=True
        )
        raise


@router.get("/dashboards", response_model=DashboardListResponse)
async def list_dashboards(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    List all dashboards.

    Args:
        limit: Number of dashboards to return
        offset: Number of dashboards to skip
        service: Dashboard service

    Returns:
        List of dashboards
    """
    try:
        logger.debug(
            "Listing dashboards",
            extra={"extra_data": {"limit": limit, "offset": offset}},
        )
        dashboards, total = service.list_dashboards(limit=limit, offset=offset)
        logger.info(
            f"Dashboards listed: {len(dashboards)}/{total}",
            extra={"extra_data": {"count": len(dashboards), "total": total}},
        )
        return {
            "items": dashboards,
            "total": total
        }
    except SQLAlchemyError as e:
        error_msg = str(e).lower()
        if (
            "does not exist" in error_msg
            or "connection" in error_msg
            or "no such table" in error_msg
        ):
            logger.warning(
                "Database table may not exist or connection issue: %s", str(e)
            )
            return {
                "items": [],
                "total": 0
            }
        logger.error(
            "Database error listing dashboards: %s", str(e),
            exc_info=True
        )
        raise DatabaseError(
            "Erro ao listar dashboards",
            operation="list_dashboards"
        )
    except Exception as e:
        logger.critical(
            "Unexpected error: %s", str(e),
            exc_info=True
        )
        raise


@router.get("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: int,
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    Get dashboard by ID.

    Args:
        dashboard_id: Dashboard ID
        service: Dashboard service

    Returns:
        Dashboard
    """
    logger.debug(
        "Fetching dashboard",
        extra={"extra_data": {"dashboard_id": dashboard_id}},
    )
    dashboard = service.get_dashboard(dashboard_id)
    if not dashboard:
        logger.warning(
            "Dashboard not found",
            extra={"extra_data": {"dashboard_id": dashboard_id}},
        )
        raise NotFoundError("Dashboard", identifier=dashboard_id)

    return dashboard


@router.put("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: int,
    dashboard: DashboardUpdate,
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    Update dashboard.

    Args:
        dashboard_id: Dashboard ID
        dashboard: Update data
        service: Dashboard service

    Returns:
        Updated dashboard
    """
    try:
        logger.info(
            "Updating dashboard",
            extra={"extra_data": {"dashboard_id": dashboard_id}},
        )
        result = service.update_dashboard(dashboard_id, dashboard)
        if not result:
            logger.warning(
                "Dashboard not found for update",
                extra={"extra_data": {"dashboard_id": dashboard_id}},
            )
            raise NotFoundError("Dashboard", identifier=dashboard_id)
        logger.info(
            "Dashboard updated successfully",
            extra={"extra_data": {"dashboard_id": dashboard_id}},
        )
        return result
    except (NotFoundError, ValidationError):
        raise
    except SQLAlchemyError as e:
        logger.error(
            f"Database error updating dashboard: {str(e)}",
            exc_info=True
        )
        raise DatabaseError(
            "Erro ao atualizar dashboard",
            operation="update_dashboard"
        )
    except Exception as e:
        logger.critical(
            f"Unexpected error: {str(e)}",
            exc_info=True
        )
        raise


@router.delete("/dashboards/{dashboard_id}")
async def delete_dashboard(
    dashboard_id: int,
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    Delete dashboard.

    Args:
        dashboard_id: Dashboard ID
        service: Dashboard service

    Returns:
        Success message
    """
    logger.info(
        "Deleting dashboard",
        extra={"extra_data": {"dashboard_id": dashboard_id}},
    )
    success = service.delete_dashboard(dashboard_id)
    if not success:
        logger.warning(
            "Dashboard not found for deletion",
            extra={"extra_data": {"dashboard_id": dashboard_id}},
        )
        raise NotFoundError("Dashboard", identifier=dashboard_id)

    logger.info(
        "Dashboard deleted successfully",
        extra={"extra_data": {"dashboard_id": dashboard_id}},
    )
    return {"message": "Dashboard excluído com sucesso"}


@router.post("/dashboards/{dashboard_id}/share")
async def enable_dashboard_sharing(
    dashboard_id: int,
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    Enable sharing for a dashboard and get share link.

    Args:
        dashboard_id: Dashboard ID
        service: Dashboard service

    Returns:
        Dashboard with share token
    """
    try:
        logger.info(
            "Enabling dashboard sharing",
            extra={"extra_data": {"dashboard_id": dashboard_id}},
        )
        dashboard = service.enable_sharing(dashboard_id)
        if not dashboard:
            raise NotFoundError("Dashboard", identifier=dashboard_id)

        logger.info(
            "Dashboard sharing enabled",
            extra={
                "extra_data": {
                    "dashboard_id": dashboard_id,
                    "share_token": dashboard.share_token,
                }
            },
        )
        return dashboard
    except SQLAlchemyError as e:
        logger.error(
            f"Database error enabling sharing: {str(e)}",
            exc_info=True,
        )
        raise DatabaseError(
            "Erro ao habilitar compartilhamento",
            operation="enable_sharing"
        )
    except Exception as e:
        logger.critical(
            f"Unexpected error: {str(e)}",
            exc_info=True,
        )
        raise


@router.delete("/dashboards/{dashboard_id}/share")
async def disable_dashboard_sharing(
    dashboard_id: int,
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    Disable sharing for a dashboard.

    Args:
        dashboard_id: Dashboard ID
        service: Dashboard service

    Returns:
        Dashboard
    """
    try:
        logger.info(
            "Disabling dashboard sharing",
            extra={"extra_data": {"dashboard_id": dashboard_id}},
        )
        dashboard = service.disable_sharing(dashboard_id)
        if not dashboard:
            raise NotFoundError("Dashboard", identifier=dashboard_id)

        logger.info(
            "Dashboard sharing disabled",
            extra={"extra_data": {"dashboard_id": dashboard_id}}
        )
        return dashboard
    except (NotFoundError, ValidationError):
        raise
    except SQLAlchemyError as e:
        logger.error(
            f"Database error disabling sharing: {str(e)}",
            exc_info=True
        )
        raise DatabaseError(
            "Erro ao desabilitar compartilhamento",
            operation="disable_sharing"
        )
    except Exception as e:
        logger.critical(
            f"Unexpected error: {str(e)}",
            exc_info=True
        )
        raise


@router.get(
    "/dashboards/share/{share_token}",
    response_model=DashboardResponse
)
async def get_shared_dashboard(
    share_token: str,
    service: DashboardService = Depends(get_dashboard_service),
):
    """
    Get shared dashboard by token (public endpoint).

    Args:
        share_token: Share token
        service: Dashboard service

    Returns:
        Shared dashboard
    """
    try:
        logger.debug(
            "Fetching shared dashboard",
            extra={"extra_data": {"share_token": share_token}},
        )
        dashboard = service.get_dashboard_by_token(share_token)
        if not dashboard:
            logger.warning(
                "Shared dashboard not found or not shared",
                extra={"extra_data": {"share_token": share_token}}
            )
            raise NotFoundError(
                "Dashboard compartilhado",
                identifier=share_token
            )

        logger.info(
            "Shared dashboard found",
            extra={
                "extra_data": {
                    "dashboard_id": dashboard.id,
                    "share_token": share_token
                }
            }
        )
        return dashboard
    except (NotFoundError, ValidationError):
        raise
    except SQLAlchemyError as e:
        logger.error(
            f"Database error fetching shared dashboard: {str(e)}",
            exc_info=True
        )
        raise DatabaseError(
            "Erro ao buscar dashboard compartilhado",
            operation="get_shared_dashboard"
        )
    except Exception as e:
        logger.critical(
            f"Unexpected error: {str(e)}",
            exc_info=True
        )
        raise
