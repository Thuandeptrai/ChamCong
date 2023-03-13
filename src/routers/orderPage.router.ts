import { Router } from 'express';
import {
  syncDataOrderPage,
  getOrderPagesToShow,
  getSubOrderPagesByParent,
} from '../controllers';

const router = Router();

router.post('/sync-data', syncDataOrderPage);
router.get('/get-order-pages-to-show', getOrderPagesToShow);
router.get('/get-sub-order-pages-by-parent/:slug', getSubOrderPagesByParent);

export default router;
