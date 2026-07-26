"""
7-Qavat: Notifications (markazlashtirilgan bildirishnoma) moduli — Habits/
Finance modullari naqshidan nusxa olingan (roadmap, 2-Qavat izohi).

Roadmap 7-Qavat ta'rifiga muvofiq bu modul boshqa barcha modullardan
(Tasks, Finance, Habits) signal oladi va bitta markaziy jadvalda saqlaydi.
Har bir "trigger funksiyasi" (`triggers.py`) tegishli modulni **faqat
o'qiydi** (Calendar moduli naqshiga o'xshash) va shu yerdagi `Notification`
jadvaliga yozadi.

`dedupe_key` — bitta trigger hodisasi uchun bir nechta marta bir xil
bildirishnoma yaratilib ketmasligi uchun (masalan, scheduler har soatda
ishga tushsa ham, "task muddati bugun" bildirishnomasi bir kunda faqat bir
marta yaratiladi). `UniqueConstraint(user_id, dedupe_key)` shuni
kafolatlaydi — takroriy urinish `IntegrityError` beradi, `service.py`da bu
"allaqachon yaratilgan" deb sokin qabul qilinadi (xato emas).
"""
import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Boolean, DateTime, Text, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, UserOwnedMixin


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class NotificationType(str, Enum):
    task_due = "task_due"
    budget_exceeded = "budget_exceeded"
    habit_streak_broken = "habit_streak_broken"


class Notification(Base, UserOwnedMixin):
    __tablename__ = "notifications"
    __table_args__ = (
        # Bitta trigger hodisasi (masalan bitta task, bitta kun) uchun
        # foydalanuvchida faqat bitta yozuv bo'lishi mumkin.
        UniqueConstraint("user_id", "dedupe_key", name="uq_notifications_user_dedupe"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    type: Mapped[NotificationType] = mapped_column(
        SAEnum(
            NotificationType,
            name="notification_type",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    # Bog'liq modul yozuvi (Task/Budget/Habit) ID'si — frontend shu orqali
    # kerak bo'lsa tegishli sahifaga o'tishi mumkin. Modulga bog'liq emas
    # (Task→Goal naqshidagi "ixtiyoriy, ondelete SET NULL" g'oyasidan farqli
    # o'laroq, bu yerda haqiqiy FK emas — chunki bir nechta turli
    # jadvallarga ishora qilishi mumkin, shuning uchun oddiy UUID ustuni).
    related_entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    dedupe_key: Mapped[str] = mapped_column(String(255), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Notification id={self.id} type={self.type} is_read={self.is_read}>"
