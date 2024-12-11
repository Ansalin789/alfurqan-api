import { Server, ServerRoute } from "@hapi/hapi";
import handler from './handler';
import { userMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    {
      method: "GET",
      path: "/meetingSchedulelist",
      options: {
        handler: handler.getAllAcademicCoach,
        description: userMessages.LIST,
        tags: ["api", "meetingSchedulelist"],
        // auth: {
        //   strategies: ["jwt"],
        // },
      },
    },
    
    
  ];
  server.route(routes);
};
export = {
  name: "api-meetingSchedule",
  register,
};
