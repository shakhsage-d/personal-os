"""
`/notifications/*` endpointlari uchun Pydantic sxemalari (7-Qavat, Habits
moduli naqshiga muvofiq).
"""
import uuid
from datetime import datetime

from pydantic import BaseModel

from app.modules.notifications.models import NotificationType


class NotificationOut(BaseModel):
    id: uuid.UUID
    type: NotificationType
    title: str
    message: str
    related_entity_id: uuid.UUID | None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UnreadCountOut(BaseModel):
    unread_count: int


class RunChecksOut(BaseModel):
    created_count: int
