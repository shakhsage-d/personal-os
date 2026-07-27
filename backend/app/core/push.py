"""
Push notification yuborish — 11-Qavat (Mobil ilova) DoD: "Push notification
kamida bitta trigger uchun ishlaydi".

Yondashuv: Expo Push Notification xizmati (bepul HTTP API, Firebase/APNs
loyihasini alohida sozlashni talab qilmaydi — mobil ilova README'sida
(`mobile/README.md`) qarorning to'liq asosi yozilgan).

MUHIM: bu funksiya har doim "best-effort" — xato bo'lsa (masalan tarmoq
muammosi, noto'g'ri token) faqat log qilinadi va jim yutiladi. Push
yuborilmasligi hech qachon bildirishnoma yozuvining o'zi yaratilishiga yoki
boshqa biznes-mantiqqa xalaqit bermasligi kerak (`notifications/service.py`
shu funksiyani chaqirganda natijasini kutmaydi/tekshirmaydi).
"""
import logging

import httpx

logger = logging.getLogger(__name__)

_EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def send_expo_push_notification(push_token: str | None, title: str, body: str) -> None:
    if not push_token:
        return

    payload = {
        "to": push_token,
        "title": title,
        "body": body,
        "sound": "default",
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                _EXPO_PUSH_URL,
                json=payload,
                headers={"Content-Type": "application/json", "Accept": "application/json"},
            )
            if response.status_code >= 400:
                logger.warning(
                    "Expo push yuborilmadi (status=%s): %s", response.status_code, response.text
                )
    except httpx.HTTPError as exc:
        # Tarmoq xatosi push yuborishga xalaqit berishi mumkin, lekin bu
        # bildirishnoma yaratish oqimini to'xtatmasligi kerak (best-effort).
        logger.warning("Expo push yuborishda tarmoq xatosi: %s", exc)
