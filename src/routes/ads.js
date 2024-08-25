import express from "express";
import dotenv from "dotenv";
import Listing from "../models/Listing.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";
import {
  getBusinessErrorResponse,
  buildSuccessResponse,
} from "../utils/responseUtils.js";

dotenv.config();

const router = express.Router();

// Error messages
const ERROR_VALIDATION_FAILED = "ERROR_VALIDATION_FAILED";
const SUCCESS_LISTING_CREATED = "SUCCESS_LISTING_CREATED";

// Validation messages
const MSG_TITLE_REQUIRED = "MSG_TITLE_REQUIRED";
const MSG_LOCATION_REQUIRED = "MSG_LOCATION_REQUIRED";
const MSG_PRICE_MUST_BE_NUMBER = "MSG_PRICE_MUST_BE_NUMBER";
const MSG_PHONE_MUST_BE_NUMBER = "MSG_PHONE_MUST_BE_NUMBER";
const MSG_USE_WHATSAPP_BOOLEAN = "MSG_USE_WHATSAPP_BOOLEAN";

router.post(
  "/createListing",
  authenticateUser, // Middleware to validate that user is logged in
  [
    body("title").not().isEmpty().withMessage(MSG_TITLE_REQUIRED),
    body("location").not().isEmpty().withMessage(MSG_LOCATION_REQUIRED),
    body("price").isNumeric().withMessage(MSG_PRICE_MUST_BE_NUMBER),
    body("phone").isNumeric().withMessage(MSG_PHONE_MUST_BE_NUMBER),
    body("useWhatsApp")
      .isBoolean()
      .withMessage(MSG_USE_WHATSAPP_BOOLEAN),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(getBusinessErrorResponse(ERROR_VALIDATION_FAILED, errors.array()));
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
      res
        .status(201)
        .json(
          buildSuccessResponse({
            data: { listing: newListing },
            message: SUCCESS_LISTING_CREATED,
          })
        );
    } catch (error) {
      next(error);  // Pass the error to the error handling middleware
    }
  }
);

export default router;
