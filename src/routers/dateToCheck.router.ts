import { Router } from 'express';
import dateToCheck from '../models/DateToCheck.model';
import { createDate, getAllDate, updateDate } from '../controllers';

const router = Router();
router.put('/update/:DateId', updateDate);

router.post('/createDate', createDate);
router.get("/getALL", getAllDate)

export default router;
