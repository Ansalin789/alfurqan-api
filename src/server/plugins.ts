
import systemLifeCycle from "../life_cycle/index";
import usersAPI from "../api/users/router";
import authAPI from "../api/auth/router"; 
import studentAPI from "../api/student/router"
import shiftScheduleAPI from "../api/shiftSchedule/router"
import errorHandler from "../errors";
import JWTAuth from "../plugins/jwt_auth";
import evaluationAPI from "../api/evaluation/router";
import subscriptionAPI from "../api/subscriptions/router";
import meetingScheduleAPI from "../api/meetingSchedule/router";
import dashboardAPI from "../api/dashboard/router";
import paymentAPI from "../api/payment/router";
import classScheduleAPI from "../api/classShedule/router";
import alstudentsAPI from "../api/alstudents/router"
import assignmentAPI from "../api/assignment/router";
import studentInvoiceAPI from "../api/invoice/router"
export const appPlugins = [
  {
    plugin: systemLifeCycle,
  },
  {
    plugin: errorHandler,
  },
  {
    plugin: JWTAuth,
  },
    {
    plugin: authAPI,
  },
  {
    plugin: usersAPI,
  },
  {
    plugin: studentAPI,
  },
  {
    plugin: evaluationAPI,
  },
  {
    plugin: shiftScheduleAPI,
  },
  {
    plugin: subscriptionAPI,
  },
  {
    plugin: meetingScheduleAPI,
  },
  {
    plugin: dashboardAPI,
  },
  {
    plugin: paymentAPI,
  },
  {
    plugin: classScheduleAPI,
  },
  {
    plugin: alstudentsAPI,
  },
  {
    plugin: assignmentAPI,
  },
  {
    plugin: studentInvoiceAPI,

  }

];
