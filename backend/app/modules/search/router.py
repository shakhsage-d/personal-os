"""
`/search` endpointi — 16-Qavat: Global qidiruv va tezkor amallar (Command Bar).
Dashboard/Calendar naqshiga muvofiq: router -> service, o'z jadvalisiz.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.modules.search import service
from app.modules.search.schemas import SearchResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResponse)
async def global_search(
    q: str = Query(default="", max_length=255),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    """Goals, Tasks, Finance tranzaksiyalari va Habits nomlari bo'yicha
    modullar bo'ylab birlashtirilgan matn qidiruvi."""
    results = await service.search(db, current_user, q)
    return SearchResponse(query=q, results=results)
