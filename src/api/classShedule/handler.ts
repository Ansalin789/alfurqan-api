import { ResponseToolkit,Request } from "@hapi/hapi";
import classShedule, { zodClassScheduleSchema } from "../../models/classShedule";
import { z } from "zod";
import { ClassSchedulesMessages } from "../../config/messages";
import { isNil } from "lodash";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { notFound } from "@hapi/boom";
import { getAllClassShedule, getAllClassSheduleById, updateClassscheduleById, updateStudentClassSchedule,getClassesForStudent,getClassesForTeacher, getStudentClassHours, teachingActivity, updateteacherreschedule, getStudentClassCount, getTotalClassesCount, getClassesStatusCount, getClassesWiseCount, getStudentList, getTeacherAttendanceSummary, teacherStudentCount, getgetAnalyticscardCalculation, requestReschedule} from "../../operations/classschedule";
import { academicAvailableTeachers, academicDashboardTeachersStudentCount, academicStudentReSchedule, academicTeacherStudentList } from "../../kafka/producers/academicProducer";
import AlStudentModule from "../../models/alstudents"
import Evaluation from "../../models/evaluation";
import { Types } from "mongoose";
import { evaluationTeacherSlotBook } from "../../redis/handler/teacherSlotHander";
import { teacherDashboardCardCount } from "../../kafka/producers/teacherProducer";
import alstudents from "../../models/alstudents";

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
// async createandUpdateSchedule(req: Request, h: ResponseToolkit){
//     console.log("Raw Request Payload:", req.payload);
//     const { payload } = createInputValidation.parse({
//       payload: req.payload,
//    });
//    console.log("Parsed Payload:", payload);

//    const classDayValues = payload.classDay?.map((day: { value: string; label: string }) => day.value);
//    const startTimeValues = payload.startTime?.map((time: { value: string; label: string }) => time.value);
//    const endTimeValues = payload.endTime?.map((time: { value: string; label: string }) => time.value);

//    return await updateStudentClassSchedule(String(req.params.studentId),{ 
//     teacher :{
//       teacherId: payload.teacher?.teacherId ?? "",
//       teacherName: payload.teacher?.teacherName ?? "",
//       teacherEmail: payload.teacher?.teacherEmail ?? ""
//     } ,
//     classDay :classDayValues,
//     package: payload.package,
//     preferedTeacher: payload.preferedTeacher,
//     // course:payload.course,
//      sessionClassType: payload.sessionClassType || "",
//      sessionStarttime: payload.sessionStarttime || "",
//      sessionsEndtime: payload?.sessionsEndtime || "",
//      sessionStatus:"NotCompleted",
//      totalHourse: payload.totalHourse,
//     startDate: payload.startDate,
//     endDate: payload.endDate,
//     startTime: startTimeValues,
//     endTime: endTimeValues,
//     scheduleStatus: payload.scheduleStatus,
//     studentAttendee: payload.studentAttendee,
//     teacherAttendee:payload.teacherAttendee,
   
//      }
//     );


//   }
// ,


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
  let filterValues: any = {};

  // 1. Parse filterValues from query if present as a string
  if (typeof req.query.filterValues === "string") {
    try {
      filterValues = JSON.parse(req.query.filterValues);
    } catch {
      filterValues = {};
    }
  } else {
    filterValues = {};

    // --- Normalize course filter ---
    if (req.query.course) {
      filterValues.course = {
        courseName: Array.isArray(req.query.course)
          ? req.query.course
          : [req.query.course]
      };
    }

    // --- Normalize sessionClassType filter ---
    if (req.query.sessionClassType) {
      filterValues.sessionClassType = Array.isArray(req.query.sessionClassType)
        ? req.query.sessionClassType
        : [req.query.sessionClassType];
    }

    // --- Normalize scheduleStatus filter ---
    if (req.query.scheduleStatus) {
      filterValues.scheduleStatus = Array.isArray(req.query.scheduleStatus)
        ? req.query.scheduleStatus
        : [req.query.scheduleStatus];
    }

    // --- Normalize startTime filter ---
    if (req.query.startTime) {
      filterValues.startTime = Array.isArray(req.query.startTime)
        ? req.query.startTime
        : [req.query.startTime];
    }

    // --- Normalize dateRange filter ---
    if (req.query["dateRange.from"] && req.query["dateRange.to"]) {
      filterValues.dateRange = {
        from: req.query["dateRange.from"],
        to: req.query["dateRange.to"]
      };
    }
  }

  // 3. Build the full query object for validation
  const queryObj = {
    ...req.query,
    filterValues,
  };

  // 4. Validate the query parameters using Zod
  const { query } = getAllClassSheduleInput.parse({ query: queryObj });

  // 5. Ensure offset and limit are strings or null
  const queryForService = {
    ...query,
    offset:
      query.offset !== null && query.offset !== undefined
        ? String(query.offset)
        : null,
    limit:
      query.limit !== null && query.limit !== undefined
        ? String(query.limit)
        : null,
  };

  // 6. Call the service with the normalized and validated query
  return getAllClassShedule(queryForService);
}


