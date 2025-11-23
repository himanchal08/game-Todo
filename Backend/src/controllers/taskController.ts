import { Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";
import { AuthRequest } from "../middlewares/authMiddleware";
import { logUserActivity } from "../services/analyticsService";
import { checkAndAwardBadges } from "../services/badgeService";

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const {
      habitId,
      habit_id,
      title,
      description,
      dueDate,
      scheduled_for,
      xpReward,
      xp_reward,
    } = req.body;
    const userId = req.user?.id;

    // Support both habitId and habit_id for flexibility
    // habit_id is optional - tasks can be standalone or linked to habits
    const taskHabitId = habitId || habit_id || null;

    // Support both frontend (scheduled_for, xp_reward) and backend (dueDate, xpReward) naming
    const taskDueDate = scheduled_for || dueDate;
    const taskXpReward = xp_reward || xpReward || 10;

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        habit_id: taskHabitId, // Can be null for standalone tasks
        user_id: userId,
        title,
        description,
        due_date: taskDueDate,
        xp_reward: taskXpReward,
      })
      .select()
      .single();

    if (error) {
      console.error("Task creation error:", error);
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

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("*, habits(title, color)")
      .eq("user_id", userId)
      .eq("due_date", today)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Get today tasks error:", error);
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

    // Get task details - use admin client
    const { data: task, error: taskError } = await supabaseAdmin
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

    // Mark task as complete - use admin client
    const { error: updateError } = await supabaseAdmin
      .from("tasks")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Award XP - use admin client
    await supabaseAdmin.from("xp_logs").insert({
      user_id: userId,
      task_id: id,
      amount: task.xp_reward,
      source: "task_completion",
      description: `Completed: ${task.title}`,
      reason: "Task completion",
    });

    // Update total XP in profile - use admin client
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();

    const newTotalXp = (profile?.total_xp || 0) + task.xp_reward;
    const newLevel = Math.floor(newTotalXp / 100) + 1; // 100 XP per level

    await supabaseAdmin
      .from("profiles")
      .update({ total_xp: newTotalXp, level: newLevel })
      .eq("id", userId);

    // Update streak - use admin client
    const today = new Date().toISOString().split("T")[0];
    const { data: streak } = await supabaseAdmin
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

      await supabaseAdmin
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

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
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

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Use admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete task error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompletedTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("user_id", userId)
      .eq("is_completed", true)
      .select();

    if (error) {
      console.error("Delete completed tasks error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "Completed tasks deleted successfully",
      deletedCount: data?.length || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
