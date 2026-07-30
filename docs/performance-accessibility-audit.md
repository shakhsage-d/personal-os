# 17-QAVAT — Performance & Accessibility Audit

> Repo: https://github.com/shakhsage-d/personal-os
> Kirish sharti tekshiruvi: 16-Qavat (Global qidiruv, Command Bar) repo'da
> to'liq mavjud va ishlayapti — `search` moduli backend/frontend'da bor,
> `Ctrl+K` `App.jsx`da ulangan. Shu asosda 17-Qavat boshlandi.

Bu hujjat brauzer ichidagi to'liq Lighthouse ishga tushirish imkoni
bo'lmagan muhitda (bosh sahifasiz, headless-brauzersiz konteyner)
o'tkazilgan **qo'lda audit** natijalarini qayd etadi: haqiqiy production
build chiqishi tahlil qilindi, kod bazasi N+1/ortiqcha-so'rov naqshlariga
qarab ko'rib chiqildi, va WCAG kontrast/klaviatura/fokus talablari qo'lda
tekshirildi. Lighthouse-uslubidagi raqamli ball emas, balki uning tekshirgan
mezonlari (bundle hajmi, code-splitting, asosiy oqimlar klaviaturada
ishlashi, kontrast) bo'yicha aniq o'lchov va tuzatishlar berilgan.

---

## 1. Frontend bundle hajmi — TOPILDI VA TUZATILDI

**Muammo:** `frontend/vite.config.js`da hech qanday chunking sozlamasi yo'q
edi va `App.jsx` barcha 9 ta sahifa komponentini (`Login`, `Register`,
`Dashboard`, `Goals`, `Tasks`, `Calendar`, `Finance`, `Habits`, `Profile`)
oddiy (statik) `import` bilan yuklar edi. Natijada `echarts`/`echarts-for-react`
(faqat Finance sahifasida kerak) ham har bir foydalanuvchi uchun, hatto
faqat login sahifasini ko'rsa ham, boshidanoq yuklanardi.

**O'lchov (haqiqiy `vite build`, o'zgarishdan oldin):**

| Fayl | Hajm (raw) | Hajm (gzip) |
|---|---|---|
| `index-*.js` (yagona bundle) | 1,415.61 kB | 458.50 kB |

**O'lchov (o'zgarishdan keyin — route-based code splitting + manualChunks):**

| Chunk | Hajm (raw) | Hajm (gzip) | Qachon yuklanadi |
|---|---|---|---|
| `index-*.js` (asosiy) | 21.67 kB | 6.93 kB | Har doim |
| `vendor-react-*.js` | 178.66 kB | 56.12 kB | Har doim |
| `LoginPage-*.js` | 1.16 kB | 0.59 kB | Faqat login ekranida |
| `RegisterPage-*.js` | 1.60 kB | 0.73 kB | Faqat ro'yxatdan o'tishda |
| `GoalsPage-*.js` | 7.34 kB | 2.53 kB | Faqat "Maqsadlar"ga o'tganda |
| `TasksPage-*.js` | 3.40 kB | 1.46 kB | Faqat "Vazifalar"ga o'tganda |
| `CalendarPage-*.js` | 3.57 kB | 1.58 kB | Faqat "Kalendar"ga o'tganda |
| `HabitsPage-*.js` | 9.65 kB | 2.96 kB | Faqat "Odatlar"ga o'tganda |
| `ProfilePage-*.js` | 8.65 kB | 2.90 kB | Faqat "Profil"ga o'tganda |
| `DashboardPage-*.js` | 16.18 kB | 3.49 kB | Faqat "Bosh sahifa"da |
| `FinancePage-*.js` | 16.86 kB | 4.63 kB | Faqat "Moliya"ga o'tganda |
| `vendor-charts-*.js` (echarts) | 918.27 kB | 302.64 kB | **Faqat** Finance sahifasi ochilganda |

**Natija:** birinchi yuklanishda (masalan login ekrani yoki Goals sahifasi)
foydalanuvchi endi ~458 kB gzip o'rniga **~60–70 kB gzip** kod yuklaydi —
og'ir `echarts` kutubxonasi faqat haqiqatan Finance sahifasiga kirilganda
tarmoqdan so'raladi.

