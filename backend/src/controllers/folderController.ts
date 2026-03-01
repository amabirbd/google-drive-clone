import type { Response } from 'express';

import { prisma } from '../lib/prisma.js';

import type { AuthRequest } from '../middleware/authMiddleware.js';

export const createFolder = async (req: AuthRequest, res: Response) => {
    try {
        const { name, parentId } = (req as any).body;

        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // TODO: Implement subscription limit checks

        let nestingLevel = 0;
        if (parentId) {
            const parentFolder = await prisma.folder.findUnique({ where: { id: parentId } });
            if (parentFolder) {
                nestingLevel = parentFolder.nestingLevel + 1;
            }
        }

        const folder = await prisma.folder.create({
            data: {
                name,
                userId,
                parentId,
                nestingLevel,
            },
        });

        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create folder' });
    }
};

export const getFolders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { parentId } = (req as any).query;


        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const folders = await prisma.folder.findMany({
            where: {
                userId,
                parentId: parentId ? (parentId as string) : null,
            },
            include: {
                _count: {
                    select: { files: true, subFolders: true },
                },
            },
        });

        res.json(folders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
};

export const updateFolder = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = (req as any).params;
        const { name } = (req as any).body;

        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const folder = await prisma.folder.updateMany({
            where: { id, userId },
            data: { name },
        });

        if (folder.count === 0) return res.status(404).json({ error: 'Folder not found' });

        res.json({ message: 'Folder renamed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update folder' });
    }
};

export const deleteFolder = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = (req as any).params;

        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Recursive delete is usually handled by DB or manually. 
        // Prisma doesn't support recursive delete out of the box for self-relations without careful config.
        // For now, simple delete.
        const folder = await prisma.folder.deleteMany({
            where: { id, userId },
        });

        if (folder.count === 0) return res.status(404).json({ error: 'Folder not found' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete folder' });
    }
};
