import express from 'express'
import Location from '../models/Location.js'
import Province from '../models/Province.js'
import {
  getServerErrorResponse,
  buildSuccessResponse,
} from '../utils/responseUtils.js'
import {
  ERROR_RETRIEVING_CITIES,
  ERROR_RETRIEVING_PROVINCES,
} from '../constants/messages.js'

const router = express.Router()

// Helper function to extract country from request (defaults to Argentina)
function getCountryFromRequest(req) {
  return req.query.country?.toUpperCase() || 'AR'
}

// @desc    Get all provinces
// @route   GET /locations/provinces
router.get('/provinces', async (req, res, next) => {
  try {
    const countryCode = getCountryFromRequest(req)

    const provinces = await Province.findByCountry(countryCode.toUpperCase())

    const states = provinces.map((p) => ({
      id: p._id,
      code: p.code,
      name: p.name,
    }))

    res.status(200).json(buildSuccessResponse({ data: states }))
  } catch (error) {
    next(getServerErrorResponse(ERROR_RETRIEVING_PROVINCES, error))
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
      isActive: true,
    }

    // Add search by code if provided
    if (search) {
      query.province_code = new RegExp(search, 'i')
    }

    const cities = await Location.find(query)
      .select('name code')
      .sort({ name: 1 }) // Always alphabetical
      .limit(parseInt(limit))

    res.status(200).json(buildSuccessResponse({ data: cities }))
  } catch (error) {
    next(getServerErrorResponse(ERROR_RETRIEVING_CITIES, error))
  }
})

// @desc    Get cities by province
// @route   GET /locations/cities/:province_code
router.get('/cities/:province_code', async (req, res, next) => {
  try {
    const { province_code } = req.params
    const { search } = req.query

    // TODO: re-enable country filtering if needed
    // const countryCode = getCountryFromRequest(req)

    let query = {
      province_code, // Now we only use province code
      // countryCode: countryCode.toUpperCase(),
      isActive: true,
    }

    // Add search by name if provided
    if (search) {
      query.name = new RegExp(search, 'i')
    }

    console.log(query)
    const cities = await Location.find(query)
      .select('name department_name')
      .sort({ name: 1 }) // Always alphabetical

    res.status(200).json(buildSuccessResponse({ data: cities }))
  } catch (error) {
    next(getServerErrorResponse(ERROR_RETRIEVING_CITIES, error))
  }
})

export default router
