import {TeacherMeetingCreate, TeacherMeeting, IAdminMeeting, IMeeting, ITeacher} from '../../types/models.types'
import teacherMeeting, { zodTeacherMeetingSchema } from '../models/teachermeeting';

import { Types } from 'mongoose';
import teachermeeting from '../models/teachermeeting';
import addmeeting from '../models/addmeeting';
import adminmeeting from '../models/adminmeeting';


export interface ITeacherMeetingUpdate{
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
  meetingminutes: string;
  teacher: ITeacher[];  // Fix this from `string` to `ITeacher[]`
}

  
export const createTeacherMeeting = async (
  payload: TeacherMeetingCreate
): Promise<TeacherMeeting | { error: any }> => {
  try {
    // Ensure teacher object is preserved
    const teacher = {
      teacherId: payload.teacher?.teacherId ?? "",
      teacherName: payload.teacher?.teacherName ?? "",
      teacherEmail: payload.teacher?.teacherEmail ?? ""
    };
    
    console.log("📌 Teacher Info:", teacher);
    

    // Ensure participants is an array of objects
    const participants = Array.isArray(payload.participants)
      ? payload.participants.map(p => ({
          studentId: p.studentId ?? "",
          studentName: p.studentName ?? "",
          studentEmail: p.studentEmail ?? ""
        }))
      : [];

    const selectedDate = new Date(payload.selectedDate);
    const { startTime, endTime } = payload;

    // Check for meeting conflict
    const conflictingMeeting = await teacherMeeting.findOne({
      selectedDate: selectedDate,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictingMeeting) {
      return {
        error: "A meeting is already scheduled at this time. Please choose a different time slot."
      };
    }

    if (selectedDate < new Date()) {
      return { error: "Meeting date cannot be in the past. Please select a future date." };
    }

    const meetingId = `participants-${teacher.teacherId || "unknown"}`;

    const newMeeting = new teacherMeeting({
      meetingId,
      meetingName: payload.meetingName,
      teacher,
      participants,
      selectedDate: selectedDate,
      startTime,
      endTime,
      description: payload.description,
      meetingStatus: payload.meetingStatus ?? "Scheduled",
      status: payload.status,
      createdDate: payload.createdDate ? new Date(payload.createdDate) : new Date(),
      createdBy: payload.createdBy ?? "system",
      updatedDate: payload.updatedDate ? new Date(payload.updatedDate) : new Date(),
      updatedBy: payload.updatedBy ?? "system"
    });

    const savedMeeting = await newMeeting.save();
    return savedMeeting;
  } catch (error) {
    console.error("Error creating meeting:", error);
    return { error };
  }
};



export const getallTeachermeeting = async (
  params: { teacherId: string }
): Promise<{
  totalCount: number;
  students: TeacherMeeting[];
  adminMeetings:IAdminMeeting [];
  studentMeetings: IMeeting[];
}> => {
  const { teacherId } = params;

  const query = {
    "teacher.teacherId": teacherId.trim(),
  };

  console.log("Query for all tables:", JSON.stringify(query, null, 2));

  const [teacherMeetings, teacherCount] = await Promise.all([
    teacherMeeting.find(query).sort({ createdDate: -1 }).exec(),
    teacherMeeting.countDocuments(query).exec(),
  ]);

  const [adminMeetings, studentMeetings] = await Promise.all([
    adminmeeting.find(query).sort({ createdDate: -1 }).exec(),
    addmeeting.find(query).sort({ createdDate: -1 }).exec(),
  ]);

  return {
    totalCount: teacherCount,
    students: teacherMeetings,
    adminMeetings,
    studentMeetings,
  };
};




export const getTeachermeetingById = async (
  id: string
): Promise<TeacherMeeting | null> => {
  return teacherMeeting.findOne({
    _id: id,
  }).lean();
  };


export const updateAllTeacherMeeting = async (
  id: string,
  payload: Partial<ITeacherMeetingUpdate>
): Promise<TeacherMeeting | null> => {
    console.log("🔄 DB Update attempt for ID:", id);
  console.log("📦 Payload to update:", payload);
  return teachermeeting.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    { $set: payload },
    { new: true }
  ).lean();
}

//updatemeetingAttendee

export const updateTeacherMeetingAtt = async (
  id: string,
  meetingStatus: string,
  teacher: ITeacher[],
  updatedBy?: string
): Promise<IMeetingMinutesUpdate | null> => {
  const updated = await addmeeting.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    {
      $set: {
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



