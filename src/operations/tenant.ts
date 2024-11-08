import { ITenant } from "../../types/models.types";
import { appStatus } from "../config/messages";
import TenantModel from "../models/tenants";
import { conflict } from "@hapi/boom";
import { Types } from "mongoose";


export interface TenantDetails {
  organizationName: string;
  phoneNumber: string;
  address: string;
  country: string;
  emailId: string;
  faxNo: string;
  gstNo: string;
  panNo: string;
  postalCode: string;
  tenantJobCode: string;
  website: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}


/**
 * Retrieves a tenant record by its tenantCode.
 *
 * @param {string} tenantCode - The tenantCode of the tenant document.
 * @returns {Promise<ITenant | null>} - A promise that resolves to the tenant record or null if not found.
 */
export const getActiveTenantRecordByCode = async (
  tenantCode: string
): Promise<ITenant | null> => {
  return TenantModel.findOne({
    tenantCode,
    status: appStatus.ACTIVE,
  }).lean();
};

/**
 * Updates the tenant details by its ID, ensuring no duplicate organization name or tenant job code exists.
 * 
 * @param {string} tenantId - The ID of the tenant to update.
 * @param {TenantDetails} payload - The details of the tenant to update. It includes organizationName and tenantJobCode.
 * 
 * @returns {Promise<ITenant | null | { message: string }>} 
 * - Returns the updated tenant document if the update is successful.
 * - Returns a conflict message if the organization name or tenant job code already exists.
 * 
 * @throws {Error} - Throws an error if the update operation fails.
 * 
 */
export const updateTenantDetailsByTenantId = async (
  tenantId: string,
  payload: TenantDetails
): Promise<ITenant | null | { message: string }> => {

  const { organizationName, tenantJobCode } = payload;

  // Check Duplicate for OrganizationName (excluding the current tenant)
  const organizationNameDuplicate = await TenantModel.findOne({
    _id: { $ne: new Types.ObjectId(tenantId) }, // Exclude current tenant
    organizationName,
    status: appStatus.ACTIVE,
  }).exec();

  if (organizationNameDuplicate) {
    return conflict('Organization Name already exists');
  }

  // Check Duplicate for TenantJobCode (excluding the current tenant)
  const tenantJobCodeDuplicate = await TenantModel.findOne({
    tenantJobCode, // Corrected to check tenantJobCode, not organizationName
    status: appStatus.ACTIVE,
    _id: { $ne: new Types.ObjectId(tenantId) } // Exclude current tenant
  }).exec();

  if (tenantJobCodeDuplicate) {
    return conflict('Organization Code already exists');
  }

  // Update the tenant details
  return TenantModel.findOneAndUpdate(
    { _id: new Types.ObjectId(tenantId) },
    { $set: payload },
    { new: true } // Return the updated document
  ).lean();
};


/**
 * Retrieves a tenant record by its tenantCode.
 *
 * @param {string} tenantCode - The tenantCode of the tenant document.
 * @returns {Promise<ITenant | null>} - A promise that resolves to the tenant record or null if not found.
 */
export const getActiveTenantRecordByJobCode = async (
  tenantCode: string
): Promise<ITenant | null> => {
  return TenantModel.findOne({
    tenantJobCode: tenantCode,
    status: appStatus.ACTIVE,
  }).lean();
};



/**
 * Creates a new tenant settings.
 *
 * @param {ITenantSettingsPayload} payload - The data of the tenant settings to be created.
 * @returns {Promise<ITenantSettings>} - A promise that resolves to the created tenant settings document.
 */
// export const createTenantSettings = async (
//   payload: ITenantSettingsPayload
// ): Promise<ITenantSettings | Boom> => {
//   const { keyName, tenantId, keyValue } = payload;

//   const recordExists = await TenantSettingsModel.findOne({
//     keyName,
//     tenantId,
//     status: appStatus.ACTIVE,
//   }).exec();

//   if (!isNil(recordExists) && !isEmpty(recordExists)) {
//     return badRequest(tenantsMessages.KEY_ALREADY_EXIST);
//   }

//   let refreshToken: any;
//   if (keyName === tenantsMessages.KEYNAMES[0]) {
//     const refreshTokenData = await generateRefreshToken(keyValue)
//     if (refreshTokenData.data.error) {
//       return badRequest(refreshTokenData.data.error)
//     }
//     refreshToken = refreshTokenData.data.refresh_token;
//   }

//   // Create a new payload with refreshToken
//   let newPayload = {
//     ...payload,
//     keyValue: keyValue
//   };

//   if (keyName !== tenantsMessages.KEYNAMES[6]) {
//     newPayload = {
//       ...newPayload,
//       keyValue: {
//         ...keyValue,
//         refreshToken,
//       },
//     };
//   }


