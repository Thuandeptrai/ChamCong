import { Router } from 'express';
import dateToCheck from '../models/DateToCheck.model';
import { createDate, createDateForUser, getAllDate, getAllDateForUser, updateDate, updateDateForUser } from '../controllers';

const router = Router();

router.post('/createDateforUser',createDateForUser );
router.post('/:DateId', updateDateForUser);
router.get("/getALL", getAllDateForUser)

export default router;
