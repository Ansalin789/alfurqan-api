// Handler object
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { createAlStudent, getAllalstudentsList, getalstudentsById, getStudentCountriesCount, getStudentPercentage, getStudentRecordCount} from "../../operations/alstudents";
import { alstudentsMessages } from "../../config/messages";
import { isNil } from "lodash";
import { zodAlStudentSchema } from "../../models/alstudents";
import EvaluationModel from "../../models/evaluation"


// Input validation schema
const getAllalstudentsListInputValidation = z.object({
  query: zodGetAllRecordsQuerySchema.pick({
    searchText: true,
    sortBy: true,
    sortOrder: true,
    offset: true,
    limit: true,
    studentId: true,
    filterValues: true,
  }),
});


// Input Validation for Create a User
const createInputValidation = z.object({
  payload: zodAlStudentSchema.pick({
    student: true,
    username: true,
    role: true
  }),
});


// Handler object
const handler = {
  // Handler for getting all students
  async getAllalstudentsList(req: Request, h: ResponseToolkit) {
    try {
      // Parse and validate the request query using zod
      const parsedQuery = getAllalstudentsListInputValidation.parse({
        query: {
          ...req.query,
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
      const result = await getAllalstudentsList(query);

      // Return the response
      return h.response(result).code(200);
    } catch (error) {
      // Handle errors (validation or other errors)
      return h
        .response({ error })
        .code(400);
    }
  },

  // Handler for getting student by ID
  async getalstudentsById(req: Request, h: ResponseToolkit) {
    try {
      // Extract student ID from request params
      const studentId = String(req.params.alstudentsId);
      console.log("Fetching Student ID:", studentId);
  
      // Fetch student details asynchronously
      const studentDetailsPromise = getalstudentsById(studentId);
      const studentDetails = await studentDetailsPromise;
  
      // Handle not found case
      if (isNil(studentDetails)) {
        return h.response({ message: alstudentsMessages.ALFURQANSTUDENTS_NOT_FOUND }).code(404);
      }
  
      console.log("Found Student Details:", studentDetails);
  
      // Fetch student evaluation details asynchronously
      const studentEvaluationDetailsPromise = EvaluationModel.findOne({
        "student.studentId": studentDetails?.student?.studentId,
      }).lean();
      const studentEvaluationDetails = await studentEvaluationDetailsPromise;
  
      console.log("Student Evaluation Details:", studentEvaluationDetails);
  
      // Return the found student details
      return h.response({ studentDetails, studentEvaluationDetails }).code(200);
    } catch (error) {
      console.error("Error fetching student:", error);
  
      return h.response({ message: "Internal Server Error", error }).code(500);
    }
  },

  async createStudentPortal(req: Request, h: ResponseToolkit) {
    // Create a new user
      const { payload } = createInputValidation.parse({
        payload: req.payload,
      });
  
  
      //const hashedPassword = await hashPassword(decryptPassword(password));
  
      return createAlStudent({
        student:{
        studentId: payload.student?.studentId || "",
        studentEmail: payload.student?.studentEmail|| "",
        studentPhone: payload.student?.studentPhone || 0,
        gender: payload.student.gender || "",
        },
        username: payload.username || " ",
        role: payload.role|| " "
      });
    },

     async getAllStudentCount(req: Request, h: ResponseToolkit){
    
          return getStudentRecordCount();
    
     },

     async getStudentGenderCount(req: Request, h: ResponseToolkit){
    
      return getStudentPercentage();

 },
 async getStudentCountryCount(req: Request, h: ResponseToolkit){
  return getStudentCountriesCount();

 }
};


export { handler };
