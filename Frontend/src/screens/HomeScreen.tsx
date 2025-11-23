import React, { useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  Image,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { COLORS, SPACING, RADIUS } from "../theme";

const { width } = Dimensions.get("window");

interface Task {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
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
  const navigation = useNavigation();
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
    // Navigate directly to ProofUpload screen with the task
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      (navigation as any).navigate("ProofUpload", {
        taskId: task.id,
        taskTitle: task.title,
      });
    }
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
              await Promise.all([fetchTodayTasks(), fetchProfile()]);
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

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;
  const focusScore =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/Disciplo_Logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Disciplo</Text>
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCompleted}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Today's Tasks</Text>
            <Text style={styles.subtitle}>
              Complete your tasks and build your discipline streak!
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            {/* Focus Score Card */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View>
                  <Text style={styles.statLabel}>FOCUS SCORE</Text>
                  <Text style={styles.statValue}>{focusScore}%</Text>
                </View>
                <View style={styles.statIcon}>
                  <Ionicons
                    name="trending-up"
                    size={18}
                    color={COLORS.success}
                  />
                </View>
              </View>
              <View style={styles.statProgressBar}>
                <View
                  style={[styles.statProgressFill, { width: `${focusScore}%` }]}
                />
              </View>
            </View>

            {/* Level Card */}
            {profile && (
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View>
                    <Text style={styles.statLabel}>CURRENT LEVEL</Text>
                    <Text style={styles.statValue}>Level {profile.level}</Text>
                  </View>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: "rgba(99, 102, 241, 0.1)" },
                    ]}
                  >
                    <Ionicons name="trophy" size={18} color={COLORS.primary} />
                  </View>
                </View>
                <Text style={styles.statDescription}>
                  {profile.total_xp} XP • Keep climbing!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY'S TASKS</Text>
            <View style={styles.taskCounter}>
              <Text style={styles.taskCounterText}>
                {completedCount}/{totalCount}
              </Text>
            </View>
          </View>

          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  task.is_completed && styles.taskCardCompleted,
                ]}
                onPress={() =>
                  !task.is_completed && handleCompleteTask(task.id)
                }
                disabled={task.is_completed}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    task.is_completed && styles.checkboxCompleted,
                  ]}
                >
                  {task.is_completed && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={COLORS.success}
                    />
                  )}
                </View>

                <View style={styles.taskContent}>
                  <View style={styles.taskTitleRow}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.is_completed && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                  </View>
                  {task.description && (
                    <Text style={styles.taskSub}>{task.description}</Text>
                  )}
                </View>

                <View style={styles.xpBadge}>
                  <Ionicons name="flash" size={12} color={COLORS.success} />
                  <Text style={styles.xpBadgeText}>+{task.xp_reward}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {tasks.length === 0 && (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
                <Text style={[styles.emptyText, { textAlign: "center" }]}>
                  No tasks for today
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.textLight,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Create tasks in the Tasks tab to get started!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.l,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  clearButtonText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 12,
  },
  greetingContainer: {
    marginBottom: SPACING.m,
  },
  greeting: {
    fontSize: Math.min(width * 0.07, 28),
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "400",
  },
  section: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  taskCounter: {
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskCounterText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.m,
    padding: SPACING.l,
    minHeight: 120,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.m,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textLight,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
  },
  statProgressBar: {
    height: 8,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 4,
    overflow: "hidden",
  },
  statProgressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  statDescription: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.m,
    borderRadius: RADIUS.m,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  taskCardCompleted: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.backgroundTertiary,
    backgroundColor: "transparent",
    marginRight: SPACING.m,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    borderColor: COLORS.success,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  taskContent: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  taskTitleCompleted: {
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  taskSub: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.success,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default HomeScreen;
