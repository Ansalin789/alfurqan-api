import { Server, ServerRoute } from "@hapi/hapi";
import { roleAccess } from "../../config/messages";
import handler from "./handler";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    
    {
      method: "PUT",
      path: "/employeeroleaccess/{_id}",
      options: {
        handler: handler.updateModuleAccessById,
        description: roleAccess.UPDATE,
        tags: ["api", "roleAccess"],
        auth: {
          strategies: ["jwt"],
        }, },
    },

    {
      method: "GET",
      path: "/employeeroleaccess/list",
      options: {
        handler:handler.getsettinglist,  
        tags: ["api", "roleAccess"],  
        auth: {
          strategies: ["jwt"],
        },
       },
    },

    {
        method: "GET",
        path: "/employeeroleaccess/{id}",
        options: {
          handler:handler.getsettingById,
          tags: ["api", "role-access"],
          description: "Get settingdetail by Id",
          auth: {
            strategies: ["jwt"],
          }, 
          },
      },

         {
        method: "GET",
        path: "/employeemoduleaccess/{id}",
        options: {
          handler:handler.getModuleAccessById,
          tags: ["api", "role-access"],
          description: "Get settingdetail by Id",
          // auth: {
          //   strategies: ["jwt"],
          // }, 
          },
      },


  ];
  server.route(routes);
};
export = {
  name: "api-roleAccess",
  register,
};
