"""
`/tasks/*` endpointlari uchun Pydantic sxemalari.
"""
import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.modules.tasks.models import TaskPriority, TaskRecurrence, TaskStatus


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=4000)
    goal_id: uuid.UUID | None = None
    priority: TaskPriority = TaskPriority.medium
    recurrence: TaskRecurrence = TaskRecurrence.none
    due_date: date | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=4000)
    goal_id: uuid.UUID | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    recurrence: TaskRecurrence | None = None
    due_date: date | None = None


class TaskOut(BaseModel):
    id: uuid.UUID
    goal_id: uuid.UUID | None
    # Frontend goal sahifasida/ro'yxatda goal nomini alohida so'rovsiz
    # ko'rsata olishi uchun — service.py `selectinload(Task.goal)` orqali
    # to'ldiradi (N+1 yo'q, roadmap 3-Qavat DoD).
    goal_title: str | None
    title: str
    description: str | None
    priority: TaskPriority
    status: TaskStatus
    recurrence: TaskRecurrence
    due_date: date | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