//   // Create a new instance of the TenantSettingsModel with the provided data
//   //const newTenantSettings = new TenantSettingsModel(newPayload);

//   // Save the new user to the database
//   //const savedTenantSettings = await newTenantSettings.save();

//   // Convert the savedTenantSettings to a plain object and return
//   return "newPayload";
// };

/**
 * Retrieves all tenant settings records for a given tenant, with sorting.
 *
 * @param {GetAllRecordsParams} params
 * @returns {Promise<{ tenantSettings: ITenantSettings[]; totalCount: number }>}  - A promise that resolves to an object containing:
 *  - `totalCount`: The total number of tenant settings records matching the query.
 *  - `tenantSettings`: An array of tanant settings records for the given tenant.
 */
// export const getAllTenantSettingsRecords = async (
//   params: GetAllRecordsParams
// ): Promise<{ totalCount: number; tenantSettings: ITenantSettings[] }> => {
//   const { tenantId, modules, keyNames, sortBy } = params;

//   // Log the start of the function execution
//   AppLogger.info(tenantsMessages.GET_ALL_LIST_START, { params });

//   const query: any = {
//     tenantId,
//     status: appStatus.ACTIVE,
//   };

//   if (!isNil(modules) && !isEmpty(modules)) {
//     query.module = { $in: modules };
//   }
//   if (!isNil(keyNames) && !isEmpty(keyNames)) {
//     query.keyName = { $in: keyNames };
//   }

//   const tenantSettingsQuery = TenantSettingsModel.find(query).sort(sortBy);

//   const [tenantSettings, totalCount] = await Promise.all([
//     tenantSettingsQuery.exec(),
//     TenantSettingsModel.countDocuments(query).exec(),
//   ]);

//   // Log the successful retrieval of tenant settings.
//   AppLogger.info(tenantsMessages.GET_ALL_LIST_SUCCESS, { totalCount: totalCount });

//   return { totalCount, tenantSettings };
// };

/**
 * Updates a tenant settings record by their tenantSettingsId.
 *
//  * @param {string} tenantSettingsId - The Object ID of the tenantSettings document.
//  * @param {Partial<ITenantSettingsPayload>} payload - The data to update.
//  * @returns {Promise<ITenantSettings | Boom>} - A promise that resolves to the updated tenantSettings document, or null if not found.
//  */
// export const updateTenantSettings = async (
//   tenantSettingsId: string,
//   payload: Partial<ITenantSettingsPayload>
// ): Promise<ITenantSettings | Boom> => {

//   const { keyName, tenantId, keyValue } = payload;

//   const recordExists = await TenantSettingsModel.findOne({
//     _id: new Types.ObjectId(tenantSettingsId),
//     tenantId,
//     status: appStatus.ACTIVE,
//     keyName
//   }).exec();

//   if (isNil(recordExists) && isEmpty(recordExists)) {
//     return notFound(tenantsMessages.TENANT_SETTINGS_NOT_FOUND);
//   }


//   let newPayload: Partial<ITenantSettingsPayload> = { ...payload };
//   if (keyName === tenantsMessages.KEYNAMES[0] && (!isEqual(recordExists?.keyValue.code, keyValue.code) || !isEqual(recordExists?.keyValue.clientId, keyValue.clientId) || !isEqual(recordExists?.keyValue.clientSecret, keyValue.clientSecret))) {
//     // Generate refreshToken since keyName matches
//     const refreshTokenData = await generateRefreshToken(keyValue); // Always generates the token
//     if (refreshTokenData.data.error) {
//       return badRequest(refreshTokenData.data.error)
//     }
//     // Create a new payload with refreshToken
//     newPayload.keyValue = {
//       ...keyValue,
//       refreshToken: refreshTokenData.data.refresh_token
//       // Include the generated refreshToken
//     };
//   }


//   const result = await TenantSettingsModel.findByIdAndUpdate(
//     { _id: new Types.ObjectId(tenantSettingsId) },
//     { $set: newPayload },
//     { new: true } // Return the updated document
//   ).lean().exec();

//   if (isNil(result) && isEmpty(result)) {
//     return notFound(tenantsMessages.UPDATE_FAILED);
//   }

//   return result as ITenantSettings;
// };


/**
 * Retrieves a tenant record by its tenantCode.
 *
//  * @param {string} tenantSetting - The tenantSetting of the tenantSetting document.
//  * @returns {Promise<ITenantSettings | null>} - A promise that resolves to the tenantSetting record or null if not found.
//  */
// export const getTenantSettingsById = async (
//   tenantSettingId: string
// ): Promise<ITenantSettings | null> => {
//   return TenantSettingsModel.findById({ _id: new Types.ObjectId(tenantSettingId), status: appStatus.ACTIVE }).exec()
// };

