import { model, Schema } from "mongoose";
import {  z } from "zod";
import { appStatus, commonMessages } from "../config/messages";
import { ISalarywages } from "../../types/models.types";

// Mongoose Schema
const salarywagesSchema = new Schema<ISalarywages>(
  {
    employeeId:{
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    designation:{
    type:String,
    required:false,
    },
    salaryAmount:{
    type:String,
    required:false,
    },
    paymentDate	:{
    type:String,
    required:false,
    },
    paymentStatus:
    {
    type:String,
    required:false,
    },
    status: {
      type: String,
      required: true,
      enum: [appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED],
      default: appStatus.ACTIVE,
    },
    createdDate: {
      type: String,
      required :true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedDate: {
      type: String,
      required :false,
    },
    updatedBy: {
      type: String,
      required: false,
    },
  },
  {
    collection: "salarywages",
    timestamps: false,
  }
);

// Zod Validation Schema
export const zodsalarywagesSchemaSchema = z.object({
 
    employeeID: z.string(),
    employeeName: z.string(),
    designation: z.string(),
    salaryAmount: z.number(),
    paymentDate :z.string(),
    paymentStatus :z.string(),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]).default(appStatus.ACTIVE),
  createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  lastUpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  createdBy: z.string(),
  lastUpdatedBy: z.string().optional(),
});
export default model<ISalarywages>("SalaryWages", salarywagesSchema);
