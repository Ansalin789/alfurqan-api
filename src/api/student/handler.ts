/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodStudentSchema } from "../../models/student";
import { createNewCourseForStudent, createStudent, getAllStudentsRecords,getAllStudentVisitor,getStudentRecordByAlfId,getStudentRecordById, StudentFilter } from "../../operations/student";
import { EvaluationStatus ,NumberOfStudents, Status } from "../../shared/enum";  
import {  appStatus, referenceSource, studentMessages } from "../../config/messages"
import { notFound } from "@hapi/boom";
import { isNil } from "lodash";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { academicDashboardCard, academicStudentList } from "../../kafka/producers/academicProducer";
import { IStudentCreate } from "../../../types/models.types";


// Input Validation for Create a User
const createInputValidation = z.object({
  payload: zodStudentSchema.pick({
    firstName: true,
    lastName: true,
    academicCoach: true,
    email: true,
    gender:true,
    phoneNumber: true,
    city: true,
    country: true,
    countryCode: true,
    learningInterest: true,
    numberOfStudents: true,
    preferredTeacher: true,
    preferredFromTime: true,
    preferredToTime: true,
    timeZone: true,
    familyId: true,
    familyEmail: true,
    referralSource: true,
    startDate: true,
    evaluationStatus: true,
    refernceId:true,
    referredBy:true,
    status: true,
    createdBy: true,
    lastUpdatedBy: true,
  }),
});

const addCourseToStudentInputValidation = z.object({
  payload : zodStudentSchema.pick({
    academicCoach: true,
    learningInterest: true,
    preferredTeacher: true,
    preferredFromTime: true,
    preferredToTime: true,
    startDate: true,
  }),
});
// Input Validations for student list
const getStudentsListInputValidation = z.object({
  query: zodGetAllRecordsQuerySchema.pick({
    studentId:true,
    academicCoachId: true,
    searchText: true,
    sortBy: true,
    sortOrder: true,
    offset: true,
    limit: true,
    filterValues: true
  }),
});



