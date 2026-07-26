"""
Habits moduli — biznes-mantiq qatlami (6-Qavat, Finance moduli
naqshiga muvofiq).

Xavfsizlik eslatmasi: har bir so'rov `user_id == user.id` bilan
filtrlanadi (servis darajasidagi himoya) — 0006-migratsiyadagi RLS
siyosati bilan birga ikki qatlamli himoyani ta'minlaydi
(qoshimcha-qarorlar.md, 4-bo'lim).

Streak hisoblash mantig'i (`_calculate_streaks`) — roadmap DoD talabi
("streak to'g'ri hisoblanishi"):
  - `daily` chastotali odat uchun: ketma-ket kalendar kunlari sanaladi.
  - `weekly` chastotali odat uchun: ketma-ket ISO haftalari (yiliga
    qarab) sanaladi, har haftada kamida bitta belgilash bo'lsa yetarli.
  - "joriy streak" faqat oxirgi belgilash bugun yoki kecha (haftalik
    uchun — joriy yoki o'tgan hafta) bo'lsa hisoblanadi, aks holda 0
    qaytariladi (streak "uzilgan" hisoblanadi).
"""
import uuid
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import User
from app.modules.habits.models import (
    Habit,
    HabitCheckin,
    HabitFrequency,
    ReadingLog,
    ReadingStatus,
    WeeklyReview,
)
from app.modules.habits.schemas import (
    HabitCheckinCreate,
    HabitCreate,
    HabitOut,
    HabitUpdate,
    ReadingLogCreate,
    ReadingLogUpdate,
    WeeklyReviewCreate,
    WeeklyReviewUpdate,
)

_habit_not_found = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Odat topilmadi")
_reading_log_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="O'qish yozuvi topilmadi"
)
_weekly_review_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Haftalik baholash topilmadi"
)


# =========================================================================
# Streak hisoblash
# =========================================================================


def _iso_week_key(d: date) -> tuple[int, int]:
    iso = d.isocalendar()
    return (iso[0], iso[1])


def _week_start(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _calculate_streaks(
    checkin_dates: list[date], frequency: HabitFrequency, today: date
) -> tuple[int, int]:
    """(current_streak, longest_streak) ni qaytaradi."""
    if not checkin_dates:
        return 0, 0

    unique_sorted = sorted(set(checkin_dates))

    if frequency == HabitFrequency.daily:
        # Ketma-ket kalendar kunlari bo'yicha "runlar"ga bo'lish.
        runs: list[list[date]] = []
        for d in unique_sorted:
            if runs and (d - runs[-1][-1]).days == 1:
                runs[-1].append(d)
            else:
                runs.append([d])

        longest = max(len(run) for run in runs)

        last_run = runs[-1]
        gap_from_today = (today - last_run[-1]).days
        current = len(last_run) if gap_from_today <= 1 else 0
        return current, longest

    # weekly: haftalar bo'yicha (ISO yil, ISO hafta) unikal to'plam.
    week_keys = sorted({_iso_week_key(d) for d in unique_sorted})

    def _next_week_key(key: tuple[int, int]) -> tuple[int, int]:
        year, week = key
        # Shu yilning oxirgi ISO haftasi nechi ekanini aniqlash uchun
        # 28-dekabr har doim oxirgi ISO haftasida bo'ladi.
        last_week_of_year = date(year, 12, 28).isocalendar()[1]
        if week >= last_week_of_year:
            return (year + 1, 1)
        return (year, week + 1)

    runs_w: list[list[tuple[int, int]]] = []
    for key in week_keys:
        if runs_w and _next_week_key(runs_w[-1][-1]) == key:
            runs_w[-1].append(key)
        else:
            runs_w.append([key])

    longest = max(len(run) for run in runs_w)

    last_run_w = runs_w[-1]
    current_week_key = _iso_week_key(today)
    previous_week_key = _iso_week_key(today - timedelta(days=7))
    if last_run_w[-1] in (current_week_key, previous_week_key):
        current = len(last_run_w)
    else:
        current = 0
    return current, longest


async def _to_habit_out(db: AsyncSession, habit: Habit, today: date | None = None) -> HabitOut:
    today = today or date.today()
    result = await db.execute(
        select(HabitCheckin.checked_on).where(HabitCheckin.habit_id == habit.id)
    )
    checkin_dates = [row[0] for row in result.all()]
    current_streak, longest_streak = _calculate_streaks(checkin_dates, habit.frequency, today)

    return HabitOut(
        id=habit.id,
        name=habit.name,
        frequency=habit.frequency,
        target_per_period=habit.target_per_period,
        is_active=habit.is_active,
        created_at=habit.created_at,
        current_streak=current_streak,
        longest_streak=longest_streak,
        total_checkins=len(checkin_dates),
        checked_today=today in checkin_dates,
    )


# =========================================================================
# Habit
# =========================================================================


async def create_habit(db: AsyncSession, user: User, payload: HabitCreate) -> HabitOut:
    habit = Habit(
        user_id=user.id,
        name=payload.name,
        frequency=payload.frequency,
        target_per_period=payload.target_per_period,
    )
    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return await _to_habit_out(db, habit)


async def list_habits(
    db: AsyncSession, user: User, active_only: bool = False
) -> list[HabitOut]:
    query = select(Habit).where(Habit.user_id == user.id)
    if active_only:
        query = query.where(Habit.is_active.is_(True))
    query = query.order_by(Habit.created_at.desc())
    result = await db.execute(query)
    habits = list(result.scalars().all())
    return [await _to_habit_out(db, habit) for habit in habits]


async def _get_habit_model_or_404(db: AsyncSession, user: User, habit_id: uuid.UUID) -> Habit:
    result = await db.execute(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user.id)
    )
    habit = result.scalar_one_or_none()
    if habit is None:
        raise _habit_not_found
    return habit


