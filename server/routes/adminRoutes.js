import express from 'express';
import { getAnalytics, getUsers, toggleUserBlock, toggleProviderApproval } from '../controllers/adminController.js';
import { getBookings } from '../controllers/bookingController.js';
import { getProviders } from '../controllers/providerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Enforce admin check on all sub-routes
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/orders', getBookings); // Maps GET /orders as requested
router.get('/providers', (req, res, next) => {
  // Sets query parameter approved to 'all' so that admin gets all approved/unapproved providers
  req.query.approved = 'all';
  next();
}, getProviders);

router.put('/users/:id/block', toggleUserBlock);
router.put('/providers/:id/approve', toggleProviderApproval);

export default router;
