"""
`/goals/*` endpointlari uchun Pydantic sxemalari.
"""
import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.modules.goals.models import GoalStatus


class MilestoneCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    target_date: date | None = None
    order_index: int = 0


class MilestoneUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    is_completed: bool | None = None
    target_date: date | None = None
    order_index: int | None = None


class MilestoneOut(BaseModel):
    id: uuid.UUID
    goal_id: uuid.UUID
    title: str
    is_completed: bool
    order_index: int
    target_date: date | None
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=4000)
    target_date: date | None = None
    # Ixtiyoriy: maqsad yaratishda darhol bosqichlar ham qo'shish mumkin.
    milestones: list[MilestoneCreate] = Field(default_factory=list)


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=4000)
    target_date: date | None = None
    status: GoalStatus | None = None


class GoalOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    target_date: date | None
    status: GoalStatus
    created_at: datetime
    updated_at: datetime
    milestones: list[MilestoneOut]
    # Bosqichlar asosida hisoblangan progress (0-100). Jadval ustuni emas —
    # `service.to_goal_out()` orqali har safar dinamik hisoblanadi.
    progress_percent: int

    model_config = {"from_attributes": True}
