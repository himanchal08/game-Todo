import { supabaseAdmin } from "../config/supabase";

/**
 * Get 30-day activity heatmap for user
 */
export const getActivityHeatmap = async (userId: string, days: number = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from("activity_log")
      .select("activity_date, tasks_completed, xp_earned")
      .eq("user_id", userId)
      .gte("activity_date", startDate.toISOString().split("T")[0])
      .lte("activity_date", endDate.toISOString().split("T")[0])
      .order("activity_date", { ascending: true });

    if (error) {
      console.error("Heatmap fetch error:", error);
      return null;
    }

    // Fill in missing dates with zero activity
    const heatmap = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayData = data?.find((d) => d.activity_date === dateStr);

      const tasksCount = dayData?.tasks_completed || 0;
      heatmap.push({
        date: dateStr,
        tasks_completed: tasksCount,
        xp_earned: dayData?.xp_earned || 0,
        level: tasksCount > 0 ? Math.min(Math.floor(tasksCount / 2) + 1, 5) : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return heatmap;
  } catch (error) {
    console.error("Get heatmap error:", error);
    return null;
  }
};

/**
 * Update activity log for a user
 */
export const logUserActivity = async (
  userId: string,
  activityType: "task" | "xp" | "streak" | "proof",
  value: number
) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get existing activity log for today
    const { data: existingLog } = await supabaseAdmin
      .from("activity_log")
      .select("*")
      .eq("user_id", userId)
      .eq("activity_date", today)
      .single();

    const updateData: any = {};

    if (activityType === "task") {
      updateData.tasks_completed = (existingLog?.tasks_completed || 0) + value;
    } else if (activityType === "xp") {
      updateData.xp_earned = (existingLog?.xp_earned || 0) + value;
    } else if (activityType === "streak") {
      updateData.streaks_maintained =
        (existingLog?.streaks_maintained || 0) + value;
    } else if (activityType === "proof") {
      updateData.proofs_uploaded = (existingLog?.proofs_uploaded || 0) + value;
    }

    if (existingLog) {
      // Update existing log
      await supabaseAdmin
        .from("activity_log")
        .update(updateData)
        .eq("user_id", userId)
        .eq("activity_date", today);
    } else {
      // Create new log
      await supabaseAdmin.from("activity_log").insert({
        user_id: userId,
        activity_date: today,
        ...updateData,
      });
    }

    return true;
  } catch (error) {
    console.error("Log activity error:", error);
    return false;
  }
};

/**
 * Calculate and update user statistics
 */
export const updateUserStatistics = async (userId: string) => {
  try {
    // Get total tasks completed
    const { count: totalTasks } = await supabaseAdmin
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_completed", true);

    // Get total XP
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();

    // Get longest streak
    const { data: streaks } = await supabaseAdmin
      .from("streaks")
      .select("longest_streak, current_streak")
      .eq("user_id", userId);

    const longestStreak = Math.max(
      ...(streaks?.map((s) => s.longest_streak) || [0])
    );
    const activeStreaks =
      streaks?.filter((s) => s.current_streak > 0).length || 0;

    // Get total proofs
    const { count: totalProofs } = await supabaseAdmin
      .from("proof_snaps")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Calculate consistency score (tasks completed in last 30 days / 30)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentActivity } = await supabaseAdmin
      .from("activity_log")
      .select("tasks_completed")
      .eq("user_id", userId)
      .gte("activity_date", thirtyDaysAgo.toISOString().split("T")[0]);

    const daysActive =
      recentActivity?.filter((a) => a.tasks_completed > 0).length || 0;
    const consistencyScore = ((daysActive / 30) * 100).toFixed(2);

    // Upsert statistics
    await supabaseAdmin.from("user_statistics").upsert(
      {
        user_id: userId,
        total_tasks_completed: totalTasks || 0,
        total_xp_earned: profile?.total_xp || 0,
        longest_streak: longestStreak,
        current_active_streaks: activeStreaks,
        total_proofs_uploaded: totalProofs || 0,
        consistency_score: parseFloat(consistencyScore),
        last_updated: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return true;
  } catch (error) {
    console.error("Update statistics error:", error);
    return false;
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (userId: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_statistics")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Get statistics error:", error);
      return null;
    }

    // If no stats exist, create them
    if (!data) {
      await updateUserStatistics(userId);
      const { data: newData } = await supabaseAdmin
        .from("user_statistics")
        .select("*")
        .eq("user_id", userId)
        .single();
      return newData;
    }

    return data;
  } catch (error) {
    console.error("Get user statistics error:", error);
    return null;
  }
};
