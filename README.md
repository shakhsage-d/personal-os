# Personal OS

Shaxsiy boshqaruv tizimi — Goals, Tasks, Calendar, Finance, Habits, Notifications, Dashboard.

Loyiha **piramida-roadmap** asosida, qavat-qavat quriladi. To'liq reja uchun `personal-os-roadmap.md`
fayliga qarang. Hozirgi holat: **0-Qavat — Loyiha skeletoni** ✅

## Tuzilma

```
personal-os/
  backend/           # FastAPI (Python 3.14)
    app/
      core/           # umumiy: config, database, auth (kelajakda)
      modules/        # har bir modul (goals, tasks, ...) shu yerda
      main.py
    alembic/          # DB migratsiyalar
    requirements.txt
    .env.example
  frontend/           # React (Vite)
    src/
      features/       # har bir modul uchun alohida papka
      shared/         # umumiy komponent/api/hook
  docker-compose.yml  # ixtiyoriy — lokal Postgres
```

## O'rnatish (Windows + PowerShell)

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
# Agar execution policy xatosi chiqsa:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

pip install -r requirements.txt
copy .env.example .env
# .env ichida DATABASE_URL'ni Supabase yoki lokal Postgres'ga moslang

alembic upgrade head
uvicorn app.main:app --reload
```

Tekshirish: http://127.0.0.1:8000/health → `{"status":"ok",...}`
Swagger: http://127.0.0.1:8000/docs

### 2. (Ixtiyoriy) Lokal Postgres docker orqali

```powershell
docker compose up -d
```

### 3. Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Tekshirish: http://localhost:5173 — "Backend ulanishi ishlayapti" xabari ko'rinishi kerak
(buning uchun backend ham parallel ishlab turishi kerak).

## Keyingi qadam

Roadmap bo'yicha keyingi qavat: **1-Qavat — Core/Shared qatlam (Auth + Multi-tenant asosi)**.
Yangi chatda quyidagicha boshlang:

> "Personal OS loyihasi. Loyiha fayllari (prompt + qo'shimcha qarorlar + roadmap) biriktirilgan.
> GitHub repo: [link]. Roadmapga ko'ra hozir **1-Qavat: Core/Shared qatlam** ustida ishlaymiz.
> 0-Qavat `[x]` bilan belgilangan va repo'da mavjud. Shu qavatni roadmapdagi ta'rifga muvofiq bajar."
