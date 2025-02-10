import { Server, ServerRoute } from "@hapi/hapi";
import Inert from "@hapi/inert";
import handler from "./handler";
import { assignemntMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  await server.register(Inert);

  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/assignments",
      options: {
        handler: handler.createAssignment,
        description: "Create an assignment",
        tags: ["api", "student"],
        payload: {
          output: "stream",
          parse: true,
          maxBytes: 50 * 1024 * 1024,
          multipart: true,
          allow: "multipart/form-data",
        },
      },
    },
    {
      method: "GET",
      path: "/allAssignment",
      options: {
        handler: handler.getAllAssignment,
        description: "Get all assignments",
        tags: ["api", "assignment"],
        // auth: {
        //   strategies: ["jwt"], // Assuming you want authenticate
        // d access
        // },
      },
    },

    {
            method: "GET",
            path: "/assignments/{assignmentsId}",
            options: {
             handler: handler.getAssignmentsById,
             description: "Get assignment details",
             tags: ["api", "assignment"],
             auth: {
              strategies: ["jwt"],
            },
          },
          },

 {
      method: "PUT",
      path: "/assignments/{assinmentId}",
      options: {
       handler: handler.updateAssignment,
       description: assignemntMessages.UPDATE,
       tags: ["api", "assignment"],
       payload: {
        output: "stream",
        parse: true,
        maxBytes: 10 * 1024 * 1024,
        multipart: true,
        allow: "multipart/form-data",
      },
      //  auth: {
      //   strategies: ["jwt"],
      // },
    },  
    },

    
  ];
  server.route(routes);
};
export = {
  name: "api-assignment",
  version: "1.0.0",
  register,
};