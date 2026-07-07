import express from 'express';
import { createComplaint, getComplaints, resolveComplaint } from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/complaint', protect, createComplaint);
router.get('/complaints', protect, getComplaints);
router.put('/complaints/:id', protect, resolveComplaint);

export default router;
