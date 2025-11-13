import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "../config/supabase";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getStreaks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${req.accessToken}` } },
      }
    );

    const { data, error } = await userSupabase
      .from("streaks")
      .select("*, habits(title, color)")
      .eq("user_id", userId)
      .order("current_streak", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ streaks: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Recover a broken streak within 24 hours
 */
export const recoverStreak = async (req: AuthRequest, res: Response) => {
  try {
    const { streakId, proofUrl } = req.body;
    const userId = req.user?.id;

    if (!streakId) {
      return res.status(400).json({ error: "Streak ID is required" });
    }

    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${req.accessToken}` } },
      }
    );

    // Get streak details
    const { data: streak, error: streakError } = await userSupabase
      .from("streaks")
      .select("*, habits(title)")
      .eq("id", streakId)
      .eq("user_id", userId)
      .single();

    if (streakError || !streak) {
      return res.status(404).json({ error: "Streak not found" });
    }

    // Check if streak is actually broken (current_streak = 0)
    if (streak.current_streak > 0) {
      return res.status(400).json({ error: "Streak is not broken" });
    }

    // Check if last completed date was yesterday (within 24 hours recovery window)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (streak.last_completed_date !== yesterdayStr) {
      return res.status(400).json({
        error:
          "Recovery window expired. You can only recover streaks within 24 hours.",
      });
    }

    // Check if already recovered today
    const { data: existingRecovery } = await userSupabase
      .from("streak_recoveries")
      .select("id")
      .eq("streak_id", streakId)
      .eq("missed_date", yesterdayStr)
      .single();

    if (existingRecovery) {
      return res
        .status(400)
        .json({ error: "Streak already recovered for this date" });
    }

    const xpPenalty = 50;

    // Check if user has enough XP
    const { data: profile } = await userSupabase
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();

    if (!profile || profile.total_xp < xpPenalty) {
      return res.status(400).json({
        error: `Insufficient XP. You need ${xpPenalty} XP to recover this streak.`,
      });
    }

    // Restore streak
    const restoredStreak =
      streak.longest_streak > 0 ? streak.longest_streak : 1;

    const { error: updateError } = await supabaseAdmin
      .from("streaks")
      .update({
        current_streak: restoredStreak,
        last_completed_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", streakId);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Deduct XP
    const newTotalXp = profile.total_xp - xpPenalty;
    const newLevel = Math.floor(newTotalXp / 100) + 1;

    await supabaseAdmin
      .from("profiles")
      .update({ total_xp: newTotalXp, level: newLevel })
      .eq("id", userId);

    // Log XP deduction
    await supabaseAdmin.from("xp_logs").insert({
      user_id: userId,
      amount: -xpPenalty,
      source: "streak_recovery",
      description: `Recovered streak for "${streak.habits.title}"`,
      reason: `Streak recovery for "${streak.habits.title}"`,
    });

    // Save recovery record
    await supabaseAdmin.from("streak_recoveries").insert({
      user_id: userId,
      habit_id: streak.habit_id,
      streak_id: streakId,
      missed_date: yesterdayStr,
      recovery_proof_url: proofUrl,
      xp_penalty: xpPenalty,
    });

    res.json({
      message: "Streak recovered successfully!",
      restoredStreak,
      xpPenalty,
      newTotalXp,
      newLevel,
    });
  } catch (error: any) {
    console.error("Recover streak error:", error);
    res.status(500).json({ error: error.message });
  }
};
