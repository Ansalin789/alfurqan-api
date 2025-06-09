import { IMeeting, IMeetingCreate, ITeacher } from "../../types/models.types";

import Meeting from "../models/addmeeting";
import User from "../models/users";
import cron from "node-cron";
import { GetAllRecordsParams } from "../shared/enum";
import { Types } from "mongoose";
const addmeeting = Meeting;

export interface IMeetingUpdate{
    meetingName:string,
    selectedDate: Date,
    status?:string,
    meetingStatus?: string,
    startTime:string,
    endTime:string,
    updatedDate?:Date,
    updatedBy?:string,
    description:string,
    }

export interface IMeetingMinutesUpdate {
  meetingStatus: string;
  duration: string;
  meetingminutes: string;
  teacher: ITeacher[];  // Fix this from `string` to `ITeacher[]`
}


/**
 * Creates a new meeting.
 *
 * @param {IMeetingCreate} payload - The data for the new meeting.
 */


  

/**
 * Retrieves all meeting records with optional filters.
 */

export const getAllMeetingRecords = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; meetings: IMeeting[] }> => {
  try {
    const { searchText, filterValues = {}, offset, limit } = params;
    const query: any = {};

    // --- Search Text Handling ---
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
        { "meetingStatus": searchRegex },
      ];

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

    // --- meetingStatus filter ---
    if (filterValues.meetingStatus) {
      const values = Array.isArray(filterValues.meetingStatus)
        ? filterValues.meetingStatus
        : [filterValues.meetingStatus];
      const cleaned = values.filter(v => typeof v === "string" && v.trim().length > 0);
      if (cleaned.length > 0) {
        query["meetingStatus"] = { $in: cleaned.map(v => new RegExp(`^${v}$`, "i")) };
      }
    }

    // --- startTime filter ---
    if (filterValues.startTime) {
      const values = Array.isArray(filterValues.startTime)
        ? filterValues.startTime
        : [filterValues.startTime];
      const cleaned = values.filter(v => typeof v === "string" && v.trim().length > 0);
      if (cleaned.length > 0) {
        query["startTime"] = { $in: cleaned.map(v => new RegExp(`^${v}$`, "i")) };
      }
    }

    // --- Date Range filter (use startDate) ---
    if (
      filterValues.dateRange?.from &&
      filterValues.dateRange?.to &&
      !isNaN(Date.parse(filterValues.dateRange.from)) &&
      !isNaN(Date.parse(filterValues.dateRange.to))
    ) {
      const fromDate = new Date(filterValues.dateRange.from);
      const toDate = new Date(filterValues.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      query.selectedDate={
        $gte: fromDate,
        $lte: toDate
      };
    }

    // --- MongoDB Query Execution with Pagination ---
     const meetings = await Meeting.find(query).sort({ createdDate: -1 });
    const totalCount = await Meeting.countDocuments(query);

    return { totalCount, meetings };
  } catch (error) {
    throw new Error("Error fetching meetings: " + error);
  }
};




