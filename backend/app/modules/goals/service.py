"""
Goals moduli — biznes-mantiq qatlami (model/service/router ajratilgan,
asosiy prompt 3-bo'lim). Router bevosita DB so'rovi yozmaydi, shu yerdagi
funksiyalardan foydalanadi.

Xavfsizlik eslatmasi: har bir so'rov `Goal.user_id == user.id` bilan
filtrlanadi (servis darajasidagi himoya) — bu 0003-migratsiyadagi RLS
siyosati bilan birga ikki qatlamli himoyani ta'minlaydi (qoshimcha-
qarorlar.md, 4-bo'lim).
"""
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import User
from app.modules.goals.models import Goal, GoalMilestone, GoalStatus
from app.modules.goals.schemas import (
    GoalCreate,
    GoalOut,
    GoalUpdate,
    MilestoneCreate,
    MilestoneOut,
    MilestoneUpdate,
)

_goal_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Maqsad topilmadi"
)
_milestone_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Bosqich topilmadi"
)


def _progress_percent(goal: Goal) -> int:
    if not goal.milestones:
        return 100 if goal.status == GoalStatus.completed else 0
    completed = sum(1 for m in goal.milestones if m.is_completed)
    return round(completed / len(goal.milestones) * 100)


def to_goal_out(goal: Goal) -> GoalOut:
    return GoalOut(
        id=goal.id,
        title=goal.title,
        description=goal.description,
        target_date=goal.target_date,
        status=goal.status,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        milestones=[MilestoneOut.model_validate(m) for m in goal.milestones],
        progress_percent=_progress_percent(goal),
    )


async def create_goal(db: AsyncSession, user: User, payload: GoalCreate) -> Goal:
    goal = Goal(
        user_id=user.id,
        title=payload.title,
        description=payload.description,
        target_date=payload.target_date,
    )
    for index, milestone_payload in enumerate(payload.milestones):
        goal.milestones.append(
            GoalMilestone(
                user_id=user.id,
                title=milestone_payload.title,
                target_date=milestone_payload.target_date,
                order_index=milestone_payload.order_index or index,
            )
        )
    db.add(goal)
    await db.commit()
    return await get_goal_or_404(db, user, goal.id)


async def list_goals(
    db: AsyncSession, user: User, status_filter: GoalStatus | None
) -> list[Goal]:
    query = select(Goal).where(Goal.user_id == user.id)
    if status_filter is not None:
        query = query.where(Goal.status == status_filter)
    query = query.order_by(Goal.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().unique().all())


async def get_goal_or_404(db: AsyncSession, user: User, goal_id: uuid.UUID) -> Goal:
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id)
    )
    goal = result.scalar_one_or_none()
    if goal is None:
        raise _goal_not_found
    return goal


async def update_goal(
    db: AsyncSession, user: User, goal_id: uuid.UUID, payload: GoalUpdate
) -> Goal:
    goal = await get_goal_or_404(db, user, goal_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    await db.commit()
    return await get_goal_or_404(db, user, goal_id)


async def delete_goal(db: AsyncSession, user: User, goal_id: uuid.UUID) -> None:
    goal = await get_goal_or_404(db, user, goal_id)
    await db.delete(goal)
    await db.commit()


async def _get_milestone_or_404(
    db: AsyncSession, user: User, goal_id: uuid.UUID, milestone_id: uuid.UUID
) -> GoalMilestone:
    result = await db.execute(
        select(GoalMilestone).where(
            GoalMilestone.id == milestone_id,
            GoalMilestone.goal_id == goal_id,
            GoalMilestone.user_id == user.id,
        )
    )
    milestone = result.scalar_one_or_none()
    if milestone is None:
        raise _milestone_not_found
    return milestone


async def add_milestone(
    db: AsyncSession, user: User, goal_id: uuid.UUID, payload: MilestoneCreate
) -> GoalMilestone:
    await get_goal_or_404(db, user, goal_id)  # mavjudligi va egaligini tekshirish
    milestone = GoalMilestone(
        user_id=user.id,
        goal_id=goal_id,
        title=payload.title,
        target_date=payload.target_date,
        order_index=payload.order_index,
    )
    db.add(milestone)
    await db.commit()
    await db.refresh(milestone)
    return milestone


async def update_milestone(
    db: AsyncSession,
    user: User,
    goal_id: uuid.UUID,
    milestone_id: uuid.UUID,
    payload: MilestoneUpdate,
) -> GoalMilestone:
    milestone = await _get_milestone_or_404(db, user, goal_id, milestone_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "is_completed" in update_data:
        if update_data["is_completed"] and not milestone.is_completed:
            milestone.completed_at = datetime.now(timezone.utc)
        elif not update_data["is_completed"]:
            milestone.completed_at = None

    for field, value in update_data.items():
        setattr(milestone, field, value)

    await db.commit()
    await db.refresh(milestone)
    return milestone


async def delete_milestone(
    db: AsyncSession, user: User, goal_id: uuid.UUID, milestone_id: uuid.UUID
) -> None:
    milestone = await _get_milestone_or_404(db, user, goal_id, milestone_id)
    await db.delete(milestone)
    await db.commit()
