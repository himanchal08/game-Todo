import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { COLORS, SPACING, RADIUS } from "../theme";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  requirement: number;
  earned_at?: string;
  progress?: number;
}

const BadgesScreen = () => {
  const navigation: any = useNavigation();
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

    const unsubscribe = navigation.addListener("focus", () => {
      fetchBadges();
    });

    return unsubscribe;
  }, [navigation]);

  useLayoutEffect(() => {
    // make native header match app background
    navigation.setOptions({
      headerStyle: {
        backgroundColor: COLORS.background,
        shadowColor: "transparent",
        elevation: 0,
      },
      headerTintColor: COLORS.text,
    });
  }, [navigation]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "task":
        return COLORS.primary;
      case "habit":
        return COLORS.success;
      case "streak":
        return COLORS.warning;
      case "xp":
        return "#8B5CF6";
      case "level":
        return COLORS.secondary;
      default:
        return COLORS.textMuted;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "task":
        return "checkmark-circle";
      case "habit":
        return "repeat";
      case "streak":
        return "flame";
      case "xp":
        return "flash";
      case "level":
        return "arrow-up-circle";
      default:
        return "trophy";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
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

  const renderBadge = (badge: Badge, isEarned: boolean) => {
    const categoryColor = getCategoryColor(badge.category);
    const categoryIcon = getCategoryIcon(badge.category);

    return (
      <View
        key={badge.id}
        style={[styles.badgeCard, !isEarned && styles.badgeCardLocked]}
      >
        <View
          style={[
            styles.badgeIconContainer,
            {
              backgroundColor: isEarned
                ? `${categoryColor}20`
                : COLORS.backgroundTertiary,
            },
          ]}
        >
          <Text style={[styles.badgeIcon, !isEarned && styles.badgeIconLocked]}>
            {badge.icon}
          </Text>
          {!isEarned && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.badgeContent}>
          <Text style={[styles.badgeName, !isEarned && styles.badgeNameLocked]}>
            {badge.name}
          </Text>
          <Text style={styles.badgeDescription} numberOfLines={2}>
            {badge.description}
          </Text>

          <View style={styles.badgeFooter}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: `${categoryColor}20` },
              ]}
            >
              <Ionicons
                name={categoryIcon as any}
                size={12}
                color={categoryColor}
              />
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {badge.category.toUpperCase()}
              </Text>
            </View>

            {isEarned && badge.earned_at && (
              <Text style={styles.earnedDate}>
                🏆 {formatDate(badge.earned_at)}
              </Text>
            )}
          </View>

          {!isEarned && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        ((badge.progress || 0) / badge.requirement) * 100,
                        100
                      )}%`,
                      backgroundColor: categoryColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.requirementText}>
                {badge.progress || 0} / {badge.requirement}
              </Text>
            </View>
          )}
        </View>

        {isEarned && (
          <View style={styles.earnedIndicator}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={COLORS.success}
            />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Badges</Text>
          <Text style={styles.headerSubtitle}>Your achievements</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading badges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayedBadges = getDisplayedBadges();
  const totalBadges = earnedBadges.length + availableBadges.length;
  const completionPercentage =
    totalBadges > 0 ? Math.round((earnedBadges.length / totalBadges) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your achievements</Text>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{availableBadges.length}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "all" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Ionicons
            name="grid"
            size={16}
            color={filter === "all" ? "#FFF" : COLORS.textLight}
          />
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
            styles.filterChip,
            filter === "earned" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("earned")}
        >
          <Ionicons
            name="trophy"
            size={16}
            color={filter === "earned" ? "#FFF" : COLORS.textLight}
          />
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
            styles.filterChip,
            filter === "locked" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("locked")}
        >
          <Ionicons
            name="lock-closed"
            size={16}
            color={filter === "locked" ? "#FFF" : COLORS.textLight}
          />
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
        {displayedBadges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>No badges to display</Text>
            <Text style={styles.emptySubtext}>
              {filter === "earned"
                ? "Complete tasks and habits to earn badges!"
                : "All badges are earned!"}
            </Text>
          </View>
        ) : (
          displayedBadges.map((badge) => renderBadge(badge, !!badge.earned_at))
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
    marginBottom: SPACING.m,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    marginTop: SPACING.m,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: SPACING.m,
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    gap: SPACING.s,
    backgroundColor: COLORS.background,
  },
  filterChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.s,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.m,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  filterTextActive: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.l,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.m,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: SPACING.s,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  badgeCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
    position: "relative",
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeIconLocked: {
    opacity: 0.4,
  },
  lockOverlay: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  badgeContent: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
    flexShrink: 1,
  },
  badgeNameLocked: {
    color: COLORS.textLight,
  },
  badgeDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.s,
    lineHeight: 20,
    flexShrink: 1,
  },
  badgeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: SPACING.s,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: RADIUS.s,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  earnedDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  progressContainer: {
    marginTop: SPACING.s,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  requirementText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  earnedIndicator: {
    marginLeft: SPACING.s,
  },
});

export default BadgesScreen;
