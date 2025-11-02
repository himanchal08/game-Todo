import { Router } from "express";
import { getStreaks, recoverStreak } from "../controllers/streakController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getStreaks);
router.post("/recover", recoverStreak);

export default router;
