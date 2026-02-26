import { Router } from 'express';
import { createFolder, getFolders, updateFolder, deleteFolder } from '../controllers/folderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createFolder);
router.get('/', authenticate, getFolders);
router.put('/:id', authenticate, updateFolder);
router.delete('/:id', authenticate, deleteFolder);

export default router;
