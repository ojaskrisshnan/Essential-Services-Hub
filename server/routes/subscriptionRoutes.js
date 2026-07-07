import express from 'express';
import { createSubscription, getSubscriptions, updateSubscription } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/subscription', protect, createSubscription);
router.get('/subscription', protect, getSubscriptions);
router.put('/subscription/:id', protect, updateSubscription);

export default router;
