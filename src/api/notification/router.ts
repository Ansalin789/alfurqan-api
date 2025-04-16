
import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";

const register = async (server: Server): Promise<void> => {
  const routes: ServerRoute[] = [
    
    {
      method: "GET",
      path: "/notification/getlist",
      options: {
        handler:handler.getnotificationList,  
        tags: ["api", "notification"],  
      },
    },


    // {
    //   method: "GET",
    //   path: "/notification/{notificationId}",
    //   options: {
    //     handler:handler.getnotificationById ,  
    //     tags: ["api", "notification"],  
    //   },
    // },

    // {
    //     method: "PUT",
    //     path: "/notification/{notificationId}",
    //     options: {
    //       handler:handler.createTeacherMessageList ,  
    //       tags: ["api", "notification"],  
    //     },
    //   },

    //   {
    //     method: "PUT",
    //     path: "/notification/bulkupdate",
    //     options: {
    //       handler:handler.createTeacherMessageList ,  
    //       tags: ["api", "notification"],  
    //     },
    //   },


  ];
  server.route(routes);
};

export = {
  name: "api-notification",
  register,
};

