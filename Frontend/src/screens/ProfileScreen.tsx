import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { COLORS, SPACING, RADIUS } from "../theme";

const { width } = Dimensions.get("window");

interface Profile {
  username: string;
  email: string;
  level: number;
  total_xp: number;
  full_name?: string;
}

interface Stats {
  total_tasks_completed: number;
  total_xp: number;
  current_level: number;
  total_habits: number;
  days_active: number;
  longest_streak: number;
  consistency_score: number;
}

interface Streak {
  habit_id: string;
  habit_name: string;
  current_streak: number;
  longest_streak: number;
  last_completed: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const { session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await api.auth.getProfile();
      setProfile(response);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", error.message || "Failed to load profile");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.analytics.getStats();
      setStats(response);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchStreaks = async () => {
    try {
      const response = await api.streaks.getAll();
      setStreaks(response.streaks || []);
    } catch (error: any) {
      console.error("Error fetching streaks:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            Alert.alert("Success", "Logged out successfully");
          } catch (error: any) {
            console.error("Logout error:", error);
            Alert.alert("Error", error.message || "Failed to logout");
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchStats(), fetchStreaks()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!authLoading && session?.user) {
      Promise.all([fetchProfile(), fetchStats(), fetchStreaks()]).finally(() =>
        setLoading(false)
      );
    }
  }, [authLoading, session]);

  if (authLoading || loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "#D4D4D8", fontSize: 16 }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.centerText}>
          Please log in to view your profile
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="#FFF" />
            </View>
            <Text style={styles.name}>
              {profile?.full_name || profile?.username || "User"}
            </Text>
            {profile?.username && (
              <Text style={styles.username}>@{profile.username}</Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Badges")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(251, 191, 36, 0.1)" },
              ]}
            >
              <Ionicons name="trophy" size={24} color="#FBB024" />
            </View>
            <Text style={styles.actionText}>Badges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("XPHistory")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(99, 102, 241, 0.1)" },
              ]}
            >
              <Ionicons name="flash" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>XP History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(236, 72, 153, 0.1)" },
              ]}
            >
              <Ionicons
                name="notifications"
                size={24}
                color={COLORS.secondary}
              />
            </View>
            <Text style={styles.actionText}>Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>YOUR STATS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(99, 102, 241, 0.1)" },
                ]}
              >
                <Ionicons name="trophy" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>
                {stats?.current_level || profile?.level || 0}
              </Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                ]}
              >
                <Ionicons name="flash" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>
                {stats?.total_xp || profile?.total_xp || 0}
              </Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(236, 72, 153, 0.1)" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.secondary}
                />
              </View>
              <Text style={styles.statValue}>
                {stats?.total_tasks_completed || 0}
              </Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                ]}
              >
                <Ionicons name="repeat" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>{stats?.total_habits || 0}</Text>
              <Text style={styles.statLabel}>Habits</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(249, 115, 22, 0.1)" },
                ]}
              >
                <Ionicons name="flame" size={20} color="#F97316" />
              </View>
              <Text style={styles.statValue}>{stats?.longest_streak || 0}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(139, 92, 246, 0.1)" },
                ]}
              >
                <Ionicons name="star" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>
                {Math.round(stats?.consistency_score || 0)}%
              </Text>
              <Text style={styles.statLabel}>Consistency</Text>
            </View>
          </View>
        </View>

        {/* Current Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CURRENT STREAKS</Text>
          {streaks.length > 0 ? (
            streaks.map((streak) => (
              <View key={streak.habit_id} style={styles.streakCard}>
                <View style={styles.streakIcon}>
                  <Ionicons name="flame" size={24} color="#F97316" />
                </View>
                <View style={styles.streakInfo}>
                  <Text style={styles.habitTitle}>{streak.habit_name}</Text>
                  <Text style={styles.streakMeta}>
                    Best: {streak.longest_streak} days
                  </Text>
                </View>
                <View style={styles.streakCount}>
                  <Text style={styles.streakNumber}>
                    {streak.current_streak}
                  </Text>
                  <Text style={styles.streakLabel}>days</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={{ padding: 30, alignItems: "center" }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔥</Text>
              <Text style={[styles.emptyText, { textAlign: "center" }]}>
                No active streaks yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textLight,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Complete tasks to build streaks!
              </Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.xl * 3,
    paddingHorizontal: SPACING.l,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  profileInfo: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.m,
    borderWidth: 3,
    borderColor: `${COLORS.primary}30`,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: SPACING.l,
    marginTop: -SPACING.xl * 2,
    gap: SPACING.m,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.s,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  statsSection: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: SPACING.m,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.m,
  },
  statCard: {
    width: (width - SPACING.l * 2 - SPACING.m * 2) / 3,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 100,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.s,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.xl,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.m,
  },
  streakInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
    flexShrink: 1,
  },
  streakMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  streakCount: {
    alignItems: "center",
    paddingHorizontal: SPACING.m,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F97316",
  },
  streakLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: -4,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.backgroundSecondary,
    marginHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    gap: SPACING.s,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.danger,
  },
  centerText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.xl,
  },
});

export default ProfileScreen;
