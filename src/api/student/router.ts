import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { fileMessages, studentMessages } from "../../config/messages";
import Joi from "joi";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
  
    {
      method: "POST",
      path: "/student",
      options: {
        handler: handler.createStudent,
        description: studentMessages.CREATE,
        tags: ["api", "student"],
        // auth: {
        //   strategies: ["jwt"],
        // },
      },
    },

  ];
  server.route(routes);
};
export = {
  name: "api-students",
  register,
};
