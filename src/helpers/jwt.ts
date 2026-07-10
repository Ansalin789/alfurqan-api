import { isNil, isEmpty } from "lodash";
import { Request } from "@hapi/hapi";
import { getActiveUserRecord } from "../operations/users";
import { getActiveSessionRecord } from "../operations/active_session";

export const validateUserAuth = async (decoded: string, req: Request) => {
  const { authorization } = req.headers;
  const token = authorization ? authorization.replace("Bearer ", "") : "";

  if (!isNil(decoded) && !isEmpty(decoded)) {
    const { sub }: any = decoded;

    const user = await getActiveUserRecord({ id: sub });
    const activeSession = await getActiveSessionRecord({
      accessToken: token,
      isActive: true,
      userId: sub,
    });

    if (isNil(user) || isNil(activeSession)) {
      return { isValid: false };
    }

    return { isValid: true };
  }

  return { isValid: false };
};
