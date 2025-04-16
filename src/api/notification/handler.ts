import { ResponseToolkit , Request} from "@hapi/hapi";
import { getAllNotification } from "../../operations/notification";




export default {

    
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
