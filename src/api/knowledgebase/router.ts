import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { addKnowledgeBaseMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/knowledgebase",  // Make sure this matches exactly
     options: {
      handler: handler.createKnowledgeBase,
      description: addKnowledgeBaseMessages.CREATE,
      tags: ["api", "knowledgeBase"],
      payload: {
        parse: true, 
        maxBytes: 10485760,
        allow: "application/json",
        output: "data",
      },
    },
    },
    {
      method: "GET",
      path: "/knowledgebase/list",
      options: {
        handler: handler.getknowledgebaseList,
        tags: ["api", "knowledgeBase"],
      },
    }
    

  ];
  server.route(routes);
};

export = {
  name: "api-addKnowledgeBase",
  register,
};
