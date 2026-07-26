"""
RLS (Row-Level Security) NAMUNASI.

Bu jadval ishlab chiqarish funksiyasi emas — u faqat ikki narsani ko'rsatish
uchun mavjud (qoshimcha-qarorlar.md, 4-bo'lim; roadmap, 1-Qavat talabi):

  1. `UserOwnedMixin`dan qanday foydalanish kerak (2-Qavatdagi `Goal` va undan
     keyingi barcha modul jadvallari xuddi shu naqshni takrorlaydi).
  2. PostgreSQL RLS qanday yoqiladi va sinovdan qanday o'tkaziladi
     (`alembic/versions/0002_*.py`ga qarang).

2-Qavatda haqiqiy `Goal` modeli yozilgach, bu fayl va unga tegishli
`core_rls_demo_items` jadvali xohlasangiz o'chirilishi mumkin — u shablon,
doimiy modul emas.
"""
import uuid

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, UserOwnedMixin


class RLSDemoItem(Base, UserOwnedMixin):
    __tablename__ = "core_rls_demo_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    label: Mapped[str] = mapped_column(String(255))
