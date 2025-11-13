import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import api from "../services/api";
import styles from "../styles/screens/NotificationsScreen.styles";

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
      Alert.alert("Success", "All notifications marked as read");
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
              Alert.alert(
                "Error",
                error.message || "Failed to delete notification"
              );
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "xp_earned":
        return "⭐";
      case "level_up":
        return "🎉";
      case "badge_earned":
        return "🏆";
      case "streak_milestone":
        return "🔥";
      case "reminder":
        return "⏰";
      default:
        return "📢";
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
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {notifications.length > 0 && unreadCount > 0 && (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Text style={styles.markAllButtonText}>Mark All as Read</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications yet 📭</Text>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.is_read && styles.unreadCard,
              ]}
              onPress={() =>
                !notification.is_read && handleMarkAsRead(notification.id)
              }
            >
              <View style={styles.notificationContent}>
                <Text style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </Text>
                <View style={styles.notificationText}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !notification.is_read && styles.unreadTitle,
                    ]}
                  >
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationDate}>
                    {formatDate(notification.created_at)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(notification.id)}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              {!notification.is_read && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
