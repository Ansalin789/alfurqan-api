import { initializeMongoDatabase } from "./shared/mongo";
// import { initializeSentry } from "./shared/sentry";
import Hapi, { Server } from "@hapi/hapi";
import AppLogger from "./helpers/logging";
import config from "./config/env";
import { appPlugins } from "./server/plugins";
import { serverSettings } from "./config/config";
import { initializeSocket } from "./shared/socket";


const start = async () => {
  // Create the server with server settings
  const server: Server = Hapi.server(serverSettings);

  // Register plugins
  await server.register(appPlugins);

  // MongoDB Connection Establishment
  await initializeMongoDatabase();

  // RedisDB Connection Establish

  // Sentry Connection Establish
  //initializeSentry();

  // Initialize Socket.IO service
  initializeSocket(server.listener);

  // Initialize and Start the Application
  await server.initialize();
  await server.start();

  AppLogger.info(
    `Application is running on ${config.server.host}:${config.server.port}`
  );
};

// Server Start error handling
process.on("unhandledRejection", (err) => {
  AppLogger.error("unhandledRejection", err);
  process.exit(1);
});

start();
