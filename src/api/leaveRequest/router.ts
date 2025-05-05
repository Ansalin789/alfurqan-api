
import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { leaveRequestMessages, leaveStatus } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/leaverequest",
      options: {
        handler:handler.createLeaveRequestHandler ,  
        tags: ["api", "leaverequest"],  
      },
    },
    {
        method: "PUT",
        path: "/leaverequest/{id}",
        options: {
            handler: handler.updateLeaveRequestHandler,
            description: leaveRequestMessages.LIST,
            tags: ["api", "LeaveSummary"],
               
          },
       }




  ];


  server.route(routes);
};

export = {
  name: "api-leaverequest",
  register,
};

