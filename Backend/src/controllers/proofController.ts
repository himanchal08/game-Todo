import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "../config/supabase";
import { AuthRequest } from "../middlewares/authMiddleware";
import { randomUUID } from "crypto";
import sharp from "sharp";
import imghash from "imghash";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";

export const uploadProof = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.body;
    const userId = req.user?.id;
    const accessToken = req.accessToken;
    const file = req.file;

    // Create authenticated Supabase client with user's token
    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    // Debug logging
    console.log("Upload request received:");
    console.log("- Body:", req.body);
    console.log(
      "- File:",
      file ? `${file.originalname} (${file.size} bytes)` : "NO FILE"
    );
    console.log("- User ID:", userId);

    // Validation
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    // Verify task exists and belongs to user
    const { data: task, error: taskError } = await userSupabase
      .from("tasks")
      .select("*, habits(id, title)")
      .eq("id", taskId)
      .eq("user_id", userId)
      .single();

    console.log("Task query result:");
    console.log("- Error:", taskError);
    console.log("- Task:", task);

    if (taskError || !task) {
      console.error("Task not found or error:", taskError);
      return res.status(404).json({ error: "Task not found" });
    }

    // Generate perceptual hash for duplicate detection
    // Save buffer to temp file for imghash
    const tempPath = join(__dirname, `../../temp_${randomUUID()}.png`);
    writeFileSync(tempPath, file.buffer);
    const hash = await imghash.hash(tempPath, 16);
    // Clean up temp file
    unlinkSync(tempPath);

    // Check for duplicate images
    const { data: duplicateProof } = await userSupabase
      .from("proof_snaps")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("perceptual_hash", hash)
      .single();

    if (duplicateProof) {
      return res.status(400).json({
        error:
          "This image has already been used as proof. Please take a new photo.",
      });
    }

    // Compress image using sharp
    const compressedBuffer = await sharp(file.buffer)
      .resize(1024, 1024, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 75 })
      .toBuffer();

    console.log(
      `Image compressed: ${file.buffer.length} bytes → ${compressedBuffer.length} bytes`
    );

    // Generate unique filename
    const fileName = `${userId}/${randomUUID()}.jpg`;

    // Upload to Supabase Storage (use authenticated client)
    const { data: uploadData, error: uploadError } = await userSupabase.storage
      .from("proof-snaps")
      .upload(fileName, compressedBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = userSupabase.storage.from("proof-snaps").getPublicUrl(fileName);

    // Calculate frame type based on current streak
    const { data: streak } = await userSupabase
      .from("streaks")
      .select("current_streak")
      .eq("habit_id", task.habit_id)
      .eq("user_id", userId)
      .single();

    const currentStreak = streak?.current_streak || 0;
    let frameType = "basic";
    let xpBonus = 5;

    if (currentStreak >= 30) {
      frameType = "prestige";
      xpBonus = 20;
    } else if (currentStreak >= 7) {
      frameType = "gold";
      xpBonus = 10;
    }

    // Save proof record
    const { data: proofData, error: proofError } = await supabaseAdmin
      .from("proof_snaps")
      .insert({
        task_id: taskId,
        user_id: userId,
        image_url: publicUrl,
        perceptual_hash: hash,
        frame_type: frameType,
        xp_bonus: xpBonus,
      })
      .select()
      .single();

    if (proofError) {
      console.error("Proof record error:", proofError);
      return res.status(500).json({ error: "Failed to save proof record" });
    }

    // Award XP bonus
    await supabaseAdmin.from("xp_logs").insert({
      user_id: userId,
      task_id: taskId,
      amount: xpBonus,
      reason: `Photo proof bonus (${frameType} frame)`,
    });

    // Update user's total XP and level
    const { data: profile } = await userSupabase
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();

    const newTotalXp = (profile?.total_xp || 0) + xpBonus;
    const newLevel = Math.floor(newTotalXp / 100) + 1;

    await supabaseAdmin
      .from("profiles")
      .update({ total_xp: newTotalXp, level: newLevel })
      .eq("id", userId);

    res.status(201).json({
      message: "Proof uploaded successfully!",
      proof: proofData,
      xpBonus,
      frameType,
      currentStreak,
      newTotalXp,
      newLevel,
    });
  } catch (error: any) {
    console.error("Upload proof error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all proofs for a specific task
 */
export const getTaskProofs = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from("proof_snaps")
      .select("*")
      .eq("task_id", taskId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ proofs: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all proofs for current user
 */
export const getUserProofs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error } = await supabase
      .from("proof_snaps")
      .select("*, tasks(title, habits(title, color))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ proofs: data, total: data?.length || 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a proof (removes from storage and database)
 */
export const deleteProof = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get proof details
    const { data: proof, error: fetchError } = await supabase
      .from("proof_snaps")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Extract file path from URL
    const filePath = proof.image_url.split("/proof-snaps/")[1];

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("proof-snaps")
      .remove([filePath]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from("proof_snaps")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    res.json({ message: "Proof deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get proof statistics for user
 */
export const getProofStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Total proofs count
    const { count: totalProofs } = await supabase
      .from("proof_snaps")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Proofs by frame type
    const { data: frameStats } = await supabase
      .from("proof_snaps")
      .select("frame_type")
      .eq("user_id", userId);

    const frameCount = {
      basic: 0,
      gold: 0,
      prestige: 0,
    };

    frameStats?.forEach((proof) => {
      if (proof.frame_type in frameCount) {
        frameCount[proof.frame_type as keyof typeof frameCount]++;
      }
    });

    // Total XP earned from proofs
    const { data: xpLogs } = await supabase
      .from("xp_logs")
      .select("amount")
      .eq("user_id", userId)
      .like("reason", "%Photo proof bonus%");

    const totalXpFromProofs =
      xpLogs?.reduce((sum, log) => sum + log.amount, 0) || 0;

    res.json({
      totalProofs: totalProofs || 0,
      frameCount,
      totalXpFromProofs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
