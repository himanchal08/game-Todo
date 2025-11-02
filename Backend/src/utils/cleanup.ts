import { supabase, supabaseAdmin } from "../config/supabase";

/**
 * Delete proofs older than specified days
 * Removes both database records and storage files
 */
export const deleteOldProofs = async (daysOld: number = 90) => {
  try {
    console.log(`🧹 Starting cleanup of proofs older than ${daysOld} days...`);

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Get old proofs
    const { data: oldProofs, error } = await supabase
      .from("proof_snaps")
      .select("id, image_url")
      .lt("created_at", cutoffDate.toISOString());

    if (error) {
      console.error("❌ Error fetching old proofs:", error);
      return { success: false, error };
    }

    if (!oldProofs || oldProofs.length === 0) {
      console.log("✅ No old proofs to delete");
      return { success: true, deleted: 0 };
    }

    console.log(`📦 Found ${oldProofs.length} old proofs to delete`);

    // Extract file paths from URLs
    const filePaths = oldProofs
      .map((proof) => {
        try {
          const urlParts = proof.image_url.split("/proof-snaps/");
          return urlParts[1];
        } catch (err) {
          console.error("Error parsing URL:", proof.image_url);
          return null;
        }
      })
      .filter((path) => path !== null) as string[];

    // Delete from storage (in batches of 100)
    const batchSize = 100;
    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const { error: storageError } = await supabase.storage
        .from("proof-snaps")
        .remove(batch);

      if (storageError) {
        console.error("⚠️ Error deleting batch from storage:", storageError);
      } else {
        console.log(`✅ Deleted ${batch.length} files from storage`);
      }
    }

    // Delete from database
    const proofIds = oldProofs.map((p) => p.id);
    const { error: dbError } = await supabaseAdmin
      .from("proof_snaps")
      .delete()
      .in("id", proofIds);

    if (dbError) {
      console.error("❌ Error deleting from database:", dbError);
      return { success: false, error: dbError };
    }

    console.log(`✅ Successfully deleted ${oldProofs.length} old proofs`);
    return { success: true, deleted: oldProofs.length };
  } catch (error) {
    console.error("❌ Cleanup error:", error);
    return { success: false, error };
  }
};

/**
 * Start scheduled cleanup job
 * Runs daily at midnight
 */
export const startCleanupSchedule = () => {
  // Run cleanup every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  setInterval(() => {
    deleteOldProofs(90);
  }, TWENTY_FOUR_HOURS);

  // Run immediately on startup
  console.log("🚀 Cleanup scheduler started");
  deleteOldProofs(90);
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = async (userId?: string) => {
  try {
    let query = supabase.from("proof_snaps").select("*", { count: "exact" });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error fetching storage stats:", error);
      return null;
    }

    // Estimate storage (average 300KB per compressed image)
    const estimatedStorageMB = ((count || 0) * 300) / 1024;

    return {
      totalProofs: count || 0,
      estimatedStorageMB: Math.round(estimatedStorageMB * 100) / 100,
    };
  } catch (error) {
    console.error("Storage stats error:", error);
    return null;
  }
};
