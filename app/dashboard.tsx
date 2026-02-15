import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Video,
  Droplets,
  FileText,
  Bell,
  LogOut,
  PlusCircle,
} from "lucide-react-native";

import { useApp } from "../contexts/AppContext";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
  testID?: string;
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  onPress,
  testID,
}: FeatureCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      testID={testID}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        {icon}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { currentUser, logout } = useApp();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.backgroundContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>
                {currentUser?.fullName || "User"}!
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              testID="logout-button"
            >
              <LogOut size={24} color="#EF5350" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Dashboard</Text>

          <View style={styles.features}>
            <FeatureCard
              icon={<PlusCircle size={28} color="#4CAF50" strokeWidth={2} />}
              title="Add Aquarium Details"
              description="Manage your aquariums"
              color="#4CAF50"
              onPress={() => router.push("/add-aquarium")}
              testID="add-aquarium-card"
            />

            <FeatureCard
              icon={<Video size={28} color="#FF9800" strokeWidth={2} />}
              title="Fish Behavior Check"
              description="Upload video for analysis"
              color="#FF9800"
              onPress={() => router.push("/fish-behavior")}
              testID="fish-behavior-card"
            />

            <FeatureCard
              icon={<Droplets size={28} color="#00BCD4" strokeWidth={2} />}
              title="Water Quality Monitor"
              description="Real-time sensor data"
              color="#00BCD4"
              onPress={() => router.push("/water-quality")}
              testID="water-quality-card"
            />

            <FeatureCard
              icon={<FileText size={28} color="#9C27B0" strokeWidth={2} />}
              title="Past Reports"
              description="View history & analysis"
              color="#9C27B0"
              onPress={() => router.push("/reports")}
              testID="reports-card"
            />

            <FeatureCard
              icon={<Bell size={28} color="#F44336" strokeWidth={2} />}
              title="Notifications"
              description="Alerts & reminders"
              color="#F44336"
              onPress={() => router.push("/notifications")}
              testID="notifications-card"
            />
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: "#B0BEC5",
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#132F4C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E4976",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  features: {
    gap: 16,
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E4976",
    borderLeftWidth: 4,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#B0BEC5",
  },
});
