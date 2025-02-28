import mongoose, { Schema } from "mongoose";

import { IClassSchedule } from "../../types/models.types";

import CustomEnumerator from "../shared/enum";
import { z } from "zod";
import { appStatus, attendeeStatus, commonMessages } from "../config/messages";

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
        }, 
        gender: {
          type: String,
          required: true,
      }
       
      },
      teacher: {
        teacherId: {
           type: String,
           required: false,
        },
        teacherName: {
            type: String,
            required: false,
        },
       
        teacherEmail: {
            type: String,
            required: false,
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
        required: false,
      },
      course:{
        courseId:{
          type: String,
          required: false,
        },
        courseName:{
          type: String,
          required: false,
        }
      
      },
      totalHourse:{
        type: Number,
        required: false,
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
      required: false,
    },
    classStatus:{
      type: String,
      required: false,
    },
    classType:{
      type: String,
      required: false,
    },
    classLink:{
      type: String,
      required: false,
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
    teacherAttendee: {
      type: String,
      required: false
    },
    studentAttendee: {
      type: String,
      required: false
    }
  },
  {
    collection: "classschedule",
    timestamps: false,
  }
);

export const zodClassScheduleSchema = z.object({
    student: z.object({
        studentId: z.string().optional(),
        studentFirstName: z.string(),
        studentLastName: z.string(),
        studentEmail: z.string(),
        gender: z.string(),
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
    preferedTeacher:z.string().optional(),
    course:z.string(),
    totalHourse: z.number().optional(),
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
    classStatus: z.string(),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
  createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  createdBy: z.string().optional(),
  lastUpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  lastUpdatedBy: z.string().optional(),
  studentAttendee: z.enum([attendeeStatus.PRESENT, attendeeStatus.ABSENT]),
  teacherAttendee: z.enum([attendeeStatus.PRESENT, attendeeStatus.ABSENT]),


})



export default mongoose.model<IClassSchedule>("Classschedule", classScheduleSchema);
