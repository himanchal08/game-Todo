import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { COLORS, SPACING, RADIUS } from "../theme";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

interface XPEntry {
  id: string;
  amount: number;
  source: string;
  source_id?: string;
  description: string;
  created_at: string;
}

const XPHistoryScreen = () => {
  const navigation: any = useNavigation();
  const [xpHistory, setXpHistory] = useState<XPEntry[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchXPHistory = async () => {
    try {
      console.log("📊 Fetching XP history...");
      const response = await api.xp.getHistory();
      console.log("📊 XP History Response:", response);
      setXpHistory(response.history || []);

      const total = (response.history || []).reduce(
        (sum: number, entry: XPEntry) => sum + entry.amount,
        0
      );
      setTotalXP(total);
      console.log(
        "📊 Total XP:",
        total,
        "Entries:",
        response.history?.length || 0
      );
    } catch (error: any) {
      console.error("❌ Error fetching XP history:", error);
      Alert.alert("Error", error.message || "Failed to fetch XP history");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchXPHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchXPHistory();

    // Refresh XP history when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      fetchXPHistory();
    });

    return unsubscribe;
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: COLORS.background,
        shadowColor: "transparent",
        elevation: 0,
      },
      headerTintColor: COLORS.text,
    });
  }, [navigation]);

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      task_completion: "checkmark-circle",
      streak: "flame",
      level_up: "arrow-up-circle",
      badge: "trophy",
      habit_completion: "repeat",
      daily_login: "calendar",
    };
    return icons[source] || "flash";
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      task_completion: COLORS.primary,
      streak: "#F97316",
      level_up: "#8B5CF6",
      badge: "#FBB024",
      habit_completion: COLORS.success,
      daily_login: COLORS.secondary,
    };
    return colors[source] || COLORS.textMuted;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatSourceName = (source: string) => {
    if (!source || typeof source !== "string") return "Unknown";
    return source
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const groupByDate = () => {
    const grouped: { [key: string]: XPEntry[] } = {};
    xpHistory.forEach((entry) => {
      const date = new Date(entry.created_at);
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(entry);
    });
    return grouped;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ color: "#D4D4D8", fontSize: 16 }}>
            Loading XP history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const groupedHistory = groupByDate();
  const dateKeys = Object.keys(groupedHistory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Track your progress</Text>
          </View>
          <View style={styles.totalXPCard}>
            <Ionicons name="flash" size={20} color="#FBB024" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.totalXPLabel}>Total XP</Text>
              <Text style={styles.totalXP}>{totalXP.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {dateKeys.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⭐</Text>
            <Text style={styles.emptyText}>No XP earned yet</Text>
            <Text style={styles.emptySubtext}>
              Start completing tasks to earn XP and level up!
            </Text>
          </View>
        ) : (
          dateKeys.map((dateKey) => (
            <View key={dateKey} style={styles.dateSection}>
              <View style={styles.dateSectionHeader}>
                <Text style={styles.dateHeaderText}>{dateKey}</Text>
                <Text style={styles.dateTotalText}>
                  +
                  {groupedHistory[dateKey]
                    .reduce((sum, entry) => sum + entry.amount, 0)
                    .toLocaleString()}{" "}
                  XP
                </Text>
              </View>

              {groupedHistory[dateKey].map((entry) => (
                <View key={entry.id} style={styles.xpCard}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${getSourceColor(entry.source)}20` },
                    ]}
                  >
                    <Ionicons
                      name={getSourceIcon(entry.source) as any}
                      size={24}
                      color={getSourceColor(entry.source)}
                    />
                  </View>
                  <View style={styles.xpInfo}>
                    <Text style={styles.xpDescription} numberOfLines={2}>
                      {entry.description}
                    </Text>
                    <View style={styles.xpMeta}>
                      <View
                        style={[
                          styles.sourceBadge,
                          {
                            backgroundColor: `${getSourceColor(
                              entry.source
                            )}20`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sourceText,
                            { color: getSourceColor(entry.source) },
                          ]}
                        >
                          {formatSourceName(entry.source)}
                        </Text>
                      </View>
                      <Text style={styles.timeText}>
                        {formatDate(entry.created_at)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.xpAmountContainer}>
                    <Text style={styles.xpAmount}>+{entry.amount}</Text>
                    <Text style={styles.xpLabel}>XP</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
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
  header: {
    paddingTop: SPACING.l,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.l,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  totalXPCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  totalXPLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  totalXP: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.l,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.l,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.s,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  dateSection: {
    marginBottom: SPACING.xl,
  },
  dateSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
    paddingHorizontal: 4,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  dateTotalText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.success,
  },
  xpCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.m,
  },
  xpInfo: {
    flex: 1,
    marginRight: SPACING.m,
  },
  xpDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    flexShrink: 1,
  },
  xpMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    flexWrap: "wrap",
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  xpAmountContainer: {
    alignItems: "flex-end",
  },
  xpAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.success,
  },
  xpLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: -2,
  },
});

export default XPHistoryScreen;
