// app/edit-profile.tsx
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
import { useEffect, useState } from "react";
import { useRouter, Stack } from "expo-router";
import { User, Mail } from "lucide-react-native";

import { initDatabase, userService } from "../lib/database";
import { useApp } from "../contexts/AppContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentUser, updateCurrentUser } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFullName(currentUser?.fullName || "");
    setEmail(currentUser?.email || "");
  }, [currentUser]);

  const handleSave = async () => {
    const fullNameTrimmed = fullName.trim();
    const emailTrimmed = email.trim();

    if (!currentUser) {
      Alert.alert("Error", "Please login first");
      return;
    }

    if (!fullNameTrimmed || !emailTrimmed) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!emailTrimmed.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    setIsLoading(true);
    try {
      await initDatabase();
      const updated = await userService.updateUserProfile(
        currentUser.id,
        fullNameTrimmed,
        emailTrimmed
      );

      if (updated) {
        await updateCurrentUser(updated);
        Alert.alert("Success", "✅ Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Profile update failed");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Profile update failed");
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
          headerTitle: "Edit Profile",
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
                  <User size={40} color="#00BCD4" strokeWidth={2} />
                </View>
                <Text style={styles.title}>Update Details</Text>
                <Text style={styles.subtitle}>Edit your name & email</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <User size={20} color="#78909C" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#78909C"
                    value={fullName}
                    onChangeText={setFullName}
                    testID="fullname-input"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Mail size={20} color="#78909C" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#78909C"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="email-input"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSave}
                  disabled={isLoading}
                  testID="save-button"
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Saving..." : "Save Changes"}
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
    backgroundColor: "rgba(0, 188, 212, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#B0BEC5", textAlign: "center" },

  form: { gap: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#132F4C",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#1E4976",
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#FFFFFF" },

  button: {
    backgroundColor: "#00BCD4",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 17, fontWeight: "600", color: "#FFFFFF" },

  backButton: { height: 56, justifyContent: "center", alignItems: "center" },
  backButtonText: { fontSize: 16, color: "#00BCD4", fontWeight: "600" },
});