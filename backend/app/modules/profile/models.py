"""
12-Qavat: Profile & Settings moduli — `UserSettings` jadvali.

Bu jadval `Habit`/`Goal` kabi "ko'p yozuvli" modul jadvallaridan farq qiladi:
har bir foydalanuvchida FAQAT BITTA qator bo'ladi (1:1 munosabat). Shunga
qaramay, boshqa modullar naqshiga muvofiq `UserOwnedMixin`dan foydalanamiz —
farqi shu, `user_id` ustuniga qo'shimcha `unique=True` qo'yiladi (ko'p yozuv
yaratilishining oldini olish uchun, DB darajasida).

Bildirishnoma kanallari (`notify_*` ustunlari) — 7-Qavatdagi
`NotificationType` enum qiymatlariga bevosita mos keladi (`task_due`,
`budget_exceeded`, `habit_streak_broken`). Yangi trigger turi qo'shilganda
(kelajakda) shu yerga ham mos ustun qo'shiladi — `notifications/service.py`
shu ustunlarga qarab bildirishnoma yaratish/yaratmaslikni hal qiladi.
"""
import uuid
from datetime import datetime, timezone as dt_timezone
from enum import Enum

from sqlalchemy import Boolean, DateTime, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, UserOwnedMixin


def _utcnow() -> datetime:
    return datetime.now(dt_timezone.utc)


class ThemePreference(str, Enum):
    light = "light"
    dark = "dark"
    system = "system"


class UserSettings(Base, UserOwnedMixin):
    __tablename__ = "user_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    theme: Mapped[ThemePreference] = mapped_column(
        SAEnum(
            ThemePreference,
            name="theme_preference",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=ThemePreference.system,
        nullable=False,
    )
    # Bildirishnoma kanallari — NotificationType (7-Qavat) qiymatlariga mos.
    notify_task_due: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notify_budget_exceeded: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    notify_habit_streak_broken: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<UserSettings user_id={self.user_id} theme={self.theme}>"
