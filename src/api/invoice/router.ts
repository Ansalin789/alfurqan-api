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
      method: "POST",
      path: "/invoice/send",
      handler:handler.sendInvoice,
      options: {
        auth: false, // change based on your needs
        tags: ["api", "invoice"],
        description: "Create and send invoice to DB",
      },
    }   
  ];
  server.route(routes);
};
export = {
  name: "api-invoice",
  register,
};
