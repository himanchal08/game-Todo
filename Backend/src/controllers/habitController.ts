import { Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";
import { AuthRequest } from "../middlewares/authMiddleware";
import { generateTaskBreakdown } from "../services/aiService";
import { logUserActivity } from "../services/analyticsService";

export const createHabit = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      name,
      description,
      category,
      frequency,
      targetCount,
      target_count,
      color,
      reminder_time,
    } = req.body;
    const userId = req.user?.id;

    // Support both frontend (name) and backend (title) naming
    const habitTitle = title || name;
    const habitTargetCount = target_count || targetCount || 1;

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("habits")
      .insert({
        user_id: userId,
        title: habitTitle,
        description,
        category,
        frequency: frequency || "daily",
        target_count: habitTargetCount,
        color: color || "#3B82F6",
      })
      .select()
      .single();

    if (error) {
      console.error("Habit creation error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Initialize streak for this habit - use admin client
    await supabaseAdmin.from("streaks").insert({
      habit_id: data.id,
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
    });

    res.status(201).json({ habit: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getHabits = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    console.log(`Fetching habits for user: ${userId}`);

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("habits")
      .select("*, streaks(*)")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get habits error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log(`Found ${data?.length || 0} habits`);
    res.json({ habits: data });
  } catch (error: any) {
    console.error("Get habits exception:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getHabitById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("habits")
      .select("*, streaks(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      return res.status(404).json({ error: "Habit not found" });
    }

    res.json({ habit: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("habits")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ habit: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Soft delete - use admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from("habits")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Habit deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// AI Breakdown for habit (returns suggested subtasks as tasks)
export const habitAiBreakdown = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { data: habit, error: habitErr } = await supabaseAdmin
      .from("habits")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (habitErr || !habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const { maxParts, targetTimeMinutes } = req.body || {};

    const aiResult = await generateTaskBreakdown({
      title: habit.title || habit.name,
      description: habit.description || "",
      maxParts: Number(maxParts) || 6,
      targetTimeMinutes: Number(targetTimeMinutes) || undefined,
    });

    res.json({ habitId: id, ...aiResult });
  } catch (error: any) {
    console.error("Habit AI breakdown error:", error);
    res.status(500).json({ error: error.message || "AI breakdown failed" });
  }
};

// Accept AI breakdown for habit: create tasks linked to the habit
export const acceptHabitBreakdown = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // habit id
    const userId = req.user?.id;
    const { subtasks, applyXp } = req.body || {};

    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      return res.status(400).json({ error: "subtasks array is required" });
    }

    const { data: habit, error: habitErr } = await supabaseAdmin
      .from("habits")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (habitErr || !habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const now = new Date().toISOString();
    const rows = subtasks.map((st: any) => ({
      habit_id: id,
      user_id: userId,
      title: st.title,
      description: st.description || "",
      xp_reward: st.suggestedXp || st.xp || 0,
      created_at: now,
      due_date: null,
    }));

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("tasks")
      .insert(rows)
      .select();

    if (insertErr) {
      console.error("Error inserting habit subtasks:", insertErr);
      return res.status(500).json({ error: insertErr.message });
    }

    let xpAwarded = 0;
    if (applyXp) {
      const xpRows = (inserted || []).map((t: any) => ({
        user_id: userId,
        task_id: t.id,
        amount: t.xp_reward || 0,
        source: "ai_habit_subtask",
        description: `AI suggested habit subtask: ${t.title}`,
        created_at: now,
      }));

      const { data: xpInserted, error: xpErr } = await supabaseAdmin
        .from("xp_logs")
        .insert(xpRows)
        .select();

      if (!xpErr && xpInserted) {
        xpAwarded = xpInserted.reduce((s: number, x: any) => s + (x.amount || 0), 0);

        const { data: profile, error: profileErr } = await supabaseAdmin
          .from("profiles")
          .select("total_xp")
          .eq("id", userId)
          .single();

        if (!profileErr && profile) {
          const newTotalXp = (profile.total_xp || 0) + xpAwarded;
          const newLevel = Math.floor(newTotalXp / 100) + 1;
          await supabaseAdmin
            .from("profiles")
            .update({ total_xp: newTotalXp, level: newLevel })
            .eq("id", userId);
        }
      }
    }

    try {
      if (inserted && inserted.length) {
        await logUserActivity(userId!, "task", inserted.length);
      }
      if (xpAwarded) await logUserActivity(userId!, "xp", xpAwarded);
    } catch (e) {
      console.warn("Analytics logging failed", e);
    }

    return res.status(201).json({ subtasks: inserted, xpAwarded });
  } catch (error: any) {
    console.error("acceptHabitBreakdown error:", error);
    return res.status(500).json({ error: error.message || "Failed to accept AI habit breakdown" });
  }
};
