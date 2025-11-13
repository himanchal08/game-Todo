import cron from "node-cron";
import { supabaseAdmin } from "../config/supabase";
import {
  sendDailyReminder,
  sendStreakRiskAlert,
  sendComebackPrompt,
} from "./notificationService";

/**
 * Check for users who need daily reminders
 * Runs every hour from 6 AM to 10 PM
 */
export const scheduleDailyReminders = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const currentHour = new Date().getHours();

      // Get users who want reminders at this hour
      const { data: preferences } = await supabaseAdmin
        .from("notification_preferences")
        .select("user_id, daily_reminder_time")
        .eq("daily_reminder", true);

      if (!preferences) return;

      for (const pref of preferences) {
        const reminderHour = parseInt(pref.daily_reminder_time.split(":")[0]);

        // Send if current hour matches user's preference
        if (currentHour === reminderHour) {
          await sendDailyReminder(pref.user_id);
        }
      }

      console.log(`✅ Daily reminders checked at ${currentHour}:00`);
    } catch (error) {
      console.error("Daily reminder error:", error);
    }
  });

  console.log("📅 Daily reminder scheduler started");
};

/**
 * Check for streaks at risk
 * Runs every day at 6 PM
 */
export const scheduleStreakRiskAlerts = () => {
  // Run daily at 6 PM
  cron.schedule("0 18 * * *", async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get users with active streaks who haven't completed today's tasks
      const { data: atRiskStreaks } = await supabaseAdmin
        .from("streaks")
        .select(
          "user_id, habit_id, current_streak, last_completed_date, habits(title)"
        )
        .gte("current_streak", 3) // Only alert for streaks 3+ days
        .neq("last_completed_date", today);

      if (!atRiskStreaks) return;

      for (const streak of atRiskStreaks) {
        // Check if user has notification preferences enabled
        const { data: prefs } = await supabaseAdmin
          .from("notification_preferences")
          .select("streak_risk_alert")
          .eq("user_id", streak.user_id)
          .single();

        if (prefs?.streak_risk_alert) {
          await sendStreakRiskAlert(
            streak.user_id,
            (streak.habits as any)?.title || "Your habit",
            streak.current_streak
          );
        }
      }

      console.log(
        `🔥 Streak risk alerts sent to ${atRiskStreaks.length} users`
      );
    } catch (error) {
      console.error("Streak risk alert error:", error);
    }
  });

  console.log("🔥 Streak risk alert scheduler started");
};

/**
 * Check for inactive users and send comeback prompts
 * Runs daily at 10 AM
 */
export const scheduleComebackPrompts = () => {
  // Run daily at 10 AM
  cron.schedule("0 10 * * *", async () => {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Get users who haven't completed any tasks in 3+ days
      const { data: inactiveUsers } = await supabaseAdmin
        .from("tasks")
        .select("user_id")
        .lt("completed_at", threeDaysAgo.toISOString())
        .eq("is_completed", true);

      if (!inactiveUsers) return;

      // Get unique user IDs
      const userIds = [...new Set(inactiveUsers.map((u) => u.user_id))];

      for (const userId of userIds) {
        // Check preferences
        const { data: prefs } = await supabaseAdmin
          .from("notification_preferences")
          .select("comeback_prompts")
          .eq("user_id", userId)
          .single();

        if (prefs?.comeback_prompts) {
          await sendComebackPrompt(userId, 3);
        }
      }

      console.log(`👋 Comeback prompts sent to ${userIds.length} users`);
    } catch (error) {
      console.error("Comeback prompt error:", error);
    }
  });

  console.log("👋 Comeback prompt scheduler started");
};

/**
 * Send morning motivation to all active users
 * Runs daily at 8 AM
 */
export const scheduleMorningMotivation = () => {
  const { getTimeBasedMessage } = require("./motivationalMessages");
  const { sendMotivationalMessage } = require("./notificationService");

  cron.schedule("0 8 * * *", async () => {
    try {
      // Get users who have morning motivation enabled
      const { data: preferences } = await supabaseAdmin
        .from("notification_preferences")
        .select("user_id, motivational_messages")
        .eq("motivational_messages", true);

      if (!preferences) return;

      for (const pref of preferences) {
        const message = getTimeBasedMessage();
        await sendMotivationalMessage(
          pref.user_id,
          message,
          "☀️ Good Morning!"
        );
      }

      console.log(`☀️ Morning motivation sent to ${preferences.length} users`);
    } catch (error) {
      console.error("Morning motivation error:", error);
    }
  });

  console.log("☀️ Morning motivation scheduler started");
};

/**
 * Send midday boost to active users
 * Runs daily at 2 PM
 */
export const scheduleMidDayBoost = () => {
  const { getRandomMessage, midDayBoost } = require("./motivationalMessages");
  const { sendMotivationalMessage } = require("./notificationService");

  cron.schedule("0 14 * * *", async () => {
    try {
      // Get users who have midday boost enabled
      const { data: preferences } = await supabaseAdmin
        .from("notification_preferences")
        .select("user_id, motivational_messages")
        .eq("motivational_messages", true);

      if (!preferences) return;

      for (const pref of preferences) {
        const message = getRandomMessage(midDayBoost);
        await sendMotivationalMessage(
          pref.user_id,
          message,
          "⚡ Midday Boost!"
        );
      }

      console.log(`⚡ Midday boost sent to ${preferences.length} users`);
    } catch (error) {
      console.error("Midday boost error:", error);
    }
  });

  console.log("⚡ Midday boost scheduler started");
};

/**
 * Send evening reflection to users
 * Runs daily at 8 PM
 */
export const scheduleEveningReflection = () => {
  const {
    getRandomMessage,
    eveningReflection,
  } = require("./motivationalMessages");
  const { sendMotivationalMessage } = require("./notificationService");

  cron.schedule("0 20 * * *", async () => {
    try {
      // Get users who have evening reflection enabled
      const { data: preferences } = await supabaseAdmin
        .from("notification_preferences")
        .select("user_id, motivational_messages")
        .eq("motivational_messages", true);

      if (!preferences) return;

      for (const pref of preferences) {
        const message = getRandomMessage(eveningReflection);
        await sendMotivationalMessage(
          pref.user_id,
          message,
          "🌙 Evening Check-in"
        );
      }

      console.log(`🌙 Evening reflection sent to ${preferences.length} users`);
    } catch (error) {
      console.error("Evening reflection error:", error);
    }
  });

  console.log("🌙 Evening reflection scheduler started");
};

/**
 * Start all notification schedulers
 */
export const startNotificationSchedulers = () => {
  scheduleDailyReminders();
  scheduleStreakRiskAlerts();
  scheduleComebackPrompts();
  scheduleMorningMotivation();
  scheduleMidDayBoost();
  scheduleEveningReflection();
  console.log("🔔 All notification schedulers started");
};
