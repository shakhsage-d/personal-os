# shared/

Barcha `features/` papkalari o'rtasida umumiy bo'lgan narsalar shu yerda:

- `components/` — umumiy UI komponentlar (Button, Card, Input, Layout va h.k.)
- `api/` — API client, umumiy so'rov logikasi
- `hooks/` — umumiy React hook'lar (masalan `useAuth`, kelajakda)

Modul-papkalar (masalan `features/goals/`) shu yerdan import qiladi,
lekin bir-biriga to'g'ridan-to'g'ri bog'liq bo'lmasligi kerak.
