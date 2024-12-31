import express from 'express'
import dotenv from 'dotenv'
import {
  authenticateUser,
  authorizeRoles,
} from '../middleware/authMiddleware.js'
import {
  validateQueryParameter,
  validateCreateListing,
  validateEditListing,
  validateCreateReport,
  validateFetchUserListings,
} from '../middleware/validationMiddleware.js'

import {
  createListing,
  editListing,
  deleteListing,
  fetchListings,
  fetchListingById,
  createReport,
  fetchUserListings,
  toggleListingStatus,
  renewListing,
  approveListing,
} from '../controllers/listingController.js'
import {
  uploadImages,
  deleteImagesController,
} from '../controllers/imageController.js'
import { ROLES } from '../constants/roles.js'

dotenv.config()

const router = express.Router()

router.get('/', validateQueryParameter, fetchListings)
router.post('/upload', authenticateUser, uploadImages)
router.post('/deleteImages', deleteImagesController)
router.post('/report', validateCreateReport, createReport)
router.post(
  '/createListing',
  authenticateUser,
  authorizeRoles(ROLES.USER),
  validateCreateListing,
  createListing
)
router.put('/:id', authenticateUser, validateEditListing, editListing)
router.get(
  '/my-listings',
  authenticateUser,
  validateFetchUserListings,
  fetchUserListings
)
router.patch('/:id/toggle-status', authenticateUser, toggleListingStatus)
router.patch('/:id/renewListing', authenticateUser, renewListing)
router.patch(
  '/:id/approve',
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.MODERATOR),
  approveListing
)
router.delete('/:id', authenticateUser, deleteListing)
router.get('/:id', fetchListingById)

export default router
