import mongoose, { Schema } from "mongoose";
import { GroupMessage } from "../../types/models.types";
import { appStatus, notificationStatus, uploadedFormat } from "../config/messages";
import { z } from "zod";

const groupMessageSchema = new Schema<GroupMessage>(
  {
    groupId: { type: String, required: true },

    messages: { type: String, required: true },
    isRead: { type: Boolean, default: false },

    groupMessageParticipant: [
      {
        participantId: { type: String, required: true },
        participantName: { type: String, required: true },
        participantEmail: { type: String },
        role: {
          type: String,
          enum: ["teacher", "student", "admin", "supervisor", "academiccoach"],
          required: true,
        },
      },
    ],

    groupMessageOrganizer: {
      organizerId: { type: String, required: true },
      organizerName: { type: String, required: true },
      organizerEmail: { type: String },
      role: {
        type: String,
        enum: ["teacher", "student", "admin", "supervisor", "academiccoach"],
        required: true,
      },
    },

    notificationStatus: {
      type: String,
      enum: [notificationStatus.SEEN, notificationStatus.UN_SEEN],
      default: notificationStatus.UN_SEEN,
    },

    status: {
      type: String,
      enum: [appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED],
      default: appStatus.ACTIVE,
    },
uploadedFormat: {
        type: String,
        required: false,
      },
      uploadedFile: {
        type: String,
        required: false,
      },
    createdDate: { type: Date, default: Date.now },
    createdBy: { type: String },
    updatedDate: { type: Date, default: Date.now },
    updatedBy: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: String },
  },
  { collection: "groupMessages", timestamps: false }
);

export const zodGroupMessageSchema = z.object({
  groupId: z.string(),

  messages: z.string(),
  isRead: z.boolean(),
uploadedFormat: z.enum([uploadedFormat.PDF, uploadedFormat.VIDEO,]).optional(),
    uploadedFile: z.any().optional(),
  groupMessageParticipant: z
    .array(
      z.object({
        participantId: z.string(),
        participantName: z.string(),
        participantEmail: z.string().optional(),
        role: z.enum(["teacher", "student", "admin", "supervisor", "academiccoach"]),
      })
    )
    .min(1, "At least 1 participant is required"),

  groupMessageOrganizer: z.object({
    organizerId: z.string(),
    organizerName: z.string(),
    organizerEmail: z.string().optional(),
    role: z.enum(["teacher", "student", "admin", "supervisor", "academiccoach"]),
  }),

  notificationStatus: z.enum([notificationStatus.SEEN, notificationStatus.UN_SEEN]),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),

  createdDate: z.string().optional(),
  createdBy: z.string().optional(),
  updatedDate: z.string().optional(),
  updatedBy: z.string().optional(),
  isDeleted: z.boolean().optional(),
  deletedAt: z.string().optional(),
  deletedBy: z.string().optional(),
});

export default mongoose.model<GroupMessage>("GroupMessage", groupMessageSchema);
