import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
<<<<<<< HEAD
import { useState, useCallback } from "react";
import { useRouter, Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
=======
import { useState, useEffect } from "react";
import { useRouter, Stack } from "expo-router";
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
import { FileText, Trash2, Calendar } from "lucide-react-native";

import { reportService, initDatabase } from "../lib/database";
import { useApp } from "../contexts/AppContext";
import { FishReport } from "../types";

export default function ReportsScreen() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [reports, setReports] = useState<FishReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

<<<<<<< HEAD
  const loadReports = useCallback(async () => {
    if (!currentUser) {
      setReports([]);
=======
  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReports = async () => {
    if (!currentUser) {
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      await initDatabase();
      const userReports = await reportService.getUserReports(currentUser.id);
      setReports(userReports);
    } catch (error) {
      console.error("Failed to load reports:", error);
<<<<<<< HEAD
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // ✅ reload whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );
=======
    } finally {
      setIsLoading(false);
    }
  };
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e

  const handleDeleteReport = (reportId: number) => {
    Alert.alert("Delete Report", "Are you sure you want to delete this report?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await initDatabase();
            const success = await reportService.deleteReport(reportId);
            if (success) {
              setReports((prev) => prev.filter((r) => r.id !== reportId));
              Alert.alert("Success", "Report deleted successfully");
            } else {
              Alert.alert("Error", "Failed to delete report");
            }
          } catch (e) {
            console.error("Delete report error:", e);
            Alert.alert("Error", "Failed to delete report");
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConditionColor = (condition: string) => {
    if (condition === "Normal") return "#4CAF50";
    if (condition === "Stressed") return "#EF5350";
    return "#FF9800";
  };

  const getWaterStatusColor = (status: string) => {
    if (status === "Safe") return "#4CAF50";
    if (status === "Warning") return "#FF9800";
    return "#EF5350";
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
<<<<<<< HEAD
          headerStyle: { backgroundColor: "#0A1929" },
          headerTintColor: "#FFFFFF",
          headerTitle: "Past Reports",
          headerTitleStyle: { fontWeight: "600" },
=======
          headerStyle: {
            backgroundColor: "#0A1929",
          },
          headerTintColor: "#FFFFFF",
          headerTitle: "Past Reports",
          headerTitleStyle: {
            fontWeight: "600",
          },
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
        }}
      />
      <View style={styles.backgroundContainer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <FileText size={40} color="#9C27B0" strokeWidth={2} />
              </View>
              <Text style={styles.title}>Analysis History</Text>
              <Text style={styles.subtitle}>View saved reports</Text>
<<<<<<< HEAD

              <TouchableOpacity onPress={loadReports} style={{ marginTop: 10 }}>
                <Text style={{ color: "#00BCD4", fontWeight: "600" }}>
                  Refresh
                </Text>
              </TouchableOpacity>
=======
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
            </View>

            {isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Loading reports...</Text>
              </View>
            ) : reports.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No reports yet</Text>
                <Text style={styles.emptySubtext}>
                  Analyze fish behavior to create reports
                </Text>
              </View>
            ) : (
              <View style={styles.reportsList}>
                {reports.map((report) => (
                  <View key={report.id} style={styles.reportCard}>
                    <View style={styles.reportHeader}>
                      <View style={styles.dateContainer}>
                        <Calendar size={16} color="#B0BEC5" />
                        <Text style={styles.dateText}>
                          {formatDate(report.createdAt)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteReport(report.id)}
                        style={styles.deleteButton}
                        testID={`delete-report-${report.id}`}
                      >
                        <Trash2 size={20} color="#EF5350" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.reportContent}>
                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Fish Condition:</Text>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                getConditionColor(report.fishCondition) + "30",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: getConditionColor(report.fishCondition) },
                            ]}
                          >
                            {report.fishCondition}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.reportRow}>
                        <Text style={styles.reportLabel}>Water Status:</Text>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                getWaterStatusColor(report.waterStatus) + "30",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: getWaterStatusColor(report.waterStatus) },
                            ]}
                          >
                            {report.waterStatus}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.metricsRow}>
                        <View style={styles.metric}>
                          <Text style={styles.metricLabel}>Temperature</Text>
                          <Text style={styles.metricValue}>
                            {report.temperature}°C
                          </Text>
                        </View>
                        <View style={styles.metric}>
                          <Text style={styles.metricLabel}>pH Level</Text>
                          <Text style={styles.metricValue}>{report.phLevel}</Text>
                        </View>
                      </View>

                      <View style={styles.suggestionContainer}>
                        <Text style={styles.suggestionLabel}>💡 Suggestion:</Text>
                        <Text style={styles.suggestionText}>{report.suggestion}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              testID="back-button"
            >
              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  backgroundContainer: { flex: 1, backgroundColor: "#0A1929" },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: "center", marginTop: 20, marginBottom: 32 },
=======
  backgroundContainer: {
    flex: 1,
    backgroundColor: "#0A1929",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(156, 39, 176, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
<<<<<<< HEAD
  title: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#B0BEC5" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { fontSize: 18, color: "#B0BEC5", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#78909C" },
  reportsList: { gap: 16, paddingBottom: 20 },
=======
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#B0BEC5",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#B0BEC5",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#78909C",
  },
  reportsList: {
    gap: 16,
    paddingBottom: 20,
  },
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
  reportCard: {
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E4976",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E4976",
  },
<<<<<<< HEAD
  dateContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateText: { fontSize: 13, color: "#B0BEC5" },
=======
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    color: "#B0BEC5",
  },
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0A1929",
    justifyContent: "center",
    alignItems: "center",
  },
<<<<<<< HEAD
  reportContent: { gap: 16 },
  reportRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reportLabel: { fontSize: 15, color: "#B0BEC5", fontWeight: "500" },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 14, fontWeight: "600" },
  metricsRow: { flexDirection: "row", gap: 12 },
  metric: { flex: 1, backgroundColor: "#0A1929", padding: 12, borderRadius: 8 },
  metricLabel: { fontSize: 12, color: "#78909C", marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
  suggestionContainer: { backgroundColor: "#0A1929", padding: 12, borderRadius: 8 },
  suggestionLabel: { fontSize: 13, fontWeight: "600", color: "#FFFFFF", marginBottom: 6 },
  suggestionText: { fontSize: 13, color: "#B0BEC5", lineHeight: 18 },
=======
  reportContent: {
    gap: 16,
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportLabel: {
    fontSize: 15,
    color: "#B0BEC5",
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: "#0A1929",
    padding: 12,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: "#78909C",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  suggestionContainer: {
    backgroundColor: "#0A1929",
    padding: 12,
    borderRadius: 8,
  },
  suggestionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 13,
    color: "#B0BEC5",
    lineHeight: 18,
  },
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
  backButton: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
<<<<<<< HEAD
  backButtonText: { fontSize: 16, color: "#00BCD4", fontWeight: "600" },
});
=======
  backButtonText: {
    fontSize: 16,
    color: "#00BCD4",
    fontWeight: "600",
  },
});
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
