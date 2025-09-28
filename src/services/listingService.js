// src/services/listingService.js

import mongoose from 'mongoose'
import Listing from '../models/Listing.js'
import Location from '../models/Location.js'
import Report from '../models/Report.js'
import { PUBLISHED_STATUS_FILTER, STATUS } from '../utils/businessConstants.js'

import {
  ERROR_LISTINGS_FETCH_FAILED,
  ERROR_LISTING_FETCH_FAILED,
  ERROR_LISTING_NOT_FOUND,
  ERROR_REPORT_CREATION_FAILED,
  ERROR_LISTING_STATUS_UPDATE_FAILED,
  ERROR_LISTING_DELETE_FAILED,
  ERROR_UPDATING_LISTING,
} from '../constants/messages.js'

/**
 * Fetch listings by province or city with pagination and optional search query.
 * @param {string} province - The name of the province or city to filter listings.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of listings per page.
 * @param {string} query - The search query to filter listings.
 * @param {Object} filters - Additional filters for the listing search.
 * @returns {Promise<Object>} - A promise resolving to an object containing listings and total count.
 */
export const getListings = async (
  province,
  page = 1,
  limit = 10,
  query = '',
  filters = {}
) => {
  try {
    const skip = (page - 1) * limit

    // Find matching locations by province code or city name
    // Also need to search by province name via join with Province model
    const locations = await Location.aggregate([
      {
        $lookup: {
          from: 'provinces',
          localField: 'province_code',
          foreignField: 'code',
          as: 'province',
        },
      },
      {
        $match: {
          $or: [
            { province_code: province },
            { name: new RegExp(province, 'i') },
            { 'province.name': new RegExp(province, 'i') },
          ],
        },
      },
      {
        $project: { _id: 1 },
      },
    ])

    // Build search filter
    const searchFilter = query
      ? {
          $or: [
            { title: new RegExp(query, 'i') },
            { description: new RegExp(query, 'i') },
          ],
        }
      : {}

    // Build additional filters
    const additionalFilters = {}
    if (filters.onlyWhatsApp == true) {
      additionalFilters.useWhatsApp = filters.onlyWhatsApp
    }
    if (filters.age) {
      additionalFilters.age = filters.age
    }
    if (filters.price) {
      additionalFilters.price = filters.price
    }
    if (filters.location) {
      additionalFilters.location = filters.location
    }

    // Fetch listings with pagination
    const [listings, total] = await Promise.all([
      Listing.find({
        ...PUBLISHED_STATUS_FILTER,
        isDeleted: false,
        location: { $in: locations.map((location) => location._id) },
        ...searchFilter,
        ...additionalFilters,
      })
        .populate('location', 'name province_code department_name country')
        .skip(skip)
        .limit(limit),
      Listing.countDocuments({
        location: { $in: locations.map((location) => location._id) },
        ...searchFilter,
        ...additionalFilters,
      }),
    ])

    return { listings, total }
  } catch (error) {
    throw new Error(ERROR_LISTINGS_FETCH_FAILED)
  }
}

/**
 * Fetch a listing by its ID.
 * @param {string} id - The ID of the listing.
 * @returns {Promise<Object>} - A promise resolving to the listing object.
 */
export const getListingById = async (id) => {
  try {
    const listing = await Listing.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'location',
          foreignField: '_id',
          as: 'location',
        },
      },
      {
        $unwind: '$location',
      },
      {
        $lookup: {
          from: 'provinces',
          localField: 'location.province_code',
          foreignField: 'code',
          as: 'location.province',
        },
      },
      {
        $unwind: {
          path: '$location.province',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          // Include all listing fields
          title: 1,
          age: 1,
          description: 1,
          photos: 1,
          price: 1,
          phone: 1,
          useWhatsApp: 1,
          status: 1,
          userId: 1,
          reports: 1,
          validUntil: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          // Include location with simplified province info
          'location._id': 1,
          'location.name': 1,
          'location.province_code': 1,
          'location.department_name': 1,
          'location.country': 1,
          'location.province._id': 1,
          'location.province.code': 1,
          'location.province.name': 1,
        },
      },
    ])

    if (!listing || listing.length === 0) {
      throw new Error(ERROR_LISTING_NOT_FOUND)
    }

    return listing[0]
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      throw error
    }
    throw new Error(ERROR_LISTING_FETCH_FAILED)
  }
}

/**
 * Create a new listing.
 * @param {Object} listingData - The data for the new listing.
 * @returns {Promise<Object>} - A promise resolving to the created listing.
 */
export const createNewListing = async (listingData) => {
  try {
    const newListing = new Listing(listingData)
    await newListing.save()
    return newListing
  } catch (error) {
    throw new Error(ERROR_LISTING_FETCH_FAILED)
  }
}

/**
 * Create a new report for a listing.
 * @param {Object} reportData - The data for the report.
 * @returns {Promise<Object>} - A promise resolving to the created report.
 */
