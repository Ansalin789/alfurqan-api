import { Server, ServerRoute } from "@hapi/hapi";
import { roleAccess } from "../../config/messages";
import handler from "./handler";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    
    {
      method: "PUT",
      path: "/roleAccess/{userId}",
      options: {
        handler: handler.updateroleAccessById,
        description: roleAccess.UPDATE,
        tags: ["api", "roleAccess"],
      },
    },


  ];
  server.route(routes);
};
export = {
  name: "api-roleAccess",
  register,
};
