# Personal OS

Shaxsiy boshqaruv tizimi — Goals, Tasks, Calendar, Finance, Habits, Notifications, Dashboard.

Loyiha **piramida-roadmap** asosida, qavat-qavat quriladi. To'liq reja uchun `personal-os-roadmap.md`
fayliga qarang. Hozirgi holat: **0–9-Qavatlar tugallangan** ✅ (Skeleton, Auth, Goals, Tasks, Calendar,
Finance, Habits, Notifications, Dashboard, UX polish) — hozir **10-Qavat: Production Deploy** ustida
ishlanmoqda.

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

## Production Deploy (10-Qavat)

Loyiha `render.yaml` orqali (Render Blueprint) deploy qilinadi — bitta faylda backend (FastAPI) va
frontend (statik React build) ta'riflangan.

### 1. Supabase (production DB)

1. [supabase.com](https://supabase.com)'da yangi loyiha yarating.
2. Superuser **emas**, cheklangan huquqli rol yarating (`backend/.env.example`dagi SQL buyruqqa
   qarang) — bu RLS'ning haqiqatan ishlashi uchun **shart**.
3. `DATABASE_URL`ni shu rol bilan yozib oling: `postgresql+asyncpg://personal_os_app:<parol>@<host>:5432/<db>`.

### 2. Render (Blueprint orqali)

1. Render Dashboard → **New → Blueprint** → shu GitHub repo'ni tanlang.
2. Render `render.yaml`ni o'qib ikkita xizmatni (`personal-os-backend`, `personal-os-frontend`)
   avtomatik taklif qiladi.
3. `sync: false` bilan belgilangan environment variable'larni qo'lda kiriting:
   - Backend: `DATABASE_URL` (1-qadamdan), `CORS_ORIGINS` (frontend URL'i tayyor bo'lgach)
   - Frontend: `VITE_API_BASE_URL` (backend URL'i tayyor bo'lgach)
4. Ikkala xizmat birinchi marta deploy bo'lgach, haqiqiy URL'larni bir-biriga kiritib (3-qadam),
   qayta deploy qiling (Render env var o'zgarganda avtomatik qayta deploy qiladi).
5. `alembic upgrade head` har deploy'da avtomatik ishga tushadi (`render.yaml`dagi `startCommand`).

**Eslatma:** backend `--workers 1` bilan ishga tushadi — bu ataylab shunday, chunki
`app/core/scheduler.py`dagi APScheduler in-process ishlaydi; bir nechta worker bo'lsa, bildirishnoma
trigger'lari bir necha marta ishga tushib qoladi.

### 3. Cron-ping (Render uyqusi + Supabase pauzasi uchun)

`.github/workflows/keep-alive.yml` — har 6 soatda backend'ning `/health/db` endpointiga (haqiqiy DB
so'rovi bilan) so'rov yuboradi, shu bilan bir vaqtda Render'ni uyg'otadi va Supabase'ning 7-kunlik
pauza hisoblagichini nolga tushiradi. Sozlash uchun workflow faylidagi `PING_URL`ni (yoki repo
**Settings → Secrets and variables → Actions → Variables**da `KEEP_ALIVE_URL`ni) haqiqiy Render
backend URL'iga o'zgartiring.

### 4. Tekshirish (DoD)

- [ ] Production URL orqali login'dan Dashboard'gacha ishlaydi
- [ ] Ikki foydalanuvchi bilan RLS production bazasida qayta tekshirilgan (biri ikkinchisining
      ma'lumotini ko'rmaydi)
- [ ] `keep-alive.yml` workflow "Actions" bo'limida muvaffaqiyatli ishlab turibdi

10-Qavat tugagach, tizim rasman **v1.0.0** deb belgilanadi (roadmap, 10-Qavat).

## Keyingi qadam

10-Qavat tugagach, roadmap bo'yicha keyingi (va oxirgi) bosqich: **11-Qavat — Mobil ilova (React
Native)**, alohida mustaqil roadmap sifatida davom ettiriladi.
