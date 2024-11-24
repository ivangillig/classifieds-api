import express from "express";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {
  fetchListings,
  fetchListingById,
  createListing,
} from "../controllers/listingController.js";
import {
  uploadImages,
  deleteImagesController,
} from "../controllers/imageController.js";

import { body } from "express-validator";
import {
  ERROR_TITLE_REQUIRED,
  ERROR_AGE_REQUIRED,
  ERROR_LOCATION_REQUIRED,
  ERROR_PRICE_REQUIRED,
  ERROR_PRICE_MUST_BE_NUMBER,
  ERROR_PHONE_MUST_BE_NUMBER,
  ERROR_PHONE_REQUIRED,
  ERROR_USE_WHATSAPP_BOOLEAN,
} from "../constants/messages.js";

dotenv.config();

const router = express.Router();

router.get("/", fetchListings);
router.get("/:id", fetchListingById);
router.post("/upload", authenticateUser, uploadImages);
router.post("/deleteImages", deleteImagesController);
router.post(
  "/createListing",
  authenticateUser,
  [
    body("location").not().isEmpty().withMessage(ERROR_LOCATION_REQUIRED),
    body("title").not().isEmpty().withMessage(ERROR_TITLE_REQUIRED),
    body("age").not().isEmpty().withMessage(ERROR_AGE_REQUIRED),
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
  createListing
);

export default router;
