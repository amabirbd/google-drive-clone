import { Router } from 'express';
import { subscribeToPackage, getSubscriptionHistory, getActiveSubscription } from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/subscribe', authenticate, subscribeToPackage);
router.get('/history', authenticate, getSubscriptionHistory);
router.get('/active', authenticate, getActiveSubscription);

export default router;
