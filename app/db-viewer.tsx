// app/db-viewer.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter, Stack } from "expo-router";
import { List, Fish, Calendar } from "lucide-react-native";

import { aquariumService, initDatabase } from "../lib/database";
import { useApp } from "../contexts/AppContext";
import { Aquarium } from "../types";

export default function DbViewerScreen() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAquariums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAquariums = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      await initDatabase();
      const rows = await aquariumService.getUserAquariums(currentUser.id);
      setAquariums(rows);
    } catch (e) {
      console.error("DB Viewer load error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "#0A1929" },
          headerTintColor: "#FFFFFF",
          headerTitle: "DB Viewer",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={styles.backgroundContainer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <List size={40} color="#4CAF50" strokeWidth={2} />
              </View>
              <Text style={styles.title}>Saved Aquariums</Text>
              <Text style={styles.subtitle}>Your stored aquarium data</Text>
            </View>

            {isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Loading data...</Text>
              </View>
            ) : aquariums.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No aquarium data found</Text>
                <Text style={styles.emptySubtext}>
                  Add aquarium details from dashboard to see them here.
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {aquariums.map((a) => (
                  <View key={a.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={styles.cardTitleRow}>
                        <Fish size={18} color="#00BCD4" strokeWidth={2} />
                        <Text style={styles.cardTitle}>{a.name}</Text>
                      </View>

                      <View style={styles.dateRow}>
                        <Calendar size={14} color="#78909C" />
                        <Text style={styles.dateText}>{formatDate(a.createdAt)}</Text>
                      </View>
                    </View>

                    <View style={styles.metricsRow}>
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Height</Text>
                        <Text style={styles.metricValue}>{a.height} cm</Text>
                      </View>
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Width</Text>
                        <Text style={styles.metricValue}>{a.width} cm</Text>
                      </View>
                    </View>

                    <View style={styles.metricsRow}>
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Length</Text>
                        <Text style={styles.metricValue}>{a.length} cm</Text>
                      </View>
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Fish Count</Text>
                        <Text style={styles.metricValue}>{a.fishCount}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: { flex: 1, backgroundColor: "#0A1929" },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: "center", marginTop: 20, marginBottom: 24 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#B0BEC5", textAlign: "center" },

  emptyState: {
    backgroundColor: "#132F4C",
    borderWidth: 1,
    borderColor: "#1E4976",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  emptyText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16, marginBottom: 6 },
  emptySubtext: { color: "#B0BEC5", fontSize: 13, textAlign: "center", lineHeight: 18 },

  list: { gap: 14, paddingBottom: 10 },
  card: {
    backgroundColor: "#132F4C",
    borderWidth: 1,
    borderColor: "#1E4976",
    borderRadius: 16,
    padding: 16,
  },
  cardTop: { gap: 8, marginBottom: 12 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateText: { color: "#B0BEC5", fontSize: 13 },

  metricsRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  metric: { flex: 1, backgroundColor: "#0A1929", padding: 12, borderRadius: 10 },
  metricLabel: { fontSize: 12, color: "#78909C", marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  backButton: { height: 56, justifyContent: "center", alignItems: "center", marginBottom: 30, marginTop: 10 },
  backButtonText: { fontSize: 16, color: "#00BCD4", fontWeight: "600" },
});