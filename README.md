# 14-Qavat: Dashboard v2 — qo'llash yo'riqnomasi

Bu papkadagi fayllarni repo'dagi bir xil yo'lga (nisbiy path bir xil)
ko'chiring va quyidagi tartibda bajaring.

## Yangi fayllar
- `backend/app/modules/dashboard/models.py`
- `backend/app/modules/dashboard/catalog.py`
- `backend/alembic/versions/0011_dashboard_widget_config.py`
- `frontend/src/features/dashboard/widgetRegistry.js`
- `frontend/src/features/dashboard/components/DashboardSettingsModal.jsx`

## O'zgartirilgan fayllar (mavjudlarini almashtiring)
- `backend/app/modules/dashboard/schemas.py`
- `backend/app/modules/dashboard/service.py`
- `backend/app/modules/dashboard/router.py`
- `frontend/src/features/dashboard/api.js`
- `frontend/src/features/dashboard/DashboardPage.jsx`
- `frontend/src/features/dashboard/components/GoalsWidget.jsx`
- `frontend/src/features/dashboard/components/TasksWidget.jsx`
- `frontend/src/features/dashboard/components/CalendarWidget.jsx`
- `frontend/src/features/dashboard/components/FinanceWidget.jsx`
- `frontend/src/features/dashboard/components/HabitsWidget.jsx`
- `frontend/src/features/dashboard/components/NotificationsWidget.jsx`
- `frontend/src/App.css` (faqat qo'shilgan bloklar bor — mavjud fayl bilan
  solishtirib, "14-Qavat: Dashboard v2" izohli bloklarni qo'shing, boshqa
  narsani o'zgartirmang)

## Qo'llash tartibi

1. Fayllarni ko'chiring (yuqoridagi ro'yxat).
2. Backend: yangi migratsiyani ishga tushiring:
   ```
   cd backend
   alembic upgrade head
   ```
3. Frontend: qo'shimcha kutubxona kerak emas, `npm run build`/`npm run dev`
   bilan sinab ko'ring.
4. Sinov qilingan narsalar (mening tomonimdan):
   - Backend: barcha fayllar `py_compile`dan o'tgan, haqiqiy loyihaviy
     `requirements.txt` o'rnatilib, `app.main:app` xatosiz yuklangan,
     `GET /dashboard/summary`, `GET /dashboard/config`,
     `PUT /dashboard/config` OpenAPI sxemasida to'g'ri ko'ringan.
   - Katalog mantiqi (`catalog.py`): har bir modulda aniq 2 tadan widget
     varianti borligi, `merge_with_catalog()` eskirgan kalitlarni olib
     tashlashi va yangi katalog itemlarini qo'shishi units-test bilan
     tekshirilgan.
   - Frontend: `npm run build` muvaffaqiyatli, `oxlint` 0 xato/ogohlantirish
     bilan o'tgan.
   - **Sinovdan o'tmagan**: haqiqiy Postgres bazasiga qarshi (RLS siyosati
     ishlashi, real foydalanuvchi bilan config saqlash/o'qish) — buni real
     dev muhitingizda tekshirish tavsiya etiladi.
5. Roadmap fayli (`personal-os-roadmap-v1.1-web-enhancement.md`) sizning
   Claude loyihangizda saqlangani uchun men uni to'g'ridan-to'g'ri
   tahrirlay olmadim — 14-Qavat oldidagi `[ ]`ni o'zingiz `[x]`ga
   o'zgartiring (bandning o'zi: "14-QAVAT — Dashboard v2 (widget tizimi,
   shaxsiylashtirish)").
6. Commit + push (masalan):
   ```
   git add -A
   git commit -m "14-Qavat: Dashboard v2 - widget tizimi va shaxsiylashtirish"
   git push
   ```

## Qisqacha nima qo'shildi

- Backend: `UserDashboardConfig` jadvali (1:1, JSONB `widgets` ustuni,
  `UserSettings` bilan bir xil naqsh), widget katalogi (har bir modulda
  2 tadan variant), `GET/PUT /dashboard/config` endpointlari.
- Frontend: 6 ta yangi widget-variant komponenti, `widgetRegistry.js`
  orqali widget_key -> komponent bog'lanishi, `DashboardSettingsModal`
  (UI-kit `Modal`/`Button`/`Input` orqali) — checkbox (yoqish/o'chirish) +
  tartib-raqam input (`position`), drag-and-drop emas (roadmap
  "murakkablik oshirilmasin" tamoyiliga muvofiq).
