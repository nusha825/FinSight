<<<<<<< HEAD
// contexts/AppContext.tsx
import { useState, useEffect, useRef } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { User, WaterQuality } from "../types";
import { initDatabase } from "../lib/database";
<<<<<<< HEAD
import { API_BASE_URL } from "../lib/api";
=======
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e

export const [AppProvider, useApp] = createContextHook(() => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [waterQuality, setWaterQuality] = useState<WaterQuality>({
<<<<<<< HEAD
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
=======
    temperature: 25.0,
    phLevel: 7.0,
    status: "Safe",
    suggestion: "Water quality is optimal",
  });

>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsDbReady(true);

        const storedUser = await AsyncStorage.getItem("currentUser");
<<<<<<< HEAD
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to initialize app:", e);
=======
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      } finally {
        setIsLoading(false);
      }
    };
<<<<<<< HEAD
    init();
  }, []);

  // ✅ ALWAYS poll water every 5 seconds (works for emulator + phone)
  useEffect(() => {
    fetchLatestWater();
    const interval = setInterval(fetchLatestWater, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
=======

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
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e

  const login = async (user: User) => {
    setCurrentUser(user);
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem("currentUser");
  };

<<<<<<< HEAD
  const updateCurrentUser = async (user: User) => {
    setCurrentUser(user);
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  };

=======
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
  return {
    isDbReady,
    currentUser,
    isLoading,
    waterQuality,
    login,
    logout,
<<<<<<< HEAD
    updateCurrentUser,
    fetchLatestWater,
  };
});
=======
  };
});
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
