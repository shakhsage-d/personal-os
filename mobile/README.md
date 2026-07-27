# Personal OS — Mobil ilova (React Native / Expo)

11-Qavat (roadmap): v1.0.0 production'dan keyingi bosqich. Backend allaqachon
API-first qurilgani uchun (`backend/`), bu ilova xuddi shu API'dan
foydalanadi — backend'da hech qanday o'zgarish talab qilinmaydi (push-token
ro'yxatdan o'tkazish endpointidan tashqari, pastga qarang).

## MVP qamrovi (ushbu bosqich)

- Auth: ro'yxatdan o'tish, kirish, sessiyani qurilmada saqlash (SecureStore)
- **Goals** moduli: ro'yxat, yaratish, tafsilotlar (bosqichlar bilan), o'chirish
- **Tasks** moduli: ro'yxat (mustaqil "Vazifalar" tab), maqsad ichida ko'rsatish,
  yaratish/tahrirlash/o'chirish, bajarildi belgilash
- Push notification: kamida bitta trigger (`task_due`) uchun ishlaydi

Calendar/Finance/Habits/Notifications/Dashboard modullari mobilga keyingi
qadamda, xuddi shu naqsh bo'yicha qo'shiladi (roadmap 11-Qavat, "Ushbu
qavatda bajariladigan ishlar" bandiga muvofiq — bu yerda ataylab MVP
doirasida qoldirilgan).

## Tuzilma

```
mobile/
  App.js
  src/
    shared/
      api/client.js         # umumiy fetch client (frontend/shared/api bilan bir xil naqsh)
      auth/AuthContext.jsx  # auth holati — SecureStore orqali saqlanadi (web'dan farqli, pastga qarang)
      notifications/registerPushToken.js
    features/
      auth/       # Login, Register ekranlari
      goals/      # ro'yxat, tafsilot, forma + API chaqiruvlari
      tasks/      # ro'yxat, forma, qayta ishlatiladigan TaskRow + API chaqiruvlari
    navigation/RootNavigator.jsx
```

## Web frontend'dan ataylab farq qilingan joy

`frontend/src/shared/auth/AuthContext.jsx`da tokenlar faqat React state
(xotira)da saqlanadi — XSS xavfi tufayli. Mobil ilovada bu xavf yo'q (kod
tashqi veb-sahifadan yuklanmaydi), shuning uchun tokenlar `expo-secure-store`
orqali (iOS Keychain / Android Keystore, shifrlangan) saqlanadi — bu
foydalanuvchiga ilovani yopib-ochganda qayta login qilishni talab qilmaydi.
Boshqa hamma joyda (`api/client.js`, `authFetch` naqshi, feature-papka
tuzilmasi) web bilan bir xil.

## Push notification — texnik qaror

`personal-os-qoshimcha-qarorlar.md`da kelajakdagi arxitektura sifatida
Firebase Cloud Messaging ko'zda tutilgan edi. Bu bosqichda o'rniga **Expo
Push Notification xizmati** tanlandi:

| | Expo Push | Xom FCM |
|---|---|---|
| Sozlash | Qo'shimcha konsol/loyiha kerak emas | Firebase loyihasi, `google-services.json`, konfiguratsiya kerak |
| Narx | Bepul | Bepul, lekin sozlash vaqti ko'proq |
| Orqa tomon | FCM (Android) + APNs (iOS)ni o'zi boshqaradi | To'g'ridan-to'g'ri o'zingiz boshqarasiz |

$0-byudjet va soddalik tamoyiliga (qoshimcha-qarorlar.md, 5-bo'lim) ko'ra
Expo Push tanlandi. Agar kelajakda xom FCM zarur bo'lsa (masalan, Expo'dan
tashqari native funksiyalar kerak bo'lganda), almashtirish faqat
`src/shared/notifications/registerPushToken.js` va backend'dagi
`app/core/push.py` fayllarida izolyatsiya qilingan — boshqa hech narsaga
tegmaydi.

## Backend'ga qo'shilgan minimal o'zgarish

Roadmap DoD ("push notification kamida bitta trigger uchun ishlaydi")ni
bajarish uchun `backend/`ga quyidagi **qo'shimcha** (mavjud modullarni
qayta yozmasdan) kiritildi:

- `User` modeliga `push_token` ustuni (migratsiya `0008_push_tokens.py`)
- `POST /auth/push-token` endpointi — mobil ilova login bo'lgach shu orqali
  o'z Expo push tokenini ro'yxatdan o'tkazadi
- `app/core/push.py` — Expo Push API'ga so'rov yuboruvchi yordamchi funksiya
- `app/modules/notifications/service.py`dagi `create_notification`
  funksiyasi bildirishnoma yaratilgach shu funksiyani chaqiradi (best-effort:
  xato bo'lsa ham bildirishnoma yozuvi saqlanib qoladi, faqat push
  yuborilmaydi)

## Ishga tushirish

```powershell
cd mobile
npm install
copy .env.example .env
# .env ichida EXPO_PUBLIC_API_BASE_URL'ni backend manzilingizga moslang
npm run start
```

So'ng Expo Go ilovasi (haqiqiy qurilmada) yoki Android/iOS
emulyator/simulyator orqali oching. **Eslatma:** push notification faqat
haqiqiy qurilmada ishlaydi (`expo-device`ning `Device.isDevice` tekshiruvi
shuning uchun kiritilgan) — emulyator/simulyatorda push token so'ralmaydi,
bu kutilgan holat.

## Keyingi qadamlar (ushbu bosqich doirasidan tashqari)

- Calendar, Finance, Habits, Notifications, Dashboard modullarini xuddi shu
  naqsh (`features/<modul>/api.js` + ekranlar) bilan qo'shish
- Sana kiritish uchun native date-picker (`@react-native-community/
  datetimepicker`) — hozircha matn maydoni orqali (MVP soddaligi)
- `eas build` orqali haqiqiy APK/IPA qurish va push notification'ni haqiqiy
  qurilmada sinovdan o'tkazish