**Qilingan o'zgarishlar:**
- `frontend/src/App.jsx` — barcha 9 ta sahifa komponenti `React.lazy()` +
  bitta umumiy `<Suspense fallback={<Spinner .../>}>` orqali yuklanadigan
  qilindi (mavjud `Spinner` komponenti qayta ishlatildi, yangi UI
  qo'shilmadi). Har doim ko'rinadigan header elementlari
  (`NotificationsBell`, `CommandBar`) ataylab eager qoldirildi — ular
  baribir har bir sahifada zarur, lazy qilish faqat kechikish qo'shardi.
- `frontend/vite.config.js` — `build.rollupOptions.output.manualChunks`
  orqali `echarts` → `vendor-charts`, React/ReactDOM → `vendor-react`
  alohida chunklarga ajratildi (brauzer keshi samaraliroq ishlashi uchun).
- `frontend/index.html` — `<title>frontend</title>` va `lang="en"`
  (quyida 3-bandda ham izohlangan) tuzatildi.

---

## 2. Ortiqcha API so'rovlar / N+1 — AUDIT NATIJASI: jiddiy muammo topilmadi

Backend'dagi barcha ro'yxat-qaytaruvchi service funksiyalari tekshirildi:

- `tasks/service.py` — `selectinload(Task.goal)` ANIQ qo'llangan (3-Qavat
  DoD'iga muvofiq, N+1 oldini olish uchun maxsus yozilgan).
- `finance/service.py` — `selectinload(Transaction.category)` va
  `selectinload(Budget.category)` ANIQ qo'llangan.
- `goals/models.py` — `Goal.milestones` uchun `lazy="selectin"` o'rnatilgan.
- `dashboard/service.py` — 8-Qavat naqshiga muvofiq, o'z jadvalini
  o'qimaydi, faqat mavjud modul-servislarini (yuqoridagilar) chaqiradi —
  demak ularning N+1-himoyasidan bilvosita foydalanadi.

Frontend tomonda tekshirilgan naqshlar:
- `CommandBar.jsx` — qidiruv so'rovi **debounce** qilingan (300ms),
  bo'sh matnda so'rov yuborilmaydi.
- `NotificationsBell.jsx` — fon-yangilanish 60 soniyada bir marta (haddan
  tashqari tez emas), panel ochilgandagina to'liq ro'yxat so'raladi.
- `DashboardPage.jsx` — `summary` va `config` **parallel**
  (`Promise.all`) so'raladi, ketma-ket emas.

**Xulosa:** avvalgi qavatlar (3, 5, 8, 16) davomida N+1 va ortiqcha-so'rov
masalalari allaqachon ongli tarzda hal qilingan edi — bu qavatda yangi
backend/so'rov-optimallashtirish o'zgarishi kiritilmadi, chunki kiritish
mavjud, ishlab turgan kodni asossiz qayta yozish bo'lardi (roadmap
git-workflow qoidasi: "faqat kerakli narsa qo'shiladi").

---

## 3. Accessibility — TOPILGAN VA TUZATILGAN MUAMMOLAR

### 3.1. `<html lang="en">` — sahifa tili noto'g'ri belgilangan
Butun ilova interfeysi o'zbek tilida (WCAG 3.1.1 "Language of Page"),
lekin `index.html`da `lang="en"` turardi — bu skrin-riderlarga noto'g'ri
talaffuz qoidasini yuklaydi. **Tuzatildi:** `lang="uz"`.

### 3.2. Generic `<title>frontend</title>`
Brauzer tab sarlavhasi umumiy `vite` default qiymati edi. **Tuzatildi:**
`<title>Personal OS</title>` + qisqa `<meta name="description">`.

### 3.3. Modal — fokus "chiqib ketishi" mumkin edi (focus trap yo'q edi)
`shared/ui/Modal.jsx` Escape va tashqariga bosishni to'g'ri boshqargan,
lekin ikki narsa yetishmas edi:
- **Focus trap:** `Tab` bosilganda fokus modal chegarasidan chiqib,
  orqadagi sahifaga o'tib ketishi mumkin edi.
- **Fokusni qaytarish:** modal yopilganda fokus hech qayerga
  qaytarilmasdi (klaviatura/skrin-rider foydalanuvchisi "yo'qolib qolardi").

**Tuzatildi:** `Modal.jsx`ga (a) ochilishdan oldingi faol elementni
saqlab, yopilganda unga fokusni qaytaruvchi, va (b) `Tab`/`Shift+Tab`ni
modal ichidagi birinchi/oxirgi fokuslanadigan elementga aylantiruvchi
mantiq qo'shildi. Bu — barcha modal-asosidagi oqimlarga (Dashboard
sozlash, va h.k.) avtomatik tarqaladi, chunki ular umumiy `Modal`
komponentidan foydalanadi.

### 3.4. Bildirishnomalar paneli — Escape bilan yopilmasdi
`NotificationsBell.jsx`dagi ochiladigan panel faqat tashqariga bosish
orqali yopilardi, Escape ishlamasdi (Modal komponentidan farqli).
**Tuzatildi:** `Escape` tugmasi endi panelni ham yopadi.

### 3.5. Rang kontrasti — qo'lda WCAG hisob-kitob (tekshirildi, muammo topilmadi)
`shared/ui/tokens.css`dagi asosiy matn/fon juftliklari WCAG AA (4.5:1,
oddiy matn uchun) mezoniga solishtirib hisoblandi:

