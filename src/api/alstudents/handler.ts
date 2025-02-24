// Handler object
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { createAlStudent, getAllalstudentsList, getalstudentsById } from "../../operations/alstudents";
import { alstudentsMessages } from "../../config/messages";
import { isNil } from "lodash";
import { zodAlStudentSchema } from "../../models/alstudents";
import EvaluationModel from "../../models/evaluation"
import student from "../../models/student";


// Input validation schema
const getAllalstudentsListInputValidation = z.object({
  query: zodGetAllRecordsQuerySchema.pick({
    searchText: true,
    sortBy: true,
    sortOrder: true,
    offset: true,
    limit: true,
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
      // Fetch the student by ID
      const studentDetails = await getalstudentsById(String(req.params.alstudentsId));

      console.log(">>>",studentDetails?.student.studentId);
      
      const studentEvaluationDetails = await EvaluationModel.findOne({
        'student.studentId': studentDetails?.student?.studentId
    }).exec();

      // Handle not found case
      if (isNil(studentDetails)) {
        return h
          .response({ message: alstudentsMessages.ALFURQANSTUDENTS_NOT_FOUND })
          .code(404);
      }

      // Return the found student
      return {studentDetails,studentEvaluationDetails};
    } catch (error) {
      // Handle errors (unexpected or other)
      return h
        .response({ error })
        .code(500);
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
};


export { handler };
