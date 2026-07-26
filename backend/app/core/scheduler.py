"""
7-Qavat: markazlashtirilgan scheduler — `qoshimcha-qarorlar.md` 3-bo'limiga
muvofiq **APScheduler, asosiy backend jarayoni ichida** (alohida
worker/Celery emas, $0-byudjet arxitekturasi).

Har bir yugurishda: barcha faol foydalanuvchilar bo'yicha aylanadi, har biri
uchun **alohida DB sessiya** ochadi va RLS sessiya o'zgaruvchisini
(`app.current_user_id`) shu foydalanuvchiga o'rnatadi (`app/core/deps.py`
dagi `get_current_user` bilan bir xil naqsh) — shundagina FORCE ROW LEVEL
SECURITY yoqilgan jadvallarga (Task/Budget/Habit va h.k.) xavfsiz kirish
mumkin, va foydalanuvchilar ma'lumoti bir-biriga aralashmaydi.
"""
import logging
from datetime import date, datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, text

from app.core.database import AsyncSessionLocal
from app.core.models import User
from app.modules.notifications.triggers import run_all_checks_for_user

logger = logging.getLogger("personal_os.scheduler")

scheduler = AsyncIOScheduler()

# Har necha soatda bildirishnoma trigger'lari qayta tekshirilsin.
# `dedupe_key` orqali bir xil hodisa uchun qayta-qayta yozilmaydi, shuning
# uchun tez-tez ishga tushirish xavfsiz (qoshimcha-qarorlar.md, 3-bo'lim).
_CHECK_INTERVAL_HOURS = 3


async def run_notification_checks() -> None:
    """Barcha faol foydalanuvchilar uchun trigger tekshiruvlarini bajaradi."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User.id).where(User.is_active.is_(True)))
        user_ids = [row[0] for row in result.all()]

    today = date.today()
    for user_id in user_ids:
        try:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    text("SELECT set_config('app.current_user_id', :uid, true)"),
                    {"uid": str(user_id)},
                )
                await run_all_checks_for_user(db, user_id, today)
        except Exception:  # noqa: BLE001 — bitta foydalanuvchidagi xato
            # boshqalarni to'xtatib qo'ymasligi kerak.
            logger.exception("Notification tekshiruvi xato berdi: user_id=%s", user_id)


def start_scheduler() -> None:
    if scheduler.running:
        return
    scheduler.add_job(
        run_notification_checks,
        "interval",
        hours=_CHECK_INTERVAL_HOURS,
        id="notification_checks",
        replace_existing=True,
        next_run_time=datetime.now(),  # ilk marta darhol ham ishga tushsin
    )
    scheduler.start()
    logger.info("APScheduler ishga tushdi (notification_checks, har %sh)", _CHECK_INTERVAL_HOURS)


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
