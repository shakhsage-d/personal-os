"""
`/habits/*`, `/reading-logs/*`, `/weekly-reviews/*` endpointlari —
6-Qavat: Personal Growth / Habits moduli.
Finance/Goals/Tasks modullari naqshiga muvofiq (router -> service).
"""
import uuid
from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.modules.habits import service
from app.modules.habits.models import ReadingStatus
from app.modules.habits.schemas import (
    HabitCheckinCreate,
    HabitCheckinOut,
    HabitCreate,
    HabitOut,
    HabitUpdate,
    ReadingLogCreate,
    ReadingLogOut,
    ReadingLogUpdate,
    WeeklyReviewCreate,
    WeeklyReviewOut,
    WeeklyReviewUpdate,
)

router = APIRouter(tags=["habits"])


# --- Habits ---


@router.post("/habits", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
async def create_habit(
    payload: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitOut:
    return await service.create_habit(db, current_user, payload)


@router.get("/habits", response_model=list[HabitOut])
async def list_habits(
    active_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[HabitOut]:
    return await service.list_habits(db, current_user, active_only=active_only)


@router.get("/habits/{habit_id}", response_model=HabitOut)
async def get_habit(
    habit_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitOut:
    return await service.get_habit_or_404(db, current_user, habit_id)


@router.put("/habits/{habit_id}", response_model=HabitOut)
async def update_habit(
    habit_id: uuid.UUID,
    payload: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitOut:
    return await service.update_habit(db, current_user, habit_id, payload)


@router.delete("/habits/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_habit(db, current_user, habit_id)


# --- Habit checkins ---


@router.post(
    "/habits/{habit_id}/checkins", response_model=HabitOut, status_code=status.HTTP_201_CREATED
)
async def create_checkin(
    habit_id: uuid.UUID,
    payload: HabitCheckinCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitOut:
    return await service.create_checkin(db, current_user, habit_id, payload)


@router.get("/habits/{habit_id}/checkins", response_model=list[HabitCheckinOut])
async def list_checkins(
    habit_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[HabitCheckinOut]:
    checkins = await service.list_checkins(db, current_user, habit_id)
    return [HabitCheckinOut.model_validate(c) for c in checkins]


@router.delete("/habits/{habit_id}/checkins/{checked_on}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checkin(
    habit_id: uuid.UUID,
    checked_on: date,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_checkin(db, current_user, habit_id, checked_on)


# --- Reading logs ---


@router.post("/reading-logs", response_model=ReadingLogOut, status_code=status.HTTP_201_CREATED)
async def create_reading_log(
    payload: ReadingLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReadingLogOut:
    log = await service.create_reading_log(db, current_user, payload)
    return ReadingLogOut.model_validate(log)


@router.get("/reading-logs", response_model=list[ReadingLogOut])
async def list_reading_logs(
    status_filter: ReadingStatus | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ReadingLogOut]:
    logs = await service.list_reading_logs(db, current_user, status_filter=status_filter)
    return [ReadingLogOut.model_validate(log) for log in logs]


@router.put("/reading-logs/{log_id}", response_model=ReadingLogOut)
async def update_reading_log(
    log_id: uuid.UUID,
    payload: ReadingLogUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReadingLogOut:
    log = await service.update_reading_log(db, current_user, log_id, payload)
    return ReadingLogOut.model_validate(log)


@router.delete("/reading-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reading_log(
    log_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_reading_log(db, current_user, log_id)


# --- Weekly reviews ---


@router.post(
    "/weekly-reviews", response_model=WeeklyReviewOut, status_code=status.HTTP_201_CREATED
)
async def create_weekly_review(
    payload: WeeklyReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WeeklyReviewOut:
    review = await service.create_weekly_review(db, current_user, payload)
    return WeeklyReviewOut.model_validate(review)


@router.get("/weekly-reviews", response_model=list[WeeklyReviewOut])
async def list_weekly_reviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[WeeklyReviewOut]:
    reviews = await service.list_weekly_reviews(db, current_user)
    return [WeeklyReviewOut.model_validate(r) for r in reviews]


@router.put("/weekly-reviews/{review_id}", response_model=WeeklyReviewOut)
async def update_weekly_review(
    review_id: uuid.UUID,
    payload: WeeklyReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WeeklyReviewOut:
    review = await service.update_weekly_review(db, current_user, review_id, payload)
    return WeeklyReviewOut.model_validate(review)


@router.delete("/weekly-reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_weekly_review(
    review_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_weekly_review(db, current_user, review_id)
