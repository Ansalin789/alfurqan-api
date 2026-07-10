import type { ServerOptions } from "@hapi/hapi";
import config from "../config/env";

export const serverSettings: ServerOptions = {
  router: {
    stripTrailingSlash: true,
  },
  routes: {
    cors: {
      origin: ["*"],
      headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
      exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
      additionalExposedHeaders: ["Accept"],
      maxAge: 60,
      credentials: true,
    },
  },
  host: config.server.host,
  port: config.server.port,
};
