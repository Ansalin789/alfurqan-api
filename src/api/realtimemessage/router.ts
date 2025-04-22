
import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";


const register = async (server: Server): Promise<void> => {
  const routes: ServerRoute[] = [
    
    {
      method: "POST",
      path: "/realtimemessage",
      options: {
        handler:handler.sendMessageHandler,  
        tags: ["api", "realtimemessage"],  
      },
    },
    {
        method: "GET",
        path: "/realtimemessage/{userId}",
        options: {
          handler:handler.getMessagesByUserHandler,  
          tags: ["api", "realtimemessage"],  
        },
      },
  ];
  server.route(routes);
};

export = {
  name: "api-realtimemessage",
  register,
};

