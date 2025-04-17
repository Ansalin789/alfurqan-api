// services/notification.service.ts
import { Types } from "mongoose";
import AppLogger from "../helpers/logging";
import notification, { zodnotificationSchema } from "../models/notification";
import {getIO } from "../shared/socket";


//Create Notification //


export const sendNotification = async (rawData: any) => {
  try {
    // ✅ Validate using Zod
    const payload = zodnotificationSchema.parse(rawData);

    // ✅ Save to DB
    const notifications = new notification(payload);
    const saved = await notifications.save();

    // ✅ Emit via WebSocket
    if (payload.receiverId) {
      getIO().to(payload.receiverId).emit("notification", saved);
    }

    AppLogger.info(`Notification sent: ${JSON.stringify(saved)}`);
    return { success: true, data: saved };
  } catch (err: any) {
    AppLogger.error(`Notification error: ${err.message}`);
    return { success: false, error: err.message };
  }
};
export const getNotificationsByNotificationId = async (notificationId: string) => {
  try {
    const [notifications, totalCount] = await Promise.all([
      notification.findOne({ _id: new Types.ObjectId(notificationId) }).lean(),
      notification.countDocuments({ _id: new Types.ObjectId(notificationId) }),
    ]);
    return { notifications, totalCount };
  } catch (error) {
    throw new Error(`Failed to fetch notifications: ${(error as Error).message}`);
  }
};

/**
 * Retrieves all meeting records with optional filters.
 */
export default async function getAllNotification(receiverId?: string) {
  try {
    const filter = receiverId ? { receiverId } : {};

    const [notifications, totalCount] = await Promise.all([
      notification.find(filter).sort({ createdDate: -1 }),
      notification.countDocuments(filter),
    ]);

    return { notifications, totalCount };
  } catch (error) {
    throw new Error(`Failed to fetch notifications: ${(error as Error).message}`);
  }
}












  