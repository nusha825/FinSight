import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Mail, Lock, Droplets } from "lucide-react-native";

import { userService, initDatabase } from "../lib/database";
import { useApp } from "../contexts/AppContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isDbReady } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // extra safety: ensure DB is ready (no design/logic change)
    if (!isDbReady) {
      Alert.alert("Error", "Database is initializing. Please wait.");
      return;
    }

    const emailTrimmed = email.trim();

    if (!emailTrimmed || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // simple email check (helps users, no functional change)
    if (!emailTrimmed.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await initDatabase();

      const user = await userService.loginUser(emailTrimmed, password);

      if (user) {
        await login(user);
        router.replace("/dashboard");
      } else {
        Alert.alert("Error", "Incorrect details. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.backgroundContainer}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Droplets size={50} color="#00BCD4" strokeWidth={2} />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue monitoring</Text>
            </View>

            <View style={styles.form}>
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

              <View style={styles.inputContainer}>
                <Lock size={20} color="#78909C" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#78909C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  testID="password-input"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  (isLoading || !isDbReady) && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading || !isDbReady}
                testID="login-button"
              >
                <Text style={styles.buttonText}>
                  {!isDbReady
                    ? "Initializing..."
                    : isLoading
                    ? "Signing In..."
                    : "Login"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/signup")}
                style={styles.linkContainer}
                testID="signup-link"
              >
                <Text style={styles.linkText}>
                  Don&apos;t have an account?{" "}
                  <Text style={styles.linkTextBold}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(0, 188, 212, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#B0BEC5",
  },
  form: {
    gap: 16,
  },
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#00BCD4",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  linkContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  linkText: {
    fontSize: 15,
    color: "#B0BEC5",
  },
  linkTextBold: {
    color: "#00BCD4",
    fontWeight: "600",
  },
});
