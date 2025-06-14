import User from '../models/User.js'
import {
  ERROR_UPDATING_USER,
  ERROR_USER_NOT_FOUND,
} from '../constants/messages.js'

/**
 * Service to update user profile information.
 * @param {string} userId - The ID of the authenticated user.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<Object>} - The updated user.
 */
export const updateUserProfileService = async (userId, updateData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    )

    if (!updatedUser) {
      throw new Error(ERROR_USER_NOT_FOUND)
    }

    // Limit the information returned
    const limitedUserInfo = {
      _id: updatedUser._id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profileName: updatedUser.profileName,
      profilePhoto: updatedUser.profilePhoto,
    }

    return limitedUserInfo
  } catch (error) {
    throw new Error(ERROR_UPDATING_USER)
  }
}
