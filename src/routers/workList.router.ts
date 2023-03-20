import { Router } from 'express';
import { checkValidToken, deleteById, getAllUser, signUp, updateUser } from '../controllers';
import { authenticate, authenticateforAdmin } from '../middleware';
import { getAllWorkListByMonth } from '../controllers/workList.controller';

const router = Router();
// check token
router.get("/getAllWorkListByMonth", authenticateforAdmin, getAllWorkListByMonth)


export default router;
