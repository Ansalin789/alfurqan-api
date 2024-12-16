import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";
import { dashboardMessages } from "../../config/messages";

const register = async (server: Server): Promise<void> => {
  // Register all routes for this unit
  const routes: ServerRoute[] = [
    {
      method: "GET",
      path: "/dashboard/widgets",
      options: {
        handler: handler.getWidgetsCount,
        description: dashboardMessages.WIDGET_COUNT,
        tags: ["api", "dashboard"],
        // auth: {
        //   strategies: ["jwt"],
        // },
      },
    },
  ];
  server.route(routes);
};
export = {
  name: "api-dashboard",
  register,
};
