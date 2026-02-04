/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { getAcademicAvaialableTimeList, teacherAvailableTimeList, updateUserPassword } from "../../operations/auth";
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
import { createActiveSessionRecord, getActiveSessionRecord, getLatestSessionRecord, updateActiveSessionRecord } from "../../operations/active_session";
import { getActiveUserRecord, updateUser } from "../../operations/users";
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
    console.log("user>>>", `${username} ${password}`);

    let user: any = await getActiveUserRecord({ userName: username });

    console.log("user>>>", user);

    // Validate the user exists in either DB
    if (isNil(user)) {
      return badRequest(userMessages.USER_NOT_FOUND);
    }

    // Check password for `user`
    if (user && payload.password !== user.password) {
      console.log("password>>>", password);
      return unauthorized(authMessages.INCORRECT_PASSWORD);
    }



    // Determine which record to use
    const activeRecord = user;
  // 🔎 Step 1: Find latest session for this user (by loginDate)
  const latestSession = await ActiveSessionModel.findOne({ userId: String(activeRecord._id) })
    .sort({ loginDate: -1 }) // most recent first
    .exec();

  if (latestSession) {
    console.log("Latest session:", latestSession.loginDate);

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
    console.log("accessToken:",accessToken)
  //  await updateUser(String(activeRecord._id), { lastLoginDate: new Date() });

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
    console.log("user>>>", `${username} ${password}`);

    let users: any = await getActiveStudentRecord({ username: username });

    console.log("student>>>", users);

    // Validate the user exists in either DB
    if (isNil(users)) {
      return badRequest(userMessages.USER_NOT_FOUND);
    }



    // Check password for `users`
    if (users && payload.password !== users.password) {
      console.log("password>>>", password);
      return unauthorized(authMessages.INCORRECT_PASSWORD);
    }

    // Determine which record to use
    const activeRecord = users;
    // 🔎 Step 1: Find latest session for this user (by loginDate)
  const latestSession = await ActiveSessionModel.findOne({ userId: String(activeRecord._id) })
    .sort({ loginDate: -1 }) // most recent first
    .exec();

  if (latestSession) {
    console.log("Latest session:", latestSession.loginDate);

    // Step 2: If latest session is still active, block login
    // if (latestSession.isActive) {
    //   return unauthorized("User already logged in on another device/session");
    // }
  }
    const jwtPayload = {
      userName:  activeRecord.username,
      sub: String(activeRecord._id),
    };

    const accessToken = generateAuthToken(jwtPayload);
    const userWithoutPassword = omit(activeRecord, ["password"]);
    console.log("accessToken:",accessToken)
  //  await updateUser(String(activeRecord._id), { lastLoginDate: new Date() });

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


 async signOut(req: Request, h: ResponseToolkit) {
  try {
    const { authorization } = req.headers;
    console.log("🔑 Authorization header:", authorization);

    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.log("❌ No Bearer token provided");
      return badRequest(authMessages.NO_TOKEN_PROVIDED);
    }

    const token = authorization.replace("Bearer ", "").trim();
    console.log("📌 Extracted Token:", token);

    // ✅ Verify token properly
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
      console.log("✅ Decoded & Verified Token:", decodedToken);
    } catch (err: any) {
      console.error("❌ JWT verification failed:", err.message);
      return unauthorized(authMessages.INVALID_TOKEN);
    }

    // 🔎 Fetch the latest session for this user
    const latestSession: any = await getLatestSessionRecord({
      userId: decodedToken.sub,
    }); 
    // 👉 `getLatestSessionRecord` should internally sort by `signedInAt` desc or `createdAt` desc and pick one

    console.log("🔍 Latest session lookup:", latestSession);

    if (isNil(latestSession)) {
      console.log("❌ No session found for user");
      return unauthorized(authMessages.TOKEN_NO_LONGER_VALID);
    }

    // 🔒 Ensure token matches the latest session
    if (latestSession.accessToken !== token || !latestSession.isActive) {
      console.log("❌ Token is not the latest active session");
      return unauthorized(authMessages.TOKEN_NO_LONGER_VALID);
    }

    // 📝 Update session: set inactive + signedOutAt
    const result = await updateActiveSessionRecord(String(latestSession._id), {
      isActive: false,
      signedOutAt: new Date(),
    });
    console.log("📝 Update session result:", result);

    if (isNil(result)) {
      console.log("❌ Failed to update session");
      return badRequest(authMessages.SIGNOUT_UNSUCCESS);
    }

    console.log("✅ Signout successful for user:", decodedToken.sub, "at", new Date().toISOString());
    return h.response({
      message: authMessages.SIGNOUT_SUCCESS,
      signedOutAt: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error("🔥 Unexpected error in signOut:", err);
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
console.log(">>>>email", payload.email);
    const { email } = payload;

    try {
      const user = await AlStudentsModel.findOne({ 'student.studentEmail': email }).exec();
      let users: any = await getActiveStudentRecord({ username: user?.username });

      console.log("Users>>",users._id);
      console.log("User>>",user);
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
    console.log("accessToken:",accessToken)
  //  await updateUser(String(activeRecord._id), { lastLoginDate: new Date() });

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
        username1:user.username,
        accessToken,
        role:user.role,
        package:user.student.package
      };// 200 - OK
    } catch (error) {
      return h.response({
        message: 'Internal Server Error.',
      }).code(500); // 500 - Internal Server Error
    }
  },


  async allcheckEmail(req: Request, h: ResponseToolkit) {
    const { payload } = checkEmailInputValidation.parse({
      payload: req.payload,
    });
    console.log(">>>>email", payload.email);
    const { email } = payload;

    try {
      const user = await UserModel.findOne({ 'email': email }).exec();
      let users: any = await getActiveUserRecord({ userName: user?.userName });
      
      console.log("Users>>",users._id);
      console.log("User>>",user);
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
    console.log("accessToken:",accessToken)
  //  await updateUser(String(activeRecord._id), { lastLoginDate: new Date() });

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
        userId : user._id,
        username1:activeRecord.userName,
        accessToken,
        role:user.role[0]
      };// 200 - OK
    } catch (error) {
      return h.response({
        message: 'Internal Server Error.',
      }).code(500); // 500 - Internal Server Error
    }
  },


//  async getAcademicAvaialableTime(req: Request, h: ResponseToolkit){
//   const academicCoachList = await UserModel.find({ 'role': 'ACADEMICCOACH' }).exec();

//    for(const availableTime of academicCoachList){
// const shiftTime = await ShiftSchedule.find({'role': 'ACADEMICCOACH', })
//  }
//  }
 async getAcademicAvaialableTime(req: Request, h: ResponseToolkit){
  return getAcademicAvaialableTimeList(req.query.scheduleDate);

 },

   async getTeacherAvaialableTime(req: Request, h: ResponseToolkit){
  return teacherAvailableTimeList(req.query.scheduleDate, req.query.position);

 }
};
