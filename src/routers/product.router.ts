import { Router } from 'express';
import {
  syncDataProduct,
  getProductsBySubOrderPage,
  getProductDetailForConfig,
  getProductDetail,
  getpagingProduct,
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/sync-data', syncDataProduct);
router.get('/products-by-sub-order-page/:id', getProductsBySubOrderPage);
router.get('/product-detail/:id', getProductDetail);
router.get(
  '/product-detail-for-config/:id',
  authenticate,
  getProductDetailForConfig
);
router.get('/getpaging', getpagingProduct);


export default router;
