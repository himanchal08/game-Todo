import { Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getXPHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("xp_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Get XP history error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Frontend expects { history: data }
    res.json({ history: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getXPStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Use admin client to bypass RLS
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("total_xp, level")
      .eq("id", userId)
      .single();

    const xpForNextLevel = (profile?.level || 1) * 100;
    const xpProgress = (profile?.total_xp || 0) % 100;

    res.json({
      totalXP: profile?.total_xp || 0,
      currentLevel: profile?.level || 1,
      xpForNextLevel,
      xpProgress,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
