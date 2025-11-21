import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { habitsService, streaksService } from "../services/api";
import { BouncyButton } from "../components/ui";
import { COLORS, SPACING, RADIUS } from "../theme";

interface Habit {
  id: string;
  name: string;
  title?: string;
  description: string;
  frequency: string;
  reminder_time?: string;
}

interface Streak {
  habit_id: string;
  habit_name: string;
  current_streak: number;
  longest_streak: number;
  last_completed: string;
}

const HabitsScreen = ({ navigation }: any) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    frequency: "daily",
    reminder_time: "09:00:00",
  });

  const fetchHabits = async () => {
    try {
      const response = await habitsService.getAll();
      setHabits(response.habits || response || []);
    } catch (error: any) {
      console.error("Error fetching habits:", error);
      Alert.alert("Error", error.message || "Failed to fetch habits");
    }
  };

  const fetchStreaks = async () => {
    try {
      const response = await streaksService.getAll();
      setStreaks(response.streaks || response || []);
    } catch (error: any) {
      console.error("Error fetching streaks:", error);
    }
  };

  const handleCreateHabit = async () => {
    if (!newHabit.name.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    try {
      await habitsService.create({
        name: newHabit.name,
        description: newHabit.description,
        frequency: newHabit.frequency,
        reminder_time: newHabit.reminder_time,
      });

      setModalVisible(false);
      setNewHabit({
        name: "",
        description: "",
        frequency: "daily",
        reminder_time: "09:00:00",
      });

      await fetchHabits();
      Alert.alert("Success", "Habit created successfully! 🎯");
    } catch (error: any) {
      console.error("Error creating habit:", error);
      Alert.alert("Error", error.message || "Failed to create habit");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchHabits(), fetchStreaks()]);
    setRefreshing(false);
  };

  const getStreakForHabit = (habitId: string) => {
    return streaks.find((s) => s.habit_id === habitId);
  };

  useEffect(() => {
    fetchHabits();
    fetchStreaks();
  }, []);

  const renderHabit = ({ item }: { item: Habit }) => {
    const streak = getStreakForHabit(item.id);
    const habitName = item.name || item.title || "Unnamed Habit";

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Tasks", {
            habitId: item.id,
            habitName: habitName,
          })
        }
      >
        <View style={styles.habitCardLarge}>
          <View style={styles.habitCardInner}>
            <View style={styles.habitIconContainer}>
              <Text style={{ fontSize: 24 }}>⚡️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.habitTitleLarge}>{habitName}</Text>
              <Text style={styles.habitFreqLarge}>
                {item.frequency.charAt(0).toUpperCase() +
                  item.frequency.slice(1)}
              </Text>
              {item.description && (
                <Text style={styles.habitDesc} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={14} color="#FF9966" />
                <Text style={styles.streakSmall}>
                  {streak?.current_streak || 0} day streak
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textLight}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Habits</Text>
            <Text style={styles.headerSubtitle}>
              Build consistency, track progress
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first habit to get started!
            </Text>
          </View>
        }
      />

      {/* Create Habit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Habit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Habit Name"
                placeholderTextColor={COLORS.textLight}
                value={newHabit.name}
                onChangeText={(text) =>
                  setNewHabit({ ...newHabit, name: text })
                }
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                placeholderTextColor={COLORS.textLight}
                value={newHabit.description}
                onChangeText={(text) =>
                  setNewHabit({ ...newHabit, description: text })
                }
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Frequency:</Text>
              <View style={styles.frequencyOptions}>
                {["daily", "weekly", "custom"].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      newHabit.frequency === freq &&
                        styles.frequencyButtonActive,
                    ]}
                    onPress={() =>
                      setNewHabit({ ...newHabit, frequency: freq })
                    }
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        newHabit.frequency === freq &&
                          styles.frequencyTextActive,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Reminder Time:</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00:00"
                placeholderTextColor={COLORS.textLight}
                value={newHabit.reminder_time}
                onChangeText={(text) =>
                  setNewHabit({ ...newHabit, reminder_time: text })
                }
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <BouncyButton
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </BouncyButton>
              <BouncyButton
                style={styles.createButton}
                onPress={handleCreateHabit}
              >
                <Text style={styles.createButtonText}>Create Habit</Text>
              </BouncyButton>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ==========================================
// Styles
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.l,
    paddingHorizontal: SPACING.l,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  habitCardLarge: {
    borderRadius: RADIUS.m,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  habitCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.m,
    borderRadius: RADIUS.m,
  },
  habitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  habitTitleLarge: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  habitFreqLarge: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  habitDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  streakSmall: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.m,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: SPACING.s,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.l,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.m,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  frequencyOptions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.m,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  frequencyButtonActive: {
    backgroundColor: COLORS.primary,
  },
  frequencyText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  frequencyTextActive: {
    color: "#FFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: RADIUS.m,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 16,
  },
  createButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: RADIUS.m,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default HabitsScreen;
