// src/services/listingService.js

import Listing from "../models/Listing.js";
import Location from "../models/Location.js";
import {
  ERROR_LISTINGS_FETCH_FAILED,
  ERROR_LISTING_FETCH_FAILED,
  ERROR_LISTING_NOT_FOUND,
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
