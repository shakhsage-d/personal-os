"""
Trigger funksiyalari — roadmap 7-Qavat talabi: "Kamida 3 ta turdagi
trigger (masalan task muddati, byudjet, habit streak) ishlab, bildirishnoma
yaratadi".

Har bir funksiya boshqa modulni **faqat o'qiydi** (Calendar moduli
`get_calendar_events` naqshiga o'xshash — Tasks/Goals/Finance/Habits
jadvallarini to'g'ridan-to'g'ri so'raydi, lekin ularning kodini
o'zgartirmaydi) va topilgan hodisalar uchun `notifications.service.
create_notification` orqali yozadi.

MUHIM: bu funksiyalar chaqirilishidan oldin chaqiruvchi tomon (router yoki
scheduler) `SELECT set_config('app.current_user_id', :uid, true)` orqali
RLS sessiya o'zgaruvchisini shu `user_id`ga o'rnatgan bo'lishi kerak —
aks holda FORCE ROW LEVEL SECURITY tufayli natija bo'sh qaytadi
(`app/core/deps.py`dagi `get_current_user`ga muvofiq naqsh).
"""
import uuid
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.finance.models import Budget, Category, CategoryType, Transaction
from app.modules.finance.service import _spent_amount_for
from app.modules.habits.models import Habit, HabitCheckin, HabitFrequency
from app.modules.habits.service import _calculate_streaks
from app.modules.notifications.models import NotificationType
from app.modules.notifications.service import create_notification
from app.modules.tasks.models import Task, TaskStatus


async def check_task_due_notifications(
    db: AsyncSession, user_id: uuid.UUID, today: date | None = None
) -> int:
    """Muddati bugun yoki ertaga bo'lgan, hali bajarilmagan tasklar uchun
    eslatma yaratadi (asosiy prompt, 6-bo'lim: "Notifications" — barcha
    modullardan kelgan eslatmalar)."""
    today = today or date.today()
    tomorrow = today + timedelta(days=1)

    result = await db.execute(
        select(Task).where(
            Task.user_id == user_id,
            Task.status != TaskStatus.done,
            Task.due_date.is_not(None),
            Task.due_date >= today,
            Task.due_date <= tomorrow,
        )
    )
    created = 0
    for task in result.scalars().all():
        when_label = "bugun" if task.due_date == today else "ertaga"
        notification = await create_notification(
            db,
            user_id=user_id,
            notif_type=NotificationType.task_due,
            title="Vazifa muddati yaqinlashmoqda",
            message=f"\"{task.title}\" vazifasining muddati {when_label} tugaydi.",
            dedupe_key=f"task_due:{task.id}:{task.due_date.isoformat()}",
            related_entity_id=task.id,
        )
        if notification is not None:
            created += 1
    await db.commit()
    return created


async def check_budget_notifications(
    db: AsyncSession, user_id: uuid.UUID, year: int, month: int
) -> int:
    """Joriy oyda limiti oshib ketgan byudjetlar uchun bildirishnoma
    yaratadi (asosiy prompt, 4-bo'lim: Finance — "byudjet")."""
    result = await db.execute(
        select(Budget, Category)
        .join(Category, Category.id == Budget.category_id)
        .where(
            Budget.user_id == user_id,
            Budget.period_year == year,
            Budget.period_month == month,
        )
    )
    created = 0
    for budget, category in result.all():
        spent = await _spent_amount_for(db, user_id, budget.category_id, year, month)
        if spent < budget.limit_amount:
            continue
        notification = await create_notification(
            db,
            user_id=user_id,
            notif_type=NotificationType.budget_exceeded,
            title="Byudjet limiti oshib ketdi",
            message=(
                f"\"{category.name}\" kategoriyasida {year}-{month:02d} oyi uchun "
                f"byudjet limiti ({budget.limit_amount}) oshib ketdi — "
                f"sarflangan: {spent}."
            ),
            dedupe_key=f"budget_exceeded:{budget.id}:{year}-{month:02d}",
            related_entity_id=budget.id,
        )
        if notification is not None:
            created += 1
    await db.commit()
    return created


async def check_habit_streak_notifications(
    db: AsyncSession, user_id: uuid.UUID, today: date | None = None
) -> int:
    """Ilgari streak mavjud bo'lib, endi uzilib qolgan (kunlik) odatlar
    uchun bildirishnoma yaratadi (asosiy prompt, 4-bo'lim: Habits —
    "odatlar tracker")."""
    today = today or date.today()

    result = await db.execute(
        select(Habit).where(
            Habit.user_id == user_id,
            Habit.is_active.is_(True),
            Habit.frequency == HabitFrequency.daily,
        )
    )
    created = 0
    for habit in result.scalars().all():
        checkin_result = await db.execute(
            select(HabitCheckin.checked_on).where(HabitCheckin.habit_id == habit.id)
        )
        checkin_dates = [row[0] for row in checkin_result.all()]
        if not checkin_dates:
            continue

        last_checked = max(checkin_dates)
        gap = (today - last_checked).days
        # Streak aynan "bugun" uzilgan deb hisoblanadi: oxirgi belgilash
        # 2 kun oldin bo'lgan (kecha belgilanmagan, bugun ham hali yo'q) —
        # `_calculate_streaks` bilan bir xil "gap <= 1 = uzilmagan" qoidasi.
        if gap != 2:
            continue

        _, longest = _calculate_streaks(checkin_dates, habit.frequency, last_checked)
        notification = await create_notification(
            db,
            user_id=user_id,
            notif_type=NotificationType.habit_streak_broken,
            title="Odat streak uzildi",
            message=(
                f"\"{habit.name}\" odati bo'yicha streak uzildi "
                f"(eng uzun streak: {longest} kun). Yangidan boshlash vaqti keldi!"
            ),
            dedupe_key=f"habit_streak_broken:{habit.id}:{today.isoformat()}",
            related_entity_id=habit.id,
        )
        if notification is not None:
            created += 1
    await db.commit()
    return created


async def run_all_checks_for_user(
    db: AsyncSession, user_id: uuid.UUID, today: date | None = None
) -> int:
    """Barcha uchta trigger turini joriy foydalanuvchi uchun ishga
    tushiradi va yaratilgan bildirishnomalar sonini qaytaradi."""
    today = today or date.today()
    total = 0
    total += await check_task_due_notifications(db, user_id, today)
    total += await check_budget_notifications(db, user_id, today.year, today.month)
    total += await check_habit_streak_notifications(db, user_id, today)
    return total
