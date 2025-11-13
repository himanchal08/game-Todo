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
} from "react-native";
import api from "../services/api";
import { streaksAPI } from "../services/api";
import styles from "../styles/screens/HabitsScreen.styles";

interface Habit {
  id: string;
  name: string;
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
      const response = await api.habits.getAll();
      setHabits(response.habits || []);
    } catch (error: any) {
      console.error("Error fetching habits:", error);
      Alert.alert("Error", error.message || "Failed to fetch habits");
    }
  };

  const fetchStreaks = async () => {
    try {
      const response = await streaksAPI.getAll();
      setStreaks(response.streaks || []);
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
      await api.habits.create({
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.habitList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {habits.map((habit) => {
          const streak = getStreakForHabit(habit.id);
          return (
            <TouchableOpacity
              key={habit.id}
              style={[styles.habitCard, { borderLeftColor: "#3B82F6" }]}
              onPress={() =>
                navigation.navigate("Tasks", {
                  habitId: habit.id,
                  habitName: habit.title,
                })
              }
            >
              <View style={styles.habitHeader}>
                <Text style={styles.habitTitle}>{habit.title}</Text>
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>
                    🔥 {streak?.current_streak || 0}
                  </Text>
                </View>
              </View>
              {habit.description && (
                <Text style={styles.habitDescription}>{habit.description}</Text>
              )}
              <View style={styles.habitFooter}>
                <Text style={styles.category}>{habit.frequency}</Text>
                <Text style={styles.bestStreak}>
                  Best: {streak?.longest_streak || 0} days
                </Text>
              </View>
              <Text
                style={{
                  color: "#3B82F6",
                  fontSize: 12,
                  marginTop: 8,
                  fontWeight: "600",
                }}
              >
                Tap to view tasks →
              </Text>
            </TouchableOpacity>
          );
        })}
        {habits.length === 0 && (
          <Text style={styles.emptyText}>
            No habits yet. Create your first habit to get started! 🎯
          </Text>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Habit</Text>

            <TextInput
              style={styles.input}
              placeholder="Habit Name"
              value={newHabit.name}
              onChangeText={(text) => setNewHabit({ ...newHabit, name: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
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
                    newHabit.frequency === freq && styles.frequencyButtonActive,
                  ]}
                  onPress={() => setNewHabit({ ...newHabit, frequency: freq })}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      newHabit.frequency === freq && styles.frequencyTextActive,
                    ]}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Reminder Time (HH:MM:SS):</Text>
            <TextInput
              style={styles.input}
              placeholder="09:00:00"
              value={newHabit.reminder_time}
              onChangeText={(text) =>
                setNewHabit({ ...newHabit, reminder_time: text })
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateHabit}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HabitsScreen;
