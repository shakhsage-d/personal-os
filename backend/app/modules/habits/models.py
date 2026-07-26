"""
6-Qavat: Personal Growth / Habits moduli — Finance/Goals/Tasks
naqshidan nusxa olingan (roadmap, 2-Qavat izohi).

Asosiy promptdagi 4-bo'limga muvofiq to'rtta jadval:

- `Habit`         — odat (masalan "Sport qilish"), chastotasi (kunlik/
                     haftalik) va davriy maqsad (`target_per_period`)
                     bilan.
- `HabitCheckin`  — bitta kunlik belgilash yozuvi. `habit_id` orqali
                     `Habit`ga bog'lanadi, `ondelete="CASCADE"` — odat
                     o'chirilsa, uning barcha belgilashlari ham
                     ma'nosiz qoladi (Goal→GoalMilestone naqshiga
                     o'xshash).
- `ReadingLog`    — "o'qigan narsalar" (kitob/maqola), mustaqil
                     (boshqa modullarga bog'lanmaydi, SavingsGoal
                     naqshiga o'xshash).
- `WeeklyReview`  — "haftalik o'z-o'zini baholash", mustaqil, bitta
                     foydalanuvchi uchun bitta haftada faqat bitta
                     yozuv (`UniqueConstraint`, Budget naqshiga
                     o'xshash).

Barchasi `UserOwnedMixin`dan meros oladi (multi-tenant shablon,
qoshimcha-qarorlar.md 4-bo'lim) va RLS 0006-migratsiyada yoqiladi.
"""
import uuid
from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import Date, DateTime, Integer, SmallInteger, Text, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, UserOwnedMixin


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class HabitFrequency(str, Enum):
    daily = "daily"
    weekly = "weekly"


class ReadingStatus(str, Enum):
    planned = "planned"
    reading = "reading"
    finished = "finished"


class Habit(Base, UserOwnedMixin):
    __tablename__ = "habits"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    frequency: Mapped[HabitFrequency] = mapped_column(
        SAEnum(HabitFrequency, name="habit_frequency", values_callable=lambda enum: [e.value for e in enum]),
        nullable=False,
        default=HabitFrequency.daily,
    )
    # "daily" uchun odatda 1, "weekly" uchun "haftada nechi marta" maqsadi.
    target_per_period: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    checkins: Mapped[list["HabitCheckin"]] = relationship(
        back_populates="habit",
        cascade="all, delete-orphan",
        viewonly=True,
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Habit id={self.id} name={self.name!r} frequency={self.frequency}>"


class HabitCheckin(Base, UserOwnedMixin):
    __tablename__ = "habit_checkins"
    __table_args__ = (
        # Bitta odat uchun, bitta kunda faqat bitta belgilash bo'lishi mumkin.
        UniqueConstraint("habit_id", "checked_on", name="uq_habit_checkins_habit_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    habit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("habits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    checked_on: Mapped[date] = mapped_column(Date, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    habit: Mapped[Habit] = relationship(back_populates="checkins", viewonly=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<HabitCheckin habit_id={self.habit_id} checked_on={self.checked_on}>"


class ReadingLog(Base, UserOwnedMixin):
    __tablename__ = "reading_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[ReadingStatus] = mapped_column(
        SAEnum(ReadingStatus, name="reading_status", values_callable=lambda enum: [e.value for e in enum]),
        nullable=False,
        default=ReadingStatus.planned,
    )
    started_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    finished_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ReadingLog id={self.id} title={self.title!r} status={self.status}>"


class WeeklyReview(Base, UserOwnedMixin):
    __tablename__ = "weekly_reviews"
    __table_args__ = (
        # Bitta foydalanuvchi uchun bitta hafta (dushanba sanasi bilan
        # belgilanadi) faqat bitta baholash yozuviga ega bo'lishi mumkin.
        UniqueConstraint("user_id", "week_start_date", name="uq_weekly_reviews_user_week"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # Har doim shu haftaning dushanba sanasi (ISO hafta boshi) saqlanadi.
    week_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    wins: Mapped[str | None] = mapped_column(Text, nullable=True)
    challenges: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<WeeklyReview user_id={self.user_id} week_start_date={self.week_start_date}>"
