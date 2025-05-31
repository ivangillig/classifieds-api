import log4js from 'log4js'

// Configure log4js for logging errors
const logger = log4js.getLogger('errors')

const ERROR_GENERIC = 'An unexpected error occurred. Please try again later.'

export default function errorHandler(err, req, res, next) {
  // Determine the status code
  const statusCode = err.statusCode || 500

  // Determine the error message
  const message = err.message || ERROR_GENERIC

  // Log the error
  if (statusCode >= 500) {
    logger.error(
      `Error captured in request: ${req.method} ${req.originalUrl}\n`,
      err
    )
  }

  // Send the error response to the client
  res.status(statusCode).json({
    statusCode,
    message,
  })
}
