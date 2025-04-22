
import { Types } from "mongoose";
import { IAdminMeeting, IAdminMeetingCreate } from "../../types/models.types";
import adminmeeting from "../models/adminmeeting";
import User from "../models/users";
import { v4 as uuidv4 } from 'uuid';  // Import the uuid package to generate unique IDs


/**
 * Creates a new meeting.
 *
 * @param {IAdminMeetingCreate} payload - The data for the new meeting.
 */

export const admincreateMeeting = async (payload: IAdminMeetingCreate): Promise<IAdminMeeting[] | { error: any }> => {
    try {
      // Find the admin user who is creating the meeting
      const admin = await User.findOne({
        userName: payload.createdBy,
        role: "ADMIN",
      }).exec();
  
      if (!admin) {
        return { error: "No Admin found." };
      }
  
      const createdMeetings: IAdminMeeting[] = [];
  
      // Loop through each teacher and create a separate meeting record
      for (const teacher of payload.teacher) {
        // Validate required teacher fields
        if (!teacher.teacherId || !teacher.teacherName || !teacher.teacherEmail) {
          continue;  // Skip creating the meeting if teacher details are incomplete
        }
  
        // Check if selectedDate is in the past
        const selectedDate = new Date(payload.selectedDate);
        if (selectedDate < new Date()) {
          return { error: "Meeting date cannot be in the past. Please select a future date." };
        }
  
        // Generate a unique meetingId using UUID
        const meetingId = uuidv4();  // Generate a unique meeting ID
  
        // Create a new meeting for each teacher
        const newMeeting = new adminmeeting({
          meetingName: payload.meetingName,
          meetingId: meetingId,  // Use the generated unique meetingId
          admin: {
            adminId: admin._id.toString(),
            adminName: admin.userName,
            adminEmail: admin.email,
            adminRole: Array.isArray(admin.role) ? admin.role[0] : admin.role,
          },
          selectedDate: selectedDate,
          startTime: payload.startTime,
          endTime: payload.endTime,
          teacher: {
            teacherId: teacher.teacherId,
            teacherName: teacher.teacherName,
            teacherEmail: teacher.teacherEmail,
          },
          description: payload.description,
          status: payload.status,
          meetingStatus: payload.meetingStatus ?? "Scheduled",
          createdDate: payload.createdDate || new Date(),
          createdBy: payload.createdBy,
          updatedDate: payload.updatedDate || new Date(),
          updatedBy: payload.updatedBy ?? "",
        });
  
        // Save the new meeting to the database
        const savedMeeting = await newMeeting.save();
        createdMeetings.push(savedMeeting);  // Add saved meeting to the response array
      }
  
      return createdMeetings;  // Return the array of saved meetings
  
    } catch (error) {
      console.error("Error creating meeting:", error);
      return { error };  // Return error if something goes wrong
    }
  };
  
  
/**
 * Retrieves all meeting records with optional filters.
 */
export const getAllAdminMeetingRecords = async (): Promise<{ totalCount: number; meetings: IAdminMeeting[] }> => {
  try {
    const meetings = await adminmeeting.find().sort({ createdDate: -1 });
    const totalCount = await adminmeeting.countDocuments();

    return { totalCount, meetings };
  } catch (error) {
    throw new Error("Error fetching meetings: " + error);
  }
};

//Get by ID

const addmeeting = adminmeeting;

export const getAdminMeetingById = async (  id: string): Promise<IAdminMeeting | null> => {
  return addmeeting.findOne({
    _id: new Types.ObjectId(id),
  }).lean();
};


