import { Router } from 'express';
import { checkValidToken, getAllUser, signUp, updateUser, getUserDetail, deleteById } from '../controllers';
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
router.get('/:userId', authenticateforAdmin, getUserDetail)
// get all user

router.get("/getAllUser", authenticateforAdmin, getAllUser)
//init
router.get('/initForAdmin', authenticateforAdmin, checkValidToken)

//delete
router.get("/delete/:id", authenticateforAdmin, deleteById)

export default router;
