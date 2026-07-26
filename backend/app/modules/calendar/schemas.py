"""
`/calendar` endpointi uchun Pydantic sxemalari — 4-Qavat: Calendar & Time.

Bu modul o'z jadvaliga ega EMAS (roadmap, 4-Qavat: "sana bo'yicha task/goal
so'rovlarini birlashtiruvchi endpoint"). U faqat Goals (3-Qavat) va Tasks
(3-Qavat, aslida 3-qavat Tasks moduli) modullaridagi mavjud sana
maydonlarini (`Task.due_date`, `Goal.target_date`, `GoalMilestone.target_date`)
bitta vaqt o'qi bo'yicha birlashtirib qaytaradi.
"""
import uuid
from datetime import date
from enum import Enum

from pydantic import BaseModel


class CalendarEventType(str, Enum):
    task = "task"
    goal = "goal"
    milestone = "milestone"


class CalendarEventOut(BaseModel):
    # `id` — asl obyekt id'si (Task.id / Goal.id / GoalMilestone.id).
    # Frontend shu orqali kerak bo'lsa tegishli sahifaga link bera oladi.
    id: uuid.UUID
    type: CalendarEventType
    event_date: date
    title: str
    # Task uchun status/priority, Goal uchun status, Milestone uchun
    # is_completed — barchasi umumiy "holat matni" sifatida keladi, chunki
    # frontend kalendar katakchasida faqat qisqa yorliq ko'rsatadi.
    status_label: str
    # Milestone bo'lsa, qaysi Goal'ga tegishli ekanini ko'rsatish uchun.
    goal_id: uuid.UUID | None = None
    goal_title: str | None = None

    model_config = {"from_attributes": True}
