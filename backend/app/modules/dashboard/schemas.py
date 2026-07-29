"""
`/dashboard/summary` endpointi uchun Pydantic sxemalari (8-Qavat).

Bu modul o'z DB jadvaliga ega EMAS — Calendar moduli (4-Qavat) naqshiga
o'xshab, faqat boshqa modullarni (Goals, Tasks, Finance, Habits,
Notifications) o'qib, qisqacha xulosa (summary) shaklida birlashtiradi.
Har bir quyi-sxema tegishli modulning to'liq Out-sxemasi emas, balki
Dashboard uchun yetarli bo'lgan qisqartirilgan (compact) ko'rinishi.
"""
import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel

from app.modules.goals.models import GoalStatus
from app.modules.tasks.models import TaskPriority, TaskStatus


class GoalSummaryItem(BaseModel):
    id: uuid.UUID
    title: str
    status: GoalStatus
    target_date: date | None
    progress_percent: int


class GoalsSummary(BaseModel):
    total: int
    active: int
    completed: int
    # Muddati eng yaqin, hali tugallanmagan 5 ta maqsad.
    upcoming: list[GoalSummaryItem]


class TaskSummaryItem(BaseModel):
    id: uuid.UUID
    title: str
    priority: TaskPriority
    status: TaskStatus
    due_date: date | None
    goal_title: str | None


class TaskPriorityCounts(BaseModel):
    low: int
    medium: int
    high: int


class TasksSummary(BaseModel):
    open_count: int
    overdue_count: int
    due_today_count: int
    # Muddati eng yaqin, hali bajarilmagan 5 ta vazifa (kechikkanlar ustunda).
    upcoming: list[TaskSummaryItem]
    # 14-Qavat: "tasks_priority_breakdown" widget varianti uchun.
    priority_counts: TaskPriorityCounts


class CalendarSummaryItem(BaseModel):
    id: uuid.UUID
    type: str
    event_date: date
    title: str


class CalendarSummary(BaseModel):
    # Keyingi 7 kun ichidagi barcha hodisalar (task/goal/milestone).
    upcoming_events: list[CalendarSummaryItem]


class RecentTransactionItem(BaseModel):
    id: uuid.UUID
    type: str
    amount: Decimal
    description: str | None
    occurred_on: date
    category_name: str | None


class FinanceSummary(BaseModel):
    year: int
    month: int
    total_income: Decimal
    total_expense: Decimal
    net: Decimal
    # 14-Qavat: "finance_recent_transactions" widget varianti uchun, eng
    # so'nggi 5 ta tranzaksiya (joriy oy bilan cheklanmagan).
    recent_transactions: list[RecentTransactionItem]


class HabitSummaryItem(BaseModel):
    id: uuid.UUID
    name: str
    current_streak: int
    checked_today: bool


class HabitsSummary(BaseModel):
    active_count: int
    # Joriy streak bo'yicha eng yuqori 5 ta odat.
    top_streaks: list[HabitSummaryItem]


class RecentNotificationItem(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    is_read: bool
    created_at: datetime


class NotificationsSummary(BaseModel):
    unread_count: int
    # 14-Qavat: "notifications_recent" widget varianti uchun.
    recent: list[RecentNotificationItem]


class DashboardSummaryOut(BaseModel):
    generated_at: datetime
    goals: GoalsSummary
    tasks: TasksSummary
    calendar: CalendarSummary
    finance: FinanceSummary
    habits: HabitsSummary
    notifications: NotificationsSummary


# --- 14-Qavat: Dashboard v2 — widget konfiguratsiyasi sxemalari ---


class WidgetConfigItem(BaseModel):
    widget_key: str
    enabled: bool
    position: int
    # Katalogdan (`catalog.py`) qo'shiladigan, faqat o'qish uchun metama'lumot
    # — frontend alohida "katalog" so'rovi yubormasdan widget haqida to'liq
    # ma'lumotga ega bo'lishi uchun (module/label/description DB'da
    # saqlanmaydi, har doim koddan olinadi).
    module: str
    label: str
    description: str


class DashboardConfigOut(BaseModel):
    widgets: list[WidgetConfigItem]
    updated_at: datetime


class WidgetConfigUpdateItem(BaseModel):
    widget_key: str
    enabled: bool
    position: int


class DashboardConfigUpdate(BaseModel):
    widgets: list[WidgetConfigUpdateItem]
