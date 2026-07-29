"""
14-Qavat: Dashboard v2 — `UserDashboardConfig` jadvali.

Profile modulidagi `UserSettings` (12-Qavat) bilan bir xil naqsh: har bir
foydalanuvchida FAQAT BITTA qator (1:1), `UserOwnedMixin` + `user_id`ga
`unique=True`.

Farqi: bu yerda har bir widget uchun alohida ustun ochish o'rniga (bu
kelajakda yangi widget qo'shilganda har safar migratsiya talab qilardi),
bitta **JSONB** ustun (`widgets`) ishlatiladi — ro'yxat shaklida:

    [{"widget_key": "goals_overview", "enabled": true, "position": 0}, ...]

Bu — roadmap v1.1 15-band: "murakkablik oshirilmasin" tamoyiliga mos:
drag-and-drop o'rniga oddiy tartib-raqam (`position`) va yoqish/o'chirish
(`enabled`) yetarli. Widget'ning qaysi modulga tegishli ekani, sarlavhasi
va tavsifi kod ichidagi `WIDGET_CATALOG`da (`catalog.py`) saqlanadi — DB'da
takrorlanmaydi.
"""
import uuid
from datetime import datetime, timezone as dt_timezone

from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, UserOwnedMixin


def _utcnow() -> datetime:
    return datetime.now(dt_timezone.utc)


class UserDashboardConfig(Base, UserOwnedMixin):
    __tablename__ = "user_dashboard_configs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # [{"widget_key": str, "enabled": bool, "position": int}, ...]
    widgets: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<UserDashboardConfig user_id={self.user_id}>"
