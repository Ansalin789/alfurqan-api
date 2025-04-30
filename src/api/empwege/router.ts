import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { userMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
   
    {
      method: "POST",
      path: "/empwages",
      options: {
        handler: handler.createEmployeeWages,
        description: userMessages.CREATE,
        tags: ["api", "users"],
      },
    },

    {
        method: "GET",
        path: "/empwages/{id}",
        options: {
          handler: handler.getAllEmployeeWages,
          description: userMessages.CREATE,
          tags: ["api", "users"],
        },
      },

  ];
  server.route(routes);
};
export = {
  name: "api-wages",
  register,
};
