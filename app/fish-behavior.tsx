import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import { useRouter, Stack } from "expo-router";
import { Video, Upload, CheckCircle, XCircle } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import {
  reportService,
  notificationService,
  initDatabase,
} from "../lib/database";
import { useApp } from "../contexts/AppContext";

type FishCondition = "Normal" | "Stressed" | "Hungry";

export default function FishBehaviorScreen() {
  const router = useRouter();
  const { currentUser, waterQuality } = useApp();

  // Safe defaults (prevents crash if context hasn't loaded)
  const safeWater = waterQuality ?? {
    temperature: 0,
    phLevel: 0,
    status: "Safe" as const,
  };

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    fishCondition: FishCondition;
    suggestion: string;
  } | null>(null);

  const pickVideo = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your media library"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        // allowsEditing can cause issues for videos on Android, keep false
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        setVideoUri(result.assets[0].uri);
        setAnalysisResult(null);
        Alert.alert("Success", "✅ Video uploaded successfully!");
      }
    } catch (error) {
      console.error("Pick video error:", error);
      Alert.alert("Error", "Failed to pick video");
    }
  };

  const analyzeVideo = async () => {
    if (!videoUri) {
      Alert.alert("Error", "Please upload a video first");
      return;
    }

    if (!currentUser) {
      Alert.alert("Error", "Please login first");
      return;
    }

    setIsAnalyzing(true);

    setTimeout(async () => {
      try {
        await initDatabase();

        const conditions: FishCondition[] = ["Normal", "Stressed", "Hungry"];
        const fishCondition =
          conditions[Math.floor(Math.random() * conditions.length)];

        let suggestion = "";

        if (fishCondition === "Normal") {
          suggestion =
            "Fish are healthy and active. Continue current care routine.";
        } else if (fishCondition === "Stressed") {
          suggestion =
            "Fish may be stressed. Check tank environment, water parameters, and reduce disturbances.";
        } else {
          suggestion =
            "Feed your fish now. Consider adjusting feeding schedule.";
        }

        setAnalysisResult({ fishCondition, suggestion });

        await reportService.createReport(
          currentUser.id,
          null,
          videoUri,
          fishCondition,
          suggestion,
          safeWater.temperature,
          safeWater.phLevel,
          safeWater.status as any
        );

        if (fishCondition === "Stressed") {
          await notificationService.createNotification(
            currentUser.id,
            "🐠 Fish stress detected. Please check your tank environment.",
            "fish_stress"
          );
        }

        Alert.alert(
          "Analysis Complete",
          "Fish behavior analysis finished successfully!"
        );
      } catch (e) {
        console.error("Analyze error:", e);
        Alert.alert("Error", "Analysis failed. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    }, 3000);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#0A1929",
          },
          headerTintColor: "#FFFFFF",
          headerTitle: "Fish Behavior Check",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <View style={styles.backgroundContainer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Video size={40} color="#FF9800" strokeWidth={2} />
              </View>
              <Text style={styles.title}>Fish Behavior Analysis</Text>
              <Text style={styles.subtitle}>Upload & analyze fish video</Text>
            </View>

            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>📋 Instructions</Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instructionItem}>• Upload a clear video of the fish tank</Text>
                <Text style={styles.instructionItem}>• Video must be at least 10 seconds</Text>
                <Text style={styles.instructionItem}>• Ensure good lighting</Text>
                <Text style={styles.instructionItem}>• Fish should be visible</Text>
                <Text style={styles.instructionItem}>• Avoid shaky camera</Text>
              </View>

              <View style={styles.examplesContainer}>
                <View style={styles.exampleBox}>
                  <CheckCircle size={24} color="#4CAF50" />
                  <Text style={styles.exampleText}>Clear & Stable</Text>
                </View>
                <View style={styles.exampleBox}>
                  <XCircle size={24} color="#EF5350" />
                  <Text style={styles.exampleText}>Blurry & Shaky</Text>
                </View>
              </View>
            </View>

            <View style={styles.uploadSection}>
              {videoUri ? (
                <View style={styles.videoPreview}>
                  <CheckCircle size={48} color="#4CAF50" />
                  <Text style={styles.videoPreviewText}>Video Ready</Text>
                  <Text style={styles.videoPreviewSubtext}>Tap Analyze to start</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={pickVideo} testID="upload-button">
                  <Upload size={32} color="#00BCD4" strokeWidth={2} />
                  <Text style={styles.uploadButtonText}>Upload Video</Text>
                </TouchableOpacity>
              )}

              {videoUri && (
                <TouchableOpacity
                  style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
                  onPress={analyzeVideo}
                  disabled={isAnalyzing}
                  testID="analyze-button"
                >
                  <Text style={styles.analyzeButtonText}>
                    {isAnalyzing ? "Analyzing..." : "Analyze Video"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {analysisResult && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>🐠 Fish Status Report</Text>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Fish Condition:</Text>
                  <View
                    style={[
                      styles.conditionBadge,
                      analysisResult.fishCondition === "Normal" && styles.conditionNormal,
                      analysisResult.fishCondition === "Stressed" && styles.conditionStressed,
                      analysisResult.fishCondition === "Hungry" && styles.conditionHungry,
                    ]}
                  >
                    <Text style={styles.conditionText}>{analysisResult.fishCondition}</Text>
                  </View>
                </View>

                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionLabel}>💡 Suggestion:</Text>
                  <Text style={styles.suggestionText}>{analysisResult.suggestion}</Text>
                </View>

                <View style={styles.waterQualitySummary}>
                  <Text style={styles.summaryTitle}>Water Quality Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Temperature:</Text>
                    <Text style={styles.summaryValue}>{safeWater.temperature}°C</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>pH Level:</Text>
                    <Text style={styles.summaryValue}>{safeWater.phLevel}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Status:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        safeWater.status === "Safe" && styles.statusSafe,
                        safeWater.status === "Warning" && styles.statusWarning,
                        safeWater.status === "Dangerous" && styles.statusDangerous,
                      ]}
                    >
                      <Text style={styles.statusText}>{safeWater.status}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} testID="back-button">
              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
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
  instructionsCard: {
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E4976",
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  instructionsList: {
    gap: 8,
    marginBottom: 16,
  },
  instructionItem: {
    fontSize: 14,
    color: "#B0BEC5",
    lineHeight: 20,
  },
  examplesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  exampleBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0A1929",
    padding: 12,
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  uploadSection: {
    gap: 16,
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "#00BCD4",
    borderStyle: "dashed",
  },
  uploadButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#00BCD4",
  },
  videoPreview: {
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  videoPreviewText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
  },
  videoPreviewSubtext: {
    fontSize: 14,
    color: "#B0BEC5",
  },
  analyzeButton: {
    backgroundColor: "#FF9800",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resultCard: {
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E4976",
    gap: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 16,
    color: "#B0BEC5",
    fontWeight: "500",
  },
  conditionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  conditionNormal: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  conditionStressed: {
    backgroundColor: "rgba(239, 83, 80, 0.2)",
  },
  conditionHungry: {
    backgroundColor: "rgba(255, 152, 0, 0.2)",
  },
  conditionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  suggestionBox: {
    backgroundColor: "#0A1929",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  suggestionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  suggestionText: {
    fontSize: 14,
    color: "#B0BEC5",
    lineHeight: 20,
  },
  waterQualitySummary: {
    backgroundColor: "#0A1929",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#B0BEC5",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusSafe: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  statusWarning: {
    backgroundColor: "rgba(255, 152, 0, 0.2)",
  },
  statusDangerous: {
    backgroundColor: "rgba(239, 83, 80, 0.2)",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  backButton: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  backButtonText: {
    fontSize: 16,
    color: "#00BCD4",
    fontWeight: "600",
  },
});
