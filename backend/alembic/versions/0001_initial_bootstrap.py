"""initial bootstrap (empty)

Revision ID: 0001
Revises:
Create Date: 2026-07-26

Bu — birinchi, bo'sh migratsiya. Hali hech qanday jadval yo'q (0-Qavat: skeleton).
1-Qavatda (Core/Auth) User jadvali uchun yangi migratsiya qo'shiladi.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