| Juftlik (light) | Nisbat | AA (4.5:1) |
|---|---|---|
| `--pos-text` / `--pos-surface` | 15.52 : 1 | ✅ |
| `--pos-muted` / `--pos-surface` | 4.83 : 1 | ✅ |
| `--pos-primary` / oq fon | 5.17 : 1 | ✅ |
| `--pos-danger` / oq fon | 6.47 : 1 | ✅ |
| badge-info matn/fon | 5.49 : 1 | ✅ |
| badge-warning matn/fon | 6.37 : 1 | ✅ |

| Juftlik (dark) | Nisbat | AA (4.5:1) |
|---|---|---|
| `--pos-text` / `--pos-surface` | 13.32 : 1 | ✅ |
| `--pos-muted` / `--pos-surface` | 6.50 : 1 | ✅ |
| `--pos-primary` / `--pos-page-bg` | 5.01 : 1 | ✅ |

**Kichik eslatma (o'zgartirilmadi):** `--pos-border-hover` (`#c7c7c7`) oq
fonga nisbatan ~1.7:1 kontrastga ega — bu matn emas, faqat interaktiv
element chegarasi (hover holati) bo'lgani, va asosiy fokus-ko'rsatkichi
sifatida ishlatilmagani uchun WCAG 1.4.11 (non-text, 3:1) talabiga
majburiy tortilmaydi, lekin kelajakda "focus-visible" holatlar alohida
ko'rib chiqilishi mumkin.

### 3.6. Klaviatura orqali asosiy oqimlar — qo'lda tekshirildi
Kod darajasida quyidagilar tasdiqlandi (barcha interaktiv elementlar
haqiqiy `<button>`/`<input>`/`<select>` — `div onClick` naqshi
ishlatilmagan, demak standart brauzer klaviatura-navigatsiyasi ishlaydi):
- **Login:** email/parol inputlari + submit tugmasi — Tab/Enter orqali
  to'liq bosib o'tiladi.
- **Task yaratish:** forma inputlari standart HTML elementlari.
- **Kalendar ko'rish:** navigatsiya tugmalari (`link-button`/`Button`)
  fokuslanadigan.
- **Command Bar (`Ctrl+K`):** yuqori/past strelka + Enter bilan tanlash
  allaqachon 16-Qavatda amalga oshirilgan va ishlaydi.
- **Modal oqimlari** (Dashboard sozlash va h.k.): 3.3-bandda tuzatilgan
  focus-trap bilan endi to'liq izchil.

---

## 4. Route-based code splitting — DoD holati

`personal-os-roadmap-v1.1-web-enhancement.md`dagi 17-Qavat talabiga
muvofiq: loyihada `react-router` yo'q (App.jsx'dagi `view` state
navigatsiyani boshqaradi — bu arxitektura o'zgartirilmadi, faqat mavjud
holatga mos "route-based" ekvivalenti qo'llanildi). Har bir "sahifa"
`React.lazy()` orqali alohida chunk sifatida ajratildi (1-bandga qarang).

---

## 5. Yakuniy xulosa — DoD bo'yicha

- [x] Frontend bundle hajmi tekshirildi, **route-based code splitting**
      (`React.lazy` + route-ekvivalent `view`-asosli Suspense) joriy
      qilindi — asosiy yuklanish ~458 kB gzip'dan ~60–70 kB gzip'ga tushdi.
- [x] Ortiqcha API so'rovlar/N+1 aniqlash bo'yicha audit o'tkazildi —
      mavjud kod bazasi allaqachon to'g'ri optimallashtirilgan
      (`selectinload`, debounce, parallel so'rovlar); yangi muammo
      topilmadi, shuning uchun backend/so'rov mantig'iga tegilmadi.
- [x] Asosiy accessibility tekshiruvlari o'tkazildi: klaviatura
      navigatsiyasi (mavjud, standart HTML elementlar orqali), `aria-label`
      qamrovi (ko'pchiligi allaqachon mavjud edi), kontrast nisbati
      (light/dark, qo'lda WCAG formulasi bilan hisoblangan — barchasi AA
      darajasidan o'tadi). Topilgan aniq kamchiliklar (til atributi,
      sarlavha, modal fokus-trap, panel Escape) tuzatildi.
- [x] Lighthouse xuddi shu vositaning o'zi ishga tushirilmadi (headless
      brauzer muhiti mavjud emas), lekin uning asosiy mezonlari (bundle
      hajmi, code-splitting, kontrast, klaviatura) qo'lda va haqiqiy build
      chiqishi orqali o'lchandi va hujjatlashtirildi — natijalar yuqorida.

**Tavsiya (keyingi qavatlar uchun, bu qavat doirasidan tashqarida):**
loyiha production'ga qayta deploy qilinganda, haqiqiy brauzer orqali
Chrome DevTools Lighthouse'ni bir marta ishga tushirib, shu yerdagi qo'lda
o'lchovlarni raqamli ball bilan tasdiqlash foydali bo'ladi (18-Qavat, Web
Polish & Release doirasida qilinishi mumkin).
