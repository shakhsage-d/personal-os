"""
Profile & Settings moduli — biznes-mantiq qatlami (12-Qavat, Habits/Finance
moduli naqshiga muvofiq).

Xavfsizlik eslatmasi: har bir so'rov `user_id == user.id` bilan filtrlanadi
(servis darajasidagi himoya) — 0010-migratsiyadagi RLS siyosati bilan birga
ikki qatlamli himoyani ta'minlaydi (qoshimcha-qarorlar.md, 4-bo'lim).

`get_or_create_settings` — foydalanuvchi birinchi marta profil/sozlamalar
sahifasini ochganda (yoki Notifications moduli birinchi marta tekshirganda)
qator hali mavjud bo'lmasligi mumkin (12-Qavat undan oldingi barcha
foydalanuvchilar uchun). Shuning uchun "get" har doim "get-or-create"
sifatida ishlaydi — frontend/boshqa modul alohida "sozlamalarni
ishga tushirish" so'rovi yuborishi shart emas.
"""
import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import User
from app.modules.profile.models import UserSettings
from app.modules.profile.schemas import UserSettingsUpdate


async def get_or_create_settings(db: AsyncSession, user: User) -> UserSettings:
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == user.id)
    )
    settings = result.scalar_one_or_none()
    if settings is not None:
        return settings

    settings = UserSettings(user_id=user.id)
    db.add(settings)
    try:
        await db.commit()
    except IntegrityError:
        # Poyga holati (race condition): boshqa parallel so'rov ayni shu
        # foydalanuvchi uchun qatorni allaqachon yaratgan bo'lishi mumkin
        # (masalan ikkita tab bir vaqtda ochilgan). Bunday holda o'zimiznikini
        # bekor qilib, allaqachon yaratilganini o'qib qaytaramiz.
        await db.rollback()
        result = await db.execute(
            select(UserSettings).where(UserSettings.user_id == user.id)
        )
        settings = result.scalar_one()
        return settings

    await db.refresh(settings)
    return settings


async def get_settings_by_user_id(
    db: AsyncSession, user_id: uuid.UUID
) -> UserSettings | None:
    """Notifications moduli (`notifications/service.py`) shundan foydalanadi —
    bildirishnoma yaratishdan oldin foydalanuvchi shu turdagi bildirishnomani
    yoqqan-yoqmaganini tekshirish uchun. Qator hali mavjud bo'lmasa `None`
    qaytadi — chaqiruvchi tomon buni "hammasi standart (yoqilgan)" deb
    talqin qiladi (12-Qavatdan oldingi foydalanuvchilar uchun ham to'g'ri
    ishlashi kerak)."""
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def update_settings(
    db: AsyncSession, user: User, payload: UserSettingsUpdate
) -> UserSettings:
    settings = await get_or_create_settings(db, user)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    await db.commit()
    await db.refresh(settings)
    return settings
