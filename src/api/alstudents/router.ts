import { Server, ServerRoute } from "@hapi/hapi";
import { handler } from "./handler";
import { alstudentsMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    
    {
          method: "GET",
          path: "/alstudents",
          options: {
            handler: handler.getAllalstudentsList,
            description: alstudentsMessages.LIST,
            tags: ["api", "alstudents"],
            auth: {
              strategies: ["jwt"],
            }, },
        },

     {
           method: "GET",
           path: "/alstudents/{alstudentsId}",
           options: {
             handler: handler.getalstudentsById,
             description: alstudentsMessages.BYID,
             tags: ["api", "alstudents"],
             auth: {
              strategies: ["jwt"],
            }, },
         },  
         
         {
          method: "GET",
          path: "/alstudents/studentsrecordcount",
          options: {
            handler: handler.getAllStudentCount,
            description: alstudentsMessages.BYID,
            tags: ["api", "alstudents"],
            auth: {
              strategies: ["jwt"],
            },},
        },  
        
        {
          method: "GET",
          path: "/alstudents/studentsGender",
          options: {
            handler: handler.getStudentGenderCount,
            description: alstudentsMessages.BYID,
            tags: ["api", "alstudents"],
            auth: {
              strategies: ["jwt"],
            }, },
        }, 

        {
          method: "GET",
          path: "/alstudents/studentscountrycount",
          options: {
            handler: handler.getStudentCountryCount,
            description: alstudentsMessages.BYID,
            tags: ["api", "alstudents"],
            auth: {
              strategies: ["jwt"],
            },},
        }, 
           {
          method: "GET",
          path: "/alstudents/studentslevel",
          options: {
            handler: handler.getStudentlevel,
            description: alstudentsMessages.BYID,
            tags: ["api", "alstudents"],
            // auth: {
            //   strategies: ["jwt"],
            // },
          },
        },
        {
          method: "PUT",
          path: "/studentProfile/{id}",
          options: {
            payload: {
              maxBytes: 10 * 1024 * 1024, // 10 MB max
              output: "stream",            // 'stream' is better for files
              parse: true,
              multipart: true,             // enables multipart parsing
              allow: "multipart/form-data"
            },
            handler: handler.updateStudentProfile,
            tags: ["api", "student"],
           },
        },

  ];
  server.route(routes);
};
export = {
  name: "api-alstudents",
  register,
};