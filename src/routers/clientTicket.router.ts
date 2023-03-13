import { Router } from 'express';
import { syncClientTickets,getpagingClientTickets } from '../controllers';


const router = Router();
router.get('/getasyncClientTicket' ,syncClientTickets);
router.get('/getpaging' ,getpagingClientTickets);

export default router;