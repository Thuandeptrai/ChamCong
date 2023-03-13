import { authenticate } from '../middleware';
import { Router } from 'express';
import { 
    // listTicketsSupportController,
    createTicketsSupportController,getpagingSupportByUserId,getpagingSupport,getByIdSupport ,updateSupport} from '../controllers';

const router = Router();

// router.get('/getpaging', listTicketsSupportController);
router.post('/create',authenticate, createTicketsSupportController);
router.get('/getpagingSupportByUserId',authenticate, getpagingSupportByUserId);
router.get('/getpaging',authenticate, getpagingSupport);
router.post('/getById',authenticate, getByIdSupport);
router.put('/update/:id', authenticate, updateSupport)



export default router;