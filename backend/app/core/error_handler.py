"""
Global error handlers for FastAPI.
"""

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import (
    NotFoundError,
    ValidationError,
    DatabaseError,
)
from app.core.logging import get_logger

logger = get_logger(__name__)


def register_error_handlers(app):
    """Register global error handlers."""

    @app.exception_handler(NotFoundError)
    async def not_found_handler(
        request: Request, exc: NotFoundError
    ) -> JSONResponse:
        """Handle not found errors."""
        logger.warning(
            f"Resource not found: {exc.message}",
            extra={
                "extra_data": {
                    "path": request.url.path,
                    "resource": exc.details.get("resource"),
                }
            },
        )

        return JSONResponse(
            status_code=404,
            content={
                "error": exc.message,
                "message": "O recurso solicitado não foi encontrado.",
                "details": exc.details,
            },
        )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(
        request: Request, exc: ValidationError
    ) -> JSONResponse:
        """Handle validation errors."""
        logger.warning(
            f"Validation error: {exc.message}",
            extra={
                "extra_data": {
                    "path": request.url.path,
                    "field": exc.details.get("field"),
                }
            },
        )

        # Return 422 for validation errors (matches Pydantic v2 behavior)
        return JSONResponse(
            status_code=422,
            content={
                "error": "Dados inválidos",
                "message": exc.message,
                "details": exc.details,
            },
        )

    @app.exception_handler(DatabaseError)
    async def database_error_handler(
        request: Request,
        exc: DatabaseError,
    ) -> JSONResponse:
        """Handle database errors."""
        logger.error(
            f"Database error: {exc.message}",
            extra={
                "extra_data": {
                    "path": request.url.path,
                    "operation": exc.details.get("operation"),
                }
            },
            exc_info=True,
        )

        return JSONResponse(
            status_code=503,
            content={
                "error": "Erro de banco de dados",
                "message": (
                    "Não foi possível processar sua solicitação. "
                    "Tente novamente mais tarde."
                ),
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(
        request: Request, exc: SQLAlchemyError
    ) -> JSONResponse:
        """Handle SQLAlchemy errors."""
        logger.error(
            f"SQLAlchemy error: {str(exc)}",
            extra={
                "extra_data": {
                    "path": request.url.path,
                    "error_type": type(exc).__name__,
                }
            },
            exc_info=True,
        )

        return JSONResponse(
            status_code=503,
            content={
                "error": "Erro de banco de dados",
                "message": (
                    "Erro ao acessar o banco de dados. "
                    "Tente novamente mais tarde."
                ),
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Handle request validation errors."""
        errors = exc.errors()
        logger.warning(
            "Request validation error",
            extra={
                "extra_data": {
                    "path": request.url.path,
                    "errors": errors,
                }
            },
        )

        return JSONResponse(
            status_code=422,
            content={
                "error": "Dados de entrada inválidos",
                "message": "Verifique os dados enviados e tente novamente.",
                "details": errors,
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """Handle all other exceptions."""
        logger.critical(
            f"Unhandled exception: {type(exc).__name__}: {str(exc)}",
            extra={
                "extra_data": {
                    "path": request.url.path,
                    "error_type": type(exc).__name__,
                }
            },
            exc_info=True,
        )

        return JSONResponse(
            status_code=500,
            content={
                "error": "Erro interno do servidor",
                "message": (
                    "Ocorreu um erro inesperado. Tente novamente mais tarde."
                ),
            },
        )
