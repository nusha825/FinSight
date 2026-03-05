<<<<<<< HEAD
// app/_layout.tsx
=======
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppProvider } from "../contexts/AppContext";
import { initDatabase } from "../lib/database";

<<<<<<< HEAD
SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore if it's already prevented
});

const queryClient = new QueryClient();

=======

SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore if it's already prevented
});

const queryClient = new QueryClient();

>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, headerBackTitle: "Back" }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="dashboard" />
<<<<<<< HEAD

      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="db-viewer" />

=======
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      <Stack.Screen name="add-aquarium" />
      <Stack.Screen name="fish-behavior" />
      <Stack.Screen name="water-quality" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="+not-found" />
    </Stack>
<<<<<<< HEAD
=======
  );
}

export default function RootLayout() {
  useEffect(() => {
    const prepare = async () => {
      try {
        // Ensure SQLite is ready before any screen tries to use it
        await initDatabase();
      } catch (e) {
        console.error("Database init error:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <RootLayoutNav />
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
  );
}

export default function RootLayout() {
  useEffect(() => {
    const prepare = async () => {
      try {
        await initDatabase();
      } catch (e) {
        console.error("Database init error:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <RootLayoutNav />
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}