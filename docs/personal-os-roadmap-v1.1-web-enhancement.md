# ROADMAP v1.1: Personal OS — Web Enhancement Bosqichi

> Bu fayl `personal-os-roadmap.md` (v1.0.0, TUGALLANGAN) dan **keyingi** bosqich uchun tayyorlangan yangi qo'shimcha hujjat. U asosiy `personal-os-project-prompt.md` va `personal-os-qoshimcha-qarorlar.md` fayllariga bo'ysunadi, ularni bekor qilmaydi.

## 0. KONTEKST VA DOIRA

**Holat:** v1.0.0 (0—10-qavatlar) to'liq yakunlangan va production'da ishlab turibdi. Tizim funksional jihatdan to'liq: barcha modullar (Goals, Tasks, Calendar, Finance, Habits, Notifications, Dashboard) ishlaydi, deploy qilingan.

**Bu bosqichning maqsadi:** funksional kengaytirish emas, balki **chuqurlashtirish** — tizimni "ishlaydigan prototip"dan "yetuk, silliq, kundalik foydalanishga qulay mahsulot" darajasiga ko'tarish. Aniq yo'nalishlar:

1. Umumiy muhit va infratuzilmani yaxshilash (dev + frontend arxitektura)
2. Umumiy struktura — modullar orasidagi izchillik, shared qatlamni kengaytirish
3. Har bir modulning **ichki ko'rinishi va tartibi** (layout, navigatsiya, ma'lumot zichligi) — chuqurroq UX
4. Dashboard'ni umumlashtirish/shaxsiylashtirish (widget tizimi)
5. **Profile & Settings** — yangi, tizim uchun zaruriy modul
6. Boshqa umumiy vositalar (global qidiruv, tezkor amallar va h.k.)

**QAT'IY CHEGARA:** Bu bosqich **faqat sayt (web/React frontend + kerak bo'lsa backend qo'shimchalari) uchun**. 11-Qavat (React Native mobil ilova) bu hujjatga umuman tegishli emas — u alohida, kechiktirilgan holida qoladi va bu bosqich tugagandan keyin ham, undan mustaqil ravishda boshlanadi. Bu yerdagi hech bir qavat React Native kodi yozmaydi.

**Ishlash prinsipi o'zgarmaydi:** `personal-os-roadmap.md`ning 0-bo'limidagi barcha qoidalar (har qavat = alohida chat, repo — yagona haqiqat manbai, git-workflow qo'shimchasi, responsiv dizayn qo'shimchasi) shu bosqichda ham to'liq amal qiladi. Yangi chat shabloni bir xil qoladi, faqat "N-Qavat" o'rniga shu fayldagi qavat raqami/nomi qo'yiladi.

---

## 1. YANGI PIRAMIDA (v1.1 — faqat web qatlami)

```
                    ┌───────────────────────────────┐
                    │ 18. Web Polish & Release v1.1.0 │
                    ├───────────────────────────────┤
                    │ 17. Performance & Accessibility │
                    │     audit                        │
                    ├───────────────────────────────┤
                    │ 16. Global qidiruv va            │
                    │     tezkor amallar (Command Bar) │
                    ├───────────────────────────────┤
                    │ 15. Modullar ichki UX chuqur-     │
                    │     lashtirish (har biri alohida)│
                    ├───────────────────────────────┤
                    │ 14. Dashboard v2 (widget tizimi,  │
                    │     shaxsiylashtirish)           │
                    ├───────────────────────────────┤
                    │ 13. Design System / UI-kit        │
                    │     (shared component kutubxona) │
                    ├───────────────────────────────┤
                    │ 12. Profile & Settings moduli     │
                    └───────────────────────────────┘
                               ▲
                    v1.0.0 (0—10-qavatlar, tugallangan)
```

