import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import { INotification } from "../../types/models.types";

const notificationSchema = new Schema<INotification>(
  {
  
    messages: {
      type: String,
      required: false,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: false
    },
    senderEmail:  {  
       type: String,
       required: false,
     },
  
    receiverId: { 
       type: String,
       required: false,
     },
    receiverName: {
       type: String,
        required: false
     },
    receiverEmail: { 
      type: String, 
      required: false,
     },
    notificationType: { 
      type: String, 
      required: false,
     },
     notificationStatus: { 
      type: String, 
      required: false,
     },
     status: { type: String, required: false },
     createdDate: { type: Date, required: false, default: Date.now },
     createdBy: { type: String, required: false },
     updatedDate: { type: Date, required: false, default: Date.now },
     updatedBy: { type: String, required: false },
  },
  {
    collection: "notification",
    timestamps: false,
  }
);

export const zodnotificationSchema = z.object({
  messages: z.string().optional(),

  senderId: z.string(),
  senderName: z.string(),
  senderEmail: z.string(),

  receiverId: z.string(),
  receiverName: z.string(),
  receiverEmail: z.string(),

  notificationType: z.string().optional(),
  notificationStatus: z.string().optional(),
  status: z.string().optional(),

  createdDate: z.date().optional(),
  createdBy: z.string().optional(),

  updatedDate: z.date().optional(),
  updatedBy: z.string().optional(),
});

export default mongoose.model<INotification>("Notification",notificationSchema);
