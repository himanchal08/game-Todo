import { supabaseAdmin } from "../config/supabase";

/**
 * Seed initial badge definitions
 * Run this once to populate the badge_definitions table
 */
export const seedBadgeDefinitions = async () => {
  const badges = [
    // Task Completion Badges
    {
      badge_key: "first_task",
      name: "Getting Started",
      description: "Complete your first task",
      icon: "🎯",
      category: "task",
      requirement_type: "total_tasks",
      requirement_value: 1,
    },
    {
      badge_key: "task_warrior_10",
      name: "Task Warrior",
      description: "Complete 10 tasks",
      icon: "⚔️",
      category: "task",
      requirement_type: "total_tasks",
      requirement_value: 10,
    },
    {
      badge_key: "task_master_50",
      name: "Task Master",
      description: "Complete 50 tasks",
      icon: "👑",
      category: "task",
      requirement_type: "total_tasks",
      requirement_value: 50,
    },
    {
      badge_key: "task_legend_100",
      name: "Task Legend",
      description: "Complete 100 tasks",
      icon: "🏆",
      category: "task",
      requirement_type: "total_tasks",
      requirement_value: 100,
    },
    {
      badge_key: "task_champion_500",
      name: "Task Champion",
      description: "Complete 500 tasks",
      icon: "🔱",
      category: "task",
      requirement_type: "total_tasks",
      requirement_value: 500,
    },

    // XP Badges
    {
      badge_key: "xp_rookie_100",
      name: "XP Rookie",
      description: "Earn 100 XP",
      icon: "⭐",
      category: "xp",
      requirement_type: "total_xp",
      requirement_value: 100,
    },
    {
      badge_key: "xp_pro_500",
      name: "XP Pro",
      description: "Earn 500 XP",
      icon: "💫",
      category: "xp",
      requirement_type: "total_xp",
      requirement_value: 500,
    },
    {
      badge_key: "xp_master_1000",
      name: "XP Master",
      description: "Earn 1,000 XP",
      icon: "✨",
      category: "xp",
      requirement_type: "total_xp",
      requirement_value: 1000,
    },
    {
      badge_key: "xp_legend_5000",
      name: "XP Legend",
      description: "Earn 5,000 XP",
      icon: "🌟",
      category: "xp",
      requirement_type: "total_xp",
      requirement_value: 5000,
    },

    // Streak Badges
    {
      badge_key: "streak_starter_3",
      name: "Streak Starter",
      description: "Maintain a 3-day streak",
      icon: "🔥",
      category: "streak",
      requirement_type: "streak_days",
      requirement_value: 3,
    },
    {
      badge_key: "streak_keeper_7",
      name: "Streak Keeper",
      description: "Maintain a 7-day streak",
      icon: "🚀",
      category: "streak",
      requirement_type: "streak_days",
      requirement_value: 7,
    },
    {
      badge_key: "streak_warrior_14",
      name: "Streak Warrior",
      description: "Maintain a 14-day streak",
      icon: "💪",
      category: "streak",
      requirement_type: "streak_days",
      requirement_value: 14,
    },
    {
      badge_key: "streak_master_30",
      name: "Streak Master",
      description: "Maintain a 30-day streak",
      icon: "🎖️",
      category: "streak",
      requirement_type: "streak_days",
      requirement_value: 30,
    },
    {
      badge_key: "streak_legend_100",
      name: "Streak Legend",
      description: "Maintain a 100-day streak",
      icon: "👑",
      category: "streak",
      requirement_type: "streak_days",
      requirement_value: 100,
    },

    // Perfect Week Badges
    {
      badge_key: "perfect_week_1",
      name: "Perfect Week",
      description: "Complete tasks every day for a week",
      icon: "📅",
      category: "consistency",
      requirement_type: "perfect_week",
      requirement_value: 1,
    },
    {
      badge_key: "consistent_month",
      name: "Consistent Month",
      description: "Complete 4 perfect weeks",
      icon: "📆",
      category: "consistency",
      requirement_type: "perfect_week",
      requirement_value: 4,
    },
  ];

  try {
    console.log("Seeding badge definitions...");

    // Check if badges already exist
    const { data: existing } = await supabaseAdmin
      .from("badge_definitions")
      .select("badge_key");

    const existingKeys = new Set(existing?.map((b) => b.badge_key) || []);

    // Only insert new badges
    const newBadges = badges.filter((b) => !existingKeys.has(b.badge_key));

    if (newBadges.length === 0) {
      console.log("✅ All badge definitions already exist");
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("badge_definitions")
      .insert(newBadges)
      .select();

    if (error) {
      console.error("❌ Error seeding badges:", error);
      throw error;
    }

    console.log(`✅ Successfully seeded ${newBadges.length} badge definitions`);
    return data;
  } catch (error) {
    console.error("Seed badges error:", error);
    throw error;
  }
};
