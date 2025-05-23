/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseToolkit, Request } from "@hapi/hapi";
import {dashboardCardCount, dashboardWidgetCounts, dashboardWidgetStudentCounts, dashboardWidgetSupervisorCounts, dashboardWidgetTeacherCounts, totalClassCount, totalTrialRequestCount } from "../../operations/dashboard";

export default {
  // Get widget counts for academic coach
  async getWidgetsCount(req: Request, h: ResponseToolkit) {
    try {
      const widgetCounts = await dashboardWidgetCounts(req.query.academicCoachId as string);
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

  async getWidgetSupervisorCount(req: Request, h: ResponseToolkit) {
    try {
      const supervisorCounts = await dashboardWidgetSupervisorCounts(req.headers.supervisor as string);
      return h.response(supervisorCounts).code(200);
    } catch (error) {
      console.error("Error in getWidgetStudentCount:", error);
      return h.response({ error: "Failed to fetch student widget counts." }).code(500);
    }
  },

  async getAdminCount(req: Request, h: ResponseToolkit){
    return await dashboardCardCount();
},

async getTotalTrialRequest(req: Request, h: ResponseToolkit){
  return await totalTrialRequestCount();
},

async getTotalClass(req: Request, h: ResponseToolkit){
  return await totalClassCount(req.query.dateRange as string);
}

  // async getSupervisorApplicationCount (req: Request, h: ResponseToolkit) {
  //   return await dashboardSupervisorApplicationCount(req.headers.supervisor as string);
  // }

  //  getAllEvaluationList(req: Request, h: ResponseToolkit) {
  //     const { query } = getEvaluationListInputValidation.parse({
  //       query: {
  //         ...req.query,
  //         filterValues: req.query?.filterValues ? JSON.parse(req.query.filterValues) : {},
  //       },
  //     });
  //     return getAllEvaluationRecords(query);
  //   },

};

