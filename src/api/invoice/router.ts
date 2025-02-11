import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { evaluationMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
  

    {
      method: "GET",
      path: "/studentinvoice",
      options: {
        handler: handler.getAllStudetnInVoiceList,
        description: evaluationMessages.LIST,
        tags: ["api", "evaluationlist"],
        // auth: {
        //   strategies: ["jwt"],
        // },
      },
    },
         
  ];
  server.route(routes);
};
export = {
  name: "api-invoice",
  register,
};
