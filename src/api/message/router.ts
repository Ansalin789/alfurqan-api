
import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";

const register = async (server: Server): Promise<void> => {
  // Define the routes for this module
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/message",
      options: {
        handler:handler.createMessage ,  
        tags: ["api", "message"],  
        auth: {
          strategies: ["jwt"],
        },
      },
    },



    {
      method: "GET",
      path: "/message/studentmessage",
      options: {
        handler:handler.createStudentMessageList ,  
        tags: ["api", "message"],  
        auth: {
          strategies: ["jwt"],
        },
      },
    },


    {
      method: "GET",
      path: "/message/teachermessage",
      options: {
        handler:handler.createTeacherMessageList ,  
        tags: ["api", "message"],  
        auth: {
          strategies: ["jwt"],
        },
      },
    },
  ];

  // Register the defined routes with the Hapi server
  server.route(routes);
};

export = {
  name: "api-message",
  register,
};

