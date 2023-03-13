import { Router } from 'express';
import {
  getPagingService,
  syncService,
  createNewService,
  getServiceDetailForPayment,
  getServiceDetailsByIds,
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/sync-data', authenticate, syncService);
router.get('/get-paging', authenticate, getPagingService);
router.post('/create-new-service', authenticate, createNewService);
router.get(
  '/service-detail-for-payment/:id',
  authenticate,
  getServiceDetailForPayment
);

router.post(
  '/service-details-by-service',
  authenticate,
  getServiceDetailsByIds
);

export default router;
