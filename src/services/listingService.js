// src/services/listingService.js

import Listing from "../models/Listing.js";
import Location from "../models/Location.js";
import Report from "../models/Report.js";
import { PUBLISHED_STATUS_FILTER, STATUS } from "../utils/businessConstants.js";

import {
  ERROR_LISTINGS_FETCH_FAILED,
  ERROR_LISTING_FETCH_FAILED,
  ERROR_LISTING_NOT_FOUND,
  ERROR_REPORT_CREATION_FAILED,
  ERROR_LISTING_STATUS_UPDATE_FAILED,
} from "../constants/messages.js";

/**
 * Fetch listings by province or city with pagination.
 * @param {string} province - The name of the province or city to filter listings.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of listings per page.
 * @returns {Promise<Object>} - A promise resolving to an object containing listings and total count.
 */
export const getListingsByLocation = async (province, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Find matching locations by province or city
    const locations = await Location.find({
      $or: [
        { subcountry: new RegExp(province, "i") },
        { name: new RegExp(province, "i") },
      ],
    }).select("_id");

    // Fetch listings with pagination
    const [listings, total] = await Promise.all([
      Listing.find({
        ...PUBLISHED_STATUS_FILTER,
        location: { $in: locations.map((location) => location._id) },
      })
        .populate("location", "name subcountry country")
        .skip(skip)
        .limit(limit),
      Listing.countDocuments({
        location: { $in: locations.map((location) => location._id) },
      }),
    ]);

    return { listings, total };
  } catch (error) {
    throw new Error(ERROR_LISTINGS_FETCH_FAILED);
  }
};

/**
 * Fetch a listing by its ID.
 * @param {string} id - The ID of the listing.
 * @returns {Promise<Object>} - A promise resolving to the listing object.
 */
export const getListingById = async (id) => {
  try {
    const listing = await Listing.findById(id).populate(
      "location",
      "name subcountry country"
    );

    if (!listing) {
      throw new Error(ERROR_LISTING_NOT_FOUND);
    }

    return listing;
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      throw error;
    }
    throw new Error(ERROR_LISTING_FETCH_FAILED);
  }
};

/**
 * Create a new listing.
 * @param {Object} listingData - The data for the new listing.
 * @returns {Promise<Object>} - A promise resolving to the created listing.
 */
export const createNewListing = async (listingData) => {
  try {
    const newListing = new Listing(listingData);
    await newListing.save();
    return newListing;
  } catch (error) {
    throw new Error(ERROR_LISTING_FETCH_FAILED);
  }
};

/**
 * Create a new report for a listing.
 * @param {Object} reportData - The data for the report.
 * @returns {Promise<Object>} - A promise resolving to the created report.
 */
export const createReportForListing = async (reportData) => {
  const { listingId, reason, additionalInfo, contactInfo } = reportData;

  try {
    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new Error(ERROR_LISTING_NOT_FOUND);
    }

    // Create and save the report
    const report = new Report({
      listingId,
      reason,
      additionalInfo,
      contactInfo,
    });
    await report.save();

    // Increment the report count on the listing
    listing.reports = (listing.reports || 0) + 1;
    await listing.save();

    return report;
  } catch (error) {
    console.log(error);

    if (error.message === ERROR_LISTING_NOT_FOUND) {
      throw error;
    }
    throw new Error(ERROR_REPORT_CREATION_FAILED);
  }
};

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
    const skip = (page - 1) * limit;

    // Dinamic filter
    const filter = { userId };
    if (status) filter.status = status;

    // Find listings
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("location", "name subcountry country")
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(filter),
    ]);

    return { listings, total };
  } catch (error) {
    throw new Error(ERROR_LISTINGS_FETCH_FAILED);
  }
};

/**
 * Service to pause or reactivate a listing.
 * @param {string} listingId - The ID of the listing to pause.
 * @param {string} userId - The ID of the user making the request.
 * @returns {Promise<Object>} - A promise resolving to the updated listing.
 */
export const toggleListingStatusService = async (listingId, userId) => {
  try {
    const listing = await Listing.findOne({ _id: listingId, userId });

    if (!listing) throw new Error(ERROR_LISTING_NOT_FOUND);

    const newStatus =
      listing.status === STATUS.PAUSED ? STATUS.PUBLISHED : STATUS.PAUSED;

    const updatedListing = await Listing.findOneAndUpdate(
      { _id: listingId, userId },
      { status: newStatus },
      { new: true }
    );

    return updatedListing;
  } catch (error) {
    throw new Error(ERROR_LISTING_STATUS_UPDATE_FAILED);
  }
};
