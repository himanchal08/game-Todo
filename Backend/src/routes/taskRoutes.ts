import { Router } from 'express';
import {
  createTask,
  getTodayTasks,
  completeTask,
  getTasksByHabit,
} from '../controllers/taskController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createTask);
router.get('/today', getTodayTasks);
router.post('/:id/complete', completeTask);
router.get('/habit/:habitId', getTasksByHabit);

export default router;