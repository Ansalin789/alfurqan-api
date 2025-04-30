import { Request, ResponseToolkit } from "@hapi/hapi";
import { z } from "zod";
import { zodEmpWagesSchema } from "../../models/empwages";
import { createEmpWages, getEmpWagesById } from "../../operations/empwages";


const createInputValidation = z.object({
  payload: zodEmpWagesSchema.pick({
    employeeId: true,
    employeeName: true,
    classType: true,
    status: true,
    createdDate: true,
    createdBy: true,
    updatedDate: true,
  }),
});

export default {
    async createEmployeeWages(req: Request, h: ResponseToolkit) {
        const { payload } = createInputValidation.parse({
            payload: req.payload,
          });

          return await createEmpWages({  
        employeeId: payload.employeeId,
        employeeName: payload.employeeName,
        classType:{
            className:  payload.classType?.className || " ",
            hoursMins: payload.classType?.hoursMins || " ",
            rate: payload.classType?.rate || "",
            currency: payload.classType?.currency || "",
        },
       status:"Active",
       createdDate:  new Date(),
       createdBy: "Admin",
       updatedDate:  new Date(),
       updatedBy:  "Admin"
        }) 
    },

    // Retrieve all the Evaluation list
         async getAllEmployeeWages(req: Request, h: ResponseToolkit){
                const result = await getEmpWagesById(String(req.params.id));
          
            return result;
              },
      
}

