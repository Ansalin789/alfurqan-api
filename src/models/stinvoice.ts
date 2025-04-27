import { model, Schema } from "mongoose";
import {  z } from "zod";
import { IStudentInvoice } from "../../types/models.types";
import { appStatus, commonMessages } from "../config/messages";

// Mongoose Schema
const studentInvoiceSchema = new Schema<IStudentInvoice>(
  {
    student: {
      studentId: {
        type: String,
        required: true,
      },
      studentName: {
        type: String,
        required: true,
      },
      studentEmail: {
        type: String,
        required: true,
      },
      studentPhone: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },
    courseName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    invoiceStatus: {
      type: String,
      required: false,
      default: "Pending",
    },
    packageType:{
    type:String,
    required:false,
    },
    itemDescription:{
    type:String,
    required:false,
    },
    duration:{
    type:String,
    required:false,
    },
    rate:
    {
    type:String,
    required:false,
    },
    description:
    {
    type:String,
    required:false,
    },
    attachFile:{
    type:Buffer,
    required:false,
    }, 

    status: {
      type: String,
      required: true,
      enum: [appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED],
      default: appStatus.ACTIVE,
    },
    dueDate:{
    type: String,
    required:true,
    },
    createdDate: {
      type: String,
      required :true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    lastUpdatedDate: {
      type: String,
      required :false,
      default: Date.now,
    },
    lastUpdatedBy: {
      type: String,
      required: false,
    },
  },
  {
    collection: "stinvoice",
    timestamps: false,
  }
);

// Zod Validation Schema
export const zodAlStudentInvoiceSchema = z.object({
  student: z.object({
    studentId: z.string(),
    studentName: z.string(),
    studentEmail: z.string().email("Invalid email format"),
    studentPhone: z.string(),
    country: z.string(),
    city: z.string(),
  }),

  courseName: z.string(),
  amount: z.number(),
  packageType: z.string().optional(),
  itemDescription: z.string().optional(),
  duration: z.string().optional(),
  rate: z.string().optional(),
  description: z.string().optional(),
  attachFile:  z.union([z.instanceof(Buffer), z.string()]).optional(),

  invoiceStatus: z.string().optional().default("Pending"),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]).default(appStatus.ACTIVE),
  // Update for dates: Treat as strings and convert to Date
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)),

  createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),

  lastUpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  createdBy: z.string(),
  lastUpdatedBy: z.string().optional(),
});
export default model<IStudentInvoice>("stinvoice", studentInvoiceSchema);
