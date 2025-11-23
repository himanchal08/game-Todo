import React, { useEffect, useState, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import api from "../services/api";

const { width } = Dimensions.get("window");
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
  total_xp: number;
  username: string;
  full_name?: string;
}

const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const isFocused = useIsFocused();

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
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    // Photo verification is mandatory - redirect to Tasks screen
    Alert.alert(
      "Photo Proof Required 📸",
      "To complete this task, you need to take a proof photo. This helps verify your progress!\n\nPlease go to the Tasks screen to complete this task with photo proof.",
      [{ text: "OK", style: "default" }]
    );
  };

  const handleClearCompleted = async () => {
    const completedCount = tasks.filter((t) => t.is_completed).length;

    if (completedCount === 0) {
      Alert.alert(
        "No Completed Tasks",
        "There are no completed tasks to clear."
      );
      return;
    }

    Alert.alert(
      "Clear Completed Tasks",
      `Are you sure you want to delete ${completedCount} completed task${
        completedCount > 1 ? "s" : ""
      }? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.tasks.deleteCompleted();
              await fetchTodayTasks();
              Alert.alert("Success", "Completed tasks deleted successfully!");
            } catch (error: any) {
              console.error("Error deleting completed tasks:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete completed tasks"
              );
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTodayTasks(), fetchProfile()]);
    setRefreshing(false);
  };

  useEffect(() => {
    let tasksInterval: any = null;
    let profileInterval: any = null;

    const startIntervals = async () => {
      // initial fetch
      await fetchTodayTasks();
      await fetchProfile();

      // tasks every 1 second (non-overlapping)
      tasksInterval = setInterval(async () => {
        if (isFetchingRef.current) return;
        try {
          isFetchingRef.current = true;
          await fetchTodayTasks();
        } finally {
          isFetchingRef.current = false;
        }
      }, 1000);

      // profile less frequently (every 5 seconds)
      profileInterval = setInterval(() => {
        fetchProfile();
      }, 5000);
    };

    // only run intervals while the screen is focused
    if (isFocused) {
      startIntervals();
    }

    return () => {
      if (tasksInterval) clearInterval(tasksInterval);
      if (profileInterval) clearInterval(profileInterval);
    };
  }, [isFocused]);

  const calculateLevelProgress = () => {
    if (!profile) return 0;
    return ((profile.total_xp % 100) / 100) * 100; // 100 XP per level
  };

  return (
    <View style={styles.container}>
      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.welcomeText}>
            Welcome, {profile.full_name || profile.username || "User"}!
          </Text>
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
            <Text style={styles.xpText}>{profile.total_xp} XP</Text>
          </View>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          marginTop: 10,
        }}
      >
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        <TouchableOpacity
          style={{ backgroundColor: "#EF4444", padding: 10, borderRadius: 8 }}
          onPress={handleClearCompleted}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            🗑️ Clear Done
          </Text>
        </TouchableOpacity>
      </View>

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
            onPress={() => !task.is_completed && handleCompleteTask(task.id)}
            disabled={task.is_completed}
          >
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.xpReward}>+{task.xp_reward} XP</Text>
            </View>
            {task.description && (
              <Text style={styles.taskDescription}>{task.description}</Text>
            )}
            {task.is_completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ Completed</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        {tasks.length === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
            <Text style={[styles.emptyText, { textAlign: "center" }]}>
              No tasks for today!
            </Text>
            <Text
              style={[
                styles.emptyText,
                { fontSize: 14, color: "#A1A1AA", marginTop: 8 },
              ]}
            >
              Go to Tasks screen to create your first task
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
