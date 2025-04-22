import { Types } from "mongoose";
import { IAccessModel } from "../../types/models.types";
import roleacces from "../models/roleacces";




/**
 * Generates role-based access and stores in AccessModel for all users with given role
 * @param role - Role to filter users by
 */
export const updateUserAccess = async (
  payload: Partial <IAccessModel>
): Promise<{ totalCount: number; assignments: IAccessModel[] } | { error: any }> => {
  try {
    const roleAccess = new roleacces(payload);
    const saved = await roleAccess.save();
    const totalCount = await roleacces.countDocuments();

    return {
      totalCount,
      assignments: [saved]
    };
  } catch (error) {
    console.error("Error saving role access:", error);
    return { error };
  }
};



/**
 * Retrieves all meeting records with optional filters.
 */
interface FilterOptions {
  employeeName?: string;
  designation?: string;
  fromDate?: string;
  toDate?: string;
}

export default async function getallsettinglist(filters: FilterOptions) {
  const query: any = {};

  if (filters.employeeName) {
    query.employeeName = { $regex: filters.employeeName, $options: 'i' }; // Case-insensitive
  }

  if (filters.designation) {
    query.designation = filters.designation; // or use $in if multiple possible
  }

  if (filters.fromDate && filters.toDate) {
    query.dateOfJoining = {
      $gte: new Date(filters.fromDate),
      $lte: new Date(filters.toDate),
    };
  }

  const result = await roleacces.find(query);
  return result;
}


export const getrolesettingById = async (settingId: string) => {
  try {
    const settings = await roleacces.findOne({ _id: new Types.ObjectId(settingId) }).lean();
    return { settings };
  } catch (error) {
    throw new Error(`Failed to fetch role access: ${(error as Error).message}`);
  }
};
