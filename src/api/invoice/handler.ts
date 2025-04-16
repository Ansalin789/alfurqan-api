import { ResponseToolkit,Request } from "@hapi/hapi";
import { z } from "zod";
import { zodAlStudentInvoiceSchemaValidation } from "../../shared/zod_schema_validation";
import { getAllStudetnInVoiceList, getStudetnInVoiceDetailsById } from "../../operations/invoice";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";
import { evaluationMessages } from "../../config/messages";



  const geStudentListInputValidation = z.object({
    query: zodAlStudentInvoiceSchemaValidation.pick({
      sortBy: true,
      sortOrder: true,
      offset: true,
      limit: true,
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

  }