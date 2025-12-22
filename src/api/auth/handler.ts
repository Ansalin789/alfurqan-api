/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { getAcademicAvaialableTimeList, teacherAvailableTimeList, updateUserPassword } from "../../operations/auth";
import {
  decryptPassword,
  generateAuthToken,
  hashPassword
} from "../../shared/common";
import { isNil, omit } from "lodash";
import { badRequest, notFound, unauthorized } from "@hapi/boom";
import {
  authMessages,
  userMessages,
} from "../../config/messages";
import jwt from "jsonwebtoken";
import { zodAuthenticationSchema } from "../../shared/zod_schema_validation";
import { createActiveSessionRecord, getLatestSessionRecord, updateActiveSessionRecord } from "../../operations/active_session";
import { getActiveUserRecord } from "../../operations/users";
import UserModel from "../../models/users";
import AlStudentsModel from "../../models/alstudents";
import { getActiveStudentRecord } from "../../operations/alstudents";
import ActiveSessionModel from "../../models/active_session";

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
const checkEmailInputValidation = z.object({
  payload: z.object({
    email: z.string().email(),
  }),
});
export default {
  async signIn(req: Request, h: ResponseToolkit) {
    const { payload } = signInInputValidation.parse({
      payload: req.payload,
    });

    const { username, password } = payload;
    let user: any = await getActiveUserRecord({ userName: username });
    // Validate the user exists in either DB
    if (isNil(user)) {
      return badRequest(userMessages.USER_NOT_FOUND);
    }

    // Check password for `user`
    if (user && payload.password !== user.password) {

      return unauthorized(authMessages.INCORRECT_PASSWORD);
    }

    // Determine which record to use
    const activeRecord = user;
  // 🔎 Step 1: Find latest session for this user (by loginDate)
  const latestSession = await ActiveSessionModel.findOne({ userId: String(activeRecord._id) })
    .sort({ loginDate: -1 }) // most recent first
    .exec();

  if (latestSession) {
    // Step 2: If latest session is still active, block login
    // if (latestSession.isActive) {
    //   return unauthorized("User already logged in on another device/session");
    // }
  }

    const jwtPayload = {
      userName: activeRecord.userName ,
      sub: String(activeRecord._id),
    };

    const accessToken = generateAuthToken(jwtPayload);
    const userWithoutPassword = omit(activeRecord, ["password"]);

    // Save the session for logout activity
    await createActiveSessionRecord({
      userId: String(activeRecord._id),
      loginDate: new Date(),
      isActive: true,
      accessToken,
    });

    return {
      ...userWithoutPassword,
      accessToken,
    };
  },


 async studentSignIn(req: Request, h: ResponseToolkit) {
  const { payload } = signInInputValidation.parse({
    payload: req.payload,
  });

  const { username, password } = payload;

  let users = await getActiveStudentRecord({ username });

  console.log("student>>>", users);

  // users is NOW an array
  if (!users || users.length === 0) {
    return badRequest(userMessages.USER_NOT_FOUND);
  }

  // If multiple users found with same username (rare, but possible)
  // You can choose first, or enforce uniqueness
  const activeRecord = users[0];

  // Check password
  if (password !== activeRecord.password) {
    return unauthorized(authMessages.INCORRECT_PASSWORD);
  }

  // Find latest session
  const latestSession = await ActiveSessionModel.findOne({
    userId: String(activeRecord.student.studentId),
  })
    .sort({ loginDate: -1 })
    .exec();

  if (latestSession) {
    console.log("Latest session:", latestSession.loginDate);

    // if (latestSession.isActive) {
    //   return unauthorized("User already logged in on another device/session");
    // }
  }

  const jwtPayload = {
    userName: activeRecord.username,
    sub: String(activeRecord._id),
  };

  const accessToken = generateAuthToken(jwtPayload);

 const usersWithoutPassword = users.map((user) =>
  omit(user, ["password"])
);

  // Save session
  await createActiveSessionRecord({
    userId: String(activeRecord.student.studentId),
    loginDate: new Date(),
    isActive: true,
    accessToken,
  });

  return {
    ...usersWithoutPassword,
    accessToken,
  };
},

 async signOut(req: Request, h: ResponseToolkit) {
  try {
    const { authorization } = req.headers;

    if (!authorization?.startsWith("Bearer ")) {
      return badRequest(authMessages.NO_TOKEN_PROVIDED);
    }
    const token = authorization.replace("Bearer ", "").trim();
    // ✅ Verify token properly
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return unauthorized(authMessages.INVALID_TOKEN);
    }

    // 🔎 Fetch the latest session for this user
    const latestSession: any = await getLatestSessionRecord({
      userId: decodedToken.sub,
    }); 

    if (isNil(latestSession)) {
      return unauthorized(authMessages.TOKEN_NO_LONGER_VALID);
    }

    // 🔒 Ensure token matches the latest session
    if (latestSession.accessToken !== token || !latestSession.isActive) {
      return unauthorized(authMessages.TOKEN_NO_LONGER_VALID);
    }

    // 📝 Update session: set inactive + signedOutAt
    const result = await updateActiveSessionRecord(String(latestSession._id), {
      isActive: false,
      signedOutAt: new Date(),
    });

    if (isNil(result)) {
      return badRequest(authMessages.SIGNOUT_UNSUCCESS);
    }

    return h.response({
      message: authMessages.SIGNOUT_SUCCESS,
      signedOutAt: new Date().toISOString(),
    });

  } catch {
    return badRequest("Something went wrong during signout");
  }
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


  async checkEmail(req: Request, h: ResponseToolkit) {
    const { payload } = checkEmailInputValidation.parse({
      payload: req.payload,
    });
    const { email } = payload;

    try {
      const user = await AlStudentsModel.findOne({ 'student.studentEmail': email }).exec();
      let users: any = await getActiveStudentRecord({ username: user?.username });
        console.log("student>>>", users);

  // users is NOW an array
  if (!users || users.length === 0) {
    return badRequest(userMessages.USER_NOT_FOUND);
  }

  // If multiple users found with same username (rare, but possible)
  // You can choose first, or enforce uniqueness
  const activeRecord = users[0];

  

  // Find latest session
  const latestSession = await ActiveSessionModel.findOne({
    userId: String(activeRecord.student.studentId),
  })
    .sort({ loginDate: -1 })
    .exec();

  if (latestSession) {
    console.log("Latest session:", latestSession.loginDate);

    // if (latestSession.isActive) {
    //   return unauthorized("User already logged in on another device/session");
    // }
  }

  const jwtPayload = {
    userName: activeRecord.username,
    sub: String(activeRecord._id),
  };

  const accessToken = generateAuthToken(jwtPayload);

 const usersWithoutPassword = users.map((user : any) =>
  omit(user, ["password"])
);

  // Save session
  await createActiveSessionRecord({
    userId: String(activeRecord.student.studentId),
    loginDate: new Date(),
    isActive: true,
    accessToken,
  });

  return {
    ...usersWithoutPassword,
     message: 'Email found.',
    accessToken,
  };
    } catch (error) {
      return h.response({
        message: 'Internal Server Error.', error
      }).code(500); // 500 - Internal Server Error
    }
  },


  async allcheckEmail(req: Request, h: ResponseToolkit) {
    const { payload } = checkEmailInputValidation.parse({
      payload: req.payload,
    });
    const { email } = payload;

    try {
      const user = await UserModel.findOne({ 'email': email }).exec();
      let users: any = await getActiveUserRecord({ userName: user?.userName });
      if (isNil(user)) {
        return h.response({
          message: 'Email not found.',
        }).code(404); // 404 - Not Found
      }

      const activeRecord = users;

    const jwtPayload = {
      userName: activeRecord.userName ,
      sub: String(activeRecord._id),
    };

    const accessToken = generateAuthToken(jwtPayload);

    // Save the session for logout activity
    await createActiveSessionRecord({
      userId: String(activeRecord._id),
      loginDate: new Date(),
      isActive: true,
      accessToken,
    });
      
     
      return {
        message: 'Email found.',
        id:users._id,
        username1:activeRecord.userName,
        accessToken,
        role:user.role[0]
      };// 200 - OK
    } catch (error) {
      return h.response({
        message: 'Internal Server Error.',error
      }).code(500); // 500 - Internal Server Error
    }
  },

 async getAcademicAvaialableTime(req: Request, h: ResponseToolkit){
  return getAcademicAvaialableTimeList(req.query.scheduleDate);

 },

   async getTeacherAvaialableTime(req: Request, h: ResponseToolkit){
  return teacherAvailableTimeList(req.query.scheduleDate, req.query.position);

 }
};
