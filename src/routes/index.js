import express from 'express';
import authRoutes from './auth.js';
import adsRoutes from './listings.js';
import dashboardRoutes from './dashboard.js';
import locationRoutes from './location.js';

const router = express.Router();

// Use the routes
router.use('/auth', authRoutes);
router.use('/listings', adsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/location', locationRoutes);

export default router;
