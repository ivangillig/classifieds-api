import express from 'express'
import authRoutes from './auth.js'
import adsRoutes from './listings.js'
import dashboardRoutes from './dashboard.js'
import locationRoutes from './location.js'
import userRoutes from './user.js'

const router = express.Router()

// Use the routes
router.use('/auth', authRoutes)
router.use('/listings', adsRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/location', locationRoutes)
router.use('/user', userRoutes)

export default router
