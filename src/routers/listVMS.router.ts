import { Router } from 'express';
import { authenticate, authorize, signature, syncListVMSMiddleware } from '../middleware';
import { destroyVms, getpagingListVMS, rebootVms, resetVms, shutDownVms, startVms, stopVms, syncListVMS, getVmsDetail } from '../controllers';

const router = Router();

router.post('/sync-data',authenticate ,syncListVMS);
router.get('/getpaging' ,authenticate,syncListVMSMiddleware,getpagingListVMS);
router.delete('/destroy/:service_id/:id', authenticate ,destroyVms)
router.post('/start/:service_id/:id', authenticate, startVms)
router.post('/stop/:service_id/:id', authenticate,stopVms)
router.post('/reboot/:service_id/:id', authenticate,rebootVms)
router.post('/reset/:service_id/:id', authenticate,resetVms)
router.post('/shutdown/:service_id/:id', authenticate, shutDownVms)
router.get('/:service_id/:id', authenticate, getVmsDetail)

export default router;