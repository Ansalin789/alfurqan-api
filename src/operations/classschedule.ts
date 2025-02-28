import { Types } from "mongoose";
import { IClassSchedule, IClassScheduleCreate } from "../../types/models.types";
import  ClassScheduleModel  from "../models/classShedule"
import StudentModel from "../models/alstudents";
import UserModel from "../models/users"
import AppLogger from "../helpers/logging";
import { GetAllRecordsParams } from "../shared/enum";
import { alstudentsMessages, ClassSchedulesMessages, commonMessages } from "../config/messages";
import { isNil } from "lodash";
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from "@azure/identity";
import classShedule from "../models/classShedule";
import student from "../models/student";
import moment from "moment";

/**
 * Creates a new candidate record in the database.
 *
 * @param {IClassScheduleCreate} payload - The data required to create a new candidate record.
 * @returns {Promise<IClassSchedule | null>} A promise that resolves to the created candidate record, or null if the creation fails.
 */

// Helper function to get dates for specific weekdays between two dates
const getDatesForWeekdays = (startDate: Date, endDate: Date, targetDay: number): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() === targetDay) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const updateStudentClassSchedule = async (
  id: string,
  payload: Partial<IClassScheduleCreate>
): Promise<(IClassSchedule | { error: any })[]> => {
  const { classDay, startTime, endTime, startDate, endDate } = payload;

  const results: (IClassSchedule | { error: any })[] = [];
  const resultss: (IClassScheduleCreate | { error: any })[] = [];

  // Validate inputs
  if (!classDay || !startTime || !endTime || !startDate || !endDate || 
      classDay.length !== startTime.length || startTime.length !== endTime.length) {
    throw new Error("classDay, startTime, endTime, startDate, and endDate must be provided and arrays must match in length.");
  }

  for (let i = 0; i < classDay.length; i++) {
    const day = classDay[i];
    const start = startTime[i];
    const end = endTime[i];

    try {
      // Fetch student details
      const studentDetails = await StudentModel.findOne({
        _id: new Types.ObjectId(id)
      }).exec();

      console.log("studentDetails>>>", studentDetails);

      // Fetch teacher details
      const teacherDetails = await UserModel.findOne({
        role: "TEACHER",
        userName: payload.teacher?.teacherName
      }).exec();

      console.log("teacherDetails>>>", teacherDetails);

      // Map day name to numeric day (0=Sunday, 1=Monday, ..., 6=Saturday)
      const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
      if (dayIndex === -1) {
        throw new Error(`Invalid classDay: ${day}`);
      }

      // Generate class dates within the range
      const classDates = getDatesForWeekdays(new Date(startDate), new Date(endDate), dayIndex);
      const meetingId = `alfregularclass-${studentDetails?._id}`;

      for (const classDate of classDates) {
        const newClassSchedule = new ClassScheduleModel({
          student: {
            studentId: studentDetails?._id,
            studentFirstName: studentDetails?.username,
            studentLastName: studentDetails?.username,
            studentEmail: studentDetails?.student?.studentEmail
          },
          teacher: {
            teacherId: teacherDetails?._id,
            teacherName: teacherDetails?.userName,
            teacherEmail: teacherDetails?.email
          },
          classLink:meetingId, 
          classDay: day,
          startTime: start,
          endTime: end,
          course:studentDetails?.student?.course,
          package: studentDetails?.student?.package,
          startDate: classDate,
          endDate: classDate,
          createdBy: new Date(),
          status: "Active",
          scheduleStatus: "Active",
          totalHourse: payload.totalHourse,
          preferedTeacher: payload.preferedTeacher,
        });

        //await createRecurringEvents("tech@alfurqan.academy",newClassSchedule.startDate, newClassSchedule.endDate, newClassSchedule.classDay,newClassSchedule);
         const eventDetails = await createEvent(newClassSchedule);
         console.log("eventDetails>>>", eventDetails);

        const savedClassSchedule = await newClassSchedule.save();
        console.log("savedClassSchedule>>>>", savedClassSchedule);
        results.push(savedClassSchedule);
      }
    } catch (error) {
      console.error("Error in scheduling:", error);
      results.push({ error });
    }
  }

  //console.log("results>>>", results);
  return results;
};


