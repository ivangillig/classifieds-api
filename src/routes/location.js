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

// Helper function to extract country from request (defaults to Argentina)
function getCountryFromRequest(req) {
  return req.query.country?.toUpperCase() || 'AR'
}

// @desc    Get all provinces/states
// @route   GET /locations/states
router.get('/states', async (req, res, next) => {
  try {
    const countryCode = getCountryFromRequest(req)

    const states = await Location.find({
      countryCode: countryCode.toUpperCase(),
      isActive: true,
    }).distinct('subcountry')

    res.status(200).json(buildSuccessResponse({ data: states.sort() }))
  } catch (error) {
    next(getServerErrorResponse(ERROR_RETRIEVING_STATES, error))
  }
})

// @desc    Get all cities (no province filter)
// @route   GET /locations/cities
router.get('/cities', async (req, res, next) => {
  try {
    const { limit = 100, search } = req.query
    const countryCode = getCountryFromRequest(req)

    let query = {
      countryCode: countryCode.toUpperCase(),
      featureCode: { $in: ['PPL', 'PPLC'] }, // Cities only (PPL=city, PPLC=capital)
      isActive: true,
    }

    // Add search by name if provided
    if (search) {
      query.name = new RegExp(search, 'i')
    }

    const cities = await Location.find(query)
      .select('name subcountry population')
      .sort({ name: 1 }) // Always alphabetical
      .limit(parseInt(limit))

    res.status(200).json(buildSuccessResponse({ data: cities }))
  } catch (error) {
    next(getServerErrorResponse(ERROR_RETRIEVING_CITIES, error))
  }
})

// @desc    Get cities by province/state
// @route   GET /locations/cities/:state
router.get('/cities/:state', async (req, res, next) => {
  try {
    const { state } = req.params
    const { limit = 50, search } = req.query
    const countryCode = getCountryFromRequest(req)

    let query = {
      subcountry: new RegExp(state, 'i'),
      countryCode: countryCode.toUpperCase(),
      featureCode: { $in: ['PPL', 'PPLC'] }, // Cities only (PPL=city, PPLC=capital)
      isActive: true,
    }

    // Add search by name if provided
    if (search) {
      query.name = new RegExp(search, 'i')
    }

    const cities = await Location.find(query)
      .select('name population')
      .sort({ name: 1 }) // Always alphabetical
      .limit(parseInt(limit))

    res.status(200).json(buildSuccessResponse({ data: cities }))
  } catch (error) {
    next(getServerErrorResponse(ERROR_RETRIEVING_CITIES, error))
  }
})

export default router
