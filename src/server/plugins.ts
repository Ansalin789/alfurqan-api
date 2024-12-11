
import systemLifeCycle from "../life_cycle/index";
import usersAPI from "../api/users/router";
import authAPI from "../api/auth/router"; 
import studentAPI from "../api/student/router"
import shiftScheduleAPI from "../api/shiftSchedule/router"
import errorHandler from "../errors";
import JWTAuth from "../plugins/jwt_auth";
import evaluationAPI from "../api/evaluation/router";
import subscriptionAPI from "../api/subscriptions/router";
<<<<<<< HEAD
import meetingScheduleAPI from "../api/meetingSchedule/router";
=======
import dashboardAPI from "../api/dashboard/router";
>>>>>>> 5da6df2f87435b510db434be7cb8258fc8cd6957
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
<<<<<<< HEAD
 
{
  plugin: meetingScheduleAPI
}
=======
  {
    plugin: dashboardAPI,
  },
>>>>>>> 5da6df2f87435b510db434be7cb8258fc8cd6957

];
