
import systemLifeCycle from "../life_cycle/index";
import usersAPI from "../api/users/router";
import authAPI from "../api/auth/router"; 
import errorHandler from "../errors";
import JWTAuth from "../plugins/jwt_auth";
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
  }
];
