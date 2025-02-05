
import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";

const register = async (server: Server): Promise<void> => {
  // Define the routes for this module
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/feedback",
      options: {
        handler:handler.createFeedback ,  
        tags: ["api", "feedback"],  
        // auth: {
        //   strategies: ["jwt"],
        // },
      },
    },



    {
      method: "POST",
      path: "/teacherfeedback",
      options: {
        handler:handler.createTeacherFeedback ,  
        tags: ["api", "feedback"],  
        // auth: {
        //   strategies: ["jwt"],
        // },
      },
    },

    // {
    //   method: "GET",
    //   path: "/message/teachermessage",
    //   options: {
    //     handler:handler.createTeacherMessageList ,  
    //     tags: ["api", "message"],  
    //     // auth: {
    //     //   strategies: ["jwt"],
    //     // },
    //   },
    // },
  ];

  // Register the defined routes with the Hapi server
  server.route(routes);
};

export = {
  name: "api-feedback",
  register,
};

