import { Server, ServerRoute } from "@hapi/hapi";
import {  otherEmployeesMessages } from "../../config/messages";
import handler from "./handler";



const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/otheremployee",
      options: {
        handler: handler.createOtherEmployee,
        description: otherEmployeesMessages.CREATE,
        tags: ["api", "recruitment"],
        payload: {
          output: "stream",
          parse: true,
          maxBytes: 50 * 1024 * 1024,
          multipart: true,
          allow: "multipart/form-data",
        },
      },
    },
     

];
server.route(routes);
};
export = {
name: "api-otheremployee",
register,
};