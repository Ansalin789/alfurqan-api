/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodStudentSchema } from "../../models/student";
import UserShiftSchedule from "../../models/usershiftschedule"; // Add this import
import { createStudent, getAllStudentsRecords,getStudentRecordById } from "../../operations/student";
import { EvaluationStatus } from "../../shared/enum";  
import {  studentMessages } from "../../config/messages"
import { notFound } from "@hapi/boom";
import { isNil } from "lodash";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";


// import {
//   // bulkDeleteUsers,
//  createUser,

//   // deleteUserById,
//   // getAllUserRecords,
//   // getUserRecordById,
//   // updateUser,
// } from "../../operations/users";


// // Input Validations for users list
// const getUsersListInputValidation = z.object({
//   query: zodGetAllRecordsQuerySchema.pick({
//     tenantId: true,
//     searchText: true,
//     sortBy: true,
//     sortOrder: true,
//     offset: true,
//     limit: true,
//   }),
// });

// const getUsersBulkDeleteInputValidation = z.object({
//   payload: z.object({
//     users: z
//       .array(
//         z
//           .string()
//           .regex(appRegexPatterns.OBJECT_ID, commonMessages.INVALID_OBJECT_ID)
//       )
//       .min(1),
//   }),
// });


// Input Validation for Create a User
const createInputValidation = z.object({
  payload: zodStudentSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
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
    referralSource: true,
    startDate: true,
    evaluationStatus: true,
    status: true,
    createdBy: true,
    lastUpdatedBy: true,
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
    return createStudent({     
  firstName: payload.firstName,
  lastName: payload.lastName,
  email: payload.email,
  phoneNumber: payload.phoneNumber,
  city: payload.city,
  country: payload.country,
  countryCode: payload.countryCode,
  learningInterest: payload.learningInterest || "defaultLearningInterest" ,
  numberOfStudents: payload.numberOfStudents || 1, 
  preferredTeacher: payload.preferredTeacher || "defaultPreferredTeacher", 
  preferredFromTime: payload.preferredFromTime,
  preferredToTime: payload.preferredToTime,
  timeZone: payload.timeZone,
  referralSource: payload.referralSource || "defaultReferralSource", 
  startDate: payload.startDate || new Date(), // Provide a default value for startDate
  evaluationStatus: payload.evaluationStatus || EvaluationStatus.PENDING, // Use a valid EvaluationStatus value
  status: payload.status || "defaultStatus", // Provide a default value for status
  createdDate: new Date(),
  createdBy: payload.createdBy,
  lastUpdatedBy: payload.lastUpdatedBy
  })
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
}
 
// export const getFilteredStudents = async ({
//   country,
//   course,
//   teacher,
//   status,
//   offset = 1,
//   limit = 10,
// }: {
//   country?: string;
//   course?: string;
//   teacher?: string;
//   status?: string;
//   offset?: number;
//   limit?: number;
// }) => {
//   try {
//     // Build query filters dynamically
//     const filters: any = {};
//     if (country) filters.country = country;
//     if (course) filters.course = course;
//     if (teacher) filters.teacher = teacher;
//     if (status) filters.status = status;

//     // Simulate database query with filters, offset, and limit
//     const students = await zodStudentSchema.find(filters)
//       .skip(offset)
//       .limit(limit);

//     return students;
//   } catch (error) {
//     console.error("Error fetching filtered students:", error);
//     throw new Error("Failed to fetch students");
//   }
// };
