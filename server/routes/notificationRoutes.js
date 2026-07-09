import express from 'express';
import { getNotifications, markNotificationsRead, deleteNotification, clearNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.delete('/notifications/:id', protect, deleteNotification);
router.delete('/notifications', protect, clearNotifications);

export default router;