export const getAllClassShedule = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; students: IClassSchedule[] }> => {
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
  const studentQuery = ClassScheduleModel.find(query).sort(sortOptions);
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
    ClassScheduleModel.countDocuments(query).exec(), // Count total records
  ]);

  // Log successful retrieval
  AppLogger.info(alstudentsMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });

  // Return total count and fetched students
  return { totalCount, students };
};

 export const getAllClassSheduleById = async (
    _id: string
  ): Promise<IClassSchedule | null> => {
    return ClassScheduleModel.findOne({
      _id: new Types.ObjectId(_id),
    }).lean();
  };

 
 const { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID } : any = process.env;

// Initialize Azure Credential
const credential = new ClientSecretCredential(
  MICROSOFT_TENANT_ID,
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET
);

// Initialize Microsoft Graph Client
const client = Client.initWithMiddleware({
  authProvider: {
      getAccessToken: async (): Promise<string> => {
          const tokenResponse = await credential.getToken(
              'https://graph.microsoft.com/.default'
          );
          return tokenResponse.token;
      },
  }
});


// Create Event Function
async function createEvent(newClassSchedule: any): Promise<void> {
  console.log("newClassSchedule>>>>", newClassSchedule)
  const event = {
      subject: 'Team Meeting',
      body: {
          contentType: 'HTML',
          content: 'Discuss project updates and next steps.',
      },
      start: {
          dateTime: new Date(newClassSchedule.startDate).toISOString(),
          timeZone: 'Asia/Kolkata',
      },
      end: {
          dateTime: new Date(newClassSchedule.endDate).toISOString(),
          timeZone: 'Asia/Kolkata',
      },
      location: {
          displayName: 'Conference Room 1',
      },
      attendees: [
          {
              emailAddress: {
                  address: newClassSchedule.student.studentEmail,
                  name: newClassSchedule.studentFirstName,
              },
              type: 'required',
          },
          {
              emailAddress: {
                  address: newClassSchedule.teacher.teacherEmail,
                  name: newClassSchedule.teacher.teacherEmail,
              },
              type: 'required',
          },
      ],
      allowNewTimeProposals: true,
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
  };

  try {
      const userId = 'tech@alfurqan.academy';
      const response = await client.api(`/users/${userId}/calendar/events`).post(event);
      console.log('Event created successfully:', response.id);

      console.log('Event created successfully:', response.id);
  } catch (error: any) {
      console.error('Error creating event:', error);
      if (error) {
          console.error('Response body:', error);
          console.error('Response headers:', error);
      } else {
          console.error('Error message:', error);
      }
  }
}


export const updateClassscheduleById = async (
  id: string,
  payload: Partial<IClassScheduleCreate>
): Promise<IClassSchedule | null> => {
  return ClassScheduleModel.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    { $set: payload },
    { new: true }
  ).lean();
};

// Function implementation:
export const getClassesForStudent = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; classSchedule: IClassSchedule[] }> => {
  const { studentId, sortBy = "_id", sortOrder = "asc", offset = 1, limit = 10 } = params;

  if (!studentId) {
    throw new Error("Student ID is required");
  }
  // Query filtering for studentId
  const query: any = { "student.studentId": studentId };
  console.log(">>",query)

  // Sorting options
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  try {
    // Pagination calculations
    const skip = Math.max(0, (Number(offset) - 1) * Number(limit));

    // Execute queries
    const [classSchedule, totalCount] = await Promise.all([
      ClassScheduleModel.find(query).sort(sortOptions).skip(skip).limit(Number(limit)).exec(),
      ClassScheduleModel.countDocuments(query).exec(),
    ]);

    return { totalCount, classSchedule };
  } catch (error) {
    console.error("Error fetching classes for student:", error);
    throw new Error("Failed to fetch classes for the student");
  }
};

export const getClassesForTeacher = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; classSchedule: IClassSchedule[] }> => {
  const { teacherId, sortBy = "_id", sortOrder = "asc", offset = 1, limit = 10 } = params;

  if (!teacherId) {
    throw new Error("Teacher ID is required");
  }
  // Query filtering for studentId
  const query: any = { "teacher.teacherId": teacherId };
  console.log(">>",query)

  // Sorting options
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  try {
    // Pagination calculations
    const skip = Math.max(0, (Number(offset) - 1) * Number(limit));

    // Execute queries
    const [classSchedule, totalCount] = await Promise.all([
      ClassScheduleModel.find(query).sort(sortOptions).skip(skip).limit(Number(limit)).exec(),
      ClassScheduleModel.countDocuments(query).exec(),
    ]);

    return { totalCount, classSchedule };
  } catch (error) {
    console.error("Error fetching classes for student:", error);
    throw new Error("Failed to fetch classes for the student");
  }
};






