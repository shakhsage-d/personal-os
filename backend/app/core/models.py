"""
Umumiy (core) modellar.
Hozircha faqat User — kelajakda boshqa umumiy modellar (masalan
RefreshToken blacklist) ham shu yerga qo'shilishi mumkin.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    """
    Tizimning yagona foydalanuvchi jadvali. Boshqa barcha modul jadvallari
    (`UserOwnedMixin` orqali) shu jadvalning `id`sini `user_id` sifatida
    chet kalit qilib ishlatadi.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # 11-Qavat (Mobil ilova): mobil ilova login bo'lgach o'zining Expo push
    # tokenini shu ustunga yozadi (`POST /auth/push-token`). Bitta qurilma
    # kifoya deb hisoblangan (MVP) — kelajakda bir nechta qurilma kerak
    # bo'lsa, alohida `device_tokens` jadvaliga ko'chiriladi.
    push_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id} email={self.email!r}>"
