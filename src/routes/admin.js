// src/routes/admin.js

import express from 'express'
import { authenticateUser } from '../middleware/authMiddleware.js'
import {
  validateQueryParameter,
  validateIdParameter,
  validateUpdateStatus,
} from '../middleware/validationMiddleware.js'
import {
  getAdminListings,
  approveListing,
  updateListingStatus,
  deleteListing,
  getListingStats,
} from '../controllers/adminController.js'

const router = express.Router()

/**
 * @route GET /admin/stats
 * @desc Get listing statistics for admin dashboard
 * @access Private (Admin only)
 */
router.get('/stats', authenticateUser, getListingStats)

/**
 * @route GET /admin/listings
 * @desc Get all listings for admin panel with pagination and filters
 * @access Private (Admin only)
 */
router.get(
  '/listings',
  authenticateUser,
  validateQueryParameter,
  getAdminListings
)

/**
 * @route PUT /admin/listings/:id/approve
 * @desc Approve a listing (change status to published)
 * @access Private (Admin only)
 */
router.put(
  '/listings/:id/approve',
  authenticateUser,
  validateIdParameter,
  approveListing
)

/**
 * @route PUT /admin/listings/:id/status
 * @desc Update listing status to any valid status
 * @access Private (Admin only)
 */
router.put(
  '/listings/:id/status',
  authenticateUser,
  validateIdParameter,
  validateUpdateStatus,
  updateListingStatus
)

/**
 * @route DELETE /admin/listings/:id
 * @desc Delete a listing (soft delete)
 * @access Private (Admin only)
 */
router.delete(
  '/listings/:id',
  authenticateUser,
  validateIdParameter,
  deleteListing
)

export default router
