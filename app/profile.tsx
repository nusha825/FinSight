// app/profile.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { User, Mail, Lock } from "lucide-react-native";

import { useApp } from "../contexts/AppContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser } = useApp();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "#0A1929" },
          headerTintColor: "#FFFFFF",
          headerTitle: "My Profile",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={styles.backgroundContainer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <User size={40} color="#00BCD4" strokeWidth={2} />
              </View>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>View your account details</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{currentUser?.fullName || "-"}</Text>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Mail size={18} color="#78909C" />
                <Text style={styles.valueRow}>{currentUser?.email || "-"}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/edit-profile")}
              testID="edit-profile-button"
            >
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/change-password")}
              testID="change-password-button"
            >
              <Lock size={18} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>Change Password</Text>
            </TouchableOpacity>

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
    backgroundColor: "rgba(0, 188, 212, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#B0BEC5", textAlign: "center" },

  card: {
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E4976",
    marginBottom: 18,
  },
  label: { color: "#78909C", fontSize: 12, marginBottom: 6 },
  value: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#1E4976", marginVertical: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  valueRow: { color: "#B0BEC5", fontSize: 14, fontWeight: "600" },

  primaryButton: {
    backgroundColor: "#00BCD4",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: { fontSize: 17, fontWeight: "600", color: "#FFFFFF" },

  secondaryButton: {
    backgroundColor: "#4CAF50",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  secondaryButtonText: { fontSize: 17, fontWeight: "600", color: "#FFFFFF" },

  backButton: { height: 56, justifyContent: "center", alignItems: "center", marginBottom: 30, marginTop: 10 },
  backButtonText: { fontSize: 16, color: "#00BCD4", fontWeight: "600" },
});