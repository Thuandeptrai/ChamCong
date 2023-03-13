
import { Router } from 'express';
import { authenticate, authorize, signature } from '../middleware';
import { getpaging } from '../controllers';

const router = Router();

router.get('/getpaging' ,getpaging);


export default router;