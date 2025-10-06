// src/controllers/adminController.js

import { validationResult } from 'express-validator'
import Listing from '../models/Listing.js'
import {
  getListingsForAdmin,
  deleteListingService,
  approveListingService,
  getListingStatsForAdmin,
} from '../services/listingService.js'
import {
  buildSuccessResponse,
  getServerErrorResponse,
  getBusinessErrorResponse,
} from '../utils/responseUtils.js'
import {
  ERROR_LISTINGS_FETCH_FAILED,
  ERROR_LISTING_NOT_FOUND,
  ERROR_LISTING_STATUS_UPDATE_FAILED,
  ERROR_LISTING_DELETE_FAILED,
  ERROR_UPDATING_LISTING,
  SUCCESS_LISTING_STATUS_UPDATED,
  ERROR_ACCESS_DENIED,
} from '../constants/messages.js'
import { ROLES } from '../constants/roles.js'

/**
 * Get all listings for admin panel with pagination and filters
 */
export const getAdminListings = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(getBusinessErrorResponse(ERROR_ACCESS_DENIED))
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const {
      page = 1,
      limit = 10,
      query = '',
      status,
      province,
      userId,
      onlyWhatsApp,
      age,
      price,
    } = req.query

    const filters = {}
    if (status) filters.status = status
    if (province) filters.province = province
    if (userId) filters.userId = userId
    if (onlyWhatsApp !== undefined)
      filters.onlyWhatsApp = onlyWhatsApp === 'true'
    if (age) filters.age = age
    if (price) filters.price = JSON.parse(price)

    const result = await getListingsForAdmin(
      parseInt(page),
      parseInt(limit),
      query,
      filters
    )

    const response = buildSuccessResponse(result, null, {
      currentPage: parseInt(page),
      totalPages: Math.ceil(result.total / parseInt(limit)),
      totalListings: result.total,
    })

    res.status(200).json(response)
  } catch (error) {
    if (error.message === ERROR_LISTINGS_FETCH_FAILED) {
      return res.status(400).json(getBusinessErrorResponse(error.message))
    }
    res.status(500).json(getServerErrorResponse())
  }
}

/**
 * Approve a listing (change status to published)
 */
export const approveListing = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(getBusinessErrorResponse(ERROR_ACCESS_DENIED))
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const updatedListing = await approveListingService(id)

    const response = buildSuccessResponse({ data: updatedListing })
    res.status(200).json(response)
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      return res.status(404).json(getBusinessErrorResponse(error.message))
    }
    if (error.message === ERROR_UPDATING_LISTING) {
      return res.status(400).json(getBusinessErrorResponse(error.message))
    }
    res.status(500).json(getServerErrorResponse())
  }
}

/**
 * Update listing status to any valid status
 */
export const updateListingStatus = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(getBusinessErrorResponse(ERROR_ACCESS_DENIED))
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const { status } = req.body

    // Validate that the listing exists
    const listing = await Listing.findById(id)
    if (!listing) {
      return res
        .status(404)
        .json(getBusinessErrorResponse(ERROR_LISTING_NOT_FOUND))
    }

    // Update the status
    listing.status = status
    await listing.save()

    // Convert to plain object to avoid mongoose metadata
    const cleanListing = listing.toObject()

    const response = buildSuccessResponse(
      { data: cleanListing },
      SUCCESS_LISTING_STATUS_UPDATED
    )
    res.status(200).json(response)
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      return res.status(404).json(getBusinessErrorResponse(error.message))
    }
    if (error.message === ERROR_LISTING_STATUS_UPDATE_FAILED) {
      return res.status(400).json(getBusinessErrorResponse(error.message))
    }
    res.status(500).json(getServerErrorResponse())
  }
}

/**
 * Delete a listing (soft delete)
 */
export const deleteListing = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(getBusinessErrorResponse(ERROR_ACCESS_DENIED))
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { id } = req.params

    // For admin, we need the listing's actual userId
    const listing = await Listing.findById(id)
    if (!listing) {
      return res
        .status(404)
        .json(getBusinessErrorResponse(ERROR_LISTING_NOT_FOUND))
    }

    const deletedListing = await deleteListingService(id, listing.userId)

    const response = buildSuccessResponse({ data: deletedListing })
    res.status(200).json(response)
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      return res.status(404).json(getBusinessErrorResponse(error.message))
    }
    if (error.message === ERROR_LISTING_DELETE_FAILED) {
      return res.status(400).json(getBusinessErrorResponse(error.message))
    }
    res.status(500).json(getServerErrorResponse())
  }
}

/**
 * Get listing statistics for admin dashboard
 */
export const getListingStats = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(getBusinessErrorResponse(ERROR_ACCESS_DENIED))
    }

    const stats = await getListingStatsForAdmin()

    const response = buildSuccessResponse({ data: stats })
    res.status(200).json(response)
  } catch (error) {
    if (error.message === ERROR_LISTINGS_FETCH_FAILED) {
      return res.status(400).json(getBusinessErrorResponse(error.message))
    }
    res.status(500).json(getServerErrorResponse())
  }
}
