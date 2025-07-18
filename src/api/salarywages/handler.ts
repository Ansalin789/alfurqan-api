import { Request, ResponseToolkit } from '@hapi/hapi';
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { z } from "zod";
import { getAllSalaryCardCounts, getAllSalaryList } from '../../operations/salarywages';

const getSalaryInputValidation = z.object({
    query: zodGetAllRecordsQuerySchema.pick({
      searchText: true,
      sortBy: true,
      sortOrder: true,
      offset: true,
      limit: true,
    }),
  });

export default {
    async getAllSalaryList(req: Request, h: ResponseToolkit) {
     const { query } = getSalaryInputValidation.parse({
       query: {
         ...req.query,
         filterValues: req.query?.filterValues ? JSON.parse(req.query.filterValues) : {},
       },
     });
     return getAllSalaryList(query);
   },

   
   async getAllSalaryCard(req: Request, h: ResponseToolkit) {
    const { query } = getSalaryInputValidation.parse({
      query: {
        ...req.query,
        filterValues: req.query?.filterValues ? JSON.parse(req.query.filterValues) : {},
      },
    });
    return getAllSalaryCardCounts(query);
  },
}