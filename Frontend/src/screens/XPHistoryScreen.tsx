import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, Alert } from "react-native";
import api from "../services/api";
import styles from "../styles/screens/XPHistoryScreen.styles";

interface XPEntry {
  id: string;
  amount: number;
  source: string;
  source_id?: string;
  description: string;
  created_at: string;
}

const XPHistoryScreen = () => {
  const [xpHistory, setXpHistory] = useState<XPEntry[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchXPHistory = async () => {
    try {
      const response = await api.xp.getHistory();
      setXpHistory(response.history || []);

      // Calculate total XP
      const total = (response.history || []).reduce(
        (sum: number, entry: XPEntry) => sum + entry.amount,
        0
      );
      setTotalXP(total);
    } catch (error: any) {
      console.error("Error fetching XP history:", error);
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
  }, []);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "task_completion":
        return "✅";
      case "habit_checkin":
        return "🎯";
      case "streak_milestone":
        return "🔥";
      case "badge_earned":
        return "🏆";
      case "daily_login":
        return "📅";
      case "bonus":
        return "🎁";
      default:
        return "⭐";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "task_completion":
        return "#3B82F6";
      case "habit_checkin":
        return "#10B981";
      case "streak_milestone":
        return "#F59E0B";
      case "badge_earned":
        return "#8B5CF6";
      case "daily_login":
        return "#06B6D4";
      case "bonus":
        return "#EC4899";
      default:
        return "#6B7280";
    }
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
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatSourceName = (source: string) => {
    return source
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Group XP history by date
  const groupByDate = () => {
    const grouped: { [key: string]: XPEntry[] } = {};

    xpHistory.forEach((entry) => {
      const date = new Date(entry.created_at);
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading XP history...</Text>
      </View>
    );
  }

  const groupedHistory = groupByDate();
  const dateKeys = Object.keys(groupedHistory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>XP History</Text>
        <View style={styles.totalXPContainer}>
          <Text style={styles.totalXPLabel}>Total</Text>
          <Text style={styles.totalXP}>{totalXP.toLocaleString()} XP</Text>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {dateKeys.length === 0 ? (
          <Text style={styles.emptyText}>
            No XP earned yet. Start completing tasks! 🚀
          </Text>
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
                <View
                  key={entry.id}
                  style={[
                    styles.xpCard,
                    { borderLeftColor: getSourceColor(entry.source) },
                  ]}
                >
                  <Text style={styles.sourceIcon}>
                    {getSourceIcon(entry.source)}
                  </Text>
                  <View style={styles.xpInfo}>
                    <Text style={styles.xpDescription}>
                      {entry.description}
                    </Text>
                    <View style={styles.xpMeta}>
                      <View
                        style={[
                          styles.sourceBadge,
                          { backgroundColor: getSourceColor(entry.source) },
                        ]}
                      >
                        <Text style={styles.sourceText}>
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
      </ScrollView>
    </View>
  );
};

export default XPHistoryScreen;
