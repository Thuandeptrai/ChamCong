import { Router } from 'express';
import {
  syncDataInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoiceForDetail,
  getInvoicesByClient,
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/sync-data', authenticate, syncDataInvoice);
router.get('/all-invoices', authenticate, getAllInvoices);
router.get('/invoice-by-id/:id', authenticate, getInvoiceById);
router.get('/invoice-for-detail/:id', authenticate, getInvoiceForDetail);
router.get('/invoices-by-client-id', authenticate, getInvoicesByClient);

export default router;
