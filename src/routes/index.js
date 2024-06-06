import express from 'express';
import authRoutes from './auth.js';
import dashboardRoutes from './dashboard.js';

const router = express.Router();

// Use the routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