export const createReportForListing = async (reportData) => {
  const { listingId, reason, additionalInfo, contactInfo } = reportData

  try {
    // Check if listing exists
    const listing = await Listing.findById(listingId)
    if (!listing) {
      throw new Error(ERROR_LISTING_NOT_FOUND)
    }

    // Create and save the report
    const report = new Report({
      listingId,
      reason,
      additionalInfo,
      contactInfo,
    })
    await report.save()

    // Increment the report count on the listing
    listing.reports = (listing.reports || 0) + 1
    await listing.save()

    return report
  } catch (error) {
    console.log(error)

    if (error.message === ERROR_LISTING_NOT_FOUND) {
      throw error
    }
    throw new Error(ERROR_REPORT_CREATION_FAILED)
  }
}

/**
 * Fetch listings by user with optional status filter.
 * @param {string} userId - The ID of the authenticated user.
 * @param {string} status - Optional status to filter listings (e.g., "published").
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of listings per page.
 * @returns {Promise<Object>} - A promise resolving to an object containing listings and total count.
 */
export const getListingsByUser = async (
  userId,
  status,
  page = 1,
  limit = 10
) => {
  try {
    const skip = (page - 1) * limit

    // Dinamic filter
    const filter = { userId, isDeleted: false }
    if (status) filter.status = status

    // Find listings
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('location', 'name province_code department_name country')
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(filter),
    ])

    return { listings, total }
  } catch (error) {
    throw new Error(ERROR_LISTINGS_FETCH_FAILED)
  }
}

/**
 * Service to pause or reactivate a listing.
 * @param {string} listingId - The ID of the listing to pause.
 * @param {string} userId - The ID of the user making the request.
 * @returns {Promise<Object>} - A promise resolving to the updated listing.
 */
export const toggleListingStatusService = async (listingId, userId) => {
  try {
    const listing = await Listing.findOne({ _id: listingId, userId })

    if (!listing) throw new Error(ERROR_LISTING_NOT_FOUND)

    const newStatus =
      listing.status === STATUS.PAUSED ? STATUS.PUBLISHED : STATUS.PAUSED

    const updatedListing = await Listing.findOneAndUpdate(
      { _id: listingId, userId },
      { status: newStatus },
      { new: true }
    )

    return updatedListing
  } catch (error) {
    throw new Error(ERROR_LISTING_STATUS_UPDATE_FAILED)
  }
}

/**
 * Service to logically delete a listing.
 * Sets the `isDeleted` field to `true`.
 * @param {string} listingId - The ID of the listing to delete.
 * @param {string} userId - The ID of the user making the request.
 * @returns {Promise<Object>} - A promise resolving to the updated listing.
 */
export const deleteListingService = async (listingId, userId) => {
  try {
    const listing = await Listing.findOne({ _id: listingId, userId })

    if (!listing) throw new Error(ERROR_LISTING_NOT_FOUND)

    const deletedListing = await Listing.findOneAndUpdate(
      { _id: listingId, userId },
      { isDeleted: true },
      { new: true }
    )

    return deletedListing
  } catch (error) {
    throw new Error(ERROR_LISTING_DELETE_FAILED)
  }
}

/**
 * Update an existing listing.
 * @param {string} listingId - The ID of the listing.
 * @param {string} userId - The ID of the user making the request.
 * @param {Object} listingData - The new listing data.
 * @param {Array<string>} removedImages - The URLs of images to be removed.
 * @returns {Promise<Object>} - A promise resolving to the updated listing.
 */
export const editListingService = async (
  listingId,
  userId,
  listingData,
  removedImages
) => {
  try {
    // Verify the listing exists and belongs to the user
    const listing = await Listing.findOne({ _id: listingId, userId })
    if (!listing) throw new Error(ERROR_LISTING_NOT_FOUND)

    // Update the listing
    const updatedListing = await Listing.findOneAndUpdate(
      { _id: listingId, userId },
      { ...listingData, status: STATUS.UNDER_REVIEW },
      { new: true }
    )

    // Remove images if necessary
    if (removedImages && removedImages.length > 0) {
      await deleteImages(removedImages) // Call to delete images from storage
    }

    return updatedListing
  } catch (error) {
    throw new Error(ERROR_UPDATING_LISTING)
  }
}

/**
 * Service to renew a listing, extending its validity.
 * @param {string} listingId - The ID of the listing to renew.
 * @param {string} userId - The ID of the user making the request.
 * @returns {Promise<Object>} - A promise resolving to the updated listing.
 */
export const renewListingService = async (listingId, userId) => {
  try {
    const listing = await Listing.findOne({ _id: listingId, userId })

    if (!listing) throw new Error(ERROR_LISTING_NOT_FOUND)

    const renewedListing = await Listing.findOneAndUpdate(
      { _id: listingId, userId },
      {
        $set: { validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // Extend 30 days
        status: STATUS.PUBLISHED,
      },
      { new: true }
    )

    return renewedListing
  } catch (error) {
    throw new Error(ERROR_UPDATING_LISTING)
  }
}

/**
 * Service to approve a listing.
 * @param {string} listingId - The ID of the listing to approve.
 * @returns {Promise<Object>} - A promise resolving to the updated listing.
 */
export const approveListingService = async (listingId) => {
  try {
    const listing = await Listing.findById(listingId)

    if (!listing) throw new Error(ERROR_LISTING_NOT_FOUND)

    listing.status = STATUS.PUBLISHED
    await listing.save()

    return listing
  } catch (error) {
    throw new Error(ERROR_UPDATING_LISTING)
  }
}
