import { Server, ServerRoute } from "@hapi/hapi";
import { fileMessages, recruitmentMessages, studentMessages } from "../../config/messages";
import handler from "./handler";



const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/recruit",
      options: {
        handler: handler.createRecruitement,
        description: recruitmentMessages.CREATE,
        tags: ["api", "recruitment"],
        payload: {
          output: "stream",
          parse: true,
          maxBytes: 50 * 1024 * 1024,
          multipart: true,
          allow: "multipart/form-data",
        },
        // auth: {
        //   strategies: ["jwt"],
        // },
      },
    },
];
server.route(routes);
};
export = {
name: "api-recruitment",
register,
};