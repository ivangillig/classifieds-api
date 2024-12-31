// src/controllers/listingController.js

import { validationResult } from 'express-validator'
import {
  createReportForListing,
  getListings,
  getListingById,
  createNewListing,
  getListingsByUser,
  toggleListingStatusService,
  deleteListingService,
  editListingService,
  renewListingService,
  approveListingService,
} from '../services/listingService.js'
import {
  buildSuccessResponse,
  getServerErrorResponse,
  getBusinessErrorResponse,
} from '../utils/responseUtils.js'
import {
  ERROR_LISTINGS_FETCH_FAILED,
  ERROR_LISTING_FETCH_FAILED,
  ERROR_LISTING_NOT_FOUND,
  SUCCESS_LISTING_CREATED,
  ERROR_REPORT_CREATION_FAILED,
  SUCCESS_REPORT_CREATED,
  SUCCESS_LISTING_REACTIVATED,
  SUCCESS_LISTING_PAUSED,
  ERROR_LISTING_DELETE_FAILED,
  SUCCESS_LISTING_DELETED,
  SUCCESS_LISTING_UPDATED,
  ERROR_UPDATING_LISTING,
  SUCCESS_LISTING_RENEWED,
  ERROR_LISTING_RENEW_FAILED,
  SUCCESS_LISTING_APPROVED,
  ERROR_LISTING_APPROVE_FAILED,
} from '../constants/messages.js'