export const getStudentClassHours = async (
  studentId: string
): Promise<{ pendingPercentage: number; completedPercentage: number; totalHours: number }> => {
  if (!studentId) {
    console.error("Student ID is missing");
    throw new Error("Student ID is required");
  }

  try {
    console.log(`Fetching class hours for student: ${studentId}`);

    // Query for the student schedule
    const query: any = { "student.studentId": studentId };
    const classSchedule = await ClassScheduleModel.find(query).exec();

    if (!classSchedule || classSchedule.length === 0) {
      console.warn(`No class schedule found for student: ${studentId}`);
      return { pendingPercentage: 0, completedPercentage: 0, totalHours: 0 };
    }

    console.log("Fetched class schedules:", JSON.stringify(classSchedule, null, 2));

    let completedHours = 0;
    let pendingHours = 0;

    classSchedule.forEach(event => {
      console.log("Raw event data:", JSON.stringify(event, null, 2));

      // Ensure `classStatus` exists and normalize case
      const status = event.classStatus ? event.classStatus.trim().toLowerCase() : "unknown";
      const hours = Number(event.totalHourse) || 0; // Ensure it's a number

      if (hours > 0) {
        if (status === "completed") {
          completedHours += hours;
          console.log(`Adding ${hours} hours to Completed (${completedHours} total)`);
        } else if (status === "pending") {
          pendingHours += hours;
          console.log(`Adding ${hours} hours to Pending (${pendingHours} total)`);
        } else {
          console.warn(`Skipping event with unknown status: "${status}"`, event);
        }
      } else {
        console.warn(`Skipping event with zero or invalid hours: ${hours}`);
      }
    });

    const totalHours = completedHours + pendingHours;
    const pendingPercentage = totalHours > 0 ? (pendingHours / totalHours) * 100 : 0;
    const completedPercentage = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

    console.log(`Final Totals -> Completed: ${completedHours}, Pending: ${pendingHours}, Total: ${totalHours}`);
    console.log(`Final Percentages -> Pending: ${pendingPercentage.toFixed(2)}%, Completed: ${completedPercentage.toFixed(2)}%`);

    return { pendingPercentage, completedPercentage, totalHours };
  } catch (error) {
    console.error("Error fetching class hours for student:", error);
    throw new Error("Failed to fetch class hours for the student");
  }
};







export const teachingActivity = async (
  studentId: string
): Promise<{ month: string; completedHours: number; pendingHours: number; totalHours: number }[]> => {
  if (!studentId) {
    throw new Error("Student ID is required");
  }

  try {
    // Fetch all class schedules for the student
    const classSchedule = await ClassScheduleModel.find({ "student.studentId": studentId }).exec();

    if (!classSchedule || classSchedule.length === 0) {
      console.warn(`No class schedule found for student: ${studentId}`);
      return [];
    }

    // Debugging logs
    console.log("Fetched class schedules:", classSchedule);

    // Initialize an object to group hours by month
    const monthlyData: Record<
      string,
      { completedHours: number; pendingHours: number; totalHours: number }
    > = {};

    classSchedule.forEach((event) => {
      const month = moment(event.startDate).format("YYYY-MM"); // Get month in "YYYY-MM" format
      const hours = Number(event.totalHourse) || 0;
      const status = event.classStatus?.trim().toLowerCase();

      // Initialize month if not present
      if (!monthlyData[month]) {
        monthlyData[month] = { completedHours: 0, pendingHours: 0, totalHours: 0 };
      }

      // Categorize hours
      if (status === "completed") {
        monthlyData[month].completedHours += hours;
      } else if (status === "pending") {
        monthlyData[month].pendingHours += hours;
      } else {
        console.warn(`Unexpected classStatus "${event.classStatus}" for event:`, event);
      }

      // Update total hours
      monthlyData[month].totalHours += hours;
    });

    // Convert object to an array for frontend use
    const result = Object.keys(monthlyData).map((month) => ({
      month,
      ...monthlyData[month],
    }));

    console.log("Processed monthly teaching activity:", result);

    return result;
  } catch (error) {
    console.error("Error fetching class hours for student:", error);
    throw new Error("Failed to fetch class hours for the student");
  }
};


