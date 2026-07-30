# Personal OS

Shaxsiy boshqaruv tizimi — maqsadlar, vazifalar, kalendar, moliya, odatlar va
bildirishnomalarni bitta joyda boshqarish uchun API-first web ilova.

**Holat: v1.1.0** (Web Enhancement bosqichi yakunlangan — 0–18-qavatlar).
11-Qavat (React Native mobil ilova) alohida, mustaqil yo'nalish sifatida
`mobile/` papkasida boshlangan (batafsili: `mobile/README.md`).

## Modullar

| Modul | Tavsif |
|---|---|
| Goals & Plans | Uzoq muddatli maqsadlar, bosqichlar, progress |
| Tasks | Kunlik/haftalik vazifalar, ustuvorlik, maqsadga bog'lanish |
| Calendar & Time | Barcha vazifa/reja/eslatmalarning vaqt bo'yicha ko'rinishi |
| Finance | Kirim/chiqim, byudjet, jamg'arma, ECharts grafiklar |
| Habits | Odatlar tracker, streak, o'qigan narsalar |
| Notifications | Markazlashtirilgan bildirishnomalar (APScheduler) |
| Dashboard | Shaxsiylashtiriladigan widget tizimi |
| Profile & Settings | Profil, parol, tema (light/dark/system), bildirishnoma afzalliklari |
| Global qidiruv | `Ctrl+K` / `Cmd+K` — barcha modullar bo'ylab qidiruv va tezkor amallar |

## Texnik stack

- **Backend:** Python 3.14, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL, Alembic, APScheduler
- **Frontend:** React (Vite), ECharts (moliyaviy grafiklar), markazlashtirilgan UI-kit (`src/shared/ui/`)
- **Auth:** JWT
- **Infratuzilma:** Supabase (Postgres) + Render (backend) — $0-byudjet arxitektura

To'liq texnik qarorlar va sabablar: loyihaning Claude Project fayllarida
(`personal-os-project-prompt.md`, `personal-os-qoshimcha-qarorlar.md`,
`personal-os-roadmap*.md`) saqlanadi — bu repo ularning amalga oshirilishi.

## Lokal ishga tushirish

### Backend
```bash
cd backend
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env   # DB ulanish satri, JWT secret va h.k.ni to'ldiring
alembic upgrade head
uvicorn app.main:app --reload
```
API hujjatlari: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Loyiha tuzilmasi

```
backend/app/
  core/          # Auth, User, umumiy xato-handlerlar, scheduler
  modules/       # Har bir modul alohida papkada (goals, tasks, calendar, ...)
frontend/src/
  features/      # Har bir modul uchun alohida feature-papka
  shared/        # UI-kit, tema, auth-context, API client
mobile/          # React Native (Expo) — 11-Qavat, alohida yo'nalish
```

Yangi modul qo'shish: mavjud modullarga tegmasdan, yangi
`backend/app/modules/<nom>/` + `frontend/src/features/<nom>/` papkasi va
`main.py`da bitta router ro'yxatga olish qatori kifoya.

## Rivojlanish tarixi

Batafsil: `CHANGELOG.md`.