/**
 * Controller to fetch listings with pagination and optional search query.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const fetchListings = async (req, res, next) => {
  const { province, query } = req.query
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit) || 12

  try {
    const { listings, total } = await getListings(province, page, limit, query)
    res.status(200).json(
      buildSuccessResponse({
        data: listings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    )
  } catch (error) {
    console.error(ERROR_LISTINGS_FETCH_FAILED, error)
    next(getServerErrorResponse(ERROR_LISTINGS_FETCH_FAILED, error))
  }
}

/**
 * Controller to fetch a specific listing by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const fetchListingById = async (req, res, next) => {
  const { id } = req.params

  try {
    const listing = await getListingById(id)
    res.status(200).json(buildSuccessResponse({ data: listing }))
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      return res
        .status(404)
        .json(getBusinessErrorResponse(ERROR_LISTING_NOT_FOUND))
    }

    console.error(ERROR_LISTING_FETCH_FAILED, error)
    next(getServerErrorResponse(ERROR_LISTING_FETCH_FAILED, error))
  }
}

/**
 * Controller to create a new listing.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const createListing = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(getBusinessErrorResponse(errors.array()[0].msg))
  }

  const {
    title,
    age,
    description,
    location,
    photos,
    price,
    phone,
    useWhatsApp,
  } = req.body

  try {
    const newListing = await createNewListing({
      title,
      age,
      description,
      location,
      photos,
      price,
      phone,
      useWhatsApp,
      userId: req.user.id,
    })

    res.status(201).json(
      buildSuccessResponse({
        data: { listing: newListing },
        message: SUCCESS_LISTING_CREATED,
      })
    )
  } catch (error) {
    console.error(ERROR_LISTING_FETCH_FAILED, error)
    next(getServerErrorResponse(ERROR_LISTING_FETCH_FAILED, error))
  }
}

/**
 * Controller to create a report for a listing.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const createReport = async (req, res, next) => {
  const { listingId, reason, additionalInfo, contactInfo } = req.body

  try {
    const report = await createReportForListing({
      listingId,
      reason,
      additionalInfo,
      contactInfo,
    })

    res.status(201).json(
      buildSuccessResponse({
        data: { report },
        message: SUCCESS_REPORT_CREATED,
      })
    )
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      return res
        .status(404)
        .json(getBusinessErrorResponse(ERROR_LISTING_NOT_FOUND))
    }

    console.error(ERROR_REPORT_CREATION_FAILED, error)
    next(getServerErrorResponse(ERROR_REPORT_CREATION_FAILED, error))
  }
}

/**
 * Controller to fetch listings of the authenticated user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const fetchUserListings = async (req, res, next) => {
  const userId = req.user.id
  const { status } = req.query
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 10

  try {
    const { listings, total } = await getListingsByUser(
      userId,
      status,
      page,
      limit
    )

    res.status(200).json(
      buildSuccessResponse({
        data: listings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    )
  } catch (error) {
    console.error(ERROR_LISTINGS_FETCH_FAILED, error)
    next(getServerErrorResponse(ERROR_LISTINGS_FETCH_FAILED, error))
  }
}

/**
 * Controller to pause or reactivate a listing.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const toggleListingStatus = async (req, res, next) => {
  const { id: listingId } = req.params
  const userId = req.user.id

  try {
    const updatedListing = await toggleListingStatusService(listingId, userId)

    res.status(200).json(
      buildSuccessResponse({
        data: updatedListing,
        message:
          updatedListing.status === 'paused'
            ? SUCCESS_LISTING_PAUSED
            : SUCCESS_LISTING_REACTIVATED,
      })
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Controller to delete a listing.
 * Performs a logical delete by setting `isDeleted` to `true`.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const deleteListing = async (req, res, next) => {
  const { id: listingId } = req.params
  const userId = req.user.id

  try {
    const deletedListing = await deleteListingService(listingId, userId)

    res.status(200).json(
      buildSuccessResponse({
        data: deletedListing,
        message: SUCCESS_LISTING_DELETED,
      })
    )
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      return res
        .status(404)
        .json(getBusinessErrorResponse(ERROR_LISTING_NOT_FOUND))
    }

    next(getServerErrorResponse(ERROR_LISTING_DELETE_FAILED, error))
  }
}

/**
 * Controller to update an existing listing.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const editListing = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(getBusinessErrorResponse(errors.array()[0].msg))
  }

  const { id: listingId } = req.params
  const userId = req.user.id
  const {
    title,
    age,
    description,
    location,
    price,
    phone,
    useWhatsApp,
    photos,
    removedImages,
  } = req.body

  try {
    const editedListing = await editListingService(
      listingId,
      userId,
      {
        title,
        age,
        description,
        location,
        price,
        phone,
        useWhatsApp,
        photos,
      },
      removedImages
    )

    res.status(200).json(
      buildSuccessResponse({
        data: editedListing,
        message: SUCCESS_LISTING_UPDATED,
      })
    )
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      return res
        .status(404)
        .json(getBusinessErrorResponse(ERROR_LISTING_NOT_FOUND))
    }

    console.error('Error updating listing:', error)
    next(getServerErrorResponse(ERROR_UPDATING_LISTING, error))
  }
}

/**
 * Controller to renew a listing.
 * Extends the listing's validity for 30 days.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const renewListing = async (req, res, next) => {
  const { id: listingId } = req.params
  const userId = req.user.id

  try {
    const renewedListing = await renewListingService(listingId, userId)

    res.status(200).json(
      buildSuccessResponse({
        data: renewedListing,
        message: SUCCESS_LISTING_RENEWED,
      })
    )
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      return res
        .status(404)
        .json(getBusinessErrorResponse(ERROR_LISTING_NOT_FOUND))
    }

    console.error('Error renewing listing:', error)
    next(getServerErrorResponse(ERROR_LISTING_RENEW_FAILED, error))
  }
}

/**
 * Controller to approve a listing.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const approveListing = async (req, res, next) => {
  const { id: listingId } = req.params;

  try {
    const approvedListing = await approveListingService(listingId);
    res.status(200).json(
      buildSuccessResponse({
        data: approvedListing,
        message: SUCCESS_LISTING_APPROVED,
      })
    );
  } catch (error) {
    next(getServerErrorResponse(ERROR_LISTING_APPROVE_FAILED, error));
  }
};
