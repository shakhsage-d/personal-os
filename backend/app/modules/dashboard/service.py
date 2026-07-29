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

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import User
from app.modules.dashboard.catalog import default_widget_config, get_definition, merge_with_catalog
from app.modules.dashboard.models import UserDashboardConfig
from app.modules.dashboard.schemas import (
    CalendarSummary,
    CalendarSummaryItem,
    DashboardConfigOut,
    DashboardConfigUpdate,
    DashboardSummaryOut,
    FinanceSummary,
    GoalsSummary,
    GoalSummaryItem,
    HabitsSummary,
    HabitSummaryItem,
    NotificationsSummary,
    RecentNotificationItem,
    RecentTransactionItem,
    TaskPriorityCounts,
    TasksSummary,
    TaskSummaryItem,
    WidgetConfigItem,
)
from app.modules.calendar.service import get_calendar_events
from app.modules.finance.service import get_finance_summary, list_transactions
from app.modules.goals.models import GoalStatus
from app.modules.goals.service import _progress_percent, list_goals
from app.modules.habits.service import list_habits
from app.modules.notifications.service import get_unread_count, list_notifications
from app.modules.tasks.models import TaskPriority, TaskStatus
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

    priority_counts = TaskPriorityCounts(
        low=len([t for t in open_tasks if t.priority == TaskPriority.low]),
        medium=len([t for t in open_tasks if t.priority == TaskPriority.medium]),
        high=len([t for t in open_tasks if t.priority == TaskPriority.high]),
    )

    return TasksSummary(
        open_count=len(open_tasks),
        overdue_count=len(overdue),
        due_today_count=len(due_today),
        upcoming=upcoming,
        priority_counts=priority_counts,
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
    recent = (await list_transactions(db, user))[:5]
    return FinanceSummary(
        year=summary.year,
        month=summary.month,
        total_income=summary.total_income,
        total_expense=summary.total_expense,
        net=summary.net,
        recent_transactions=[
            RecentTransactionItem(
                id=t.id,
                type=t.type.value,
                amount=t.amount,
                description=t.description,
                occurred_on=t.occurred_on,
                category_name=t.category.name if t.category is not None else None,
            )
            for t in recent
        ],
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
    recent = (await list_notifications(db, user))[:5]
    return NotificationsSummary(
        unread_count=unread,
        recent=[
            RecentNotificationItem(
                id=n.id,
                type=n.type.value,
                title=n.title,
                is_read=n.is_read,
                created_at=n.created_at,
            )
            for n in recent
        ],
    )


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


# --- 14-Qavat: Dashboard v2 — widget konfiguratsiyasi ---
#
# Profile modulidagi `get_or_create_settings` (12-Qavat) naqshiga to'liq
# muvofiq: qator birinchi so'rovda "get-or-create" qilinadi, race-condition
# IntegrityError orqali xavfsiz hal qilinadi.


async def _get_config_row(db: AsyncSession, user: User) -> UserDashboardConfig | None:
    result = await db.execute(
        select(UserDashboardConfig).where(UserDashboardConfig.user_id == user.id)
    )
    return result.scalar_one_or_none()


async def get_or_create_config(db: AsyncSession, user: User) -> UserDashboardConfig:
    config = await _get_config_row(db, user)
    if config is not None:
        # Katalog vaqt o'tishi bilan kengayishi mumkin (yangi widget qo'shilsa)
        # — saqlangan qatorni har o'qishda joriy katalogga moslashtiramiz va,
        # agar farq bo'lsa, yangilangan holatni qayta saqlaymiz.
        merged = merge_with_catalog(config.widgets)
        if merged != config.widgets:
            config.widgets = merged
            await db.commit()
            await db.refresh(config)
        return config

    config = UserDashboardConfig(user_id=user.id, widgets=default_widget_config())
    db.add(config)
    try:
        await db.commit()
    except IntegrityError:
        # Ikkita parallel so'rov bir vaqtda birinchi qatorni yaratmoqchi
        # bo'lgan holat (UserSettings naqshiga muvofiq).
        await db.rollback()
        result = await db.execute(
            select(UserDashboardConfig).where(UserDashboardConfig.user_id == user.id)
        )
        return result.scalar_one()

    await db.refresh(config)
    return config


def _to_config_items(widgets: list[dict]) -> list[WidgetConfigItem]:
    items = []
    for w in sorted(widgets, key=lambda item: item["position"]):
        definition = get_definition(w["widget_key"])
        if definition is None:
            continue  # eskirgan widget_key, katalogda endi yo'q — o'tkazib yuboriladi
        items.append(
            WidgetConfigItem(
                widget_key=w["widget_key"],
                enabled=w["enabled"],
                position=w["position"],
                module=definition.module,
                label=definition.label,
                description=definition.description,
            )
        )
    return items


async def get_dashboard_config_out(db: AsyncSession, user: User) -> DashboardConfigOut:
    config = await get_or_create_config(db, user)
    return DashboardConfigOut(
        widgets=_to_config_items(config.widgets), updated_at=config.updated_at
    )


async def update_dashboard_config(
    db: AsyncSession, user: User, payload: DashboardConfigUpdate
) -> DashboardConfigOut:
    config = await get_or_create_config(db, user)

    # Faqat katalogda haqiqatan mavjud bo'lgan widget_key'lar qabul qilinadi —
    # frontend eskirgan/noto'g'ri kalit yuborsa ham, DB'ga yaroqsiz yozuv
    # tushmaydi (Habits/Tasks moduli "ownership" tekshiruvlariga o'xshash
    # himoya g'oyasi).
    new_widgets = [
        {"widget_key": item.widget_key, "enabled": item.enabled, "position": item.position}
        for item in payload.widgets
        if get_definition(item.widget_key) is not None
    ]
    config.widgets = merge_with_catalog(new_widgets)
    await db.commit()
    await db.refresh(config)

    return DashboardConfigOut(
        widgets=_to_config_items(config.widgets), updated_at=config.updated_at
    )

