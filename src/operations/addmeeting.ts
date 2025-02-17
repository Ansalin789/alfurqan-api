import { IMeeting, IMeetingCreate } from "../../types/models.types";
import { badRequest } from "@hapi/boom";
import Meeting from "../models/addmeeting";
import User from "../models/users";

/**
 * Creates a new meeting.
 *
 * @param {IMeetingCreate} payload - The data for the new meeting.
 */
export const createMeeting = async (payload: IMeetingCreate): Promise<IMeeting | { error: any }> => {
    try {
        // Find the supervisor details from User model
        const supervisor = await User.findOne({
            userName: payload.createdBy,
            role: "SUPERVISOR",
        }).exec();

        console.log("Supervisor Details >>>>", supervisor);

        // Convert selectedDate to a Date object
        const meetingDate = new Date(payload.selectedDate);
        const startTime = payload.startTime;
        const endTime = payload.endTime;

        // Check for existing meetings that overlap with the new meeting
        const conflictingMeeting = await Meeting.findOne({
            selectedDate: meetingDate, // Same date
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } } // Overlapping time
            ]
        });

        if (conflictingMeeting) {
            return { error: badRequest("A meeting is already scheduled at this time. Please choose a different time slot.") };
        }

        // Create a new meeting instance
        const newMeeting = new Meeting({
            ...payload,
            supervisor: supervisor
                ? {
                      supervisorId: supervisor._id.toString(),
                      supervisorName: supervisor.userName,
                      supervisorEmail: supervisor.email,
                      supervisorRole: Array.isArray(supervisor.role) ? supervisor.role[0] : supervisor.role, // Ensure it's a string
                  }
                : null, // If no supervisor found, keep it null
        });

        // Ensure selectedDate is in the future
        if (newMeeting.selectedDate < new Date()) {
            return { error: badRequest("Meeting date cannot be in the past. Please select a future date.") };
        }

        // Save the new meeting
        const savedMeeting = await newMeeting.save();
        return savedMeeting;
    } catch (error) {
        return { error };
    }
};

  

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
