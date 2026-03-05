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
import { useRouter, Stack } from "expo-router";
import { Fish } from "lucide-react-native";

import { aquariumService, initDatabase } from "../lib/database";
import { useApp } from "../contexts/AppContext";

export default function AddAquariumScreen() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [fishCount, setFishCount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !height || !width || !length || !fishCount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!currentUser) {
      Alert.alert("Error", "Please login first");
      return;
    }

    const heightNum = parseFloat(height);
    const widthNum = parseFloat(width);
    const lengthNum = parseFloat(length);
    const fishCountNum = parseInt(fishCount, 10);

    if (
      Number.isNaN(heightNum) ||
      Number.isNaN(widthNum) ||
      Number.isNaN(lengthNum) ||
      Number.isNaN(fishCountNum)
    ) {
      Alert.alert("Error", "Please enter valid numbers");
      return;
    }

    setIsLoading(true);
    try {
      // Safety: ensure DB is ready (no functional/design change)
      await initDatabase();

      const aquarium = await aquariumService.createAquarium(
        currentUser.id,
        name,
        heightNum,
        widthNum,
        lengthNum,
        fishCountNum
      );

      if (aquarium) {
        Alert.alert("Success", "✅ Aquarium saved successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to save aquarium");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save aquarium");
      console.error("Save aquarium error:", error);
    } finally {
      setIsLoading(false);
    }
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
          headerTitle: "Add Aquarium",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
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
                <View style={styles.iconContainer}>
                  <Fish size={40} color="#4CAF50" strokeWidth={2} />
                </View>
                <Text style={styles.title}>Aquarium Details</Text>
                <Text style={styles.subtitle}>Add your aquarium information</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Aquarium Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Main Tank"
                    placeholderTextColor="#78909C"
                    value={name}
                    onChangeText={setName}
                    testID="name-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 50"
                    placeholderTextColor="#78909C"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                    testID="height-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Width (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 60"
                    placeholderTextColor="#78909C"
                    value={width}
                    onChangeText={setWidth}
                    keyboardType="decimal-pad"
                    testID="width-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Length (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 100"
                    placeholderTextColor="#78909C"
                    value={length}
                    onChangeText={setLength}
                    keyboardType="decimal-pad"
                    testID="length-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Fish Count</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 15"
                    placeholderTextColor="#78909C"
                    value={fishCount}
                    onChangeText={setFishCount}
                    keyboardType="number-pad"
                    testID="fish-count-input"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSave}
                  disabled={isLoading}
                  testID="save-button"
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Saving..." : "Save Aquarium"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  testID="back-button"
                >
                  <Text style={styles.backButtonText}>Back to Dashboard</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
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
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 4,
  },
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  backButton: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#00BCD4",
    fontWeight: "600",
  },
});
