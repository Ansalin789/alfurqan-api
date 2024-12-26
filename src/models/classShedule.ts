import mongoose, { Schema } from "mongoose";

import { IClassSchedule } from "../../types/models.types";

import CustomEnumerator from "../shared/enum";
import { z } from "zod";
import { appStatus, commonMessages } from "../config/messages";

const classScheduleSchema = new Schema<IClassSchedule>(
  {
    student: {
        studentId: {
           type: String,
           required: true,
        },
        studentFirstName: {
            type: String,
            required: true,
        },
        studentLastName: {
            type: String,
            required: true,
        },
        studentEmail: {
            type: String,
            required: true,
        }
       
      },
      teacher: {
        teacherId: {
           type: String,
           required: true,
        },
        teacherName: {
            type: String,
            required: true,
        },
       
        teacherEmail: {
            type: String,
            required: true,
        }
       
      },
      classDay:{
        type: Array,
        required: false,
      },
      package: {
        type: String,
        required: true,
      },
      preferedTeacher:{
        type: String,
        required: true,
      },
      course:{
        courseId:{
          type: String,
          required: true,
        },
        courseName:{
          type: String,
          required: true,
        }
      
      },
      totalHourse:{
        type: Number,
        required: true,
      },
      startDate:{
        type: Date,
        required: true,
      },
      endDate:{
        type: Date,
        required: true,
      },
      startTime:{
        type: Array,
        required: false,
      },
      endTime:{
        type: Array,
        required: false,
      },
      scheduleStatus:{
        type: String,
        required: true,
      },
    scheduledStartDate: {
      type: Date,
      required: true,
    },
    classType:{
      type: String,
      required: true,
    },
    classLink:{
      type: String,
      required: true,
    },
    isScheduledMeeting:{
      type: Boolean,
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
    studentResponse: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(CustomEnumerator.Status),
      required: true
    },
    createdDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    createdBy: {
      type: String,
      required: true
    },
    lastUpdatedDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    lastUpdatedBy: {
      type: String,
      required: false
    },
  },
  {
    collection: "classschedule",
    timestamps: false,
  }
);

export const zodClassScheduleSchema = z.object({
    student: z.object({
        studentFirstName: z.string(),
        studentLastName: z.string(),
        studentEmail: z.string(),
    }),
    teacher: z.object({
        teacherName: z.string(),
        teacherEmail: z.string(),
    }),
    classDay:z.array(
        z.object({
            label: z.string(),
            value: z.string(),
        })
    ),
    package:z.string(),
    preferedTeacher:z.string(),
    course:z.string(),
    totalHourse: z.number(),
    startDate:z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)),
    endDate:z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)),
    startTime:z.array(
      z.object({
          label: z.string(),
          value: z.string(),
      })
  ),
    endTime:z.array(
      z.object({
          label: z.string(),
          value: z.string(),
      })
  ),
    scheduleStatus: z.string(),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
  createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  createdBy: z.string().optional(),
  lastUpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  lastUpdatedBy: z.string().optional(),
})



export default mongoose.model<IClassSchedule>("Classschedule", classScheduleSchema);
