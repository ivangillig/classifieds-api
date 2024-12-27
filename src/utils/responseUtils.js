import _ from 'lodash'
import pkg from 'verror'
const { VError } = pkg

const ERROR_GENERIC =
  'An error occurred on the server. Please try again or contact the administrator.'

const getBusinessErrorResponse = (message) => {
  return buildError(422, message)
}

const getForbiddenErrorResponse = (message) => {
  return buildError(403, message)
}

const getUnauthorizedErrorResponse = (message) => {
  return buildError(401, message)
}

const getNotFoundErrorResponse = (message) => {
  return buildError(404, message)
}

const getServerErrorResponse = (message, errorCause) => {
  return buildError(500, message, errorCause)
}

const buildError = (statusCode, message, errorCause = null) => {
  const error = new VError.WError(message || ERROR_GENERIC)

  error.errorCause = errorCause
  error.statusCode = statusCode

  return error
}

const buildSuccessResponse = (data = null) => {
  let response = { statusCode: 200, success: true }
  if (data) {
    response = { ...response, ...data }
  }
  return response
}

const buildResponse = (data, limitQuery, page, total) => {
  const response = {
    data: data,
    limit: limitQuery,
    page: page,
    totalCount: total,
    success: true,
  }
  return response
}

const sanitizeObject = (object, properties) => {
  return _.pick(object, properties)
}

export {
  getBusinessErrorResponse,
  getForbiddenErrorResponse,
  getUnauthorizedErrorResponse,
  getServerErrorResponse,
  getNotFoundErrorResponse,
  buildResponse,
  buildSuccessResponse,
  ERROR_GENERIC,
  sanitizeObject,
}
