import { isNil } from "lodash";
import { ICourse } from "../../types/models.types";
import course from "../models/course";
import { GetAllRecordsParams } from "../shared/enum";
import { commonMessages } from "../config/messages";
import AppLogger from "../helpers/logging";
import { HydratedDocument } from "mongoose";

export const createCourses = async (
    payload: Partial<ICourse>
  ): Promise<{ totalCount: number; course: ICourse } | { error: any }> => {
  try {
    const autoGenerateCourseId = (): string => {
      const digits = Math.floor(1000 + Math.random() * 9000); // 4 digits
      const letters = Array.from({ length: 3 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z
      ).join('');
      return `${digits}${letters}`;
    };

    const generateCourseId = autoGenerateCourseId();
    const result = new course({
      course: {
        courseId: generateCourseId,
        courseTitle: payload.course?.courseTitle || "",
        courseDuration: payload.course?.courseDuration || "",
        courseDescription: payload.course?.courseDescription || "",
        courseLevel: payload.course?.courseLevel || "",
      },
      courseName: payload.courseName || "",
      level: (payload.level || []).map((lvl) => ({
          levelId: lvl?.levelId || "",  
          contentLevel: lvl?.contentLevel || "",
          descriptions: typeof lvl?.descriptions === "string"
            ? Buffer.from(lvl.descriptions) // Convert string to Buffer if necessary
            : lvl?.descriptions || Buffer.from(''), // Default to empty Buffer if undefined
          duration: lvl?.duration || "",
        })),
        
      status: payload.status || "Active",
      createdDate: new Date(),
      createdBy: payload.createdBy || "System",
      lastUpdatedDate: new Date(),
      lastUpdatedBy: payload.lastUpdatedBy || "System",
    });

    const courseRecord = await result.save();
    const totalCount = await course.countDocuments();

    return { totalCount, course: courseRecord.toObject() };
  } catch (error) {
    console.error(" Error creating course:", error);
    return { error };
  }
};

export const getAllCourse = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; courses: ICourse[] }> => {
  const { searchText, sortBy, sortOrder, offset, limit } = params;

  const query: any = {};

  if (searchText) {
    query.$or = [
      { name: { $regex: searchText, $options: "i" } },
      { email: { $regex: searchText, $options: "i" } },
    ];
  }

  console.log("Constructed Query:", JSON.stringify(query, null, 2));

  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const studentQuery = course.find(query).sort(sortOptions);

  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
      (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    studentQuery.skip(skip).limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }

  const [courses, totalCount] = await Promise.all([
    studentQuery.exec(),
    course.countDocuments(query).exec(),
  ]);

  AppLogger.info(commonMessages.GET_ALL_LIST_SUCCESS, { totalCount });

  return { totalCount, courses };
};


export const UpdateAllLevel = async (
  courseId: string,
  payload: Partial<ICourse>
): Promise<{ totalCount: number; course: ICourse | null } | { error: any }> => {
  try {
    // Find the course by courseId
    const existingCourse = await course.findOne({ "course.courseId": courseId });

    if (!existingCourse) {
      return { error: "Course not found" };
    }

    // Create new level objects from payload (handle as an array)
    const newLevels = (payload.level ?? []).map(level => ({
      levelId: level.levelId || "",  // Add levelId from the payload
      contentLevel: level.contentLevel || "",
      descriptions: typeof level.descriptions === "string"
        ? Buffer.from(level.descriptions)  // If descriptions is a string, convert to Buffer
        : level.descriptions || Buffer.from(""),  // Default to empty buffer if undefined
      duration: level.duration || "",
    }));

    // Ensure levels array exists in the course before modifying it
    if (Array.isArray(existingCourse.level)) {
      existingCourse.level.push(...newLevels);  // Spread the new levels into the existing array
    } else {
      // If there's no levels array, create a new array with new levels
      existingCourse.level = newLevels;
    }

    // Update course metadata fields
    existingCourse.status = payload.status || existingCourse.status;
    existingCourse.lastUpdatedDate = new Date();
    existingCourse.lastUpdatedBy = payload.lastUpdatedBy || "System";

    // Save the updated course
    const updatedCourse = await existingCourse.save();

    // Get the total count of courses
    const totalCount = await course.countDocuments();

    // Return the updated course and total count
    return { totalCount, course: updatedCourse };
  } catch (error) {
    console.error("Error updating course level:", error);
    return { error };
  }
};





export const ListCourseLevels = async (
  courseId: string,
  params: {
    searchText?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    offset?: number;
    limit?: number;
  } = {} 
): Promise<{ totalCount: number; courses: ICourse[] } | { error: any }> => {

  try {
    const { searchText, sortBy = 'createdDate', sortOrder = 'desc', offset, limit } = params;

    const query: any = {
      "course.courseId": courseId,
    };

    if (searchText) {
      query.$or = [
        { courseName: { $regex: searchText, $options: "i" } },
        { "course.courseTitle": { $regex: searchText, $options: "i" } },
      ];
    }

    console.log("Constructed Query:", JSON.stringify(query, null, 2));

    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const courseQuery = course.find(query).sort(sortOptions);

    if (offset !== undefined && limit !== undefined) {
      const skip = Math.max(0, (Number(offset) - 1) * Number(limit));
      courseQuery.skip(skip).limit(Number(limit));
    }

    const [courses, totalCount] = await Promise.all([
      courseQuery.exec(),
      course.countDocuments(query).exec(),
    ]);

    return { totalCount, courses };
  } catch (error) {
    console.error("Error fetching course levels:", error);
    return { error };
  }
};
