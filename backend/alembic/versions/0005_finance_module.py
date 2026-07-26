"""5-Qavat: Finance moduli — finance_categories, finance_transactions,
finance_budgets, finance_savings_goals jadvallari, RLS

Revision ID: 0005
Revises: 0004
Create Date: 2026-07-26

Barcha to'rtta jadval 0002/0003/0004-migratsiyalardagi RLS naqshini
takrorlaydi (qoshimcha-qarorlar.md, 4-bo'lim). `finance_transactions.category_id`
Task.goal_id naqshiga muvofiq ixtiyoriy va `ON DELETE SET NULL` (kategoriya
o'chirilsa ham tranzaksiya saqlanadi). `finance_budgets.category_id` esa
`ON DELETE CASCADE` — kategoriyasiz byudjet ma'nosiz (GoalMilestone naqshiga
muvofiq).
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None

finance_category_type = postgresql.ENUM(
    "income", "expense", name="finance_category_type"
)


def upgrade() -> None:
    bind = op.get_bind()
    finance_category_type.create(bind, checkfirst=True)

    # --- finance_categories ---
    op.create_table(
        "finance_categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column(
            "type",
            postgresql.ENUM(
                "income", "expense", name="finance_category_type", create_type=False
            ),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_finance_categories_user_id", "finance_categories", ["user_id"])

    # --- finance_transactions ---
    op.create_table(
        "finance_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("finance_categories.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "type",
            postgresql.ENUM(
                "income", "expense", name="finance_category_type", create_type=False
            ),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("occurred_on", sa.Date(), nullable=False),
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
        sa.CheckConstraint("amount > 0", name="ck_finance_transactions_amount_positive"),
    )
    op.create_index("ix_finance_transactions_user_id", "finance_transactions", ["user_id"])
    op.create_index("ix_finance_transactions_category_id", "finance_transactions", ["category_id"])
    op.create_index("ix_finance_transactions_occurred_on", "finance_transactions", ["occurred_on"])

    # --- finance_budgets ---
    op.create_table(
        "finance_budgets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("finance_categories.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("period_year", sa.Integer(), nullable=False),
        sa.Column("period_month", sa.Integer(), nullable=False),
        sa.Column("limit_amount", sa.Numeric(precision=12, scale=2), nullable=False),
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
            "period_month >= 1 AND period_month <= 12", name="ck_finance_budgets_month_range"
        ),
        sa.CheckConstraint("limit_amount > 0", name="ck_finance_budgets_limit_positive"),
        sa.UniqueConstraint(
            "user_id",
            "category_id",
            "period_year",
            "period_month",
            name="uq_finance_budgets_user_category_period",
        ),
    )
    op.create_index("ix_finance_budgets_user_id", "finance_budgets", ["user_id"])
    op.create_index("ix_finance_budgets_category_id", "finance_budgets", ["category_id"])

    # --- finance_savings_goals ---
    op.create_table(
        "finance_savings_goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("target_amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column(
            "current_amount",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
            server_default="0",
        ),
        sa.Column("target_date", sa.Date(), nullable=True),
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
        sa.CheckConstraint("target_amount > 0", name="ck_finance_savings_goals_target_positive"),
        sa.CheckConstraint("current_amount >= 0", name="ck_finance_savings_goals_current_nonneg"),
    )
    op.create_index("ix_finance_savings_goals_user_id", "finance_savings_goals", ["user_id"])

    # --- Row-Level Security: 1-Qavatdagi naqshni barcha 4 jadvalga qo'llaymiz ---
    for table in (
        "finance_categories",
        "finance_transactions",
        "finance_budgets",
        "finance_savings_goals",
    ):
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
    for table in (
        "finance_savings_goals",
        "finance_budgets",
        "finance_transactions",
        "finance_categories",
    ):
        op.execute(f"DROP POLICY IF EXISTS {table}_isolation ON {table}")

    op.drop_index("ix_finance_savings_goals_user_id", table_name="finance_savings_goals")
    op.drop_table("finance_savings_goals")

    op.drop_index("ix_finance_budgets_category_id", table_name="finance_budgets")
    op.drop_index("ix_finance_budgets_user_id", table_name="finance_budgets")
    op.drop_table("finance_budgets")

    op.drop_index("ix_finance_transactions_occurred_on", table_name="finance_transactions")
    op.drop_index("ix_finance_transactions_category_id", table_name="finance_transactions")
    op.drop_index("ix_finance_transactions_user_id", table_name="finance_transactions")
    op.drop_table("finance_transactions")

    op.drop_index("ix_finance_categories_user_id", table_name="finance_categories")
    op.drop_table("finance_categories")

    finance_category_type.drop(op.get_bind(), checkfirst=True)
