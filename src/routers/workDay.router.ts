import { Router } from 'express';
import { getWorkDayByUserId } from '../controllers/workday.controller';
import { authenticate, authenticateforAdmin } from '../middleware';

const router = Router();

router.get('/getUser/:userId',authenticate, getWorkDayByUserId);

export default router;
