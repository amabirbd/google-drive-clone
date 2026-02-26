import type { Request, Response } from 'express';

import { prisma } from '../lib/prisma.js';

import type { AuthRequest } from '../middleware/authMiddleware.js';



export const subscribeToPackage = async (req: AuthRequest, res: Response) => {
    try {
        const { packageId } = (req as any).body;

        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Move current active subscription to history
        const currentSubscription = await prisma.subscription.findUnique({
            where: { userId },
        });

        if (currentSubscription) {
            await prisma.subscriptionHistory.create({
                data: {
                    userId,
                    packageId: currentSubscription.packageId,
                    startDate: currentSubscription.startDate,
                },
            });

            await prisma.subscription.delete({ where: { userId } });
        }

        // Create new active subscription
        const newSubscription = await prisma.subscription.create({
            data: {
                userId,
                packageId,
            },
            include: { package: true },
        });

        res.json(newSubscription);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update subscription' });
    }
};

export const getSubscriptionHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const history = await prisma.subscriptionHistory.findMany({

            where: { userId },
            include: { package: true },
            orderBy: { endDate: 'desc' },
        });

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

export const getActiveSubscription = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const subscription = await prisma.subscription.findUnique({
            where: { userId },
            include: { package: true },
        });

        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active subscription' });
    }
};
