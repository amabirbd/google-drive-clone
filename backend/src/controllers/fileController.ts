import type { Response } from 'express';

import { prisma } from '../lib/prisma.js';

import type { AuthRequest } from '../middleware/authMiddleware.js';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const file = (req as any).file;
        const { folderId } = (req as any).body;


        if (!userId || !file) return res.status(400).json({ error: 'Invalid upload' });

        // Final check for file size and type (redundant if Multer handles it, but safe)
        const subscription = await prisma.subscription.findUnique({
            where: { userId },
            include: { package: true },
        });

        if (!subscription) return res.status(403).json({ error: 'No subscription' });

        const pkg = subscription.package;
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > pkg.maxFileSizeMB) {
            fs.unlinkSync(file.path); // Delete the uploaded file
            return res.status(403).json({ error: `File size exceeds limit (${pkg.maxFileSizeMB}MB)` });
        }

        const newFile = await prisma.file.create({
            data: {
                name: file.originalname,
                path: file.path,
                size: file.size,
                type: file.mimetype,
                userId,
                folderId: folderId || null,
            },
        });

        res.status(201).json(newFile);
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
};

export const getFiles = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { folderId } = (req as any).query;


        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const files = await prisma.file.findMany({
            where: {
                userId,
                folderId: folderId ? (folderId as string) : null,
            },
        });

        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = (req as any).params;

        const userId = req.user?.userId;

        const file = await prisma.file.findFirst({ where: { id, userId } });
        if (!file) return res.status(404).json({ error: 'File not found' });

        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        await prisma.file.delete({ where: { id } });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
};
