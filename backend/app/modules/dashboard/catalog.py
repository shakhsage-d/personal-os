"""
14-Qavat: Dashboard v2 — Widget katalogi.

Har bir modul (Goals, Tasks, Calendar, Finance, Habits, Notifications) uchun
kamida 2 xil widget varianti (roadmap v1.1, 14-Qavat DoD). Bu yerdagi
ro'yxat — **yagona haqiqat manbai**: yangi widget qo'shish uchun faqat shu
ro'yxatga bitta yozuv qo'shish kifoya, `UserDashboardConfig.widgets`dagi
mavjud foydalanuvchi qatorlari `merge_with_catalog()` orqali avtomatik
yangi widget bilan to'ldiriladi (standart holatda o'chirilgan/oxirida).
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class WidgetDefinition:
    key: str
    module: str
    label: str
    description: str
    default_enabled: bool = True


WIDGET_CATALOG: list[WidgetDefinition] = [
    WidgetDefinition(
        key="goals_overview",
        module="goals",
        label="Maqsadlar — umumiy ro'yxat",
        description="Jami/faol/yakunlangan sonlar va muddati yaqin 5 ta maqsad.",
    ),
    WidgetDefinition(
        key="goals_progress_chart",
        module="goals",
        label="Maqsadlar — progress grafigi",
        description="Muddati yaqin maqsadlarning progress-bar ko'rinishi.",
        default_enabled=False,
    ),
    WidgetDefinition(
        key="tasks_overview",
        module="tasks",
        label="Vazifalar — umumiy ro'yxat",
        description="Ochiq/kechikkan/bugungi sonlar va muddati yaqin 5 ta vazifa.",
    ),
    WidgetDefinition(
        key="tasks_priority_breakdown",
        module="tasks",
        label="Vazifalar — ustuvorlik bo'yicha",
        description="Ochiq vazifalarning past/o'rta/yuqori ustuvorlik bo'yicha taqsimoti.",
        default_enabled=False,
    ),
    WidgetDefinition(
        key="calendar_upcoming",
        module="calendar",
        label="Kalendar — keyingi 7 kun ro'yxati",
        description="Keyingi 7 kundagi barcha hodisalarning yagona ro'yxati.",
    ),
    WidgetDefinition(
        key="calendar_mini_agenda",
        module="calendar",
        label="Kalendar — kunlar bo'yicha agenda",
        description="Keyingi 7 kundagi hodisalar sana bo'yicha guruhlangan holda.",
        default_enabled=False,
    ),
    WidgetDefinition(
        key="finance_monthly_summary",
        module="finance",
        label="Moliya — oylik xulosa",
        description="Joriy oy kirim/chiqim/sof natija.",
    ),
    WidgetDefinition(
        key="finance_recent_transactions",
        module="finance",
        label="Moliya — so'nggi tranzaksiyalar",
        description="Eng so'nggi 5 ta tranzaksiya ro'yxati.",
        default_enabled=False,
    ),
    WidgetDefinition(
        key="habits_streaks",
        module="habits",
        label="Odatlar — eng yaxshi streak'lar",
        description="Faol odatlar soni va joriy streak bo'yicha top 5.",
    ),
    WidgetDefinition(
        key="habits_today_checklist",
        module="habits",
        label="Odatlar — bugungi checklist",
        description="Faol odatlarning bugun belgilangan/belgilanmaganligi.",
        default_enabled=False,
    ),
    WidgetDefinition(
        key="notifications_summary",
        module="notifications",
        label="Bildirishnomalar — o'qilmagan soni",
        description="O'qilmagan bildirishnomalar soni.",
    ),
    WidgetDefinition(
        key="notifications_recent",
        module="notifications",
        label="Bildirishnomalar — so'nggilari",
        description="Eng so'nggi 5 ta bildirishnoma sarlavhasi.",
        default_enabled=False,
    ),
]

_CATALOG_BY_KEY: dict[str, WidgetDefinition] = {w.key: w for w in WIDGET_CATALOG}


def default_widget_config() -> list[dict]:
    """Foydalanuvchi hali konfiguratsiya saqlamagan bo'lsa ishlatiladigan
    standart tartib — katalogdagi tartib bo'yicha, `default_enabled`ga mos."""
    return [
        {"widget_key": w.key, "enabled": w.default_enabled, "position": index}
        for index, w in enumerate(WIDGET_CATALOG)
    ]


def merge_with_catalog(stored: list[dict]) -> list[dict]:
    """Saqlangan konfiguratsiyani joriy katalog bilan solishtiradi:
    - katalogda endi mavjud bo'lmagan (eskirgan) widget_key'lar tashlanadi
    - katalogda bor-u, saqlangan konfiguratsiyada yo'q (yangi qo'shilgan)
      widget'lar ro'yxat oxiriga, standart holatda qo'shiladi

    Bu — yangi widget kod orqali qo'shilganda, eski foydalanuvchilarning
    saqlangan konfiguratsiyasini qo'lda migratsiya qilish shart emasligini
    ta'minlaydi (`UserSettings.get_or_create` naqshiga o'xshash g'oya)."""
    stored_keys = {item["widget_key"] for item in stored}
    merged = [item for item in stored if item["widget_key"] in _CATALOG_BY_KEY]

    next_position = (max((item["position"] for item in merged), default=-1)) + 1
    for widget in WIDGET_CATALOG:
        if widget.key not in stored_keys:
            merged.append(
                {
                    "widget_key": widget.key,
                    "enabled": widget.default_enabled,
                    "position": next_position,
                }
            )
            next_position += 1

    return merged


def get_definition(widget_key: str) -> WidgetDefinition | None:
    return _CATALOG_BY_KEY.get(widget_key)
