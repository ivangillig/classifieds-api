import express from 'express'
import authRoutes from './auth.js'
import adsRoutes from './listings.js'
import dashboardRoutes from './dashboard.js'
import locationRoutes from './location.js'
import userRoutes from './user.js'
import adminRoutes from './admin.js'

const router = express.Router()

// Use the routes
router.use('/api/auth', authRoutes)
router.use('/api/listings', adsRoutes)
router.use('/api/dashboard', dashboardRoutes)
router.use('/api/location', locationRoutes)
router.use('/api/user', userRoutes)
router.use('/api/admin', adminRoutes)

export default router
