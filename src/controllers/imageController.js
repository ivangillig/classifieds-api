// src/controllers/imageController.js

import multer from 'multer'
import path from 'path'
import {
  configureMulterStorage,
  deleteImages,
} from '../services/imageService.js'
import {
  buildSuccessResponse,
  getServerErrorResponse,
} from '../utils/responseUtils.js'
import {
  ERROR_UPLOAD_FAILED,
  ERROR_DELETE_IMAGES_FAILED,
  SUCCESS_IMAGES_DELETED,
  ERROR_FILE_TOO_LARGE,
  ERROR_TOO_MANY_FILES,
  ERROR_INVALID_FILE_TYPE,
  ERROR_NO_FILES_UPLOADED,
  ERROR_UPLOAD_ERROR,
} from '../constants/messages.js'

// Allowed file types for image upload
const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const __dirname = path.resolve()

/**
 * File filter function to validate file types
 */
const fileFilter = (req, file, cb) => {
  if (ACCEPTED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(ERROR_INVALID_FILE_TYPE), false)
  }
}

/**
 * Multer upload configuration with file validation.
 */
const upload = multer({
  storage: multer.diskStorage(configureMulterStorage(__dirname)),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
})

/**
 * Controller to upload images with file validation.
 */
export const uploadImages = [
  (req, res, next) => {
    upload.array('photos', 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: ERROR_FILE_TOO_LARGE,
          })
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: ERROR_TOO_MANY_FILES,
          })
        }
        return res.status(400).json({
          success: false,
          message: ERROR_UPLOAD_ERROR,
        })
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: ERROR_INVALID_FILE_TYPE,
        })
      }
      next()
    })
  },
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: ERROR_NO_FILES_UPLOADED,
        })
      }

      const uploadedFiles = req.files.map((file) => file.filename)
      res.status(200).json(buildSuccessResponse({ data: uploadedFiles }))
    } catch (error) {
      next(getServerErrorResponse(ERROR_UPLOAD_FAILED, error))
    }
  },
]

/**
 * Controller to delete images.
 */
export const deleteImagesController = async (req, res) => {
  const { urls } = req.body

  try {
    deleteImages(urls, __dirname)
    res
      .status(200)
      .json(buildSuccessResponse({ message: SUCCESS_IMAGES_DELETED }))
  } catch (error) {
    res
      .status(500)
      .json(getServerErrorResponse(ERROR_DELETE_IMAGES_FAILED, error))
  }
}
