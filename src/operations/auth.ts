import { Types } from "mongoose";
import UserModel from "../models/users";
import { IUser } from "../../types/models.types";
import { appStatus } from "../config/messages";

/**
 * Updates a user's password by their ID.
 *
 * @param {string} id - The Object ID of the user document.
 * @param {string} newPassword - The new password to set.
 * @returns {Promise<Omit<IUser, 'password'> | null>} - A promise that resolves to the updated user document without the password, or null if not found.
 */
export const updateUserPassword = async (id: string, newPassword: string): Promise<Omit<IUser, 'password'> | null> => {
  return UserModel.findByIdAndUpdate(
    {
      '_id': new Types.ObjectId(id),
      status: appStatus.ACTIVE
    },
    { $set: { password: newPassword } },
    { new: true, projection: { password: 0 } }
  ).lean();
};