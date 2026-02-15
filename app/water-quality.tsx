import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter, Stack } from 'expo-router';
import { Droplets, Thermometer, AlertCircle } from 'lucide-react-native';
import { useApp } from '../contexts/AppContext';
import { notificationService } from '../lib/database';

export default function WaterQualityScreen() {
  const router = useRouter();
  const { waterQuality, currentUser } = useApp();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastNotifiedStatus = useRef<string | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (!currentUser) return;

    if (waterQuality.status === 'Dangerous' && lastNotifiedStatus.current !== 'Dangerous') {
      notificationService.createNotification(
        currentUser.id,
        '🔔 Alert! Water quality is unsafe. Please change water immediately.',
        'water_quality'
      );
      lastNotifiedStatus.current = 'Dangerous';
    } else if (waterQuality.status === 'Warning' && lastNotifiedStatus.current !== 'Warning' && lastNotifiedStatus.current !== 'Dangerous') {
      notificationService.createNotification(
        currentUser.id,
        '⚠️ Water quality is dropping. Consider partial water change.',
        'water_quality'
      );
      lastNotifiedStatus.current = 'Warning';
    } else if (waterQuality.status === 'Safe') {
      lastNotifiedStatus.current = 'Safe';
    }
  }, [waterQuality.status, currentUser]);

  const getStatusColor = () => {
    if (waterQuality.status === 'Safe') return '#4CAF50';
    if (waterQuality.status === 'Warning') return '#FF9800';
    return '#EF5350';
  };

  const getStatusIcon = () => {
    if (waterQuality.status === 'Safe') return '✅';
    if (waterQuality.status === 'Warning') return '⚠️';
    return '❌';
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0A1929',
          },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Water Quality Monitor',
          headerTitleStyle: {
            fontWeight: '600' as const,
          },
        }}
      />
      <View style={styles.backgroundContainer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Droplets size={40} color="#00BCD4" strokeWidth={2} />
              </Animated.View>
              <Text style={styles.title}>Live Water Quality Status</Text>
              <Text style={styles.subtitle}>Real-time monitoring</Text>
            </View>

            <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {waterQuality.status}
                </Text>
              </View>
            </View>

            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Thermometer size={28} color="#FF5722" strokeWidth={2} />
                  <Text style={styles.metricLabel}>Temperature</Text>
                </View>
                <Text style={styles.metricValue}>{waterQuality.temperature}°C</Text>
                <View style={styles.rangeBar}>
                  <View style={styles.rangeOptimal}>
                    <Text style={styles.rangeText}>Optimal: 24-28°C</Text>
                  </View>
                </View>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Droplets size={28} color="#2196F3" strokeWidth={2} />
                  <Text style={styles.metricLabel}>pH Level</Text>
                </View>
                <Text style={styles.metricValue}>{waterQuality.phLevel}</Text>
                <View style={styles.rangeBar}>
                  <View style={styles.rangeOptimal}>
                    <Text style={styles.rangeText}>Optimal: 6.8-7.5</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.suggestionCard, { borderLeftColor: getStatusColor() }]}>
              <View style={styles.suggestionHeader}>
                <AlertCircle size={24} color={getStatusColor()} strokeWidth={2} />
                <Text style={styles.suggestionTitle}>AI Recommendation</Text>
              </View>
              <Text style={styles.suggestionText}>{waterQuality.suggestion}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>💡 Water Quality Tips</Text>
              <View style={styles.infoList}>
                <Text style={styles.infoItem}>• Monitor parameters daily</Text>
                <Text style={styles.infoItem}>• Perform 25% water change weekly</Text>
                <Text style={styles.infoItem}>• Test water after feeding</Text>
                <Text style={styles.infoItem}>• Keep temperature stable</Text>
                <Text style={styles.infoItem}>• Maintain proper pH balance</Text>
              </View>
            </View>

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
    backgroundColor: '#0A1929',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#B0BEC5',
  },
  statusCard: {
    backgroundColor: '#132F4C',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 3,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: '#B0BEC5',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    fontSize: 32,
  },
  statusText: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  metricsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#132F4C',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E4976',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  metricValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  rangeBar: {
    backgroundColor: '#0A1929',
    borderRadius: 8,
    padding: 12,
  },
  rangeOptimal: {
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 14,
    color: '#B0BEC5',
  },
  suggestionCard: {
    backgroundColor: '#132F4C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E4976',
    borderLeftWidth: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  suggestionText: {
    fontSize: 15,
    color: '#B0BEC5',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#132F4C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E4976',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    fontSize: 14,
    color: '#B0BEC5',
    lineHeight: 20,
  },
  backButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: '600' as const,
  },
});
