import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import { IMeeting } from "../../types/models.types";
import { appStatus, commonMessages } from "../config/messages";

const addMeetingSchema = new Schema<IMeeting>(
  {
    meetingName: { type: String, required: true },
    meetingId: { type: String, required: false },

    supervisor: {
      supervisorId: { type: String, required: false },
      supervisorName: { type: String, required: false },
      supervisorEmail: { type: String, required: false },
      supervisorRole: { type: String, required: false },
    },

    selectedDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    teacher: {
      type: [
        {
          teacherId: { type: String, required: false },
          teacherName: { type: String, required: false },
          teacherEmail: { type: String, required: false },
          attendee: { type: String, required: false },
        },
      ],
      required: false,
    },

    description: { type: String, required: true },
    meetingStatus: { type: String, required: true },
    meetingminutes: { type: String, required: true },
    duration: { type: String, required: false },
    status: {
      type: String,
      required: false,
      enum: [appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED],
    },

    createdDate: { type: Date, required: true },
    createdBy: { type: String, required: true },
    updatedDate: { type: Date, required: false },
    updatedBy: { type: String, required: false },
  },
  {
    collection: "addMeeting",
    timestamps: false,
  }
);

// ✅ Zod schema for creating a meeting
export const zodAddMeetingSchema = z.object({
  meetingName: z.string(),
  meetingId: z.string().optional(),
  duartion: z.string().optional(),
  supervisor: z
    .object({
      supervisorId: z.string().optional(),
      supervisorName: z.string().optional(),
      supervisorEmail: z.string().email().optional(),
      supervisorRole: z.string().optional(),
    })
    .optional(),

  selectedDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: commonMessages.INVALID_DATE_FORMAT,
    })
    .transform((val) => new Date(val)),

  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),

  teacher: z
    .array(
      z.object({
        teacherId: z.string(),
        teacherName: z.string(),
        teacherEmail: z.string().email(),
        attendee: z.string(),
      })
    )
    .optional(),

  description: z.string().min(5),
  meetingStatus: z.string(),
  meetingminutes: z.string(),

  status: z
    .enum([
      appStatus.ACTIVE,
      appStatus.IN_ACTIVE,
      appStatus.DELETED,
      "Scheduled",
    ])
    .optional(),

  createdDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: commonMessages.INVALID_DATE_FORMAT,
    })
    .transform((val) => new Date(val)),

  createdBy: z.string(),

  updatedDate: z
    .string()
    .optional()
    .refine((val) => (val ? !isNaN(Date.parse(val)) : true), {
      message: commonMessages.INVALID_DATE_FORMAT,
    })
    .transform((val) => (val ? new Date(val) : undefined)),

  updatedBy: z.string().optional(),
 filterValues: z
    .object({
      course: z
        .object({
          courseName: z.union([z.string(), z.array(z.string())]).optional(),
        })
        .optional(),
      meetingStatus: z.union([z.string(), z.array(z.string())]).optional(),
   
      startTime: z.union([z.string(), z.array(z.string())]).optional(),
      dateRange: z
        .object({
          from: z.string().refine(val => !isNaN(Date.parse(val))),
          to: z.string().refine(val => !isNaN(Date.parse(val)))
        })
        .optional(),
    })
    .optional(),
});

// ✅ Zod schema for updating a meeting (everything optional)
export const zodUpdateMeetingSchema = zodAddMeetingSchema.partial();

export default mongoose.model<IMeeting>("addMeeting", addMeetingSchema);
