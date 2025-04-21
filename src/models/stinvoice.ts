import { model, Schema } from "mongoose";
import { z } from "zod";
import { IStudentInvoice } from "../../types/models.types";
import { appStatus, commonMessages } from "../config/messages";

// Mongoose Schema
const studentInvoiceSchema = new Schema<IStudentInvoice>(
  {
    student: {
      studentId: {
        type: String,
        required: false,
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
        type: Number,
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
    status: {
      type: String,
      required: true,
      enum: [appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED],
      default: appStatus.ACTIVE,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      required: true,
    },
    lastUpdatedDate: {
      type: Date,
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
    studentId: z.string().optional(),
    studentName: z.string(),
    studentEmail: z.string().email("Invalid email format"),
    studentPhone: z.number().min(1000000000, "Invalid phone number"),
    country: z.string(),
    city: z.string(),
  }),

  courseName: z.string(),
  amount: z.number(),

  invoiceStatus: z.string().optional().default("Pending"),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]).default(appStatus.ACTIVE),

  createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),

  createdBy: z.string(),

  lastUpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),

  lastUpdatedBy: z.string().optional(),
});

export default model<IStudentInvoice>("stinvoice", studentInvoiceSchema);
