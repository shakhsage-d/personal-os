"""
Finance moduli — biznes-mantiq qatlami (5-Qavat, Goals/Tasks naqshiga
muvofiq).

Xavfsizlik eslatmasi: har bir so'rov `user_id == user.id` bilan
filtrlanadi (servis darajasidagi himoya) — 0005-migratsiyadagi RLS
siyosati bilan birga ikki qatlamli himoyani ta'minlaydi
(qoshimcha-qarorlar.md, 4-bo'lim).

N+1 oldini olish: tranzaksiya ro'yxatida `selectinload(Transaction.category)`
ANIQ qo'llaniladi (Tasks moduli `selectinload(Task.goal)` naqshiga muvofiq).
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import extract, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.models import User
from app.modules.finance.models import Budget, Category, CategoryType, SavingsGoal, Transaction
from app.modules.finance.schemas import (
    BudgetCreate,
    BudgetOut,
    BudgetUpdate,
    CategoryCreate,
    CategorySummaryItem,
    CategoryUpdate,
    FinanceSummaryOut,
    FinanceTrendOut,
    MonthlyTrendItem,
    SavingsGoalCreate,
    SavingsGoalUpdate,
    TransactionCreate,
    TransactionOut,
    TransactionUpdate,
)

_category_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Kategoriya topilmadi"
)
_transaction_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Tranzaksiya topilmadi"
)
_budget_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Byudjet topilmadi"
)
_savings_goal_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Jamg'arma maqsadi topilmadi"
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# =========================================================================
# Category
# =========================================================================


async def create_category(db: AsyncSession, user: User, payload: CategoryCreate) -> Category:
    category = Category(user_id=user.id, name=payload.name, type=payload.type)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def list_categories(
    db: AsyncSession, user: User, type_filter: CategoryType | None = None
) -> list[Category]:
    query = select(Category).where(Category.user_id == user.id)
    if type_filter is not None:
        query = query.where(Category.type == type_filter)
    query = query.order_by(Category.name)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_category_or_404(db: AsyncSession, user: User, category_id: uuid.UUID) -> Category:
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.user_id == user.id)
    )
    category = result.scalar_one_or_none()
    if category is None:
        raise _category_not_found
    return category


async def update_category(
    db: AsyncSession, user: User, category_id: uuid.UUID, payload: CategoryUpdate
) -> Category:
    category = await get_category_or_404(db, user, category_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, user: User, category_id: uuid.UUID) -> None:
    category = await get_category_or_404(db, user, category_id)
    await db.delete(category)
    await db.commit()


# =========================================================================
# Transaction
# =========================================================================


def to_transaction_out(transaction: Transaction) -> TransactionOut:
    return TransactionOut(
        id=transaction.id,
        category_id=transaction.category_id,
        category_name=transaction.category.name if transaction.category is not None else None,
        type=transaction.type,
        amount=transaction.amount,
        description=transaction.description,
        occurred_on=transaction.occurred_on,
        created_at=transaction.created_at,
        updated_at=transaction.updated_at,
    )


async def _ensure_category_ownership(
    db: AsyncSession, user: User, category_id: uuid.UUID
) -> Category:
    """Tranzaksiya/byudjet biror Category'ga bog'lanmoqchi bo'lsa, shu
    kategoriya haqiqatan ham joriy foydalanuvchiga tegishli ekanini
    tekshiradi (Tasks moduli `_ensure_goal_ownership`iga muvofiq)."""
    result = await db.execute(
        select(Category).where(Category.id == category_id, Category.user_id == user.id)
    )
    category = result.scalar_one_or_none()
    if category is None:
        raise _category_not_found
    return category


async def create_transaction(
    db: AsyncSession, user: User, payload: TransactionCreate
) -> Transaction:
    if payload.category_id is not None:
        category = await _ensure_category_ownership(db, user, payload.category_id)
        if category.type != payload.type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tranzaksiya turi tanlangan kategoriya turiga mos kelmayapti",
            )

    transaction = Transaction(
        user_id=user.id,
        category_id=payload.category_id,
        type=payload.type,
        amount=payload.amount,
        description=payload.description,
        occurred_on=payload.occurred_on,
    )
    db.add(transaction)
    await db.commit()
    return await get_transaction_or_404(db, user, transaction.id)


async def list_transactions(
    db: AsyncSession,
    user: User,
    category_id: uuid.UUID | None = None,
    type_filter: CategoryType | None = None,
    date_from=None,
    date_to=None,
) -> list[Transaction]:
    query = (
        select(Transaction)
        .options(selectinload(Transaction.category))
        .where(Transaction.user_id == user.id)
    )
    if category_id is not None:
        query = query.where(Transaction.category_id == category_id)
    if type_filter is not None:
        query = query.where(Transaction.type == type_filter)
    if date_from is not None:
        query = query.where(Transaction.occurred_on >= date_from)
    if date_to is not None:
        query = query.where(Transaction.occurred_on <= date_to)
    query = query.order_by(Transaction.occurred_on.desc(), Transaction.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().unique().all())


async def get_transaction_or_404(
    db: AsyncSession, user: User, transaction_id: uuid.UUID
) -> Transaction:
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.category))
        .where(Transaction.id == transaction_id, Transaction.user_id == user.id)
    )
    transaction = result.scalar_one_or_none()
    if transaction is None:
        raise _transaction_not_found
    return transaction


async def update_transaction(
    db: AsyncSession, user: User, transaction_id: uuid.UUID, payload: TransactionUpdate
) -> Transaction:
    transaction = await get_transaction_or_404(db, user, transaction_id)
    update_data = payload.model_dump(exclude_unset=True)

    next_category_id = update_data.get("category_id", transaction.category_id)
    next_type = update_data.get("type", transaction.type)

    if next_category_id is not None:
        category = await _ensure_category_ownership(db, user, next_category_id)
        if category.type != next_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tranzaksiya turi tanlangan kategoriya turiga mos kelmayapti",
            )

    for field, value in update_data.items():
        setattr(transaction, field, value)

    await db.commit()
    return await get_transaction_or_404(db, user, transaction_id)


async def delete_transaction(db: AsyncSession, user: User, transaction_id: uuid.UUID) -> None:
    transaction = await get_transaction_or_404(db, user, transaction_id)
    await db.delete(transaction)
    await db.commit()


# =========================================================================
# Budget
# =========================================================================


async def _spent_amount_for(
    db: AsyncSession, user_id: uuid.UUID, category_id: uuid.UUID, year: int, month: int
) -> Decimal:
    result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.category_id == category_id,
            Transaction.type == CategoryType.expense,
            extract("year", Transaction.occurred_on) == year,
            extract("month", Transaction.occurred_on) == month,
        )
    )
    return Decimal(result.scalar_one())


async def _to_budget_out(db: AsyncSession, budget: Budget) -> BudgetOut:
    spent = await _spent_amount_for(
        db, budget.user_id, budget.category_id, budget.period_year, budget.period_month
    )
    return BudgetOut(
        id=budget.id,
        category_id=budget.category_id,
        category_name=budget.category.name,
        period_year=budget.period_year,
        period_month=budget.period_month,
        limit_amount=budget.limit_amount,
        spent_amount=spent,
        remaining_amount=budget.limit_amount - spent,
    )


async def create_budget(db: AsyncSession, user: User, payload: BudgetCreate) -> BudgetOut:
    category = await _ensure_category_ownership(db, user, payload.category_id)
    if category.type != CategoryType.expense:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Byudjet faqat 'chiqim' turidagi kategoriyalar uchun belgilanadi",
        )

    budget = Budget(
        user_id=user.id,
        category_id=payload.category_id,
        period_year=payload.period_year,
        period_month=payload.period_month,
        limit_amount=payload.limit_amount,
    )
    db.add(budget)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu kategoriya uchun shu oyda byudjet allaqachon mavjud",
        ) from exc
    return await get_budget_or_404(db, user, budget.id)


async def list_budgets(
    db: AsyncSession, user: User, year: int | None = None, month: int | None = None
) -> list[BudgetOut]:
    query = (
        select(Budget)
        .options(selectinload(Budget.category))
        .where(Budget.user_id == user.id)
    )
    if year is not None:
        query = query.where(Budget.period_year == year)
    if month is not None:
        query = query.where(Budget.period_month == month)
    query = query.order_by(Budget.period_year.desc(), Budget.period_month.desc())
    result = await db.execute(query)
    budgets = list(result.scalars().unique().all())
    return [await _to_budget_out(db, budget) for budget in budgets]


async def _get_budget_model_or_404(db: AsyncSession, user: User, budget_id: uuid.UUID) -> Budget:
    result = await db.execute(
        select(Budget)
        .options(selectinload(Budget.category))
        .where(Budget.id == budget_id, Budget.user_id == user.id)
    )
    budget = result.scalar_one_or_none()
    if budget is None:
        raise _budget_not_found
    return budget


async def get_budget_or_404(db: AsyncSession, user: User, budget_id: uuid.UUID) -> BudgetOut:
    budget = await _get_budget_model_or_404(db, user, budget_id)
    return await _to_budget_out(db, budget)


async def update_budget(
    db: AsyncSession, user: User, budget_id: uuid.UUID, payload: BudgetUpdate
) -> BudgetOut:
    budget = await _get_budget_model_or_404(db, user, budget_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)
    await db.commit()
    return await get_budget_or_404(db, user, budget_id)


async def delete_budget(db: AsyncSession, user: User, budget_id: uuid.UUID) -> None:
    budget = await _get_budget_model_or_404(db, user, budget_id)
    await db.delete(budget)
    await db.commit()


# =========================================================================
# Savings goal
# =========================================================================


async def create_savings_goal(
    db: AsyncSession, user: User, payload: SavingsGoalCreate
) -> SavingsGoal:
    goal = SavingsGoal(
        user_id=user.id,
        name=payload.name,
        target_amount=payload.target_amount,
        current_amount=payload.current_amount,
        target_date=payload.target_date,
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal


async def list_savings_goals(db: AsyncSession, user: User) -> list[SavingsGoal]:
    result = await db.execute(
        select(SavingsGoal)
        .where(SavingsGoal.user_id == user.id)
        .order_by(SavingsGoal.created_at.desc())
    )
    return list(result.scalars().all())


async def get_savings_goal_or_404(
    db: AsyncSession, user: User, goal_id: uuid.UUID
) -> SavingsGoal:
    result = await db.execute(
        select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.user_id == user.id)
    )
    goal = result.scalar_one_or_none()
    if goal is None:
        raise _savings_goal_not_found
    return goal


async def update_savings_goal(
    db: AsyncSession, user: User, goal_id: uuid.UUID, payload: SavingsGoalUpdate
) -> SavingsGoal:
    goal = await get_savings_goal_or_404(db, user, goal_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    await db.commit()
    await db.refresh(goal)
    return goal


async def delete_savings_goal(db: AsyncSession, user: User, goal_id: uuid.UUID) -> None:
    goal = await get_savings_goal_or_404(db, user, goal_id)
    await db.delete(goal)
    await db.commit()


# =========================================================================
# Agregatsiya (roadmap, 5-Qavat DoD)
# =========================================================================


async def get_finance_summary(
    db: AsyncSession, user: User, year: int, month: int
) -> FinanceSummaryOut:
    totals_result = await db.execute(
        select(Transaction.type, func.coalesce(func.sum(Transaction.amount), 0))
        .where(
            Transaction.user_id == user.id,
            extract("year", Transaction.occurred_on) == year,
            extract("month", Transaction.occurred_on) == month,
        )
        .group_by(Transaction.type)
    )
    totals = {row[0]: Decimal(row[1]) for row in totals_result.all()}
    total_income = totals.get(CategoryType.income, Decimal("0"))
    total_expense = totals.get(CategoryType.expense, Decimal("0"))

    by_category_result = await db.execute(
        select(
            Transaction.category_id,
            func.coalesce(Category.name, "Kategoriyasiz"),
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0),
        )
        .outerjoin(Category, Category.id == Transaction.category_id)
        .where(
            Transaction.user_id == user.id,
            extract("year", Transaction.occurred_on) == year,
            extract("month", Transaction.occurred_on) == month,
        )
        .group_by(Transaction.category_id, Category.name, Transaction.type)
        .order_by(func.coalesce(func.sum(Transaction.amount), 0).desc())
    )
    by_category = [
        CategorySummaryItem(
            category_id=row[0], category_name=row[1], type=row[2], total=Decimal(row[3])
        )
        for row in by_category_result.all()
    ]

    return FinanceSummaryOut(
        year=year,
        month=month,
        total_income=total_income,
        total_expense=total_expense,
        net=total_income - total_expense,
        by_category=by_category,
    )


async def get_finance_trend(db: AsyncSession, user: User, year: int) -> FinanceTrendOut:
    result = await db.execute(
        select(
            extract("month", Transaction.occurred_on),
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0),
        )
        .where(
            Transaction.user_id == user.id,
            extract("year", Transaction.occurred_on) == year,
        )
        .group_by(extract("month", Transaction.occurred_on), Transaction.type)
    )
    raw: dict[int, dict[CategoryType, Decimal]] = {}
    for month_num, tx_type, total in result.all():
        raw.setdefault(int(month_num), {})[tx_type] = Decimal(total)

    months = [
        MonthlyTrendItem(
            month=m,
            total_income=raw.get(m, {}).get(CategoryType.income, Decimal("0")),
            total_expense=raw.get(m, {}).get(CategoryType.expense, Decimal("0")),
        )
        for m in range(1, 13)
    ]
    return FinanceTrendOut(year=year, months=months)
