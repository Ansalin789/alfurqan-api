import { ResponseToolkit , Request} from "@hapi/hapi";
import { getallnotification } from "../../operations/notification";




export default {
// Retrieve all the students list
async getnotificationList(req: Request, h: ResponseToolkit) {
  return getallnotification();
},

}