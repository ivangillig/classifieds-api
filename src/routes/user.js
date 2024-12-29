import express from "express";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { validateUpdateUserProfile } from "../middleware/validationMiddleware.js";
import { updateUserProfile } from "../controllers/userController.js";

dotenv.config();

const router = express.Router();

/**
 * Update user profile route
 * PATCH /user
 */
router.patch("/", authenticateUser, validateUpdateUserProfile, updateUserProfile);

export default router;
