import mongoose, { model, Schema } from "mongoose";
import { IMeeting } from "../../types/models.types";
import { z } from "zod";
import { appStatus, commonMessages } from "../config/messages";

const addMeetingSchema = new Schema<IMeeting>(
  {
    meetingName: {
      type: String,
      required: true,
    },
    meetingId: {
      type: String,
      required: false,
    },
    supervisor: {
      supervisorId: { type: String, required: false },
      supervisorName: { type: String, required: false },
      supervisorEmail: { type: String, required: false },
      supervisorRole: { type: String, required: false },
    },
    selectedDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    teacher: {
      type: [
        {
          teacherId: { type: String, required: false },
          teacherName: { type: String, required: false },
          teacherEmail: { type: String, required: false },
        },
      ],
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    meetingStatus: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: false,
      enum: [appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED],
    },
    createdDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedDate: {
      type: Date,
      required: false,
    },
    updatedBy: {
      type: String,
      required: false,
    },
  },
  {
    collection: "addMeeting",
    timestamps: false,
  }
);

// **Updated Zod Schema**
export const zodAddMeetingSchema = z.object({
  meetingName: z.string(),
  meetingId: z.string().optional(),

  supervisor: z
    .object({
      supervisorId: z.string().optional(),
      supervisorName: z.string().optional(),
      supervisorEmail: z.string().email().optional(),
      supervisorRole: z.string().optional(),
    })
    .optional(),

  selectedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)),

  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Start time must be in HH:MM (24-hour) format",
  }),

  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "End time must be in HH:MM (24-hour) format",
  }),

  teacher: z
    .array(
      z.object({
        teacherId: z.string(),
        teacherName: z.string(),
        teacherEmail: z.string().email(),
      })
    )
    .optional(),

  description: z.string().min(5, "Description must be at least 5 characters"),

  meetingStatus: z.string(),

  status: z.enum([
    appStatus.ACTIVE,
    appStatus.IN_ACTIVE,
    appStatus.DELETED,
    "Scheduled", // ✅ ADDED "Scheduled" to fix validation error
  ]).optional(),

  createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)),

  createdBy: z.string(),

  updatedDate: z.string().optional().refine((val) => val ? !isNaN(Date.parse(val)) : true, {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => val ? new Date(val) : undefined),

  updatedBy: z.string().optional(),
});


export default mongoose.model<IMeeting>("addMeeting", addMeetingSchema);
