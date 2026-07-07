import express from 'express';
import { createBooking, getBookings, updateBookingStatus, deleteBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/booking', protect, createBooking);
router.get('/booking', protect, getBookings);
router.put('/booking/:id', protect, updateBookingStatus);
router.delete('/booking/:id', protect, deleteBooking);

export default router;
