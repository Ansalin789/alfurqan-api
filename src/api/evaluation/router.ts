import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { evaluationMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
  
    {
      method: "POST",
      path: "/evaluation",
      options: {
        handler: handler.createEvaluation,
        description: evaluationMessages.CREATE,
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
  name: "api-evaluation",
  register,
};
