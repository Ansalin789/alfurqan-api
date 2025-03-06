import { Server, ServerRoute } from "@hapi/hapi";
import handler from './handler';
import { meetingSchedulesMessages} from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    {
      method: "GET",
      path: "/meetingSchedulelist",
      options: {
        handler: handler.getAllAcademicCoach,
        description: meetingSchedulesMessages.LIST,
        tags: ["api", "meetingSchedulelist"],
      },
    },
    
    {
      method: "GET",
      path: "/meetingSchedulelist/{academicCoachId}",
      options: {
        handler: handler.getAcademicCoachId,
        description: meetingSchedulesMessages.LIST,
        tags: ["api", "meetingSchedulelist"],
      },
    },
    
  ];
  server.route(routes);
};
export = {
  name: "api-meetingSchedule",
  register,
};
