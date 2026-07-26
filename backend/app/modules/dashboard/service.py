"""
Dashboard moduli — biznes-mantiq qatlami (8-Qavat).

Calendar moduli (4-Qavat) naqshiga muvofiq: bu servis o'z jadvalini
o'qimaydi/yozmaydi — Goals, Tasks, Finance, Habits, Notifications
modullaridagi mavjud service funksiyalarini **faqat chaqiradi/o'qiydi** va
natijalarni bitta `DashboardSummaryOut`ga birlashtiradi.

Xavfsizlik eslatmasi: har bir chaqirilgan servis funksiyasi o'zining ichida
`user_id == user.id` bilan filtrlaydi (mavjud modullar naqshi) — bu yerda
qo'shimcha filtrlash shart emas, chunki hech qanday to'g'ridan-to'g'ri SQL
so'rovi yozilmaydi.
"""
from datetime import date, datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import User
from app.modules.dashboard.schemas import (
    CalendarSummary,
    CalendarSummaryItem,
    DashboardSummaryOut,
    FinanceSummary,
    GoalsSummary,
    GoalSummaryItem,
    HabitsSummary,
    HabitSummaryItem,
    NotificationsSummary,
    TasksSummary,
    TaskSummaryItem,
)
from app.modules.calendar.service import get_calendar_events
from app.modules.finance.service import get_finance_summary
from app.modules.goals.models import GoalStatus
from app.modules.goals.service import _progress_percent, list_goals
from app.modules.habits.service import list_habits
from app.modules.notifications.service import get_unread_count
from app.modules.tasks.models import TaskStatus
from app.modules.tasks.service import list_tasks


async def _build_goals_summary(db: AsyncSession, user: User) -> GoalsSummary:
    goals = await list_goals(db, user, status_filter=None)
    active = [g for g in goals if g.status == GoalStatus.active]
    completed = [g for g in goals if g.status == GoalStatus.completed]

    upcoming_source = sorted(
        active, key=lambda g: (g.target_date is None, g.target_date)
    )[:5]
    upcoming = [
        GoalSummaryItem(
            id=g.id,
            title=g.title,
            status=g.status,
            target_date=g.target_date,
            progress_percent=_progress_percent(g),
        )
        for g in upcoming_source
    ]

    return GoalsSummary(
        total=len(goals),
        active=len(active),
        completed=len(completed),
        upcoming=upcoming,
    )


async def _build_tasks_summary(db: AsyncSession, user: User, today: date) -> TasksSummary:
    tasks = await list_tasks(db, user)
    open_tasks = [t for t in tasks if t.status != TaskStatus.done]
    overdue = [t for t in open_tasks if t.due_date is not None and t.due_date < today]
    due_today = [t for t in open_tasks if t.due_date == today]

    upcoming_source = sorted(
        open_tasks, key=lambda t: (t.due_date is None, t.due_date)
    )[:5]
    upcoming = [
        TaskSummaryItem(
            id=t.id,
            title=t.title,
            priority=t.priority,
            status=t.status,
            due_date=t.due_date,
            goal_title=t.goal.title if t.goal is not None else None,
        )
        for t in upcoming_source
    ]

    return TasksSummary(
        open_count=len(open_tasks),
        overdue_count=len(overdue),
        due_today_count=len(due_today),
        upcoming=upcoming,
    )


async def _build_calendar_summary(
    db: AsyncSession, user: User, today: date
) -> CalendarSummary:
    events = await get_calendar_events(db, user, today, today + timedelta(days=7))
    return CalendarSummary(
        upcoming_events=[
            CalendarSummaryItem(
                id=e.id, type=e.type.value, event_date=e.event_date, title=e.title
            )
            for e in events
        ]
    )


async def _build_finance_summary(
    db: AsyncSession, user: User, today: date
) -> FinanceSummary:
    summary = await get_finance_summary(db, user, today.year, today.month)
    return FinanceSummary(
        year=summary.year,
        month=summary.month,
        total_income=summary.total_income,
        total_expense=summary.total_expense,
        net=summary.net,
    )


async def _build_habits_summary(db: AsyncSession, user: User) -> HabitsSummary:
    habits = await list_habits(db, user, active_only=True)
    top_streaks = sorted(habits, key=lambda h: h.current_streak, reverse=True)[:5]
    return HabitsSummary(
        active_count=len(habits),
        top_streaks=[
            HabitSummaryItem(
                id=h.id,
                name=h.name,
                current_streak=h.current_streak,
                checked_today=h.checked_today,
            )
            for h in top_streaks
        ],
    )


async def _build_notifications_summary(db: AsyncSession, user: User) -> NotificationsSummary:
    unread = await get_unread_count(db, user)
    return NotificationsSummary(unread_count=unread)


async def get_dashboard_summary(db: AsyncSession, user: User) -> DashboardSummaryOut:
    today = datetime.now(timezone.utc).date()

    return DashboardSummaryOut(
        generated_at=datetime.now(timezone.utc),
        goals=await _build_goals_summary(db, user),
        tasks=await _build_tasks_summary(db, user, today),
        calendar=await _build_calendar_summary(db, user, today),
        finance=await _build_finance_summary(db, user, today),
        habits=await _build_habits_summary(db, user),
        notifications=await _build_notifications_summary(db, user),
    )
