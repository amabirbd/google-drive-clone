import type { Response, NextFunction } from 'express';

import { prisma } from '../lib/prisma.js';

import type { AuthRequest } from './authMiddleware.js';

export const checkLimits = (action: 'FOLDER_CREATE' | 'FILE_UPLOAD') => {
    console.log("ACTION: ", action)
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const subscription = await prisma.subscription.findUnique({
                where: { userId },
                include: { package: true },
            });

            if (!subscription) return res.status(403).json({ error: 'No active subscription' });

            const pkg = subscription.package;

            console.log("PACKAGE: ", pkg)


            if (action === 'FOLDER_CREATE') {
                const folderCount = await prisma.folder.count({ where: { userId } });
                if (folderCount >= pkg.maxFolders) {
                    return res.status(403).json({ error: `Folder limit reached (${pkg.maxFolders})` });
                }

                const { parentId } = req.body;
                if (parentId) {
                    const parentFolder = await prisma.folder.findUnique({ where: { id: parentId } });
                    if (parentFolder && parentFolder.nestingLevel >= pkg.maxNestingLevel) {
                        return res.status(403).json({ error: `Nesting limit reached (Max Level ${pkg.maxNestingLevel})` });
                    }
                }
            }

            if (action === 'FILE_UPLOAD') {
                const fileCount = await prisma.file.count({ where: { userId } });
                if (fileCount >= pkg.totalFileLimit) {
                    return res.status(403).json({ error: `Total file limit reached (${pkg.totalFileLimit})` });
                }

                console.log("FILECOUNT: ", fileCount)


                const { folderId } = req.body || {};
                if (folderId) {
                    const filesInFolder = await prisma.file.count({ where: { folderId } });
                    console.log("FILES IN FOLDER: ", filesInFolder)

                    if (filesInFolder >= pkg.filesPerFolder) {
                        return res.status(403).json({ error: `Folder file limit reached (${pkg.filesPerFolder})` });
                    }
                }

                // File size and type checks are better handled by Multer or after upload parsing
                // We'll pass them to the request for the controller to use or check here if headers have it
            }

            next();
        } catch (error) {
            console.error("LIMIT ENFORCEMENT ERROR: ", error);
            res.status(500).json({ error: 'Limit enforcement failed' });
        }
    };
};
