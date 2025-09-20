import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { authenticateUser } from '../middleware/authMiddleware.js'
import User from '../models/User.js'
import {
  getServerErrorResponse,
  getNotFoundErrorResponse,
  getBusinessErrorResponse,
  buildSuccessResponse,
} from '../utils/responseUtils.js'
import {
  ERROR_FAILED_LOGOUT,
  ERROR_INVALID_TOKEN_OR_USER_ID,
  ERROR_USER_NOT_FOUND,
  EMAIL_CONFIRMED_SUCCESS,
} from '../constants/messages.js'

dotenv.config()

const router = express.Router()

// @desc    Auth with Google
// @route   GET /auth/google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
  }
)

// @desc    Confirm email
// @route   GET /auth/confirm-email/:token
router.get('/confirm-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      throw getNotFoundErrorResponse(ERROR_USER_NOT_FOUND)
    }

    user.isEmailConfirmed = true
    await user.save()

    res
      .status(200)
      .json(buildSuccessResponse({ message: EMAIL_CONFIRMED_SUCCESS }))
  } catch (error) {
    next(error)
  }
})

// @desc    Logout user
// @route   POST /auth/logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(getServerErrorResponse(ERROR_FAILED_LOGOUT, err))
    }
    res.status(200).json(buildSuccessResponse({ message: 'Logout successful' }))
  })
})

// @desc    Get complete user information
// @route   GET /auth/getUserInfo
router.get('/getUserInfo', authenticateUser, async (req, res, next) => {
  try {
    // Ensure the decoded JWT contains a user ID
    if (!req.user || !req.user.id) {
      throw getBusinessErrorResponse(ERROR_INVALID_TOKEN_OR_USER_ID)
    }

    // Find user by ID (decoded from JWT)
    const user = await User.findById(req.user.id).select(
      'profileName email profilePhoto phone'
    )
    if (!user) {
      throw getNotFoundErrorResponse(ERROR_USER_NOT_FOUND)
    }

    res.status(200).json(buildSuccessResponse({ data: { user } }))
  } catch (error) {
    next(error) // Pass the error to the error handling middleware
  }
})

// @desc    Refresh token
// @route   POST /auth/refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res
      .status(401)
      .json(getUnauthorizedErrorResponse(ERROR_INVALID_TOKEN))
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json(getUnauthorizedErrorResponse(ERROR_INVALID_TOKEN))
    }

    const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    })

    res.status(200).json(buildSuccessResponse({ accessToken: newAccessToken }))
  })
})

export default router
