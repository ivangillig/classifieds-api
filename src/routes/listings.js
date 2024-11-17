import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Listing from "../models/Listing.js";
import Location from "../models/Location.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";
import {
  getBusinessErrorResponse,
  buildSuccessResponse,
  getServerErrorResponse,
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
  ERROR_LISTINGS_FETCH_FAILED,
  ERROR_UPLOAD_FAILED,
  ERROR_DELETE_IMAGES_FAILED,
  SUCCESS_IMAGES_DELETED,
  ERROR_LISTING_NOT_FOUND,
  ERROR_LISTING_FETCH_FAILED
} from "../constants/messages.js";

dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads"); // absolute route
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create folder if it doesn't exist
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create a unique name for file
    const uniqueSuffix = crypto.randomBytes(6).toString("hex");
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const upload = multer({ storage });

// Route to upload images
router.post(
  "/upload",
  authenticateUser,
  upload.array("photos", 5),
  async (req, res, next) => {
    try {
      const uploadedFiles = req.files.map((file) => {
        const path = `${file.filename}`;
        return path;
      });
      res.status(200).json(buildSuccessResponse({ data: uploadedFiles }));
    } catch (error) {
      next(getServerErrorResponse(ERROR_UPLOAD_FAILED, error));
    }
  }
);

// Route to delete images
router.post("/deleteImages", async (req, res) => {
  const { urls } = req.body;

  try {
    urls.forEach((filename) => {
      // Construct the full path of the file on the server
      const filePath = path.join(__dirname, "../..", "uploads", filename);

      // Check if the file exists and then delete it
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file
      }
    });

    res
      .status(200)
      .json(buildSuccessResponse({ message: SUCCESS_IMAGES_DELETED }));
  } catch (error) {
    res
      .status(500)
      .json(getServerErrorResponse(ERROR_DELETE_IMAGES_FAILED, error));
  }
});

// Route to create a listing
router.post(
  "/createListing",
  authenticateUser, // Middleware to validate that the user is logged in
  [
    body("location").not().isEmpty().withMessage(ERROR_LOCATION_REQUIRED),
    body("title").not().isEmpty().withMessage(ERROR_TITLE_REQUIRED),
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

// Route to fetch listings with location filter
router.get("/", async (req, res, next) => {
  const { province } = req.query;

  try {
    // Find all locations that match the province name
    const locations = await Location.find({
      $or: [
        { subcountry: new RegExp(province, "i") }, // Match subcountry (province/state)
        { name: new RegExp(province, "i") }, // Match city name
      ],
    }).select("_id"); // Only select the IDs

    // Find all listings that reference these locations
    const listings = await Listing.find({
      location: { $in: locations.map((location) => location._id) },
    }).populate("location", "name subcountry country");

    // Return the listings with populated location data
    res.status(200).json(buildSuccessResponse({ data: listings }));
  } catch (error) {
    console.error(ERROR_LISTINGS_FETCH_FAILED, error);
    next(getServerErrorResponse(ERROR_LISTINGS_FETCH_FAILED, error));
  }
});

// Route to fetch a specific listing by ID
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    // Fetch the listing by ID and populate related fields
    const listing = await Listing.findById(id).populate(
      "location",
      "name subcountry country"
    );

    if (!listing) {
      return res
        .status(404)
        .json(getBusinessErrorResponse(ERROR_LISTING_NOT_FOUND));
    }

    // Return the listing data
    res.status(200).json(buildSuccessResponse({ data: listing }));
  } catch (error) {
    console.error(ERROR_LISTING_FETCH_FAILED, error);
    next(getServerErrorResponse(ERROR_LISTING_FETCH_FAILED, error));
  }
});

export default router;
