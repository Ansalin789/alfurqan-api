import { model, Schema } from "mongoose";
import { z } from "zod";
import { IAlStudents, IStudentInvoice } from "../../types/models.types";
import { appStatus, commonMessages } from "../config/messages";


const studentInvoiceSchema = new Schema<IStudentInvoice>(
    {
student: {
    studentId: {
       type: String,
       required: false,
    },
    studentName:{
        type: String,
        required: false, 
    },
    studentEmail: {
        type: String,
        required: true,
    },
    studentPhone: {
        type: Number,
        required: true,
    }
},
courseName:{
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
},
status:{
    type: String,
    required: true,
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
    collection: "stinvoice",
    timestamps: false,
}
);
export const zodAlStudentInvoiceSchema = z.object({
    student: z.object({
      studentId: z.string().optional(),
      studentName: z.string(),
      studentEmail: z.string(),
      studentPhone: z.number(),
    }),
   courseName: z.string(),
   amount: z.number(),
   invoiceStatus: z.string(),
   status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
   createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)).optional(),
      createdBy: z.string(),
      lastUpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)).optional(),
      lastUpdatedBy: z.string(),
});
export default model<IStudentInvoice>("stinvoice", studentInvoiceSchema);