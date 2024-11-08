import { z } from "zod";
import { appRegexPatterns, commonMessages, userMessages, appStatus, meetingSchedulesMessages, tenantsMessages, notificationsMessages } from "../config/messages";

export const zodGetAllRecordsQuerySchema = z.object({
  tenantId: z.string().min(5),
  searchText: z.string().default(""),
  sortBy: z.string().default("lastUpdatedDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  offset: z.string().nullable().default(null),
  limit: z.string().nullable().default(null),

  jobId: z
    .string()
    .regex(appRegexPatterns.OBJECT_ID, commonMessages.INVALID_OBJECT_ID),
  referenceId: z
    .string(),
  candidateId: z.string(),
  filterValues: z.object({
    jobSector: z.array(z.string()).optional(),
    jobs: z
      .array(z.string())
      .refine(
        (arr) => arr.every((item) => appRegexPatterns.OBJECT_ID.test(item)),
        {
          message: meetingSchedulesMessages.INVALID_ID,
        }
      )
      .optional(),
    recruiter: z
      .array(z.string())
      .refine(
        (arr) => arr.every((item) => appRegexPatterns.OBJECT_ID.test(item)),
        {
          message: meetingSchedulesMessages.INVALID_ID,
        }
      )
      .optional(),
    status: z
      .array(
        z.enum([
          appStatus.ACTIVE,
          appStatus.IN_ACTIVE,
          appStatus.ARCHIVED,
          appStatus.NEW,
        ])
      )
      .default([
        appStatus.ACTIVE,
        appStatus.IN_ACTIVE,
        appStatus.ARCHIVED,
        appStatus.NEW,
      ]),
    users: z
      .array(z.string())
      .refine(
        (arr) => arr.every((item) => appRegexPatterns.OBJECT_ID.test(item)),
        {
          message: meetingSchedulesMessages.INVALID_ID,
        }
      )
      .optional(),
    meetingStatus: z
      .array(z.enum(meetingSchedulesMessages.MEETING_STATUS))
      .optional(),
    candidateResponse: z
      .array(z.enum(meetingSchedulesMessages.CANDIDATE_RESPONSE))
      .optional(),
    referenceTypes: z.array(z.enum(notificationsMessages.REFERENCE_TYPES)).optional(),
    isRead: z.boolean().optional(),
    notificationStatus: z.array(z.boolean()).optional()
  }),
  isPinned: z.boolean().default(false),
  scheduledStartDate: z
    .string()
    .refine((val) => meetingSchedulesMessages.DATE_FORMAT.test(val), {
      message: meetingSchedulesMessages.DATE_FORMAT_INVALID,
    })
    .optional(),
  scheduledEndDate: z
    .string()
    .refine((val) => meetingSchedulesMessages.DATE_FORMAT.test(val), {
      message: meetingSchedulesMessages.DATE_FORMAT_INVALID,
    }
    ).optional(),
  modules: z.array(z.enum(tenantsMessages.MODULE_TYPES)).optional(),
  keyNames: z.array(z.enum(tenantsMessages.KEYNAMES)).optional(),
  userId: z.string()
    .regex(appRegexPatterns.OBJECT_ID, commonMessages.INVALID_OBJECT_ID),
  startDate: z.string()
    .refine((val) => meetingSchedulesMessages.DATE_FORMAT.test(val), {
      message: meetingSchedulesMessages.DATE_FORMAT_INVALID,
    }).optional(),
  endDate: z.string()
    .refine((val) => meetingSchedulesMessages.DATE_FORMAT.test(val), {
      message: meetingSchedulesMessages.DATE_FORMAT_INVALID,
    }).optional(),
  jobTitles: z.array(z.string()).default([]),
  jobSectors: z.array(z.string()).default([]),
  clients: z.array(z.string()).default([]),
  interviewDetailId: z.string().regex(appRegexPatterns.OBJECT_ID, commonMessages.INVALID_OBJECT_ID).optional(),
});

export const zodAuthenticationSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});
