import { Router } from 'express';
import dateToCheck from '../models/DateToCheck.model';
import { createDate, updateDate } from '../controllers';

const router = Router();

router.post('/createDate', createDate);
router.post('/:DateId', updateDate);


export default router;
