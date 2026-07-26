"""
`/tasks/*` endpointlari — 3-Qavat: Tasks moduli.
Goals moduli (namunaviy modul, 2-Qavat) tuzilmasidan nusxa olingan.
"""
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.modules.tasks import service
from app.modules.tasks.models import TaskPriority, TaskStatus
from app.modules.tasks.schemas import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskOut:
    task = await service.create_task(db, current_user, payload)
    return service.to_task_out(task)


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    goal_id: uuid.UUID | None = None,
    status_filter: TaskStatus | None = None,
    priority_filter: TaskPriority | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TaskOut]:
    tasks = await service.list_tasks(
        db, current_user, goal_id=goal_id, status_filter=status_filter, priority_filter=priority_filter
    )
    return [service.to_task_out(task) for task in tasks]


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskOut:
    task = await service.get_task_or_404(db, current_user, task_id)
    return service.to_task_out(task)


@router.put("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskOut:
    task = await service.update_task(db, current_user, task_id, payload)
    return service.to_task_out(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_task(db, current_user, task_id)
