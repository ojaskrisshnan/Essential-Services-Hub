import express from 'express';
import { createPayment, getInvoice } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/payment', protect, createPayment);
router.get('/invoice/:bookingId', protect, getInvoice);

export default router;
