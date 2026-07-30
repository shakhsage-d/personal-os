"""
Personal OS — backend entrypoint.

Yangi modul qo'shish uchun:
    from app.modules.<module_name>.router import router as <module_name>_router
    app.include_router(<module_name>_router)

Mavjud kodni o'zgartirish shart emas — faqat shu 2 qatorni qo'shish kifoya.
"""
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.errors import register_error_handlers
from app.core.router import router as auth_router
from app.core.scheduler import start_scheduler, stop_scheduler
from app.modules.calendar.router import router as calendar_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.finance.router import router as finance_router
from app.modules.goals.router import router as goals_router
from app.modules.habits.router import router as habits_router
from app.modules.notifications.router import router as notifications_router
from app.modules.profile.router import router as profile_router
from app.modules.search.router import router as search_router
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


@app.api_route("/health", methods=["GET", "HEAD"], tags=["system"])
async def health_check() -> dict:
    """Servis ishlab turganini tekshirish uchun oddiy endpoint (DB'ga tegmaydi)."""
    return {"status": "ok", "environment": settings.environment}


@app.api_route("/health/db", methods=["GET", "HEAD"], tags=["system"])
async def health_check_db(db: AsyncSession = Depends(get_db)) -> dict:
    """
    10-Qavat (Production Deploy): DB'ga haqiqiy so'rov yuboradigan health-check.

    Auth talab qilinmaydi — faqat `SELECT 1`, hech qanday maxfiy ma'lumot
    qaytarmaydi. Maqsad: GitHub Actions cron-ping (`.github/workflows/
    keep-alive.yml`) shu endpointga so'rov yuborib, bitta chaqiruv bilan ham
    Render'ni (15 daqiqa uyqu), ham Supabase'ni (7 kun pauza) faol saqlaydi
    (qoshimcha-qarorlar.md, 5-bo'lim).
    """
    await db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "reachable"}


# --- Modul routerlari shu yerga ro'yxatga olinadi ---
app.include_router(auth_router)
app.include_router(goals_router)
app.include_router(tasks_router)
app.include_router(calendar_router)
app.include_router(finance_router)
app.include_router(habits_router)
app.include_router(notifications_router)
app.include_router(profile_router)
app.include_router(dashboard_router)
app.include_router(search_router)

# Kelajakdagi modullar shu yerga xuddi shu naqsh bilan qo'shiladi.


# --- APScheduler: in-process background job (qoshimcha-qarorlar.md, 3-bo'lim) ---
@app.on_event("startup")
async def _on_startup() -> None:
    start_scheduler()


@app.on_event("shutdown")
async def _on_shutdown() -> None:
    stop_scheduler()
