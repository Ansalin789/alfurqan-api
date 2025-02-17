import { Server, ServerRoute } from "@hapi/hapi";
import { addMeetingMessages, recruitmentMessages } from "../../config/messages";
import handler from "./handler";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/addMeeting",
      options: {
        handler: handler.createMeeting,
        description: addMeetingMessages.CREATE,
        tags: ["api", "recruitment"],
        payload: {
          parse: true,
          allow: "application/json", 
          maxBytes: 50 * 1024 * 1024, // ✅ Optional: Limit request size
        },
      },
    },
    
      {
          method: "GET",
          path: "/allMeetings",
          options: {
            handler: handler.getAllMeetings,
            description: addMeetingMessages.LIST,
            tags: ["api", "recruitment"],
            // auth: {
            //   strategies: ["jwt"],
            // },
          },
        },


  ];
  server.route(routes);
};

export = {
  name: "api-addMeeting",
  register,
};
