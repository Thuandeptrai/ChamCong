import { Router } from 'express';
import { 
    createDepartmentController ,
    getpagingDepartmentController,
    deleteDepartmentController,
    updateDepartmentController,
    getbyIdDepartmentController,
    getAllDepartmentController
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();
router.post('/create',authenticate ,createDepartmentController);
router.get('/getpaging',authenticate ,getpagingDepartmentController);
router.delete('/delete/:id',authenticate ,deleteDepartmentController);
router.put('/update/:id',authenticate ,updateDepartmentController);
router.get('/getbyId/:id',authenticate ,getbyIdDepartmentController);
router.get('/getAll/',authenticate ,getAllDepartmentController);



export default router;