"""
Umumiy (shared) database qatlami.
Har bir modul (goals, tasks, finance, ...) shu yerdagi Base va get_db'dan foydalanadi.
"""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=settings.environment == "development",
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Barcha modul modellari shundan meros oladi."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency: har bir so'rov uchun alohida DB sessiyasi."""
    async with AsyncSessionLocal() as session:
        yield session
