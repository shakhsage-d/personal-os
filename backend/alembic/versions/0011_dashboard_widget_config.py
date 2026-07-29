"""14-Qavat: Dashboard v2 — user_dashboard_configs jadvali, RLS

Revision ID: 0011
Revises: 0010
Create Date: 2026-07-29

0010-migratsiyadagi (`user_settings`) naqshni takrorlaydi: 1:1 munosabat
(`user_id` ustuniga `unique=True`), RLS yoqilgan. Farqi — bu yerda widget
konfiguratsiyasi uchun har bir widget'ga alohida ustun ochish o'rniga bitta
JSONB ustun (`widgets`) ishlatiladi (`catalog.py`dagi izohga qarang).
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_dashboard_configs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column(
            "widgets",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_user_dashboard_configs_user_id",
        "user_dashboard_configs",
        ["user_id"],
        unique=True,
    )

    op.execute("ALTER TABLE user_dashboard_configs ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE user_dashboard_configs FORCE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY user_dashboard_configs_isolation
        ON user_dashboard_configs
        USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
        WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
        """
    )


def downgrade() -> None:
    op.execute(
        "DROP POLICY IF EXISTS user_dashboard_configs_isolation ON user_dashboard_configs"
    )
    op.drop_index("ix_user_dashboard_configs_user_id", table_name="user_dashboard_configs")
    op.drop_table("user_dashboard_configs")
