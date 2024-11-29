/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodStudentSchema } from "../../models/student";
import UserShiftSchedule from "../../models/usershiftschedule"; // Add this import


// import {
//   // bulkDeleteUsers,
//  createUser,

//   // deleteUserById,
//   // getAllUserRecords,
//   // getUserRecordById,
//   // updateUser,
// } from "../../operations/users";
import { createStudent } from "../../operations/student";
import { EvaluationStatus } from "../../shared/enum";

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
  createdBy: payload.createdBy,
  lastUpdatedBy: payload.lastUpdatedBy
  })
}
}
