
import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";

const register = async (server: Server): Promise<void> => {
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/leaverequest",
      options: {
        handler:handler.createLeaveRequestHandler ,  
        tags: ["api", "leaverequest"],  
      },
    },


  ];


  server.route(routes);
};

export = {
  name: "api-leaverequest",
  register,
};

