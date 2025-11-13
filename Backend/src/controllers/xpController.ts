import { Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getXPHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Use admin client to bypass RLS - fetch with task details
    const { data, error } = await supabaseAdmin
      .from("xp_logs")
      .select("*, tasks(title, description)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Get XP history error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Enrich data with better descriptions
    const enrichedData = data?.map((log: any) => {
      // If we have a task title, use it
      if (log.tasks?.title) {
        return {
          ...log,
          description: `${log.tasks.title}`,
          source: log.source || "task_completion",
        };
      }

      // Otherwise use existing description or reason
      return {
        ...log,
        description: log.description || log.reason || "XP earned",
        source: log.source || "bonus",
      };
    });

    // Frontend expects { history: data }
    res.json({ history: enrichedData });
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
