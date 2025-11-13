import { supabaseAdmin } from "../config/supabase";
import cron from "node-cron";

/**
 * Cleanup service to delete proof photos after 90 minutes
 * Runs every 30 minutes to check for expired photos
 */

const EXPIRY_MINUTES = 90;

export const cleanupExpiredProofs = async () => {
  try {
    console.log("🧹 Running proof cleanup service...");

    // Calculate cutoff time (90 minutes ago)
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - EXPIRY_MINUTES);

    // Find all proofs older than 90 minutes
    const { data: expiredProofs, error: fetchError } = await supabaseAdmin
      .from("proof_snaps")
      .select("id, image_url, user_id")
      .lt("created_at", cutoffTime.toISOString());

    if (fetchError) {
      console.error("❌ Error fetching expired proofs:", fetchError);
      return;
    }

    if (!expiredProofs || expiredProofs.length === 0) {
      console.log("✅ No expired proofs to delete");
      return;
    }

    console.log(`📸 Found ${expiredProofs.length} expired proofs to delete`);

    let successCount = 0;
    let errorCount = 0;

    // Delete each proof from storage and database
    for (const proof of expiredProofs) {
      try {
        // Extract file path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/proof-snaps/{userId}/{filename}
        const urlParts = proof.image_url.split("/proof-snaps/");
        if (urlParts.length < 2) {
          console.error(`❌ Invalid URL format for proof ${proof.id}`);
          errorCount++;
          continue;
        }

        const filePath = urlParts[1];

        // Delete from Supabase Storage
        const { error: storageError } = await supabaseAdmin.storage
          .from("proof-snaps")
          .remove([filePath]);

        if (storageError) {
          console.error(`❌ Error deleting file ${filePath}:`, storageError);
          errorCount++;
          continue;
        }

        // Delete record from database
        const { error: dbError } = await supabaseAdmin
          .from("proof_snaps")
          .delete()
          .eq("id", proof.id);

        if (dbError) {
          console.error(`❌ Error deleting proof record ${proof.id}:`, dbError);
          errorCount++;
          continue;
        }

        successCount++;
        console.log(`✅ Deleted proof ${proof.id} (${filePath})`);
      } catch (error) {
        console.error(`❌ Unexpected error deleting proof ${proof.id}:`, error);
        errorCount++;
      }
    }

    console.log(
      `🧹 Cleanup complete: ${successCount} deleted, ${errorCount} errors`
    );
  } catch (error) {
    console.error("❌ Cleanup service error:", error);
  }
};

/**
 * Start the automatic cleanup scheduler
 * Runs every 30 minutes
 */
export const startProofCleanupScheduler = () => {
  console.log("🚀 Starting proof cleanup scheduler (runs every 30 minutes)");

  // Run every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("⏰ Scheduled cleanup triggered");
    await cleanupExpiredProofs();
  });

  // Also run immediately on startup
  console.log("🔄 Running initial cleanup...");
  cleanupExpiredProofs();
};

/**
 * Manually trigger cleanup (useful for testing)
 */
export const triggerManualCleanup = async () => {
  console.log("🔧 Manual cleanup triggered");
  await cleanupExpiredProofs();
};
