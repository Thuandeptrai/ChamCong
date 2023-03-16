import { Router } from 'express';
import { checkOutForUser, createDateForUser, getAllDateForUser } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/createDateForUser', authenticate, createDateForUser);
router.post('/checkOutDateForUser', authenticate, checkOutForUser);
router.get("/getAll", authenticate, getAllDateForUser)

export default router;
