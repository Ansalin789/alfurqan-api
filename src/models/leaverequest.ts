import  { model, Schema } from "mongoose";
import { ILeaveRequest } from "../../types/models.types";
import { z } from "zod";
import { appStatus, commonMessages, leaveStatus } from "../config/messages";

const leaverequestSchema = new Schema<ILeaveRequest>(
  {
    name: {  type: String, required: true },
    employeeId: {  type: String, required: true },
    role: {  type: String, required: true },
    fromDate: { type: Date, required: true, default: Date.now },
    toDate: { type: Date, required: true, default: Date.now },
    leaveStatus: { type: String, required: true },
    leaveType: { type: String, required: true },
    approvedId: {type: String, required: true},
    approvedName: {type: String, required: true},
    reason: {type: String, required: true},
    status: { type: String, required: false },
    createdDate: { type: Date, required: false, default: Date.now },
    createdBy: { type: String, required: false },
    updatedDate: { type: Date, required: false, default: Date.now },
    updatedBy: { type: String, required: false },
  },
  {
    collection: "leaverequest",
    timestamps: false,
  }
);

export const zodleaverequestSchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  role: z.string(),
  fromDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  toDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  leaveType: z.enum([leaveStatus.PAID, leaveStatus.CASUAL, leaveStatus.SICK]),
  leaveStatus: z.string(),
  approvedId: z.string(),
  approvedName: z.string(),
  reason: z.string(),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
  createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  createdBy: z.string(),
  UpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  UpdatedBy: z.string().optional(),


});
export default model<ILeaveRequest>("LeaveRequest", leaverequestSchema);
