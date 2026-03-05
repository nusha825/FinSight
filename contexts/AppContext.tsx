// contexts/AppContext.tsx
import { useState, useEffect, useRef } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { User, WaterQuality } from "../types";
import { initDatabase } from "../lib/database";
import { API_BASE_URL } from "../lib/api";

export const [AppProvider, useApp] = createContextHook(() => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [waterQuality, setWaterQuality] = useState<WaterQuality>({
    temperature: 0,
    phLevel: 0,
    status: "Safe",
    suggestion: "No data yet",
  });

  // avoid overlapping fetch calls
  const isFetchingRef = useRef(false);

  const fetchLatestWater = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const url = `${API_BASE_URL}/water/latest`;

    try {
      console.log("✅ Fetch:", url);
      const res = await fetch(url, {
        headers: { "Cache-Control": "no-cache" },
      });
      console.log("✅ Status:", res.status);

      const data = await res.json();
      console.log("✅ Data:", data);

      setWaterQuality({
        temperature: data.temperature ?? 0,
        phLevel: data.phLevel ?? 0,
        status: data.status ?? "Safe",
        suggestion: data.suggestion ?? "No data yet",
      });
    } catch (e) {
      console.log("❌ Failed to fetch /water/latest", e);
    } finally {
      isFetchingRef.current = false;
    }
  };

  // init DB + load user
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsDbReady(true);

        const storedUser = await AsyncStorage.getItem("currentUser");
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to initialize app:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // ✅ ALWAYS poll water every 5 seconds (works for emulator + phone)
  useEffect(() => {
    fetchLatestWater();
    const interval = setInterval(fetchLatestWater, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (user: User) => {
    setCurrentUser(user);
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem("currentUser");
  };

  const updateCurrentUser = async (user: User) => {
    setCurrentUser(user);
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  };

  return {
    isDbReady,
    currentUser,
    isLoading,
    waterQuality,
    login,
    logout,
    updateCurrentUser,
    fetchLatestWater,
  };
});