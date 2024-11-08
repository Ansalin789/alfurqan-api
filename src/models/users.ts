import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IUser } from "../../types/models.types";

import CustomEnumerator from "../shared/enum";
import { z } from "zod";
import { appStatus, commonMessages } from "../config/messages";

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      match: /\S+@\S+\.\S+/,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    role: {
      type: [String],
      required: true
    },
    profileImage: {
      type: String,
      default: null
    },
    lastLoginDate: {
      type: Date,
      default: Date.now
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
      required: true
    },
  },
  {
    collection: "tenantUsers",
    timestamps: false,
  }
);

export const zodUserSchema = z.object({
  userName: z.string().min(3),
  email: z.string().email(),
  password: z
    .string()
    .min(8),
  role: z.array(z.string()).min(1),
  profileImage: z.string().nullable(),
  lastLoginDate: z.string().nullable(),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
  createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  createdBy: z.string(),
  lastUpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: commonMessages.INVALID_DATE_FORMAT,
  }).transform((val) => new Date(val)).optional(),
  lastUpdatedBy: z.string(),
})

export default mongoose.model<IUser>("TenantUsers", userSchema);
