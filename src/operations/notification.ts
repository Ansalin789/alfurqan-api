// services/notification.service.ts
import { INotification } from "../../types/models.types";
import notification from "../models/notification";


//Create Notification //

export const createNotification = async (data: INotification[]) => {
 
};


/**
 * Retrieves all meeting records with optional filters.
 */
export const getAllNotification = async ( receiverId?: string, senderId?: string ): Promise<{ totalCount: number; notificationlist: INotification[] }> => {
    try {
      const filter: any = {};
  
      if (receiverId) {
        filter.receiverId = receiverId;
      } else if (senderId) {
        filter.senderId = senderId;
      }
  
      const notificationlist = await notification.find(filter).sort({ createdDate: -1 });
      const totalCount = await notification.countDocuments(filter);
  
      return { totalCount, notificationlist };
    } catch (error) {
      throw new Error("Error fetching notifications: " + error);
    }
  };
  