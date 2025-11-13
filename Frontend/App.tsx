import React, { useCallback, useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import api from "./src/services/api";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Function to register for push notifications
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    try {
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId:
            Constants.expoConfig?.extra?.eas?.projectId || "your-project-id",
        })
      ).data;

      console.log("✅ Push notification token:", token);
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

// Component that handles notifications after authentication
function NotificationHandler() {
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      // Register for push notifications
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          try {
            // Send token to backend with platform info
            const platform = Platform.OS === "ios" ? "ios" : "android";
            const deviceName = Device.deviceName || "Unknown Device";
            await api.notifications.registerToken(token, platform, deviceName);
            console.log("✅ Push token registered with backend");
          } catch (error) {
            console.error("Failed to register push token:", error);
          }
        }
      });

      // Listen for notifications received while app is in foreground
      const notificationListener =
        Notifications.addNotificationReceivedListener((notification: any) => {
          console.log("📱 Notification received:", notification);
          // You can show a custom in-app notification here if desired
        });

      // Listen for user tapping on notifications
      const responseListener =
        Notifications.addNotificationResponseReceivedListener(
          (response: any) => {
            console.log("👆 Notification tapped:", response);

            // Handle navigation based on notification type
            const notificationType =
              response.notification.request.content.data.type;

            switch (notificationType) {
              case "task_reminder":
                // Navigate to tasks screen
                break;
              case "achievement":
                // Navigate to badges screen
                break;
              case "level_up":
                // Navigate to profile screen
                break;
              case "streak_risk":
                // Navigate to habits screen
                break;
              default:
                // Default behavior
                break;
            }
          }
        );

      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    }
  }, [session]);

  return null;
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync(MaterialCommunityIcons.font);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <NotificationHandler />
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
