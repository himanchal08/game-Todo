import { Router } from 'express';
import { getXPHistory, getXPStats } from '../controllers/xpController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/history', getXPHistory);
router.get('/stats', getXPStats);

export default router;