import mongoose, { Schema } from "mongoose";
import { Group } from "../../types/models.types";
import { appStatus, notificationStatus, uploadedFormat } from "../config/messages";
import { z } from "zod";

const groupSchema = new Schema<Group>(
  {
    groupId: { type: String, required: true },

    GroupName: { type: String, required: true },
    GroupNameDescription: { type: String },
    CourseName: { type: String },
    Designation: { type: String },
    PreferredTeacher: { type: String },

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
        isRemoved: { type: Boolean, default: false },
        removedDate: { type: Date, default: null },
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

    messages: { type: String, required: true },
    isRead: { type: Boolean, default: false },

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
    isGroupDeleted: { type: Boolean, default: false },
    groupDeletedAt: { type: Date },
    groupDeletedBy: { type: String },
  },
  { collection: "groups", timestamps: false }
);


export const zodGroupSchema = z.object({
  groupId: z.string(),
  GroupName: z.string(),
  GroupNameDescription: z.string().optional(),
  CourseName: z.string(),
  Designation: z.string(),
  PreferredTeacher: z.string(),
 uploadedFormat: z.enum([uploadedFormat.PDF, uploadedFormat.VIDEO,]).optional(),
    uploadedFile: z.any().optional(),
    
  groupMessageParticipant: z.array(
    z.object({
      participantId: z.string(),
      participantName: z.string(),
      participantEmail: z.string().optional(),
      role: z.enum(["teacher", "student", "admin", "supervisor", "academiccoach"]),
      isRemoved: z.boolean().optional(),
      removedDate: z.date().optional(),
    })
  ).min(1, "At least one participant required"),

  groupMessageOrganizer: z.object({
    organizerId: z.string(),
    organizerName: z.string(),
    organizerEmail: z.string().optional(),
    role: z.enum(["teacher", "student", "admin", "supervisor", "academiccoach"]),
  }),

  messages: z.string(),
  isRead: z.boolean(),
  notificationStatus:  z.enum([notificationStatus.SEEN, notificationStatus.UN_SEEN]),
  status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
});

export default mongoose.model<Group>("Group", groupSchema);
