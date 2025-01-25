import { z } from "zod";
import { model, Schema } from "mongoose";
import { IAssignmentCreate } from "../../types/models.types";
import { assigmentType, assignemntMessages } from "../config/messages";

const assignmentSchema = new Schema<IAssignmentCreate>(
    {
      assignmentName: {
        type: String,
        required: true,
      },
      assignedTeacher: {
        type: String,
        required: true,
      },
      assignmentType: {
        type: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
      
      chooseType: {
        type: Boolean,
        required: true,
      },
      trueorfalseType: {
        type: Boolean,
        required: false,
      },
      question: {
        type: String,
        required: true,
        trim: true,
      },
      hasOptions: {
        type: Boolean,
        required: true,
      },
      options: {
        type: {
          optionOne: { type: String, required: false },
          optionTwo: { type: String, required: false },
          optionThree: { type: String, required: false },
          optionFour: { type: String, required: false },
        },
        required: false,
      },
      audioFile: {
        type: String,
        required: false,
        trim: true,
      },
      uploadFile: {
        type: String,
        required: false,
      },
      status: {
        type: String,
        required: true,
        trim: true,
      },
      createdDate: {
        type: Date,
        required: true,
        
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
        required: true,
        trim: true,
      },
      courses: {
        type: String,
        required: true,
        trim: true,
      },
      assignedDate: {
        type: Date,
        required: true,
      },
      dueDate: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
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
    chooseType: z.boolean(),
    trueorfalseType: z.boolean(),
    question: z.string(),
    hasOptions: z.boolean(),
    options: z.object({
      optionOne: z.string().optional(),
      optionTwo: z.string().optional(),
      optionThree: z.string().optional(),
      optionFour: z.string().optional(),
    }),
    audioFile: z.string().nullable().optional(),
    uploadFile: z.string().nullable().optional(),
    status: z.string(),
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