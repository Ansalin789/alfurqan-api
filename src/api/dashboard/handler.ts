import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  dashboardWidgetCounts,

  dashboardWidgetStudentCounts,
  dashboardWidgetSupervisorCounts,
  dashboardCardCount,
  totalTrialRequestCount,
  totalClassCount,
  acUpcomingClassList,

} from "../../operations/dashboard";
import { dashboardWidgetTeacherCounts } from "../../operations/dashboard";

const dashboardHandler = {
  async getWidgetsCount(req: Request, h: ResponseToolkit) {
    const academicCoachId = req.params.academicCoachId;
    const result = await dashboardWidgetCounts(academicCoachId);
    return h.response(result);
  },

  async getWidgetTeacherCount(req: Request, h: ResponseToolkit) {
    const teacherId = req.params.teacherId;
    const result = await dashboardWidgetTeacherCounts(teacherId);
    return h.response(result);
  },

  async getWidgetStudentCount(req: Request, h: ResponseToolkit) {
    const studentId = req.params.studentId;
    const result = await dashboardWidgetStudentCounts(studentId);
    return h.response(result);
  },

  async getWidgetSupervisorCount(req: Request, h: ResponseToolkit) {
    const supervisorId = req.params.supervisorId;
    const result = await dashboardWidgetSupervisorCounts(supervisorId);
    return h.response(result);
  },

  async getDashboardCardCount(req: Request, h: ResponseToolkit) {
    const result = await dashboardCardCount();
    return h.response(result);
  },

  async getTrialRequestCount(req: Request, h: ResponseToolkit) {
    const result = await totalTrialRequestCount();
    return h.response(result);
  },

  async getClassCount(req: Request, h: ResponseToolkit) {
    const dateRange = req.params.dateRange;
    const result = await totalClassCount(dateRange);
    return h.response(result);
  },

  async getAcUpcomingClass(req: Request, h: ResponseToolkit) {
    const academicCoachId = req.params.academicCoachId;
    const result = await acUpcomingClassList(academicCoachId);
    return h.response(result);
  },
};

export default dashboardHandler;
