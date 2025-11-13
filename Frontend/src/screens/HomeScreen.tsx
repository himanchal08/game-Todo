import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import api from "../services/api";
import styles from "../styles/screens/HomeScreen.styles";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xp_reward: number;
  habit_id: string;
}

interface Profile {
  level: number;
  xp: number;
  username: string;
}

const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayTasks = async () => {
    try {
      const response = await api.tasks.getTodayTasks();
      setTasks(response.tasks || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", error.message || "Failed to fetch today's tasks");
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.auth.getProfile();
      setProfile(response);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", error.message || "Failed to fetch profile");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await api.tasks.complete(taskId);

      // Show success message with XP and badges
      let message = `Task completed! +${response.xpAwarded} XP`;
      if (response.newLevel) {
        message += `\n🎉 Level Up! You're now level ${response.newLevel}!`;
      }
      if (response.newBadges && response.newBadges.length > 0) {
        message += `\n🏆 New Badge${
          response.newBadges.length > 1 ? "s" : ""
        }: ${response.newBadges.map((b: any) => b.name).join(", ")}`;
      }

      Alert.alert("Success", message);

      // Refresh data
      await Promise.all([fetchTodayTasks(), fetchProfile()]);
    } catch (error: any) {
      console.error("Error completing task:", error);
      Alert.alert("Error", error.message || "Failed to complete task");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTodayTasks(), fetchProfile()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTodayTasks();
    fetchProfile();
  }, []);

  const calculateLevelProgress = () => {
    if (!profile) return 0;
    return ((profile.xp % 100) / 100) * 100; // 100 XP per level
  };

  return (
    <View style={styles.container}>
      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.welcomeText}>Welcome, {profile.username}!</Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {profile.level}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${calculateLevelProgress()}%` },
                ]}
              />
            </View>
            <Text style={styles.xpText}>{profile.xp} XP</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Today's Tasks</Text>

      <ScrollView
        style={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, { borderLeftColor: "#3B82F6" }]}
            onPress={() => !task.completed && handleCompleteTask(task.id)}
            disabled={task.completed}
          >
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.xpReward}>+{task.xp_reward} XP</Text>
            </View>
            {task.description && (
              <Text style={styles.taskDescription}>{task.description}</Text>
            )}
            {task.completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ Completed</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        {tasks.length === 0 && (
          <Text style={styles.emptyText}>
            No tasks for today! Create one to get started 🎯
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
