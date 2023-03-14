import { Router } from 'express';
import dateToCheck from '../models/DateToCheck.model';
import { createDate, getAllDate, updateDate } from '../controllers';

const router = Router();

router.post('/createDate', createDate);
router.post('/:DateId', updateDate);
router.get("/getALL", getAllDate)

export default router;
