"""
Personal OS — backend entrypoint.

Yangi modul qo'shish uchun:
    from app.modules.<module_name>.router import router as <module_name>_router
    app.include_router(<module_name>_router)

Mavjud kodni o'zgartirish shart emas — faqat shu 2 qatorni qo'shish kifoya.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.core.router import router as auth_router
from app.core.scheduler import start_scheduler, stop_scheduler
from app.modules.calendar.router import router as calendar_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.finance.router import router as finance_router
from app.modules.goals.router import router as goals_router
from app.modules.habits.router import router as habits_router
from app.modules.notifications.router import router as notifications_router
from app.modules.tasks.router import router as tasks_router

settings = get_settings()

app = FastAPI(
    title="Personal OS API",
    description="Shaxsiy boshqaruv tizimi — Goals, Tasks, Calendar, Finance, Habits, Notifications",
    version="0.1.0",
)

register_error_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health_check() -> dict:
    """Servis ishlab turganini tekshirish uchun oddiy endpoint."""
    return {"status": "ok", "environment": settings.environment}


# --- Modul routerlari shu yerga ro'yxatga olinadi ---
app.include_router(auth_router)
app.include_router(goals_router)
app.include_router(tasks_router)
app.include_router(calendar_router)
app.include_router(finance_router)
app.include_router(habits_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)

# Kelajakdagi modullar shu yerga xuddi shu naqsh bilan qo'shiladi.


# --- APScheduler: in-process background job (qoshimcha-qarorlar.md, 3-bo'lim) ---
@app.on_event("startup")
async def _on_startup() -> None:
    start_scheduler()


@app.on_event("shutdown")
async def _on_shutdown() -> None:
    stop_scheduler()
