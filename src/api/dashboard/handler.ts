/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import { dashboardWidgetCounts, dashboardWidgetStudentCounts, dashboardWidgetTeacherCounts } from "../../operations/dashboard";

export default {
  // Get widget counts for academic coach
  async getWidgetsCount(req: Request, h: ResponseToolkit) {
    try {
      const widgetCounts = await dashboardWidgetCounts(req.headers.ACADEMICCOACH as string);
      return h.response(widgetCounts).code(200);
    } catch (error) {
      console.error("Error in getWidgetsCount:", error);
      return h.response({ error: "Failed to fetch widget counts." }).code(500);
    }
  },

  // Get widget counts for students
  async getWidgetStudentCount(req: Request, h: ResponseToolkit) {
    try {
      const studentCounts = await dashboardWidgetStudentCounts(req.headers.Student as string);
      return h.response(studentCounts).code(200);
    } catch (error) {
      console.error("Error in getWidgetStudentCount:", error);
      return h.response({ error: "Failed to fetch student widget counts." }).code(500);
    }
  },


  async getWidgetTeacherCount(req: Request, h: ResponseToolkit) {
    try {
      const teacherCounts = await dashboardWidgetTeacherCounts(req.headers.teacher as string);
      return h.response(teacherCounts).code(200);
    } catch (error) {
      console.error("Error in getWidgetStudentCount:", error);
      return h.response({ error: "Failed to fetch student widget counts." }).code(500);
    }
  },




};

