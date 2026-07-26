"""
Umumiy javob formatlari.
Har bir modul xatoliklarni shu formatda qaytarishi tavsiya etiladi.
"""
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None


class SuccessResponse(BaseModel, Generic[T]):
    data: T
    message: str | None = None
