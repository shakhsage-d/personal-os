"""
2-Qavat: Goals & Plans moduli — bu modul boshqa barcha modullar (Tasks,
Finance, Habits) uchun NAMUNA sifatida xizmat qiladi (roadmap, 2-Qavat).

`Goal` — uzoq muddatli maqsad (asosiy prompt, 4-bo'lim: "uzoq muddatli
maqsadlar, ularni bosqichlarga bo'lish, muddat va progress").
`GoalMilestone` — maqsadning bosqichlari; progress ular asosida hisoblanadi
(pastga, `service.py`dagi `_progress_percent`ga qarang).

Har ikkala jadval ham `UserOwnedMixin`dan meros oladi (qoshimcha-qarorlar.md,
4-bo'lim) — RLS 0003-migratsiyada `core_rls_demo_items` naqshi bo'yicha
yoqiladi.
"""
import uuid
from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import Boolean, Date, DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, UserOwnedMixin


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class GoalStatus(str, Enum):
    active = "active"
    completed = "completed"
    archived = "archived"


class Goal(Base, UserOwnedMixin):
    __tablename__ = "goals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[GoalStatus] = mapped_column(
        SAEnum(GoalStatus, name="goal_status", values_callable=lambda enum: [e.value for e in enum]),
        default=GoalStatus.active,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    # lazy="selectin" — Tasks moduli talabiga o'xshab (roadmap, 3-Qavat DoD:
    # "N+1 muammosi yo'q"), bosqichlar har doim bitta qo'shimcha so'rov bilan
    # birga yuklanadi.
    milestones: Mapped[list["GoalMilestone"]] = relationship(
        back_populates="goal",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="GoalMilestone.order_index",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Goal id={self.id} title={self.title!r} status={self.status}>"


class GoalMilestone(Base, UserOwnedMixin):
    __tablename__ = "goal_milestones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    goal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("goals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    goal: Mapped["Goal"] = relationship(back_populates="milestones")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<GoalMilestone id={self.id} title={self.title!r} done={self.is_completed}>"
