import { Router } from 'express';
import dateToCheck from '../models/DateToCheck.model';
import { createDate, createDateForUser, getAllDate, getAllDateForUser, updateDate, updateDateForUser } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/createDateforUser',authenticate,createDateForUser );
router.post('/:DateId', updateDateForUser);
router.get("/getALL", getAllDateForUser)

export default router;
