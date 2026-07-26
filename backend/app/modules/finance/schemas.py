"""
`/finance/*` endpointlari uchun Pydantic sxemalari (5-Qavat).
"""
import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, computed_field

from app.modules.finance.models import CategoryType


# --- Category ---


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: CategoryType


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    type: CategoryType | None = None


class CategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    type: CategoryType
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Transaction ---


class TransactionCreate(BaseModel):
    category_id: uuid.UUID | None = None
    type: CategoryType
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    description: str | None = Field(default=None, max_length=1000)
    occurred_on: date


class TransactionUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    type: CategoryType | None = None
    amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    description: str | None = Field(default=None, max_length=1000)
    occurred_on: date | None = None


class TransactionOut(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID | None
    # Frontend alohida so'rovsiz kategoriya nomini ko'rsata olishi uchun —
    # service.py `selectinload(Transaction.category)` orqali to'ldiradi.
    category_name: str | None
    type: CategoryType
    amount: Decimal
    description: str | None
    occurred_on: date
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Budget ---


class BudgetCreate(BaseModel):
    category_id: uuid.UUID
    period_year: int = Field(ge=2000, le=2100)
    period_month: int = Field(ge=1, le=12)
    limit_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class BudgetUpdate(BaseModel):
    limit_amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)


class BudgetOut(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID
    category_name: str
    period_year: int
    period_month: int
    limit_amount: Decimal
    # service.py tomonidan hisoblab to'ldiriladi (shu oyda shu kategoriya
    # bo'yicha sarflangan summa) — kelajakda /finance/summary bilan bir xil
    # agregatsiya mantig'idan foydalanadi.
    spent_amount: Decimal
    remaining_amount: Decimal

    model_config = {"from_attributes": True}


# --- Savings goal ---


class SavingsGoalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    target_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    target_date: date | None = None


class SavingsGoalUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    target_amount: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    target_date: date | None = None


class SavingsGoalOut(BaseModel):
    id: uuid.UUID
    name: str
    target_amount: Decimal
    current_amount: Decimal
    target_date: date | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def progress_percent(self) -> float:
        if self.target_amount <= 0:
            return 0.0
        return min(100.0, float(self.current_amount / self.target_amount * 100))


# --- Aggregatsiya (roadmap, 5-Qavat DoD: "kategoriya bo'yicha agregatsiya") ---


class CategorySummaryItem(BaseModel):
    category_id: uuid.UUID | None
    category_name: str
    type: CategoryType
    total: Decimal


class FinanceSummaryOut(BaseModel):
    year: int
    month: int
    total_income: Decimal
    total_expense: Decimal
    net: Decimal
    by_category: list[CategorySummaryItem]


class MonthlyTrendItem(BaseModel):
    month: int
    total_income: Decimal
    total_expense: Decimal


class FinanceTrendOut(BaseModel):
    year: int
    months: list[MonthlyTrendItem]
