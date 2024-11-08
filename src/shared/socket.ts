import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import AppLogger from "../helpers/logging";

let ioConnection: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HttpServer): void => {
  ioConnection = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      credentials: true
    }
  });

  ioConnection.on("connection", (socket: Socket) => {
    AppLogger.info(`A user connected with Socket ID: ${socket.id}`);

    // Check if the client is connected
    socket.on('connect', () => {
      AppLogger.info(`Socket successfully connected: ${socket.id}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      AppLogger.info(`User with Socket ID: ${socket.id} disconnected`);
    });
  });
};


export const emitEventToClient = (event: string, data: any): void => {
  if (ioConnection) {
    ioConnection.emit(event, data);
    AppLogger.info(`${event}: IO Data Emitted- ${JSON.stringify(data)}`);
  } else {
    AppLogger.info(`Socket.IO is not initialized`);
  }
};
