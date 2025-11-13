import { Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";
import { AuthRequest } from "../middlewares/authMiddleware";

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
