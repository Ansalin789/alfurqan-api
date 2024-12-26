import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";

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
  async getAllalstudentsList(req: Request, h: ResponseToolkit) {
    try {
      // Parse and validate the request query using zod
      const parsedQuery = getAllalstudentsListInputValidation.parse({
        query: {
          ...req.query,
          filterValues: req.query?.filterValues
            ? JSON.parse(req.query.filterValues as string)
            : {},
        },
      });

      const query = parsedQuery.query;

      // Call your service or database function to fetch data
      const result = await fetchAllAlstudents(query); // Replace with your actual service function

      // Return the response
      return h.response(result).code(200);
    } catch (error) {
      // Handle errors (validation or other errors)
      return h
        .response({ error: error.message  })
        .code(400);
    }
  },
};

export { handler };
