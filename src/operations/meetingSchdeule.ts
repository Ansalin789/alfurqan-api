import { isNil } from "lodash";
import { IMeetingSchedule } from "../../types/models.types";
import { commonMessages, meetingSchedulesMessages } from "../config/messages";
import { GetAllRecordsParams } from "../shared/enum";
import AppLogger from "../helpers/logging";
import MeetingSchedules from "../models/calendar";

export const getAllAcademicCoach = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; academicCoach: IMeetingSchedule[] }> => {
  const { searchText, sortBy, sortOrder, offset, limit } = params;

  // Construct query object
  const query: any = {
    "academicCoach.academicCoachId": { $ne: null }, // Exclude null academicCoachId
  };

  // if (!isNil(params)) {
  //   query["academicCoach.academicCoachId"] = { $ne: null };
  // }

  // Add searchText filter
  // if (searchText) {
  //   query.$or = [
  //     { "academicCoach.name": { $regex: searchText, $options: "i" } }, // Search by academic coach name
  //     { "academicCoach.email": { $regex: searchText, $options: "i" } }, // Search by academic coach email
  //   ];
  // }

  // Log query for debugging
  console.log("Constructed Query:", JSON.stringify(query, null, 2));

  // Sorting options
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Pagination
  const Query = MeetingSchedules.find(query).sort(sortOptions);
  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
        (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    Query.skip(skip).limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }

  // Execute query and count total records concurrently
  const [academicCoach, totalCount] = await Promise.all([
    Query.exec(),
    MeetingSchedules.countDocuments(query).exec(),
  ]);

  // Log the fetched records
  AppLogger.info(meetingSchedulesMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });

  // Return results
  return { totalCount, academicCoach };
};
