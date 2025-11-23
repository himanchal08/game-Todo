/**
 * Notifications Screen - Modern Redesign
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import api from "../services/api";
import { COLORS, SPACING, RADIUS } from "../theme";

const { width } = Dimensions.get("window");

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.notifications.getAll();
      setNotifications(response.notifications || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      Alert.alert("Error", error.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.notifications.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      Alert.alert("Success", "All notifications marked as read ✓");
    } catch (error: any) {
      console.error("Error marking all as read:", error);
      Alert.alert("Error", error.message || "Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId: string) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.notifications.delete(notificationId);
              setNotifications(
                notifications.filter((n) => n.id !== notificationId)
              );
            } catch (error: any) {
              console.error("Error deleting notification:", error);
              Alert.alert("Error", error.message || "Failed to delete");
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string): any => {
    switch (type) {
      case "xp_earned":
        return "flash";
      case "level_up":
        return "arrow-up-circle";
      case "badge_earned":
        return "trophy";
      case "streak_milestone":
        return "flame";
      case "reminder":
        return "notifications";
      case "task_complete":
        return "checkmark-circle";
      case "habit_reminder":
        return "repeat";
      default:
        return "information-circle";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "xp_earned":
        return COLORS.warning;
      case "level_up":
        return "#8B5CF6";
      case "badge_earned":
        return "#FBB024";
      case "streak_milestone":
        return "#F97316";
      case "reminder":
        return COLORS.primary;
      case "task_complete":
        return COLORS.success;
      case "habit_reminder":
        return COLORS.secondary;
      default:
        return COLORS.textMuted;
    }
  };

  // Render right swipe actions (delete)
  const renderRightActions = (notificationId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteSwipeAction}
        onPress={() => handleDelete(notificationId)}
      >
        <Ionicons name="trash-outline" size={24} color="#FFF" />
        <Text style={styles.deleteSwipeText}>Delete</Text>
      </TouchableOpacity>
    );
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
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Stay updated</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Stay Updated</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionBar}>
        {notifications.length > 0 && unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Ionicons name="checkmark-done" size={18} color={COLORS.primary} />
            <Text style={styles.markAllButtonText}>Mark All as Read</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.markAllButton,
            { backgroundColor: `${COLORS.success}20` },
          ]}
          onPress={async () => {
            try {
              await api.notifications.testMotivation();
              Alert.alert(
                "Success",
                "Test notification sent! Pull down to refresh."
              );
              setTimeout(() => fetchNotifications(), 500);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to send test notification"
              );
            }
          }}
        >
          <Ionicons name="flask" size={18} color={COLORS.success} />
          <Text style={[styles.markAllButtonText, { color: COLORS.success }]}>
            Send Test
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
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              You'll see updates about your tasks and achievements here
            </Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const iconName = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);

            return (
              <Swipeable
                key={notification.id}
                renderRightActions={() => renderRightActions(notification.id)}
                overshootRight={false}
                friction={2}
              >
                <TouchableOpacity
                  style={[
                    styles.notificationCard,
                    !notification.is_read && styles.notificationCardUnread,
                  ]}
                  onPress={() =>
                    !notification.is_read && handleMarkAsRead(notification.id)
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.notificationIcon,
                      { backgroundColor: `${iconColor}20` },
                    ]}
                  >
                    <Ionicons name={iconName} size={24} color={iconColor} />
                  </View>

                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.is_read && styles.notificationTitleUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatDate(notification.created_at)}
                    </Text>
                  </View>

                  <View style={styles.notificationActions}>
                    {!notification.is_read && <View style={styles.unreadDot} />}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(notification.id)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const SwipeableNotificationsScreen = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotificationsScreen />
    </GestureHandlerRootView>
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFF",
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
  actionBar: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.background,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.s,
    backgroundColor: `${COLORS.primary}20`,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: RADIUS.m,
  },
  markAllButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
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
    paddingHorizontal: SPACING.xl,
  },
  notificationCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.m,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  notificationCardUnread: {
    borderColor: `${COLORS.primary}40`,
    backgroundColor: `${COLORS.primary}05`,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
    flexShrink: 1,
  },
  notificationTitleUnread: {
    color: COLORS.text,
    fontWeight: "700",
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 4,
    flexShrink: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  notificationActions: {
    alignItems: "center",
    gap: SPACING.s,
    marginLeft: SPACING.s,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    padding: 4,
  },
  deleteSwipeAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginBottom: SPACING.m,
    borderRadius: RADIUS.m,
    marginLeft: SPACING.s,
  },
  deleteSwipeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default SwipeableNotificationsScreen;
