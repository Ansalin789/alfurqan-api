import { z } from "zod";
import { model, Schema } from "mongoose";
import { IAssignmentCreate } from "../../types/models.types";
import { assigmentType, assignemntMessages } from "../config/messages";



const assignmentSchema = new Schema<IAssignmentCreate>(
    {
      assignmentName: {
        type: String,
        required: false,
      },
      assignedTeacher: {
        type: String,
        required: false,
      },
      assignmentType: {
        type: String,
        required: true,
    },
      
      chooseType: {
        type: Boolean,
        required: false,
      },
      trueorfalseType: {
        type: Boolean,
        required: false,
      },
      question: {
        type: String,
        required: false,
        trim: true,
      },
      hasOptions: {
        type: Boolean,
        required: false,
      },
      options: {
        optionOne: { type: String },
        optionTwo: { type: String },
        optionThree: { type: String },
        optionFour: { type: String },
      },
      audioFile: {
        type: Buffer,
        required: false,
        trim: true,
      },
      uploadFile: {
        type: Buffer,
        required: false,
      },
      status: {
        type: String,
        required: false,
        trim: true,
      },
      createdDate: {
        type: Date,
        required: false,
        
      },
      createdBy: {
        type: String,
        required: false,
        trim: true,
      },
      updatedDate: {
        type: Date,
        required: false,
      },
      updatedBy: {
        type: String,
        required: false,
        trim: true,
      },
      level: {
        type: String,
        required: false,
        trim: true,
      },
      courses: {
        type: String,
        required: false,
        trim: true,
      },
      assignedDate: {
        type: Date,
        required: false,
      },
      dueDate: {
        type: Date,
        required: false,
      },
    },
    {
      timestamps: false,
    }
  );
  
 

  export const assignmentValidationSchema = z.object({
    assignmentName: z.string(),
    assignedTeacher: z.string(),
    assignmentType: z.object({
      type: z.enum([
        assigmentType.QUIZ, 
        assigmentType.WRITING, 
        assigmentType.READING, 
        assigmentType.IMAGE_IDENTIFICATION, 
        assigmentType.WORD_MATCHING
      ]),
      name: z.string(),
    }),
    chooseType: z.string(),
    trueorfalseType: z.boolean(),
    question: z.string(),
    hasOptions: z.boolean().optional(),
    options: z.object({
      optionOne: z.string().optional(),
      optionTwo: z.string().optional(),
      optionThree: z.string().optional(),
      optionFour: z.string().optional(),
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
    ),    status: z.string(),
    createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: assignemntMessages.INVALID_DATE_FORMAT,
    }).transform((val) => new Date(val)),
    createdBy: z.string(),
    updatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: assignemntMessages.INVALID_DATE_FORMAT,
    }).transform((val) => new Date(val)),
    updatedBy: z.string(),
    level: z.string(),
    courses: z.string(),
    assignedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: assignemntMessages.INVALID_DATE_FORMAT,
    }).transform((val) => new Date(val)),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: assignemntMessages.INVALID_DATE_FORMAT,
    }).transform((val) => new Date(val)),
  });
  
  
  


export default model<IAssignmentCreate>("Assignment", assignmentSchema);