import { z } from "zod";
import { model, Schema } from "mongoose";
import { IAssignment } from "../../types/models.types";
import { assigmentType, assignemntMessages } from "../config/messages";
import { AssignmentStatus, Status } from "../shared/enum";
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
    assignedTeacher: { type: String, required: false },
    assignedTeacherId: { type: String, required: false },
    assignmentId: { type: String, required: false },

    assignmentType: {
      type: assignmentTypeSchema,
      required: true,
    },
    chooseType: { type: Boolean, required: false },
    trueorfalseType: { type: Boolean, required: false },
    question: { type: String, required: true, trim: true },
    hasOptions: { type: Boolean, required: false },
    options: {
      optionOne: { type: String, required: false },
      optionTwo: { type: String, required: false },
      optionThree: { type: String, required: false },
      optionFour: { type: String, required: false },
    },
    audioFile: { type: Buffer, required: false },
    uploadFile: { type: Buffer, required: false },
    status: { type: String, required: true, trim: true },
    createdDate: { type: Date, required: true },
    createdBy: { type: String, required: true, trim: true },
    updatedDate: { type: Date, required: true },
    updatedBy: { type: String, required: true, trim: true },
    level: { type: String, required: false, trim: true },
    courses: { type: String, required: false, trim: true },
    assignedDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    answer: { type: String, required: false },
    answerValidation: { type: String, required: true },
    assignmentStatus: { type: String, required: true },
    commends: { type: String, required: false },
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
  assignedTeacher: z.string().optional(),
  assignedTeacherId: z.string().optional(),
  assignmentId: z.string().optional(),

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

  chooseType: z.boolean().optional(),
  trueorfalseType: z.boolean().optional(),
  question: z.string(),
  hasOptions: z.boolean().optional(),

  options: z.object({
    optionOne: z.string().optional(),
    optionTwo: z.string().optional(),
    optionThree: z.string().optional(),
    optionFour: z.string().optional(),
  }).optional(),

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

  status: z.enum([Status.ACTIVE, Status.IN_ACTIVE, Status.DELETED]),
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

  level: z.string().optional(),
  courses: z.string().optional(),

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

  answer: z.string().optional(),
  answerValidation: z.string(),
  assignmentStatus: z.enum([
    AssignmentStatus.ASSIGNED,
    AssignmentStatus.PENDING,
    AssignmentStatus.COMPLETED,
    AssignmentStatus.NOTASSIGNED,
    AssignmentStatus.NOTCOMPLETED,
  ]),
  commends: z.string().optional(),
});
export default model<IAssignment>("Assignment", assignmentSchema);
