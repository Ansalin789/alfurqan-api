
import { isNil } from "lodash";
import { IAlStudents } from "../../types/models.types";
import { alstudentsMessages, commonMessages } from "../config/messages";
import { GetAllRecordsParams } from "../shared/enum";
import AppLogger from "../helpers/logging";
import AlStudentsModel from "../models/alstudents"; // Ensure proper model import
import { Types } from "mongoose";

export const getAllalstudentsList = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; students: IAlStudents[] }> => {
  const { searchText, sortBy, sortOrder, offset, limit, filterValues } = params;

  // Construct query object based on filters
  const query: any = {};

  // Add searchText to the query if provided
  if (searchText) {
    query.$or = [
      { name: { $regex: searchText, $options: "i" } }, // Search by name
      { email: { $regex: searchText, $options: "i" } }, // Search by email (if applicable)
    ];
  }

  // Add filters to the query
  if (filterValues) {
    if (filterValues.course) {
      query.course = { $in: filterValues.course }; // Filter by course
    }
    if (filterValues.country) {
      query.country = { $in: filterValues.country }; // Filter by country
    }
    if (filterValues.teacher) {
      query.teacher = { $in: filterValues.teacher }; // Filter by teacher IDs
    }
    if (filterValues.status) {
      query.status = { $in: filterValues.status }; // Filter by status
    }
  }

  console.log("Constructed Query:", JSON.stringify(query, null, 2)); // Log the constructed query

  // Sorting options
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Create the query with sorting
  const studentQuery = AlStudentsModel.find(query).sort(sortOptions);

  // Apply pagination (offset and limit)
  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
      (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    studentQuery.skip(skip).limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }

  // Execute the query and count concurrently
  const [students, totalCount] = await Promise.all([
    studentQuery.exec(), // Fetch students with pagination
    AlStudentsModel.countDocuments(query).exec(), // Count total records
  ]);

  // Log successful retrieval
  AppLogger.info(alstudentsMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });

  // Return total count and fetched students
  return { totalCount, students };
};

 export const getalstudentsById = async (
    id: string
  ): Promise<IAlStudents | null> => {
    return AlStudentsModel.findOne({
      _id: new Types.ObjectId(id),
    }).lean();
  };