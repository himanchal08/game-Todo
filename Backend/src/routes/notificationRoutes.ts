import { Router } from "express";
import {
  registerPushToken,
  removePushToken,
  getPreferences,
  updatePreferences,
  getNotificationHistory,
  markAsRead,
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
router.put("/:id/read", markAsRead);

export default router;
