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




///auto schedule cron job



const autoScheduleMeeting = async () => {
    try {
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth() + 1; // Months are zero-based
        let currentYear = currentDate.getFullYear();
        let currentDay = currentDate.getDate();
        let totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

        let firstHalfDays, secondHalfDays;
        if (currentMonth === 2) {
            firstHalfDays = Array.from({ length: 14 }, (_, i) => i + 1);
            secondHalfDays = Array.from({ length: totalDaysInMonth - 14 }, (_, i) => i + 15);
        } else {
            firstHalfDays = Array.from({ length: 15 }, (_, i) => i + 1);
            secondHalfDays = Array.from({ length: totalDaysInMonth - 15 }, (_, i) => i + 16);
        }

        let firstMeetingDay = firstHalfDays[firstHalfDays.length - 1];
        let secondMeetingDay = secondHalfDays[secondHalfDays.length - 1];

        // Format dates as DD-MM-YYYY
        let firstMeetingDate = `${String(firstMeetingDay).padStart(2, '0')}-${String(currentMonth).padStart(2, '0')}-${currentYear}`;
        let secondMeetingDate = `${String(secondMeetingDay).padStart(2, '0')}-${String(currentMonth).padStart(2, '0')}-${currentYear}`;

    
        
        console.log("currentDate:", currentDate);
        console.log("Current Month:", currentMonth);
        console.log("Current Day:", currentDay);
        console.log("Total Days in Month:", totalDaysInMonth);
        console.log("First Half Days:", firstHalfDays);
        console.log("Second Half Days:", secondHalfDays);
        console.log("First Meeting Date:", firstMeetingDate);
        console.log("Second Meeting Date:", secondMeetingDate);

        // Adjust if meeting day is a Sunday
        if (new Date(currentYear, currentMonth - 1, firstMeetingDay).getDay() === 0) {
            firstMeetingDay -= 1;
        }
        if (new Date(currentYear, currentMonth - 1, secondMeetingDay).getDay() === 0) {
            secondMeetingDay -= 1;
        }

        let meetingDays = [firstMeetingDay, secondMeetingDay];

        if (!meetingDays.includes(currentDay)) {
            console.log("✅ Today is not a scheduled meeting day. No meetings will be created.");
            return;
        }

        const existingMeeting = await Meeting.findOne({ selectedDate: currentDate });

        if (existingMeeting) {
            console.log(`✅ A meeting is already scheduled on ${currentDate.toDateString()}. No new meeting will be created.`);
            return;
        }

        console.log("✅ No meeting found on this date. Proceeding to schedule a new one...");

        const startTime = "10:00 AM";
        const endTime = "10:30 AM";

        const supervisor = await User.findOne({ role: "SUPERVISOR" });

        if (!supervisor) {
            console.log("No supervisor found. Cannot schedule a meeting.");
            return;
        }

        //const teachers = await User.find({ lastLoginDate: currentDate, role: "TEACHER" }).exec();

       //currentDate = 2025-02-25T09:13:00Z
       //lastLoginDate = 2025-02-25T07:11:38.665+00:00


       const currentDatee = new Date().toISOString().split('T')[0]; // Extracts only YYYY-MM-DD

const teachers = await User.find({
  lastLoginDate: {
    $gte: new Date(currentDatee), // Start of the day (00:00:00)
    $lt: new Date(new Date(currentDatee).setDate(new Date(currentDatee).getDate() + 1)) // Start of the next day
  },
  role: "TEACHER"
}).exec();

console.log(teachers);

        if (teachers.length === 0) {
            console.log("No teachers found.");
            return;
        }

        const meetingNames = `weeklymeeting-${supervisor._id}`;

        for (const teacher of teachers) {
            console.log("Scheduling meeting for teacher:", teacher.userName);

            const newMeeting = new Meeting({
                meetingId: meetingNames,
                meetingName: "Auto-Scheduled Meeting",
                description: "This is an automatically scheduled meeting.",
                createdDate: new Date(),
                selectedDate: currentDate,
                startTime: startTime,
                endTime: endTime,
                createdBy: supervisor.userName,
                teacher: {
                    teacherId: teacher._id.toString(),
                    teacherName: teacher.userName,
                    teacherEmail: teacher.email,
                },
                supervisor: {
                    supervisorId: supervisor._id.toString(),
                    supervisorName: supervisor.userName,
                    supervisorEmail: supervisor.email,
                    supervisorRole: Array.isArray(supervisor.role) ? supervisor.role[0] : supervisor.role,
                },
                meetingStatus: "Scheduled",
            });

            await newMeeting.save();
            console.log(`✅ New meeting scheduled for ${teacher.userName} on ${currentDate.toDateString()} from ${startTime} to ${endTime}`);
        }
    } catch (error) {
        console.error("Error auto-scheduling meeting:", error);
    }
};

// Schedule the job to auto-schedule meetings every minute
cron.schedule("55 23 * * *", async () => {
    console.log("Running the auto-scheduling job at 23:55 PM...");
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
