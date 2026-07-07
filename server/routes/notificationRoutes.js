import express from 'express';
import { getNotifications, markNotificationsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

export default router;
