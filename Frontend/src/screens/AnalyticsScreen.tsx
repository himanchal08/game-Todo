/**
 * Analytics Screen - User Stats and Activity Heatmap
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { analyticsService } from "../services/api";
import { COLORS, SPACING, RADIUS } from "../theme";

const { width } = Dimensions.get("window");

interface Stats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  activeHabits: number;
  totalXP: number;
  currentLevel: number;
  weeklyAverage: number;
  monthlyAverage: number;
  currentStreak: number;
  longestStreak: number;
}

interface HeatmapDay {
  date: string;
  count: number;
  xp: number;
}

const AnalyticsScreen = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 90>(30);

  const fetchStats = async () => {
    try {
      const response = await analyticsService.getStats();
      setStats(response.stats || response);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchHeatmap = async (days: number = 30) => {
    try {
      const response = await analyticsService.getHeatmap(days);
      const heatmap = response.heatmap || response.data || [];
      // Map backend data to frontend format
      const mappedData = heatmap.map((day: any) => ({
        date: day.date,
        count: day.tasks_completed || 0,
        xp: day.xp_earned || 0,
      }));
      setHeatmapData(mappedData);
    } catch (error: any) {
      console.error("Error fetching heatmap:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchHeatmap(selectedPeriod)]);
    setRefreshing(false);
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchHeatmap(selectedPeriod)]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return COLORS.backgroundTertiary;
    if (count <= 2) return `${COLORS.success}40`;
    if (count <= 4) return `${COLORS.success}70`;
    if (count <= 6) return `${COLORS.success}90`;
    return COLORS.success;
  };

  const renderStatCard = (
    icon: string,
    label: string,
    value: string | number,
    color: string,
    subtitle?: string
  ) => {
    return (
      <View style={styles.statCard}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    );
  };

  const renderHeatmapWeek = (weekData: HeatmapDay[], weekIndex: number) => {
    const cellSize = (width - SPACING.l * 2 - SPACING.s * 6) / 7;
    const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

    return (
      <View key={weekIndex} style={styles.heatmapWeek}>
        {weekData.map((day, index) => {
          const date = new Date(day.date);
          const dayOfWeek = date.getDay();
          const dayLabel = dayNames[dayOfWeek];

          return (
            <View key={index} style={styles.heatmapCellContainer}>
              <View
                style={[
                  styles.heatmapCell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getHeatmapColor(day.count),
                  },
                ]}
              >
                <Text style={styles.heatmapCellText}>{day.count || ""}</Text>
              </View>
              {weekIndex === 0 && (
                <Text style={styles.dayLabel}>{dayLabel}</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderHeatmap = () => {
    if (heatmapData.length === 0) {
      return (
        <View style={styles.emptyHeatmap}>
          <Text style={styles.emptyText}>No activity data yet</Text>
          <Text style={styles.emptySubtext}>
            Complete tasks to see your activity heatmap
          </Text>
        </View>
      );
    }

    // Group data into weeks (7 days each)
    const weeks: HeatmapDay[][] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      weeks.push(heatmapData.slice(i, i + 7));
    }

    return (
      <View style={styles.heatmapContainer}>
        {weeks.map((week, index) => renderHeatmapWeek(week, index))}

        <View style={styles.heatmapLegend}>
          <Text style={styles.legendText}>Less</Text>
          <View style={styles.legendColors}>
            <View
              style={[
                styles.legendCell,
                { backgroundColor: COLORS.backgroundTertiary },
              ]}
            />
            <View
              style={[
                styles.legendCell,
                { backgroundColor: `${COLORS.success}40` },
              ]}
            />
            <View
              style={[
                styles.legendCell,
                { backgroundColor: `${COLORS.success}70` },
              ]}
            />
            <View
              style={[
                styles.legendCell,
                { backgroundColor: `${COLORS.success}90` },
              ]}
            />
            <View
              style={[styles.legendCell, { backgroundColor: COLORS.success }]}
            />
          </View>
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Track your progress</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your progress</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>

          <View style={styles.statsGrid}>
            {renderStatCard(
              "checkmark-circle",
              "Completion Rate",
              stats?.completionRate ? `${stats.completionRate}%` : "0%",
              COLORS.success,
              `${stats?.completedTasks || 0} of ${stats?.totalTasks || 0} tasks`
            )}

            {renderStatCard(
              "list",
              "Total Tasks",
              stats?.totalTasks || 0,
              COLORS.primary,
              "All time"
            )}

            {renderStatCard(
              "repeat",
              "Active Habits",
              stats?.activeHabits || 0,
              COLORS.secondary,
              "Currently tracking"
            )}

            {renderStatCard(
              "calendar",
              "Weekly Average",
              stats?.weeklyAverage || 0,
              COLORS.warning,
              "Tasks per week"
            )}

            {renderStatCard(
              "flame",
              "Current Streak",
              stats?.currentStreak || 0,
              "#F97316",
              `Best: ${stats?.longestStreak || 0} days`
            )}

            {renderStatCard(
              "flash",
              "Total XP",
              stats?.totalXP || 0,
              "#8B5CF6",
              `Level ${stats?.currentLevel || 1}`
            )}
          </View>
        </View>

        {/* Activity Heatmap */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Heatmap</Text>

            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 30 && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(30)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === 30 && styles.periodButtonTextActive,
                  ]}
                >
                  30d
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 90 && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(90)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === 90 && styles.periodButtonTextActive,
                  ]}
                >
                  90d
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderHeatmap()}
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="trending-up" size={24} color={COLORS.success} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Keep it up!</Text>
              <Text style={styles.insightText}>
                {stats?.completionRate && stats.completionRate > 70
                  ? `Amazing! You're maintaining a ${stats.completionRate}% completion rate.`
                  : stats?.completionRate && stats.completionRate > 50
                  ? `Good progress! You're at ${stats.completionRate}% completion rate. Keep pushing!`
                  : "Start completing more tasks to improve your stats!"}
              </Text>
            </View>
          </View>

          {stats && stats.currentStreak > 0 && (
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Ionicons name="flame" size={24} color="#F97316" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Streak Active! 🔥</Text>
                <Text style={styles.insightText}>
                  You're on a {stats.currentStreak}-day streak.
                  {stats.currentStreak === stats.longestStreak
                    ? " This is your best streak yet!"
                    : ` Your best is ${stats.longestStreak} days.`}
                </Text>
              </View>
            </View>
          )}
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
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.l,
    paddingHorizontal: SPACING.l,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.textLight,
    marginTop: SPACING.m,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.l,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  statsGrid: {
    gap: SPACING.m,
  },
  statCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.s,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.s,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  periodButtonTextActive: {
    color: "#FFF",
  },
  heatmapContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  heatmapWeek: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.s,
  },
  heatmapCellContainer: {
    alignItems: "center",
  },
  heatmapCell: {
    borderRadius: RADIUS.s,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  heatmapCellText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.text,
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  heatmapLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.m,
    gap: SPACING.s,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  legendColors: {
    flexDirection: "row",
    gap: 4,
  },
  legendCell: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  emptyHeatmap: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.s,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  insightCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.success}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});

export default AnalyticsScreen;
