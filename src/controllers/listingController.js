// src/controllers/listingController.js

import { validationResult } from "express-validator";

import {
  getListingsByLocation,
  getListingById,
  createNewListing,
} from "../services/listingService.js";
import {
  buildSuccessResponse,
  getServerErrorResponse,
  getBusinessErrorResponse,
} from "../utils/responseUtils.js";
import {
  ERROR_LISTINGS_FETCH_FAILED,
  ERROR_LISTING_FETCH_FAILED,
  ERROR_LISTING_NOT_FOUND,
  SUCCESS_LISTING_CREATED,
} from "../constants/messages.js";

/**
 * Controller to fetch listings with pagination.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const fetchListings = async (req, res, next) => {
  const { province } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit) || 12;

  try {
    const { listings, total } = await getListingsByLocation(
      province,
      page,
      limit
    );
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
    );
  } catch (error) {
    console.error(ERROR_LISTINGS_FETCH_FAILED, error);
    next(getServerErrorResponse(ERROR_LISTINGS_FETCH_FAILED, error));
  }
};

/**
 * Controller to fetch a specific listing by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const fetchListingById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const listing = await getListingById(id);
    res.status(200).json(buildSuccessResponse({ data: listing }));
  } catch (error) {
    if (error.message === ERROR_LISTING_NOT_FOUND) {
      return res
        .status(404)
        .json(getBusinessErrorResponse(ERROR_LISTING_NOT_FOUND));
    }

    console.error(ERROR_LISTING_FETCH_FAILED, error);
    next(getServerErrorResponse(ERROR_LISTING_FETCH_FAILED, error));
  }
};

/**
 * Controller to create a new listing.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const createListing = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(getBusinessErrorResponse(errors.array()[0].msg));
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
  } = req.body;

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
    });

    res.status(201).json(
      buildSuccessResponse({
        data: { listing: newListing },
        message: SUCCESS_LISTING_CREATED,
      })
    );
  } catch (error) {
    console.error(ERROR_LISTING_FETCH_FAILED, error);
    next(getServerErrorResponse(ERROR_LISTING_FETCH_FAILED, error));
  }
};
