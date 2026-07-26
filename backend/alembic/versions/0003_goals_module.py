"""2-Qavat: Goals & Plans moduli — goals, goal_milestones jadvallari, RLS

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-26

`goals` va `goal_milestones` jadvallari — 0002-migratsiyadagi
`core_rls_demo_items` RLS naqshini aynan takrorlaydi (qoshimcha-
qarorlar.md, 4-bo'lim; roadmap, 1-Qavat izohi).
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

goal_status = postgresql.ENUM(
    "active", "completed", "archived", name="goal_status"
)


def upgrade() -> None:
    goal_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM(
                "active", "completed", "archived", name="goal_status", create_type=False
            ),
            nullable=False,
            server_default="active",
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
    op.create_index("ix_goals_user_id", "goals", ["user_id"])

    op.create_table(
        "goal_milestones",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "goal_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("goals.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column(
            "is_completed", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_goal_milestones_user_id", "goal_milestones", ["user_id"])
    op.create_index("ix_goal_milestones_goal_id", "goal_milestones", ["goal_id"])

    # --- Row-Level Security: 1-Qavatdagi naqshni ikkala jadvalga ham qo'llaymiz ---
    for table in ("goals", "goal_milestones"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
        op.execute(
            f"""
            CREATE POLICY {table}_isolation
            ON {table}
            USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
            WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
            """
        )


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS goal_milestones_isolation ON goal_milestones")
    op.execute("DROP POLICY IF EXISTS goals_isolation ON goals")
    op.drop_index("ix_goal_milestones_goal_id", table_name="goal_milestones")
    op.drop_index("ix_goal_milestones_user_id", table_name="goal_milestones")
    op.drop_table("goal_milestones")
    op.drop_index("ix_goals_user_id", table_name="goals")
    op.drop_table("goals")
    goal_status.drop(op.get_bind(), checkfirst=True)
