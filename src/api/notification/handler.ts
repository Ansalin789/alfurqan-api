import { ResponseToolkit , Request} from "@hapi/hapi";
import getAllNotification, { getNotificationsByNotificationId} from "../../operations/notification";




export default {
 async getNotificationsHandler(req: Request, h: ResponseToolkit){
    try {
      const notificationId = req.params.notificationId;
  
      if (!notificationId) {
        return h.response({ success: false, message: "Receiver ID is required" }).code(400);
      }
  
      const { notifications, totalCount } = await getNotificationsByNotificationId(notificationId);
  
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
  const receiverId = req.query.receiverId as string | undefined;

  try {
    const notifications = await getAllNotification(receiverId); // pass undefined if not present
    return h
      .response({
        message: 'Notification(s) retrieved successfully',
        data: notifications,
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        error: (error as Error).message || 'Internal Server Error',
      })
      .code(500);
  }
}





}
