import express from "express";
import dotenv from "dotenv";
import Listing from "../models/Listing.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";
import {
  getBusinessErrorResponse,
  buildSuccessResponse,
} from "../utils/responseUtils.js";
import {
  SUCCESS_LISTING_CREATED,
  ERROR_TITLE_REQUIRED,
  ERROR_LOCATION_REQUIRED,
  ERROR_PRICE_REQUIRED,
  ERROR_PRICE_MUST_BE_NUMBER,
  ERROR_PHONE_MUST_BE_NUMBER,
  ERROR_PHONE_REQUIRED,
  ERROR_USE_WHATSAPP_BOOLEAN,
} from "../constants/messages.js";

dotenv.config();

const router = express.Router();

router.post(
  "/createListing",
  authenticateUser, // Middleware to validate that user is logged in
  [
    body("title").not().isEmpty().withMessage(ERROR_TITLE_REQUIRED),
    body("location").not().isEmpty().withMessage(ERROR_LOCATION_REQUIRED),
    body("price")
      .not()
      .isEmpty()
      .withMessage(ERROR_PRICE_REQUIRED)
      .isNumeric()
      .withMessage(ERROR_PRICE_MUST_BE_NUMBER),
    body("phone")
      .not()
      .isEmpty()
      .withMessage(ERROR_PHONE_REQUIRED)
      .isNumeric()
      .withMessage(ERROR_PHONE_MUST_BE_NUMBER),
    body("useWhatsApp").isBoolean().withMessage(ERROR_USE_WHATSAPP_BOOLEAN),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(getBusinessErrorResponse(errors.array()[0].msg));
    }

    const { title, location, photos, price, phone, useWhatsApp } = req.body;

    try {
      const newListing = new Listing({
        title,
        location,
        photos,
        price,
        phone,
        useWhatsApp,
        userId: req.user.id,
      });

      await newListing.save();
      res.status(201).json(
        buildSuccessResponse({
          data: { listing: newListing },
          message: SUCCESS_LISTING_CREATED,
        })
      );
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }
);

export default router;
