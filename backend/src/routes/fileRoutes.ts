import { Router } from 'express';
import multer from 'multer';
import { uploadFile, getFiles, deleteFile } from '../controllers/fileController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { checkLimits } from '../middleware/limitMiddleware.js';
import path from 'path';

const router = Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

router.post('/upload', authenticate, upload.single('file'), checkLimits('FILE_UPLOAD'), uploadFile);
router.get('/', authenticate, getFiles);
router.delete('/:id', authenticate, deleteFile);

export default router;
