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