,

  // Handler for getting student by ID
  async getAllClassSheduleById(req: Request, h: ResponseToolkit) {
    try {
      // Fetch the student by ID
      const result = await getAllClassSheduleById(String(req.params.classSheduleId));

      // Handle not found case
      if (isNil(result)) {
        return h
          .response({ message: ClassSchedulesMessages.NOT_FOUND })
          .code(404);
      }

      // const getLevel = await alstudents
      //   .findOne({ _id: result.student.studentId })
      //   .exec();

      // const response = { result, level: getLevel?.level };
      // Return the found student
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
        level: payload.student?.level ?? ""
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
    if(result){
      await academicStudentReSchedule({data : result});
       await academicAvailableTeachers({ event : "update" , data :{ date :payload.startDate , teacherId :payload.teacher?.teacherId , from  : startTimeValues , to : endTimeValues}}); 
        if(payload.teacher?.teacherId){
               await teacherDashboardCardCount({sender : payload.teacher?.teacherId });
            }
      }

    return result;
   },

async getTeacherStudentCount(req: Request, h: ResponseToolkit) {
  try {
    console.log("Query parameters received:", req.query);
    const teachers = await teacherStudentCount();
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


 const classReschudle = await updateteacherreschedule(String(req.params.classSheduleId),{ 
  teacher :{
    teacherId: payload.teacher?.teacherId ?? "",
    teacherName: payload.teacher?.teacherName ?? "",
    teacherEmail: payload.teacher?.teacherEmail ?? ""
  } ,
  classDay :classDayValues,
  package: payload.package,
  preferedTeacher: payload.preferedTeacher,
  // course:payload.course,
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
  if(classReschudle){
    await academicAvailableTeachers({ event : "update" , data :{ date :payload.startDate , teacherId :payload.teacher?.teacherId , from  : startTimeValues , to : endTimeValues}});
    await academicStudentReSchedule({ data: classReschudle });
  }
  return classReschudle;
  
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
    
async getStudentsAttendanceCounts(req: Request, h: ResponseToolkit) {
  try {
    const teacherId = req.query.teacherId as string;

    if (!teacherId) {
      return h.response({ message: "Missing teacherId in query" }).code(400);
    }

    const data = await getTeacherAttendanceSummary(teacherId);
    return h.response(data).code(200);
  } catch (error) {
    console.error("Error in getStudentsAttendanceCounts handler:", error);
    return h.response({ message: "Internal Server Error" }).code(500);
  }
},
//analytics card count

async getAnalyticscardcount(req: Request, h: ResponseToolkit) {
  try {
    const teacherId = req.query.teacherId as string;

    if (!teacherId) {
      return h.response({ message: "Missing teacherId in query" }).code(400);
    }

    const data = await getgetAnalyticscardCalculation(teacherId);
    return h.response(data).code(200);
  } catch (error) {
    console.error("Error in getStudentsAttendanceCounts handler:", error);
    return h.response({ message: "Internal Server Error" }).code(500);
  }
},


async bulkcreateandSchedule(req: Request, h: ResponseToolkit) {
  try {
    console.log("Raw Request Payload:", req.payload);

    const { payload } = createInputValidation.parse({
      payload: req.payload,
    });

       const rawPayload = req.payload as any;

    console.log("Parsed Payload:", payload);
     const randomFourDigitStr = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      const meetingId = `ALF-GRPCLASS-${randomFourDigitStr}`;

 const students:any = rawPayload.students || []; 
 const alfurqanStudents = await AlStudentModule.findOne({_id:new Types.ObjectId(students[0].studentId)} ).exec();   // 🧠 Extract reference values from the first student
 const evaluation = await Evaluation.findOne({ ["student.studentId"]: alfurqanStudents?.student.studentId }).exec();
 const refCourse = alfurqanStudents?.student?.course ;
  const refPackage = alfurqanStudents?.student?.package;
  const refTotalHourse = evaluation?.hours;
 
  // ✅ Validate that all students match the same course, package, and hours
  for (const student of students) {
    const alfurqanStudent = await AlStudentModule.findOne({_id: new Types.ObjectId(student.studentId)} ).exec()  // 🧠 Extract reference values from the first student
 const evaluation = await Evaluation.findOne({ ["student.studentId"]: alfurqanStudents?.student.studentId }).exec();
    if (
     alfurqanStudent?.student.course !== refCourse,
      alfurqanStudent?.student.package !== refPackage ,
      evaluation?.hours !== refTotalHourse
    ) {
     return h.response({
      status: "error",
      message: `All students must have the same course, package, and total hours. Mismatch found in student ${student.studentId || student.studentEmail}`
    }).code(400);
    }
  }

    // Extract mapped values from dropdowns
    const classDayValues = payload.classDay?.map((day: { value: string; label: string }) => day.value);
    const startTimeValues = payload.startTime?.map((time: { value: string; label: string }) => time.value);
    const endTimeValues = payload.endTime?.map((time: { value: string; label: string }) => time.value);

    // Prepare common scheduling details
    const commonScheduleData = {
      teacher: {
        teacherId: payload.teacher?.teacherId ?? "",
        teacherName: payload.teacher?.teacherName ?? "",
        teacherEmail: payload.teacher?.teacherEmail ?? ""
      },
      classLink: meetingId,
      classDay: classDayValues,
      package: alfurqanStudents?.student.package,
      preferedTeacher: payload.preferedTeacher,
      weeklySlots:rawPayload.weeklySlots,
      sessionClassType: payload.sessionClassType || "",
      sessionStarttime: payload.sessionStarttime || "",
      sessionsEndtime: payload.sessionsEndtime || "",
      sessionStatus: "NotCompleted",
      totalHourse: Number(evaluation?.accomplishmentTime) ,
      startDate: payload.startDate,
      endDate: payload.endDate,
      startTime: startTimeValues,
      endTime: endTimeValues,
      scheduleStatus: payload.scheduleStatus,
      studentAttendee: payload.studentAttendee,
      teacherAttendee: payload.teacherAttendee
    };

      if (
  payload.startDate instanceof Date &&
  !isNaN(payload.startDate.getTime()) &&
  rawPayload.weeklySlots &&
  Object.keys(rawPayload.weeklySlots).length > 0 &&
  typeof payload.teacher?.teacherId === "string" &&
  payload.teacher.teacherId.trim() !== ""
) {
  await evaluationTeacherSlotBook(
    payload.startDate.toISOString(),
    rawPayload.weeklySlots,
    payload.teacher.teacherId.trim()
  );
}


    const allResults = [];
    if(rawPayload.students){
  for (const student of rawPayload.students) {
    console.log("student>>>", student)
      const result = await updateStudentClassSchedule(student.studentId || "", {
        ...commonScheduleData,
        student 
      });
      if(result){
        const classType = payload?.sessionClassType
        await academicTeacherStudentList({data : {assignedTeacherId : payload.teacher?.teacherId }});
        await academicDashboardTeachersStudentCount({classType});
        if(payload.teacher?.teacherId){
               await teacherDashboardCardCount({sender : payload.teacher?.teacherId });
          }
      }
       
      allResults.push({
        studentId: student.studentId,
        result
      });
    }
    }
    return h.response({
      status: "success",
      message: "Class schedule created for all students.",
      data: allResults
    }).code(200);

  } catch (error: any) {
    console.error("Bulk scheduling error:", error);
    return h.response({
      status: "error",
      message: error?.message || "Something went wrong while scheduling classes."
    }).code(500);
  }
},

async requestReschedule (req : Request , h :ResponseToolkit){
   try {
    const payload = req.payload;
    console.log("Parsed Payload:", payload);
    const result = await requestReschedule(payload);
    return h.response(result).code(result.success ? 200 : 400);
  } catch (err: any) {
    console.error("Error in requestRescheduleHandler:", err.message);
    return h.response({
      success: false,
      message: "Internal server error",
    }).code(500);
  }
} 

}












