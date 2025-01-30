import mongoose, { Schema } from "mongoose";
import { IFeedbackCreate } from "../../types/models.types";
import { z } from "zod";
import { commonMessages } from "../config/messages";

const FeedbackSchema = new Schema<IFeedbackCreate>(
  {
    student: {
      studentId: { type: String, required: true },
      studentFirstName: { type: String, required: true },
      studentLastName: { type: String, required: true },
      studentEmail: { type: String, required: true },
    },
    teacher: {
      teacherId: { type: String, required: false },
      teacherName: { type: String, required: false },
      teacherEmail: { type: String, required: false },
    },
    classDay: [{ type: String, required: false }],
    preferedTeacher: { type: String, required: true },
    course: {
      courseId: { type: String, required: false },
      courseName: { type: String, required: false },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: [{ type: String, required: false }],
    endTime: [{ type: String, required: false }],
    feedbackmessage: { type: String, required: false },
    ratings: { type: Number, required: true, min: 0, max: 5 },
    createdDate: { type: Date, required: true, default: Date.now },
    createdBy: { type: String, required: true },
    lastUpdatedDate: { type: Date, required: true, default: Date.now },
    lastUpdatedBy: { type: String, required: false },
  },
  {
    collection: "feedback",
    timestamps: false,
  }
);

export const zodFeedbackSchema = z.object({
  student: z.object({
    studentId: z.string(),
    studentFirstName: z.string(),
    studentLastName: z.string(),
    studentEmail: z.string().email(),
  }),
  teacher: z.object({
    teacherId: z.string().optional(),
    teacherName: z.string().optional(),
    teacherEmail: z.string().optional()
  }),
  classDay: z.array(z.string()).optional(),
  preferedTeacher: z.string(),
  course: z.object({
    courseId: z.string().optional(),
    courseName: z.string(),
  }),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)),
  startTime: z.array(z.string()).optional(),
  endTime: z.array(z.string()).optional(),
  feedbackmessage: z.string().optional(),
  ratings: z.number().min(0).max(5),
  createdDate: z.string().optional() ,
  createdBy: z.string().optional(),
  lastUpdatedDate: z.string().optional() ,
  lastUpdatedBy: z.string().optional(),
});

export default mongoose.model<IFeedbackCreate>("Feedback", FeedbackSchema);

