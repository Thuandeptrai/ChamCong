import { Router } from "express";
import { deleteNotification, getNotificationByUserId, getPaging, insertNotification, updateNotification, getNotificationBySlug } from "../controllers/notification.controller";
import { authenticate } from "../middleware";

const router = Router()

router.get(`/get-by-slug`, authenticate, getNotificationBySlug)
router.get(`/getPaging`, authenticate, getPaging)
router.get(`/get-by-user`, authenticate, getNotificationByUserId)
router.post(`/`, authenticate, insertNotification)
router.delete(`/`, authenticate, deleteNotification)
router.put(`/`, authenticate, updateNotification)

export default router