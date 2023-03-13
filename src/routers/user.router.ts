import { Router } from 'express';
import { syncDataUser, getUserBalance, getUserDetail, signUp,getpagingQLUser, getAllUser, verifyTokenEmail, getPaging, addUserCredit } from '../controllers';
import { authenticate, syncDataUserMiddleware } from '../middleware';

const router = Router();

router.get('/detail', authenticate, getUserDetail)
router.post('/sync-data', syncDataUser);
router.get('/balance',authenticate, getUserBalance)
router.post('/register', signUp)
router.get('/getpagingUser',authenticate, getpagingQLUser)
router.get(`/get-all`, authenticate, getAllUser)
router.get(`/:user_id/verify/:token`, verifyTokenEmail)
router.get(`/getpaging`, authenticate ,getPaging)
router.post(`/:id/addCredit`, authenticate, addUserCredit)


export default router;