async def get_habit_or_404(db: AsyncSession, user: User, habit_id: uuid.UUID) -> HabitOut:
    habit = await _get_habit_model_or_404(db, user, habit_id)
    return await _to_habit_out(db, habit)


async def update_habit(
    db: AsyncSession, user: User, habit_id: uuid.UUID, payload: HabitUpdate
) -> HabitOut:
    habit = await _get_habit_model_or_404(db, user, habit_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(habit, field, value)
    await db.commit()
    await db.refresh(habit)
    return await _to_habit_out(db, habit)


async def delete_habit(db: AsyncSession, user: User, habit_id: uuid.UUID) -> None:
    habit = await _get_habit_model_or_404(db, user, habit_id)
    await db.delete(habit)
    await db.commit()


# =========================================================================
# Habit checkin
# =========================================================================


async def create_checkin(
    db: AsyncSession, user: User, habit_id: uuid.UUID, payload: HabitCheckinCreate
) -> HabitOut:
    # Odat haqiqatan ham joriy foydalanuvchiga tegishli ekanini tekshiramiz
    # (Tasks moduli `_ensure_goal_ownership`iga muvofiq).
    await _get_habit_model_or_404(db, user, habit_id)

    checkin = HabitCheckin(
        user_id=user.id,
        habit_id=habit_id,
        checked_on=payload.checked_on,
        note=payload.note,
    )
    db.add(checkin)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu kunga shu odat uchun belgilash allaqachon mavjud",
        ) from exc

    habit = await _get_habit_model_or_404(db, user, habit_id)
    return await _to_habit_out(db, habit)


async def delete_checkin(
    db: AsyncSession, user: User, habit_id: uuid.UUID, checked_on: date
) -> None:
    await _get_habit_model_or_404(db, user, habit_id)
    result = await db.execute(
        select(HabitCheckin).where(
            HabitCheckin.habit_id == habit_id,
            HabitCheckin.user_id == user.id,
            HabitCheckin.checked_on == checked_on,
        )
    )
    checkin = result.scalar_one_or_none()
    if checkin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Belgilash topilmadi"
        )
    await db.delete(checkin)
    await db.commit()


