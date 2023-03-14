import { Router } from 'express';
import { checkOutForUser, createDateForUser, getAllDateForUser } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/createDateForUser',authenticate,createDateForUser );
router.post('/checkOutDateForUser', checkOutForUser);
router.get("/getALL", getAllDateForUser)

export default router;
