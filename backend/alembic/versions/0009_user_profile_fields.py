"""12-Qavat: Profile & Settings — users jadvaliga profil maydonlari

Revision ID: 0009
Revises: 0008
Create Date: 2026-07-29

`avatar_url`, `locale`, `timezone` — profil sahifasida tahrirlanadigan
maydonlar. `deleted_at` — hisobni o'chirish (soft-delete) uchun; `is_active`
allaqachon mavjud bo'lgani uchun login/auth blok qilish shu ustun orqali
ishlaydi, `deleted_at` esa faqat "qachon" signalini beradi.

Mavjud foydalanuvchilar uchun `locale`/`timezone` ustunlari `server_default`
bilan to'ldiriladi (NOT NULL ustunni bo'sh jadvalga emas, mavjud qatorlarga
qo'shganda talab qilinadi).
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.String(length=1024), nullable=True))
    op.add_column(
        "users",
        sa.Column("locale", sa.String(length=10), nullable=False, server_default="uz"),
    )
    op.add_column(
        "users",
        sa.Column(
            "timezone", sa.String(length=64), nullable=False, server_default="Asia/Tashkent"
        ),
    )
    op.add_column("users", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))

    # server_default'lar faqat migratsiya paytida eski qatorlarni to'ldirish
    # uchun kerak edi — ORM darajasida Python default'lar bilan boshqariladi,
    # shuning uchun DB darajasidagi default'ni olib tashlaymiz (boshqa
    # modullardagi naqshga muvofiq, masalan `is_read` bundan mustasno chunki
    # u doim kerak).
    op.alter_column("users", "locale", server_default=None)
    op.alter_column("users", "timezone", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "deleted_at")
    op.drop_column("users", "timezone")
    op.drop_column("users", "locale")
    op.drop_column("users", "avatar_url")
