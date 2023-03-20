import { Router } from 'express';
import { checkValidToken, getAllUser, signUp, updateUser, getUserDetail, deleteById } from '../controllers';
import { authenticate, authenticateforAdmin } from '../middleware';

const router = Router();
// check token
router.get('/init', authenticate, checkValidToken)
router.get('/initForUser', authenticate, checkValidToken)

// dang ky  cho admin
// update
router.put('update/:userId', authenticate, updateUser)

// get all user

router.get("/getAllUser", authenticate, getAllUser)
//get detail

router.get('/:userId', authenticateforAdmin, getUserDetail)

//init
router.get('/initForAdmin', authenticateforAdmin, checkValidToken)

//delete
router.post('/register', authenticateforAdmin, signUp)
// update
router.post('/:userId', authenticateforAdmin, updateUser)
// get alll user
router.get("/getAllUser", authenticateforAdmin, getAllUser)

router.delete("/delete/:id", authenticateforAdmin, deleteById)

export default router;
