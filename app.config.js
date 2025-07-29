import 'dotenv/config';

export default {
  expo: {
    name: "SyncMeet",
    slug: "SyncMeet",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "SyncMeet",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    extra: {
      eas: {
        projectId: "82374afa-decb-4001-b480-3faa5197fced"
      }
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.bakuwale.SyncMeet"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    splash: {
      backgroundColor: "#000000"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#000000"
        }
      ],
      "expo-web-browser",
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#ffffff",
          sounds: [
            "./assets/sounds/notification.wav"
          ]
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0
    }
  }
};