// Push notification ro'yxatdan o'tkazish — 11-Qavat DoD:
// "Push notification kamida bitta trigger uchun ishlaydi".
//
// Yondashuv: Expo Push Notification xizmati (bepul, Firebase/APNs loyihasi
// alohida sozlashni talab qilmaydi — real qurilmada ishlashi uchun
// `eas build` orqali quriladigan build kifoya). Bu qoshimcha-qarorlar.md'da
// ko'zda tutilgan "Firebase Cloud Messaging" arxitekturasining amaliy
// muqobili: Expo push xizmati orqada aynan FCM (Android) va APNs (iOS)dan
// foydalanadi, lekin loyihaga alohida Firebase konsolida loyiha ochish,
// google-services.json qo'shish kabi qo'shimcha bosqichlarni talab
// qilmaydi — $0-byudjet va soddalik tamoyiliga (qoshimcha-qarorlar.md,
// 5-bo'lim) mos keladi. Agar kelajakda xom FCM kerak bo'lsa, bu fayl
// almashtiriladi — backend tomon (`app/core/push.py`) shu almashtirishni
// izolyatsiya qiladi.
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Foydalanuvchidan push-ruxsat so'raydi, Expo push tokenini oladi va
 * `authFetch` orqali backend'ga (`POST /auth/push-token`) yuboradi.
 * Simulyator/emulyatorda yoki ruxsat berilmaganda jim ravishda hech narsa
 * qilmaydi — ilovaning qolgan qismini bloklamaydi.
 */
export async function registerForPushNotificationsAsync(authFetch) {
  if (!Device.isDevice) {
    // Simulyator/emulyatorda push token ololmaymiz — kutilgan holat.
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenResponse.data;

  try {
    await authFetch("/auth/push-token", {
      method: "POST",
      body: { push_token: expoPushToken },
    });
  } catch {
    // Token backend'ga yozilmasa ham ilova ishlashda davom etadi —
    // faqat push bildirishnoma kelmaydi.
  }

  return expoPushToken;
}
