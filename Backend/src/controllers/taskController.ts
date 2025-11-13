import { Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middlewares/authMiddleware";
import { logUserActivity } from "../services/analyticsService";
import { checkAndAwardBadges } from "../services/badgeService";

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { habitId, habit_id, title, description, dueDate, xpReward } =
      req.body;
    const userId = req.user?.id;

    // Support both habitId and habit_id for flexibility
    // habit_id is optional - tasks can be standalone or linked to habits
    const taskHabitId = habitId || habit_id || null;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        habit_id: taskHabitId, // Can be null for standalone tasks
        user_id: userId,
        title,
        description,
        due_date: dueDate,
        xp_reward: xpReward || 10,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ task: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTodayTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("tasks")
      .select("*, habits(title, color)")
      .eq("user_id", userId)
      .eq("due_date", today)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ tasks: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*, habits(id)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.is_completed) {
      return res.status(400).json({ error: "Task already completed" });
    }

    // Mark task as complete
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Award XP
    await supabase.from("xp_logs").insert({
      user_id: userId,
      task_id: id,
      amount: task.xp_reward,
      reason: "Task completion",
    });

    // Update total XP in profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();

    const newTotalXp = (profile?.total_xp || 0) + task.xp_reward;
    const newLevel = Math.floor(newTotalXp / 100) + 1; // 100 XP per level

    await supabase
      .from("profiles")
      .update({ total_xp: newTotalXp, level: newLevel })
      .eq("id", userId);

    // Update streak
    const today = new Date().toISOString().split("T")[0];
    const { data: streak } = await supabase
      .from("streaks")
      .select("*")
      .eq("habit_id", task.habit_id)
      .eq("user_id", userId)
      .single();

    if (streak) {
      const lastDate = streak.last_completed_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = streak.current_streak;

      if (lastDate === yesterdayStr) {
        // Consecutive day
        newStreak = streak.current_streak + 1;
      } else if (lastDate === today) {
        // Already completed today
        newStreak = streak.current_streak;
      } else {
        // Streak broken, restart
        newStreak = 1;
      }

      const newLongest = Math.max(newStreak, streak.longest_streak);

      await supabase
        .from("streaks")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_completed_date: today,
        })
        .eq("id", streak.id);
    }

    // Log activity for analytics
    await logUserActivity(userId!, "task", 1);
    await logUserActivity(userId!, "xp", task.xp_reward);

    // Check for new badges
    const newBadges = await checkAndAwardBadges(userId!);

    res.json({
      message: "Task completed!",
      xpAwarded: task.xp_reward,
      newTotalXp,
      newLevel,
      newBadges: newBadges.length > 0 ? newBadges : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTasksByHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { habitId } = req.params;
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("habit_id", habitId)
      .eq("user_id", userId)
      .order("due_date", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ tasks: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
