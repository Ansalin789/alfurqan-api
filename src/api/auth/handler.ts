/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { updateUserPassword } from "../../operations/auth";
import {
  decryptPassword,
  generateAuthToken,
  hashPassword,
  verifyPassword,
} from "../../shared/common";
import { isNil, omit } from "lodash";
import { badRequest, notFound, unauthorized } from "@hapi/boom";
import {
  authMessages,
  userMessages,
} from "../../config/messages";
import jwt from "jsonwebtoken";
import { zodAuthenticationSchema } from "../../shared/zod_schema_validation";
import { createActiveSessionRecord, getActiveSessionRecord, updateActiveSessionRecord } from "../../operations/active_session";
import { getActiveUserRecord, updateUser } from "../../operations/users";


// Input validation for user signin
const signInInputValidation = z.object({
  payload: zodAuthenticationSchema.pick({
    username: true,
    password: true,
  }),
});

// Input Validation for Change password
const changePasswordInputValidation = z.object({
  payload: zodAuthenticationSchema.pick({
    password: true,
  }),
});

export default {
  async signIn(req: Request, h: ResponseToolkit) {
    const { payload } = signInInputValidation.parse({
      payload: req.payload,
    });

    const { username, password } = payload;

    let user: any = await getActiveUserRecord({ userName: username });
    console.log("user>>>", user);
    // Validate the user exists in the DB
    if (isNil(user)) {
      return badRequest(userMessages.USER_NOT_FOUND);
    }

    
    if (payload.password != user.password) {
      console.log("password>>>", password);
      return unauthorized(authMessages.INCORRECT_PASSWORD);
    }
    const jwtPayload = {
      userName: user.userName,
      sub: String(user._id),
    };
    const accessToken = generateAuthToken(jwtPayload);
    const userWithoutPassword = omit(user, ["password"]);

    await updateUser(String(user._id), { lastLoginDate: new Date() });
    //     // Save the session for logout activity
    await createActiveSessionRecord({
      userId: String(user._id),
      loginDate: new Date(),
      isActive: true,
      accessToken,
    });
    return {
      ...userWithoutPassword,
      accessToken,
    };
  },

  async signOut(req: Request, h: ResponseToolkit) {
    const { authorization } = req.headers;

    // Check if Authorization header is present and starts with 'Bearer '
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return badRequest(authMessages.NO_TOKEN_PROVIDED);
    }

    const token = authorization.replace("Bearer ", "");

    const decodedToken: any = jwt.decode(token);

    if (!decodedToken) {
      return unauthorized(authMessages.INVALID_TOKEN);
    }
    const checkAuthToken: any = await getActiveSessionRecord({
      accessToken: token,
      isActive: true,
      userId: decodedToken.sub,
    });

    // Check the provided token exists in the database
    if (isNil(checkAuthToken)) {
      return unauthorized(authMessages.TOKEN_NO_LONGER_VALID);
    }

    const result = await updateActiveSessionRecord(String(checkAuthToken._id), { isActive: false });

    if (isNil(result)) {
      return badRequest(authMessages.SIGNOUT_UNSUCCESS);
    }

    return h
      .response({ message: authMessages.SIGNOUT_SUCCESS });
  },

  // User's Change Password
  async changePassword(req: Request, h: ResponseToolkit) {
    const { payload } = changePasswordInputValidation.parse({
      payload: req.payload,
    });

    const { password } = payload;

    const hashedPassword = await hashPassword(decryptPassword(password));

    const result = await updateUserPassword(
      String(req.params.userId),
      hashedPassword
    );

    if (isNil(result)) {
      return notFound(userMessages.USER_NOT_FOUND);
    }

    return result;
  },
};
