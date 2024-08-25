import express from "express";
import dotenv from "dotenv";
import Listing from "../models/Listing.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

dotenv.config();

const router = express.Router();

router.post(
  "/createListing",
  authenticateUser, // Middleware to validate that user is logged
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("location").not().isEmpty().withMessage("Location is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("phone").isNumeric().withMessage("Phone must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, location, photos, price, phone } = req.body;

    try {
      const newListing = new Listing({
        title,
        location,
        photos,
        price,
        phone,
        userId: req.user.id,
      });

      await newListing.save();
      res
        .status(201)
        .json({ message: "Listing created successfully", listing: newListing });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
