import { Router } from 'express';
import { syncDataPaymentMethod, getAllPaymentMethods } from '../controllers';

const router = Router();

router.post('/sync-data', syncDataPaymentMethod);

router.get('/', getAllPaymentMethods);

export default router;
