import { Router } from 'express';
import { syncDataUser, getUserBalance, getUserDetail, signUp,getpagingQLUser, getAllUser, verifyTokenEmail, getPaging, addUserCredit, checkValidToken } from '../controllers';
import { authenticate, authenticateforAdmin, syncDataUserMiddleware } from '../middleware';

const router = Router();

router.get('/init', authenticate, checkValidToken)

router.post('/register',authenticateforAdmin, signUp)


export default router;
