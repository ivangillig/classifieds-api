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
} from '../constants/messages.js'

const __dirname = path.resolve()

/**
 * Multer upload configuration.
 */
const upload = multer({
  storage: multer.diskStorage(configureMulterStorage(__dirname)),
})

/**
 * Controller to upload images.
 */
export const uploadImages = [
  upload.array('photos', 5),
  async (req, res, next) => {
    try {
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
