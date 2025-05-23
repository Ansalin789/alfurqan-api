import { IMeeting, IMeetingCreate } from "../../types/models.types";

import Meeting from "../models/addmeeting";

import User from "../models/users";
import cron from "node-cron";

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

/**
 * Creates a new meeting.
 *
 * @param {IMeetingCreate} payload - The data for the new meeting.
 */


  

/**
 * Retrieves all meeting records with optional filters.
 */
export const getAllMeetingRecords = async (): Promise<{ totalCount: number; meetings: IMeeting[] }> => {
  try {
    const meetings = await Meeting.find().sort({ createdDate: -1 });
    const totalCount = await Meeting.countDocuments();

    return { totalCount, meetings };
  } catch (error) {
    throw new Error("Error fetching meetings: " + error);
  }
};




export const createMeeting = async (payload: IMeetingCreate): Promise<IMeeting | { error: any }> => {
    try {
        // Find the supervisor details from User model
        const supervisor = await User.findOne({
            userName: payload.createdBy,
            role: "SUPERVISOR",
        }).exec();

        console.log("Supervisor Details >>>>", supervisor);

        if (!supervisor) {
            return { error: "No supervisor found." };
        }

        // Convert selectedDate to a Date object
        const meetingDate = new Date(payload.selectedDate);
        const startTime = payload.startTime;
        const endTime = payload.endTime;

        // Check for existing meetings that overlap with the new meeting
        const conflictingMeeting = await Meeting.findOne({
            selectedDate: meetingDate, // Ensure date format matches
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } } // Overlapping time
            ]
        });

        if (conflictingMeeting) {
            return { error: "A meeting is already scheduled at this time. Please choose a different time slot." };
        }

        // Generate meeting name dynamically
        const meetingNames = `weeklymeeting-${supervisor._id}`;
        console.log("meetingNames>>>",meetingNames);
        // Create the meeting object with supervisor details
        let newMeeting = new Meeting({
            ...payload,
            supervisor: {
                supervisorId: supervisor._id.toString(),
                supervisorName: supervisor.userName,
                supervisorEmail: supervisor.email,
                supervisorRole: Array.isArray(supervisor.role) ? supervisor.role[0] : supervisor.role, // Ensure it's a string
            },
            meetingId: meetingNames,
        });

      

        // Ensure selectedDate is in the future
        if (newMeeting.selectedDate < new Date()) {
            return { error: "Meeting date cannot be in the past. Please select a future date." };
        }

        // Save the new meeting
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

    const startTime = "10:00 AM";
    const endTime = "10:30 AM";

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










//test the 

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
