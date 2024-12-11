// // import { ResponseToolkit, Request } from "@hapi/hapi";

// // // Assuming you have a function like this to interact with MongoDB
// // const getAllAcademicCoachFromDB = async (filter: object) => {
// //   return await collection.find(filter).toArray(); // Replace 'collection' with your MongoDB collection
// // };

// // const handler = {
// //   async getAllAcademicCoach(req: Request, h: ResponseToolkit) {
// //     // Explicitly cast req.query to a Record<string, any> type
// //     const queryParams = req.query as Record<string, any>;

// //     // Parse the query parameters from the request
// //     const query = {
// //       ...queryParams,
// //       filterValues: queryParams.filterValues
// //         ? JSON.parse(queryParams.filterValues)
// //         : {},
// //     };

// //     // Build the MongoDB query
// //     const mongoQuery = {
// //       ...query,
// //       "academicCoach.academicCoachId": { $ne: null }, // Add condition for academicCoachId
// //     };

// //     // Fetch records from MongoDB using the constructed query
// //     const academicCoaches = await getAllAcademicCoachFromDB(mongoQuery);
// //     return academicCoaches;
// //   },
// // };

// // export default handler;

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { ResponseToolkit, Request } from "@hapi/hapi";
// import { z } from "zod";
// import { zodStudentSchema } from "../../models/student";
// import UserShiftSchedule from "../../models/usershiftschedule"; // Add this import
// import { createStudent, getAllStudentsRecords,getStudentRecordById } from "../../operations/student";
// import { EvaluationStatus } from "../../shared/enum";  
// import {  studentMessages } from "../../config/messages"
// import { notFound } from "@hapi/boom";
// import { isNil } from "lodash";
// import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";






// // Input Validations for student list
// const getStudentsListInputValidation = z.object({
//   query: zodGetAllRecordsQuerySchema.pick({
//     searchText: true,
//     sortBy: true,
//     sortOrder: true,
//     offset: true,
//     limit: true,
//     filterValues: true
//   }),
// });


// async getAllAcademicCoach(req: Request, h: ResponseToolkit) {
//   const { query } = getStudentsListInputValidation.parse({
//     query: {
//       ...req.query,
//       filterValues: req.query?.filterValues ? JSON.parse(req.query.filterValues) : {},
//     },
//   });
//   return getAllAcademicCoachRecords(query);
// },

import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation"; // Assuming this is your schema
import { getAllAcademicCoach } from "../../operations/meetingSchdeule";

// Input Validations for student list
const getmeetingScheduleListInputValidation = z.object({
  query: zodGetAllRecordsQuerySchema.pick({
    searchText: true,
    sortBy: true,
    sortOrder: true,
    offset: true,
    limit: true,
  }),
});

const handler = {
  async getAllAcademicCoach(req: Request, h: ResponseToolkit) {
    try {
      // Explicitly parse and validate the query using zod
      const parsedQuery = getmeetingScheduleListInputValidation.parse({
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
};

export default handler;
