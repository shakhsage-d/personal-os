"""11-Qavat: Mobil ilova — users.push_token ustuni

Revision ID: 0008
Revises: 0007
Create Date: 2026-07-27

Mobil ilova (Expo) login bo'lgach o'z Expo push tokenini shu ustunga
yozadi (`POST /auth/push-token`). Bitta ustun kifoya (MVP, bitta qurilma) —
`personal-os-qoshimcha-qarorlar.md`dagi $0-byudjet/soddalik tamoyiliga mos.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("push_token", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "push_token")
