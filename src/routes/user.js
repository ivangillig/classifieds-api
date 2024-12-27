import express from "express";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { body } from "express-validator";
import { updateUserProfile } from "../controllers/userController.js";

dotenv.config();

const router = express.Router();

/**
 * Update user profile route
 * PATCH /user
 */
router.patch(
  "/",
  authenticateUser,
  [
    body("displayName").optional().isString(),
    body("phone").optional().isString().isMobilePhone("any"),
  ],
  updateUserProfile
);

export default router;
