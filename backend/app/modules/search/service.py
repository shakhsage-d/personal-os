"""
Global qidiruv — 16-Qavat biznes-mantiq qatlami.

Dashboard moduli (8-Qavat, `modules/dashboard/service.py`) naqshiga to'liq
muvofiq: bu servis o'z jadvalini o'qimaydi/yozmaydi — Goals, Tasks, Finance,
Habits modullaridagi mavjud `list_*` service funksiyalarini **faqat
chaqiradi**, ular allaqachon `user_id == user.id` bilan filtrlangan
(multi-tenant xavfsizligi shu funksiyalarda allaqachon sinovdan o'tgan).

Eslatma — nega ILIKE emas: roadmap qo'shimchasida ("oddiy matn qidiruvi
(PostgreSQL `ILIKE` yetarli, murakkab full-text search hozircha shart
emas)") alohida SQL so'rovlari taklif qilingan edi. Shu o'rniga bu yerda
mavjud `list_*` funksiyalari qayta ishlatilib, natija Python darajasida
oddiy case-insensitive substring qidiruvi bilan filtrlanadi. Natija xuddi
shu — oddiy matn mosligi — lekin kamroq kod bilan va har bir modulning
user_id-filtri/N+1 himoyasi endi ikki marta emas, bir joyda saqlanadi
(Dashboard shu yondashuvni allaqachon qo'llagan).
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import User
from app.modules.finance.service import list_transactions
from app.modules.goals.service import list_goals
from app.modules.habits.service import list_habits
from app.modules.search.schemas import SearchResultItem
from app.modules.tasks.service import list_tasks

# Har bir modul uchun natijalar soni shu bilan cheklanadi — Command Bar
# tez-tez terilayotgan so'rovga ham darhol javob bera olishi uchun (roadmap,
# 16-Qavat: qidiruv modal ochilgan zahoti interaktiv bo'lishi kerak).
_MAX_PER_MODULE = 8


def _matches(text: str | None, needle: str) -> bool:
    return bool(text) and needle in text.lower()


async def search(db: AsyncSession, user: User, query: str) -> list[SearchResultItem]:
    """Goals, Tasks, Finance tranzaksiyalari va Habits nomlari bo'yicha
    oddiy matn qidiruvi (roadmap, 16-Qavat)."""
    q = (query or "").strip()
    if not q:
        return []
    needle = q.lower()

    results: list[SearchResultItem] = []

    goals = await list_goals(db, user, status_filter=None)
    for goal in goals:
        if len([r for r in results if r.module == "goals"]) >= _MAX_PER_MODULE:
            break
        if _matches(goal.title, needle) or _matches(goal.description, needle):
            results.append(
                SearchResultItem(
                    module="goals",
                    id=goal.id,
                    title=goal.title,
                    subtitle=goal.status.value,
                )
            )

    tasks = await list_tasks(db, user)
    for task in tasks:
        if len([r for r in results if r.module == "tasks"]) >= _MAX_PER_MODULE:
            break
        if _matches(task.title, needle) or _matches(task.description, needle):
            results.append(
                SearchResultItem(
                    module="tasks",
                    id=task.id,
                    title=task.title,
                    subtitle=task.goal.title if task.goal is not None else None,
                )
            )

    transactions = await list_transactions(db, user)
    for transaction in transactions:
        if len([r for r in results if r.module == "finance"]) >= _MAX_PER_MODULE:
            break
        category_name = transaction.category.name if transaction.category else None
        if _matches(transaction.description, needle) or _matches(category_name, needle):
            title = transaction.description or category_name or transaction.type.value
            results.append(
                SearchResultItem(
                    module="finance",
                    id=transaction.id,
                    title=title,
                    subtitle=f"{transaction.amount} · {transaction.occurred_on.isoformat()}",
                )
            )

    habits = await list_habits(db, user, active_only=False)
    for habit in habits:
        if len([r for r in results if r.module == "habits"]) >= _MAX_PER_MODULE:
            break
        if _matches(habit.name, needle):
            results.append(
                SearchResultItem(
                    module="habits",
                    id=habit.id,
                    title=habit.name,
                    subtitle=(
                        f"{habit.current_streak} kunlik streak"
                        if habit.current_streak
                        else None
                    ),
                )
            )

    return results
