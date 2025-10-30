import { Router } from 'express';
import { getStreaks } from '../controllers/streakController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getStreaks);

export default router;