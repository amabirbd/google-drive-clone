import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

import authRoutes from './routes/authRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);





app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'SaaS File Management System API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { app };

