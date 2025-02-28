import { Server, ServerRoute } from "@hapi/hapi";
import { ClassSchedulesMessages, evaluationMessages } from "../../config/messages";
import handler from "./handler";

const register = async (server: Server): Promise<void> => {
    // Register all routes for this unit
    const routes: ServerRoute[] = [
    
      // {
      //   method: "POST",
      //   path: "/classschedule",
      //   options: {
      //     handler: handler.classShedule,
      //     description: evaluationMessages.CREATE,
      //     tags: ["api", "class"],
      //     // auth: {
      //     //   strategies: ["jwt"],
      //     // },
      //   },
      // }, 
      
      {
        method: "PUT",
        path: "/createclassschedule/{studentId}",
        options: {
         handler: handler.createandUpdateSchedule,
         description: evaluationMessages.UPDATE,
         tags: ["api", "evaluation"],
          auth: {
            strategies: ["jwt"],
          },
      },
      },
      
      {
        method: "GET",
        path: "/classShedule",
        options: {
         handler: handler.getAllClassShedule,
         description: ClassSchedulesMessages.LIST,
         tags: ["api", "classShedule"],
        //  auth: {
        //   strategies: ["jwt"],
        // },
      },
      },

      {
        method: "GET",
        path: "/classShedule/{classSheduleId}",
        options: {
         handler: handler.getAllClassSheduleById,
         description: ClassSchedulesMessages.BYID,
         tags: ["api", "classShedule"],
         auth: {
          strategies: ["jwt"],
        },
      },
      },

 {
        method: "GET",
        path: "/classShedule/students",
        options: {
          handler: handler.getClassesForStudent,
          description: ClassSchedulesMessages.LIST,
          tags: ["api", "classShedule"],
          // auth: {
          //   strategies: ["jwt"],
          // },
        },
      },

      {
        method: "GET",
        path: "/classShedule/teacher",
        options: {
          handler: handler.getClassesForTeacher,
          description: ClassSchedulesMessages.LIST,
          tags: ["api", "classShedule"],
          // auth: {
          //   strategies: ["jwt"],
          // },
        },
      },

      {
        method: "GET",
        path: "/teacher-student-count",
        handler: handler.getTeacherStudentCount,
      },


      
      {
        method: "PUT",
        path: "/classShedule/{classSheduleId}",
        options: {
         handler: handler.updateClassSheduleById,
         description: evaluationMessages.UPDATE,
         tags: ["api", "classShedule"],
         auth: {
          strategies: ["jwt"],
        },
      },  
      },

      {
        method: "GET",
        path: "/classShedule/totalhours",
        options: {
         handler: handler.totalhours,
         description: evaluationMessages.GET,
         tags: ["api", "classShedule"],
        //  auth: {
        //   strategies: ["jwt"],
        // },
      },  
      },
      {
        method: "GET",
        path: "/classShedule/activity",
        options: {
         handler: handler.teachingActivity,
         description: evaluationMessages.GET,
         tags: ["api", "classShedule"],
        //  auth: {
        //   strategies: ["jwt"],
        // },
      },  
      },

    ];
    server.route(routes);
  };
  export = {
    name: "api-classShedule",
    register,
  };