import { Server, ServerRoute } from "@hapi/hapi";
import { ClassSchedulesMessages, evaluationMessages } from "../../config/messages";
import handler from "./handler";

const register = async (server: Server): Promise<void> => {
    // Register all routes for this unit
    const routes: ServerRoute[] = [
    
      // {
      //   method: "POST",
      //   path: "/classschedule",
      //   options: {
      //     handler: handler.classShedule,
      //     description: evaluationMessages.CREATE,
      //     tags: ["api", "class"],
      //     // auth: {
      //     //   strategies: ["jwt"],
      //     // },
      //   },
      // }, 
      
      {
        method: "PUT",
        path: "/classschedule/{studentId}",
        options: {
         handler: handler.createandUpdateSchedule,
         description: evaluationMessages.UPDATE,
         tags: ["api", "evaluation"],
      },
      },
      
      {
        method: "GET",
        path: "/classShedule",
        options: {
         handler: handler.getAllClassShedule,
         description: ClassSchedulesMessages.LIST,
         tags: ["api", "classShedule"],
      },
      },

      {
        method: "GET",
        path: "/classShedule/{classSheduleId}",
        options: {
         handler: handler.getAllClassSheduleById,
         description: ClassSchedulesMessages.BYID,
         tags: ["api", "classShedule"],
      },
      },

    ];
    server.route(routes);
  };
  export = {
    name: "api-classShedule",
    register,
  };