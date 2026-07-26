"""3-Qavat: Tasks moduli — tasks jadvali, RLS

Revision ID: 0004
Revises: 0003
Create Date: 2026-07-26

`tasks` jadvali — 0002/0003-migratsiyadagi RLS naqshini takrorlaydi
(qoshimcha-qarorlar.md, 4-bo'lim). `goal_id` ixtiyoriy (nullable) va
`ON DELETE SET NULL` — Goal o'chirilsa ham unga bog'langan tasklar
saqlanib qoladi (roadmap, 3-Qavat: "goal'siz task ham bo'lishi mumkin").
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

task_priority = postgresql.ENUM("low", "medium", "high", name="task_priority")
task_status = postgresql.ENUM("todo", "in_progress", "done", name="task_status")
task_recurrence = postgresql.ENUM(
    "none", "daily", "weekly", "monthly", name="task_recurrence"
)


def upgrade() -> None:
    bind = op.get_bind()
    task_priority.create(bind, checkfirst=True)
    task_status.create(bind, checkfirst=True)
    task_recurrence.create(bind, checkfirst=True)

    op.create_table(
        "tasks",
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
            sa.ForeignKey("goals.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "priority",
            postgresql.ENUM("low", "medium", "high", name="task_priority", create_type=False),
            nullable=False,
            server_default="medium",
        ),
        sa.Column(
            "status",
            postgresql.ENUM("todo", "in_progress", "done", name="task_status", create_type=False),
            nullable=False,
            server_default="todo",
        ),
        sa.Column(
            "recurrence",
            postgresql.ENUM(
                "none", "daily", "weekly", "monthly", name="task_recurrence", create_type=False
            ),
            nullable=False,
            server_default="none",
        ),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
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
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"])
    op.create_index("ix_tasks_goal_id", "tasks", ["goal_id"])

    # --- Row-Level Security: 1-Qavatdagi naqshni takrorlaymiz ---
    op.execute("ALTER TABLE tasks ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE tasks FORCE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY tasks_isolation
        ON tasks
        USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
        WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
        """
    )


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tasks_isolation ON tasks")
    op.drop_index("ix_tasks_goal_id", table_name="tasks")
    op.drop_index("ix_tasks_user_id", table_name="tasks")
    op.drop_table("tasks")
    task_recurrence.drop(op.get_bind(), checkfirst=True)
    task_status.drop(op.get_bind(), checkfirst=True)
    task_priority.drop(op.get_bind(), checkfirst=True)
