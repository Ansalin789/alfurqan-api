import { ResponseToolkit,Request, ResponseObject } from "@hapi/hapi";
import classShedule, { zodClassScheduleSchema } from "../../models/classShedule";
// import { createclassShedule } from "../../operations/classschedule"
import { z } from "zod";
import { ClassSchedulesMessages } from "../../config/messages";
import { isNil, result } from "lodash";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { notFound } from "@hapi/boom";
import { getAllClassShedule, getAllClassSheduleById, updateClassscheduleById, updateStudentClassSchedule,getClassesForStudent,getClassesForTeacher} from "../../operations/classschedule";
import { GetAllRecordsParams } from "../../shared/enum";
import userModel from "../../models/users";


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

const getAllClassSheduleInput = z.object({
  query: zodGetAllRecordsQuerySchema.pick({
    studentId:true,
    teacherId:true,
    searchText: true,
    sortBy: true,
    sortOrder: true,
    offset: true,
    limit: true,
    filterValues: true,
  }),
});

const updateClassScheduleInputValidation = z.object({
  payload: zodClassScheduleSchema.pick({
    student: true,
    teacher: true,
    classDay: true,
    package: true,
    preferedTeacher: true,
    // course: true,
    totalHourse: true,
    startDate: true,
    endDate: true,
    startTime: true,
    endTime: true,
    scheduleStatus: true,
}).partial()
})

export default {

  
  async createandUpdateSchedule(req: Request, h: ResponseToolkit){
    const { payload } = createInputValidation.parse({
      payload: req.payload,
   });
   const classDayValues = payload.classDay?.map((day: { value: string; label: string }) => day.value);
   const startTimeValues = payload.startTime?.map((time: { value: string; label: string }) => time.value);
   const endTimeValues = payload.endTime?.map((time: { value: string; label: string }) => time.value);

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
,


async getClassesForStudent(req: Request, h: ResponseToolkit) {
  try {
    // Parse and validate the query object
    const { query } = getAllClassSheduleInput.parse({
      query: {
        ...req.query,
        filterValues: req.query?.filterValues
          ? JSON.parse(req.query.filterValues as string)
          : {},
      },
    });

    return getClassesForStudent(query); // Ensure a valid return statement in the try block
  } catch (error) {
    // Handle the error appropriately
    console.error("Error in getClassesForStudent handler:", error);
    throw error; // Re-throw the error or handle it based on your application's requirement
  }
}
,




async getClassesForTeacher(req: Request, h: ResponseToolkit) {
  try {
    // Parse and validate the query object
    const { query } = getAllClassSheduleInput.parse({
      query: {
        ...req.query,
        filterValues: req.query?.filterValues
          ? JSON.parse(req.query.filterValues as string)
          : {},
      },
    });

    // ✅ Correctly call the database function (not the handler itself)
    return await getClassesForTeacher(query); // Call the actual function fetching data
  } catch (error) {
    console.error("Error in getClassesForTeacher handler:", error);
    throw error; // Handle the error appropriately
  }
}
,





async getAllClassShedule(req: Request, h: ResponseToolkit) {
  try {
    // Cast `req` to `Request` with query properties
    const parsedQuery = getAllClassSheduleInput.parse({
      query: {
        ...((req as any).query), // Cast req.query to 'any' or a more specific type if needed
        filterValues: (() => {
          try {
            return req.query?.filterValues
              ? JSON.parse(req.query.filterValues as string)
              : {};
          } catch {
            throw new Error("Invalid filterValues JSON format.");
          }
        })(),
      },
    });

    const query = parsedQuery.query;

    // Call your service or database function to fetch data
    const result = await getAllClassShedule(query);

    // Return the response
    return h.response(result).code(200);
  } catch (error) {
    // Handle errors (validation or other errors)
    return h.response({ error }).code(400);
  }
}
,

  // Handler for getting student by ID
  async getAllClassSheduleById(req: Request, h: ResponseToolkit) {
    try {
      // Fetch the student by ID
      const result = await getAllClassSheduleById(String(req.params.alstudentsId));

      // Handle not found case
      if (isNil(result)) {
        return h
          .response({ message: ClassSchedulesMessages.NOT_FOUND })
          .code(404);
      }

      // Return the found student
      return h.response(result).code(200);
    } catch (error) {
      // Handle errors (unexpected or other)
      return h
        .response({ error })
        .code(500);
    }
  },

  async updateClassSheduleById(req: Request, h: ResponseToolkit){

    const { payload } = updateClassScheduleInputValidation.parse({
      payload: req.payload
    });
    console.log("Payload received:", req.payload);
    const classDayValues = payload.classDay?.map((day: { value: string; label: string }) => day.value);
    const startTimeValues = payload.startTime?.map((time: { value: string; label: string }) => time.value);
    const endTimeValues = payload.endTime?.map((time: { value: string; label: string }) => time.value);
    const result = await updateClassscheduleById(String(req.params.classSheduleId),
    {   
      student: {
        studentId: payload.student?.studentId || "",
        studentFirstName: payload.student?.studentFirstName || "",
        studentLastName: payload.student?.studentLastName || "",
        studentEmail:payload.student?.studentEmail|| "",
      },
      teacher :{
        teacherName: payload.teacher?.teacherName || "",
        teacherEmail: payload.teacher?.teacherEmail|| ""
      } ,
      classDay :classDayValues ,
      package: payload.package,
      preferedTeacher: payload.preferedTeacher,
      // course:payload.course,
      totalHourse: payload.totalHourse,
      startDate: payload.startDate,
      endDate: payload.endDate,
      startTime: startTimeValues,
      endTime: endTimeValues,
      scheduleStatus: payload.scheduleStatus
       } );
    if (isNil(result)) {
      return notFound(ClassSchedulesMessages.CANDIDATE_NOT_FOUND);
    }
  
    return result;
   },


   
//teacher-student count

async getTeacherStudentCount(req: Request, h: ResponseToolkit) {
  try {
    console.log("Query parameters received:", req.query);

    // Fetch all unique teachers from the class schedule
    const teachers = await classShedule.aggregate([
      {
        $group: {
          _id: "$teacher.teacherEmail", // Group by teacherEmail to remove duplicates
          teacherId: { $first: "$teacher.teacherId" },
          teacherName: { $first: "$teacher.teacherName" },
          teacherEmail: { $first: "$teacher.teacherEmail" },
          studentCount: { $sum: 1 }, // Sum of student assignments for unique teachers
        },
      },
    ]);

    return h.response({
      success: true,
      data: teachers,
    }).code(200);
  } catch (error) {
    console.error("Error fetching teacher-student count:", error);
    return h.response({ success: false, message: "Internal Server Error" }).code(500);
  }
}






}












