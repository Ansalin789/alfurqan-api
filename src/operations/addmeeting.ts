import { IMeeting, IMeetingCreate } from "../../types/models.types";

import Meeting from "../models/addmeeting";
import User from "../models/users";
import cron from "node-cron";

import addmeeting from "../models/addmeeting";
import { Types } from "mongoose";


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
// export const createMeeting = async (payload: IMeetingCreate): Promise<IMeeting | { error: any }> => {
//     try {
//         // Find the supervisor details from User model
//         const supervisor = await User.findOne({
//             userName: payload.createdBy,
//             role: "SUPERVISOR",
//         }).exec();

//         console.log("Supervisor Details >>>>", supervisor);

//         // Convert selectedDate to a Date object
//         const meetingDate = new Date(payload.selectedDate);
//         const startTime = payload.startTime;
//         const endTime = payload.endTime;

//         // Check for existing meetings that overlap with the new meeting
//         const conflictingMeeting = await Meeting.findOne({
//             selectedDate: meetingDate, // Same date
//             $or: [
//                 { startTime: { $lt: endTime }, endTime: { $gt: startTime } } // Overlapping time
//             ]
//         });

//         if (conflictingMeeting) {
//             return { error: badRequest("A meeting is already scheduled at this time. Please choose a different time slot.") };
//         }

//         // Create a new meeting instance
//         const newMeeting = new Meeting({
//             ...payload,
//             supervisor: supervisor
//                 ? {
//                       supervisorId: supervisor._id.toString(),
//                       supervisorName: supervisor.userName,
//                       supervisorEmail: supervisor.email,
//                       supervisorRole: Array.isArray(supervisor.role) ? supervisor.role[0] : supervisor.role, // Ensure it's a string
//                   }
//                 : null, // If no supervisor found, keep it null
//         });

//         // Ensure selectedDate is in the future
//         if (newMeeting.selectedDate < new Date()) {
//             return { error: badRequest("Meeting date cannot be in the past. Please select a future date.") };
//         }

//         // Save the new meeting
//         const savedMeeting = await newMeeting.save();
//         return savedMeeting;
//     } catch (error) {
//         return { error };
//     }
// };

  

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
        let newMeeting = await new Meeting({
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

const autoScheduleMeeting = async () => {
    
    try {
        // Get the current date
        let currentDate = new Date();
        // currentDate.setHours(17, 47, 0, 0); // Set time to 17:47
      
        const existingMeeting = await Meeting.findOne({ selectedDate: { $eq: currentDate } });

        if (existingMeeting) {
            console.log(`✅ A meeting is already scheduled on ${currentDate.toDateString()}. No new meeting will be created.`);
            return;
        }

        console.log("✅ No meeting found on this date. Proceeding to schedule a new one...");

        // Meeting details
        const startTime = "10:00 AM";
        const endTime = "10:30 AM";

        // Select a random supervisor
        const supervisor = await User.findOne({ role: "SUPERVISOR" });

        if (!supervisor) {
            console.log(" No supervisor found. Cannot schedule a meeting.");
            return;
        }

        // Select all teachers
        const teachers = await User.find({ role: "TEACHER" }).exec();

        if (teachers.length === 0) {
            console.log(" No teachers found.");
            return;
        }

        const meetingNames = `weeklymeeting-${supervisor._id}`;
        // If today is Sunday, log an error and exit
        if (currentDate.getDay() === 0) {
            console.log(" Today is Sunday. No meetings available. Moving meeting to Monday.");
            
            // Assigning meeting to Monday (which is 1)
            currentDate.setDate(currentDate.getDate() + 1); // Move the date to Monday
            console.log(`➡️ Meeting rescheduled to Monday, ${currentDate.toDateString()}`);
        }
         else {
           
            for (const teacher of teachers) {
                console.log(" Scheduling meeting for teacher:", teacher.userName);

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

                // Save the new meeting
                await newMeeting.save();
                console.log(`✅ New meeting scheduled for ${teacher.userName} on ${currentDate.toDateString()} from ${startTime} to ${endTime}`);
            }
        }
    } catch (error) {
        console.error(" Error auto-scheduling meeting:", error);
    }
};

// Schedule the job to auto-schedule meetings every 15 days
cron.schedule("0 0 * * *", async () => {
    console.log(" Running the auto-scheduling job...");
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
