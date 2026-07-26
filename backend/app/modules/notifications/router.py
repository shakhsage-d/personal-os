"""
`/notifications/*` endpointlari — 7-Qavat: Notifications moduli.
Habits/Finance modullari naqshiga muvofiq (router -> service/triggers).
"""
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.modules.notifications import service, triggers
from app.modules.notifications.schemas import NotificationOut, RunChecksOut, UnreadCountOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[NotificationOut]:
    notifications = await service.list_notifications(db, current_user, unread_only=unread_only)
    return [NotificationOut.model_validate(n) for n in notifications]


@router.get("/unread-count", response_model=UnreadCountOut)
async def unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UnreadCountOut:
    count = await service.get_unread_count(db, current_user)
    return UnreadCountOut(unread_count=count)


@router.put("/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationOut:
    notification = await service.mark_read(db, current_user, notification_id)
    return NotificationOut.model_validate(notification)


@router.put("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.mark_all_read(db, current_user)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_notification(db, current_user, notification_id)


@router.post("/run-checks", response_model=RunChecksOut)
async def run_checks_now(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RunChecksOut:
    """Joriy foydalanuvchi uchun barcha trigger tekshiruvlarini darhol
    ishga tushiradi (scheduler'ning navbatdagi yugurishini kutmasdan) —
    dev/test uchun qulay, DoD tekshiruvida ham ishlatiladi."""
    created = await triggers.run_all_checks_for_user(db, current_user.id)
    return RunChecksOut(created_count=created)
