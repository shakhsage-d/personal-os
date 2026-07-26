"""
Barcha modul endpointlari uchun umumiy dependency'lar.
Himoyalangan endpoint yozish uchun:

    from app.core.deps import get_current_user

    @router.get("/something")
    async def endpoint(current_user: User = Depends(get_current_user)):
        ...
"""
import uuid

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.models import User
from app.core.security import decode_token

# auto_error=False — token umuman berilmagan holatni ham o'zimiz 401 bilan
# boshqarish uchun (standart xato formatimizga mos bo'lishi uchun).
bearer_scheme = HTTPBearer(auto_error=False)

_credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Autentifikatsiya talab qilinadi yoki token yaroqsiz",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise _credentials_exception

    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise _credentials_exception
        user_id = uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, ValueError, KeyError) as exc:
        raise _credentials_exception from exc

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise _credentials_exception

    # RLS uchun: shu so'rov davomidagi tranzaksiyaga joriy foydalanuvchi ID'sini
    # o'rnatamiz. `core_rls_demo_items` (va 2-Qavatdan boshlab Goal/Task/...
    # jadvallari) RLS siyosati shu sessiya o'zgaruvchisiga qarab filtrlaydi —
    # servis darajasidagi `.where(user_id == ...)` xato qilib qolsa ham,
    # boshqa foydalanuvchi ma'lumoti sizib chiqmaydi.
    # Eslatma: `SET LOCAL` buyrug'i bog'langan parametrni ($1) qabul qilmaydi
    # (PostgreSQL sintaksis xatosi beradi), shuning uchun `set_config()`
    # funksiyasidan foydalanamiz — u oddiy funksiya chaqiruvi bo'lgani uchun
    # xavfsiz parametr bog'lashni qo'llab-quvvatlaydi. `is_local=true` — bu
    # qiymat faqat joriy tranzaksiya doirasida amal qiladi.
    await db.execute(
        text("SELECT set_config('app.current_user_id', :uid, true)"),
        {"uid": str(user.id)},
    )

    return user
