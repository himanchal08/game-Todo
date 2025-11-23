import { Router } from 'express';
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  habitAiBreakdown,
  acceptHabitBreakdown,
} from '../controllers/habitController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken); // All routes protected

router.post('/', createHabit);
router.get('/', getHabits);
router.get('/:id', getHabitById);
router.post('/:id/breakdown', habitAiBreakdown);
router.post('/:id/breakdown/accept', acceptHabitBreakdown);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

export default router;