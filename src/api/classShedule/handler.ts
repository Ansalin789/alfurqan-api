import { ResponseToolkit,Request } from "@hapi/hapi";
import { zodClassScheduleSchema } from "../../models/classShedule";
// import { createclassShedule } from "../../operations/classschedule"
import { z } from "zod";
import { updateStudentClassSchedule } from "../../operations/classschedule";

const createInputValidation = z.object({
    payload: zodClassScheduleSchema.pick({
        teacher: true,
        classDay: true,
        package: true,
        preferedTeacher: true,
        course: true,
        totalHourse: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        scheduleStatus: true,
    }).partial()
  });

export default {

  
  async createandUpdateSchedule(req: Request, h: ResponseToolkit){
    const { payload } = createInputValidation.parse({
      payload: req.payload,
   });
   const classDayValues = payload.classDay?.map((day: { value: string; label: string }) => day.value);
   const startTimeValues = payload.startTime?.map((time: { value: string; label: string }) => time.value);
   const endTimeValues = payload.endTime?.map((time: { value: string; label: string }) => time.value);

   console.log("classDayValues>>",classDayValues);
   console.log("startTimeValues>>",startTimeValues);
   console.log("endTimeValues>>",endTimeValues);

   return await updateStudentClassSchedule(String(req.params.studentId),{ 
    teacher :{
      teacherName: payload.teacher?.teacherName || "",
      teacherEmail: payload.teacher?.teacherEmail|| ""
    } ,
    classDay :classDayValues ,
    package: payload.package,
    preferedTeacher: payload.preferedTeacher,
    course:payload.course,
    totalHourse: payload.totalHourse,
    startDate: payload.startDate,
    endDate: payload.endDate,
    startTime: startTimeValues,
    endTime: endTimeValues,
    scheduleStatus: payload.scheduleStatus
     });
  }
}