import { Server, ServerRoute } from "@hapi/hapi";
import { evaluationMessages } from "../../config/messages";
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
    ];
    server.route(routes);
  };
  export = {
    name: "api-classShedule",
    register,
  };