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


 async getAllClassSchedule(req: Request, h: ResponseToolkit) {
    try {
      // Explicitly parse and validate the query using zod
      const parsedQuery = createInputValidation.parse({
        query: {
          ...req.query,
          filterValues: req.query?.filterValues
            ? JSON.parse(req.query.filterValues)
            : {},
        },
      });

      // Get the validated query (parsedQuery.query will have the validated data)
      const query = parsedQuery.query;

      // Fetch records from the database using the validated query
      const academicCoaches = await getAllAcademicCoach(query);
      return academicCoaches;
    } catch (error) {
      // Return a 400 error if validation fails
      return h.response({ error: "Invalid query parameters" }).code(400);
    }
  },
  
  async getAcademicCoachId(req: Request, h: ResponseToolkit) {
    console.log("id>>",req.params.academicCoachId);
    const result = await getAcademicCoachId(String(req.params.academicCoachId));
  // console.log("id>>",req.params.academicCoachId)
    if (isNil(result)) {
      return notFound(meetingSchedulesMessages.BYID);
    }
  
    return result;
  },





















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
   }
}










