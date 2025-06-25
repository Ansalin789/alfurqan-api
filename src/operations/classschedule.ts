import { Types } from "mongoose";
import { IClassSchedule, IClassScheduleCreate } from "../../types/models.types";
import  ClassScheduleModel  from "../models/classShedule"
import StudentModel from "../models/alstudents";
import UserModel from "../models/users"
import AppLogger from "../helpers/logging";
import { GetAllRecordsParams } from "../shared/enum";
import { alstudentsMessages, commonMessages } from "../config/messages";
import { isNil } from "lodash";
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from "@azure/identity";
import moment from "moment";
import classShedule from "../models/classShedule";
import { badRequest } from "@hapi/boom";
import Evaluation from "../models/evaluation";
import AlStudenModel from "../models/alstudents";

import { endOfMonth, startOfMonth, subMonths, eachMonthOfInterval, format } from "date-fns";

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
            studentEmail: studentDetails?.student?.studentEmail,
            gender: studentDetails?.student?.gender, // Ensure gender is included

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
          sessionClassType: payload.sessionClassType || "",
          sessionStarttime: payload.sessionStarttime || "",
          sessionsEndtime: payload.sessionsEndtime || "",
          sessionStatus:"NotCompleted",
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

  return results;
};


export const getAllClassShedule = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; students: IClassSchedule[] }> => {
  const { searchText, sortBy, sortOrder, offset, limit, filterValues } = params;

  // Construct query object based on filters
  const query: any = {};

  if (searchText?.trim()) {
  const escapedSearch = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const searchRegex = new RegExp(escapedSearch, 'i');
  const isDate = !isNaN(Date.parse(searchText));
  const orConditions: any[] = [
  { "student.studentFirstName": searchRegex },
      { "student.studentLastName": searchRegex },
      { "student.studentEmail": searchRegex },
      { "teacher.teacherName": searchRegex },
      { "teacher.teacherEmail": searchRegex },
      { "course.courseName": searchRegex },
      { "classDay": searchRegex },
      {"scheduleStatus": searchRegex },

  ];

  // Only add phone number if searchText is a number
  if (!isNaN(Number(searchText))) {
    orConditions.push({ candidatePhoneNumber: Number(searchText) });
  }

  if (isDate) {
    const date = new Date(searchText);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    orConditions.push({ applicationDate: { $gte: date, $lt: nextDay } });
  }

  query.$or = orConditions;
}

  // Add filters to the query
if (filterValues?.course?.courseName) {
  const values = Array.isArray(filterValues.course.courseName)
    ? filterValues.course.courseName
    : [filterValues.course.courseName];
  if (values.length > 0) {
    query["course.courseName"] = { $in: values.map(v => new RegExp(`^${v}$`, "i")) };
  }
}
if (filterValues?.sessionClassType) {
  const values = Array.isArray(filterValues.sessionClassType)
    ? filterValues.sessionClassType
    : [filterValues.sessionClassType];
  if (values.length > 0) {
    query["sessionClassType"] = { $in: values.map(v => new RegExp(`^${v}$`, "i")) };
  }
}

// --- scheduleStatus filter ---
if (filterValues?.scheduleStatus) {
  const values = Array.isArray(filterValues.scheduleStatus)
    ? filterValues.scheduleStatus
    : [filterValues.scheduleStatus];
  if (values.length > 0 && values[0]) {
    query["scheduleStatus"] = { $in: values.map(v => new RegExp(`^${v}$`, "i")) };
  }
}

// --- startTime filter ---
if (filterValues?.startTime) {
  const values = Array.isArray(filterValues.startTime)
    ? filterValues.startTime
    : [filterValues.startTime];
  // Remove empty/undefined values
  const cleaned = values.filter(v => typeof v === "string" && v.trim().length > 0);
  if (cleaned.length > 0) {
    // Use exact match (case-insensitive) for each time string
    query["startTime"] = { $in: cleaned.map(v => new RegExp(`^${v}$`, "i")) };
  }
}



// --- Date Range filter (use startDate) ---
if (
  filterValues?.dateRange?.from &&
  filterValues?.dateRange?.to &&
  !isNaN(Date.parse(filterValues.dateRange.from)) &&
  !isNaN(Date.parse(filterValues.dateRange.to))
) {
  const fromDate = new Date(filterValues.dateRange.from);
  const toDate = new Date(filterValues.dateRange.to);
  toDate.setHours(23, 59, 59, 999);
  query.startDate = { // <-- Correct field name
    $gte: fromDate,
    $lte: toDate
  };
}


  console.log("Constructed Query:", JSON.stringify(query, null, 2)); // Log the constructed query

  // Sorting options
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Create the query with sorting
  const studentQuery = ClassScheduleModel.find(query).sort(sortOptions);


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


// 
export const updateClassscheduleById = async (
  id: string,
  payload: Partial<IClassScheduleCreate>
): Promise<IClassSchedule | null> => {
  console.log("Fetching existing class for ID:", id);

  // Fetch the existing class schedule from the database
  const existingClass = await ClassScheduleModel.findById(id);
  if (!existingClass) {
    console.error("Class schedule not found for ID:", id);

    throw new Error("Class schedule not found");
  }

 // Determine class type and session times
const classType = payload.sessionClassType || existingClass.sessionClassType;
const startTime = payload.sessionStarttime || existingClass.sessionStarttime;
const endTime = payload.sessionsEndtime || existingClass.sessionsEndtime;

let amount = 0;
let sessionStatus = "NotCompleted";

if (startTime && endTime) {
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);
  const duration = endMinutes - startMinutes;

  if (duration > 0) {
    if (classType === "regular") {
      amount = (duration / 60) * 4;
    } else if (classType === "group") {
      amount = (duration / 60) * 6;
    } else if (classType === "trial") {
      amount = 2;
    }

    sessionStatus = "Completed";
  }
}

const formattedAmount = `$${amount.toFixed(2)}`;

return ClassScheduleModel.findOneAndUpdate(
  { _id: new Types.ObjectId(id) },
  {
    $set: {
      ...payload,
      amount: formattedAmount,
      sessionStatus
    }
  },
  { new: true }
).lean();


};

