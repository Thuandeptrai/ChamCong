import { Router } from 'express';
import { getWorkDayByUserId } from '../controllers/workday.controller';
import { authenticate, authenticateforAdmin } from '../middleware';
import { getWorkDayByMonth, getWorkDayByMonthForUser } from '../controllers/workList.controller';

const router = Router();

router.get('/getUser/:userId',authenticate, getWorkDayByUserId);
router.get('/getSalary/Salary',authenticate, getWorkDayByMonth);
router.get('/getSalary/Salary',authenticateforAdmin, getWorkDayByMonth);

router.get('/getSalary/Salary/:UserId',authenticateforAdmin, getWorkDayByMonthForUser);

export default router;
