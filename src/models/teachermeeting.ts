import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import { TeacherMeeting } from "../../types/models.types";
import { teacherStatus, commonMessages } from "../config/messages";

const TeacherMeetingSchema = new Schema<TeacherMeeting>(
  {
    meetingId: { type: String, required: true },
    meetingName: { type: String, required: true },
    teacher: {
      teacherId: { type: String, required: false },
      teacherName: { type: String, required: false },
      teacherEmail: { type: String, required: false },
    },
    participants: {
      type: [
        {
          studentId: { type: String, required: false },
          studentName: { type: String, required: false },
          studentEmail: { type: String, required: false },
        }
      ],
      required: false,
    },
    
    meetingdate: { type: Date, required: true },
    fromTime: { type: String, required: true },
    toTime: { type: String, required: true },
    description: { type: String, required: true },
    meetingStatus: {
      type: String,
      required: true,
      enum: [teacherStatus.SCHEDULED, teacherStatus.RESCHEDULED],
    },
    status: {
      type: String,
      required: true,
      enum: [
        teacherStatus.ACTIVE,
        teacherStatus.IN_ACTIVE,
        teacherStatus.DELETED,
        teacherStatus.ARCHIVED,
        teacherStatus.NEW,
      ],
    },
    createdDate: { type: Date, required: true, default: Date.now },
    createdBy: { type: String, required: true },
    updatedDate: { type: Date, required: true, default: Date.now },
    updatedBy: { type: String, required: false },
  },
  {
    collection: "teacherMeeting",
    timestamps: false,
  }
);


export const zodTeacherMeetingSchema = z.object({
  meetingId: z.string().optional(),
  meetingName: z.string(),
  teacher: z.object({
    teacherId: z.string().optional(),
    teacherName: z.string().optional(),
    teacherEmail: z.string().optional(),
  }),
  participants: z
  .array(
    z.object({
      studentId: z.string().optional(),
      studentName: z.string().optional(),
      studentEmail: z.string().optional()
    })
  ).optional(),

  meetingdate: z.string(),
  fromTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  toTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  description: z.string(),
  meetingStatus: z.enum([teacherStatus.SCHEDULED, teacherStatus.RESCHEDULED]),
  status: z.enum([teacherStatus.ACTIVE, teacherStatus.IN_ACTIVE]),
  createdDate: z.string().optional(),
  createdBy: z.string().optional(),
  updatedDate: z.string().optional(),
  updatedBy: z.string().optional(),
  
});

export const zodUpdateMeetingSchema = zodTeacherMeetingSchema.partial();

export default mongoose.model<TeacherMeeting>('teacherMeeting', TeacherMeetingSchema);