import express from 'express';
import authRoutes from './auth.js';
import adsRoutes from './ads.js';
import dashboardRoutes from './dashboard.js';
import locationRoutes from './location.js';

const router = express.Router();

// Use the routes
router.use('/auth', authRoutes);
router.use('/ads', adsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/location', locationRoutes);

export default router;
