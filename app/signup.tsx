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
import { User, Mail, Lock, Droplets } from "lucide-react-native";

import { userService, initDatabase } from "../lib/database";
import { useApp } from "../contexts/AppContext";

export default function SignUpScreen() {
  const router = useRouter();
  const { login, isDbReady } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!isDbReady) {
      Alert.alert("Error", "Database is initializing. Please wait.");
      return;
    }

    const fullNameTrimmed = fullName.trim();
    const emailTrimmed = email.trim();

    if (!fullNameTrimmed || !emailTrimmed || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!emailTrimmed.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await initDatabase();

      const user = await userService.createUser(
        fullNameTrimmed,
        emailTrimmed,
        password
      );

      if (user) {
        await login(user);
        Alert.alert("Success", "✅ Account created successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/dashboard"),
          },
        ]);
      } else {
        Alert.alert("Error", "Email already exists or signup failed");
      }
    } catch (error) {
      Alert.alert("Error", "Signup failed. Please try again.");
      console.error("Signup error:", error);
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join FinSight today</Text>
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

              <View style={styles.inputContainer}>
                <Lock size={20} color="#78909C" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#78909C"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  testID="confirm-password-input"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  (isLoading || !isDbReady) && styles.buttonDisabled,
                ]}
                onPress={handleSignUp}
                disabled={isLoading || !isDbReady}
                testID="signup-button"
              >
                <Text style={styles.buttonText}>
                  {!isDbReady
                    ? "Initializing..."
                    : isLoading
                    ? "Creating Account..."
                    : "Create Account"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.linkContainer}
                testID="login-link"
              >
                <Text style={styles.linkText}>
                  Already have an account?{" "}
                  <Text style={styles.linkTextBold}>Sign In</Text>
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
