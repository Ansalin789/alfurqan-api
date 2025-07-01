import { z } from "zod";
import { model, Schema } from "mongoose";
import { IAssignment } from "../../types/models.types";
import { assigmentType, assignemntMessages } from "../config/messages";
// Define subdocument schema for assignmentType
const assignmentTypeSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        assigmentType.QUIZ,
        assigmentType.WRITING,
        assigmentType.READING,
        assigmentType.IMAGE_IDENTIFICATION,
        assigmentType.WORD_MATCHING,
      ],
      required: true,
    },
    name: { type: String, required: false },
  },
  { _id: false }
);

const assignmentSchema = new Schema<IAssignment>(
  {
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    sessionClassType: { type: String, required: false },
    assignmentName: { type: String, required: true },
    questionName: { type: String, required: true },
    questionType: { type: String, required: true },
    typeofQuestion: { type: String, required: true },
    title: { type: String, required: true },
    assignedTeacher: { type: String, required: true },
    assignedTeacherId: { type: String, required: true },
    assignmentType: {
      type: assignmentTypeSchema,
      required: true,
    },
    chooseType: { type: Boolean, required: true },
    trueorfalseType: { type: Boolean, required: true },
    question: { type: String, required: true, trim: true },
    hasOptions: { type: Boolean, required: true },
    options: {
      optionOne: { type: String, required: true },
      optionTwo: { type: String, required: true },
      optionThree: { type: String, required: true },
      optionFour: { type: String, required: true },
    },
    audioFile: { type: Buffer, required: false },
    uploadFile: { type: Buffer, required: false },
    status: { type: String, required: true, trim: true },
    createdDate: { type: Date, required: true },
    createdBy: { type: String, required: true, trim: true },
    updatedDate: { type: Date, required: true },
    updatedBy: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    courses: { type: String, required: true, trim: true },
    assignedDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    answer: { type: String, required: true },
    answerValidation: { type: String, required: true },
    assignmentStatus: { type: String, required: true },
  },
  { timestamps: false }
);

export const assignmentValidationSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  sessionClassType: z.string().optional(),
  title: z.string(),
  assignmentName: z.string(),
  questionName: z.string(),
  questionType: z.string(),
  typeofQuestion: z.string(),
  assignedTeacher: z.string(),
  assignedTeacherId: z.string(),

  assignmentType: z.object({
    type: z.enum([
      assigmentType.QUIZ,
      assigmentType.WRITING,
      assigmentType.READING,
      assigmentType.IMAGE_IDENTIFICATION,
      assigmentType.WORD_MATCHING,
    ]),
    name: z.string(), // optional in schema
  }),

  chooseType: z.boolean(),
  trueorfalseType: z.boolean(),
  question: z.string(),
  hasOptions: z.boolean(),

  options: z.object({
    optionOne: z.string(),
    optionTwo: z.string(),
    optionThree: z.string(),
    optionFour: z.string(),
  }),

  audioFile: z
    .union([z.string().nullable(), z.instanceof(Buffer)])
    .optional()
    .refine(
      (val) => val === null || typeof val === "string" || Buffer.isBuffer(val),
      {
        message: "audioFile must be a Buffer, a base64 string, or null",
      }
    ),

  uploadFile: z
    .union([z.string().nullable(), z.instanceof(Buffer)])
    .optional()
    .refine(
      (val) => val === null || typeof val === "string" || Buffer.isBuffer(val),
      {
        message: "uploadFile must be a Buffer, a base64 string, or null",
      }
    ),

  status: z.string(),

  createdDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: assignemntMessages.INVALID_DATE_FORMAT,
    })
    .transform((val) => new Date(val)),

  createdBy: z.string(),

  updatedDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: assignemntMessages.INVALID_DATE_FORMAT,
    })
    .transform((val) => new Date(val)),

  updatedBy: z.string(),

  level: z.string(),
  courses: z.string(),

  assignedDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: assignemntMessages.INVALID_DATE_FORMAT,
    })
    .transform((val) => new Date(val)),

  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: assignemntMessages.INVALID_DATE_FORMAT,
    })
    .transform((val) => new Date(val)),

  answer: z.string(),
  answerValidation: z.string(),
  assignmentStatus: z.string(),
});
export default model<IAssignment>("Assignment", assignmentSchema);
