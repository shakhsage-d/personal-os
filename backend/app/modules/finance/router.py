"""
`/finance/*` endpointlari — 5-Qavat: Finance moduli.
Goals/Tasks/Calendar modullari naqshiga muvofiq (router -> service).
"""
import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.modules.finance import service
from app.modules.finance.models import CategoryType
from app.modules.finance.schemas import (
    BudgetCreate,
    BudgetOut,
    BudgetUpdate,
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    FinanceSummaryOut,
    FinanceTrendOut,
    SavingsGoalCreate,
    SavingsGoalOut,
    SavingsGoalUpdate,
    TransactionCreate,
    TransactionOut,
    TransactionUpdate,
)

router = APIRouter(prefix="/finance", tags=["finance"])


def _current_year_month() -> tuple[int, int]:
    now = datetime.now(timezone.utc)
    return now.year, now.month


# --- Categories ---


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CategoryOut:
    category = await service.create_category(db, current_user, payload)
    return CategoryOut.model_validate(category)


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(
    type_filter: CategoryType | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CategoryOut]:
    categories = await service.list_categories(db, current_user, type_filter=type_filter)
    return [CategoryOut.model_validate(category) for category in categories]


@router.put("/categories/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: uuid.UUID,
    payload: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CategoryOut:
    category = await service.update_category(db, current_user, category_id, payload)
    return CategoryOut.model_validate(category)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_category(db, current_user, category_id)


# --- Transactions ---


@router.post("/transactions", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TransactionOut:
    transaction = await service.create_transaction(db, current_user, payload)
    return service.to_transaction_out(transaction)


@router.get("/transactions", response_model=list[TransactionOut])
async def list_transactions(
    category_id: uuid.UUID | None = None,
    type_filter: CategoryType | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TransactionOut]:
    transactions = await service.list_transactions(
        db,
        current_user,
        category_id=category_id,
        type_filter=type_filter,
        date_from=date_from,
        date_to=date_to,
    )
    return [service.to_transaction_out(transaction) for transaction in transactions]


@router.get("/transactions/{transaction_id}", response_model=TransactionOut)
async def get_transaction(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TransactionOut:
    transaction = await service.get_transaction_or_404(db, current_user, transaction_id)
    return service.to_transaction_out(transaction)


@router.put("/transactions/{transaction_id}", response_model=TransactionOut)
async def update_transaction(
    transaction_id: uuid.UUID,
    payload: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TransactionOut:
    transaction = await service.update_transaction(db, current_user, transaction_id, payload)
    return service.to_transaction_out(transaction)


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_transaction(db, current_user, transaction_id)


# --- Budgets ---


@router.post("/budgets", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
async def create_budget(
    payload: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BudgetOut:
    return await service.create_budget(db, current_user, payload)


@router.get("/budgets", response_model=list[BudgetOut])
async def list_budgets(
    year: int | None = None,
    month: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[BudgetOut]:
    return await service.list_budgets(db, current_user, year=year, month=month)


@router.put("/budgets/{budget_id}", response_model=BudgetOut)
async def update_budget(
    budget_id: uuid.UUID,
    payload: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BudgetOut:
    return await service.update_budget(db, current_user, budget_id, payload)


@router.delete("/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_budget(db, current_user, budget_id)


# --- Savings goals ---


@router.post(
    "/savings-goals", response_model=SavingsGoalOut, status_code=status.HTTP_201_CREATED
)
async def create_savings_goal(
    payload: SavingsGoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SavingsGoalOut:
    goal = await service.create_savings_goal(db, current_user, payload)
    return SavingsGoalOut.model_validate(goal)


@router.get("/savings-goals", response_model=list[SavingsGoalOut])
async def list_savings_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SavingsGoalOut]:
    goals = await service.list_savings_goals(db, current_user)
    return [SavingsGoalOut.model_validate(goal) for goal in goals]


@router.put("/savings-goals/{goal_id}", response_model=SavingsGoalOut)
async def update_savings_goal(
    goal_id: uuid.UUID,
    payload: SavingsGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SavingsGoalOut:
    goal = await service.update_savings_goal(db, current_user, goal_id, payload)
    return SavingsGoalOut.model_validate(goal)


@router.delete("/savings-goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_savings_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_savings_goal(db, current_user, goal_id)


# --- Agregatsiya ---


@router.get("/summary", response_model=FinanceSummaryOut)
async def get_finance_summary(
    year: int | None = None,
    month: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FinanceSummaryOut:
    if year is None or month is None:
        default_year, default_month = _current_year_month()
        year = year or default_year
        month = month or default_month
    return await service.get_finance_summary(db, current_user, year, month)


@router.get("/trend", response_model=FinanceTrendOut)
async def get_finance_trend(
    year: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FinanceTrendOut:
    if year is None:
        year, _ = _current_year_month()
    return await service.get_finance_trend(db, current_user, year)
