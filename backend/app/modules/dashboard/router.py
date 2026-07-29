"""
`/dashboard/*` endpointlari — 8-Qavat: Dashboard.
Calendar/Notifications naqshiga muvofiq (router -> service, o'z jadvalisiz).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.modules.dashboard import service
from app.modules.dashboard.schemas import (
    DashboardConfigOut,
    DashboardConfigUpdate,
    DashboardSummaryOut,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryOut)
async def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardSummaryOut:
    """Barcha modullardan (Goals, Tasks, Calendar, Finance, Habits,
    Notifications) qisqacha xulosani bitta so'rovda qaytaradi — roadmap,
    8-Qavat: "har bir moduldan qisqacha xulosa qaytaruvchi agregatsiya
    endpointi"."""
    return await service.get_dashboard_summary(db, current_user)


@router.get("/config", response_model=DashboardConfigOut)
async def read_dashboard_config(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardConfigOut:
    """14-Qavat: Dashboard v2 — foydalanuvchining widget konfiguratsiyasi
    (qaysi widget yoqilgan, qanday tartibda). Birinchi so'rovda standart
    konfiguratsiya bilan avtomatik yaratiladi (Profile/`UserSettings`
    naqshiga muvofiq, get-or-create)."""
    return await service.get_dashboard_config_out(db, current_user)


@router.put("/config", response_model=DashboardConfigOut)
async def update_dashboard_config(
    payload: DashboardConfigUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardConfigOut:
    """Widget'larni yoqish/o'chirish va tartibini (`position`) yangilaydi.
    To'liq ro'yxat yuborilishi kutiladi — yuborilmagan widget'lar
    (masalan eski frontend versiyasi) katalogdagi standart holatda
    saqlanib qoladi (`merge_with_catalog`)."""
    return await service.update_dashboard_config(db, current_user, payload)
