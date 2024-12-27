import { updateUserProfileService } from "../services/userService.js";
import {
  buildSuccessResponse,
  getBusinessErrorResponse,
  getServerErrorResponse,
} from "../utils/responseUtils.js";
import {
  SUCCESS_USER_UPDATED,
  ERROR_USER_NOT_FOUND,
  ERROR_UPDATING_USER,
} from "../constants/messages.js";

/**
 * Controller to update user profile information.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const updateUserProfile = async (req, res, next) => {
  const userId = req.user.id;
  const updateData = req.body;

  try {
    const updatedUser = await updateUserProfileService(userId, updateData);

    res.status(200).json(
      buildSuccessResponse({
        data: updatedUser,
        message: SUCCESS_USER_UPDATED,
      })
    );
  } catch (error) {
    if (error.message === ERROR_USER_NOT_FOUND) {
      return res.status(404).json(getBusinessErrorResponse(ERROR_USER_NOT_FOUND));
    }

    next(getServerErrorResponse(ERROR_UPDATING_USER, error));
  }
};
