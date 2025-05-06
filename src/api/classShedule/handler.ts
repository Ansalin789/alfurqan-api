import { ResponseToolkit,Request } from "@hapi/hapi";
import classShedule, { zodClassScheduleSchema } from "../../models/classShedule";
import { z } from "zod";
import { ClassSchedulesMessages } from "../../config/messages";
import { isNil } from "lodash";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { notFound } from "@hapi/boom";
import { getAllClassShedule, getAllClassSheduleById, updateClassscheduleById, updateStudentClassSchedule,getClassesForStudent,getClassesForTeacher, getStudentClassHours, teachingActivity, updateteacherreschedule, getStudentClassCount, getTotalClassesCount, getClassesStatusCount, getClassesWiseCount, getStudentList} from "../../operations/classschedule";


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
        studentAttendee:true,
        teacherAttendee: true,
        sessionClassType:true,
        sessionsEndtime:true,
        sessionStarttime:true,
        teacherreschedule:true,
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
    sessionClassType:true,
    sessionStarttime:true,
    sessionsEndtime:true,

}).partial()
})

export default {
async createandUpdateSchedule(req: Request, h: ResponseToolkit){
    console.log("Raw Request Payload:", req.payload);
    const { payload } = createInputValidation.parse({
      payload: req.payload,
   });
   console.log("Parsed Payload:", payload);

   const classDayValues = payload.classDay?.map((day: { value: string; label: string }) => day.value);
   const startTimeValues = payload.startTime?.map((time: { value: string; label: string }) => time.value);
   const endTimeValues = payload.endTime?.map((time: { value: string; label: string }) => time.value);

   return await updateStudentClassSchedule(String(req.params.studentId),{ 
    teacher :{
      teacherId: payload.teacher?.teacherId ?? "",
      teacherName: payload.teacher?.teacherName ?? "",
      teacherEmail: payload.teacher?.teacherEmail ?? ""
    } ,
    classDay :classDayValues,
    package: payload.package,
    preferedTeacher: payload.preferedTeacher,
     course:payload.course,
     sessionClassType: payload.sessionClassType || "",
     sessionStarttime: payload.sessionStarttime || "",
     sessionsEndtime: payload?.sessionsEndtime || "",
     sessionStatus:"NotCompleted",
     totalHourse: payload.totalHourse,
    startDate: payload.startDate,
    endDate: payload.endDate,
    startTime: startTimeValues,
    endTime: endTimeValues,
    scheduleStatus: payload.scheduleStatus,
    studentAttendee: payload.studentAttendee,
    teacherAttendee:payload.teacherAttendee,
   
     }
    );


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
    const result = await updateClassscheduleById(String(req.params.classSheduleId), {
      student: {
        studentId: payload.student?.studentId ?? "",
        studentFirstName: payload.student?.studentFirstName ?? "",
        studentLastName: payload.student?.studentLastName ?? "",
        studentEmail: payload.student?.studentEmail ?? "",
        gender: payload.student?.gender ?? "",
      },
      teacher: {
        teacherId: payload.teacher?.teacherId ?? "",
        teacherName: payload.teacher?.teacherName ?? "",
        teacherEmail: payload.teacher?.teacherEmail ?? ""
      },
      classDay: classDayValues,
      package: payload.package,
      preferedTeacher: payload.preferedTeacher,
      totalHourse: payload.totalHourse,
      startDate: payload.startDate,
      endDate: payload.endDate,
      startTime: startTimeValues,
      endTime: endTimeValues,
      scheduleStatus: payload.scheduleStatus,
    
      // ✅ Add these:
      sessionStarttime: payload.sessionStarttime,
      sessionsEndtime: payload.sessionsEndtime,
      sessionClassType: payload.sessionClassType,
      sessionStatus:"NotCompleted"

    });
    
    if (isNil(result)) {
      return notFound(ClassSchedulesMessages.CANDIDATE_NOT_FOUND);
    }
  
    return result;
   },

async getTeacherStudentCount(req: Request, h: ResponseToolkit) {
  try {
    console.log("Query parameters received:", req.query);

    const teachers = await classShedule.aggregate([
      {
        $group: {
          _id: "$teacher.teacherId", // Group by teacherEmail
          teacherId: { $first: req.query },
          teacherName: { $first: "$teacher.teacherName" },
          teacherEmail: { $first: "$teacher.teacherEmail" },
          uniqueStudents: { 
            $addToSet: { 
              studentId: "$student.studentId", 
              gender: "$student.gender" 
            } 
          } // Collect unique student IDs and gender
        }
      },
      {
        $project: {
          teacherId: 1,
          teacherName: 1,
          teacherEmail: 1,
          studentCount: { $size: "$uniqueStudents" }, // Total unique students
          maleCount: {
            $size: {
              $filter: {
                input: "$uniqueStudents",
                as: "student",
                cond: { $eq: ["$$student.gender", "MALE"] }
              }
            }
          }, // Count only male students
          femaleCount: {
            $size: {
              $filter: {
                input: "$uniqueStudents",
                as: "student",
                cond: { $eq: ["$$student.gender", "FEMALE"] }
              }
            }
          }, // Count only female students
        }
      }
    ]);

    return h.response({
      success: true,
      data: teachers,
    }).code(200);
  } catch (error) {
    console.error("Error fetching teacher-student count:", error);
    return h.response({ success: false, message: "Internal Server Error" }).code(500);
  }
},


async totalhours(req: Request, h: ResponseToolkit) {
  try {
    // Parse and validate request query
    const parsedQuery = getAllClassSheduleInput.parse({
      query: {
        ...((req as any).query), // Casting req.query to 'any' for flexibility
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

    const { studentId } = parsedQuery.query;

    if (!studentId) {
      throw new Error("Student ID is required.");
    }

    // Fetch student class schedule and calculate percentages
    const result = await getStudentClassHours(studentId);

    // Return the response
    return h.response(result).code(200);
  } catch (error) {
    console.error("Error in totalhours:", error);

    // Handle errors properly
    return h.response({ error }).code(400);
  }
},


async teachingActivity(req: Request, h: ResponseToolkit) {
  try {
    // Parse and validate request query
    const parsedQuery = getAllClassSheduleInput.parse({
      query: {
        ...((req as any).query), // Casting req.query to 'any' for flexibility
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

    const { studentId } = parsedQuery.query;

    if (!studentId) {
      throw new Error("Student ID is required.");
    }

    // Fetch student class schedule and calculate percentages
    const result = await teachingActivity(studentId);

    // Return the response
    return h.response(result).code(200);
  } catch (error) {
    console.error("Error in totalhours:", error);

    // Handle errors properly
    return h.response({ error }).code(400);
  }
}
,

async updateteacherreschedule(req: Request, h: ResponseToolkit){
  console.log("Raw Request Payload:", req.payload);
  const { payload } = createInputValidation.parse({
    payload: req.payload,
 });
 console.log("Parsed Payload:", payload);

 const classDayValues = payload.classDay?.map((day: { value: string; label: string }) => day.value);
 const startTimeValues = payload.startTime?.map((time: { value: string; label: string }) => time.value);
 const endTimeValues = payload.endTime?.map((time: { value: string; label: string }) => time.value);


 return await updateteacherreschedule(String(req.params.classSheduleId),{ 
  teacher :{
    teacherId: payload.teacher?.teacherId ?? "",
    teacherName: payload.teacher?.teacherName ?? "",
    teacherEmail: payload.teacher?.teacherEmail ?? ""
  } ,
  classDay :classDayValues,
  package: payload.package,
  preferedTeacher: payload.preferedTeacher,
   course:payload.course,
   sessionClassType: payload.sessionClassType || "",
   sessionStarttime: payload.sessionStarttime || "",
   sessionsEndtime: payload?.sessionsEndtime || "",
   totalHourse: payload.totalHourse,
  startDate: payload.startDate,
  endDate: payload.endDate,
  startTime: startTimeValues,
  endTime: endTimeValues,
  scheduleStatus: "Reschedule",
  studentAttendee: payload.studentAttendee,
  teacherAttendee:payload.teacherAttendee,
 
   }
  );
},

async getStudentClassesCount (req: Request, h: ResponseToolkit){
  return await getStudentClassCount(req.query.studentId);
},

async getTotalClassess(req: Request, h: ResponseToolkit){
    return await getTotalClassesCount(req.query.dateRange as string);
  },

   async getClassesStatusCount(req: Request, h: ResponseToolkit){
      return await getClassesStatusCount();
    },

    async getClassesWiseCount(req: Request, h: ResponseToolkit){
      return await getClassesWiseCount();
    },


    async getTeacherStudentList(req: Request, h: ResponseToolkit) {
      try {
        // Parse and validate the query object
      
        // ✅ Correctly call the database function (not the handler itself)
        return await getStudentList(req.query.teacherId); // Call the actual function fetching data
      } catch (error) {
        console.error("Error in getClassesForTeacher handler:", error);
        throw error; // Handle the error appropriately
      }
    },
    

}