export default {
  // Create a new student
  async createStudent(req: Request, h: ResponseToolkit) {
    const { payload } = createInputValidation.parse({
      payload: req.payload,
    });
    
    const sharedFamilyId = payload.familyId || `FAM-${String(Math.floor(1 + Math.random() * 99)).padStart(2, '0')}`;
    const result = await createStudent({     
  firstName: payload.firstName,
  lastName: payload.lastName,
  academicCoach: {
    academicCoachId: payload.academicCoach.academicCoachId
   },
  email: payload.email,
  gender: payload.gender,
  phoneNumber: payload.phoneNumber,
  city: payload.city,
  country: payload.country,
  countryCode: payload.countryCode,
  learningInterest: payload.learningInterest ?? "defaultLearningInterest" ,
  numberOfStudents: Number(payload.numberOfStudents),
  preferredTeacher: payload.preferredTeacher ?? "defaultPreferredTeacher", 
  preferredFromTime: payload.preferredFromTime,
  preferredToTime: payload.preferredToTime,
  timeZone: payload.timeZone,
  familyId: sharedFamilyId,
  familyEmail: payload.familyEmail ?? "defaultFamilyEmail",
  referralSource: payload.referralSource ?? "defaultReferralSource", 
  startDate: payload.startDate ?? new Date(), // Provide a default value for startDate
  evaluationStatus: payload.evaluationStatus ?? EvaluationStatus.PENDING, // Use a valid EvaluationStatus value
  refernceId: payload.refernceId ?? " ",
  referredBy:payload.referredBy ?? " ",
  status: payload.status ?? "defaultStatus", // Provide a default value for status
  createdDate: new Date(),
  createdBy: payload.createdBy,
  lastUpdatedBy: payload.lastUpdatedBy
  })
  if(result){
    const academicCoachId = payload.academicCoach.academicCoachId;
    await academicDashboardCard({academicCoachId});
    await academicStudentList({event : "create", data : result , sender : academicCoachId});
  }
  return result;
},

async addCourseToStudent(req: Request, h: ResponseToolkit) {
  try {
    const { payload } = addCourseToStudentInputValidation.parse({
      payload: req.payload,
    });

    const studentId = String(req.params.studentId);

    const studentRecord = await getStudentRecordByAlfId(
      studentId,
      payload.learningInterest
    );

    if (studentRecord.error) {
      return h
        .response({
          success: false,
          message: studentRecord.error,
        })
        .code(400);
    }
   const coursePayload: IStudentCreate = {
  firstName: studentRecord.student?.firstName ?? "",
  lastName: studentRecord.student?.lastName ?? "",
  academicCoach: {
    academicCoachId: payload.academicCoach.academicCoachId
  },
  email: studentRecord.student?.email ?? "",
  gender: studentRecord.student?.gender ?? "Not Specified",
  phoneNumber: studentRecord.student?.phoneNumber ?? 0,
  city: studentRecord.student?.city ?? "",
  country: studentRecord.student?.country ?? "",
  countryCode: studentRecord.student?.countryCode ?? "",
  learningInterest: payload.learningInterest,
  numberOfStudents: 1,
  preferredTeacher: payload.preferredTeacher ?? "",
  preferredFromTime: payload.preferredFromTime ?? "",
  preferredToTime: payload.preferredToTime ?? "",
  timeZone: studentRecord.student?.timeZone ?? "UTC",
  referralSource: studentRecord.student?.referralSource ?? referenceSource.OTHER,
  startDate: payload.startDate ?? new Date(),
  evaluationStatus: EvaluationStatus.PENDING,
  familyId: studentRecord.student?.familyId ?? "",
  familyEmail: studentRecord.student?.familyEmail ?? "",
  refernceId: studentRecord.student?.refernceId ?? "",
  referredBy: studentRecord.student?.referredBy ?? "",
  status: studentRecord.student?.status ?? appStatus.ACTIVE,
  createdDate: new Date(),
  createdBy: "Student Self",
  lastUpdatedBy: String(new Date())
};


    const result = await createNewCourseForStudent(coursePayload, studentId);

    if (!result) {
      return h
        .response({
          success: false,
          message: "Failed to create new course",
        })
        .code(500);
    }

    const academicCoachId = payload.academicCoach.academicCoachId;
    await academicDashboardCard({ academicCoachId });
    await academicStudentList({
      event: "create",
      data: result,
      sender: academicCoachId,
    });

    return h
      .response({
        success: true,
        message: "Course added successfully",
        data: result,
      })
      .code(200);

  } catch (error) {
    console.error("addCourseToStudent error:", error);

    return h
      .response({
        success: false,
        message: "Internal server error",
      })
      .code(500);
  }
},


// Retrieve all the students list
async getAllStudents(req: Request, h: ResponseToolkit) {
  const { query } = getStudentsListInputValidation.parse({
    query: {
      ...req.query,
      filterValues: req.query?.filterValues ? JSON.parse(req.query.filterValues) : {},
    },
  });
  return getAllStudentsRecords(query);
},


  // Retrieve student details by studentId
async getStudentRecordById(req: Request, h: ResponseToolkit) {
  const result = await getStudentRecordById(String(req.params.studentId));

  if (isNil(result)) {
    return notFound(studentMessages.STUDENTS_NOT_FOUND);
  }

  return result;
},

async getStudentVisitor(req: Request, h: ResponseToolkit) {
  const { query } = getStudentsListInputValidation.parse({
    query: {
      ...req.query,
      filterValues: req.query?.filterValues
        ? JSON.parse(req.query.filterValues as string)
        : {},
    },
  });

  const finalQuery: StudentFilter = {
    ...query,
    offset: query.offset !== undefined && query.offset !== null ? String(query.offset) : null,
    limit: query.limit !== undefined && query.limit !== null ? String(query.limit) : null,
  };
  

  return await getAllStudentVisitor (finalQuery); // Assuming this is your DB call
}


}
 
