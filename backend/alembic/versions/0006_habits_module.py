"""6-Qavat: Habits moduli — habits, habit_checkins, reading_logs,
weekly_reviews jadvallari, RLS

Revision ID: 0006
Revises: 0005
Create Date: 2026-07-26

Barcha to'rtta jadval 0002/0003/0004/0005-migratsiyalardagi RLS
naqshini takrorlaydi (qoshimcha-qarorlar.md, 4-bo'lim).
`habit_checkins.habit_id` — `ON DELETE CASCADE` (Budget.category_id
naqshiga muvofiq: odat o'chirilsa, uning belgilashlari ham ma'nosiz
qoladi). `reading_logs` va `weekly_reviews` — mustaqil (SavingsGoal
naqshiga o'xshash).
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None

habit_frequency = postgresql.ENUM("daily", "weekly", name="habit_frequency")
reading_status = postgresql.ENUM("planned", "reading", "finished", name="reading_status")


def upgrade() -> None:
    bind = op.get_bind()
    habit_frequency.create(bind, checkfirst=True)
    reading_status.create(bind, checkfirst=True)

    # --- habits ---
    op.create_table(
        "habits",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "frequency",
            postgresql.ENUM("daily", "weekly", name="habit_frequency", create_type=False),
            nullable=False,
            server_default="daily",
        ),
        sa.Column("target_per_period", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint(
            "target_per_period >= 1 AND target_per_period <= 14",
            name="ck_habits_target_per_period_range",
        ),
    )
    op.create_index("ix_habits_user_id", "habits", ["user_id"])

    # --- habit_checkins ---
    op.create_table(
        "habit_checkins",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "habit_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("habits.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("checked_on", sa.Date(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint("habit_id", "checked_on", name="uq_habit_checkins_habit_date"),
    )
    op.create_index("ix_habit_checkins_user_id", "habit_checkins", ["user_id"])
    op.create_index("ix_habit_checkins_habit_id", "habit_checkins", ["habit_id"])

    # --- reading_logs ---
    op.create_table(
        "reading_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("author", sa.String(length=255), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM(
                "planned", "reading", "finished", name="reading_status", create_type=False
            ),
            nullable=False,
            server_default="planned",
        ),
        sa.Column("started_on", sa.Date(), nullable=True),
        sa.Column("finished_on", sa.Date(), nullable=True),
        sa.Column("rating", sa.SmallInteger(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
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
        sa.CheckConstraint("rating IS NULL OR (rating >= 1 AND rating <= 5)", name="ck_reading_logs_rating_range"),
    )
    op.create_index("ix_reading_logs_user_id", "reading_logs", ["user_id"])

    # --- weekly_reviews ---
    op.create_table(
        "weekly_reviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("week_start_date", sa.Date(), nullable=False),
        sa.Column("wins", sa.Text(), nullable=True),
        sa.Column("challenges", sa.Text(), nullable=True),
        sa.Column("rating", sa.SmallInteger(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
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
        sa.CheckConstraint(
            "rating IS NULL OR (rating >= 1 AND rating <= 10)", name="ck_weekly_reviews_rating_range"
        ),
        sa.UniqueConstraint("user_id", "week_start_date", name="uq_weekly_reviews_user_week"),
    )
    op.create_index("ix_weekly_reviews_user_id", "weekly_reviews", ["user_id"])

    # --- Row-Level Security: 1-Qavatdagi naqshni barcha 4 jadvalga qo'llaymiz ---
    for table in ("habits", "habit_checkins", "reading_logs", "weekly_reviews"):
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
    for table in ("weekly_reviews", "reading_logs", "habit_checkins", "habits"):
        op.execute(f"DROP POLICY IF EXISTS {table}_isolation ON {table}")

    op.drop_index("ix_weekly_reviews_user_id", table_name="weekly_reviews")
    op.drop_table("weekly_reviews")

    op.drop_index("ix_reading_logs_user_id", table_name="reading_logs")
    op.drop_table("reading_logs")

    op.drop_index("ix_habit_checkins_habit_id", table_name="habit_checkins")
    op.drop_index("ix_habit_checkins_user_id", table_name="habit_checkins")
    op.drop_table("habit_checkins")

    op.drop_index("ix_habits_user_id", table_name="habits")
    op.drop_table("habits")

    reading_status.drop(op.get_bind(), checkfirst=True)
    habit_frequency.drop(op.get_bind(), checkfirst=True)
