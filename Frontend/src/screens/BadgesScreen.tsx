import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import api from "../services/api";
import styles from "../styles/screens/BadgesScreen.styles";

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  requirement: number;
  earned_at?: string;
}

const BadgesScreen = () => {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");

  const fetchBadges = async () => {
    try {
      const [earnedResponse, allResponse] = await Promise.all([
        api.analytics.getBadges(),
        api.analytics.getAllBadges(),
      ]);

      const earned = earnedResponse.badges || [];
      const all = allResponse.badges || [];

      // Filter out earned badges from all badges to get locked badges
      const earnedIds = new Set(earned.map((b: Badge) => b.id));
      const locked = all.filter((b: Badge) => !earnedIds.has(b.id));

      setEarnedBadges(earned);
      setAvailableBadges(locked);
    } catch (error: any) {
      console.error("Error fetching badges:", error);
      Alert.alert("Error", error.message || "Failed to fetch badges");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBadges();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "task":
        return "#3B82F6";
      case "habit":
        return "#10B981";
      case "streak":
        return "#F59E0B";
      case "xp":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDisplayedBadges = () => {
    if (filter === "earned") {
      return earnedBadges;
    } else if (filter === "locked") {
      return availableBadges;
    }
    return [...earnedBadges, ...availableBadges];
  };

  const renderBadge = (badge: Badge, isEarned: boolean) => (
    <View
      key={badge.id}
      style={[
        styles.badgeCard,
        { borderLeftColor: getCategoryColor(badge.category) },
        !isEarned && styles.lockedBadge,
      ]}
    >
      <Text style={[styles.badgeIcon, !isEarned && styles.lockedIcon]}>
        {badge.icon}
      </Text>
      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeName, !isEarned && styles.lockedText]}>
          {badge.name}
        </Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
        <View style={styles.badgeFooter}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(badge.category) },
            ]}
          >
            <Text style={styles.categoryText}>
              {badge.category.toUpperCase()}
            </Text>
          </View>
          {isEarned && badge.earned_at && (
            <Text style={styles.earnedDate}>
              Earned {formatDate(badge.earned_at)}
            </Text>
          )}
          {!isEarned && (
            <Text style={styles.requirementText}>
              Requirement: {badge.requirement}
            </Text>
          )}
        </View>
      </View>
      {isEarned && <View style={styles.earnedIndicator} />}
      {!isEarned && (
        <View style={styles.lockedIndicator}>
          <Text style={styles.lockedIndicatorText}>🔒</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading badges...</Text>
      </View>
    );
  }

  const displayedBadges = getDisplayedBadges();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Badges</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {earnedBadges.length}/{earnedBadges.length + availableBadges.length}
          </Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "earned" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("earned")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "earned" && styles.filterTextActive,
            ]}
          >
            Earned ({earnedBadges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "locked" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("locked")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "locked" && styles.filterTextActive,
            ]}
          >
            Locked ({availableBadges.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {displayedBadges.length === 0 ? (
          <Text style={styles.emptyText}>No badges to display</Text>
        ) : (
          displayedBadges.map((badge) => renderBadge(badge, !!badge.earned_at))
        )}
      </ScrollView>
    </View>
  );
};

export default BadgesScreen;
