/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { decryptPassword, hashPassword } from "../../shared/common";
import { badRequest, notFound } from "@hapi/boom";
import { isEmpty, isNil } from "lodash";
import {
  appRegexPatterns,
  commonMessages,
  userMessages,
} from "../../config/messages";
import { zodUserSchema } from "../../models/users";
import { zodGetAllRecordsQuerySchema, zodGetAllUserRecordsQuerySchema } from "../../shared/zod_schema_validation";
import {
  bulkDeleteUsers,
  createUser,
  deleteUserById,
  getAllUserRecords,
  getUserRecordById,
  updateUser,
} from "../../operations/users";
import { GetAlluserRecordsParams } from "../../shared/enum";



// Input Validations for users list
let getUsersListInputValidation = z.object({
  query: zodGetAllUserRecordsQuerySchema.pick({
    role: true,
    date: true
  })
});


const getUsersBulkDeleteInputValidation = z.object({
  payload: z.object({
    users: z
      .array(
        z
          .string()
          .regex(appRegexPatterns.OBJECT_ID, commonMessages.INVALID_OBJECT_ID)
      )
      .min(1),
  }),
});

// Input Validation for Create a User
const createInputValidation = z.object({
  payload: zodUserSchema.pick({
    userName: true,
    email: true,
    password: true,
    role: true,
    profileImage: true,
    status: true,
    createdBy: true,
    lastUpdatedBy: true,
  }),
});

// Input Validation for Update a User
const updateInputValidation = z.object({
  payload: zodUserSchema
    .pick({
      userName: true,
      email: true,
      password: true,
      role: true,
      profileImage: true,
      status: true,
      createdBy: true,
      lastUpdatedBy: true,
      lastUpdatedDate: true,
    })
    .partial(), // Makes all picked fields optional
});

// export default {
//   // Retrieve all the users list
//   async getAllUsers(req: Request, h: ResponseToolkit) {
//     const { query } = getUsersListInputValidation.parse({
//       query: req.query,
//     });

//     // Fetch the user records using the validated and parsed parameters
//     return getAllUserRecords(query);
//   },

 export default {
  // // Retrieve all the users list with role and date filters
  async getAllUsers(req: Request, h: ResponseToolkit) {
    try {
      // Parse and validate the query parameters
      const { query } = getUsersListInputValidation.parse({
        query: req.query,
      });

      const { role, date } = query;

      // Build the filter object
      const filter: GetAlluserRecordsParams = {
        role,
        date: ""
      };
      if (date) {
        filter.date = date;
      }

      // Fetch user records using the filter
      const result = await getAllUserRecords(filter);

      return result;
    } catch (error) {
      console.error("Validation Error:", error);
      return badRequest("Validation error: ");
    }
  },


  // Retrieve user details by userId
  async getUserRecordById(req: Request, h: ResponseToolkit) {
    const result = await getUserRecordById(String(req.params.userId));

    if (isNil(result)) {
      return notFound(userMessages.USER_NOT_FOUND);
    }

    return result;
  },

  // Create a new user
  async createUser(req: Request, h: ResponseToolkit) {
    const { payload } = createInputValidation.parse({
      payload: req.payload,
    });

    const {
      userName,
      email,
      password,
      role,
      profileImage,
      status,
      createdBy,
      lastUpdatedBy,
    } = payload;

    //const hashedPassword = await hashPassword(decryptPassword(password));

    return createUser({
      userName,
      email,
      password,
      role,
      profileImage: profileImage ?? null,
      status,
      createdBy,
      lastUpdatedBy,
    });
  },

  // Update a user
  async updateUser(req: Request, h: ResponseToolkit) {
    const validationResult = updateInputValidation.parse({
      payload: req.payload,
    });

    const { tenantid } = req.headers;
    const { password } = validationResult.payload;

    let formData = {
      ...validationResult.payload,
      tenantId: tenantid as string,
      lastUpdatedDate: new Date(),
    };

    if (!isNil(password) && !isEmpty(password)) {
      const hashedPassword = await hashPassword(decryptPassword(password));

      formData = {
        ...formData,
        password: hashedPassword,
      };
    }

    const result = await updateUser(String(req.params.userId), formData);

    if (isNil(result)) {
      return notFound(userMessages.USER_NOT_FOUND);
    }
    return result;
  },

  // Delete user by userId
  async deleteUserById(req: Request, h: ResponseToolkit) {
    const result = await deleteUserById(String(req.params.userId));

    if (isNil(result)) {
      return notFound(userMessages.USER_NOT_FOUND);
    }
    return result;
  },

  // Bulk Delete users by userIds
  async bulkDeleteUsersById(req: Request, h: ResponseToolkit) {
    const validationResult = getUsersBulkDeleteInputValidation.parse({
      payload: req.payload,
    });

    const { users } = validationResult.payload;

    const result = await bulkDeleteUsers(users);

    if (isNil(result) || result.length === 0) {
      return notFound(userMessages.USER_NOT_FOUND);
    }

    return result;
  },
};