// Helper function to convert "HH:MM AM/PM" to minutes
const convertTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) {
    console.error("Invalid time string:", timeStr);
    return NaN;
  }

  // Replace dot (.) with colon (:) if present (fix potential formatting issue)
  timeStr = timeStr.replace(".", ":");

  const [time, modifier] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    console.error("Invalid time format:", timeStr);
    return NaN;
  }

  let totalMinutes = hours * 60 + minutes;
  if (modifier === "PM" && hours !== 12) totalMinutes += 12 * 60;
  if (modifier === "AM" && hours === 12) totalMinutes -= 12 * 60;

  return totalMinutes;
};




// Function implementation:
export const getClassesForStudent = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; classSchedule: IClassSchedule[] } | { error : any } > => {
  const { studentId, sortBy = "_id", sortOrder = "asc", offset = 1, limit = 10 } = params;

  if (!studentId) {
 return {
            error: badRequest('Student id is Required'),
        };  }
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

export const teacherStudentCount = async() =>{
  const teachers = await classShedule.aggregate([
       {
         $group: {
           _id: "$teacher.teacherId", // Group by teacherEmail
           teacherId: { $first: "$teacher.teacherId" },
           teacherName: { $first: "$teacher.teacherName" },
           teacherEmail: { $first: "$teacher.teacherEmail" },
           uniqueStudents: { 
             $addToSet: { 
               studentId: "$student.studentId", 
               gender: "$student.gender" 
             } 
           } // Collect unique student IDs and gender
         }
       },
       {
         $project: {
           teacherId: 1,
           teacherName: 1,
           teacherEmail: 1,
           studentCount: { $size: "$uniqueStudents" }, // Total unique students
           maleCount: {
             $size: {
               $filter: {
                 input: "$uniqueStudents",
                 as: "student",
                 cond: { $eq: ["$$student.gender", "MALE"] }
               }
             }
           }, // Count only male students
           femaleCount: {
             $size: {
               $filter: {
                 input: "$uniqueStudents",
                 as: "student",
                 cond: { $eq: ["$$student.gender", "FEMALE"] }
               }
             }
           }, // Count only female students
         }
       }
     ]);
     return teachers;


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





export const updateteacherreschedule = async (
  id: string,
  payload: Partial<IClassSchedule>
): Promise<(IClassSchedule | { error: any })[]> => {
  const { classDay, startTime, endTime, scheduleStatus, startDate, endDate } = payload;
  const results: (IClassSchedule | { error: any })[] = [];

  // Validate inputs
  if (
    !classDay ||
    !startTime ||
    !endTime ||
    !startDate ||
    !endDate ||
    classDay.length !== startTime.length ||
    startTime.length !== endTime.length
  ) {
    throw new Error(
      "classDay, startTime, endTime, startDate, and endDate must be provided and arrays must match in length."
    );
  }

  try {
    // Fetch student details
    const studentDetails = await classShedule.findById(new Types.ObjectId(id)).exec();
    if (!studentDetails) {
      throw new Error("Student not found.");
    }
    console.log("Student Details:", studentDetails);

    // Fetch teacher details
    const teacherDetails = await UserModel.findOne({
      role: "TEACHER",
      userId : payload.teacher?.teacherId,
    }).exec();
    if (!teacherDetails) {
      throw new Error("Teacher not found.");
    }
    console.log("Teacher Details:", teacherDetails);

    // Fetch current schedule
    const currentSchedule = await ClassScheduleModel.findById(new Types.ObjectId(id)).lean<IClassSchedule>();
    if (!currentSchedule) {
      throw new Error("Class schedule not found.");
    }

   if (Array.isArray(startTime) && startTime.length > 0) {
      const newStartTime = startTime[0];
      const newEndTime = endTime[0];

      // Validate if reschedule status requires a new start time
      if (scheduleStatus === "Reschedule" && currentSchedule.startTime === newStartTime) {
        throw new Error(
          `Rescheduling failed: The new start time (${newStartTime}) cannot be the same as the existing start time.`
        );
      }

      // Update class schedule
      const updatedClassSchedule = await ClassScheduleModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        {
          $set: {
            teacher: {
              teacherId: teacherDetails.userId,
              teacherName: teacherDetails.userName,
              teacherEmail: teacherDetails.email,
            },
            startTime: newStartTime,
            endTime: newEndTime,
            package: payload.package,
            course: payload.course,
            startDate : payload.startDate,
            endDate: payload.endDate,
            sessionClassType: payload.sessionClassType,
            sessionStarttime: payload.sessionStarttime,
            sessionsEndtime: payload.sessionsEndtime,
            totalHourse: payload.totalHourse,
            scheduleStatus: scheduleStatus,
            studentAttendee: payload.studentAttendee,
            teacherAttendee: payload.teacherAttendee,
            preferedTeacher: payload.preferedTeacher,
          },
        },
        { new: true }
      ).lean<IClassSchedule>();

      console.log("Updated Class Schedule:", updatedClassSchedule);

      if (updatedClassSchedule) {
        results.push(updatedClassSchedule);
      } else {
        results.push({ error: "Failed to update class schedule." });
      }
    }
  } catch (error: any) {
    console.error("Error in scheduling process:", error.message);
    results.push({ error: error.message });
  }

  return results;
};


export const getStudentClassCount  = async(studentId: string) =>{

  const studentClassCount= await ClassScheduleModel.aggregate([
    {
      $match: {
        status: "Active",
        "student.studentId": studentId
      },
    },
    {
      $group: {
        _id: null,
        totalClass: { $sum: 1 },
      },
    },
  ]);


  const studentLevel= await ClassScheduleModel.aggregate([
    {
      $match: {
        status: "Active",
        "student.studentId": studentId
      },
    },
    {
      $group: {
        _id: "$course.level",
        level: { $sum: 1 },
      },
    },
  ]);

  const studentAttendanceCount= await ClassScheduleModel.aggregate([
    {
      $match: {
        status: "Active",
        "student.studentId": studentId

      },
    },
    {
      $group: {
        _id: null,
        totalClass: { $sum: 1 },
        Attendance: { $sum: { $cond: [{ $eq: ["$scheduleStatus", "Completed"] }, 1, 0] } },
      },
    },
  ]);

  const studentDurationCount= await ClassScheduleModel.aggregate([
    {
      $match: {
        status: "Active",
        "student.studentId": studentId

      },
    },
    {
      $group: {
        _id: "totalHourse",
        totalDuration: { $sum: 1 },
      },
    },
  ]);
 

   const totalClasses = studentClassCount[0].totalClass;
   const totalAttendance = ((studentAttendanceCount[0].Attendance/studentAttendanceCount[0].totalClass)*100).toFixed(2);
   const level = (studentLevel[0].level).toFixed(2);
   const totalduration = (studentDurationCount[0].totalDuration).toFixed(2);

  return {totalClasses, totalAttendance, level, totalduration};
};



export const getTotalClassesCount = async (
  dateRange: string
): Promise<{ date: string; totalClass: number }[]> => {
  let startDate: Date;
  let endDate: Date = new Date(); // Default to today
  let dateFormat: string;
  let intervalFn: (interval: { start: Date; end: Date }) => Date[];
  let outputFormat: string;

  // Determine start and end dates based on dateRange
  switch (dateRange.toLowerCase()) {
    case "last8months":
      startDate = startOfMonth(subMonths(new Date(), 7)); // 7 months ago, start of month
      endDate = endOfMonth(new Date());                   // end of current month
      dateFormat = "%Y-%m"; // MongoDB date format
      intervalFn = eachMonthOfInterval;
      outputFormat = "MMM-yyyy"; // Display format
      break;
      case "last6months":
        startDate = startOfMonth(subMonths(new Date(), 5)); // 7 months ago, start of month
        endDate = endOfMonth(new Date());                   // end of current month
        dateFormat = "%Y-%m"; // MongoDB date format
        intervalFn = eachMonthOfInterval;
        outputFormat = "MMM-yyyy"; // Display format
        break;
    default:
      throw new Error("Invalid dateRange value. Use 'last8months'.");
  }

  console.log(`Fetching results from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  // MongoDB aggregation
  const result = await classShedule.aggregate([
    {
      $match: {
        status: "Active",
        startDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { date: { $dateToString: { format: dateFormat, date: "$startDate" } } },
        count: { $sum: 1 },
      },
    },
  ]);

  // Group results correctly
  const groupedResults: Record<string, { date: string; totalClass: number }> = {};
  result.forEach(({ _id, count }) => {
    const dateFormatted = format(new Date(`${_id.date}-01`), outputFormat); // append `-01` for valid Date
    groupedResults[dateFormatted] = {
      date: dateFormatted,
      totalClass: count,  // ❗ Assign the correct count here
    };
  });

  // Ensure all months are covered
  const allDates = intervalFn({ start: startDate, end: endDate }).map((d) =>
    format(d, outputFormat)
  );

  const finalResult = allDates.map((date) => groupedResults[date] || { date, totalClass: 0 });

  return finalResult;
};


export const getClassesStatusCount = async() => {
 const evaluationStats = await classShedule.aggregate([
    {
      $match: {
        status: "Active",
      },
    },
    {
      $group: {
        _id: null,
        totalClassCount: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$scheduleStatus", "Reschedule"] }, 1, 0] } },
        reschedule: { $sum: { $cond: [{ $eq: ["$scheduleStatus", "Reschedule"] }, 1, 0] } },
        complete: { $sum: { $cond: [{ $eq: ["$scheduleStatus", "Complete"] }, 1, 0] } },
      },
    },
  ]);
   const pendingPercentage = ((evaluationStats[0].pending/ evaluationStats[0].totalClassCount)*100).toFixed(2);
   const reschedulePercentage = ((evaluationStats[0].reschedule/ evaluationStats[0].totalClassCount)*100).toFixed(2);
   const completePercentage = ((evaluationStats[0].complete/ evaluationStats[0].totalClassCount)*100).toFixed(2);

   const total = evaluationStats[0].totalClassCount;

  return {total, pendingPercentage, reschedulePercentage,completePercentage};
  
};


export const getClassesWiseCount = async() => {
  const classschedule = await classShedule.aggregate([
     {
       $match: {
         status: "Active",
       },
     },
     {
       $group: {
         _id: null,
         totalRegularClassCount: { $sum: 1 },
       },
     },
   ]);

   const evaluationStats = await Evaluation.aggregate([
    {
      $match: {
        trialClassStatus: "COMPLETED",
      },
    },
    {
      $group: {
        _id: null,
        totalTrialClassCount: { $sum: 1 },
      },
    },
  ]);
 
   return {classschedule, evaluationStats};
   
 };



 export const getStudentList = async (
  teacherId: string
): Promise<{ studentId: string; name: string }[]> => {
  if (!teacherId) {
    throw new Error("Teacher ID is required");
  }

  try {
    // Fetch class schedules taught by the given teacher, returning only the 'student' field
    const classSchedules = await ClassScheduleModel.find(
      { "teacher.teacherId": teacherId },
      { student: 1 }
    ).lean();

    const uniqueStudentsMap = new Map();

    for (const cls of classSchedules) {
      const student = cls.student;
      if (student?.studentId && !uniqueStudentsMap.has(student.studentId)) {
        const alstudent = await AlStudenModel.findOne({
          "student.studentId": cls.student.studentId
        }).exec();
        let evaluation 
        if(alstudent){
          evaluation = await Evaluation.findOne({
            "student.studentId": alstudent.student.studentId
          }).exec();
        }

        uniqueStudentsMap.set(student.studentId, {
          studentId: student.studentId,
          name: student.studentFirstName, // or student.name depending on your schema
          studentDetails: evaluation
        });
      }
    }

    return Array.from(uniqueStudentsMap.values());
  } catch (error) {
    console.error("Error fetching students for teacher:", error);
    throw new Error("Failed to fetch students for the teacher");
  }
};


export const getTeacherAttendanceSummary = async (
  teacherId: string
): Promise<{
  totalStudents: number;
  totalClasses: number;
  totalAttendance: number;
  totalWorkingHours: number;
  overallPerformance: number;
  students: {
    studentId: string;
    studentFirstname: string;
    studentLastName: string;
  }[];
}> => {
  if (!teacherId) {
    throw new Error("Teacher ID is required");
  }

  const DEFAULT_SESSION_DURATION_MINUTES = 30;

  try {
    const classSchedules = await ClassScheduleModel.find(
      { "teacher.teacherId": teacherId },
      {
        student: 1,
        sessionStarttime: 1,
        sessionsEndtime: 1,
        scheduleStatus: 1
      }
    ).lean();

    let totalWorkingMinutes = 0;
    let totalAttendance = 0;

    const students: {
      studentId: string;
      studentFirstname: string;
      studentLastName: string;
    }[] = [];

    for (const cls of classSchedules) {
      const student = cls.student;

      if (student?.studentId) {
        students.push({
          studentId: student.studentId,
          studentFirstname: student.studentFirstName,
          studentLastName: student.studentLastName
        });
      }

      if (cls.scheduleStatus === "Completed") {
        totalAttendance++;

        let sessionDuration = DEFAULT_SESSION_DURATION_MINUTES;

        if (cls.sessionStarttime && cls.sessionsEndtime) {
          const [startH, startM] = cls.sessionStarttime.replace(/[^0-9:]/g, '').split(":").map(Number);
          const [endH, endM] = cls.sessionsEndtime.replace(/[^0-9:]/g, '').split(":").map(Number);

          if (
            !isNaN(startH) && !isNaN(startM) &&
            !isNaN(endH) && !isNaN(endM)
          ) {
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            const calculated = Math.max(0, endMinutes - startMinutes);
            sessionDuration = calculated > 0 ? calculated : DEFAULT_SESSION_DURATION_MINUTES;
          }
        }

        totalWorkingMinutes += sessionDuration;
      }
    }

    const totalWorkingHours = parseFloat((totalWorkingMinutes / 60).toFixed(2));

    // ✅ Your custom performance formula
    const overallPerformance = parseFloat(
      (((totalAttendance + totalWorkingHours) / 2)).toFixed(2)
    );

    return {
      totalStudents: students.length,
      totalClasses: classSchedules.length,
      totalAttendance,
      totalWorkingHours,
      overallPerformance,
      students
    };
  } catch (error) {
    console.error("Error generating teacher summary:", error);
    throw new Error("Failed to generate teacher attendance summary");
  }
};





