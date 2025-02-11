import { ResponseToolkit,Request } from "@hapi/hapi";
import { z } from "zod";
import { zodAlStudentInvoiceSchemaValidation } from "../../shared/zod_schema_validation";
import { getAllStudetnInVoiceList } from "../../operations/invoice";



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
  
  }



