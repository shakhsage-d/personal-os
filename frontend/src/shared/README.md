# shared/

Barcha `features/` papkalari o'rtasida umumiy bo'lgan narsalar shu yerda:

- `ui/` — umumiy UI komponentlar (Design System / UI-kit: Button, Input,
  Select, Card, Modal, Badge, Tooltip, Feedback — 13-Qavat)
- `theme/` — dark/light tema (12-Qavat)
- `api/` — API client, umumiy so'rov logikasi
- `auth/` — autentifikatsiya konteksti

Modul-papkalar (masalan `features/goals/`) shu yerdan import qiladi,
lekin bir-biriga to'g'ridan-to'g'ri bog'liq bo'lmasligi kerak.
