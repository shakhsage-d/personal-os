"""
Tasks moduli — biznes-mantiq qatlami (Goals moduli naqshiga muvofiq,
roadmap 2-Qavat izohi).

Xavfsizlik eslatmasi: har bir so'rov `Task.user_id == user.id` bilan
filtrlanadi (servis darajasidagi himoya) — 0004-migratsiyadagi RLS siyosati
bilan birga ikki qatlamli himoyani ta'minlaydi (qoshimcha-qarorlar.md,
4-bo'lim).

N+1 oldini olish (roadmap, 3-Qavat DoD): ro'yxat so'rovlarida
`selectinload(Task.goal)` ANIQ qo'llaniladi — shu orqali N ta task uchun
N ta alohida "goal nima edi?" so'rovi o'rniga bitta qo'shimcha so'rov bilan
barcha bog'langan Goal'lar birga yuklanadi.
"""
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import User
from app.modules.goals.models import Goal
from app.modules.tasks.models import Task, TaskStatus, TaskPriority
from app.modules.tasks.schemas import TaskCreate, TaskOut, TaskUpdate

_task_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Vazifa topilmadi"
)
_goal_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND, detail="Bog'lanmoqchi bo'lgan maqsad topilmadi"
)


def to_task_out(task: Task) -> TaskOut:
    return TaskOut(
        id=task.id,
        goal_id=task.goal_id,
        goal_title=task.goal.title if task.goal is not None else None,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        recurrence=task.recurrence,
        due_date=task.due_date,
        completed_at=task.completed_at,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


async def _ensure_goal_ownership(
    db: AsyncSession, user: User, goal_id: uuid.UUID
) -> None:
    """Task biror Goal'ga bog'lanmoqchi bo'lsa, shu Goal haqiqatan ham
    joriy foydalanuvchiga tegishli ekanini tekshiradi (boshqa
    foydalanuvchining maqsadiga task bog'lab qo'yilmasligi uchun)."""
    result = await db.execute(
        select(Goal.id).where(Goal.id == goal_id, Goal.user_id == user.id)
    )
    if result.scalar_one_or_none() is None:
        raise _goal_not_found


async def create_task(db: AsyncSession, user: User, payload: TaskCreate) -> Task:
    if payload.goal_id is not None:
        await _ensure_goal_ownership(db, user, payload.goal_id)

    task = Task(
        user_id=user.id,
        goal_id=payload.goal_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        recurrence=payload.recurrence,
        due_date=payload.due_date,
    )
    db.add(task)
    await db.commit()
    return await get_task_or_404(db, user, task.id)


async def list_tasks(
    db: AsyncSession,
    user: User,
    goal_id: uuid.UUID | None = None,
    status_filter: TaskStatus | None = None,
    priority_filter: TaskPriority | None = None,
) -> list[Task]:
    query = (
        select(Task)
        .options(selectinload(Task.goal))
        .where(Task.user_id == user.id)
    )
    if goal_id is not None:
        query = query.where(Task.goal_id == goal_id)
    if status_filter is not None:
        query = query.where(Task.status == status_filter)
    if priority_filter is not None:
        query = query.where(Task.priority == priority_filter)
    query = query.order_by(Task.due_date.is_(None), Task.due_date, Task.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().unique().all())


async def get_task_or_404(db: AsyncSession, user: User, task_id: uuid.UUID) -> Task:
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.goal))
        .where(Task.id == task_id, Task.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise _task_not_found
    return task


async def update_task(
    db: AsyncSession, user: User, task_id: uuid.UUID, payload: TaskUpdate
) -> Task:
    task = await get_task_or_404(db, user, task_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "goal_id" in update_data and update_data["goal_id"] is not None:
        await _ensure_goal_ownership(db, user, update_data["goal_id"])

    if "status" in update_data:
        if update_data["status"] == TaskStatus.done and task.status != TaskStatus.done:
            task.completed_at = datetime.now(timezone.utc)
        elif update_data["status"] != TaskStatus.done:
            task.completed_at = None

    for field, value in update_data.items():
        setattr(task, field, value)

    await db.commit()
    return await get_task_or_404(db, user, task_id)


async def delete_task(db: AsyncSession, user: User, task_id: uuid.UUID) -> None:
    task = await get_task_or_404(db, user, task_id)
    await db.delete(task)
    await db.commit()
