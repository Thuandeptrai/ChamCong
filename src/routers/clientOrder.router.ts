import { Router } from 'express';
import { authenticate } from '../middleware';
import {  asyncClientOrder,getpagingClientOrder } from '../controllers';

const router = Router();

router.get('/getasyncClientOrder' ,asyncClientOrder);
router.get('/getpaging',authenticate ,getpagingClientOrder);


export default router;