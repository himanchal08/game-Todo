import { supabaseAdmin } from "../config/supabase";
import { sendAchievementAlert } from "./notificationService";

/**
 * Check and award badges to user based on their progress
 */
export const checkAndAwardBadges = async (userId: string) => {
  try {
    // Get user statistics
    const { data: stats } = await supabaseAdmin
      .from("user_statistics")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!stats) return [];

    // Get all badge definitions
    const { data: allBadges } = await supabaseAdmin
      .from("badge_definitions")
      .select("*");

    if (!allBadges) return [];

    // Get user's already earned badges
    const { data: earnedBadges } = await supabaseAdmin
      .from("user_badges")
      .select("badge_key")
      .eq("user_id", userId);

    const earnedKeys = new Set(earnedBadges?.map((b) => b.badge_key) || []);
    const newlyEarnedBadges = [];

    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedKeys.has(badge.badge_key)) continue;

      let qualified = false;

      // Check if user qualifies for this badge
      if (badge.requirement_type === "total_tasks") {
        qualified = stats.total_tasks_completed >= badge.requirement_value;
      } else if (badge.requirement_type === "total_xp") {
        qualified = stats.total_xp_earned >= badge.requirement_value;
      } else if (badge.requirement_type === "streak_days") {
        qualified = stats.longest_streak >= badge.requirement_value;
      } else if (badge.requirement_type === "perfect_week") {
        qualified = stats.perfect_weeks >= badge.requirement_value;
      }

      if (qualified) {
        // Award badge
        await supabaseAdmin.from("user_badges").insert({
          user_id: userId,
          badge_key: badge.badge_key,
        });

        newlyEarnedBadges.push(badge);

        // Send notification
        await sendAchievementAlert(
          userId,
          `${badge.icon} ${badge.name}`,
          badge.description
        );
      }
    }

    return newlyEarnedBadges;
  } catch (error) {
    console.error("Check and award badges error:", error);
    return [];
  }
};

/**
 * Get all badges for a user
 */
export const getUserBadges = async (userId: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_badges")
      .select(
        `
        id,
        badge_key,
        earned_at
      `
      )
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Get user badges error:", error);
      return [];
    }

    // Get badge definitions
    const badgeKeys = data?.map((b) => b.badge_key) || [];
    const { data: definitions } = await supabaseAdmin
      .from("badge_definitions")
      .select("*")
      .in("badge_key", badgeKeys);

    // Merge badge data with definitions
    const badges = data?.map((userBadge) => {
      const definition = definitions?.find(
        (d) => d.badge_key === userBadge.badge_key
      );
      return {
        ...userBadge,
        ...definition,
      };
    });

    return badges || [];
  } catch (error) {
    console.error("Get user badges error:", error);
    return [];
  }
};

/**
 * Get all available badges with progress
 */
export const getAllBadgesWithProgress = async (userId: string) => {
  try {
    // Get all badge definitions
    const { data: allBadges } = await supabaseAdmin
      .from("badge_definitions")
      .select("*")
      .order("category", { ascending: true });

    // Get user's earned badges
    const { data: earnedBadges } = await supabaseAdmin
      .from("user_badges")
      .select("badge_key, earned_at")
      .eq("user_id", userId);

    const earnedMap = new Map(
      earnedBadges?.map((b) => [b.badge_key, b.earned_at]) || []
    );

    // Get user statistics for progress
    const { data: stats } = await supabaseAdmin
      .from("user_statistics")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Calculate progress for each badge
    const badgesWithProgress = allBadges?.map((badge) => {
      const isEarned = earnedMap.has(badge.badge_key);
      let currentProgress = 0;

      if (!isEarned && stats) {
        if (badge.requirement_type === "total_tasks") {
          currentProgress = stats.total_tasks_completed;
        } else if (badge.requirement_type === "total_xp") {
          currentProgress = stats.total_xp_earned;
        } else if (badge.requirement_type === "streak_days") {
          currentProgress = stats.longest_streak;
        } else if (badge.requirement_type === "perfect_week") {
          currentProgress = stats.perfect_weeks || 0;
        }
      }

      return {
        ...badge,
        is_earned: isEarned,
        earned_at: isEarned ? earnedMap.get(badge.badge_key) : null,
        current_progress: currentProgress,
        progress_percentage: Math.min(
          (currentProgress / badge.requirement_value) * 100,
          100
        ),
      };
    });

    return badgesWithProgress || [];
  } catch (error) {
    console.error("Get all badges with progress error:", error);
    return [];
  }
};
