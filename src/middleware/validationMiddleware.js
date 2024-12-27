import { getBusinessErrorResponse } from '../utils/responseUtils.js'
import { ERROR_QUERY_MUST_CONTAIN_ONLY_ALPHANUMERIC } from '../constants/messages.js'

export const validateQueryParameter = (req, res, next) => {
  const { query } = req.query
  if (query && !/^[a-zA-Z0-9]+$/.test(query)) {
    return res
      .status(422)
      .json(
        getBusinessErrorResponse(ERROR_QUERY_MUST_CONTAIN_ONLY_ALPHANUMERIC)
      )
  }
  next()
}

export default { validateQueryParameter }
