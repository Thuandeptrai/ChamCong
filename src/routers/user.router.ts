import { Router } from 'express';
import { checkValidToken, getAllUser, signUp, updateUser, getUserDetail } from '../controllers';
import { authenticate, authenticateforAdmin } from '../middleware';

const router = Router();
// check token
router.get('/init', authenticateforAdmin, checkValidToken)
router.get('/initForUser', authenticate, checkValidToken)

// dang ky  cho admin
router.post('/register', authenticateforAdmin, signUp)
// update
router.patch('/:userId', authenticateforAdmin, updateUser)
//get detail
router.get("/getAllUser", authenticateforAdmin, getAllUser)

router.get('/:userId', authenticateforAdmin, getUserDetail)
// get alll user

export default router;
