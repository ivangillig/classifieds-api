import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authenticateUser } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

dotenv.config();

const router = express.Router();

// @desc    Auth with Google
// @route   GET /auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// @desc    Logout user
// @route   POST /auth/logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: "Logout successful" });
  });
});

// @desc    Obtener la información completa del usuario
// @route   GET /auth/getUserInfo
router.get("/getUserInfo", authenticateUser, async (req, res) => {
  try {
    // Ensure the decoded JWT contains a user ID
    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({ message: "Invalid token or user ID missing" });
    }

    // Find user by ID (decoded from JWT)
    const user = await User.findById(req.user.id).select(
      "displayName email profilePhoto"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res
      .status(500)
      .json({ message: "Error retrieving user data", error: error.message });
  }
});

export default router;
