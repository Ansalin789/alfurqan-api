import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./hanlder";
import { addAminMeetingMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [


      {
          method: "POST",
          path: "/addadminMeeting",
          options: {
            handler: handler.createAdminMeeting,
            description: addAminMeetingMessages.CREATE,
            tags: ["api", "adminmeeting"],
            payload: {
              parse: true,
              allow: "application/json", 
              maxBytes: 50 * 1024 * 1024, // ✅ Optional: Limit request size
            },
          },
        },

         {
              method: "GET",
              path: "/allAdminMeeting",
              options: {
                handler: handler.getAllAdminMeeting,
                description: addAminMeetingMessages.LIST,
                tags: ["api", "adminmeeting"],
              },
          },

           {
                method: "GET",
                path: "/allAdminMeeting/{meetingId}",
                options: {
                  handler: handler.getAdminMeetingRecordById,
                  description: addAminMeetingMessages.LIST,
                  tags: ["api", "recruitment"],
                },
           },






  ];
  server.route(routes);
};

export = {
  name: "admin-addMeeting",
  register,
};
