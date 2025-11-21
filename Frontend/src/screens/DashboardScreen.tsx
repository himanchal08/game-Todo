import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
  Alert,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { analyticsService, tasksService } from "../services/api";
import { BouncyButton, GradientCard, ProgressBar } from "../components/ui";
import { COLORS, SPACING, RADIUS } from "../theme";

const { width } = Dimensions.get("window");

interface Task {
  id: string;
  title: string;
  description?: string;
  xp_reward: number;
  is_completed?: boolean;
  completed?: boolean;
  habit?: {
    id: string;
    name: string;
  };
}

interface DashboardData {
  stats: {
    total_xp: number;
    current_level: number;
    longest_streak: number;
    tasks_completed_today: number;
  };
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    earned_at: string;
  }>;
  recent_xp: Array<any>;
}

const DashboardScreen = ({ navigation }: any) => {
  const { session } = useAuth() as any;
  const user = session?.user;
  const [dashboard, setDashboard] = React.useState<DashboardData | null>(null);
  const [todayTasks, setTodayTasks] = React.useState<Task[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await analyticsService.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      console.error("Error fetching dashboard:", error);
      Alert.alert("Error", error.message || "Failed to fetch dashboard");
    }
  };

  const fetchTodayTasks = async () => {
    try {
      const response = await tasksService.getTodayTasks();
      setTodayTasks(response.tasks || response || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", error.message || "Failed to fetch tasks");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboard(), fetchTodayTasks()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchDashboard(), fetchTodayTasks()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Calculate Level Progress
  const xpToNext = 100 - ((dashboard?.stats?.total_xp || 0) % 100);
  const progressPercent = ((100 - xpToNext) / 100) * 100;

  const renderHeader = () => (
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

        <TouchableOpacity style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#F97316" />
          <Text style={styles.streakText}>
            {dashboard?.stats?.longest_streak || 0} DAYS
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          Good Morning, {user?.email?.split("@")[0] || "User"}
        </Text>
        <Text style={styles.subtitle}>
          Time to build your legacy. Let's crush today's quests!
        </Text>
      </View>
    </View>
  );

  // Render Active Proof Task (Snapchat-style verification)
  const renderActiveProofTask = () => {
    const proofTask = todayTasks.find(
      (t) => !(t.is_completed || t.completed) && t.habit
    );

    if (!proofTask) {
      return null; // Don't show card if no proof task exists
    }

    return (
      <View style={styles.proofCardContainer}>
        <LinearGradient
          colors={[COLORS.backgroundSecondary, COLORS.backgroundSecondary]}
          style={styles.proofCard}
        >
          {/* Glow Effect */}
          <LinearGradient
            colors={["rgba(99, 102, 241, 0.1)", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View style={styles.proofContentWrapper}>
            <View>
              {/* Proof Required Badge */}
              <View style={styles.proofBadgeContainer}>
                <View style={styles.pulseCircle} />
                <Text style={styles.proofBadgeText}>PROOF REQUIRED</Text>
              </View>

              <Text style={styles.proofTitle}>{proofTask.title}</Text>
              <Text style={styles.proofDescription}>
                Upload a photo to complete this task and maintain your streak.
                {proofTask.habit?.name && ` (${proofTask.habit.name})`}
              </Text>
            </View>

            {/* Camera Button */}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() =>
                navigation.navigate("ProofUpload", { taskId: proofTask.id })
              }
              activeOpacity={0.8}
            >
              <View style={styles.cameraButtonInner}>
                <Ionicons name="add" size={32} color="#000" />
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };
  const renderTask = ({ item }: { item: Task }) => {
    const isCompleted = item.is_completed || item.completed;
    const requiresProof = item.habit && !isCompleted;

    return (
      <TouchableOpacity
        onPress={() => {
          if (!isCompleted) {
            navigation.navigate("ProofUpload", { taskId: item.id });
          }
        }}
        style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <View
          style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        >
          {isCompleted && (
            <Ionicons name="checkmark" size={16} color={COLORS.success} />
          )}
        </View>

        {/* Task Content */}
        <View style={styles.taskContent}>
          <View style={styles.taskTitleRow}>
            <Text
              style={[
                styles.taskTitle,
                isCompleted && styles.taskTitleCompleted,
              ]}
            >
              {item.title}
            </Text>
            {requiresProof && (
              <Ionicons name="camera" size={14} color={COLORS.primary} />
            )}
          </View>
          <Text style={styles.taskSub}>
            {requiresProof
              ? "Proof required for streak"
              : `+${item.xp_reward} XP`}
          </Text>
        </View>

        {/* XP Badge or Verify Button */}
        {isCompleted ? (
          <View style={styles.xpBadge}>
            <Ionicons name="flash" size={12} color={COLORS.success} />
            <Text style={styles.xpBadgeText}>+{item.xp_reward}</Text>
          </View>
        ) : requiresProof ? (
          <View style={styles.verifyButton}>
            <Text style={styles.verifyButtonText}>VERIFY</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.centerContent,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ color: "#D4D4D8", fontSize: 16 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}

        {/* Active Proof Task Card */}
        {renderActiveProofTask()}

        {/* Daily Routine Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Routine</Text>
            <View style={styles.taskCounter}>
              <Text style={styles.taskCounterText}>
                {todayTasks.filter((t) => t.is_completed || t.completed).length}
                /{todayTasks.length}
              </Text>
            </View>
          </View>

          {todayTasks.length > 0 ? (
            <View style={styles.tasksList}>
              {todayTasks.map((task) => (
                <View key={task.id}>{renderTask({ item: task })}</View>
              ))}
            </View>
          ) : (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
              <Text
                style={[
                  styles.emptyText,
                  { textAlign: "center", fontStyle: "normal" },
                ]}
              >
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

        {/* Stats Grid */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            {/* Focus Score Card */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View>
                  <Text style={styles.statLabel}>FOCUS SCORE</Text>
                  <Text style={styles.statValue}>
                    {Math.round(
                      (todayTasks.filter((t) => t.is_completed || t.completed)
                        .length /
                        (todayTasks.length || 1)) *
                        100 || 0
                    )}
                    %
                  </Text>
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
                  style={[
                    styles.statProgressFill,
                    {
                      width: `${Math.round(
                        (todayTasks.filter((t) => t.is_completed || t.completed)
                          .length /
                          (todayTasks.length || 1)) *
                          100 || 0
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Level/League Card */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View>
                  <Text style={styles.statLabel}>CURRENT LEVEL</Text>
                  <Text style={styles.statValue}>
                    Level {dashboard?.stats?.current_level || 1}
                  </Text>
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
                {dashboard?.stats?.total_xp || 0} XP • Keep climbing!
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Achievements */}
        {dashboard?.badges && dashboard.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 20 }}
            >
              {dashboard.badges.map((badge: any, i: number) => (
                <View key={i} style={styles.badgeCard}>
                  <Text style={{ fontSize: 32 }}>{badge.icon || "🏆"}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },

  // Header Styles
  headerContainer: {
    padding: SPACING.l,
    paddingTop: SPACING.xl,
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
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 1,
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
    flexShrink: 1,
  },
  username: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "400",
  },
  streakBadge: {
    flexDirection: "row",
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },
  streakText: {
    color: COLORS.fireOrange,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Proof Verification Card (Snapchat-style)
  proofCardContainer: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    minHeight: Math.min(width * 1.1, 450),
  },
  proofCardGradient: {
    borderRadius: RADIUS.l,
    padding: 1,
  },
  proofCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.l,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
  },
  proofContentWrapper: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: SPACING.m,
  },
  proofBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.l,
  },
  pulseCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  proofBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  proofContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.m,
  },
  proofInfo: {
    flex: 1,
  },
  proofTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  proofDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  cameraButton: {
    alignSelf: "center",
    marginTop: SPACING.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  cameraButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // Section Styles
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

  // Task Card Styles
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
  verifyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
    borderRadius: 6,
  },
  verifyButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  // Stats Grid
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

  // Badge Card
  badgeCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.m,
    borderRadius: RADIUS.m,
    alignItems: "center",
    width: 100,
    height: 120,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    color: COLORS.textSecondary,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default DashboardScreen;
