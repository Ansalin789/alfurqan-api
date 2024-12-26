// Handler object
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { getAllalstudentsList, getalstudentsById } from "../../operations/alstudents";
import { alstudentsMessages } from "../../config/messages";
import { isNil } from "lodash";

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
      const result = await getalstudentsById(String(req.params.alstudentsId));

      // Handle not found case
      if (isNil(result)) {
        return h
          .response({ message: alstudentsMessages.ALFURQANSTUDENTS_NOT_FOUND })
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
  }
};

export { handler };