Har bir qavat pastdagi qavat repo'da tugallangan holda mavjud bo'lishini talab qiladi (xuddi v1.0.0'dagi kabi). 15-Qavat ichidagi har bir modul (Goals, Tasks, Calendar, Finance, Habits, Notifications) — **mustaqil, parallel bajarilishi mumkin bo'lgan kichik ish birligi**, chunki ular bir-biriga bog'liq emas, faqat 12—14-qavatlarga tayanadi.

---

## 2. QAVATLAR — har biri alohida chat

### [X] 12-QAVAT — Profile & Settings moduli (Holati ijobiy yakunlangan)

**Maqsad:** Foydalanuvchi hozirgacha faqat login/register orqali ko'rinadi — profilini ko'rish, tahrirlash, tizim sozlamalarini (tema, til, bildirishnoma afzalliklari) boshqarish imkoniyati yo'q. Bu qavat shu bo'shliqni to'ldiradi.

**Kirish sharti:** v1.0.0 to'liq tugallangan (Auth va barcha modullar ishlayapti).

**Ushbu qavatda bajariladigan ishlar:**
- Backend: `app/core/` yoki yangi `app/modules/profile/` — foydalanuvchi profili maydonlari (ism, avatar URL, tilga oid tanlov, vaqt zonasi), parolni o'zgartirish endpointi, hisobni o'chirish (soft-delete tavsiya etiladi)
- Backend: foydalanuvchi darajasidagi sozlamalar jadvali (masalan `UserSettings`: tema — light/dark/system, bildirishnoma kanallari yoqiq/o'chiq har bir trigger turi uchun 7-qavatdagi Notifications tuzilmasiga muvofiq)
- Frontend: `src/features/profile/` — profil sahifasi, sozlamalar sahifasi (bo'limlarga bo'lingan: Profil / Xavfsizlik / Bildirishnomalar / Ko'rinish)
- Frontend: **dark/light tema almashtirish** shu yerda joriy qilinadi (CSS custom properties orqali, `App.css`dagi mavjud o'zgaruvchilarni tema-asosli qilish)

**Yakunlanish mezoni (DoD):**
- [ ] Foydalanuvchi profilini ko'rish/tahrirlash ishlaydi
- [ ] Parol o'zgartirish ishlaydi va eski parolni talab qiladi
- [ ] Tema (light/dark) almashtirilganda butun ilova bo'ylab saqlanadi (sahifa yangilanganda ham)
- [ ] Bildirishnoma afzalliklari saqlanadi va Notifications moduli shundan foydalanadi (kamida bitta trigger turi bo'yicha bog'lanish tekshirilgan)

---

### [X] 13-QAVAT — Design System / UI-kit (shared component kutubxonasi) (Holati ijobiy yakunlangan)

**Maqsad:** Hozirgacha har bir modul o'z UI elementlarini (tugma, input, kartochka, modal) alohida-alohida yozgan bo'lishi mumkin. Bu qavat ularni **bitta markazlashtirilgan `src/shared/ui/` qatlamiga** ko'chiradi, kelajakdagi barcha modullar (va React Native ko'chirilganda ham) shundan foydalanadi.

**Kirish sharti:** 12-qavat DoD'i bajarilgan.

**Ushbu qavatda bajariladigan ishlar:**
- `src/shared/ui/` ichida asosiy komponentlar: `Button`, `Input`, `Select`, `Card`, `Modal`, `Badge`, `Tooltip`, `EmptyState`, `LoadingSpinner`, `Toast/Notification-banner`
- Har bir komponent — tema (dark/light)ga mos, responsiv (9-qavat va roadmap-qoshimcha-responsiv-dizayn qoidalariga muvofiq)
- Mavjud modullar (Goals, Tasks, Calendar, Finance, Habits, Notifications, Dashboard) shu komponentlardan foydalanishga **bosqichma-bosqich** o'tkaziladi — bu qavatda hech bo'lmaganda eng ko'p takrorlanadigan 2–3 modul (masalan Goals va Tasks) to'liq ko'chiriladi, qolganlari 15-qavatda modul-bo'yicha ishlanganda ko'chiriladi
- Dizayn tokenlari hujjatlashtiriladi (rang, bo'shliq, tipografiya o'lchamlari — bitta joyda, masalan `src/shared/ui/tokens.css`)

**Yakunlanish mezoni (DoD):**
- [ ] Kamida 8 ta umumiy komponent yaratilgan va kamida 2 ta modulda amalda ishlatilgan
- [ ] Dizayn tokenlari markazlashtirilgan, hech bir komponent hardcoded rang/o'lcham ishlatmaydi
- [ ] Dark/light tema barcha yangi komponentlarda to'g'ri ko'rinadi

---

### [X] 14-QAVAT — Dashboard v2 (widget tizimi, shaxsiylashtirish) (Holati ijobiy yakunlangan)

**Maqsad:** Mavjud Dashboard (8-qavat) statik — barcha widget'lar qattiq tartibda. Bu qavat foydalanuvchiga **qaysi widget ko'rinishi, qanday tartibda** ekanini tanlash imkonini beradi.

**Kirish sharti:** 13-qavat DoD'i bajarilgan (UI-kit mavjud, Dashboard shundan foydalanadi).

**Ushbu qavatda bajariladigan ishlar:**
- Backend: foydalanuvchi darajasidagi Dashboard konfiguratsiyasi (`UserDashboardConfig` — qaysi widget'lar yoqiq, tartib raqami) — 12-qavatdagi `UserSettings` bilan bir xil naqshda
- Frontend: widget'larni sudrab-tashlash (drag-and-drop) orqali qayta tartiblash yoki kamida yoqish/o'chirish checkbox'lari (drag-and-drop — agar vaqt ruxsat bersa, aks holda oddiy tartib-raqam inputi yetarli, murakkablik oshirilmasin)
- Har bir modul uchun kamida 2 xil widget varianti (masalan Finance uchun: "oylik xarajat grafigi" va "so'nggi 5 tranzaksiya")

**Yakunlanish mezoni (DoD):**
- [ ] Foydalanuvchi kamida bitta widget'ni yoqish/o'chirish/tartibini o'zgartirishi mumkin va bu saqlanadi
- [ ] Har bir modul uchun kamida 2 ta widget varianti mavjud
- [ ] Widget'lar UI-kit komponentlaridan foydalanadi (13-qavatga muvofiq)

---

### [X] 15-QAVAT — Modullar ichki UX chuqurlashtirish (har biri mustaqil kichik ish) (Holati ijobiy yakunlangan: 15a-15f barchasi)

**Maqsad:** Har bir mavjud modulning (Goals, Tasks, Calendar, Finance, Habits, Notifications) **ichki ko'rinishi va tartibi**ni chuqur qayta ko'rib chiqish — funksional emas, balki foydalanish tajribasi darajasida. Bu qavat 6 ta mustaqil kichik-qavatga bo'linadi, xohlagan tartibda yoki parallel bajarilishi mumkin.

**Kirish sharti:** 14-qavat DoD'i bajarilgan.

**Har bir modul uchun umumiy ishlanadigan yo'nalishlar (moslashtirilib qo'llaniladi):**
- Ro'yxat ko'rinishlarida filtrlash/saralash/guruhlash imkoniyatlari (masalan Tasks: ustuvorlik/muddat bo'yicha, Finance: kategoriya/sana bo'yicha)
- Bo'sh holatlar (empty states) — har biri modulga xos, foydali harakatga undovchi (masalan "Hali maqsad yo'q — birinchisini yarating")
- Tez amallar (masalan ro'yxatdagi elementni ustiga sichqoncha olib borganda tez tahrirlash/o'chirish tugmalari)
- Modul ichida qidirish (agar ro'yxat katta bo'lsa)
- 13-qavatdagi UI-kit komponentlariga to'liq o'tish (agar 13-qavatda ko'chirilmagan bo'lsa)

**Kichik-qavatlar (mustaqil, alohida chatda bajarilishi mumkin):**
- [X] 15a. Goals — ichki UX (qidiruv nomi/tavsifi bo'yicha, saralash: muddat/progress/nom, bo'sh-natija holati)
- [X] 15b. Tasks — ichki UX (qidiruv nomi bo'yicha, saralash: muddat/ustuvorlik/nom)
- [X] 15c. Calendar — ichki UX (qidiruv orqali voqealarni ajratib ko'rsatish, toolbar UI-kit'ga o'tkazildi, bo'sh oy holati)
- [X] 15d. Finance — ichki UX (tranzaksiyalarda qidiruv/kategoriya filtri/saralash, barcha yon-panellar UI-kit'ga o'tkazildi)
- [X] 15e. Habits — ichki UX (odatlarda qidiruv, HabitCard/ReadingLogPanel/WeeklyReviewPanel/HabitForm UI-kit'ga o'tkazildi)
- [X] 15f. Notifications — ichki UX (turi va o'qilgan/o'qilmagan holat bo'yicha filtr, amallar UI-kit Button'ga o'tkazildi)

**Yakunlanish mezoni (DoD, har bir kichik-qavat uchun alohida):**
- [ ] Modul UI-kit komponentlaridan to'liq foydalanadi
- [ ] Bo'sh holat, yuklanish holati va xato holati barchasi qamrab olingan
- [ ] Filtrlash/saralash (agar modulga tegishli bo'lsa) ishlaydi

---

### [ ] 16-QAVAT — Global qidiruv va tezkor amallar (Command Bar)

**Maqsad:** Barcha modullar bo'ylab bitta joydan qidirish va tezkor navigatsiya (masalan `Ctrl+K` bilan ochiladigan "command palette").

**Kirish sharti:** 15-qavatdagi barcha kichik-qavatlar (15a—15f) tugallangan (har bir modul o'z qidiruv/filtrlash asosini allaqachon o'rnatgan bo'lishi kerak).

**Ushbu qavatda bajariladigan ishlar:**
- Backend: modullar bo'ylab birlashtirilgan qidiruv endpointi (`/search?q=`) — Goals, Tasks, Finance tranzaksiyalari, Habits nomlari bo'yicha oddiy matn qidiruvi (PostgreSQL `ILIKE` yetarli, murakkab full-text search hozircha shart emas)
- Frontend: `Ctrl+K` / `Cmd+K` bilan ochiladigan modal — qidiruv natijalari + tezkor amallar ("Yangi task yaratish", "Yangi tranzaksiya qo'shish" va h.k.)

**Yakunlanish mezoni (DoD):**
- [ ] `Ctrl+K` orqali modal ochiladi, matn kiritilganda barcha modullardan mos natijalar chiqadi
- [ ] Natijaga bosilganda tegishli sahifaga/elementga o'tadi
- [ ] Kamida 3 ta tezkor amal ishlaydi

---

### [ ] 17-QAVAT — Performance & Accessibility audit

**Maqsad:** Funksional to'liqlikdan keyin — tezlik va foydalanish qulayligi (accessibility) bo'yicha tizimli tekshiruv.

**Kirish sharti:** 16-qavat DoD'i bajarilgan.

**Ushbu qavatda bajariladigan ishlar:**
- Frontend bundle hajmini tekshirish, kerak bo'lsa lazy-loading (`React.lazy` + route-based code splitting) joriy qilish
- Ortiqcha API so'rovlarni aniqlash va kamaytirish (masalan Dashboard va har bir modul sahifasida N+1 yoki ortiqcha qayta so'rovlar)
- Asosiy accessibility tekshiruvlari: klaviatura orqali navigatsiya, `aria-label`lar, kontrast nisbati (dark/light ikkalasida ham)
- Lighthouse yoki shunga o'xshash vosita orqali asosiy sahifalarni baholash, natijalarni hujjatlashtirish

**Yakunlanish mezoni (DoD):**
- [ ] Asosiy sahifalar Lighthouse Performance balli 80+ (yoki asosli sabab bilan pastroq)
- [ ] Klaviatura orqali asosiy oqimlar (login, task yaratish, kalendar ko'rish) to'liq bajarilishi mumkin
- [ ] Route-based code splitting joriy qilingan

---

### [ ] 18-QAVAT — Web Polish & Release v1.1.0

**Maqsad:** Yakuniy silliqlash va rasman v1.1.0 sifatida e'lon qilish.

**Kirish sharti:** 17-qavat DoD'i bajarilgan.

**Ushbu qavatda bajariladigan ishlar:**
- Barcha modullar va yangi qo'shilgan Profile/Settings/Dashboard v2/Command Bar o'rtasida vizual va xulq-atvor izchilligini oxirgi marta tekshirish
- Production'ga deploy (mavjud Render/Supabase infratuzilmasi orqali, 10-qavatdagi tuzilmaga muvofiq — yangi infratuzilma qo'shilmaydi)
- Roadmap fayllarida barcha `[x]` belgilarni yangilash

**Yakunlanish mezoni (DoD):**
- [ ] Production URL orqali yangi funksiyalarning barchasi (Profile, Settings, Dashboard v2, Command Bar) ishlaydi
- [ ] Responsiv dizayn qoidalari (roadmap-qoshimcha-responsiv-dizayn.md) yangi qo'shilgan har bir sahifada saqlangan
- [ ] Dark/light tema barcha sahifalarda izchil

**→ Bu qavat tugagach, tizim v1.1.0 deb e'lon qilinadi — 11-Qavat (Mobil ilova) shundan keyin, alohida roadmap sifatida davom etishi mumkin.**

---

## 3. BOG'LIQLIK JADVALI

| Qavat | Bog'liq bo'lgan qavat(lar) | Parallel qilish mumkinmi? |
|---|---|---|
| 12. Profile & Settings | v1.0.0 (to'liq) | Yo'q |
| 13. Design System | 12 | Yo'q |
| 14. Dashboard v2 | 13 | Yo'q |
| 15a–15f. Modullar ichki UX | 14 | Ha, barchasi bir-biriga bog'liq emas |
| 16. Global qidiruv | 15a–15f (barchasi) | Yo'q |
| 17. Performance & A11y | 16 | Yo'q |
| 18. Web Polish & Release | 17 | Yo'q |

---

## 4. NIMA BU BOSQICHGA KIRMAYDI (aniqlik uchun)

- **React Native / mobil ilova** — 11-Qavat, o'z holicha qoladi, bu hujjatga tegishli emas
- **Yangi funksional modul** (masalan "Loyihalar" yoki "Sog'liq") — agar kerak bo'lsa, alohida yangi qo'shimcha fayl sifatida keyinroq qo'shiladi, bu hujjat doirasida emas
- **Backend arxitekturasini tubdan o'zgartirish** (masalan GraphQL'ga o'tish, yangi DB) — texnik stack `qoshimcha-qarorlar.md`da belgilanganicha qoladi, faqat kichik qo'shimchalar (Profile/Settings jadvali, qidiruv endpointi) kiritiladi
