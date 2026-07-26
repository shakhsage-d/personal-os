"""
Calendar moduli — biznes-mantiq qatlami (4-Qavat).

Bu servis o'z jadvalini o'qimaydi/yozmaydi — Goals (2-Qavat) va Tasks
(3-Qavat) modullaridagi mavjud modellarni **faqat o'qish** uchun so'raydi
va bitta umumiy "kalendar hodisasi" ro'yxatiga birlashtiradi.

Xavfsizlik eslatmasi: har uchala so'rov ham `user_id == user.id` bilan
filtrlanadi (roadmap, 7-band: mavjud xavfsizlik naqshi o'zgarishsiz
saqlanadi — bu yerda ham servis darajasidagi himoya + RLS ikki qatlami
davom etadi, chunki Task/Goal/GoalMilestone jadvallarida RLS allaqachon
yoqilgan, 0003/0004-migratsiyalarga qarang).
"""
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import User
from app.modules.calendar.schemas import CalendarEventOut, CalendarEventType
from app.modules.goals.models import Goal, GoalMilestone
from app.modules.tasks.models import Task, TaskStatus


async def get_calendar_events(
    db: AsyncSession, user: User, date_from: date, date_to: date
) -> list[CalendarEventOut]:
    events: list[CalendarEventOut] = []

    # --- Tasks (due_date oralig'ida) ---
    task_result = await db.execute(
        select(Task).where(
            Task.user_id == user.id,
            Task.due_date.is_not(None),
            Task.due_date >= date_from,
            Task.due_date <= date_to,
        )
    )
    for task in task_result.scalars().all():
        status_label = {
            TaskStatus.todo: "Bajarilmagan",
            TaskStatus.in_progress: "Jarayonda",
            TaskStatus.done: "Bajarilgan",
        }[task.status]
        events.append(
            CalendarEventOut(
                id=task.id,
                type=CalendarEventType.task,
                event_date=task.due_date,
                title=task.title,
                status_label=status_label,
                goal_id=task.goal_id,
                goal_title=None,
            )
        )

    # --- Goals (target_date oralig'ida) ---
    goal_result = await db.execute(
        select(Goal).where(
            Goal.user_id == user.id,
            Goal.target_date.is_not(None),
            Goal.target_date >= date_from,
            Goal.target_date <= date_to,
        )
    )
    for goal in goal_result.scalars().all():
        events.append(
            CalendarEventOut(
                id=goal.id,
                type=CalendarEventType.goal,
                event_date=goal.target_date,
                title=goal.title,
                status_label=goal.status.value,
                goal_id=goal.id,
                goal_title=goal.title,
            )
        )

    # --- Goal Milestones (target_date oralig'ida) ---
    milestone_result = await db.execute(
        select(GoalMilestone, Goal.title)
        .join(Goal, Goal.id == GoalMilestone.goal_id)
        .where(
            GoalMilestone.user_id == user.id,
            GoalMilestone.target_date.is_not(None),
            GoalMilestone.target_date >= date_from,
            GoalMilestone.target_date <= date_to,
        )
    )
    for milestone, goal_title in milestone_result.all():
        events.append(
            CalendarEventOut(
                id=milestone.id,
                type=CalendarEventType.milestone,
                event_date=milestone.target_date,
                title=milestone.title,
                status_label="Bajarilgan" if milestone.is_completed else "Bajarilmagan",
                goal_id=milestone.goal_id,
                goal_title=goal_title,
            )
        )

    events.sort(key=lambda e: (e.event_date, e.type.value, e.title))
    return events
