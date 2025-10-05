import { validationResult, query, body, param } from 'express-validator'
import { getBusinessErrorResponse } from '../utils/responseUtils.js'
import {
  ERROR_TITLE_REQUIRED,
  ERROR_AGE_REQUIRED,
  ERROR_LOCATION_REQUIRED,
  ERROR_PRICE_REQUIRED,
  ERROR_PRICE_MUST_BE_NUMBER,
  ERROR_PHONE_MUST_BE_NUMBER,
  ERROR_PHONE_REQUIRED,
  ERROR_USE_WHATSAPP_BOOLEAN,
  ERROR_REPORT_LISTING_ID_REQUIRED,
  ERROR_REPORT_REASON_REQUIRED,
  ERROR_REPORT_CONTACT_INFO_STRING,
  ERROR_STATUS_MUST_BE_A_STRING,
  ERROR_QUERY_MUST_CONTAIN_ONLY_ALPHANUMERIC,
} from '../constants/messages.js'

export const validateQueryParameter = [
  query('province').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('query')
    .optional()
    .isAlphanumeric()
    .withMessage(ERROR_QUERY_MUST_CONTAIN_ONLY_ALPHANUMERIC),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json(getBusinessErrorResponse(errors.array()[0].msg))
    }
    next()
  },
]

export const validateCreateListing = [
  body('location').not().isEmpty().withMessage(ERROR_LOCATION_REQUIRED),
  body('title').not().isEmpty().withMessage(ERROR_TITLE_REQUIRED),
  body('age').not().isEmpty().withMessage(ERROR_AGE_REQUIRED),
  body('price')
    .not()
    .isEmpty()
    .withMessage(ERROR_PRICE_REQUIRED)
    .isNumeric()
    .withMessage(ERROR_PRICE_MUST_BE_NUMBER),
  body('phone')
    .not()
    .isEmpty()
    .withMessage(ERROR_PHONE_REQUIRED)
    .isNumeric()
    .withMessage(ERROR_PHONE_MUST_BE_NUMBER),
  body('useWhatsApp').isBoolean().withMessage(ERROR_USE_WHATSAPP_BOOLEAN),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json(getBusinessErrorResponse(errors.array()[0].msg))
    }
    next()
  },
]

export const validateEditListing = [
  body('title').notEmpty().withMessage(ERROR_TITLE_REQUIRED),
  body('age').notEmpty().withMessage(ERROR_AGE_REQUIRED),
  body('location').notEmpty().withMessage(ERROR_LOCATION_REQUIRED),
  body('price')
    .notEmpty()
    .withMessage(ERROR_PRICE_REQUIRED)
    .isNumeric()
    .withMessage(ERROR_PRICE_MUST_BE_NUMBER),
  body('phone')
    .notEmpty()
    .withMessage(ERROR_PHONE_REQUIRED)
    .isNumeric()
    .withMessage(ERROR_PHONE_MUST_BE_NUMBER),
  body('useWhatsApp').isBoolean().withMessage(ERROR_USE_WHATSAPP_BOOLEAN),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json(getBusinessErrorResponse(errors.array()[0].msg))
    }
    next()
  },
]

export const validateCreateReport = [
  body('listingId').notEmpty().withMessage(ERROR_REPORT_LISTING_ID_REQUIRED),
  body('reason').notEmpty().withMessage(ERROR_REPORT_REASON_REQUIRED),
  body('contactInfo')
    .optional()
    .isString()
    .withMessage(ERROR_REPORT_CONTACT_INFO_STRING),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json(getBusinessErrorResponse(errors.array()[0].msg))
    }
    next()
  },
]

export const validateFetchUserListings = [
  query('status')
    .optional()
    .isString()
    .withMessage(ERROR_STATUS_MUST_BE_A_STRING),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json(getBusinessErrorResponse(errors.array()[0].msg))
    }
    next()
  },
]

export const validateUpdateUserProfile = [
  body('displayName').optional().isString(),
  body('phone').optional().isString().isMobilePhone('any'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json(getBusinessErrorResponse(errors.array()[0].msg))
    }
    next()
  },
]

export const validateIdParameter = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }
    next()
  },
]

export const validateUpdateStatus = [
  body('status')
    .isString()
    .withMessage('Status must be a string')
    .isIn(['published', 'paused', 'underReview', 'expired', 'blocked'])
    .withMessage('Invalid status value'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }
    next()
  },
]

export default {
  validateQueryParameter,
  validateCreateListing,
  validateEditListing,
  validateCreateReport,
  validateFetchUserListings,
  validateUpdateUserProfile,
  validateIdParameter,
  validateUpdateStatus,
}
