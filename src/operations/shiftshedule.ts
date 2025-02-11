import { IUsershiftschedule } from "../../types/models.types";
import usershiftschedule from "../models/usershiftschedule";
import { GetAlluserRecordsParams } from "../shared/enum";

export const getAllTeachers = async (
  params: GetAlluserRecordsParams
): Promise<{ users: IUsershiftschedule[]; totalCount: number }> => {
  const { role, date } = params;

  // Construct the query object
  const query: any = {};

  // Add role filter if provided
  if (role) {
    query.role = role;
  }

  // Add filter for a date falling within the startdate and enddate range
  if (date) {
    query.startdate = { $lte: new Date(date) }; // Start date is on or before the selected date
    query.enddate = { $gte: new Date(date) };  // End date is on or after the selected date
  }

  console.log("Query Filters: ", query);

  // Fetch all users matching the query
  const users = await usershiftschedule.find(query).exec();

  // Ensure the result matches the expected type
  const usersFormatted: IUsershiftschedule[] = users.map((user) => ({
    ...(user.toObject() as IUsershiftschedule),
  }));

  // Get the total count of users matching the query
  const totalCount = await usershiftschedule.countDocuments(query);

  return { users: usersFormatted, totalCount }; // Return both users and totalCount
};
