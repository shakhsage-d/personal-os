"""
Notifications moduli — biznes-mantiq qatlami (7-Qavat, Habits moduli
naqshiga muvofiq).

Xavfsizlik eslatmasi: har bir so'rov `user_id == user.id` bilan
filtrlanadi (servis darajasidagi himoya) — 0007-migratsiyadagi RLS
siyosati bilan birga ikki qatlamli himoyani ta'minlaydi
(qoshimcha-qarorlar.md, 4-bo'lim).

`create_notification` — trigger funksiyalari (`triggers.py`) tomonidan
chaqiriladigan markaziy yozish nuqtasi. `dedupe_key` orqali unique
constraint buzilsa (ya'ni bu hodisa uchun bildirishnoma allaqachon
mavjud), bu xato emas — funksiya jim ravishda `None` qaytaradi.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import User
from app.core.push import send_expo_push_notification
from app.modules.notifications.models import Notification, NotificationType
from app.modules.profile.service import get_settings_by_user_id

_notification_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Bildirishnoma topilmadi"
)

# 12-Qavat: NotificationType qiymatini UserSettings ustun nomiga bog'laydi —
# yangi trigger turi qo'shilganda shu yerga ham bitta qator qo'shish kifoya.
_SETTINGS_FIELD_BY_TYPE = {
    NotificationType.task_due: "notify_task_due",
    NotificationType.budget_exceeded: "notify_budget_exceeded",
    NotificationType.habit_streak_broken: "notify_habit_streak_broken",
}


async def create_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    notif_type: NotificationType,
    title: str,
    message: str,
    dedupe_key: str,
    related_entity_id: uuid.UUID | None = None,
) -> Notification | None:
    """Yangi bildirishnoma yaratadi. Agar shu `dedupe_key` uchun bildirishnoma
    allaqachon mavjud bo'lsa (masalan avvalgi scheduler yugurishida
    yaratilgan bo'lsa), `IntegrityError` sokin tutiladi va `None` qaytadi —
    bu xato emas, oddiy "allaqachon yuborilgan" holati.

    12-Qavat: yaratishdan oldin foydalanuvchining `UserSettings`idagi shu
    turdagi kanal yoqilganini tekshiradi. Agar foydalanuvchi hali
    sozlamalar qatoriga ega bo'lmasa (12-Qavatdan oldingi foydalanuvchi),
    standart holat "yoqilgan" deb qabul qilinadi — bu eski xulq-atvorni
    o'zgartirmaydi."""
    user_settings = await get_settings_by_user_id(db, user_id)
    if user_settings is not None:
        settings_field = _SETTINGS_FIELD_BY_TYPE.get(notif_type)
        if settings_field is not None and not getattr(user_settings, settings_field):
            return None

    notification = Notification(
        user_id=user_id,
        type=notif_type,
        title=title,
        message=message,
        dedupe_key=dedupe_key,
        related_entity_id=related_entity_id,
    )
    db.add(notification)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        return None

    # 11-Qavat (Mobil ilova): bildirishnoma birinchi marta yaratilgandagina
    # (dedupe_key hali mavjud bo'lmagan holatda) push ham yuboriladi — aks
    # holda takroriy scheduler yugurishlarida bir xil push qayta-qayta
    # jo'natilib ketardi. Best-effort: xato bo'lsa ham bildirishnoma yozuvi
    # saqlanib qoladi (push.py o'zi xatoni yutadi, shuning uchun bu yerda
    # try/except shart emas).
    result = await db.execute(select(User.push_token).where(User.id == user_id))
    push_token = result.scalar_one_or_none()
    await send_expo_push_notification(push_token, title, message)

    return notification


async def list_notifications(
    db: AsyncSession, user: User, unread_only: bool = False
) -> list[Notification]:
    query = select(Notification).where(Notification.user_id == user.id)
    if unread_only:
        query = query.where(Notification.is_read.is_(False))
    query = query.order_by(Notification.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_unread_count(db: AsyncSession, user: User) -> int:
    result = await db.execute(
        select(func.count()).select_from(Notification).where(
            Notification.user_id == user.id, Notification.is_read.is_(False)
        )
    )
    return int(result.scalar_one())


async def _get_notification_or_404(
    db: AsyncSession, user: User, notification_id: uuid.UUID
) -> Notification:
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id, Notification.user_id == user.id
        )
    )
    notification = result.scalar_one_or_none()
    if notification is None:
        raise _notification_not_found
    return notification


async def mark_read(db: AsyncSession, user: User, notification_id: uuid.UUID) -> Notification:
    notification = await _get_notification_or_404(db, user, notification_id)
    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification


async def mark_all_read(db: AsyncSession, user: User) -> None:
    notifications = await list_notifications(db, user, unread_only=True)
    for notification in notifications:
        notification.is_read = True
    await db.commit()


async def delete_notification(db: AsyncSession, user: User, notification_id: uuid.UUID) -> None:
    notification = await _get_notification_or_404(db, user, notification_id)
    await db.delete(notification)
    await db.commit()
