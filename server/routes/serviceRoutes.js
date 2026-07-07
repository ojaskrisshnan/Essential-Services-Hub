import express from 'express';
import { getServices, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/services', getServices);
router.post('/services', protect, authorize('provider'), createService);
router.put('/services/:id', protect, updateService);
router.delete('/services/:id', protect, deleteService);

export default router;
