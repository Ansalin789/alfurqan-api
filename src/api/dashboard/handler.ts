/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import {dashboardWidgetCounts} from "../../operations/dashboard";


export default {
  async getWidgetsCount(req: Request, h: ResponseToolkit) {
    return dashboardWidgetCounts(req.headers.ACADEMICCOACH as string);
    
  }
};
