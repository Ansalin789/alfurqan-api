import { Types } from "mongoose";
import UserModel from "../models/users";
import { IUser, IUserCreate } from "../../types/models.types";
import { appStatus } from "../config/messages";
import { isEmpty, isNil } from "lodash";
import { GetAllRecordsParams } from "../shared/enum";


/**
 * Retrieves all user records for a given tenant, with support for search, pagination, sorting, and excluding passwords.
 *
 * @param {GetAllRecordsParams} params - The parameters for fetching user records.
 *
 * @returns {Promise<{ users: IUser[]; totalCount: number }>} - A promise that resolves to an object containing:
 *  - `users`: An array of user records for the given tenant, with passwords excluded.
 *  - `totalCount`: The total number of user records matching the query.
 */
export const getAllUserRecords = async (
  params: GetAllRecordsParams
): Promise<{ users: IUser[]; totalCount: number }> => {
  const {
    tenantId,
    searchText,
    offset,
    limit,
    sortBy,
    sortOrder,
  } = params;

  const query: any = {
    tenantId,
    status: { $in: [appStatus.ACTIVE, appStatus.IN_ACTIVE] },
  };

  if (!isEmpty(searchText)) {
    query.$or = [
      { userName: { $regex: searchText, $options: "i" } },
      { email: { $regex: searchText, $options: "i" } },
    ];
  }

  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const userQuery = UserModel.find(query).select("-password").sort(sortOptions);

  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(0, ((Number(offset) ?? 0) - 1) * (Number(limit) ?? 10));
    userQuery.skip(skip).limit(Number(limit) ?? 10);
  }

  const [users, totalCount] = await Promise.all([
    userQuery.exec(),
    UserModel.countDocuments(query).exec(),
  ]);

  return { users, totalCount };
};

/**
 * Retrieves a user record by its ID, excluding the password.
 *
 * @param {string} id - The Object ID of the user document.
 * @returns {Promise<IUser | null>} - A promise that resolves to the user record or null if not found.
 */
export const getUserRecordById = async (id: string): Promise<IUser | null> => {
  return UserModel.findOne({
    _id: new Types.ObjectId(id),
  })
    .select("-password")
    .lean();
};

/**
 * Fetches an active user record from the database based on the provided query.
 *
 * @param {Partial<{ id: string; userName: string; tenantId: string }>} query - The query object used to match the user record. At least one of 'id' or 'userName' must be provided.
 * @returns {Promise<IUser | null>} - Returns a promise that resolves to the matched user record or null if no match is found.
 */
export const getActiveUserRecord = async (
  query: Partial<{ id: string; userName: string; tenantId: string }>
): Promise<IUser | null> => {

  const { id, userName, tenantId } = query;

  const dbQuery: any = {
    status: appStatus.ACTIVE,
  };
  console.log("dbQuery", dbQuery);

  if (!isNil(id)) dbQuery._id = new Types.ObjectId(id);
  if (!isNil(userName)) dbQuery.userName = userName;
  if (!isNil(tenantId)) dbQuery.tenantId = tenantId;

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
  // Create a new instance of the UserModel with the provided data
  const newUser = new UserModel(payload);

  // Save the new user to the database
  const savedUser = await newUser.save();

  // Convert the savedUser to a plain object and omit the password
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
 * @returns {Promise<Omit<IUser, 'password'> | null>} - A promise that resolves to the updated user document without the password, or null if not found.
 */
export const updateUser = async (
  id: string,
  payload: Partial<Omit<IUser, "password">>
): Promise<Omit<IUser, "password"> | null> => {
  return UserModel.findByIdAndUpdate(
    { _id: new Types.ObjectId(id) },
    { $set: payload },
    { new: true } // Return the updated document
  )
    .select("-password")
    .lean();
};

/**
 * Delete users by their ID.
 *
 * @param {string} id -  The Object ID of the user document.
 * @returns {Promise<{ acknowledged: boolean, deletedCount: number }>} - Promise resolving to the result of the delete operation.
 */
export const deleteUserById = async (
  id: string
): Promise<{ acknowledged: boolean; deletedCount: number }> => {
  return UserModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
};

/**
 * Single and Bulk delete users by their IDs.
 *
 * @param {string[]} updates - Array of objects containing user ID to update.
 * @returns {Promise<(Omit<IUser, 'password'> | null)[]>} - Promise resolving to the array of updated users without password.
 */
export const bulkDeleteUsers = async (
  updates: string[]
): Promise<(Omit<IUser, "password"> | null)[]> => {
  // Create bulk operations
  const bulkOps = updates.map((id) => ({
    updateOne: {
      filter: { _id: new Types.ObjectId(id) },
      update: { $set: { status: appStatus.DELETED } },
    },
  }));

  // Execute bulkWrite
  await UserModel.bulkWrite(bulkOps);

  // Fetch and return the updated documents
  const ids = updates.map((id) => new Types.ObjectId(id));
  const updatedUsers = await UserModel.find({ _id: { $in: ids } })
    .select("-password")
    .lean().exec();

  // Assert the type to match the expected return type
  return updatedUsers as (Omit<IUser, "password"> | null)[];
};
