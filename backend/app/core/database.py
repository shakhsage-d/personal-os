"""
Umumiy (shared) database qatlami.
Har bir modul (goals, tasks, finance, ...) shu yerdagi Base va get_db'dan foydalanadi.
"""
import uuid
from collections.abc import AsyncGenerator

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

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


class UserOwnedMixin:
    """
    MULTI-TENANT SHABLON (qoshimcha-qarorlar.md, 4-bo'lim).

    Kelajakdagi HAR BIR modul jadvali (Goal, Task, Transaction, Habit, ...)
    shu mixin'dan meros olishi shart:

        class Goal(Base, UserOwnedMixin):
            __tablename__ = "goals"
            id: Mapped[uuid.UUID] = mapped_column(
                UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
            )
            title: Mapped[str] = mapped_column(String(255))
            # user_id ustuni bu yerda avtomatik qo'shiladi (pastga qarang)

    Bu — ikkinchi himoya qatlamining (RLS) BIRINCHI qatlami: har bir so'rov
    servis darajasida `.where(Model.user_id == current_user.id)` bilan
    filtrlanishi kerak. RLS esa kod xato qilsa ham sizib chiqishning oldini
    oladi (pastga, `rls_demo.py`dagi namunaviy migratsiyaga qarang).
    """

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
