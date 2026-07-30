# Changelog

## v1.1.0 — Web Enhancement bosqichi (12–18-qavatlar)

- **12-Qavat:** Profile & Settings moduli — profil tahrirlash, parol
  o'zgartirish, light/dark/system tema, bildirishnoma afzalliklari.
- **13-Qavat:** Design System / UI-kit — markazlashtirilgan `Button`,
  `Input`, `Select`, `Card`, `Modal`, `Badge`, `Tooltip`, `EmptyState`,
  `LoadingSpinner` komponentlari va dizayn tokenlari (`tokens.css`).
- **14-Qavat:** Dashboard v2 — foydalanuvchi tanlaydigan/tartiblaydigan
  widget tizimi, har bir modul uchun kamida 2 ta widget varianti.
- **15-Qavat (a–f):** Har bir modulning (Goals, Tasks, Calendar, Finance,
  Habits, Notifications) ichki UX'i — filtrlash/saralash, bo'sh holatlar,
  tez amallar, UI-kit'ga to'liq o'tish.
- **16-Qavat:** Global qidiruv va Command Bar (`Ctrl+K`/`Cmd+K`) — barcha
  modullar bo'ylab matn qidiruvi va tezkor amallar.
- **17-Qavat:** Performance & Accessibility audit — route-based code
  splitting, ortiqcha API so'rovlarni kamaytirish, klaviatura navigatsiyasi,
  kontrast tekshiruvi (`docs/performance-accessibility-audit.md`).
- **18-Qavat:** Web Polish & Release —
  - `App.css`dagi 95 ta eski (tokenlardan oldingi) hardcoded rang
    markazlashtirilgan `--pos-*` tokenlariga o'tkazildi — bu ranglar
    avval dark rejimda o'zgarmasdi (masalan qorong'u rejimda ham oq fon
    qolib ketardi); endi ular temaga to'liq mos.
  - Habits moduli uchun yetishmayotgan `--pos-badge-purple-*` tokeni
    (light+dark) qo'shildi.
  - Repo ildizidagi eskirgan, faqat 14-Qavatga tegishli bo'lgan
    "qo'llash yo'riqnomasi" `README.md` o'rniga loyihaning umumiy
    tavsifi bilan almashtirildi.
  - Backend/frontend versiya raqamlari `1.1.0`ga ko'tarildi.

## v1.0.0 — Asosiy tizim (0–10-qavatlar)

- Loyiha skeletoni, Core/Auth (JWT, multi-tenant, RLS), Goals & Plans,
  Tasks, Calendar & Time, Finance (ECharts grafiklar), Personal
  Growth/Habits, markazlashtirilgan Notifications (APScheduler),
  Dashboard (v1), UX polish va responsiv frontend, production deploy
  (Supabase + Render).
