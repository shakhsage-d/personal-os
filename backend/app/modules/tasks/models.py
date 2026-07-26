"""
3-Qavat: Tasks moduli — Goals modulining naqshidan nusxa olingan
(roadmap, 2-Qavat izohi: "keyingi modullar shu tuzilmadan nusxa oladi").

`Task` — kunlik/haftalik vazifa (asosiy prompt, 4-bo'lim: "kunlik/haftalik
vazifalar, ustuvorlik, takrorlanish, maqsadga bog'lanish").

`goal_id` — ixtiyoriy: task Goal'ga bog'lanishi ham, mustaqil bo'lishi ham
mumkin (roadmap, 3-Qavat: "goal'siz task ham bo'lishi mumkin"). Shu sababli
Goal o'chirilganda tegishli tasklar o'chib ketmasligi uchun
`ondelete="SET NULL"` ishlatiladi (Goal-Milestone orasidagi CASCADE'dan
farqli, chunki milestone Goal'siz mavjud bo'la olmaydi, lekin Task bo'la
oladi).

N+1 oldini olish (roadmap, 3-Qavat DoD): `Task.goal` munosabati bu yerda
`lazy="select"` (SQLAlchemy standart holati) qoldirilgan — buning o'rniga
`service.py`dagi ro'yxat so'rovlarida `selectinload(Task.goal)` ANIQ
qo'llaniladi, xuddi Goal moduli `Goal.milestones`ni `lazy="selectin"` bilan
belgilaganidek, lekin bu safar teskari yo'nalishda (bola → ota).
"""
import uuid
from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import Date, DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, UserOwnedMixin
from app.modules.goals.models import Goal


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskRecurrence(str, Enum):
    none = "none"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class Task(Base, UserOwnedMixin):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    goal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("goals.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[TaskPriority] = mapped_column(
        SAEnum(TaskPriority, name="task_priority", values_callable=lambda enum: [e.value for e in enum]),
        default=TaskPriority.medium,
        nullable=False,
    )
    status: Mapped[TaskStatus] = mapped_column(
        SAEnum(TaskStatus, name="task_status", values_callable=lambda enum: [e.value for e in enum]),
        default=TaskStatus.todo,
        nullable=False,
    )
    recurrence: Mapped[TaskRecurrence] = mapped_column(
        SAEnum(TaskRecurrence, name="task_recurrence", values_callable=lambda enum: [e.value for e in enum]),
        default=TaskRecurrence.none,
        nullable=False,
    )
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    # lazy="select" (standart) — service.py so'rovlarida ANIQ selectinload
    # bilan boshqariladi (Task -> Goal yo'nalishida), shundagina N+1
    # nazorat ostida bo'ladi (Goal moduli `milestones`ni Goal -> child
    # yo'nalishida `lazy="selectin"` bilan hal qilgani kabi, faqat bu yerda
    # teskari yo'nalish: child -> parent).
    goal: Mapped[Goal | None] = relationship(viewonly=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Task id={self.id} title={self.title!r} status={self.status}>"
