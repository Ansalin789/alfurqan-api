import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IStudents } from "../../types/models.types";

import CustomEnumerator from "../shared/enum";
import { z } from "zod";
import { appStatus,appRegexPatterns, commonMessages, evaluationStatus, learningInterest, numberOfStudents,preferredTeacher, referenceSource } from "../config/messages";

const studentSchema = new Schema<IStudents>(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
    
    },
    academicCoach: {
      academicCoachId: {
          type: String,
          required: true,
      },
      name: {
          type: String,
          required: true,
      },
      role: {
        type: String,
        required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
    email: {
      type: String,
      required: true,
      match: /\S+@\S+\.\S+/,
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
      minlength: 10
    },
    country: {
      type: String,
      required: true
    },
    countryCode: {
      type: String,
      required: true
    },
    learningInterest: {
      type: String,
      enum: Object.values(CustomEnumerator.LearningInterest),
      required: true
    },
    numberOfStudents: {
      type: Number,
      required: true,
      minlength: 1
    },
    preferredTeacher:{
      type: String,
      enum: Object.values(CustomEnumerator.PreferredTeacher),
      required: true
    },
    preferredFromTime:{
      type: String,
      required: true
    },
    preferredToTime:{
      type: String,
      required: true
    },
    timeZone:{
      type: String,
      required: false
    },
    referralSource:{
      type: String,
      enum: Object.values(CustomEnumerator.ReferralSource),
      required: true
    },
    startDate:{
      type: Date,
      default: () => new Date()
    },
    evaluationStatus:{
      type: String,
      enum: Object.values(CustomEnumerator.EvaluationStatus),
      required: true
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
    collection: "students",
    timestamps: false,
  }
);

export const zodStudentSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.number().min(10),
  country: z.string().min(3),
  countryCode: z.string().min(1),
  learningInterest: z.enum([learningInterest.QURAN, learningInterest.ISLAMIC, learningInterest.ARABIC]),
  numberOfStudents: z.number().min(1),
  preferredTeacher: z.enum([preferredTeacher.TEACHER_1, preferredTeacher.TEACHER_2, preferredTeacher.TEACHER_3]),
  preferredFromTime: z.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, "Time must be in format HH:MM AM/PM"),
  preferredToTime: z.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, "Time must be in format HH:MM AM/PM"),
  timeZone: z.string().min(1),
  referralSource: z.enum([referenceSource.FRIEND, referenceSource.SOCIALMEDIA, referenceSource.EMAIL, referenceSource.GOOGLE, referenceSource.OTHER]),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  evaluationStatus: z.enum([evaluationStatus.PENDING, evaluationStatus.INPROGRESS, evaluationStatus.COMPLETED]),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
  createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  createdBy: z.string(),
  lastUpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  lastUpdatedBy: z.string(),
  searchText: z.string().default(""),
  offset: z.number().optional(),
  limit: z.number().optional(),
  filterValues : z.object({
    // Filter for courses: Array of course names or IDs, optional
    course: z.string()
      .optional(),
    // Filter for countries: Array of country codes or names, optional
    country: z.string()
      .optional(),
    // Filter for teachers: Array of Object IDs, optional, validated with regex
    teacher: z.string()
    .optional(),
    // Filter for status: Array of enums, optional, with default values
    status: z.string()
    .optional()
  })
})



export default mongoose.model<IStudents>("Students", studentSchema);
