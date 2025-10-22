// app.config.js
export default {
  expo: {
    name: "truelove",
    slug: "truelove",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "truelove",
    userInterfaceStyle: "automatic",

    // 🚫 Clave: desactivar el modo bridgeless
    newArchEnabled: false,
    jsEngine: "hermes",
    runtimeVersion: {
      policy: "appVersion"
    },

    ios: {
      supportsTablet: true
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        backgroundColor: "#E6F4FE"
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ],
      package: "com.edwin21991.truelove"
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },

    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" }
        }
      ],
      "expo-secure-store",
      "expo-camera",
      "expo-barcode-scanner"
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: false // 👈 fuerza el runtime clásico
    }
  }
};
