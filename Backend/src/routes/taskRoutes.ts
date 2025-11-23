import { Router } from "express";
import {
  createTask,
  getTodayTasks,
  completeTask,
  getTasksByHabit,
  deleteTask,
  deleteCompletedTasks,
} from "../controllers/taskController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.post("/", createTask);
router.get("/today", getTodayTasks);
router.post("/:id/complete", completeTask);
router.get("/habit/:habitId", getTasksByHabit);
router.delete("/:id", deleteTask);
router.delete("/completed", deleteCompletedTasks);

export default router;
