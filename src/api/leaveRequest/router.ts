
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
       },
       {
            method: "GET",
            path: "/leaverequest/list",
            options: {
              handler: handler.getleaverequestList,
              description: leaveRequestMessages.LIST,
              tags: ["api", "LeaveSummary"],
            },
         },

         {
          method: "GET",
          path: "/leavesummary/list",
          options: {
            handler: handler.getleaveSummaryList,
            description: leaveRequestMessages.LIST,
            tags: ["api", "LeaveSummary"],
          },
         },

         
          {
            method: "GET",
            path: "/leaverequest/{id}",
            options: {
              handler: handler.getLeaveRecordById,
              description: leaveRequestMessages.LIST,
              tags: ["api", "LeaveRequest"],
          
            },
          },

                 
          {
            method: "GET",
            path: "/leaveSummary/{id}",
            options: {
              handler: handler.getLeaveSummaryRecordById,
              description: leaveRequestMessages.LIST,
              tags: ["api", "LeaveSummary"],
          
            },
          },




  ];


  server.route(routes);
};

export = {
  name: "api-leaverequest",
  register,
};

