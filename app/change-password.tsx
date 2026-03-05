// app/change-password.tsx
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter, Stack } from "expo-router";
import { Lock } from "lucide-react-native";

import { initDatabase, userService } from "../lib/database";
import { useApp } from "../contexts/AppContext";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async () => {
    if (!currentUser) {
      Alert.alert("Error", "Please login first");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await initDatabase();
      await userService.changePassword(currentUser.id, currentPassword, newPassword);

      Alert.alert("Success", "✅ Password changed successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Password change failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "#0A1929" },
          headerTintColor: "#FFFFFF",
          headerTitle: "Change Password",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={styles.backgroundContainer}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Lock size={40} color="#4CAF50" strokeWidth={2} />
                </View>
                <Text style={styles.title}>Security</Text>
                <Text style={styles.subtitle}>Update your password safely</Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor="#78909C"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  testID="current-password-input"
                />

                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#78909C"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  testID="new-password-input"
                />

                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#78909C"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  secureTextEntry
                  testID="confirm-new-password-input"
                />

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleChange}
                  disabled={isLoading}
                  testID="change-button"
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Changing..." : "Change Password"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: { flex: 1, backgroundColor: "#0A1929" },
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 },

  header: { alignItems: "center", marginBottom: 32 },
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

  form: { gap: 12 },
  label: { fontSize: 15, fontWeight: "600", color: "#FFFFFF", marginLeft: 4, marginTop: 4 },
  input: {
    backgroundColor: "#132F4C",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#1E4976",
  },

  button: {
    backgroundColor: "#4CAF50",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 17, fontWeight: "600", color: "#FFFFFF" },

  backButton: { height: 56, justifyContent: "center", alignItems: "center" },
  backButtonText: { fontSize: 16, color: "#00BCD4", fontWeight: "600" },
});