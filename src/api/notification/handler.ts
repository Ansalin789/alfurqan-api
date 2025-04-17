import { ResponseToolkit , Request} from "@hapi/hapi";
import { getAllNotification, getNotificationsByReceiverId } from "../../operations/notification";





export default {
 async getNotificationsHandler(req: Request, h: ResponseToolkit){
    try {
      const notificationId = req.params.notificationId;
  
      if (!notificationId) {
        return h.response({ success: false, message: "Receiver ID is required" }).code(400);
      }
  
      const { notifications, totalCount } = await getNotificationsByReceiverId(notificationId);
  
      return h.response({
        success: true,
        data: {
          notifications,
          totalCount,
        },
      }).code(200);
    } catch (error: any) {
      return h.response({
        success: false,
        message: error.message ?? "Failed to fetch notifications",
      }).code(500);
    }
  },
    
// Retrieve all the students list
async getnotificationList(req: Request, h: ResponseToolkit) {
    try {
        const notifications = await getAllNotification();
        return h.response({ message: "Notification retrieved successfully", data: notifications }).code(200);
      } catch (error) {
        return h.response({ error }).code(500);
      }
    },
}
