import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRef, useState } from "react";
import { useRouter, Stack } from "expo-router";
import { Video, Upload, CheckCircle, XCircle } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import {
  reportService,
  notificationService,
  initDatabase,
} from "../lib/database";
import { useApp } from "../contexts/AppContext";
import { API_BASE_URL } from "../lib/api";

type FishCondition = "Normal" | "Stressed" | "Hungry";

/** ✅ Upload rules */
const VIDEO_RULES = {
  allowedExts: ["mp4", "mov"],
  minSeconds: 10,
  maxSeconds: 120,
  maxBytes: 50 * 1024 * 1024, // 50MB
};

const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

export default function FishBehaviorScreen() {
  const router = useRouter();
  const { currentUser, waterQuality } = useApp();

  const safeWater = waterQuality ?? {
    temperature: 0,
    phLevel: 0,
    status: "Safe" as const,
  };

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingText, setProcessingText] = useState<string>("Processing...");
  const [progress, setProgress] = useState<number>(0); // 0..1
  const [analysisResult, setAnalysisResult] = useState<{
    fishCondition: FishCondition;
    suggestion: string;
  } | null>(null);

  // ✅ cancel support
  const cancelledRef = useRef(false);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const statusAbortRef = useRef<AbortController | null>(null);

  const resetCancelState = () => {
    cancelledRef.current = false;
    uploadAbortRef.current = null;
    statusAbortRef.current = null;
  };

  const cancelAnalysis = () => {
    cancelledRef.current = true;
    try {
      uploadAbortRef.current?.abort();
    } catch {}
    try {
      statusAbortRef.current?.abort();
    } catch {}

    setIsAnalyzing(false);
    setProcessingText("Processing...");
    setProgress(0);

    Alert.alert("Cancelled", "Analysis was cancelled.");
  };

  const throwIfCancelled = () => {
    if (cancelledRef.current) throw new Error("CANCELLED");
  };

  const getExt = (asset: ImagePicker.ImagePickerAsset) => {
    const srcUri = asset.uri || "";
    const extFromName = asset.fileName?.split(".").pop();
    const ext =
      (extFromName ||
        (srcUri.includes(".") ? srcUri.split(".").pop() : "mp4") ||
        "mp4")?.toLowerCase();
    return ext;
  };

  // ✅ helper: always copy selected video into cache (file://)
  const copyVideoToCache = async (asset: ImagePicker.ImagePickerAsset) => {
    const srcUri = asset.uri;
    const ext = getExt(asset);
    const destUri = `${FileSystem.cacheDirectory}fish_video_${Date.now()}.${ext}`;
    await FileSystem.copyAsync({ from: srcUri, to: destUri });
    return destUri; // file://...
  };

  // ✅ validate duration/format/size before accepting upload
  const validateVideo = async (
    asset: ImagePicker.ImagePickerAsset,
    cachedUri: string
  ) => {
    // 1) format check
    const ext = getExt(asset);
    if (!VIDEO_RULES.allowedExts.includes(ext)) {
      throw new Error(
        `Invalid video format ".${ext}". Please upload: ${VIDEO_RULES.allowedExts.join(
          ", "
        )}`
      );
    }

    // 2) duration check (ImagePicker duration is usually in ms)
    const durationMs = (asset as any).duration;
    if (typeof durationMs === "number") {
      const seconds = durationMs / 1000;
      if (seconds < VIDEO_RULES.minSeconds) {
        throw new Error(
          `Video is too short. Minimum is ${VIDEO_RULES.minSeconds} seconds.`
        );
      }
      if (seconds > VIDEO_RULES.maxSeconds) {
        throw new Error(
          `Video is too long. Maximum is ${VIDEO_RULES.maxSeconds} seconds.`
        );
      }
    }

    // 3) file size check (use cached file so size is accurate)
    const info = await FileSystem.getInfoAsync(cachedUri);
    const size = (info as any).size as number | undefined;
    if (typeof size === "number") {
      if (size > VIDEO_RULES.maxBytes) {
        throw new Error(
          `Video file is too large (${bytesToMB(size)} MB). Max allowed is ${bytesToMB(
            VIDEO_RULES.maxBytes
          )} MB.`
        );
      }
    }
  };

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
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];

        // ✅ copy into cache (reliable upload)
        const cachedUri = await copyVideoToCache(asset);

        // ✅ enforce rules
        await validateVideo(asset, cachedUri);

        setVideoUri(cachedUri);
        setAnalysisResult(null);

        Alert.alert(
          "Success",
          `✅ Video uploaded!\nRules: ${VIDEO_RULES.minSeconds}-${VIDEO_RULES.maxSeconds}s, max ${bytesToMB(
            VIDEO_RULES.maxBytes
          )}MB, ${VIDEO_RULES.allowedExts.join("/")}`
        );
      }
    } catch (error: any) {
      console.error("Pick video error:", error);
      Alert.alert("Upload Failed", error?.message || "Failed to pick video");
    }
  };

  /**
   * ✅ Cloud flow:
   * 1) Ask backend for signed upload URL (/cloud/request-upload)
   * 2) Upload video file to that signed URL (FileSystem.uploadAsync)
   * 3) Trigger analysis by storage path (/fish/analyze_by_path)
   * 4) Poll /fish/status/{jobId}
   */
  const analyzeVideo = async () => {
    if (!videoUri) {
      Alert.alert("Error", "Please upload a video first");
      return;
    }
    if (!currentUser) {
      Alert.alert("Error", "Please login first");
      return;
    }

    resetCancelState();
    setProgress(0.05);
    setProcessingText("Preparing...");
    setIsAnalyzing(true);

    try {
      throwIfCancelled();

      // ✅ Ensure DB ready
      await initDatabase();

      throwIfCancelled();
      setProcessingText("Requesting upload link...");
      setProgress(0.12);

      // Determine extension for cloud path
      const ext =
        (videoUri.split(".").pop() || "mp4").toLowerCase().replace(".", "");

      // 1) Get signed upload info from backend
      uploadAbortRef.current = new AbortController();

      const signedRes = await fetch(`${API_BASE_URL}/cloud/request-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: uploadAbortRef.current.signal as any,
        body: JSON.stringify({
          userId: currentUser.id,
          ext: ext,
        }),
      });

      throwIfCancelled();

      if (!signedRes.ok) {
        const errText = await signedRes.text();
        throw new Error(`Signed upload failed: ${signedRes.status} ${errText}`);
      }

      const signedData = await signedRes.json();
      const cloudPath: string = signedData.path;
      const signedUrl: string | undefined = signedData.signedUrl;

      if (!cloudPath) throw new Error("Signed upload response missing 'path'.");

      // 2) Upload to Supabase signed URL
      setProcessingText("Uploading to cloud...");
      setProgress(0.2);

      // Some supabase SDKs return signedUrl, some only token.
      // Your backend returns signedUrl if available. If missing, we still can’t upload from app.
      if (!signedUrl) {
        throw new Error(
          "Signed upload URL was not returned by backend. Please ensure /cloud/request-upload returns 'signedUrl'."
        );
      }

      // Use FileSystem.uploadAsync for stable binary upload
      const uploadResult = await FileSystem.uploadAsync(signedUrl, videoUri, {
        httpMethod: "PUT",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          "Content-Type": ext === "mov" ? "video/quicktime" : "video/mp4",
        },
      });

      throwIfCancelled();

      // 200/201 expected
      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        throw new Error(
          `Cloud upload failed: ${uploadResult.status} ${uploadResult.body || ""}`
        );
      }

      setProcessingText("Cloud upload complete. Starting analysis...");
      setProgress(0.3);

      // 3) Trigger analysis by path
      const analyzeRes = await fetch(`${API_BASE_URL}/fish/analyze_by_path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          path: cloudPath,
        }),
      });

      throwIfCancelled();

      if (!analyzeRes.ok) {
        const errText = await analyzeRes.text();
        throw new Error(`Analyze start failed: ${analyzeRes.status} ${errText}`);
      }

      const analyzeData = await analyzeRes.json();
      const jobId = analyzeData.job_id;
      if (!jobId) throw new Error("Analyze response missing job_id");

      // 4) Poll status
      let resultData: any = null;
      setProcessingText("Analyzing video...");
      setProgress(0.35);

      const MAX_POLLS = 60;
      for (let i = 0; i < MAX_POLLS; i++) {
        throwIfCancelled();

        statusAbortRef.current = new AbortController();
        const stRes = await fetch(`${API_BASE_URL}/fish/status/${jobId}`, {
          signal: statusAbortRef.current.signal as any,
        });

        throwIfCancelled();

        if (!stRes.ok) {
          const errText = await stRes.text();
          throw new Error(`Status failed: ${stRes.status} ${errText}`);
        }

        const stData = await stRes.json();
        const status = stData.status;

        if (status === "done") {
          resultData = stData.result;
          setProgress(0.85);
          break;
        }

        if (status === "failed") {
          throw new Error(stData.result?.message || "Analysis failed");
        }

        const p = 0.35 + ((i + 1) / MAX_POLLS) * 0.5; // 35% -> 85%
        setProgress(Math.min(0.85, p));
        setProcessingText(`Analyzing video... ${Math.round(p * 100)}%`);

        await new Promise((r) => setTimeout(r, 2000));
      }

      if (!resultData) throw new Error("Timed out waiting for analysis result");

      throwIfCancelled();

      const overall = String(resultData.overall || "").toLowerCase();

      // 5) Map output
      let fishCondition: FishCondition = "Normal";
      let suggestion = "";

      if (overall === "normal") {
        fishCondition = "Normal";
        suggestion =
          "✅ Fish behavior looks normal. Continue your current care routine.";
      } else {
        fishCondition = "Stressed";
        suggestion =
          "⚠️ Abnormal behavior detected. Please check water, oxygen, and tank disturbances.";
      }

      setAnalysisResult({ fishCondition, suggestion });

      // 6) Save report (IMPORTANT: store cloudPath so you can find the video later)
      setProcessingText("Saving report...");
      setProgress(0.92);

      const saved = await reportService.createReport(
        currentUser.id,
        null,
        cloudPath, // ✅ store cloud path instead of local file uri
        fishCondition,
        suggestion,
        safeWater.temperature,
        safeWater.phLevel,
        safeWater.status as any
      );

      if (!saved) throw new Error("Report was not saved (createReport returned null)");

      // 7) Notify if abnormal
      if (fishCondition === "Stressed") {
        await notificationService.createNotification(
          currentUser.id,
          "🐠 Abnormal fish behavior detected. Please check your tank environment.",
          "fish_stress"
        );
      }

      setProgress(1);
      setProcessingText("Done!");
      setIsAnalyzing(false);

      Alert.alert("Analysis Complete", "✅ Report saved successfully!");
    } catch (e: any) {
      if (e?.message === "CANCELLED" || e?.name === "AbortError") {
        setIsAnalyzing(false);
        return;
      }
      console.error("Analyze error:", e);
      setIsAnalyzing(false);
      Alert.alert("Error", e?.message || "Analysis failed. Please try again.");
    } finally {
      uploadAbortRef.current = null;
      statusAbortRef.current = null;
      setProcessingText("Processing...");
      setProgress(0);
      cancelledRef.current = false;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "#0A1929" },
          headerTintColor: "#FFFFFF",
          headerTitle: "Fish Behavior Check",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />

      {/* ✅ Processing popup with progress + cancel */}
      <Modal transparent visible={isAnalyzing} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ActivityIndicator size="large" color="#00BCD4" />
            <Text style={styles.modalTitle}>Processing</Text>
            <Text style={styles.modalText}>{processingText}</Text>

            {/* ✅ Progress bar */}
            <View style={styles.progressBarOuter}>
              <View
                style={[
                  styles.progressBarInner,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>
              {Math.round(progress * 100)}%
            </Text>

            {/* ✅ Cancel button */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={cancelAnalysis}
              testID="cancel-analysis-button"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.modalHint}>
              Do not close the app during analysis.
            </Text>
          </View>
        </View>
      </Modal>

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
                <Text style={styles.instructionItem}>
                  • Video must be {VIDEO_RULES.minSeconds}–{VIDEO_RULES.maxSeconds} seconds
                </Text>
                <Text style={styles.instructionItem}>
                  • Max file size: {bytesToMB(VIDEO_RULES.maxBytes)} MB
                </Text>
                <Text style={styles.instructionItem}>
                  • Allowed formats: {VIDEO_RULES.allowedExts.join(", ")}
                </Text>
                <Text style={styles.instructionItem}>
                  • Ensure good lighting, fish visible, avoid shaky camera
                </Text>
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

                  <TouchableOpacity
                    style={styles.changeVideoBtn}
                    onPress={pickVideo}
                    disabled={isAnalyzing}
                  >
                    <Text style={styles.changeVideoText}>Change Video</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickVideo}
                  testID="upload-button"
                  disabled={isAnalyzing}
                >
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

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              testID="back-button"
              disabled={isAnalyzing}
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
  backgroundContainer: { flex: 1, backgroundColor: "#0A1929" },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },

  // modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E4976",
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  modalText: { fontSize: 14, color: "#B0BEC5", textAlign: "center" },
  modalHint: { fontSize: 12, color: "#78909C", textAlign: "center" },

  progressBarOuter: {
    width: "100%",
    height: 10,
    backgroundColor: "#0A1929",
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E4976",
    marginTop: 6,
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#00BCD4",
    borderRadius: 999,
  },
  progressPercent: { fontSize: 12, color: "#B0BEC5" },

  cancelBtn: {
    marginTop: 6,
    width: "100%",
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0A1929",
    borderWidth: 1,
    borderColor: "#EF5350",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: { color: "#EF5350", fontWeight: "700" },

  header: { alignItems: "center", marginTop: 20, marginBottom: 24 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#B0BEC5" },

  instructionsCard: {
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E4976",
  },
  instructionsTitle: { fontSize: 18, fontWeight: "600", color: "#FFFFFF", marginBottom: 16 },
  instructionsList: { gap: 8, marginBottom: 16 },
  instructionItem: { fontSize: 14, color: "#B0BEC5", lineHeight: 20 },

  examplesContainer: { flexDirection: "row", gap: 12 },
  exampleBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0A1929",
    padding: 12,
    borderRadius: 8,
  },
  exampleText: { fontSize: 13, color: "#FFFFFF", fontWeight: "500" },

  uploadSection: { gap: 16, marginBottom: 24 },
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
  uploadButtonText: { fontSize: 17, fontWeight: "600", color: "#00BCD4" },

  videoPreview: {
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  videoPreviewText: { fontSize: 18, fontWeight: "600", color: "#4CAF50" },
  videoPreviewSubtext: { fontSize: 14, color: "#B0BEC5" },
  changeVideoBtn: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#0A1929",
    borderWidth: 1,
    borderColor: "#1E4976",
  },
  changeVideoText: { color: "#00BCD4", fontWeight: "600" },

  analyzeButton: {
    backgroundColor: "#FF9800",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  analyzeButtonDisabled: { opacity: 0.6 },
  analyzeButtonText: { fontSize: 17, fontWeight: "600", color: "#FFFFFF" },

  resultCard: {
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E4976",
    gap: 16,
  },
  resultTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", marginBottom: 4 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultLabel: { fontSize: 16, color: "#B0BEC5", fontWeight: "500" },

  conditionBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  conditionNormal: { backgroundColor: "rgba(76, 175, 80, 0.2)" },
  conditionStressed: { backgroundColor: "rgba(239, 83, 80, 0.2)" },
  conditionHungry: { backgroundColor: "rgba(255, 152, 0, 0.2)" },
  conditionText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },

  suggestionBox: { backgroundColor: "#0A1929", padding: 16, borderRadius: 12, gap: 8 },
  suggestionLabel: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
  suggestionText: { fontSize: 14, color: "#B0BEC5", lineHeight: 20 },

  waterQualitySummary: { backgroundColor: "#0A1929", padding: 16, borderRadius: 12, gap: 12 },
  summaryTitle: { fontSize: 16, fontWeight: "600", color: "#FFFFFF", marginBottom: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 14, color: "#B0BEC5" },
  summaryValue: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusSafe: { backgroundColor: "rgba(76, 175, 80, 0.2)" },
  statusWarning: { backgroundColor: "rgba(255, 152, 0, 0.2)" },
  statusDangerous: { backgroundColor: "rgba(239, 83, 80, 0.2)" },
  statusText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },

  backButton: { height: 56, justifyContent: "center", alignItems: "center", marginBottom: 30 },
  backButtonText: { fontSize: 16, color: "#00BCD4", fontWeight: "600" },
});