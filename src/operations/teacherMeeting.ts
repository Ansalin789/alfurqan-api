import {TeacherMeetingCreate, TeacherMeeting} from '../../types/models.types'
import teacherMeeting from '../models/teachermeeting';
import { alstudentsMessages,commonMessages } from '../config/messages';
import AppLogger from '../helpers/logging';
import {GetAllRecordsParams} from "../shared/enum";
import { isNil } from 'lodash';
import { Types } from 'mongoose';
import teachermeeting from '../models/teachermeeting';
const addmeeting = teachermeeting;
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
  params: GetAllRecordsParams
): Promise<{ totalCount: number; students: TeacherMeeting[] }> => {
  const { studentId, searchText, sortBy, sortOrder, offset, limit, filterValues } = params;

  const query: Record<string, unknown> = {};

  if (searchText) {
    query.$or = [
      { name: { $regex: searchText, $options: "i" } },
      { email: { $regex: searchText, $options: "i" } },
    ];
  }

  if (studentId) {
    query["student.studentId"] = Array.isArray(studentId) ? { $in: studentId } : studentId;
  }

  if (filterValues) {
    if (filterValues.course) {
      query.course = { $in: filterValues.course };
    }
    if (filterValues.country) {
      query.country = { $in: filterValues.country };
    }
    if (filterValues.teacher) {
      query.teacher = { $in: filterValues.teacher };
    }
    if (filterValues.status) {
      query.status = { $in: filterValues.status };
    }
  }

  console.log("Constructed Query:", JSON.stringify(query, null, 2));

  const sortOptions: Record<string, 1 | -1> = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

  const studentQuery = teacherMeeting.find(query).sort(sortOptions);

  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
      (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    studentQuery.skip(skip).limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }

  const [student, totalCount] = await Promise.all([
    studentQuery.exec(),
    teacherMeeting.countDocuments(query).exec(),
  ]);

  AppLogger.info(alstudentsMessages.GET_ALL_LIST_SUCCESS, {
    totalCount,
  });

  return { totalCount, students: student };
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
  return addmeeting.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    { $set: payload },
    { new: true }
  ).lean();
}
