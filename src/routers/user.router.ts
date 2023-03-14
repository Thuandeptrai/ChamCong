import { Router } from 'express';
import { syncDataUser, getUserBalance, getUserDetail, signUp,getpagingQLUser, getAllUser, verifyTokenEmail, getPaging, addUserCredit, checkValidToken, updateUser } from '../controllers';
import { authenticate, authenticateforAdmin, syncDataUserMiddleware } from '../middleware';

const router = Router();

router.get('/init', authenticate, checkValidToken)

router.post('/register',authenticateforAdmin, signUp)

router.post('/:userId', updateUser)
router.get("/getAllUser", authenticateforAdmin , getAllUser)

export default router;
