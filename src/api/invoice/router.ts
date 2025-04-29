import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { evaluationMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
  

    {
      method: "GET",
      path: "/studentinvoice",
      options: {
        handler: handler.getAllStudetnInVoiceList,
        description: evaluationMessages.LIST,
        tags: ["api", "evaluationlist"],
      },
    },
    {
      method: "GET",
      path: "/studentinvoice/{id}",
      options: {
        handler: handler.getStudetnInVoiceDetails,
        tags: ["api", "evaluationlist"],
      },
    },
    {
      method: "GET",
      path: "/studentrevenue",
      options: {
        handler: handler.getAllStudentRevenue,
        description: evaluationMessages.LIST,
        tags: ["api", "evaluationlist"],
      },
    },
    {
      method: "GET",
      path: "/amountbycountry",
      options: {
        handler: handler.getTotalAmountByCountry,
        description: evaluationMessages.LIST,
        tags: ["api", "invoice"],
      },
    },

    {
      method: "GET",
      path: "/amountbycourse",
      options: {
        handler: handler.getTotalAmountByCourse,
        description: evaluationMessages.LIST,
        tags: ["api", "invoice"],
      },
    },
    {
      method: "GET",
      path: "/totalinvoice",
      options: {
        handler: handler.getTotalInvoice,
        description: evaluationMessages.LIST,
        tags: ["api", "invoice"],
      },
    },
    {
      method: "GET",
      path: "/invoicecounts",
      options: {
        handler: handler.getInvoiceCounts,
        description: evaluationMessages.LIST,
        tags: ["api", "invoice"],
      },
    },

    {
      method: "POST",
      path: "/invoice/send",
      handler: handler.sendInvoice,
      options: {
        auth: false, // change based on your needs
        tags: ["api", "invoice"],
        description: "Create and send invoice to DB",
        payload: {
          maxBytes: 10485760, // 10 MB for the payload size
          output: "data",     // for JSON data
          parse: true          // automatically parse the payload
        }
      }
    } ,

    {
      method: "GET",
      path: "/studentinvoice/list",
      options: {
        handler: handler.getallstudentinvoiceList,
        tags: ["api", "knowledgeBase"],
      },
    }
    
    

  ];
  server.route(routes);
};
export = {
  name: "api-invoice",
  register,
};
