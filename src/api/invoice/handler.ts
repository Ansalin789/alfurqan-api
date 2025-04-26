import { ResponseToolkit,Request } from "@hapi/hapi";
import { z } from "zod";
import { zodAlStudentInvoiceSchemaValidation } from "../../shared/zod_schema_validation";
import { getAllStudetnInVoiceList, getStudentAllRevenue, getStudetnInVoiceDetailsById, getTotalAmountByCountry, getTotalAmountByCourse } from "../../operations/invoice";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";
import { evaluationMessages } from "../../config/messages";



  const geStudentListInputValidation = z.object({
    query: zodAlStudentInvoiceSchemaValidation.pick({
      sortBy: true,
      sortOrder: true,
      offset: true,
      limit: true,
      type:true,
      year:true,
    }),
  });


export default {
// Retrieve all the Evaluation list
       getAllStudetnInVoiceList(req: Request, h: ResponseToolkit) {
    const { query } = geStudentListInputValidation.parse({
      query: {
        ...req.query,
      },
    });
    return getAllStudetnInVoiceList(query);
  },

    async getStudetnInVoiceDetails(req: Request, h: ResponseToolkit) {
      const result = await getStudetnInVoiceDetailsById(String(req.params.id));
    
      if (isNil(result)) {
        return notFound(evaluationMessages.EVALUATIONS_NOT_FOUND);
      }
    
      return result;
    },

    async getAllStudentRevenue(req: Request, h: ResponseToolkit) {
      // Parse the query parameters from the request
      const { query } = geStudentListInputValidation.parse({
        query: {
          ...req.query,
        },
      });
    
      // Extract the 'type' or 'dateRange' and 'year' (as a date string) from the parsed query object
      const { type = "year", year = new Date().toISOString().split("T")[0] } = query; // Default to today's date as string
    
      // Call the getStudentAllRevenue function and pass the 'type' (dateRange) and 'year' (as date string)
      const revenueData = await getStudentAllRevenue(type, year);
    
      // Return the revenue data in the response
      return h.response({
        success: true,
        data: revenueData,
      });
    }
    
    
    
    ,

    async getTotalAmountByCountry(req: Request, h: ResponseToolkit) {
      const { query } = geStudentListInputValidation.parse({
        query: {
          ...req.query,
        },
      });
    
      return getTotalAmountByCountry(query.type); // ✅ Only pass `type`
    },
    
    async getTotalAmountByCourse(req: Request, h: ResponseToolkit) {
      const { query } = geStudentListInputValidation.parse({
        query: {
          ...req.query,
        },
      });
    
      return getTotalAmountByCourse(query.type); // ✅ Only pass `type`
    }
    
    }
    
    
    