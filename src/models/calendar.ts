import mongoose, { Schema } from "mongoose";
import { IMeetingSchedule } from "../../types/models.types";
import CustomEnumerator from "../shared/enum";
import { z } from "zod";
import { appStatus } from "../config/messages";


const meetingScheduleSchema = new Schema<IMeetingSchedule>(
  {
    academicCoach: {
    academicCoachId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    teacher: {
      teacherId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      }
    },
    student: {
      studentId: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      }
    },
    subject: {
      type: String,
      required: true,
    },
    meetingLocation: {
      type: String,
      required: false,
    },
    class: {
      classId: {
        type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    classType: {
      type: String,
      required: false,
    },
    },
    meetingType: {
      type: String,
      required: false,
    },
    meetingLink: {
      type: String,
      required: false,
    },
    isScheduledMeeting: {
      type: Boolean,
      required: false,
    },
    scheduledStartDate: {
      type: Date,
      required: false,
    },
    scheduledEndDate: {
      type: Date,
      required: false,
    },
    scheduledFrom: {
      type: String,
      required: false,
    },
    scheduledTo: {
      type: String,
      required: false,
    },
    timeZone: {
      type: String,
      required: false,
    },
    remainderInMinutes: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    meetingStatus: {
      type: String,
      required: false,
    },
    candidateResponse: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    createdDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    createdBy: {
      type: String,
      required: true,
    },
    lastUpdatedDate: {
      type: Date,
      required: false,
      default: Date.now(),
    },
    lastUpdatedBy: {
      type: String,
      required: false,
    },
  },
  {
    collection: "meetingSchedules",
    timestamps: false,
  }
);


export const scheduleSchema = z.object({
  tenantId: z.string(),
  organizer: z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string().email()
  }),
  candidates: z.array(
    z.object({
      id: z.string(),
      candidateId: z.number(),
      candidateName: z.string(),
      jobProfilingCandidateDataId: z.string().optional(),
      email: z.string()
    })
  ).nonempty(),
  users: z.array(
    z.object({
      userId: z.string().optional(),
      userName: z.string().optional(),
      email: z.string().email().optional()
    })
  ).optional(),
  subject: z.string(),
  jobId: z.string(),
  jobName: z.string(),
  meetingLocation: z.string().optional(),
  interviewRoundType: z.string().optional(),
  isAssessment: z.boolean().default(false),
  assessmentType: z.string().optional(),
  assessmentTenantSettingId: z.string().optional(),
  assessmentLink: z.string().optional(),
  isInterviewScheduled: z.boolean().default(false),
  isAiVideoEnabled: z.boolean().default(false),
  keyFocusedArea: z.array(z.string()).default([]),
  additionalDetails: z.string().optional(),
  isScheduledMeeting: z.boolean(),
  tenantSettingId: z.string().optional(),
  externalSourceType: z.string().optional(),
  externalMeetingReferenceId: z.string().optional(),
  meetingStatus: z.string().optional(),
  candidateResponse: z.string().optional(),
  scheduledStartDate: z.string().transform((val) => new Date(val)).optional(),
  scheduledEndDate: z.string().transform((val) => new Date(val)).optional(),
  scheduledFrom: z.string().optional(),
  scheduledTo: z.string().optional(),
  timeZone: z.string().optional(),
  remainderInMinutes: z.number().optional(),
  description: z.string().optional(),
  meetingLink: z.string().optional().nullable(),
  createdBy: z.string(),
  lastUpdatedBy: z.string().optional(),
  referenceId: z.string(),
  referenceType: z.string(),
  remarks: z.string(),
  status: z.string(z.enum([
    appStatus.ACTIVE,
    appStatus.IN_ACTIVE,
  ])).default(appStatus.ACTIVE),
});

export default mongoose.model<IMeetingSchedule>(
  "MeetingSchedules",
  meetingScheduleSchema
);


