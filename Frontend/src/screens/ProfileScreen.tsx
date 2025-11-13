import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import styles from "../styles/screens/ProfileScreen.styles";

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.profileInfo}>
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
        >
          <Text style={styles.actionIcon}>🏆</Text>
          <Text style={styles.actionText}>Badges</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("XPHistory")}
        >
          <Text style={styles.actionIcon}>⭐</Text>
          <Text style={styles.actionText}>XP History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Text style={styles.actionIcon}>🔔</Text>
          <Text style={styles.actionText}>Notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Stats 📊</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.current_level || profile?.level || 0}
            </Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.total_xp || profile?.total_xp || 0}
            </Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.total_tasks_completed || 0}
            </Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.total_habits || 0}</Text>
            <Text style={styles.statLabel}>Habits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.longest_streak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(stats?.consistency_score || 0)}%
            </Text>
            <Text style={styles.statLabel}>Consistency</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Streaks 🔥</Text>
        {streaks.length > 0 ? (
          streaks.map((streak) => (
            <View key={streak.habit_id} style={styles.streakCard}>
              <View style={styles.streakInfo}>
                <Text style={styles.habitTitle}>{streak.habit_name}</Text>
                <Text style={styles.streakCount}>
                  🔥 {streak.current_streak} days
                </Text>
              </View>
              <Text style={styles.bestStreak}>
                Best: {streak.longest_streak} days
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            No active streaks yet. Complete tasks to build streaks!
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;
