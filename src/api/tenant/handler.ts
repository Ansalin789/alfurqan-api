import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
//import { zodTenantSettingsSchema } from "../../models/tenant_setting";
import {
 // createTenantSettings,
  getActiveTenantRecordByCode,
//  updateTenantDetailsByTenantId,
  //updateTenantSettings,
} from "../../operations/tenant";
import { zodTenantSchema } from "../../models/tenants";

// Input Validation for Create a tenant settings
// const createInputValidation = z.object({
//   payload: zodTenantSettingsSchema.pick({
//     tenantId: true,
//     keyName: true,
//     keyValue: true,
//     isConnected: true,
//     module: true,
//     status: true,
//     createdBy: true,
//     lastUpdatedBy: true,
//   }),
// });

// Input Validations for tenant settings list
const getTenantSettingsListInputValidation = z.object({
  query: zodGetAllRecordsQuerySchema.pick({
    tenantId: true,
    modules: true,
    keyNames: true,
    sortBy: true,
  }),
});

// Input Validation for Update a tenant settings
// const updateInputValidation = z.object({
//   payload: zodTenantSettingsSchema
//     .pick({
//       tenantId: true,
//       keyName: true,
//       keyValue: true,
//       isConnected: true,
//       module: true,
//       status: true,
//       createdBy: true,
//       lastUpdatedBy: true,
//       lastUpdatedDate: true,
//     })
//     .partial(), // Makes all picked fields optional
// });

const updateTenantDetailsInput = z.object({
  payload: zodTenantSchema.pick({
    organizationName: true,
    phoneNumber: true,
    address: true,
    country: true,
    emailId: true,
    faxNo: true,
    gstNo: true,
    panNo: true,
    postalCode: true,
    tenantJobCode: true,
    website: true,
    lastUpdatedDate: true,
    lastUpdatedBy: true
  })
})

export default {
  // Create a new tenant settings
  // async createTenantSettings(req: Request, h: ResponseToolkit) {
  //   const { payload } = createInputValidation.parse({
  //     payload: req.payload,
  //   });

  //   const {
  //     keyName,
  //     keyValue,
  //     isConnected,
  //     module,
  //     status,
  //     createdBy,
  //     lastUpdatedBy,
  //   } = payload;

  //   return createTenantSettings({
  //     tenantId: payload.tenantId,
  //     keyName,
  //     keyValue,
  //     isConnected,
  //     module,
  //     status,
  //     createdBy,
  //     lastUpdatedBy,
  //   });
  // },

  // Retrieve all the tenant settings list
  // async getAllTenantsSettings(req: Request, h: ResponseToolkit) {
  //   const { query } = getTenantSettingsListInputValidation.parse({
  //     query: {
  //       ...req.query,
  //       keyNames: req.query.keyNames ? JSON.parse(req.query.keyNames) : [],
  //       modules: req.query.modules ? JSON.parse(req.query.modules) : []
  //     },
  //   });

  //   // Fetch the tenant settings records using the validated and parsed parameters
  //   return getAllTenantSettingsRecords(query);
  // },

  // Update a tenant settings record
  // async updateTenantSettings(req: Request, h: ResponseToolkit) {
  //   const { payload } = updateInputValidation.parse({
  //     payload: req.payload,
  //   });

  //   let formData = {
  //     ...payload,
  //     tenantId: payload.tenantId,
  //     lastUpdatedDate: new Date(),
  //   };

  //   return updateTenantSettings(String(req.params.tenantSettingsId), formData);
  // },
  async getTenantDetailsByCode(req: Request, h: ResponseToolkit) {
    return getActiveTenantRecordByCode(String(req.params.tenantCode));
  },

  // async updateTenantDetailsById(req: Request, h: ResponseToolkit) {
  //   const { payload } = updateTenantDetailsInput.parse({
  //     payload: req.payload
  //   })
  //   return updateTenantDetailsByTenantId(String(req.params.tenantId), {
  //     ...payload,
  //     lastUpdatedDate: new Date()
  //   });
  // },


};
