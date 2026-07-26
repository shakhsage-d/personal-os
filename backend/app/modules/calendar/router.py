"""
`/calendar` endpointi — 4-Qavat: Calendar & Time moduli.
Goals/Tasks modullari naqshiga muvofiq (router -> service, servis DB'ni
o'qiydi, router faqat HTTP qatlami).
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.modules.calendar import service
from app.modules.calendar.schemas import CalendarEventOut

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("", response_model=list[CalendarEventOut])
async def list_calendar_events(
    date_from: date = Query(..., alias="from"),
    date_to: date = Query(..., alias="to"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CalendarEventOut]:
    if date_to < date_from:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'to' sanasi 'from' sanasidan oldin bo'lishi mumkin emas",
        )
    return await service.get_calendar_events(db, current_user, date_from, date_to)
