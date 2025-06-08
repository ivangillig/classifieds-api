import axios from 'axios'
import { getBusinessErrorResponse } from '../utils/responseUtils.js'
import { INVALID_RECAPTCHA_TOKEN } from '../constants/messages.js'

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

export const validateRecaptcha = async (req, res, next) => {
  const { captcha } = req.body

  if (!captcha) {
    return res
      .status(400)
      .json(getBusinessErrorResponse('reCAPTCHA token is missing'))
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: captcha,
        },
      }
    )

    const { success } = response.data

    if (!success) {
      return res
        .status(422)
        .json(getBusinessErrorResponse(INVALID_RECAPTCHA_TOKEN))
    }

    next()
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return res
      .status(500)
      .json(getBusinessErrorResponse('Failed to verify reCAPTCHA'))
  }
}
