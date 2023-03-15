import { Router } from 'express';
import { checkValidToken, deleteById, getAllUser, signUp, updateUser } from '../controllers';
import { authenticate, authenticateforAdmin } from '../middleware';

const router = Router();
// check token
router.get('/init', authenticate, checkValidToken)
// dang ky  cho admin
router.get('/initForAdmin', authenticateforAdmin, checkValidToken)

router.post('/register',authenticateforAdmin, signUp)
// update
router.post('/:userId',authenticateforAdmin, updateUser)
// get alll user
router.get("/getAllUser", authenticateforAdmin , getAllUser)

router.get("/delete/:id", authenticateforAdmin , deleteById)

export default router;
