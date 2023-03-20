import { Router } from 'express';
import { getWorkDayByUserId } from '../controllers/workday.controller';
import { authenticateforAdmin } from '../middleware';

const router = Router();

router.get('/getUser/:userId',authenticateforAdmin, getWorkDayByUserId);

export default router;
