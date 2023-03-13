import express from 'express'
import { getActionByUserId, getActionHistory } from '../controllers/actionHistory.controller'
import { authenticate } from '../middleware'

const router = express.Router()

router.get('/', authenticate,getActionHistory)
router.get('/get-by-user', authenticate,getActionByUserId)


export default router