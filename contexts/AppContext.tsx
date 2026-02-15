import { useState, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { User, WaterQuality } from "../types";
import { initDatabase } from "../lib/database";

export const [AppProvider, useApp] = createContextHook(() => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [waterQuality, setWaterQuality] = useState<WaterQuality>({
    temperature: 25.0,
    phLevel: 7.0,
    status: "Safe",
    suggestion: "Water quality is optimal",
  });

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsDbReady(true);

        const storedUser = await AsyncStorage.getItem("currentUser");
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const temp = 22 + Math.random() * 6;
      const ph = 6.5 + Math.random() * 2;

      let status: "Safe" | "Warning" | "Dangerous" = "Safe";
      let suggestion = "Water quality is optimal";

      if (temp < 24 || temp > 28 || ph < 6.8 || ph > 7.5) {
        status = "Warning";
        suggestion = "Water quality dropping, consider partial change";
      }

      if (temp < 22 || temp > 30 || ph < 6.5 || ph > 8.0) {
        status = "Dangerous";
        suggestion = "Immediate water change needed!";
      }

      setWaterQuality({
        temperature: parseFloat(temp.toFixed(1)),
        phLevel: parseFloat(ph.toFixed(1)),
        status,
        suggestion,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const login = async (user: User) => {
    setCurrentUser(user);
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem("currentUser");
  };

  return {
    isDbReady,
    currentUser,
    isLoading,
    waterQuality,
    login,
    logout,
  };
});
