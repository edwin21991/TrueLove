// utils/notifications.js
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";

// Configurar cómo se muestran las notificaciones cuando llegan
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) {
      console.log("⚠️ No es un dispositivo físico; no se puede registrar para notificaciones.");
      return null;
    }

    // Pedir permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Permisos no concedidos para notificaciones.");
      return null;
    }

    // 👇 Aquí el cambio importante:
    // Obtener el projectId manualmente (necesario en EAS y producción)
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId ||
      "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"; // Reemplaza con tu ID real

    // Obtener el token
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log("✅ Expo push token:", token);
    return token;
  } catch (e) {
    console.error("registerForPushNotificationsAsync error", e);
    return null;
  }
}

// 🕓 Programar una notificación local
export async function scheduleLocalNotification({ title, body, date, data = {} }) {
  try {
    const trigger = date instanceof Date ? date : new Date(date);
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger,
    });
    return id;
  } catch (e) {
    console.error("scheduleLocalNotification error", e);
    return null;
  }
}
