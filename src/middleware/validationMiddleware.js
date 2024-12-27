import { getBusinessErrorResponse } from '../utils/responseUtils'
import { ERROR_QUERY_MUST_CONTAIN_ALPHANUMERIC } from '../constants/messages.js'

export const validateQueryParameter = (req, res, next) => {
  const { query } = req.query
  if (query && !/^[a-zA-Z0-9]+$/.test(query)) {
    return res
      .status(400)
      .json(getBusinessErrorResponse(ERROR_QUERY_MUST_CONTAIN_ALPHANUMERIC))
  }
  next()
}

export default { validateQueryParameter }
