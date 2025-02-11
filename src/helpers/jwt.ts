import { isNil, isEmpty } from "lodash";
import { Request } from "@hapi/hapi";
import { getActiveUserRecord } from "../operations/users";
// import { getActiveTenantRecordByCode } from "../operations/tenant";
import { getActiveSessionRecord } from "../operations/active_session";
import { getActiveStudentRecord } from "../operations/alstudents";

export const validateUserAuth = async (decoded: string, req: Request) => {
  const { authorization } = req.headers;
  const token = authorization.replace("Bearer ", "");
  console.log("google user", authorization);

  if (!isNil(decoded) && !isEmpty(decoded)) {
    const {sub }: any = decoded;

  const loguser = await getActiveUserRecord({ id: sub});

   const users = await getActiveStudentRecord({ id: sub });
   console.log("google user", users);
    // console.log("user>>", user);
    // console.log("users>>", users);

    const user = users??loguser;
   // const tenant = await getActiveTenantRecordByCode(tenantId);
    // const activeSession = await getActiveSessionRecord({
    //   accessToken: token,
    //   isActive: true,
    //   userId: sub,
    //   tenantId,
    // });

    if (isNil(user))  {
      return { isValid: false };
    }
      return { isValid: true };
  
   
  } else {
    return { isValid: false };
  }
};
