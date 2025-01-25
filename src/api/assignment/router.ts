import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler"

const register = async (server: Server): Promise<void> => {
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/assignments",
      options: {
        handler: handler.createAssignment,
        description: "Fetch all assignments",
        tags: ["api", "student"],
        auth: {
          strategies: ["jwt"],
        },
      },
    },
   
  ];

  server.route(routes);
};

export = {
  name: "api-assignment",
  register,
};