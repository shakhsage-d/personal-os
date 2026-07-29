"""
`/profile/settings` endpointlari — 12-Qavat: Profile & Settings moduli.
Notifications/Habits modullari naqshiga muvofiq (router -> service).

Profil maydonlari (ism, avatar, til, vaqt zonasi) va parol o'zgartirish
`app/core/router.py`da (`/auth/me`, `/auth/change-password`) qoladi, chunki
ular to'g'ridan-to'g'ri `User` modeliga tegishli (asosiy fayl, 3-bo'lim:
"auth, user ... alohida core/shared qatlamda"). Bu modul faqat yangi
`UserSettings` jadvali (tema + bildirishnoma kanallari) uchun.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.modules.profile import service
from app.modules.profile.schemas import UserSettingsOut, UserSettingsUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/settings", response_model=UserSettingsOut)
async def read_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserSettingsOut:
    settings = await service.get_or_create_settings(db, current_user)
    return UserSettingsOut.model_validate(settings)


@router.put("/settings", response_model=UserSettingsOut)
async def update_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserSettingsOut:
    settings = await service.update_settings(db, current_user, payload)
    return UserSettingsOut.model_validate(settings)
