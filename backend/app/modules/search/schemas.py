"""
`/search` endpointi uchun Pydantic sxemalari — 16-Qavat: Global qidiruv va
tezkor amallar (Command Bar).
"""
import uuid

from pydantic import BaseModel


class SearchResultItem(BaseModel):
    # Frontend shu qiymat orqali navigatsiya qiladi — App.jsx'dagi `view`
    # nomlariga ATAYLAB mos qilib tanlangan ("goals", "tasks", "finance",
    # "habits"), shunda CommandBar natijaga bosilganda to'g'ridan-to'g'ri
    # `onNavigate(item.module)` chaqira oladi, qo'shimcha xarita kerak emas.
    module: str
    id: uuid.UUID
    title: str
    subtitle: str | None = None


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
