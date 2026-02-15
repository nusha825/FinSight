import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import { Bell, AlertCircle, Info, Clock } from "lucide-react-native";

import { notificationService, initDatabase } from "../lib/database";
import { useApp } from "../contexts/AppContext";
import { Notification } from "../types";

export default function NotificationsScreen() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      await initDatabase();
      const userNotifications = await notificationService.getUserNotifications(
        currentUser.id
      );

      // Normalize isRead (SQLite uses 0/1, UI expects boolean)
      const normalized = userNotifications.map((n: any) => ({
        ...n,
        isRead: n.isRead === 1 || n.isRead === true,
      }));

      setNotifications(normalized);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications((prev) =>
        prev.map((n: any) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getNotificationIcon = (type: string) => {
    if (type === "water_quality")
      return <AlertCircle size={24} color="#F44336" strokeWidth={2} />;
    if (type === "fish_stress")
      return <AlertCircle size={24} color="#FF9800" strokeWidth={2} />;
    return <Info size={24} color="#00BCD4" strokeWidth={2} />;
  };

  const getNotificationColor = (type: string) => {
    if (type === "water_quality") return "#F44336";
    if (type === "fish_stress") return "#FF9800";
    return "#00BCD4";
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
          headerTitle: "Notifications",
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
                <Bell size={40} color="#F44336" strokeWidth={2} />
              </View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>Alerts & reminders</Text>
            </View>

            {isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Loading notifications...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No notifications</Text>
                <Text style={styles.emptySubtext}>You&apos;re all caught up!</Text>
              </View>
            ) : (
              <View style={styles.notificationsList}>
                {notifications.map((notification: any) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      !notification.isRead && styles.notificationUnread,
                      { borderLeftColor: getNotificationColor(notification.type) },
                    ]}
                    onPress={() => handleMarkAsRead(notification.id)}
                    testID={`notification-${notification.id}`}
                  >
                    <View style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <View style={styles.notificationFooter}>
                        <Clock size={14} color="#78909C" />
                        <Text style={styles.notificationTime}>
                          {formatDate(notification.createdAt)}
                        </Text>
                        {!notification.isRead && <View style={styles.unreadDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(244, 67, 54, 0.15)",
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
  notificationsList: {
    gap: 12,
    paddingBottom: 20,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#132F4C",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E4976",
    borderLeftWidth: 4,
    gap: 12,
  },
  notificationUnread: {
    backgroundColor: "#1A3A52",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0A1929",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 8,
  },
  notificationMessage: {
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  notificationFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  notificationTime: {
    fontSize: 13,
    color: "#78909C",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00BCD4",
    marginLeft: 8,
  },
  backButton: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#00BCD4",
    fontWeight: "600",
  },
});
