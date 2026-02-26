import { Router } from 'express';
import { createPackage, getPackages, updatePackage, deletePackage } from '../controllers/packageController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';


const router = Router();

router.get('/', getPackages);
router.post('/', authenticate, authorizeAdmin, createPackage);
router.put('/:id', authenticate, authorizeAdmin, updatePackage);
router.delete('/:id', authenticate, authorizeAdmin, deletePackage);

export default router;