async def list_checkins(
    db: AsyncSession, user: User, habit_id: uuid.UUID
) -> list[HabitCheckin]:
    await _get_habit_model_or_404(db, user, habit_id)
    result = await db.execute(
        select(HabitCheckin)
        .where(HabitCheckin.habit_id == habit_id, HabitCheckin.user_id == user.id)
        .order_by(HabitCheckin.checked_on.desc())
    )
    return list(result.scalars().all())


# =========================================================================
# Reading log
# =========================================================================


async def create_reading_log(
    db: AsyncSession, user: User, payload: ReadingLogCreate
) -> ReadingLog:
    log = ReadingLog(
        user_id=user.id,
        title=payload.title,
        author=payload.author,
        status=payload.status,
        started_on=payload.started_on,
        finished_on=payload.finished_on,
        rating=payload.rating,
        notes=payload.notes,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def list_reading_logs(
    db: AsyncSession, user: User, status_filter: ReadingStatus | None = None
) -> list[ReadingLog]:
    query = select(ReadingLog).where(ReadingLog.user_id == user.id)
    if status_filter is not None:
        query = query.where(ReadingLog.status == status_filter)
    query = query.order_by(ReadingLog.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_reading_log_or_404(
    db: AsyncSession, user: User, log_id: uuid.UUID
) -> ReadingLog:
    result = await db.execute(
        select(ReadingLog).where(ReadingLog.id == log_id, ReadingLog.user_id == user.id)
    )
    log = result.scalar_one_or_none()
    if log is None:
        raise _reading_log_not_found
    return log


async def update_reading_log(
    db: AsyncSession, user: User, log_id: uuid.UUID, payload: ReadingLogUpdate
) -> ReadingLog:
    log = await get_reading_log_or_404(db, user, log_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(log, field, value)
    await db.commit()
    await db.refresh(log)
    return log


async def delete_reading_log(db: AsyncSession, user: User, log_id: uuid.UUID) -> None:
    log = await get_reading_log_or_404(db, user, log_id)
    await db.delete(log)
    await db.commit()


# =========================================================================
# Weekly review
# =========================================================================


async def create_weekly_review(
    db: AsyncSession, user: User, payload: WeeklyReviewCreate
) -> WeeklyReview:
    week_start = _week_start(payload.week_start_date)
    review = WeeklyReview(
        user_id=user.id,
        week_start_date=week_start,
        wins=payload.wins,
        challenges=payload.challenges,
        rating=payload.rating,
        notes=payload.notes,
    )
    db.add(review)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Shu hafta uchun baholash allaqachon mavjud",
        ) from exc
    await db.refresh(review)
    return review


async def list_weekly_reviews(db: AsyncSession, user: User) -> list[WeeklyReview]:
    result = await db.execute(
        select(WeeklyReview)
        .where(WeeklyReview.user_id == user.id)
        .order_by(WeeklyReview.week_start_date.desc())
    )
    return list(result.scalars().all())


async def get_weekly_review_or_404(
    db: AsyncSession, user: User, review_id: uuid.UUID
) -> WeeklyReview:
    result = await db.execute(
        select(WeeklyReview).where(
            WeeklyReview.id == review_id, WeeklyReview.user_id == user.id
        )
    )
    review = result.scalar_one_or_none()
    if review is None:
        raise _weekly_review_not_found
    return review


async def update_weekly_review(
    db: AsyncSession, user: User, review_id: uuid.UUID, payload: WeeklyReviewUpdate
) -> WeeklyReview:
    review = await get_weekly_review_or_404(db, user, review_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)
    await db.commit()
    await db.refresh(review)
    return review


async def delete_weekly_review(db: AsyncSession, user: User, review_id: uuid.UUID) -> None:
    review = await get_weekly_review_or_404(db, user, review_id)
    await db.delete(review)
    await db.commit()
