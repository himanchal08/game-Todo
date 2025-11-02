import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "../config/supabase";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * Register push notification token
 */
export const registerPushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token, platform, deviceName } = req.body;
    const userId = req.user?.id;

    if (!token || !platform) {
      return res.status(400).json({ error: "Token and platform are required" });
    }

    // Create authenticated client
    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${req.accessToken}` } },
      }
    );

    // Upsert token (update if exists, insert if new)
    const { data, error } = await userSupabase
      .from("push_tokens")
      .upsert(
        {
          user_id: userId,
          token,
          platform,
          device_name: deviceName,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,token" }
      )
      .select()
      .single();

    if (error) {
      console.error("Register token error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: "Push token registered successfully",
      token: data,
    });
  } catch (error: any) {
    console.error("Register push token error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove push notification token
 */
export const removePushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.user?.id;

    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${req.accessToken}` } },
      }
    );

    const { error } = await userSupabase
      .from("push_tokens")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("token", token);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Push token removed successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get notification preferences
 */
export const getPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${req.accessToken}` } },
      }
    );

    let { data: prefs, error } = await userSupabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Create default preferences if none exist
    if (error && error.code === "PGRST116") {
      const { data: newPrefs, error: insertError } = await supabaseAdmin
        .from("notification_preferences")
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }

      prefs = newPrefs;
    } else if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ preferences: prefs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update notification preferences
 */
export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from("notification_preferences")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "Preferences updated successfully",
      preferences: data,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get notification history
 */
export const getNotificationHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${req.accessToken}` } },
      }
    );

    const { data, error } = await userSupabase
      .from("notification_history")
      .select("*")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ notifications: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { error } = await supabaseAdmin
      .from("notification_history")
      .update({
        is_read: true,
        opened_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
