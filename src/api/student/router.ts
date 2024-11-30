import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { fileMessages, studentMessages } from "../../config/messages";
import Joi from "joi";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
  
    {
      method: "POST",
      path: "/student",
      options: {
        handler: handler.createStudent,
        description: studentMessages.CREATE,
        tags: ["api", "student"],
        // auth: {
        //   strategies: ["jwt"],
        // },
      },
    },

     
    {
      method: "GET",
      path: "/studentlist",
      options: {
        handler: handler.getAllStudents,
        description: studentMessages.LIST,
        tags: ["api", "studentlist"],
        // auth: {
        //   strategies: ["jwt"],
        // },
        
      },
    },

    // {
    //   method: "GET",
    //   path: "/students/{studentsId}",
    //   options: {
    //     handler: handler.getStudentRecordById,
    //     description: studentsMessages.BYID,
    //     tags: ["api", "students"],
    //     // auth: {
    //     //   strategies: ["jwt"],
    //     // },
    //   },
    // },

  ];
  server.route(routes);
};
export = {
  name: "api-students",
  register,
};
