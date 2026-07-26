"""
5-Qavat: Finance moduli — Goals/Tasks modullari naqshidan nusxa olingan
(roadmap, 2-Qavat izohi: "keyingi modullar shu tuzilmadan nusxa oladi").

To'rtta jadval (asosiy prompt, 4-bo'lim: "kirim/chiqim, kategoriya,
byudjet, jamg'arma maqsadi"):

- `Category`      — kirim/chiqim kategoriyalari (masalan "Oziq-ovqat",
                     "Maosh").
- `Transaction`    — kirim/chiqim yozuvi, ixtiyoriy ravishda kategoriyaga
                     bog'lanadi (`category_id` nullable — Task→Goal
                     naqshiga muvofiq: kategoriya o'chirilsa ham
                     tranzaksiya saqlanib qoladi, shuning uchun
                     `ondelete="SET NULL"`). `type` maydoni Category'dan
                     mustaqil saqlanadi — kategoriya keyinchalik
                     o'chirilsa ham, tranzaksiyaning kirim/chiqim ekanligi
                     yo'qolmaydi.
- `Budget`         — bitta kategoriya uchun, bitta oy uchun byudjet
                     limiti. Kategoriya o'chirilsa, unga tegishli
                     byudjetlar ham ma'nosiz qoladi — shuning uchun
                     `ondelete="CASCADE"` (Goal→GoalMilestone naqshiga
                     o'xshash: milestone Goal'siz mavjud bo'la olmaydi).
- `SavingsGoal`    — mustaqil jamg'arma maqsadi (boshqa modullarga
                     bog'lanmaydi).

Barchasi `UserOwnedMixin`dan meros oladi (multi-tenant shablon,
qoshimcha-qarorlar.md 4-bo'lim) va RLS 0005-migratsiyada yoqiladi.
"""
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from enum import Enum

from sqlalchemy import Date, DateTime, Integer, Numeric
from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, UserOwnedMixin


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class CategoryType(str, Enum):
    income = "income"
    expense = "expense"


class Category(Base, UserOwnedMixin):
    __tablename__ = "finance_categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[CategoryType] = mapped_column(
        SAEnum(CategoryType, name="finance_category_type", values_callable=lambda enum: [e.value for e in enum]),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Category id={self.id} name={self.name!r} type={self.type}>"


class Transaction(Base, UserOwnedMixin):
    __tablename__ = "finance_transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("finance_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # Kategoriyadan mustaqil saqlanadi — kategoriya o'chsa ham tranzaksiya
    # turi (kirim/chiqim) yo'qolmasligi uchun.
    type: Mapped[CategoryType] = mapped_column(
        SAEnum(CategoryType, name="finance_category_type", create_type=False),
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    occurred_on: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    # Task.goal naqshiga o'xshash: standart lazy="select", service.py'da
    # ANIQ selectinload orqali boshqariladi (N+1 oldini olish uchun).
    category: Mapped[Category | None] = relationship(viewonly=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Transaction id={self.id} amount={self.amount} type={self.type}>"


class Budget(Base, UserOwnedMixin):
    __tablename__ = "finance_budgets"
    __table_args__ = (
        # Migratsiya (0005) bilan bir xil qoida: bitta kategoriya uchun,
        # bitta oy uchun faqat bitta byudjet bo'lishi mumkin.
        UniqueConstraint(
            "user_id",
            "category_id",
            "period_year",
            "period_month",
            name="uq_finance_budgets_user_category_period",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("finance_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    period_year: Mapped[int] = mapped_column(Integer, nullable=False)
    period_month: Mapped[int] = mapped_column(Integer, nullable=False)
    limit_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    category: Mapped[Category] = relationship(viewonly=True)

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<Budget id={self.id} category_id={self.category_id} "
            f"{self.period_year}-{self.period_month:02d}>"
        )


class SavingsGoal(Base, UserOwnedMixin):
    __tablename__ = "finance_savings_goals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    target_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    current_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0"), nullable=False
    )
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<SavingsGoal id={self.id} name={self.name!r}>"
