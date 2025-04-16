// services/notification.service.ts
import NotificationModel from "../models/notification"
import { INotification } from "../../types/models.types";

export const createNotification = async (data: INotification[]) => {
  try {
    const newNotification = await NotificationModel.create(data);
    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};


export const getallnotification = async () =>{

};