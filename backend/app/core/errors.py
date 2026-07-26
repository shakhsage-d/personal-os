"""
Umumiy xato-handlerlar. `app/main.py`da `register_error_handlers(app)` orqali ulanadi.
Maqsad: har bir xato (validatsiya, HTTPException, kutilmagan) bir xil
`ErrorResponse` (`code`, `detail`) formatida qaytishi — frontend shu formatga
tayanadi.
"""
import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.schemas import ErrorResponse

logger = logging.getLogger("personal_os")


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(detail=str(exc.detail), code=exc.__class__.__name__).model_dump(),
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        first_error = exc.errors()[0] if exc.errors() else {}
        field = ".".join(str(part) for part in first_error.get("loc", []) if part != "body")
        message = first_error.get("msg", "Validatsiya xatosi")
        detail = f"{field}: {message}" if field else message
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=ErrorResponse(detail=detail, code="ValidationError").model_dump(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Kutilmagan xato", exc_info=exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(
                detail="Kutilmagan server xatosi yuz berdi", code="InternalServerError"
            ).model_dump(),
        )
