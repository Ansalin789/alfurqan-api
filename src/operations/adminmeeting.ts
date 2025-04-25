
import { PipelineStage, Types } from "mongoose";
import { IAdminMeeting, IAdminMeetingCreate } from "../../types/models.types";
import adminmeeting from "../models/adminmeeting";
import User from "../models/users";
import { v4 as uuidv4 } from 'uuid';  // Import the uuid package to generate unique IDs


export interface IAdminMeetingUpdate{
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
 * @param {IAdminMeetingCreate} payload - The data for the new meeting.
 */

export const admincreateMeeting = async (payload: IAdminMeetingCreate): Promise<IAdminMeeting[] | { error: any }> => {
  try {
    const admin = await User.findOne({
      userName: payload.createdBy,
      role: "ADMIN",
    }).exec();

    if (!admin) {
      return { error: "No Admin found." };
    }

    const createdMeetings: IAdminMeeting[] = [];

    // Generate a single meeting ID for the group of meetings
    function generateCustomMeetingId() {
      const digits = Math.floor(1000 + Math.random() * 9000); // 4 digits
      const letters = Array.from({ length: 3 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z
      ).join('');
      return `${digits}${letters}`;
    }

    const groupMeetingId = generateCustomMeetingId();  // Shared meeting ID for all teachers

    // Check date validity once
    const selectedDate = new Date(payload.selectedDate);
    if (selectedDate < new Date()) {
      return { error: "Meeting date cannot be in the past. Please select a future date." };
    }

    // Create a meeting for each teacher using the same groupMeetingId
    for (const teacher of payload.teacher) {
      if (!teacher.teacherId || !teacher.teacherName || !teacher.teacherEmail) {
        continue;
      }

      const newMeeting = new adminmeeting({
        meetingName: payload.meetingName,
        meetingId: groupMeetingId,  // Use same ID for all in this group
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

      const savedMeeting = await newMeeting.save();
      console.log(savedMeeting);
      createdMeetings.push(savedMeeting);
    }

    return createdMeetings;

  } catch (error) {
    console.error("Error creating meeting:", error);
    return { error };
  }
};





/**
 * Retrieves all meeting records grouped by meetingId, including teacher information.
 */
export const getAllAdminMeetingRecords = async (): Promise<{ totalCount: number; meetings: any[] }> => {
  try {
    const pipeline: PipelineStage[] = [
      {
        $sort: { createdDate: -1 }, // Sort by created date, descending
      },
      {
        $group: {
          _id: "$meetingId", // Group by meetingId
          meetingName: { $first: "$meetingName" }, // Take the first meeting name
          selectedDate: { $first: "$selectedDate" }, // Take the first selected date
          meetingStatus: { $first: "$meetingStatus" }, // Take the first meeting status
          description: { $first: "$description" }, // Take the first description
          startTime: {$first: "$startTime"},
          endTime: {$first: "$endTime"},
          status: { $first: "$status" }, // Take the first status
          createdDate: { $first: "$createdDate" }, // Take the first created date
          createdBy: { $first: "$createdBy" }, // Take the first created by value
          updatedDate: { $first: "$updatedDate" }, // Take the first updated date
          updatedBy: { $first: "$updatedBy" }, // Take the first updated by value
          teachers: { $push: "$teacher" }, // Collect teacher information into an array
        }
      },
      {
        $sort: { "_id": -1 } // Sort by meetingId (or use any field if you need a different order)
      }
    ];

    const meetingsData = await adminmeeting.aggregate(pipeline); // Run aggregation query
    const totalCount = await adminmeeting.countDocuments(); // Count total number of meetings

    return { totalCount, meetings: meetingsData };
  } catch (error) {
    console.error("Error fetching meetings: ", error);
    throw new Error("Error fetching meetings: ");
  }
};

//Get by ID

const addmeeting = adminmeeting;

export const getAdminMeetingById = async (  id: string): Promise<IAdminMeeting | null> => {
  return addmeeting.findOne({
    _id: new Types.ObjectId(id),
  }).lean();
};



//Update
export const updateAdminMeetingById = async (
  meetingId: string,
  payload: Partial<IAdminMeetingUpdate>
): Promise<IAdminMeeting | null> => {
  return addmeeting.updateMany(
    { meetingId },  // Match by meetingId
    { $set: payload },
    { new: true }
  ).lean();
};





