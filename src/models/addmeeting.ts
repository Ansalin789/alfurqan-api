import mongoose, { model, Schema } from "mongoose";

import { IMeeting } from "../../types/models.types";
import { z } from "zod";
import { appStatus, commonMessages } from "../config/messages";

const addMeetingSchema = new Schema<IMeeting>(
{
meetingName:{
    type: String,
    required: true,
},
supervisor:{
    supervisorId:{
        type: String,
        required: false,
    },
    supervisorName:{
        type: String,
        required: false,  
    },
    supervisorEmail:{
        type: String,
        required: false,
    },
    supervisorRole:{
        type: String,
        required: false,
    }
},

selectedDate:{
    type: Date,
    required: true,
},
startTime:{
    type: String,
    required: true,
},
endTime:{
    type: String,
    required: true,
},
teacher:{
    type: Array,
    required: true,
},
description:{
    type: String,
    required: true,
},
status:{
    type: String,
    required: false,
},
createdDate:{
    type: Date,
    required: true,
},
createdBy:{
    type: String,
    required: true,
},
updatedDate:{
    type: Date,
    required: false,
},
updatedBy:{
    type: String,
    required: false,
}
},  
{
    collection: "addMeeting",
    timestamps: false,
}
);
export const zodAddMeetingSchema = z.object({
    meetingName: z.string().min(3, "Meeting name must be at least 3 characters"),
    supervisor: z.object({
      supervisorId: z.string().optional(),
      supervisorName: z.string().optional(),
      supervisorEmail: z.string().email().optional(),
      supervisorRole: z.string().optional(),
    }),
    selectedDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      })
      .transform((val) => new Date(val)),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
    teacher: z.array(z.string()),
    description: z.string().min(5, "Description must be at least 5 characters"),
    status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
    createdDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      })
      .transform((val) => new Date(val)),
    createdBy: z.string(),
    updatedDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      })
      .transform((val) => new Date(val))
      .optional(),
    updatedBy: z.string().optional(),
  });
export default mongoose.model<IMeeting>("addMeeting", addMeetingSchema);
