import { Router } from "express";
import {
  registerPushToken,
  removePushToken,
  getPreferences,
  updatePreferences,
  getNotificationHistory,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendTestMotivation,
} from "../controllers/notificationController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

// Push token management
router.post("/token", registerPushToken);
router.delete("/token", removePushToken);

// Preferences
router.get("/preferences", getPreferences);
router.put("/preferences", updatePreferences);

// History
router.get("/history", getNotificationHistory);
router.get("/", getNotificationHistory); // Alias for convenience
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);

// Test notification
router.post("/test-motivation", sendTestMotivation);

export default router;
