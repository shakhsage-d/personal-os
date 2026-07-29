"""
`/profile/settings` endpointi uchun Pydantic sxemalari (12-Qavat, Notifications
moduli naqshiga muvofiq).
"""
from datetime import datetime

from pydantic import BaseModel

from app.modules.profile.models import ThemePreference


class UserSettingsOut(BaseModel):
    theme: ThemePreference
    notify_task_due: bool
    notify_budget_exceeded: bool
    notify_habit_streak_broken: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    """Qisman yangilash — faqat yuborilgan maydonlar o'zgaradi
    (`exclude_unset=True`, boshqa modullardagi `*Update` naqshiga muvofiq)."""

    theme: ThemePreference | None = None
    notify_task_due: bool | None = None
    notify_budget_exceeded: bool | None = None
    notify_habit_streak_broken: bool | None = None
