import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
  getActivityHeatmap,
  getUserStatistics,
  updateUserStatistics,
} from "../services/analyticsService";
import {
  getUserBadges,
  getAllBadgesWithProgress,
  checkAndAwardBadges,
} from "../services/badgeService";

/**
 * Get 30-day activity heatmap
 */
export const getHeatmap = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const days = parseInt(req.query.days as string) || 30;

    const heatmap = await getActivityHeatmap(userId, days);

    if (!heatmap) {
      return res.status(500).json({ error: "Failed to generate heatmap" });
    }

    res.json({ heatmap, days });
  } catch (error: any) {
    console.error("Get heatmap error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user statistics
 */
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!;

    // Update statistics first
    await updateUserStatistics(userId);

    const stats = await getUserStatistics(userId);

    if (!stats) {
      return res.status(500).json({ error: "Failed to get statistics" });
    }

    res.json({ statistics: stats });
  } catch (error: any) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's earned badges
 */
export const getBadges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!;

    const badges = await getUserBadges(userId);

    res.json({ badges, total: badges.length });
  } catch (error: any) {
    console.error("Get badges error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all badges with progress
 */
export const getAllBadges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!;

    const badges = await getAllBadgesWithProgress(userId);

    const earnedCount = badges.filter((b: any) => b.is_earned).length;

    res.json({
      badges,
      total: badges.length,
      earned: earnedCount,
      progress: ((earnedCount / badges.length) * 100).toFixed(1),
    });
  } catch (error: any) {
    console.error("Get all badges error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Manually trigger badge check
 */
export const checkBadges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!;

    // Update statistics first
    await updateUserStatistics(userId);

    // Check and award new badges
    const newBadges = await checkAndAwardBadges(userId);

    res.json({
      message: `Checked badges for user`,
      newBadges,
      count: newBadges.length,
    });
  } catch (error: any) {
    console.error("Check badges error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get dashboard summary
 */
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!;

    // Update statistics
    await updateUserStatistics(userId);

    // Get all data
    const [stats, heatmap, badges] = await Promise.all([
      getUserStatistics(userId),
      getActivityHeatmap(userId, 30),
      getUserBadges(userId),
    ]);

    res.json({
      statistics: stats,
      heatmap,
      recent_badges: badges.slice(0, 5),
      total_badges: badges.length,
    });
  } catch (error: any) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
};
