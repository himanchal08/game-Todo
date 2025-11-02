import { Router } from "express";
import {
  getHeatmap,
  getStats,
  getBadges,
  getAllBadges,
  checkBadges,
  getDashboard,
} from "../controllers/analyticsController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

// Analytics endpoints
router.get("/heatmap", getHeatmap);
router.get("/stats", getStats);
router.get("/dashboard", getDashboard);

// Badge endpoints
router.get("/badges", getBadges);
router.get("/badges/all", getAllBadges);
router.post("/badges/check", checkBadges);

export default router;
