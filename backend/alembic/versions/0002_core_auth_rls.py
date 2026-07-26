"""1-Qavat: core/auth — users jadvali, RLS shabloni

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-26

`users` jadvali (autentifikatsiya uchun) va `core_rls_demo_items` —
Row-Level Security qanday yoqilishini ko'rsatuvchi namunaviy jadval
(qoshimcha-qarorlar.md, 4-bo'lim). 2-Qavatda `Goal` jadvali xuddi shu RLS
naqshini takrorlaydi.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "core_rls_demo_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("label", sa.String(length=255), nullable=False),
    )
    op.create_index(
        "ix_core_rls_demo_items_user_id", "core_rls_demo_items", ["user_id"]
    )

    # --- Row-Level Security (RLS) namunasi ---
    # `app.current_user_id` sessiya o'zgaruvchisi `app/core/deps.py`da
    # `get_current_user` orqali har bir so'rovda o'rnatiladi (SET LOCAL).
    op.execute("ALTER TABLE core_rls_demo_items ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE core_rls_demo_items FORCE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY core_rls_demo_items_isolation
        ON core_rls_demo_items
        USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
        WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
        """
    )


def downgrade() -> None:
    op.execute(
        "DROP POLICY IF EXISTS core_rls_demo_items_isolation ON core_rls_demo_items"
    )
    op.drop_index("ix_core_rls_demo_items_user_id", table_name="core_rls_demo_items")
    op.drop_table("core_rls_demo_items")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
