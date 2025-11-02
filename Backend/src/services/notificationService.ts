import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { supabaseAdmin } from "../config/supabase";

// Create Expo SDK client
const expo = new Expo();

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: string;
}

/**
 * Send push notification to a user
 */
export const sendPushNotification = async (payload: NotificationPayload) => {
  try {
    const { userId, title, body, data, type = "general" } = payload;

    // Get user's push tokens
    const { data: tokens, error: tokenError } = await supabaseAdmin
      .from("push_tokens")
      .select("token, platform")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (tokenError || !tokens || tokens.length === 0) {
      console.log(`No active push tokens for user ${userId}`);
      return { success: false, error: "No active tokens" };
    }

    // Prepare messages
    const messages: ExpoPushMessage[] = [];

    for (const tokenRecord of tokens) {
      // Check if token is valid Expo push token
      if (!Expo.isExpoPushToken(tokenRecord.token)) {
        console.error(`Invalid Expo push token: ${tokenRecord.token}`);
        continue;
      }

      messages.push({
        to: tokenRecord.token,
        sound: "default",
        title,
        body,
        data: data || {},
        priority: "high",
      });
    }

    if (messages.length === 0) {
      return { success: false, error: "No valid tokens" };
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending notification chunk:", error);
      }
    }

    // Save to notification history
    await supabaseAdmin.from("notification_history").insert({
      user_id: userId,
      notification_type: type,
      title,
      body,
      data: data || {},
    });

    console.log(`Sent ${tickets.length} notifications to user ${userId}`);
    return { success: true, tickets };
  } catch (error) {
    console.error("Send notification error:", error);
    return { success: false, error };
  }
};

/**
 * Send daily reminder to user
 */
export const sendDailyReminder = async (userId: string) => {
  // Get user's incomplete tasks for today
  const today = new Date().toISOString().split("T")[0];

  const { data: tasks } = await supabaseAdmin
    .from("tasks")
    .select("title, habits(title)")
    .eq("user_id", userId)
    .eq("due_date", today)
    .eq("is_completed", false);

  if (!tasks || tasks.length === 0) {
    return; // No incomplete tasks
  }

  const taskCount = tasks.length;
  const firstTask = tasks[0];

  return sendPushNotification({
    userId,
    title: "⏰ Daily Reminder",
    body: `You have ${taskCount} task${taskCount > 1 ? "s" : ""} pending today! Start with "${firstTask.title}"`,
    data: { type: "daily_reminder", taskCount },
    type: "daily_reminder",
  });
};

/**
 * Send streak risk alert
 */
export const sendStreakRiskAlert = async (
  userId: string,
  habitTitle: string,
  streakDays: number
) => {
  return sendPushNotification({
    userId,
    title: "🔥 Streak at Risk!",
    body: `Your ${streakDays}-day streak for "${habitTitle}" is about to break. Complete today's task!`,
    data: { type: "streak_risk", habitTitle, streakDays },
    type: "streak_risk",
  });
};

/**
 * Send comeback prompt
 */
export const sendComebackPrompt = async (
  userId: string,
  daysInactive: number
) => {
  return sendPushNotification({
    userId,
    title: "👋 We Miss You!",
    body: `It's been ${daysInactive} days. Ready to get back on track? Your goals are waiting!`,
    data: { type: "comeback", daysInactive },
    type: "comeback",
  });
};

/**
 * Send achievement notification
 */
export const sendAchievementAlert = async (
  userId: string,
  achievement: string,
  description: string
) => {
  return sendPushNotification({
    userId,
    title: `🎉 ${achievement}`,
    body: description,
    data: { type: "achievement", achievement },
    type: "achievement",
  });
};

/**
 * Send level up notification
 */
export const sendLevelUpAlert = async (userId: string, newLevel: number) => {
  return sendPushNotification({
    userId,
    title: "⬆️ Level Up!",
    body: `Congratulations! You've reached Level ${newLevel}! Keep up the great work!`,
    data: { type: "level_up", level: newLevel },
    type: "level_up",
  });
};
