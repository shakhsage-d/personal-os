"""
`/goals/*` endpointlari — 2-Qavat: Goals & Plans moduli (NAMUNAVIY MODUL).
Keyingi modullar (Tasks, Finance, Habits) shu faylning tuzilmasidan nusxa
oladi (roadmap, 2-Qavat maqsadi).
"""
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.modules.goals import service
from app.modules.goals.models import GoalStatus
from app.modules.goals.schemas import (
    GoalCreate,
    GoalOut,
    GoalUpdate,
    MilestoneCreate,
    MilestoneOut,
    MilestoneUpdate,
)

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
async def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalOut:
    goal = await service.create_goal(db, current_user, payload)
    return service.to_goal_out(goal)


@router.get("", response_model=list[GoalOut])
async def list_goals(
    status_filter: GoalStatus | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[GoalOut]:
    goals = await service.list_goals(db, current_user, status_filter)
    return [service.to_goal_out(goal) for goal in goals]


@router.get("/{goal_id}", response_model=GoalOut)
async def get_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalOut:
    goal = await service.get_goal_or_404(db, current_user, goal_id)
    return service.to_goal_out(goal)


@router.put("/{goal_id}", response_model=GoalOut)
async def update_goal(
    goal_id: uuid.UUID,
    payload: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalOut:
    goal = await service.update_goal(db, current_user, goal_id, payload)
    return service.to_goal_out(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_goal(db, current_user, goal_id)


@router.post(
    "/{goal_id}/milestones",
    response_model=MilestoneOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_milestone(
    goal_id: uuid.UUID,
    payload: MilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MilestoneOut:
    milestone = await service.add_milestone(db, current_user, goal_id, payload)
    return MilestoneOut.model_validate(milestone)


@router.put("/{goal_id}/milestones/{milestone_id}", response_model=MilestoneOut)
async def update_milestone(
    goal_id: uuid.UUID,
    milestone_id: uuid.UUID,
    payload: MilestoneUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MilestoneOut:
    milestone = await service.update_milestone(
        db, current_user, goal_id, milestone_id, payload
    )
    return MilestoneOut.model_validate(milestone)


@router.delete(
    "/{goal_id}/milestones/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_milestone(
    goal_id: uuid.UUID,
    milestone_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_milestone(db, current_user, goal_id, milestone_id)
