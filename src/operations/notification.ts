// services/notification.service.ts
import { INotification } from "../../types/models.types";
import notification from "../models/notification";


//Create Notification //

export const createNotification = async (data: INotification[]) => {
 
};


/**
 * Retrieves all meeting records with optional filters.
 */
export const getAllNotification = async (): Promise<{ totalCount: number; notificationlist: INotification[] }> => {
  try {
    const notificationlist = await notification.find().sort({ createdDate: -1 });
    const totalCount = await notification.countDocuments();

    return { totalCount, notificationlist };
  } catch (error) {
    throw new Error("Error fetching meetings: " + error);
  }
};