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

    const taskHabitId = habitId || habit_id || null;

    const taskDueDate = scheduled_for || dueDate;
    const taskXpReward = xp_reward || xpReward || 10;

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

    // Update streak for ALL task completions
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Update habit-specific streak if task is linked to a habit
    if (task.habit_id) {
      const { data: habitStreak } = await supabaseAdmin
        .from("streaks")
        .select("*")
        .eq("habit_id", task.habit_id)
        .eq("user_id", userId)
        .single();

      if (habitStreak) {
        const lastDate = habitStreak.last_completed_date;
        let newStreak = habitStreak.current_streak;
        const oldStreak = habitStreak.current_streak;

        if (lastDate === yesterdayStr) {
          newStreak = habitStreak.current_streak + 1;
        } else if (lastDate === today) {
          newStreak = habitStreak.current_streak;
        } else {
          newStreak = 1;
        }

        const newLongest = Math.max(newStreak, habitStreak.longest_streak);

        await supabaseAdmin
          .from("streaks")
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_completed_date: today,
          })
          .eq("id", habitStreak.id);

        // Send milestone notifications for habit streaks at 3, 7, 14, 30, 50, 100 days
        const milestones = [3, 7, 14, 30, 50, 100];
        if (newStreak > oldStreak && milestones.includes(newStreak)) {
          const {
            sendStreakMilestone,
          } = require("../services/notificationService");
          const { data: habit } = await supabaseAdmin
            .from("habits")
            .select("title")
            .eq("id", task.habit_id)
            .single();

          await sendStreakMilestone(userId, newStreak, habit?.title);
        }
      }
    }

    // Update or create general "Daily Tasks" streak for all users
    const { data: generalStreak } = await supabaseAdmin
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .is("habit_id", null)
      .single();

    if (generalStreak) {
      // Update existing general streak
      const lastDate = generalStreak.last_completed_date;
      let newStreak = generalStreak.current_streak;
      const oldStreak = generalStreak.current_streak;

      if (lastDate === yesterdayStr) {
        newStreak = generalStreak.current_streak + 1;
      } else if (lastDate === today) {
        newStreak = generalStreak.current_streak;
      } else {
        newStreak = 1;
      }

      const newLongest = Math.max(newStreak, generalStreak.longest_streak);

      await supabaseAdmin
        .from("streaks")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_completed_date: today,
        })
        .eq("id", generalStreak.id);

      // Send milestone notifications for general task streak at 3, 7, 14, 30, 50, 100 days
      const milestones = [3, 7, 14, 30, 50, 100];
      if (newStreak > oldStreak && milestones.includes(newStreak)) {
        const {
          sendStreakMilestone,
        } = require("../services/notificationService");
        await sendStreakMilestone(userId, newStreak);
      }
    } else {
      // Create new general streak
      await supabaseAdmin.from("streaks").insert({
        user_id: userId,
        habit_id: null,
        current_streak: 1,
        longest_streak: 1,
        last_completed_date: today,
      });
    }

    // Log activity for analytics
    await logUserActivity(userId!, "task", 1);
    await logUserActivity(userId!, "xp", task.xp_reward);

    // Update user statistics for badge checking
    const { updateUserStatistics } = require("../services/analyticsService");
    await updateUserStatistics(userId!);

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
