import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { authMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/signin",
      options: {
        handler: handler.signIn,
        description: authMessages.SIGN_IN,
        tags: ["api", "auth"],
      },
    },
    {
      method: "POST",
      path: "/signout",
      options: {
        handler: handler.signOut,
        description: authMessages.SIGN_OUT,
        tags: ["api", "auth"],
        auth: {
          strategies: ["jwt"],
        },
      },
    },
    {
      method: "PUT",
      path: "/change-password/{userId}",
      options: {
        handler: handler.changePassword,
        description: authMessages.CHANGE_PASSWORD,
        tags: ["api", "auth"],
        auth: {
          strategies: ["jwt"],
        },
      },
    },
  ];
  server.route(routes);
};
export = {
  name: "api-auth",
  register,
};
