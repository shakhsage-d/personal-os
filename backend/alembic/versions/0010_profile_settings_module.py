"""12-Qavat: Profile & Settings — user_settings jadvali, RLS

Revision ID: 0010
Revises: 0009
Create Date: 2026-07-29

0002-0009-migratsiyalardagi RLS naqshini takrorlaydi (qoshimcha-qarorlar.md,
4-bo'lim). `user_id` ustuniga `unique=True` qo'yiladi — har bir foydalanuvchida
FAQAT BITTA sozlamalar qatori bo'lishi kerak (1:1 munosabat, boshqa
modullardagi "ko'p yozuvli" naqshdan farqli).
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None

theme_preference = postgresql.ENUM("light", "dark", "system", name="theme_preference")


def upgrade() -> None:
    bind = op.get_bind()
    theme_preference.create(bind, checkfirst=True)

    op.create_table(
        "user_settings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column(
            "theme",
            postgresql.ENUM("light", "dark", "system", name="theme_preference", create_type=False),
            nullable=False,
            server_default="system",
        ),
        sa.Column(
            "notify_task_due", sa.Boolean(), nullable=False, server_default=sa.true()
        ),
        sa.Column(
            "notify_budget_exceeded", sa.Boolean(), nullable=False, server_default=sa.true()
        ),
        sa.Column(
            "notify_habit_streak_broken",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
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
    op.create_index("ix_user_settings_user_id", "user_settings", ["user_id"], unique=True)

    op.execute("ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE user_settings FORCE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY user_settings_isolation
        ON user_settings
        USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
        WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
        """
    )


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS user_settings_isolation ON user_settings")
    op.drop_index("ix_user_settings_user_id", table_name="user_settings")
    op.drop_table("user_settings")
    theme_preference.drop(op.get_bind(), checkfirst=True)
