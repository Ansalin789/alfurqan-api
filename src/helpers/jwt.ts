import { isNil, isEmpty } from "lodash";
import { Request } from "@hapi/hapi";
import { getActiveUserRecord } from "../operations/users";
import { getActiveTenantRecordByCode } from "../operations/tenant";
import { getActiveSessionRecord } from "../operations/active_session";

export const validateUserAuth = async (decoded: string, req: Request) => {
  const { authorization } = req.headers;
  const token = authorization.replace("Bearer ", "");

  if (!isNil(decoded) && !isEmpty(decoded)) {
    const {sub }: any = decoded;

    const user = await getActiveUserRecord({ id: sub});
   // const tenant = await getActiveTenantRecordByCode(tenantId);
    // const activeSession = await getActiveSessionRecord({
    //   accessToken: token,
    //   isActive: true,
    //   userId: sub,
    //   tenantId,
    // });

    if (
      isNil(user) 
        ) {
      return { isValid: false };
    }
    return { isValid: true };
  } else {
    return { isValid: false };
  }
};
