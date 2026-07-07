import express from 'express';
import { getProviders, createProvider, updateProvider, deleteProvider } from '../controllers/providerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/providers', getProviders);
router.post('/provider', protect, authorize('provider'), createProvider);
router.put('/provider/:id', protect, updateProvider);
router.delete('/provider/:id', protect, deleteProvider);

export default router;
