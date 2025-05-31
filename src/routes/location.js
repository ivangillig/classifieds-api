import express from 'express'
import Location from '../models/Location.js'
import {
  getServerErrorResponse,
  buildSuccessResponse,
} from '../utils/responseUtils.js'
import {
  ERROR_RETRIEVING_CITIES,
  ERROR_RETRIEVING_STATES,
} from '../constants/messages.js'

const router = express.Router()

// @desc    Get all the subcountries (states/provinces) of Argentina
// @route   GET /locations/states
router.get('/states', async (req, res, next) => {
  try {
    const states = await Location.find({ country: 'Argentina' }).distinct(
      'subcountry'
    )
    res.status(200).json(buildSuccessResponse({ data: states }))
  } catch (error) {
    next(getServerErrorResponse(ERROR_RETRIEVING_STATES, error))
  }
})

// @desc    Get all the cities of a specific state
// @route   GET /locations/cities/:state
router.get('/cities/:state', async (req, res, next) => {
  try {
    const cities = await Location.find({ subcountry: req.params.state }).select(
      'name'
    )
    res.status(200).json(buildSuccessResponse({ data: cities }))
  } catch (error) {
    next(getServerErrorResponse(ERROR_RETRIEVING_CITIES, error))
  }
})

export default router
