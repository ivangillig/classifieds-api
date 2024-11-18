// src/services/listingService.js

import Listing from "../models/Listing.js";
import Location from "../models/Location.js";
import {
  ERROR_LISTINGS_FETCH_FAILED,
  ERROR_LISTING_FETCH_FAILED,
  ERROR_LISTING_NOT_FOUND,
} from "../constants/messages.js";

/**
 * Fetch listings by province or city.
 * @param {string} province - The name of the province or city to filter listings.
 * @returns {Promise<Array>} - A promise resolving to an array of listings.
 */
export const getListingsByLocation = async (province) => {
  try {
    const locations = await Location.find({
      $or: [
        { subcountry: new RegExp(province, "i") },
        { name: new RegExp(province, "i") },
      ],
    }).select("_id");

    return await Listing.find({
      location: { $in: locations.map((location) => location._id) },
    }).populate("location", "name subcountry country");
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
