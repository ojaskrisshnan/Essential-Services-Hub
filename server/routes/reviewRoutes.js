import express from 'express';
import { createReview, getReviews, replyToReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/review', protect, createReview);
router.get('/reviews', getReviews);
router.put('/reviews/:id/reply', protect, replyToReview);

export default router;
