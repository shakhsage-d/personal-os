"""
`/auth/*` endpointlari — ro'yxatdan o'tish, kirish, token yangilash, joriy
foydalanuvchi. Bu — `core` qatlamining bir qismi, alohida modul emas
(asosiy prompt, 3-bo'lim: "auth, user ... alohida core/shared qatlamda").
"""
import uuid

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.models import User
from app.core.schemas_auth import (
    PushTokenRegister,
    RefreshRequest,
    TokenPair,
    UserLogin,
    UserOut,
    UserRegister,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

_invalid_credentials = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="Email yoki parol noto'g'ri"
)
_invalid_refresh = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token yaroqsiz yoki muddati o'tgan"
)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)) -> User:
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu email bilan foydalanuvchi allaqachon ro'yxatdan o'tgan",
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenPair)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)) -> TokenPair:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise _invalid_credentials
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Foydalanuvchi faol emas"
        )

    return TokenPair(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)) -> TokenPair:
    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise _invalid_refresh
        user_id = uuid.UUID(decoded["sub"])
    except (jwt.PyJWTError, ValueError, KeyError) as exc:
        raise _invalid_refresh from exc

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise _invalid_refresh

    return TokenPair(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=UserOut)
async def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/push-token", status_code=status.HTTP_204_NO_CONTENT)
async def register_push_token(
    payload: PushTokenRegister,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    11-Qavat (Mobil ilova): mobil ilova login bo'lgach o'z Expo push
    tokenini shu orqali ro'yxatdan o'tkazadi. `notifications/service.py`
    keyinchalik bildirishnoma yaratganda shu tokenga push yuboradi.
    """
    current_user.push_token = payload.push_token
    await db.commit()
