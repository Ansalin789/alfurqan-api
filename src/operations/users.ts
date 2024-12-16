import { Types } from "mongoose";
import UserModel from "../models/users";
import { IUser, IUserCreate } from "../../types/models.types";
import { appStatus } from "../config/messages";
import {  isNil } from "lodash";
import { GetAllRecordsParams, GetAlluserRecordsParams } from "../shared/enum";
import users from "../models/users";

/**
 * Retrieves all user records for a given tenant, with support for search, pagination, sorting, role filtering, and excluding passwords.
 *
 * @param {GetAllRecordsParams} params - The parameters for fetching user records, including role filtering.
 *
 * @returns {Promise<{ users: IUser[]; totalCount: number }>} - A promise that resolves to an object containing:
 *  - `users`: An array of user records for the given tenant, with passwords excluded.
 *  - `totalCount`: The total number of user records matching the query.
 */


export const getAllUserRecords = async (
  params: GetAlluserRecordsParams
): Promise<{ users: IUser[]; totalCount: number }> => {
  const { role } = params;

  // Construct query based on role if provided
  const query: any = {};
  if (role) {
    query.role = role;
  }
  console.log(">>>>",query.role);
  // Fetch all users matching the query and return plain JavaScript objects using .lean()
  const users = await UserModel.find({
    role: query.role,
  }).exec();
 // console.log("users>>>>>>>>",users);
  // Get the total count of users matching the query
  const totalCount = await UserModel.countDocuments(query); // Count users matching the role

  return { users, totalCount }; // Return both users and totalCount
};






/**
 * Retrieves a user record by its ID, optionally filtered by role, excluding the password.
 *
 * @param {string} id - The Object ID of the user document.
 * @param {string} [role] - The role of the user to filter (optional).
 * @returns {Promise<IUser | null>} - A promise that resolves to the user record or null if not found.
 */
export const getUserRecordById = async (
  id: string,
  role?: string
): Promise<IUser | null> => {
  const query: any = { _id: new Types.ObjectId(id) };
  if (!isNil(role)) query.role = role;

  return UserModel.findOne(query).select("-password").lean();
};

/**
 * Fetches an active user record from the database based on the provided query, optionally filtered by role.
 *
 * @param {Partial<{ id: string; userName: string; tenantId: string; role: string }>} query - The query object used to match the user record. At least one of 'id' or 'userName' must be provided.
 * @returns {Promise<IUser | null>} - Returns a promise that resolves to the matched user record or null if no match is found.
 */
export const getActiveUserRecord = async (
  query: Partial<{ id: string; userName: string; tenantId: string; role: string }>
): Promise<IUser | null> => {
  const { id, userName, tenantId, role } = query;

  const dbQuery: any = {
    status: appStatus.ACTIVE,
  };

  if (!isNil(id)) dbQuery._id = new Types.ObjectId(id);
  if (!isNil(userName)) dbQuery.userName = userName;
  if (!isNil(tenantId)) dbQuery.tenantId = tenantId;
  if (!isNil(role)) dbQuery.role = role;

  return UserModel.findOne(dbQuery).lean();
};

/**
 * Creates a new user.
 *
 * @param {IUserCreate} payload - The data of the user to be created.
 * @returns {Promise<Omit<IUser, 'password'>>} - A promise that resolves to the created user document.
 */
export const createUser = async (
  payload: IUserCreate
): Promise<Omit<IUser, "password">> => {
  const newUser = new UserModel(payload);

  const savedUser = await newUser.save();

  const userObject = savedUser.toObject() as Omit<IUser, "password"> & {
    password?: string;
  };
  if (userObject.password) delete userObject.password;

  return userObject as Omit<IUser, "password">;
};

/**
 * Updates a user by their ID.
 *
 * @param {string} id - The Object ID of the user document.
 * @param {Partial<Omit<IUser, 'password'>>} payload - The data to update.
 * @param {string} [role] - The role of the user to filter (optional).
 * @returns {Promise<Omit<IUser, 'password'> | null>} - A promise that resolves to the updated user document without the password, or null if not found.
 */
export const updateUser = async (
  id: string,
  payload: Partial<Omit<IUser, "password">>,
  role?: string
): Promise<Omit<IUser, "password"> | null> => {
  const query: any = { _id: new Types.ObjectId(id) };
  if (!isNil(role)) query.role = role;

  return UserModel.findOneAndUpdate(
    query,
    { $set: payload },
    { new: true }
  )
    .select("-password")
    .lean();
};

/**
 * Delete a user by their ID, optionally filtered by role.
 *
 * @param {string} id - The Object ID of the user document.
 * @param {string} [role] - The role of the user to filter (optional).
 * @returns {Promise<{ acknowledged: boolean, deletedCount: number }>} - Promise resolving to the result of the delete operation.
 */
export const deleteUserById = async (
  id: string,
  role?: string
): Promise<{ acknowledged: boolean; deletedCount: number }> => {
  const query: any = { _id: new Types.ObjectId(id) };
  if (!isNil(role)) query.role = role;

  return UserModel.deleteOne(query).exec();
};

/**
 * Bulk delete users by their IDs and optionally filter by role.
 *
 * @param {string[]} ids - Array of user IDs to delete.
 * @param {string} [role] - The role of the users to filter (optional).
 * @returns {Promise<(Omit<IUser, 'password'> | null)[]>} - Promise resolving to the array of updated users without password.
 */
export const bulkDeleteUsers = async (
  ids: string[],
  role?: string
): Promise<(Omit<IUser, "password"> | null)[]> => {
  const bulkOps = ids.map((id) => ({
    updateOne: {
      filter: { _id: new Types.ObjectId(id), ...(role ? { role } : {}) },
      update: { $set: { status: appStatus.DELETED } },
    },
  }));

  await UserModel.bulkWrite(bulkOps);

  const updatedUsers = await UserModel.find({
    _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    ...(role ? { role } : {}),
  })
    .select("-password")
    .lean()
    .exec();

  return updatedUsers as (Omit<IUser, "password"> | null)[];
};
