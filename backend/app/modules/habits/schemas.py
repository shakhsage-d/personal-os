"""
`/habits/*`, `/reading-logs/*`, `/weekly-reviews/*` endpointlari uchun
Pydantic sxemalari (6-Qavat, Finance moduli naqshiga muvofiq).
"""
import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.modules.habits.models import HabitFrequency, ReadingStatus

# --- Habit ---


class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    frequency: HabitFrequency = HabitFrequency.daily
    target_per_period: int = Field(default=1, ge=1, le=14)


class HabitUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    frequency: HabitFrequency | None = None
    target_per_period: int | None = Field(default=None, ge=1, le=14)
    is_active: bool | None = None


class HabitOut(BaseModel):
    id: uuid.UUID
    name: str
    frequency: HabitFrequency
    target_per_period: int
    is_active: bool
    created_at: datetime
    # service.py tomonidan hisoblab to'ldiriladi.
    current_streak: int
    longest_streak: int
    total_checkins: int
    checked_today: bool

    model_config = {"from_attributes": False}


# --- Habit checkin ---


class HabitCheckinCreate(BaseModel):
    checked_on: date
    note: str | None = Field(default=None, max_length=1000)


class HabitCheckinOut(BaseModel):
    id: uuid.UUID
    habit_id: uuid.UUID
    checked_on: date
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Reading log ---


class ReadingLogCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    author: str | None = Field(default=None, max_length=255)
    status: ReadingStatus = ReadingStatus.planned
    started_on: date | None = None
    finished_on: date | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    notes: str | None = Field(default=None, max_length=4000)


class ReadingLogUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    author: str | None = Field(default=None, max_length=255)
    status: ReadingStatus | None = None
    started_on: date | None = None
    finished_on: date | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    notes: str | None = Field(default=None, max_length=4000)


class ReadingLogOut(BaseModel):
    id: uuid.UUID
    title: str
    author: str | None
    status: ReadingStatus
    started_on: date | None
    finished_on: date | None
    rating: int | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Weekly review ---


class WeeklyReviewCreate(BaseModel):
    week_start_date: date
    wins: str | None = Field(default=None, max_length=4000)
    challenges: str | None = Field(default=None, max_length=4000)
    rating: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = Field(default=None, max_length=4000)


class WeeklyReviewUpdate(BaseModel):
    wins: str | None = Field(default=None, max_length=4000)
    challenges: str | None = Field(default=None, max_length=4000)
    rating: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = Field(default=None, max_length=4000)


class WeeklyReviewOut(BaseModel):
    id: uuid.UUID
    week_start_date: date
    wins: str | None
    challenges: str | None
    rating: int | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
