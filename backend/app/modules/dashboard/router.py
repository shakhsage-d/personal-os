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
from app.modules.dashboard.schemas import DashboardSummaryOut

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