export const createMeeting = async ( payload: IMeetingCreate): Promise<IMeeting | { error: any }> => {
  try {
    // Extract and sanitize supervisor fields from payload
    const supervisor = {
      supervisorId: payload.supervisor?.supervisorId ?? "",
      supervisorName: payload.supervisor?.supervisorName ?? "",
      supervisorEmail: payload.supervisor?.supervisorEmail ?? "",
    };

    // Convert selectedDate to a Date object
    const meetingDate = new Date(payload.selectedDate);
    const { startTime, endTime } = payload;

    // Check for overlapping meeting
    const conflictingMeeting = await Meeting.findOne({
      selectedDate: meetingDate,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (conflictingMeeting) {
      return {
        error:
          "A meeting is already scheduled at this time. Please choose a different time slot.",
      };
    }

    // Generate meetingId
    const meetingId = `teacher-${supervisor.supervisorId || "unknown"}`;

    // Check for past date
    if (meetingDate < new Date()) {
      return { error: "Meeting date cannot be in the past. Please select a future date." };
    }

    // Create meeting document
    const newMeeting = new Meeting({
      ...payload,
      supervisor, // ✅ Use directly from payload
      meetingId,
    });

    const savedMeeting = await newMeeting.save();
    return savedMeeting;
  } catch (error) {
    console.error("Error creating meeting:", error);
    return { error };
  }
};



// Auto Schedule Weekly Meeting - for ALL teachers (new, old, logged-in or not)
const autoScheduleMeeting = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based index

    const isFebruary = month === 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Define base dates based on month
    let baseDays = isFebruary ? [14, 28] : [15, 30];

    // Ensure the dates exist in the month (e.g., for Feb with 29 days)
    baseDays = baseDays.map(day => Math.min(day, daysInMonth));

    // Convert base days to Date objects, adjust if Sunday
    const meetingDates = baseDays.map(day => {
      const date = new Date(year, month, day, 10, 0, 0); // 10:00 AM
      const isSunday = date.getDay() === 0; // 0 = Sunday
      if (isSunday) {
        date.setDate(date.getDate() + 1); // move to Monday
      }
      return date;
    });

    const startTime = "10:00";
    const endTime = "10:30";

    const supervisor = await User.findOne({ role: "SUPERVISOR" });
    if (!supervisor) {
      console.log("❌ No supervisor found. Cannot schedule a meeting.");
      return;
    }

    const teachers = await User.find({ role: { $in: ["TEACHER"] }, status: "Active" });
    if (teachers.length === 0) {
      console.log("❌ No active teachers found.");
      return;
    }

    for (const date of meetingDates) {
      for (const teacher of teachers) {
        const existingMeeting = await Meeting.findOne({
          selectedDate: date,
          "supervisor.supervisorId": supervisor._id.toString(),
          "teacher.teacherId": teacher._id.toString(),
        });

        if (existingMeeting) {
          console.log(`⚠️ Meeting already scheduled for ${teacher.userName} on ${date.toDateString()}`);
          continue;
        }

        const newMeeting = new Meeting({
          meetingId: `auto-${supervisor._id}-${teacher._id}-${date.toISOString().split("T")[0]}`,
          meetingName: `Auto-Scheduled Meeting for ${teacher.userName} on ${date.toDateString()}`,
          description: "This is an automatically scheduled meeting.",
          createdDate: new Date(),
          selectedDate: date,
          startTime: startTime,
          endTime: endTime,
          createdBy: supervisor.userName,
          teacher: [
            {
              teacherId: teacher._id.toString(),
              teacherName: teacher.userName,
              teacherEmail: teacher.email,
            }
          ],
          supervisor: {
            supervisorId: supervisor._id.toString(),
            supervisorName: supervisor.userName,
            supervisorEmail: supervisor.email,
            supervisorRole: Array.isArray(supervisor.role) ? supervisor.role[0] : supervisor.role,
          },
          meetingStatus: "Scheduled",
          status: "Active",
        });

        await newMeeting.save();
        console.log(`✅ Scheduled meeting for ${teacher.userName} on ${date.toDateString()}`);
      }
    }
  } catch (error) {
    console.error("❌ Error auto-scheduling meetings:", error);
  }
};




// CRON Job to run auto-scheduling at 23:55 every day
cron.schedule("55 23 * * *", async () => {
    console.log("⏰ Running the auto-scheduling job every 23:55...");
    await autoScheduleMeeting();
});



//Get by ID

export const getMeetingRecordById = async (
  id: string
): Promise<IMeeting | null> => {
  return addmeeting.findOne({
    _id: new Types.ObjectId(id),
  }).lean();
};


//Update

export const updateMeetingById = async (
  id: string,
  payload: Partial<IMeetingUpdate>
): Promise<IMeeting | null> => {
  return addmeeting.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    { $set: payload },
    { new: true }
  ).lean();
}


//Update meeting minutes

export const updateMeetingMinutesAndAttendees = async (
  id: string,
  meetingminutes: string,
  meetingStatus: string,
  duration: string,
  teacher: ITeacher[],
  updatedBy?: string
): Promise<IMeetingMinutesUpdate | null> => {
  const updated = await addmeeting.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    {
      $set: {
        duration,
        meetingminutes,
        meetingStatus,
        teacher,
        updatedBy,
        updatedDate: new Date(), // set server-side
      },
    },
    { new: true, projection: { meetingminutes: 1, teacher: 1, _id: 0 } } // return only relevant fields
  ).lean();

  return updated;
};
